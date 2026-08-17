/* ════════════════════════════════════
   Users — admin access control (placeholder data until the admin API is wired)
   ════════════════════════════════════ */

import { useState, type JSX } from "react";
import { Alert, Badge, Card, EmptyState, Input, Table, Tooltip } from "@devstroop/react-ui";
import Icon from "../../../../components/Icon";

interface AdminUser {
	name: string;
	email: string;
	role: string;
	status: "active" | "invited" | "suspended";
	lastActive: string;
}

const USERS: AdminUser[] = [
	{ name: "Akash Shah", email: "akash@devstroop.com", role: "Owner", status: "active", lastActive: "now" },
	{ name: "Dev Singh", email: "dev@devstroop.com", role: "Admin", status: "active", lastActive: "18m ago" },
	{ name: "Jane Cooper", email: "jane@example.com", role: "Moderator", status: "active", lastActive: "2h ago" },
	{ name: "Ravi Patel", email: "ravi@example.com", role: "Member", status: "invited", lastActive: "never" },
	{ name: "Maria Garcia", email: "maria@example.com", role: "Member", status: "suspended", lastActive: "3d ago" },
	{ name: "Tom Chen", email: "tom@example.com", role: "Member", status: "active", lastActive: "1d ago" },
];

const STATUS_BADGE: Record<AdminUser["status"], "success" | "warning" | "danger"> = {
	active: "success",
	invited: "warning",
	suspended: "danger",
};

function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]!.toUpperCase())
		.join("");
}

export default function UsersPage(): JSX.Element {
	const [query, setQuery] = useState("");

	const filtered = USERS.filter(
		(u) =>
			u.name.toLowerCase().includes(query.toLowerCase()) ||
			u.email.toLowerCase().includes(query.toLowerCase()),
	);

	return (
		<section>
			<div>
				<div className="d-flex items-center justify-between gap-md flex-wrap mb-md">
					<div>
						<h1 className="m-0 fs-lg fw-700 text-primary">Users</h1>
						<p className="m-0 mt-xs fs-sm text-muted">
							Manage accounts and their roles across the site.
						</p>
					</div>
					<Tooltip content="Wired up once the API lands">
						<button type="button" className="btn btn-primary" disabled>
							<Icon name="user-plus" size={16} />
							Invite user
						</button>
					</Tooltip>
				</div>

				<div className="d-flex items-center gap-md flex-wrap mb-md">
					<div className="pos-relative" style={{ maxWidth: 320 }}>
						<Input
							type="search"
							className="pl-lg"
							placeholder="Search by name or email"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							aria-label="Search users"
						/>
						<Icon name="search" size={16} className="pos-absolute" style={{ left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
					</div>
					<span className="fs-xs text-muted">Showing {filtered.length} of {USERS.length}</span>
				</div>

				<Card variant="outlined" className="overflow-x-auto">
					<Table<AdminUser>
						columns={[
							{
								key: "user",
								header: "User",
								render: (u) => (
									<div className="d-flex items-center gap-sm">
										<span className="admin-avatar">{initials(u.name)}</span>
										<div>
											<div className="fw-600 text-primary">{u.name}</div>
											<div className="fs-xs text-muted">{u.email}</div>
										</div>
									</div>
								),
							},
							{
								key: "role",
								header: "Role",
								render: (u) => <Badge tone="primary">{u.role}</Badge>,
							},
							{
								key: "status",
								header: "Status",
								render: (u) => <Badge tone={STATUS_BADGE[u.status]}>{u.status}</Badge>,
							},
							{
								key: "lastActive",
								header: "Last active",
								align: "end",
								render: (u) => <span className="fs-xs">{u.lastActive}</span>,
							},
						]}
						rows={filtered}
						rowKey={(u) => u.email}
						empty={
							<EmptyState title="No users match" description={`No users match "${query}".`} />
						}
					/>
				</Card>

				<Alert tone="warning">Placeholder data — user management is enabled for the UI but not yet connected to a backend.</Alert>
			</div>
		</section>
	);
}
