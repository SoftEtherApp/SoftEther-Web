/* ════════════════════════════════════
   Profile — signed-in account page for regular users.
   Shows account details and links to scoped areas the user
   is allowed to reach (Admin panel for admins).
   ════════════════════════════════════ */

import { type JSX } from "react";
import { Avatar, Badge, Button, Card } from "@devstroop/react-ui";
import Icon from "../components/Icon";
import { navigate } from "../App";
import { useAuth } from "../auth/useAuth";

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
					<Avatar name={user.name} size="lg" />
					<div>
						<h1 className="m-0 fs-lg fw-700 text-primary">Your account</h1>
						<p className="m-0 text-muted fs-sm">{user.email}</p>
					</div>
				</div>

				<Card variant="outlined" className="mb-lg" header={<div className="fw-700 fs-base">Profile</div>}>
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
								<Badge tone={user.role === "admin" ? "primary" : "neutral"}>
									{user.role}
								</Badge>
							</dd>
						</div>
						<div className="d-flex justify-between gap-md">
							<dt className="text-muted m-0">Member since</dt>
							<dd className="m-0">{memberSince}</dd>
						</div>
					</dl>
				</Card>

				<Card variant="outlined" header={<div className="fw-700 fs-base">Access</div>}>
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
								className="text-none"
								onClick={(e) => { e.preventDefault(); navigate("/admin"); }}
							>
								<Button>
									<Icon name="dashboard" size={16} />
									Admin panel
								</Button>
							</a>
						)}
						<Button variant="secondary" onClick={() => { signOut(); navigate("/"); }}>
							<Icon name="log-out" size={16} />
							Sign out
						</Button>
					</div>
				</Card>
			</div>
		</section>
	);
}
