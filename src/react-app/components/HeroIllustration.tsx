/* ════════════════════════════════════
   Hero visual — product image
   ═���══════════════════════════════════ */

export default function HeroIllustration({ size = 500 }: { size?: number }) {
	const s = Math.min(size, 500);
	return (
		<img
			src="/hero.png"
			alt="SoftEther App — VPN connection illustration"
			width={s}
			style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
		/>
	);
}
