/* ════════════════════════════════════
   SMTP client — raw protocol state machine over a connect() that
   returns a web-stream Socket (cloudflare:sockets in production,
   injected in tests). No third-party email API.

   TLS: implicit (port 465), STARTTLS (port 587), or none (plain
   internal relays). AUTH PLAIN with AUTH LOGIN fallback. CRLF-injection
   guards on every field, RFC 2047 base64 subjects, dot-stuffing in DATA.
   ════════════════════════════════════ */

/** connect(): address, options → web-stream Socket (cloudflare:sockets shape). */
export type ConnectFn = (address: string, options: SocketOptions) => Socket;

export type TlsMode = "implicit" | "starttls" | "none";

export interface SmtpConfig {
	host: string;
	port: number;
	/** Optional AUTH credentials — relays without auth (local relays) skip AUTH. */
	user?: string;
	pass?: string;
	/** Envelope sender, e.g. "SoftEther App <no-reply@softether.app>". */
	from: string;
	/** TLS strategy: implicit (465), starttls (587/25), none (plain relay). */
	tls?: TlsMode;
	/** Per-exchange timeout. */
	timeoutMs?: number;
}

export interface SmtpEnvelope {
	to: string;
	subject: string;
	text: string;
	html?: string;
}

export class SmtpError extends Error {
	readonly code: number;
	readonly stage: string;

	constructor(code: number, stage: string, message: string) {
		super(message);
		this.name = "SmtpError";
		this.code = code;
		this.stage = stage;
	}
}

const CRLF = "\r\n";
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_MESSAGE_BYTES = 512 * 1024;

/* ── field sanitization ── */

/** Strip CR/LF (SMTP command injection) from any user-controlled field. */
function sanitizeField(value: string): string {
	return value.replace(/[\r\n]+/g, " ").trim();
}

function base64EncodeUtf8(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let bin = "";
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return btoa(bin);
}

/** RFC 2047 encode the subject when it contains non-ASCII. */
function encodeSubject(subject: string): string {
	const clean = sanitizeField(subject);
	if ([...clean].every((ch) => ch.charCodeAt(0) <= 0x7f)) return clean;
	return `=?UTF-8?B?${base64EncodeUtf8(clean)}?=`;
}

/** Extract the bare address from "Name <addr>" or "<addr>" or "addr". */
function addressOf(value: string): string {
	const m = sanitizeField(value).match(/<([^<>]+)>/);
	return (m ? m[1] : sanitizeField(value)).toLowerCase();
}

function domainOf(from: string): string {
	return addressOf(from).split("@")[1] ?? "softether.app";
}

/** SMTP dots only survive dot-stuffing: a leading "." gets doubled. */
function dotStuff(text: string): string {
	return text.split("\n").map((l) => (l.startsWith(".") ? "." + l : l)).join("\n");
}

/* ── line reader ── */

class LineReader {
	private readonly reader: ReadableStreamDefaultReader<Uint8Array>;
	private buffer = "";
	private done = false;

	constructor(stream: ReadableStream) {
		this.reader = stream.getReader();
	}

	async nextLine(): Promise<string | null> {
		while (true) {
			const nl = this.buffer.indexOf("\n");
			if (nl !== -1) {
				const line = this.buffer.slice(0, nl).replace(/\r$/, "");
				this.buffer = this.buffer.slice(nl + 1);
				return line;
			}
			if (this.done) {
				if (this.buffer.length === 0) return null;
				const line = this.buffer;
				this.buffer = "";
				return line;
			}
			const { value, done } = await this.reader.read();
			if (done) {
				this.done = true;
				continue;
			}
			this.buffer += new TextDecoder().decode(value);
		}
	}
}

/* ── SMTP client ── */

export interface SmtpDeps {
	/** connect(): address, options → web-stream Socket (cloudflare:sockets in prod). */
	connect: ConnectFn;
}

export class SmtpClient {
	private readonly config: SmtpConfig;
	private readonly deps: SmtpDeps;
	private socket!: ReturnType<ConnectFn>;
	private writer!: WritableStreamDefaultWriter<Uint8Array>;
	private reader!: LineReader;

