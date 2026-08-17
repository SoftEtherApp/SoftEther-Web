/* ════════════════════════════════════
   Email sender — orchestrates SMTP delivery and audits every send
   into activity_log (non-fatal on audit failure).

   Dev mode: when SMTP_HOST or EMAIL_FROM is unset, the email is
   logged to the console instead of sent (same pattern as
   WEBHOOK_SECRET) — never fails in local/dev environments.
   ════════════════════════════════════ */

import { getDb } from "../db/client";
import { activityLog } from "../db/schema";
import { SmtpClient, SmtpError, type ConnectFn, type SmtpEnvelope } from "./client";

export interface SendResult {
	ok: boolean;
	/** True when SMTP config is missing and the email was only logged. */
	dev?: boolean;
	code?: number;
	stage?: string;
	error?: string;
}

export interface EmailEnv {
	SMTP_HOST?: string;
	SMTP_PORT?: string;
	SMTP_USER?: string;
	SMTP_PASS?: string;
	EMAIL_FROM?: string;
	DB: D1Database;
}

async function audit(env: EmailEnv, action: string, detail: string): Promise<void> {
	try {
		const db = getDb(env.DB);
		await db.insert(activityLog).values({ actor: "system", action, detail });
	} catch (err) {
		console.error("Email audit write failed (non-fatal):", err);
	}
}

/** Lazy worker-only import: keeps sender.ts loadable in Node tests. */
async function getConnect(): Promise<ConnectFn> {
	const { workerConnect } = await import("./sockets");
	return workerConnect;
}

export async function sendEmail(env: EmailEnv, envelope: SmtpEnvelope): Promise<SendResult> {
	const host = env.SMTP_HOST;
	const from = env.EMAIL_FROM;

	if (!host || !from) {
		console.log(`[email:dev] would send to="${envelope.to}" subject="${envelope.subject}"`);
		return { ok: true, dev: true };
	}

	const port = Number.parseInt(env.SMTP_PORT ?? "", 10);
	const client = new SmtpClient(
		{
			host,
			port: Number.isInteger(port) && port > 0 ? port : 587,
			user: env.SMTP_USER,
			pass: env.SMTP_PASS,
			from,
			tls: port === 465 ? "implicit" : port === 25 ? "none" : "starttls",
		},
		{ connect: await getConnect() },
	);

	try {
		await client.send(envelope);
		await audit(env, "email.sent", `to=${envelope.to} subject="${envelope.subject}"`);
		return { ok: true };
	} catch (err) {
		const code = err instanceof SmtpError ? err.code : undefined;
		const stage = err instanceof SmtpError ? err.stage : undefined;
		const message = err instanceof Error ? err.message : String(err);
		console.error(`Email send failed (${stage ?? "unknown"}):`, message);
		await audit(env, "email.failed", `to=${envelope.to} subject="${envelope.subject}" error=${message}`);
		return { ok: false, code, stage, error: message };
	}
}