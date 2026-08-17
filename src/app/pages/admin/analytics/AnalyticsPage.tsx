/* ════════════════════════════════════
   Analytics — usage metrics (placeholder data until telemetry is wired)
   ════════════════════════════════════ */

import { type JSX } from "react";
import { Alert, Card, Stat } from "@devstroop/react-ui";

const METRICS: { label: string; value: string; delta: string; up: boolean }[] = [
	{ label: "Downloads (30d)", value: "48,210", delta: "+12.4%", up: true },
	{ label: "Active installs", value: "9,873", delta: "+3.1%", up: true },
	{ label: "Avg. sessions / day", value: "312", delta: "-0.8%", up: false },
	{ label: "API requests", value: "1.2M", delta: "+8.2%", up: true },
];

const PLATFORMS: { platform: string; share: string }[] = [
	{ platform: "Windows", share: "41%" },
	{ platform: "macOS", share: "27%" },
	{ platform: "Linux", share: "14%" },
	{ platform: "Android", share: "12%" },
	{ platform: "iOS", share: "6%" },
];

export default function AnalyticsPage(): JSX.Element {
	return (
		<section>
			<div>
				<div className="mb-md">
					<h1 className="m-0 fs-lg fw-700 text-primary">Analytics</h1>
					<p className="m-0 mt-xs fs-sm text-muted">
						Usage and download telemetry. Numbers are placeholders until tracking is connected.
					</p>
				</div>

				<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
					{METRICS.map((m) => (
						<Card key={m.label} variant="outlined">
							<Stat
								label={m.label}
								value={m.value}
								delta={m.delta}
								deltaTone={m.up ? "success" : "neutral"}
							/>
						</Card>
					))}
				</div>

				<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
					<Card
						variant="outlined"
						header={
							<div>
								<div className="fw-700 fs-md text-primary">Downloads by platform</div>
								<p className="fs-sm text-muted m-0">Share of installers fetched in the last 30 days.</p>
							</div>
						}
					>
						<div className="d-flex flex-col gap-sm">
							{PLATFORMS.map((p) => (
								<div key={p.platform} className="d-flex items-center gap-md">
									<span className="fs-sm flex-1 text-secondary">{p.platform}</span>
									<div className="flex-1 pos-relative overflow-hidden bg-surface-700 rounded-sm" style={{ height: 8 }}>
										<div
											className="pos-absolute h-100 rounded-sm"
											style={{ left: 0, top: 0, width: p.share, background: "var(--blurple)" }}
										/>
									</div>
									<span className="fs-xs fw-600" style={{ width: 48, textAlign: "right" }}>{p.share}</span>
								</div>
							))}
						</div>
					</Card>

					<Card
						variant="outlined"
						header={
							<div>
								<div className="fw-700 fs-md text-primary">Telemetry</div>
								<p className="fs-sm text-muted m-0">Anonymous usage events reported by the client.</p>
							</div>
						}
					>
						<Alert tone="info">Charts will render here once a telemetry endpoint and event pipeline are in place.</Alert>
					</Card>
				</div>
			</div>
		</section>
	);
}
