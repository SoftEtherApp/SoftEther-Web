/* ════════════════════════════════════
   Permissions — admin access control, backed by /api/admin/permissions
   Grouped by the key prefix ("users.read" → Users). Switches are a
   local preview — permission evaluation is server-side and there is
   no write endpoint yet.
   ════════════════════════════════════ */

import { useCallback, useEffect, useState, type JSX } from "react";
import { Alert, Button, Card, Skeleton, Switch } from "@devstroop/react-ui";
import { adminApi, AdminApiError, type AdminPermission } from "../../../../lib/admin-api";

interface PermissionGroup {
	group: string;
	perms: AdminPermission[];
}

function groupKey(key: string): string {
	const prefix = key.split(".")[0] ?? key;
	return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function groupPermissions(perms: AdminPermission[]): PermissionGroup[] {
	const map = new Map<string, AdminPermission[]>();
	for (const p of perms) {
		const g = groupKey(p.key);
		if (!map.has(g)) map.set(g, []);
		map.get(g)!.push(p);
	}
	return [...map.entries()].map(([group, items]) => ({ group, perms: items }));
}

export default function PermissionsPage(): JSX.Element {
	const [groups, setGroups] = useState<PermissionGroup[]>([]);
	const [snapshot, setSnapshot] = useState<PermissionGroup[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const perms = await adminApi.getPermissions();
			const grouped = groupPermissions(perms);
			setGroups(grouped);
			setSnapshot(grouped);
		} catch (err) {
			setError(err instanceof AdminApiError ? err.message : "Could not load permissions");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const toggle = (group: string, permKey: string) => {
		setGroups((prev) =>
			prev.map((g) =>
				g.group === group
					? {
							...g,
							perms: g.perms.map((p) =>
								p.key === permKey ? { ...p, enabled: !(p.enabled ?? false) } : p,
							),
						}
					: g,
			),
		);
	};

	const reset = () => setGroups(snapshot);

	return (
		<section>
			<div>
				<div className="d-flex items-center justify-between gap-md flex-wrap mb-md">
					<div>
						<h1 className="m-0 fs-lg fw-700 text-primary">Permissions</h1>
						<p className="m-0 mt-xs fs-sm text-muted">
							Capabilities that roles can grant. Switches are a local preview.
						</p>
					</div>
					<Button variant="secondary" onClick={reset} disabled={loading}>
						Reset
					</Button>
				</div>

				{error && (
					<Alert tone="danger" title="Could not load permissions" className="mb-md">
						<p className="m-0 fs-sm">{error}</p>
						<Button variant="secondary" size="sm" className="mt-sm" onClick={() => void load()}>
							Retry
						</Button>
					</Alert>
				)}

				{loading && !error && (
					<div className="d-grid gap-md" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
						{[0, 1, 2].map((i) => (
							<Card key={i} variant="outlined">
								<Skeleton variant="text" width="35%" className="mb-sm" />
								<Skeleton variant="text" width="90%" className="mb-xs" />
								<Skeleton variant="text" width="80%" />
							</Card>
						))}
					</div>
				)}

				{!loading && !error && (
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
												<div className="fw-500 fs-sm text-primary">{p.name}</div>
												<div className="fs-xs text-muted">{p.description || p.key}</div>
											</div>
											<Switch checked={p.enabled ?? false} onChange={() => toggle(g.group, p.key)} aria-label={`Toggle ${p.name}`} />
										</div>
									))}
								</div>
							</Card>
						))}
					</div>
				)}

				<Alert tone="info">Permission evaluation happens server-side in the real system; these switches preview the UI only.</Alert>
			</div>
		</section>
	);
}