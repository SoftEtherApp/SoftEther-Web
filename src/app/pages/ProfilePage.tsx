/* ════════════════════════════════════
   Profile — signed-in account page for regular users.
   Shows account details and links to scoped areas the user
   is allowed to reach (Admin panel for admins).
   ════════════════════════════════════ */

import { type JSX } from "react";
import Icon from "../components/Icon";
import { navigate } from "../App";
import { useAuth } from "../auth/useAuth";

function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]!.toUpperCase())
		.join("");
}

export default function ProfilePage(): JSX.Element | null {
	const { user, session, signOut } = useAuth();
	if (!user || !session) return null;

	const memberSince = new Date(session.createdAt).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<section className="py-2xl px-lg sm:py-2xl sm:px-md">
			<div className="m-auto mw-1040">
				<div className="d-flex items-center gap-md mb-lg">
					<span className="admin-avatar" aria-hidden="true">{initials(user.name)}</span>
					<div>
						<h1 className="m-0 fs-lg fw-700 text-primary">Your account</h1>
						<p className="m-0 text-muted fs-sm">{user.email}</p>
					</div>
				</div>

				<div className="admin-card p-lg mb-lg">
					<h2 className="m-0 mb-md fs-base fw-600">Profile</h2>
					<dl className="m-0 d-flex flex-col gap-sm fs-sm">
						<div className="d-flex justify-between gap-md">
							<dt className="text-muted m-0">Name</dt>
							<dd className="m-0">{user.name}</dd>
						</div>
						<div className="d-flex justify-between gap-md">
							<dt className="text-muted m-0">Email</dt>
							<dd className="m-0">{user.email}</dd>
						</div>
						<div className="d-flex justify-between gap-md">
							<dt className="text-muted m-0">Role</dt>
							<dd className="m-0">
								<span className={`badge ${user.role === "admin" ? "badge--info" : "badge--muted"}`}>
									{user.role}
								</span>
							</dd>
						</div>
						<div className="d-flex justify-between gap-md">
							<dt className="text-muted m-0">Member since</dt>
							<dd className="m-0">{memberSince}</dd>
						</div>
					</dl>
				</div>

				<div className="admin-card p-lg">
					<h2 className="m-0 mb-md fs-base fw-600">Access</h2>
					{user.role === "admin" ? (
						<p className="m-0 mb-md text-muted fs-sm">
							You have administrator access. Manage releases, users, and settings from the admin panel.
						</p>
					) : (
						<p className="m-0 mb-md text-muted fs-sm">
							You're signed in as a regular member. Admin areas are restricted to administrators.
						</p>
					)}
					<div className="d-flex gap-md flex-wrap">
						{user.role === "admin" && (
							<a
								href="/admin"
								className="btn btn-primary"
								onClick={(e) => { e.preventDefault(); navigate("/admin"); }}
							>
								<Icon name="dashboard" size={16} />
								Admin panel
							</a>
						)}
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => { signOut(); navigate("/"); }}
						>
							<Icon name="log-out" size={16} />
							Sign out
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
