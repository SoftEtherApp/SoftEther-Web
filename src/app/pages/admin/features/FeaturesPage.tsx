/* ════════════════════════════════════
   Features — feature flags (toggles are local state)
   ════════════════════════════════════ */

import { useState, type JSX } from "react";
import { Alert, Badge, Button, Card, Switch, Table, useToast } from "@devstroop/react-ui";
import Icon from "../../../components/Icon";

interface FeatureFlag {
	key: string;
	label: string;
	desc: string;
	enabled: boolean;
	channel: string;
}

const INITIAL: FeatureFlag[] = [
	{ key: "new-onboarding", label: "New onboarding flow", desc: "Interactive walkthrough on first launch.", enabled: true, channel: "beta" },
	{ key: "wireguard-support", label: "WireGuard protocol", desc: "Experimental WireGuard tunnel support.", enabled: false, channel: "canary" },
	{ key: "split-tunneling", label: "Split tunneling", desc: "Route only selected apps through the VPN.", enabled: false, channel: "canary" },
	{ key: "auto-update", label: "Automatic updates", desc: "Silently install stable releases.", enabled: true, channel: "all" },
	{ key: "telemetry", label: "Usage telemetry", desc: "Anonymous crash and usage reporting.", enabled: false, channel: "all" },
];

export default function FeaturesPage(): JSX.Element {
	const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL);
	const { toast } = useToast();

	const toggle = (key: string) => {
		setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));
	};

	const save = () => {
		toast({ title: "Features saved", description: "Local only — not persisted.", tone: "success" });
	};

	return (
		<section>
			<div>
				<div className="d-flex items-center justify-between gap-md flex-wrap mb-md">
					<div>
						<h1 className="m-0 fs-lg fw-700 text-primary">Features</h1>
						<p className="m-0 mt-xs fs-sm text-muted">
							Feature flags shipped with each release. Toggles are local to this session.
						</p>
					</div>
					<Button onClick={save}>
						<Icon name="check" size={16} />
						Save
					</Button>
				</div>

				<Card variant="outlined" className="overflow-x-auto">
					<Table<FeatureFlag>
						columns={[
							{
								key: "feature",
								header: "Feature",
								render: (f) => (
									<div>
										<div className="fw-600 text-primary">{f.label}</div>
										<div className="fs-xs text-muted">{f.desc}</div>
									</div>
								),
							},
							{
								key: "channel",
								header: "Channel",
								render: (f) => <Badge tone={f.channel === "all" ? "primary" : "warning"}>{f.channel}</Badge>,
							},
							{
								key: "enabled",
								header: "Enabled",
								align: "end",
								render: (f) => (
									<Switch checked={f.enabled} onChange={() => toggle(f.key)} aria-label={`Toggle ${f.label}`} />
								),
							},
						]}
						rows={flags}
						rowKey={(f) => f.key}
					/>
				</Card>

				<Alert tone="info">Flags will be evaluated server-side and delivered to clients via a config endpoint.</Alert>
			</div>
		</section>
	);
}
