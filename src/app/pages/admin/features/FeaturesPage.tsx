/* ════════════════════════════════════
   Features — feature flags (toggles are local state)
   ════════════════════════════════════ */

import { useState, type JSX } from "react";
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
	const [saved, setSaved] = useState(false);

	const toggle = (key: string) => {
		setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));
	};

	const save = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 3000);
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
					<button type="button" className="btn btn-primary" onClick={save}>
						<Icon name="check" size={16} />
						Save
					</button>
					{saved && <span className="fs-sm text-muted">Saved (local only).</span>}
				</div>

				<div className="admin-card overflow-x-auto">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Feature</th>
								<th>Channel</th>
								<th className="text-right">Enabled</th>
							</tr>
						</thead>
						<tbody>
							{flags.map((f) => (
								<tr key={f.key}>
									<td>
										<div className="fw-600 text-primary">{f.label}</div>
										<div className="fs-xs text-muted">{f.desc}</div>
									</td>
									<td>
										<span className={`badge ${f.channel === "all" ? "badge--info" : "badge--warning"}`}>{f.channel}</span>
									</td>
									<td className="text-right">
										<label className="switch">
											<input type="checkbox" checked={f.enabled} onChange={() => toggle(f.key)} />
											<span className="switch-slider" />
										</label>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="admin-empty">
					<Icon name="flag" size={16} />
					<span>Flags will be evaluated server-side and delivered to clients via a config endpoint.</span>
				</div>
			</div>
		</section>
	);
}
