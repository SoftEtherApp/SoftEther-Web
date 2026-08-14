/* ════════════════════════════════════
   Plans — billing plans (placeholder data until billing is wired)
   ════════════════════════════════════ */

import { type JSX } from "react";
import Icon from "../../../components/Icon";

interface Plan {
	name: string;
	price: string;
	period: string;
	features: string[];
	active: boolean;
	popular?: boolean;
}

const PLANS: Plan[] = [
	{ name: "Free", price: "$0", period: "forever", features: ["All core features", "5 devices", "Community support"], active: true },
	{ name: "Pro", price: "$6", period: "per month", features: ["Unlimited devices", "Priority servers", "Email support", "Early access"], active: true, popular: true },
	{ name: "Team", price: "$19", period: "per month", features: ["Everything in Pro", "Central admin console", "Member management", "SSO (soon)"], active: false },
];

export default function PlansPage(): JSX.Element {
	return (
		<section>
			<div>
				<div className="mb-md">
					<h1 className="m-0 fs-lg fw-700 text-primary">Plans</h1>
					<p className="m-0 mt-xs fs-sm text-muted">
						Billing plans offered on the site. Editing is a stub until the billing provider is connected.
					</p>
				</div>

				<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
					{PLANS.map((p) => (
						<div key={p.name} className={`admin-card d-flex flex-col m-0${p.popular ? " bordered" : ""}`}>
							<div className="d-flex items-center justify-between gap-sm mb-xs">
								<h2 className="admin-card-title m-0 text-primary">{p.name}</h2>
								{p.popular && <span className="badge badge--info">Popular</span>}
							</div>
							<div className="mb-md">
								<span className="fs-xl fw-800 text-primary">{p.price}</span>
								<span className="fs-sm text-muted"> / {p.period}</span>
							</div>
							<ul className="trust-list m-0 mb-lg">
								{p.features.map((f) => (
									<li key={f} className="d-flex items-center gap-sm fs-sm">
										<Icon name="check" size={14} className="text-blurple" />
										{f}
									</li>
								))}
							</ul>
							<div className="mt-auto">
								<span className={`badge ${p.active ? "badge--success" : "badge--muted"}`}>
									{p.active ? "Active" : "Draft"}
								</span>
							</div>
						</div>
					))}
				</div>

				<div className="admin-empty">
					<Icon name="credit-card" size={16} />
					<span>Plan pricing and features will be editable here once the billing provider is connected.</span>
				</div>
			</div>
		</section>
	);
}
