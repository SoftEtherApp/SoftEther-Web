/* ════════════════════════════════════
   Features — feature flags, backed by /api/admin/features
   Toggles persist immediately via PATCH.
   ════════════════════════════════════ */

import { useCallback, useEffect, useState, type JSX } from "react";
import { Alert, Badge, Button, Card, Skeleton, Switch, Table, useToast } from "@devstroop/react-ui";
import { adminApi, AdminApiError, type AdminFeatureFlag } from "../../../lib/admin-api";

export default function FeaturesPage(): JSX.Element {
	const { toast } = useToast();
	const [flags, setFlags] = useState<AdminFeatureFlag[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			setFlags(await adminApi.getFeatures());
		} catch (err) {
			setError(err instanceof AdminApiError ? err.message : "Could not load feature flags");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const toggle = async (flag: AdminFeatureFlag) => {
		const next = !flag.enabled;
		setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: next } : f)));
		try {
			await adminApi.toggleFeature(flag.key, next);
			toast({ title: next ? "Flag enabled" : "Flag disabled", description: flag.name, tone: "success" });
		} catch (err) {
			setFlags((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: !next } : f)));
			toast({
				title: "Toggle failed",
				description: err instanceof AdminApiError ? err.message : "Unknown error",
				tone: "danger",
			});
		}
	};

	return (
		<section>
			<div>
				<div className="d-flex items-center justify-between gap-md flex-wrap mb-md">
					<div>
						<h1 className="m-0 fs-lg fw-700 text-primary">Features</h1>
						<p className="m-0 mt-xs fs-sm text-muted">
							Feature flags evaluated server-side. Toggles persist immediately.
						</p>
					</div>
				</div>

				{error && (
					<Alert tone="danger" title="Could not load feature flags" className="mb-md">
						<p className="m-0 fs-sm">{error}</p>
						<Button variant="secondary" size="sm" className="mt-sm" onClick={() => void load()}>
							Retry
						</Button>
					</Alert>
				)}

				{loading && !error && (
					<Card variant="outlined">
						<div className="d-flex flex-col" style={{ gap: 14 }}>
							{[0, 1, 2, 3].map((i) => (
								<div key={i} className="d-flex items-center gap-md">
									<div className="flex-1">
										<Skeleton variant="text" width="35%" className="mb-xs" />
										<Skeleton variant="text" width="60%" />
									</div>
									<Skeleton variant="rect" width={44} height={24} />
								</div>
							))}
						</div>
					</Card>
				)}

				{!loading && !error && (
					<Card variant="outlined" className="overflow-x-auto">
						<Table<AdminFeatureFlag>
							columns={[
								{
									key: "feature",
									header: "Feature",
									render: (f) => (
										<div>
											<div className="fw-600 text-primary">{f.name}</div>
											<div className="fs-xs text-muted">{f.description || f.key}</div>
										</div>
									),
								},
								{
									key: "key",
									header: "Key",
									render: (f) => <Badge variant="outline">{f.key}</Badge>,
								},
								{
									key: "enabled",
									header: "Enabled",
									align: "end",
									render: (f) => (
										<Switch checked={f.enabled} onChange={() => void toggle(f)} aria-label={`Toggle ${f.name}`} />
									),
								},
							]}
							rows={flags}
							rowKey={(f) => f.key}
						/>
					</Card>
				)}

				<Alert tone="info">Flags are evaluated server-side and delivered to clients via a config endpoint.</Alert>
			</div>
		</section>
	);
}