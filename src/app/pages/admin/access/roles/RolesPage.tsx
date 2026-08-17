/* ════════════════════════════════════
   Roles — admin access control, backed by /api/admin/roles
   ════════════════════════════════════ */

import { useCallback, useEffect, useState, type JSX } from "react";
import { Alert, Badge, Button, Card, Skeleton, Tooltip } from "@devstroop/react-ui";
import Icon from "../../../../components/Icon";
import { adminApi, AdminApiError, type AdminRole } from "../../../../lib/admin-api";

export default function RolesPage(): JSX.Element {
	const [roles, setRoles] = useState<AdminRole[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			setRoles(await adminApi.getRoles());
		} catch (err) {
			setError(err instanceof AdminApiError ? err.message : "Could not load roles");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

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
					<Tooltip content="Role management is read-only for now">
						<button type="button" className="btn btn-primary" disabled>
							<Icon name="shield" size={16} />
							Create role
						</button>
					</Tooltip>
				</div>

				{error && (
					<Alert tone="danger" title="Could not load roles" className="mb-md">
						<p className="m-0 fs-sm">{error}</p>
						<Button variant="secondary" size="sm" className="mt-sm" onClick={() => void load()}>
							Retry
						</Button>
					</Alert>
				)}

				{loading && !error && (
					<div className="d-grid gap-md" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
						{[0, 1, 2].map((i) => (
							<Card key={i} variant="outlined">
								<Skeleton variant="text" width="40%" className="mb-sm" />
								<Skeleton variant="text" width="90%" className="mb-xs" />
								<Skeleton variant="text" width="70%" />
							</Card>
						))}
					</div>
				)}

				{!loading && !error && (
					<div className="d-grid gap-md" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
						{roles.map((r) => (
							<Card
								key={r.id}
								variant="outlined"
								header={
									<div className="d-flex items-center justify-between gap-sm">
										<div className="fw-700 fs-md text-primary">{r.name}</div>
										<Badge tone="primary">{r.key}</Badge>
									</div>
								}
							>
								<div className="d-flex flex-col" style={{ gap: "var(--se-space-3)", minHeight: 84 }}>
									<p className="fs-sm text-secondary m-0" style={{ lineHeight: 1.6 }}>
										{r.description || "No description."}
									</p>
								</div>
							</Card>
						))}
					</div>
				)}
			</div>
		</section>
	);
}