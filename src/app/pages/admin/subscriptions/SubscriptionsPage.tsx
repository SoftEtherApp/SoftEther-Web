/* ════════════════════════════════════
   Subscriptions — billing overview (placeholder data until billing is wired)
   ════════════════════════════════════ */

import { type JSX } from "react";
import Icon from "../../../components/Icon";

const SUMMARY: { label: string; value: string }[] = [
	{ label: "Active subscriptions", value: "312" },
	{ label: "Monthly recurring revenue", value: "$4,830" },
	{ label: "Trial / pending", value: "48" },
	{ label: "Churn (30d)", value: "2.4%" },
];

interface Subscription {
	user: string;
	plan: string;
	status: "active" | "past_due" | "cancelled";
	renews: string;
}

const SUBSCRIPTIONS: Subscription[] = [
	{ user: "dev@devstroop.com", plan: "Pro", status: "active", renews: "2026-09-01" },
	{ user: "jane@example.com", plan: "Free", status: "active", renews: "—" },
	{ user: "ravi@example.com", plan: "Pro", status: "past_due", renews: "2026-08-12" },
	{ user: "tom@example.com", plan: "Team", status: "active", renews: "2026-08-24" },
	{ user: "maria@example.com", plan: "Pro", status: "cancelled", renews: "—" },
];

const STATUS_BADGE: Record<Subscription["status"], string> = {
	active: "badge--success",
	past_due: "badge--danger",
	cancelled: "badge--muted",
};

export default function SubscriptionsPage(): JSX.Element {
	return (
		<section>
			<div>
				<div className="mb-md">
					<h1 className="m-0 fs-lg fw-700 text-primary">Subscriptions</h1>
					<p className="m-0 mt-xs fs-sm text-muted">
						Customer billing overview. Placeholder data until the billing provider is connected.
					</p>
				</div>

				<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
					{SUMMARY.map((s) => (
						<div key={s.label} className="stat-card">
							<div className="stat-card-label">{s.label}</div>
							<div className="stat-card-value text-primary">{s.value}</div>
						</div>
					))}
				</div>

				<div className="admin-card overflow-x-auto">
					<h2 className="admin-card-title text-primary">All subscriptions</h2>
					<p className="admin-card-desc">Most recent first.</p>
					<table className="admin-table">
						<thead>
							<tr>
								<th>Customer</th>
								<th>Plan</th>
								<th>Status</th>
								<th>Renews</th>
							</tr>
						</thead>
						<tbody>
							{SUBSCRIPTIONS.map((s) => (
								<tr key={s.user}>
									<td className="fw-600 text-primary">{s.user}</td>
									<td><span className="badge badge--info">{s.plan}</span></td>
									<td><span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span></td>
									<td className="fs-xs">{s.renews}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="admin-empty">
					<Icon name="credit-card" size={16} />
					<span>Stripe / payment-provider integration will populate this view automatically.</span>
				</div>
			</div>
		</section>
	);
}
