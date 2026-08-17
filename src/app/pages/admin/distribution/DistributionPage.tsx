/* ════════════════════════════════════
   Distribution — release channels + build targets (placeholder data)
   ════════════════════════════════════ */

import { useState, type JSX } from "react";
import { Badge, Button, Card, Table } from "@devstroop/react-ui";
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

const STATUS_BADGE: Record<Channel["status"], "success" | "danger" | "warning"> = {
	live: "success",
	paused: "danger",
	staging: "warning",
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
						<Card
							key={c.name}
							variant="outlined"
							header={
								<div className="d-flex items-center justify-between gap-sm">
									<div className="fw-700 fs-md text-primary">{c.name}</div>
									<Badge tone={STATUS_BADGE[c.status]}>{c.status}</Badge>
								</div>
							}
						>
							<div className="d-flex flex-col" style={{ gap: "var(--se-space-3)", minHeight: 96 }}>
								<p className="fs-sm text-secondary m-0" style={{ lineHeight: 1.6 }}>{c.desc}</p>
								<div className="fs-sm fw-600 text-blurple">
									<Icon name="tag" size={14} className="text-blurple" /> {c.version}
								</div>
								<Button
									type="button"
									variant="secondary"
									fullWidth
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
								</Button>
							</div>
						</Card>
					))}
				</div>

				<Card
					variant="outlined"
					header={
						<div>
							<div className="fw-700 fs-md text-primary">Build targets</div>
							<p className="fs-sm text-muted m-0">Artifacts produced for each published release.</p>
						</div>
					}
					className="overflow-x-auto"
				>
					<Table<Target>
						columns={[
							{ key: "platform", header: "Platform", render: (t) => <span className="fw-600 text-primary">{t.platform}</span> },
							{ key: "arch", header: "Architecture", render: (t) => <span className="fs-xs">{t.arch}</span> },
							{
								key: "status",
								header: "Status",
								render: (t) => (
									<Badge tone={t.status === "Built" ? "success" : "warning"}>{t.status}</Badge>
								),
							},
							{ key: "updated", header: "Updated", render: (t) => <span className="fs-xs">{t.updated}</span> },
						]}
						rows={TARGETS}
						rowKey={(t) => t.platform}
					/>
				</Card>

				<div className="admin-empty">
					<Icon name="radio" size={16} />
					<span>Connect the release webhook in Settings to enable real publishing and rollbacks.</span>
				</div>
			</div>
		</section>
	);
}