	constructor(config: SmtpConfig, deps: SmtpDeps) {
		this.config = { timeoutMs: DEFAULT_TIMEOUT_MS, tls: "starttls", ...config };
		this.deps = deps;
	}

	private async withTimeout<T>(promise: Promise<T>, stage: string): Promise<T> {
		const timeout = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new SmtpError(0, stage, `timeout after ${this.config.timeoutMs}ms`)), this.config.timeoutMs);
		});
		return Promise.race([promise, timeout]);
	}

	private async sendLine(line: string, stage: string): Promise<void> {
		if (new TextEncoder().encode(line).length > 2048) {
			throw new SmtpError(0, stage, "line too long");
		}
		await this.withTimeout(this.writer.write(new TextEncoder().encode(line + CRLF)), stage);
	}

	/** DATA body write — RFC 5321's 998-octet line limit applies to commands,
	 *  not message content; only the pre-wire MAX_MESSAGE_BYTES caps this. */
	private async sendBody(message: string, stage: string): Promise<void> {
		await this.withTimeout(this.writer.write(new TextEncoder().encode(message + CRLF)), stage);
	}

	/** Read one reply: "250-first" lines fold into the reply until "250 done". */
	private async readReply(stage: string): Promise<{ code: number; lines: string[] }> {
		const lines: string[] = [];
		while (true) {
			const line = await this.withTimeout(
				(async () => {
					try {
						const l = await this.reader.nextLine();
						if (l === null) throw new SmtpError(0, stage, "connection closed unexpectedly");
						return l;
					} catch (err) {
						if (err instanceof SmtpError) throw err;
						throw new SmtpError(0, stage, `read failed: ${(err as Error)?.message ?? "unknown error"}`);
					}
				})(),
				stage,
			);
			lines.push(line);
			const code = Number.parseInt(line.slice(0, 3), 10);
			if (Number.isNaN(code) || line[3] !== "-") return { code, lines };
		}
	}

	private async expect(stage: string, wanted: number[], what: string): Promise<void> {
		const { code, lines } = await this.readReply(stage);
		if (!wanted.includes(code)) {
			throw new SmtpError(code, stage, `${what}: ${lines.join(" | ")}`);
		}
	}

	async send(envelope: SmtpEnvelope): Promise<void> {
		const { host, port, tls = "starttls", user, pass, from } = this.config;

		const to = addressOf(envelope.to);
		if (!/^[^\s@<>]+@[^\s@<>]+$/.test(to)) {
			throw new SmtpError(0, "validate", `invalid recipient: ${sanitizeField(envelope.to)}`);
		}
		if (!addressOf(from).includes("@")) throw new SmtpError(0, "validate", "invalid envelope sender");

		// Body size cap (relay-friendly) before any bytes go on the wire.
		const message = this.buildMessage(envelope);
		if (message.length > MAX_MESSAGE_BYTES) {
			throw new SmtpError(0, "validate", `message too large (${message.length} bytes)`);
		}

		// Connect — implicit TLS when requested, plain otherwise (STARTTLS next).
		this.socket = this.deps.connect(`${host}:${port}`, {
			secureTransport: tls === "implicit" ? "on" : "off",
			allowHalfOpen: false,
		});
		try {
			await this.withTimeout(this.socket.opened, "connect");
		} catch (err) {
			if (err instanceof SmtpError) throw err;
			throw new SmtpError(0, "connect", `connection failed: ${(err as Error)?.message ?? "unknown error"}`);
		}
		this.writer = this.socket.writable.getWriter();
		this.reader = new LineReader(this.socket.readable);

		try {
			await this.expect("greeting", [220], "greeting");
			if (tls === "starttls") {
				// Upgrade to TLS mid-session (STARTTLS).
				await this.sendLine("STARTTLS", "starttls");
				await this.expect("starttls", [220], "STARTTLS");
				this.socket = this.socket.startTls({ expectedServerHostname: host });
				try {
					await this.withTimeout(this.socket.opened, "starttls");
				} catch (err) {
					if (err instanceof SmtpError) throw err;
					throw new SmtpError(0, "starttls", `TLS upgrade failed: ${(err as Error)?.message ?? "unknown error"}`);
				}
				this.writer = this.socket.writable.getWriter();
				this.reader = new LineReader(this.socket.readable);
			}

			await this.sendLine(`EHLO ${host}`, "ehlo");
			await this.expect("ehlo", [250], "EHLO");

			if (user) {
				const plain = base64EncodeUtf8(`\u0000${user}\u0000${pass ?? ""}`);
				await this.sendLine(`AUTH PLAIN ${plain}`, "auth");
				const { code, lines } = await this.readReply("auth");
				if (code === 235) {
					/* authenticated */
				} else if (code === 504 || code === 534 || code === 535) {
					// PLAIN unsupported — fall back to AUTH LOGIN (two-step challenge).
					await this.sendLine("AUTH LOGIN", "auth");
					const step1 = await this.readReply("auth");
					if (step1.code !== 334) throw new SmtpError(step1.code, "auth", `AUTH LOGIN: ${step1.lines.join(" | ")}`);
					await this.sendLine(base64EncodeUtf8(user), "auth");
					const step2 = await this.readReply("auth");
					if (step2.code !== 334) throw new SmtpError(step2.code, "auth", `AUTH LOGIN user: ${step2.lines.join(" | ")}`);
					await this.sendLine(base64EncodeUtf8(pass ?? ""), "auth");
					const step3 = await this.readReply("auth");
					if (step3.code !== 235) throw new SmtpError(step3.code, "auth", `AUTH LOGIN pass: ${step3.lines.join(" | ")}`);
				} else {
					throw new SmtpError(code, "auth", `AUTH PLAIN: ${lines.join(" | ")}`);
				}
			}

			await this.sendLine(`MAIL FROM:<${addressOf(from)}>`, "mail-from");
			await this.expect("mail-from", [250], "MAIL FROM");
			await this.sendLine(`RCPT TO:<${to}>`, "rcpt-to");
			await this.expect("rcpt-to", [250, 251], "RCPT TO");

			await this.sendLine("DATA", "data");
			await this.expect("data", [354], "DATA");
			await this.sendBody(dotStuff(message), "data-body");
			await this.sendLine(".", "data-end");
			await this.expect("data-end", [250], "message accepted");

			await this.sendLine("QUIT", "quit");
			await this.readReply("quit"); // 221 best-effort
		} finally {
			try {
				await this.socket.close();
			} catch {
				/* already closed */
			}
		}
	}

	private buildMessage(envelope: SmtpEnvelope): string {
		const { from } = this.config;
		const to = addressOf(envelope.to);
		const boundary = `se-${crypto.randomUUID()}`;
		const messageId = `<${crypto.randomUUID()}@${domainOf(from)}>`;

		const text = envelope.text.replace(/\r?\n/g, "\r\n") + (envelope.text.endsWith("\r\n") ? "" : CRLF);
		const html = envelope.html
			? envelope.html.replace(/\r?\n/g, "\r\n") + (envelope.html.endsWith("\r\n") ? "" : CRLF)
			: "";

		const headers = [
			`From: ${sanitizeField(from)}`,
			`To: ${sanitizeField(to)}`,
			`Subject: ${encodeSubject(envelope.subject)}`,
			`Date: ${new Date().toUTCString()}`,
			`Message-ID: ${messageId}`,
			`MIME-Version: 1.0`,
			`Content-Type: multipart/alternative; boundary="${boundary}"`,
			`Content-Transfer-Encoding: 8bit`,
		].join(CRLF);

		const plainPart = [
			`--${boundary}`,
			`Content-Type: text/plain; charset=utf-8`,
			`Content-Transfer-Encoding: 8bit`,
			"",
			text,
		].join(CRLF);

		const htmlPart = html
			? [
					`--${boundary}`,
					`Content-Type: text/html; charset=utf-8`,
					`Content-Transfer-Encoding: 8bit`,
					"",
					html,
				].join(CRLF)
			: "";

		return [headers, "", plainPart, htmlPart, `--${boundary}--`, ""].filter(Boolean).join(CRLF);
	}
}