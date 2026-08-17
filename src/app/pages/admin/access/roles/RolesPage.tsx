/* ════════════════════════════════════
   Roles — admin access control (placeholder data until the admin API is wired)
   ════════════════════════════════════ */

import { type JSX } from "react";
import { Badge, Card } from "@devstroop/react-ui";
import Icon from "../../../../components/Icon";

interface Role {
	name: string;
	desc: string;
	members: number;
	permissions: string[];
}

const ROLES: Role[] = [
	{ name: "Owner", desc: "Full control over the site, including deployment.", members: 1, permissions: ["Everything"] },
	{ name: "Admin", desc: "Manage users, roles, content and distribution channels.", members: 2, permissions: ["users:write", "roles:write", "releases:publish", "settings:write"] },
	{ name: "Moderator", desc: "Review reports and moderate user-generated content.", members: 1, permissions: ["users:read", "reports:manage"] },
	{ name: "Member", desc: "Standard account on the public site.", members: 1280, permissions: ["profile:edit", "downloads:read"] },
];

export default function RolesPage(): JSX.Element {
	return (
		<section>
			<div>
				<div className="d-flex items-center justify-between gap-md flex-wrap mb-md">
					<div>
						<h1 className="m-0 fs-lg fw-700 text-primary">Roles</h1>
						<p className="m-0 mt-xs fs-sm text-muted">
							Permission sets assigned to users.
						</p>
					</div>
					<button type="button" className="btn btn-primary" disabled title="Wired up once the API lands">
						<Icon name="shield" size={16} />
						Create role
					</button>
				</div>

				<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
					{ROLES.map((r) => (
						<Card
							key={r.name}
							variant="outlined"
							header={
								<div className="d-flex items-center justify-between gap-sm">
									<div className="fw-700 fs-md text-primary">{r.name}</div>
									<Badge tone="primary">{r.members} member{r.members === 1 ? "" : "s"}</Badge>
								</div>
							}
						>
							<div className="d-flex flex-col" style={{ gap: "var(--se-space-3)", minHeight: 84 }}>
								<p className="fs-sm text-secondary m-0" style={{ lineHeight: 1.6 }}>{r.desc}</p>
								<div className="d-flex flex-wrap gap-xs mt-auto">
									{r.permissions.map((p) => (
										<Badge key={p} variant="outline">{p}</Badge>
									))}
								</div>
							</div>
						</Card>
					))}
				</div>

				<div className="admin-empty">
					<Icon name="alert-triangle" size={16} />
					<span>Placeholder data — roles are rendered from the UI only and are not yet backed by an API.</span>
				</div>
			</div>
		</section>
	);
}
