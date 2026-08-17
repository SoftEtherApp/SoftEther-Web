/* ════════════════════════════════════
   Permissions — admin access control (toggles are local state)
   ════════════════════════════════════ */

import { useState, type JSX } from "react";
import { Alert, Button, Card, Switch, useToast } from "@devstroop/react-ui";
import Icon from "../../../../components/Icon";

interface PermissionGroup {
	group: string;
	perms: { key: string; label: string; enabled: boolean }[];
}

const INITIAL: PermissionGroup[] = [
	{
		group: "Users",
		perms: [
			{ key: "users:read", label: "View users", enabled: true },
			{ key: "users:invite", label: "Invite users", enabled: true },
			{ key: "users:suspend", label: "Suspend users", enabled: false },
		],
	},
	{
		group: "Releases",
		perms: [
			{ key: "releases:read", label: "View releases", enabled: true },
			{ key: "releases:publish", label: "Publish releases", enabled: false },
			{ key: "releases:rollback", label: "Rollback releases", enabled: false },
		],
	},
	{
		group: "Settings",
		perms: [
			{ key: "settings:read", label: "View settings", enabled: true },
			{ key: "settings:write", label: "Edit settings", enabled: false },
		],
	},
];

export default function PermissionsPage(): JSX.Element {
	const [groups, setGroups] = useState<PermissionGroup[]>(INITIAL);
	const { toast } = useToast();

	const toggle = (groupKey: string, permKey: string) => {
		setGroups((prev) =>
			prev.map((g) =>
				g.group === groupKey
					? { ...g, perms: g.perms.map((p) => (p.key === permKey ? { ...p, enabled: !p.enabled } : p)) }
					: g,
			),
		);
	};

	const reset = () => setGroups(INITIAL);

	const save = () => {
		toast({ title: "Permissions saved", description: "Local only — not persisted.", tone: "success" });
	};

	return (
		<section>
			<div>
				<div className="d-flex items-center justify-between gap-md flex-wrap mb-md">
					<div>
						<h1 className="m-0 fs-lg fw-700 text-primary">Permissions</h1>
						<p className="m-0 mt-xs fs-sm text-muted">
							Capabilities that roles can grant. Toggles are local to this session.
						</p>
					</div>
					<div className="d-flex items-center gap-sm">
						<Button variant="secondary" onClick={reset}>
							Reset
						</Button>
						<Button onClick={save}>
							<Icon name="check" size={16} />
							Save
						</Button>
					</div>
				</div>

				<div className="d-grid gap-md mb-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
					{groups.map((g) => (
						<Card
							key={g.group}
							variant="outlined"
							header={<div className="fw-700 fs-md text-primary">{g.group}</div>}
						>
							<div className="d-flex flex-col">
								{g.perms.map((p) => (
									<div key={p.key} className="d-flex items-center justify-between gap-md py-sm bordered-b">
										<div>
											<div className="fw-500 fs-sm text-primary">{p.label}</div>
											<div className="fs-xs text-muted">{p.key}</div>
										</div>
										<Switch checked={p.enabled} onChange={() => toggle(g.group, p.key)} aria-label={`Toggle ${p.label}`} />
									</div>
								))}
							</div>
						</Card>
					))}
				</div>

				<Alert tone="info">Permission evaluation happens server-side in the real system; these switches preview the UI only.</Alert>
			</div>
		</section>
	);
}
