/* ════════════════════════════════════
   Email templates — composable blocks with brand defaults.

   A template is a list of EmailBlocks rendered to text + HTML by
   renderEmail(). Block text supports {token} placeholders resolved
   from TemplateDefaults: {name} {brand} {tagline} {productUrl}
   {downloadUrl} {supportEmail}. Every user-supplied value is escaped
   per-mode (HTML entities vs CR/LF stripping) during resolution.

   renderEmail(subject, blocks, options?) — the optional third arg
   overrides any subset of the defaults, so the whole module can be
   re-skinned for another product without forking.

   Zero dependencies; inline styles only (email clients ignore
   <style>); dark surface matches the site brand.
   ════════════════════════════════════ */

export interface TemplateDefaults {
	/** Product/brand name, e.g. "SoftEther App". */
	brand: string;
	/** One-line pitch, used by templates via {tagline}. */
	tagline: string;
	productUrl: string;
	downloadUrl: string;
	supportEmail: string;
	/** Greeting template; {name} is replaced with the recipient name. */
	greeting: string;
	/** Footer text; supports {brand} and {supportEmail}. */
	footer: string;
	/** Primary button color. */
	primaryColor: string;
	/** Prepended to every subject ("[SoftEther App] Verify your email..."). */
	subjectPrefix: string;
}

export const TEMPLATE_DEFAULTS: TemplateDefaults = {
	brand: "SoftEther App",
	tagline: "Bring your own server — no vendor lock-in, no subscription.",
	productUrl: "https://softether.app",
	downloadUrl: "https://softether.app/download",
	supportEmail: "support@softether.app",
	greeting: "Hi {name},",
	footer: "You received this email because of activity on your {brand} account. If this wasn't you, please ignore it or contact {supportEmail}.",
	primaryColor: "#5865f2",
	subjectPrefix: "",
};

/** A run of text inside a paragraph; strong renders bold in HTML. */
export interface TextSeg {
	text: string;
	strong?: boolean;
}

export type EmailBlock =
	| { kind: "greeting"; name: string }
	| { kind: "paragraph"; segs: TextSeg[]; muted?: boolean }
	| { kind: "button"; url: string; label: string }
	| { kind: "link"; url: string; label?: string }
	| { kind: "note"; text: string }
	| { kind: "spacer" };

export interface RenderedEmail {
	subject: string;
	text: string;
	html: string;
}

/* ── escaping ── */

function escHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function escText(value: string): string {
	return value.replace(/[\r\n]/g, " ");
}

/* ── token resolution ── */

function tokenContext(name: string, d: TemplateDefaults): Record<string, string> {
	return {
		name,
		brand: d.brand,
		tagline: d.tagline,
		productUrl: d.productUrl,
		downloadUrl: d.downloadUrl,
		supportEmail: d.supportEmail,
	};
}

/** Replaces {token} placeholders with their raw resolved values. Callers
 *  escape the whole result once per-mode (html: escHtml, text: escText). */
function resolve(value: string, ctx: Record<string, string>): string {
	return value.replace(/\{(\w+)\}/g, (m, key: string) => (key in ctx ? ctx[key] : m));
}

/* ── renderer ── */

export function renderEmail(
	subject: string,
	blocks: EmailBlock[],
	options: Partial<TemplateDefaults> = {},
): RenderedEmail {
	const d: TemplateDefaults = { ...TEMPLATE_DEFAULTS, ...options };
	const name = blocks.find((b) => b.kind === "greeting")?.name ?? "";
	const ctx = tokenContext(name, d);

	const textParts: string[] = [];
	const htmlParts: string[] = [];

	for (const block of blocks) {
		switch (block.kind) {
			case "greeting": {
				const line = escText(resolve(d.greeting, ctx));
				textParts.push(line);
				htmlParts.push(`<p style="margin:0 0 4px;">${escHtml(resolve(d.greeting, ctx))}</p>`);
				break;
			}
			case "paragraph": {
				textParts.push(block.segs.map((s) => escText(resolve(s.text, ctx))).join(""));
				const segs = block.segs
					.map((s) => {
						const t = escHtml(resolve(s.text, ctx));
						return s.strong ? `<strong>${t}</strong>` : t;
					})
					.join("");
				const color = block.muted ? "color:#8b93c8;" : "";
				htmlParts.push(`<p style="margin:0 0 4px;${color}">${segs}</p>`);
				break;
			}
			case "button": {
				const href = escHtml(resolve(block.url, ctx));
				const label = escHtml(resolve(block.label, ctx));
				textParts.push(escText(`${resolve(block.label, ctx)}: ${resolve(block.url, ctx)}`));
				htmlParts.push(
					`<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="border-radius:24px;background:${d.primaryColor};">
<a href="${href}" style="display:inline-block;padding:12px 26px;border-radius:24px;background:${d.primaryColor};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">${label}</a>
</td></tr></table>`,
				);
				break;
			}
			case "link": {
				const url = resolve(block.url, ctx);
				const label = escHtml(block.label ? resolve(block.label, ctx) : url);
				textParts.push(escText(block.label ? `${block.label}: ${url}` : url));
				htmlParts.push(
					`<p style="margin:0 0 4px;"><a href="${escHtml(url)}" style="color:#8b93c8;word-break:break-all;">${label}</a></p>`,
				);
				break;
			}
			case "note": {
				textParts.push(escText(resolve(block.text, ctx)));
				htmlParts.push(
					`<p style="margin:0;font-size:12px;color:#8b93c8;">${escHtml(resolve(block.text, ctx))}</p>`,
				);
				break;
			}
			case "spacer": {
				textParts.push("");
				htmlParts.push(`<p style="margin:0;">&nbsp;</p>`);
				break;
			}
		}
	}

	const footerText = escText(resolve(d.footer, ctx));
	const subjectLine = d.subjectPrefix ? `${d.subjectPrefix} ${subject}` : subject;

	return {
		subject: subjectLine,
		text: [...textParts, "", footerText].join("\n\n"),
		html: shell(subjectLine, htmlParts.join(""), d),
	};
}

