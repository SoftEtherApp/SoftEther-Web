/* ════════════════════════════════════
   Hero visual — app logo with decorative ring
   ════════════════════════════════════ */

export default function HeroIllustration({ size = 260 }: { size?: number }) {
	const s = Math.min(size, 260);
	return (
		<div
			style={{
				width: s,
				height: s,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				position: "relative",
			}}
			aria-hidden="true"
		>
			{/* Decorative ring behind logo */}
			<div
				style={{
					position: "absolute",
					width: s * 0.8,
					height: s * 0.8,
					borderRadius: "50%",
					border: "1.5px solid var(--indigo-400)",
					opacity: 0.15,
				}}
			/>
			<div
				style={{
					position: "absolute",
					width: s * 0.55,
					height: s * 0.55,
					borderRadius: "50%",
					border: "1px solid var(--teal-400)",
					opacity: 0.1,
				}}
			/>
			{/* App logo */}
			<img
				src="/logo.png"
				alt=""
				width={s * 0.35}
				height={s * 0.35}
				style={{ position: "relative", borderRadius: "20%", opacity: 0.9 }}
			/>
		</div>
	);
}
