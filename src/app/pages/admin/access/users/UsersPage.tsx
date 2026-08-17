/* ════════════════════════════════════
   Users — admin access control, backed by /api/admin/users
   ════════════════════════════════════ */

import { useCallback, useEffect, useState, type JSX } from "react";
import { Alert, Avatar, Badge, Button, Card, Dialog, EmptyState, Field, Input, Select, Skeleton, Table, useToast } from "@devstroop/react-ui";
import Icon from "../../../../components/Icon";
import { adminApi, AdminApiError, type AdminUser } from "../../../../lib/admin-api";

const STATUS_BADGE: Record<AdminUser["status"], "success" | "warning" | "danger"> = {
	active: "success",
	invited: "warning",
	suspended: "danger",
};

const INVITE_ROLES = [
	{ value: "user", label: "user" },
	{ value: "admin", label: "admin" },
	{ value: "operator", label: "operator" },
	{ value: "viewer", label: "viewer" },
];

export default function UsersPage(): JSX.Element {
	const { toast } = useToast();
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");

	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteName, setInviteName] = useState("");
	const [inviteRole, setInviteRole] = useState("user");
	const [inviting, setInviting] = useState(false);
	const [inviteError, setInviteError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			setUsers(await adminApi.getUsers());
		} catch (err) {
			setError(err instanceof AdminApiError ? err.message : "Could not load users");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const filtered = users.filter(
		(u) =>
			u.name.toLowerCase().includes(query.toLowerCase()) ||
			u.email.toLowerCase().includes(query.toLowerCase()),
	);

	const openInvite = () => {
		setInviteEmail("");
		setInviteName("");
		setInviteRole("user");
		setInviteError(null);
		setInviteOpen(true);
	};

	const submitInvite = async () => {
		setInviting(true);
		setInviteError(null);
		try {
			const created = await adminApi.inviteUser({ email: inviteEmail, name: inviteName, role: inviteRole });
			setInviteOpen(false);
			toast({ title: "Invitation created", description: `${created.email} is now 'invited'.`, tone: "success" });
			await load();
		} catch (err) {
			setInviteError(err instanceof AdminApiError ? err.message : "Could not invite user");
		} finally {
			setInviting(false);
		}
	};

	const updateStatus = async (user: AdminUser, status: "active" | "suspended") => {
		try {
			const updated = await adminApi.updateUser(user.id, { status });
			setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
			toast({
				title: status === "suspended" ? "User suspended" : "User reactivated",
				description: user.email,
				tone: status === "suspended" ? "warning" : "success",
			});
		} catch (err) {
			toast({ title: "Update failed", description: err instanceof AdminApiError ? err.message : "Unknown error", tone: "danger" });
		}
	};

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
					<Button onClick={openInvite} disabled={loading}>
						<Icon name="user-plus" size={16} />
						Invite user
					</Button>
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
					{!loading && (
						<span className="fs-xs text-muted">Showing {filtered.length} of {users.length}</span>
					)}
				</div>

				{error && (
					<Alert tone="danger" title="Could not load users" className="mb-md">
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
									<Skeleton variant="circle" width={32} height={32} />
									<div className="flex-1">
										<Skeleton variant="text" width="40%" className="mb-xs" />
										<Skeleton variant="text" width="25%" />
									</div>
									<Skeleton variant="rect" width={72} height={24} />
								</div>
							))}
						</div>
					</Card>
				)}

				{!loading && !error && (
					<Card variant="outlined" className="overflow-x-auto">
						<Table<AdminUser>
							columns={[
								{
									key: "user",
									header: "User",
									render: (u) => (
										<div className="d-flex items-center gap-sm">
											<Avatar name={u.name} size="sm" />
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
									key: "createdAt",
									header: "Created",
									render: (u) => (
										<span className="fs-xs">{new Date(u.createdAt * 1000).toLocaleDateString()}</span>
									),
								},
								{
									key: "actions",
									header: "",
									align: "end",
									render: (u) =>
										u.status === "suspended" ? (
											<Button variant="ghost" size="sm" onClick={() => void updateStatus(u, "active")}>
												Reactivate
											</Button>
										) : u.status === "active" ? (
											<Button variant="ghost" size="sm" onClick={() => void updateStatus(u, "suspended")}>
												Suspend
											</Button>
										) : null,
								},
							]}
							rows={filtered}
							rowKey={(u) => u.email}
							empty={
								<EmptyState title="No users match" description={`No users match "${query}".`} />
							}
						/>
					</Card>
				)}

				<Dialog
					open={inviteOpen}
					onClose={() => setInviteOpen(false)}
					title="Invite user"
					description="The account starts as 'invited' until the user registers with this email."
					size="sm"
					footer={
						<div className="d-flex items-center justify-between gap-sm">
							{inviteError && <span className="fs-sm text-danger">{inviteError}</span>}
							<div className="d-flex items-center gap-sm">
								<Button variant="ghost" onClick={() => setInviteOpen(false)} disabled={inviting}>
									Cancel
								</Button>
								<Button onClick={() => void submitInvite()} disabled={inviting || !inviteEmail.trim() || !inviteName.trim()}>
									{inviting ? "Inviting…" : "Invite"}
								</Button>
							</div>
						</div>
					}
				>
					<div className="d-flex flex-col" style={{ gap: "var(--se-space-4)" }}>
						<Field label="Email" htmlFor="inviteEmail">
							<Input
								id="inviteEmail"
								type="email"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
								placeholder="you@example.com"
							/>
						</Field>
						<Field label="Name" htmlFor="inviteName">
							<Input
								id="inviteName"
								value={inviteName}
								onChange={(e) => setInviteName(e.target.value)}
								placeholder="Jane Doe"
							/>
						</Field>
						<Field label="Role" htmlFor="inviteRole">
							<Select
								id="inviteRole"
								value={inviteRole}
								onChange={(e) => setInviteRole(e.target.value)}
								options={INVITE_ROLES}
							/>
						</Field>
					</div>
				</Dialog>
			</div>
		</section>
	);
}