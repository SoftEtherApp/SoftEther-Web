/* ════════════════════════════════════
   Email templates — zero dependencies, text + HTML pairs.
   HTML uses inline styles only (email clients ignore <style>);
   dark surface matches the site brand. All user-supplied values
   are escaped before interpolation.
   ════════════════════════════════════ */

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

/* ── shared HTML shell ── */

function shell(title: string, bodyHtml: string): string {
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
      <span style="font-size:13px;font-weight:700;letter-spacing:.06em;color:#8b93c8;">SOFTETHER APP</span>
    </td></tr>
    <tr><td style="font-size:17px;font-weight:700;line-height:1.4;padding-bottom:12px;">${escHtml(title)}</td></tr>
    <tr><td style="font-size:14px;line-height:1.7;color:#b7bcd4;">${bodyHtml}</td></tr>
    <tr><td style="padding-top:24px;font-size:12px;line-height:1.6;color:#6b7094;border-top:1px solid #2a2f47;margin-top:24px;">
      You received this email because of activity on your SoftEther App account.<br />
      If this wasn't you, please ignore it or contact support.
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function button(url: string, label: string): string {
	const href = escHtml(url);
	return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="border-radius:24px;background:#5865f2;">
<a href="${href}" style="display:inline-block;padding:12px 26px;border-radius:24px;background:#5865f2;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">${escHtml(label)}</a>
</td></tr></table>`;
}

/* ── templates ── */

export function verificationEmail(name: string, verifyUrl: string): RenderedEmail {
	const subject = "Verify your email address";
	const text = [
		`Hi ${escText(name)},`,
		"",
		"Welcome to SoftEther App — please confirm your email address to activate your account:",
		verifyUrl,
		"",
		"This link expires in 1 hour and works once.",
		"",
		"If you didn't create an account, you can safely ignore this email.",
	].join("\n");
	const html = shell(
		"Verify your email address",
		`<p style="margin:0 0 4px;">Hi ${escHtml(name)},</p>
<p style="margin:0 0 4px;">Welcome to <strong>SoftEther App</strong> — confirm your email to activate your account.</p>
${button(verifyUrl, "Verify email")}
<p style="margin:0;font-size:12px;color:#8b93c8;">This link expires in 1 hour and works once. If you didn't create an account, ignore this email.</p>`,
	);
	return { subject, text, html };
}

export function resetPasswordEmail(name: string, resetUrl: string): RenderedEmail {
	const subject = "Reset your password";
	const text = [
		`Hi ${escText(name)},`,
		"",
		"A password reset was requested for your account. Reset it here:",
		resetUrl,
		"",
		"This link expires in 1 hour and works once.",
		"",
		"If you didn't request this, no action is needed — your password is unchanged.",
	].join("\n");
	const html = shell(
		"Reset your password",
		`<p style="margin:0 0 4px;">Hi ${escHtml(name)},</p>
<p style="margin:0 0 4px;">A password reset was requested for your account.</p>
${button(resetUrl, "Reset password")}
<p style="margin:0;font-size:12px;color:#8b93c8;">This link expires in 1 hour and works once. If you didn't request this, ignore it — your password is unchanged.</p>`,
	);
	return { subject, text, html };
}

export function welcomeEmail(name: string): RenderedEmail {
	const subject = "Welcome to SoftEther App";
	const text = [
		`Hi ${escText(name)},`,
		"",
		"Your account is now active. Download the SoftEther App client to get started:",
		"https://softether.app/download",
		"",
		"Bring your own server — no vendor lock-in, no subscription.",
	].join("\n");
	const html = shell(
		"Welcome to SoftEther App",
		`<p style="margin:0 0 4px;">Hi ${escHtml(name)},</p>
<p style="margin:0 0 4px;">Your account is now active. Download the client to get started.</p>
${button("https://softether.app/download", "Download client")}
<p style="margin:0;font-size:12px;color:#8b93c8;">Bring your own server — no vendor lock-in, no subscription.</p>`,
	);
	return { subject, text, html };
}

export function securityAlertEmail(name: string, detail: string): RenderedEmail {
	const subject = "New activity on your account";
	const text = [
		`Hi ${escText(name)},`,
		"",
		`We noticed the following activity on your account: ${escText(detail)}`,
		"",
		"If this was you, no action is needed.",
		"",
		"If this wasn't you, please change your password immediately.",
	].join("\n");
	const html = shell(
		"New activity on your account",
		`<p style="margin:0 0 4px;">Hi ${escHtml(name)},</p>
<p style="margin:0 0 4px;">We noticed: <strong>${escHtml(detail)}</strong></p>
<p style="margin:0 0 4px;">If this was you, no action is needed.</p>
<p style="margin:0;">If this wasn't you, change your password immediately.</p>`,
	);
	return { subject, text, html };
}

export function releaseNotifyEmail(name: string, version: string, tag: string, excerpt: string, downloadUrl: string): RenderedEmail {
	const subject = `SoftEther App ${version} is available`;
	const text = [
		`Hi ${escText(name)},`,
		"",
		`SoftEther App ${escText(version)} (${escText(tag)}) has been released.`,
		"",
		escText(excerpt.slice(0, 400)),
		"",
		`Download: ${downloadUrl}`,
	].join("\n");
	const html = shell(
		`SoftEther App ${escHtml(version)} is available`,
		`<p style="margin:0 0 4px;">Hi ${escHtml(name)},</p>
<p style="margin:0 0 4px;"><strong>SoftEther App ${escHtml(version)}</strong> (${escHtml(tag)}) has been released.</p>
<p style="margin:0 0 4px;color:#b7bcd4;">${escHtml(excerpt.slice(0, 400))}</p>
${button(downloadUrl, "Download")}`,
	);
	return { subject, text, html };
}