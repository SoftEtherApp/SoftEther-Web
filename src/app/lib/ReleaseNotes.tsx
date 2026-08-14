/* ════════════════════════════════════
   ReleaseNotes — dependency-free, XSS-safe
   renderer for GitHub-style release bodies.
   Handles ## / ### headings, "- " bullet
   groups, paragraphs, **bold**, `code`,
   and [text](url) links. No innerHTML.
   ════════════════════════════════════ */

import { Fragment, type JSX, type ReactNode } from "react";
import { tokenizeInline, type InlineToken } from "./releaseNotesInline";

function renderInline(tokens: InlineToken[], keyBase: string): ReactNode {
	return tokens.map((t, i) => {
		const key = `${keyBase}-${i}`;
		switch (t.type) {
			case "bold":
				return <strong key={key}>{t.text}</strong>;
			case "code":
				return <code key={key}>{t.text}</code>;
			case "link":
				return (
					<a key={key} href={t.href} target="_blank" rel="noopener noreferrer">
						{t.text}
					</a>
				);
			default:
				return <Fragment key={key}>{t.text}</Fragment>;
		}
	});
}

interface ReleaseNotesProps {
	body: string;
	className?: string;
	lineClassName?: string;
}

/**
 * Renders a release-note body as structured blocks. Each block is wrapped in
 * a <p> with `lineClassName` when provided, so callers keep their existing
 * styling (e.g. `.dl-notes-line`).
 */
export default function ReleaseNotes({ body, className, lineClassName }: ReleaseNotesProps): JSX.Element {
	const lines = body.split("\n");
	const blocks: ReactNode[] = [];
	let bullets: string[] = [];
	let key = 0;

	const flushBullets = () => {
		if (bullets.length === 0) return;
		// A <ul> must not sit inside a <p> (phrasing content only) — emit the
		// list directly with the caller's line styles applied to it.
		blocks.push(
			<ul key={`b${key++}`} className={lineClassName}>
				{bullets.map((b, i) => (
					<li key={i}>{renderInline(tokenizeInline(b), `b${key}-${i}`)}</li>
				))}
			</ul>,
		);
		bullets = [];
	};

	for (const raw of lines) {
		const line = raw.trimEnd();
		if (line.startsWith("- ") || line.startsWith("* ")) {
			bullets.push(line.slice(2));
			continue;
		}
		flushBullets();
		if (line.startsWith("### ")) {
			blocks.push(<h4 key={`h${key++}`} className={lineClassName}>{renderInline(tokenizeInline(line.slice(4)), `h${key}`)}</h4>);
		} else if (line.startsWith("## ")) {
			blocks.push(<h3 key={`h${key++}`} className={lineClassName}>{renderInline(tokenizeInline(line.slice(3)), `h${key}`)}</h3>);
		} else if (line.trim() === "") {
			continue;
		} else {
			blocks.push(<p key={`p${key++}`} className={lineClassName}>{renderInline(tokenizeInline(line), `p${key}`)}</p>);
		}
	}
	flushBullets();

	return <div className={className}>{blocks}</div>;
}