/* ── shared HTML shell ── */

function shell(title: string, bodyHtml: string, d: TemplateDefaults): string {
	const brandLabel = escHtml(d.brand.toUpperCase());
	const footerHtml = escHtml(resolve(d.footer, tokenContext("", d)));
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#0d0f1a;color:#e8eaf2;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;background:#151827;border:1px solid #2a2f47;border-radius:12px;padding:32px;">
    <tr><td style="padding-bottom:16px;">
      <span style="font-size:13px;font-weight:700;letter-spacing:.06em;color:#8b93c8;">${brandLabel}</span>
    </td></tr>
    <tr><td style="font-size:17px;font-weight:700;line-height:1.4;padding-bottom:12px;">${escHtml(title)}</td></tr>
    <tr><td style="font-size:14px;line-height:1.7;color:#b7bcd4;">${bodyHtml}</td></tr>
    <tr><td style="padding-top:24px;font-size:12px;line-height:1.6;color:#6b7094;border-top:1px solid #2a2f47;margin-top:24px;">
      ${footerHtml}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

/* ── templates ── */

export function verificationEmail(name: string, verifyUrl: string, options?: Partial<TemplateDefaults>): RenderedEmail {
	return renderEmail(
		"Verify your email address",
		[
			{ kind: "greeting", name },
			{
				kind: "paragraph",
				segs: [
					{ text: "Welcome to " },
					{ text: "{brand}", strong: true },
					{ text: " — confirm your email to activate your account." },
				],
			},
			{ kind: "button", url: verifyUrl, label: "Verify email" },
			{ kind: "note", text: "This link expires in 1 hour and works once." },
			{ kind: "paragraph", segs: [{ text: "If you didn't create an account, you can safely ignore this email." }] },
		],
		options,
	);
}

export function resetPasswordEmail(name: string, resetUrl: string, options?: Partial<TemplateDefaults>): RenderedEmail {
	return renderEmail(
		"Reset your password",
		[
			{ kind: "greeting", name },
			{ kind: "paragraph", segs: [{ text: "A password reset was requested for your account." }] },
			{ kind: "button", url: resetUrl, label: "Reset password" },
			{ kind: "note", text: "This link expires in 1 hour and works once." },
			{ kind: "paragraph", segs: [{ text: "If you didn't request this, no action is needed — your password is unchanged." }] },
		],
		options,
	);
}

export function welcomeEmail(name: string, options?: Partial<TemplateDefaults>): RenderedEmail {
	return renderEmail(
		"Welcome to SoftEther App",
		[
			{ kind: "greeting", name },
			{ kind: "paragraph", segs: [{ text: "Your account is now active. Download the client to get started." }] },
			{ kind: "button", url: "{downloadUrl}", label: "Download client" },
			{ kind: "note", text: "{tagline}" },
		],
		options,
	);
}

export function securityAlertEmail(name: string, detail: string, options?: Partial<TemplateDefaults>): RenderedEmail {
	return renderEmail(
		"New activity on your account",
		[
			{ kind: "greeting", name },
			{ kind: "paragraph", segs: [{ text: "We noticed the following activity on your account: " }, { text: detail, strong: true }] },
			{ kind: "paragraph", segs: [{ text: "If this was you, no action is needed." }] },
			{ kind: "paragraph", segs: [{ text: "If this wasn't you, change your password immediately." }] },
		],
		options,
	);
}

export function releaseNotifyEmail(
	name: string,
	version: string,
	tag: string,
	excerpt: string,
	downloadUrl: string,
	options?: Partial<TemplateDefaults>,
): RenderedEmail {
	return renderEmail(
		`${version} is available`,
		[
			{ kind: "greeting", name },
			{
				kind: "paragraph",
				segs: [
					{ text: "{brand} " },
					{ text: version, strong: true },
					{ text: ` (${tag}) has been released.` },
				],
			},
			{ kind: "paragraph", segs: [{ text: excerpt.slice(0, 400) }], muted: true },
			{ kind: "button", url: downloadUrl, label: "Download" },
		],
		options,
	);
}