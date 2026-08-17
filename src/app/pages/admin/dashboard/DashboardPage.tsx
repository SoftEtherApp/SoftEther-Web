/* ════════════════════════════════════
   Dashboard — admin landing, backed by /api/admin/stats + activity
   ════════════════════════════════════ */

import { useCallback, useEffect, useState, type JSX } from "react";
import { Alert, Button, Card, Skeleton, Stat } from "@devstroop/react-ui";
import Icon, { type IconName } from "../../../components/Icon";
import { navigate } from "../../../App";
import { adminApi, AdminApiError, type AdminActivity, type AdminStats } from "../../../lib/admin-api";

const QUICK_ACTIONS: { href: string; label: string; icon: IconName; desc: string }[] = [
	{ href: "/admin/access/users", label: "Manage users", icon: "users", desc: "Invite, suspend or assign roles" },
	{ href: "/admin/distribution", label: "Publish a release", icon: "package", desc: "Push builds to a channel" },
	{ href: "/admin/settings", label: "Site settings", icon: "settings", desc: "Branding, security and API config" },
];

const ACTION_LABELS: Record<string, string> = {
	"users.invite": "User invited",
	"users.suspend": "User suspended",
	"users.reactivate": "User reactivated",
	"users.status": "User status changed",
	"users.role": "Role changed",
	"features.toggle": "Feature flag toggled",
};

function actionLabel(action: string): string {
	return ACTION_LABELS[action] ?? action;
}

function timeAgo(unixSeconds: number): string {
	const seconds = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export default function DashboardPage(): JSX.Element {
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [activity, setActivity] = useState<AdminActivity[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [statsData, activityData] = await Promise.all([adminApi.getStats(), adminApi.getActivity()]);
			setStats(statsData);
			setActivity(activityData);
		} catch (err) {
			setError(err instanceof AdminApiError ? err.message : "Could not load dashboard data");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const statCards: { label: string; value: string; icon: IconName; note: string }[] = stats
		? [
				{ label: "Registered users", value: stats.users.toLocaleString(), icon: "users", note: "total accounts" },
				{ label: "Releases published", value: stats.releases.toLocaleString(), icon: "package", note: "mirrored to D1" },
				{ label: "Feature flags", value: stats.featureFlags.toLocaleString(), icon: "flag", note: "evaluated server-side" },
			]
		: [];

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
					<Button variant="secondary" onClick={() => navigate("/admin/distribution")}>
						<Icon name="plus" size={16} />
						Publish release
					</Button>
				</div>

				{error && (
					<Alert tone="danger" title="Could not load dashboard data" className="mb-lg">
						<p className="m-0 fs-sm">{error}</p>
						<Button variant="secondary" size="sm" className="mt-sm" onClick={() => void load()}>
							Retry
						</Button>
					</Alert>
				)}

				{loading && !error && (
					<>
						<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
							{[0, 1, 2].map((i) => (
								<Card key={i} variant="outlined">
									<Skeleton variant="text" width="45%" className="mb-sm" />
									<Skeleton variant="text" width="60%" />
								</Card>
							))}
						</div>
						<Card variant="outlined">
							<div className="d-flex flex-col" style={{ gap: 14 }}>
								{[0, 1, 2, 3].map((i) => (
									<div key={i} className="d-flex items-center gap-md">
										<Skeleton variant="circle" width={32} height={32} />
										<div className="flex-1">
											<Skeleton variant="text" width="55%" className="mb-xs" />
											<Skeleton variant="text" width="30%" />
										</div>
									</div>
								))}
							</div>
						</Card>
					</>
				)}

				{!loading && !error && (
					<>
						<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
							{statCards.map((s) => (
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
										<p className="fs-sm text-muted m-0">Latest admin mutations (last 50).</p>
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
							{activity.length === 0 ? (
								<p className="fs-sm text-muted m-0">No admin activity recorded yet — mutations log here as they happen.</p>
							) : (
								<div className="d-flex flex-col">
									{activity.map((a) => (
										<div key={a.id} className="d-flex items-center gap-md py-sm bordered-b">
											<div className="icon-chip">
												<Icon name="clock" size={15} />
											</div>
											<div className="flex-1 fs-sm text-secondary">
												{actionLabel(a.action)}
												{a.detail ? <span className="text-muted"> — {a.detail}</span> : null}
											</div>
											<span className="fs-xs text-muted">{timeAgo(a.createdAt)}</span>
										</div>
									))}
								</div>
							)}
						</Card>
					</>
				)}
			</div>
		</section>
	);
}