/* ════════════════════════════════════
   Dashboard — admin landing (placeholder data until the admin API is wired)
   ════════════════════════════════════ */

import { type JSX } from "react";
import { Alert, Card, Stat } from "@devstroop/react-ui";
import Icon, { type IconName } from "../../../components/Icon";
import { navigate } from "../../../App";

const STATS: { label: string; value: string; icon: IconName; note: string }[] = [
	{ label: "Registered users", value: "1,284", icon: "users", note: "+12 this week" },
	{ label: "Active sessions", value: "46", icon: "activity", note: "peaked 64 today" },
	{ label: "Releases published", value: "12", icon: "package", note: "across 3 channels" },
	{ label: "Latest release", value: "v0.9.1", icon: "tag", note: "stable channel" },
];

const QUICK_ACTIONS: { href: string; label: string; icon: IconName; desc: string }[] = [
	{ href: "/admin/access/users", label: "Manage users", icon: "users", desc: "Invite, suspend or assign roles" },
	{ href: "/admin/distribution", label: "Publish a release", icon: "package", desc: "Push builds to a channel" },
	{ href: "/admin/settings", label: "Site settings", icon: "settings", desc: "Branding, security and API config" },
];

const ACTIVITY: { text: string; time: string }[] = [
	{ text: "New account registered — dev@devstroop.com", time: "8m ago" },
	{ text: "Release v0.9.1 published to the stable channel", time: "2h ago" },
	{ text: "Role 'Moderator' updated by akash@devstroop.com", time: "5h ago" },
	{ text: "User 'jane' was suspended", time: "1d ago" },
	{ text: "Settings changed — session timeout set to 24h", time: "2d ago" },
];

export default function DashboardPage(): JSX.Element {
	return (
		<section>
			<div>
				<div className="d-flex items-center justify-between gap-md flex-wrap mb-md">
					<div>
						<h1 className="m-0 fs-lg fw-700 text-primary">Dashboard</h1>
						<p className="m-0 mt-xs fs-sm text-muted">
							Overview of your SoftEther deployment.
						</p>
					</div>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => navigate("/admin/distribution")}
					>
						<Icon name="plus" size={16} />
						Publish release
					</button>
				</div>

				<Alert tone="warning" className="mb-lg">
					Demo data — values below are placeholders until the admin API is connected.
				</Alert>

				<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
					{STATS.map((s) => (
						<Card key={s.label} variant="outlined">
							<div className="d-flex items-center gap-md">
								<div className="icon-chip">
									<Icon name={s.icon} size={18} />
								</div>
								<Stat label={s.label} value={s.value} hint={s.note} />
							</div>
						</Card>
					))}
				</div>

				<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
					{QUICK_ACTIONS.map((q) => (
						<Card key={q.href} variant="interactive">
							<a
								href={q.href}
								className="text-none d-flex items-center gap-md"
								onClick={(e) => { e.preventDefault(); navigate(q.href); }}
							>
								<div className="icon-chip">
									<Icon name={q.icon} size={18} />
								</div>
								<div className="flex-1">
									<div className="fw-600 text-primary">{q.label}</div>
									<div className="fs-xs text-muted">{q.desc}</div>
								</div>
								<Icon name="chevron-right" size={18} className="text-muted" />
							</a>
						</Card>
					))}
				</div>

				<Card
					header={
						<div className="d-flex items-center justify-between gap-md flex-wrap">
							<div>
								<div className="fw-700 fs-md text-primary">Recent activity</div>
								<p className="fs-sm text-muted m-0">Latest events across the admin area.</p>
							</div>
							<a
								href="/admin/access/users"
								className="fs-sm text-blurple text-none"
								onClick={(e) => { e.preventDefault(); navigate("/admin/access/users"); }}
							>
								View all
							</a>
						</div>
					}
				>
					<div className="d-flex flex-col">
						{ACTIVITY.map((a, i) => (
							<div key={i} className="d-flex items-center gap-md py-sm bordered-b">
								<div className="icon-chip">
									<Icon name="clock" size={15} />
								</div>
								<span className="flex-1 fs-sm text-secondary">{a.text}</span>
								<span className="fs-xs text-muted">{a.time}</span>
							</div>
						))}
					</div>
				</Card>
			</div>
		</section>
	);
}
