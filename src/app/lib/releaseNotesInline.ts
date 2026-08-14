/* Pure tokenizer for release-notes bodies — no React dependency, unit-testable.
   Splits a line into inline tokens: text, bold (**x**), code (`x`), links
   ([t](url)). Callers must render tokens as React/escaped text (never
   innerHTML). */

export type InlineToken =
	| { type: "text"; text: string }
	| { type: "bold"; text: string }
	| { type: "code"; text: string }
	| { type: "link"; text: string; href: string };

const INLINE_RE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

const LINK_RE = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

// Release bodies are untrusted input: only allow http(s), mailto, and
// same-origin-relative hrefs. Anything else (javascript:, data:, vbscript:,
// file:, ...) is demoted to plain text so it can never become a clickable
// script-executing anchor.
export function isSafeHref(href: string): boolean {
	if (href.startsWith("/")) return true;
	return /^(https?:|mailto:)/i.test(href);
}

export function tokenizeInline(text: string): InlineToken[] {
	const out: InlineToken[] = [];
	let last = 0;
	for (const m of text.matchAll(INLINE_RE)) {
		const idx = m.index ?? 0;
		if (idx > last) out.push({ type: "text", text: text.slice(last, idx) });
		const tok = m[0];
		if (tok.startsWith("**") && tok.endsWith("**") && tok.length > 4) {
			out.push({ type: "bold", text: tok.slice(2, -2) });
		} else if (tok.startsWith("`") && tok.endsWith("`") && tok.length > 2) {
			out.push({ type: "code", text: tok.slice(1, -1) });
		} else {
			const link = LINK_RE.exec(tok);
			if (link && isSafeHref(link[2])) {
				out.push({ type: "link", text: link[1], href: link[2] });
			} else {
				// Unsafe or unrecognized scheme → keep the raw text; never emit
				// a clickable href for it.
				out.push({ type: "text", text: tok });
			}
		}
		last = idx + tok.length;
	}
	if (last < text.length) out.push({ type: "text", text: text.slice(last) });
	return out;
}