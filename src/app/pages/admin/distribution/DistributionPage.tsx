/* ════════════════════════════════════
   Distribution — release channels + build targets (placeholder data)
   ════════════════════════════════════ */

import { useState, type JSX } from "react";
import Icon from "../../../components/Icon";

interface Channel {
	name: string;
	desc: string;
	version: string;
	status: "live" | "paused" | "staging";
}

const CHANNELS: Channel[] = [
	{ name: "Stable", desc: "Recommended for all users.", version: "v0.9.1", status: "live" },
	{ name: "Beta", desc: "Upcoming features, tested by early adopters.", version: "v0.10.0-rc1", status: "live" },
	{ name: "Canary", desc: "Nightly builds for developers.", version: "v0.11.0-dev", status: "staging" },
];

const STATUS_BADGE: Record<Channel["status"], string> = {
	live: "badge--success",
	paused: "badge--danger",
	staging: "badge--warning",
};

interface Target {
	platform: string;
	arch: string;
	status: string;
	updated: string;
}

const TARGETS: Target[] = [
	{ platform: "Windows", arch: "x64 / arm64", status: "Built", updated: "2h ago" },
	{ platform: "macOS", arch: "Intel / Apple Silicon", status: "Built", updated: "2h ago" },
	{ platform: "Linux", arch: "x64 / arm64", status: "Built", updated: "2h ago" },
	{ platform: "Android", arch: "arm64-v8a / armeabi-v7a", status: "Queued", updated: "—" },
	{ platform: "iOS", arch: "arm64", status: "Queued", updated: "—" },
];

export default function DistributionPage(): JSX.Element {
	const [publishing, setPublishing] = useState<string | null>(null);

	const handlePublish = (channel: string) => {
		setPublishing(channel);
		setTimeout(() => setPublishing(null), 1500);
	};

	return (
		<section>
			<div>
				<div className="mb-md">
					<h1 className="m-0 fs-lg fw-700 text-primary">Distribution</h1>
					<p className="m-0 mt-xs fs-sm text-muted">
						Release channels and build targets. Publishing is a stub until the webhook pipeline is wired.
					</p>
				</div>

				<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
					{CHANNELS.map((c) => (
						<div key={c.name} className="admin-card d-flex flex-col m-0">
							<div className="d-flex items-center justify-between gap-sm mb-xs">
								<h2 className="admin-card-title m-0 text-primary">{c.name}</h2>
								<span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status}</span>
							</div>
							<p className="fs-sm text-secondary mb-md">{c.desc}</p>
							<div className="fs-sm fw-600 text-blurple mb-md">
								<Icon name="tag" size={14} className="text-blurple" /> {c.version}
							</div>
							<button
								type="button"
								className="btn btn-secondary mt-auto w-100 justify-center"
								disabled={c.status === "staging"}
								title={c.status === "staging" ? "Canary builds are published automatically" : "Stub — triggers the release pipeline"}
								onClick={() => handlePublish(c.name)}
							>
								{publishing === c.name ? (
									<>
										<Icon name="refresh-cw" size={16} />
										Publishing…
									</>
								) : (
									<>
										<Icon name="package" size={16} />
										Publish now
									</>
								)}
							</button>
						</div>
					))}
				</div>

				<div className="admin-card">
					<h2 className="admin-card-title text-primary">Build targets</h2>
					<p className="admin-card-desc">Artifacts produced for each published release.</p>
					<div className="overflow-x-auto">
						<table className="admin-table">
							<thead>
								<tr>
									<th>Platform</th>
									<th>Architecture</th>
									<th>Status</th>
									<th>Updated</th>
								</tr>
							</thead>
							<tbody>
								{TARGETS.map((t) => (
									<tr key={t.platform}>
										<td className="fw-600 text-primary">{t.platform}</td>
										<td className="fs-xs">{t.arch}</td>
										<td>
											<span className={`badge ${t.status === "Built" ? "badge--success" : "badge--warning"}`}>{t.status}</span>
										</td>
										<td className="fs-xs">{t.updated}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="admin-empty">
					<Icon name="radio" size={16} />
					<span>Connect the release webhook in Settings to enable real publishing and rollbacks.</span>
				</div>
			</div>
		</section>
	);
}
