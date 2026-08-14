/* ════════════════════════════════════
   Hero visual — product image with animated interconnect dots
   ═══════════════════════════════════ */

export default function HeroIllustration({ size = 500 }: { size?: number }) {
	const s = Math.min(size, 500);
	const half = s / 2;
	const r = s * 0.32;

	return (
		<div style={{
			position: "relative",
			width: s,
			maxWidth: "100%",
			aspectRatio: "1/1",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
		}}>
			<svg
				width={s}
				height={s}
				viewBox={`0 0 ${s} ${s}`}
				style={{ position: "absolute", inset: 0, pointerEvents: "none", maxWidth: "100%", maxHeight: "100%" }}
			>
				<g transform={`translate(${half}, ${half})`}>
					{/* Dot 1 — right ↔ left */}
					<g>
						<animateTransform
							attributeName="transform"
							type="rotate"
							values="0; -180; 0"
							dur="4.1s"
							repeatCount="indefinite"
						/>
						<circle cx={r} cy={0} r={6} fill="#23a55a" opacity="0.85">
							<animate attributeName="opacity" values="0.5; 1; 0.5" dur="4.1s" repeatCount="indefinite" />
						</circle>
					</g>

					{/* Dot 2 — left ↔ right (starts 180° behind) */}
					<g>
						<animateTransform
							attributeName="transform"
							type="rotate"
							values="-180; 0; -180"
							dur="3.3s"
							repeatCount="indefinite"
						/>
						<circle cx={r} cy={0} r={4} fill="#5865f2" opacity="0.7">
							<animate attributeName="opacity" values="0.4; 0.9; 0.4" dur="3.3s" repeatCount="indefinite" />
						</circle>
					</g>

					{/* Dot 3 — right ↔ left, slower */}
					<g>
						<animateTransform
							attributeName="transform"
							type="rotate"
							values="0; -180; 0"
							dur="5.7s"
							repeatCount="indefinite"
						/>
						<circle cx={r} cy={0} r={3.5} fill="#f0b232" opacity="0.6">
							<animate attributeName="opacity" values="0.3; 0.8; 0.3" dur="5.7s" repeatCount="indefinite" />
						</circle>
					</g>

					{/* Dot 4 — left ↔ right, fast */}
					<g>
						<animateTransform
							attributeName="transform"
							type="rotate"
							values="-180; 0; -180"
							dur="2.9s"
							repeatCount="indefinite"
						/>
						<circle cx={r} cy={0} r={2.5} fill="#da373c" opacity="0.5">
							<animate attributeName="opacity" values="0.3; 0.7; 0.3" dur="2.9s" repeatCount="indefinite" />
						</circle>
					</g>
				</g>
			</svg>

			<img
				src="/hero.png"
				alt="SoftEther App — VPN connection illustration"
				width={s}
				style={{
					position: "relative",
					zIndex: 1,
					maxWidth: "100%",
					height: "auto",
					objectFit: "contain",
				}}
			/>
		</div>
	);
}
