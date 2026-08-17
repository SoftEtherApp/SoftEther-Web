/* ════════════════════════════════════
   Settings — admin settings (local state only until the admin API is wired)
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import { Button, Card, Field, Input, Select, Switch } from "@devstroop/react-ui";
import Icon from "../../../components/Icon";

export default function SettingsPage(): JSX.Element {
	const [siteName, setSiteName] = useState("SoftEther App");
	const [siteUrl, setSiteUrl] = useState("https://softether.app");
	const [defaultTheme, setDefaultTheme] = useState("dark");
	const [sessionTimeout, setSessionTimeout] = useState("24");
	const [enforce2fa, setEnforce2fa] = useState(false);
	const [publicSignup, setPublicSignup] = useState(true);
	const [saved, setSaved] = useState(false);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSaved(true);
		setTimeout(() => setSaved(false), 3000);
	};

	return (
		<section>
			<div>
				<div className="mb-md">
					<h1 className="m-0 fs-lg fw-700 text-primary">Settings</h1>
					<p className="m-0 mt-xs fs-sm text-muted">
						Site-wide configuration. Changes are local to this session until the API is wired.
					</p>
				</div>

				<form onSubmit={handleSubmit} noValidate>
					<Card
						variant="outlined"
						header={
							<div>
								<div className="fw-700 fs-md text-primary">General</div>
								<p className="fs-sm text-muted m-0">Branding shown on the public site.</p>
							</div>
						}
					>
						<div className="d-grid gap-md" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
							<Field label="Site name" htmlFor="siteName">
								<Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
							</Field>
							<Field label="Site URL" htmlFor="siteUrl">
								<Input id="siteUrl" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
							</Field>
							<Field label="Default theme" htmlFor="defaultTheme">
								<Select
									id="defaultTheme"
									value={defaultTheme}
									onChange={(e) => setDefaultTheme(e.target.value)}
									options={[
										{ value: "dark", label: "Dark" },
										{ value: "light", label: "Light" },
									]}
								/>
							</Field>
						</div>
					</Card>

					<Card
						variant="outlined"
						header={
							<div>
								<div className="fw-700 fs-md text-primary">Security</div>
								<p className="fs-sm text-muted m-0">Session and account policies.</p>
							</div>
						}
					>
						<div className="d-flex flex-col gap-md">
							<div className="d-flex items-center gap-md flex-wrap">
								<div className="mw-420 flex-1">
									<Field label="Session timeout (hours)" htmlFor="sessionTimeout">
										<Input id="sessionTimeout" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} />
									</Field>
								</div>
								<label className="d-flex items-center gap-md" style={{ paddingTop: 22 }}>
									<Switch checked={enforce2fa} onChange={(e) => setEnforce2fa(e.target.checked)} />
									<span className="fs-sm text-secondary">Enforce 2FA for admins</span>
								</label>
							</div>
							<label className="d-flex items-center gap-md">
								<Switch checked={publicSignup} onChange={(e) => setPublicSignup(e.target.checked)} />
								<span className="fs-sm text-secondary">Allow public account creation</span>
							</label>
						</div>
					</Card>

					<Card
						variant="outlined"
						header={
							<div>
								<div className="fw-700 fs-md text-primary">API</div>
								<p className="fs-sm text-muted m-0">Endpoints consumed by the client and release pipeline.</p>
							</div>
						}
					>
						<div className="admin-empty m-0">
							<Icon name="key" size={16} />
							<span>API tokens and webhook secrets will live here once the backend is connected.</span>
						</div>
					</Card>

					<div className="d-flex items-center gap-md">
						<Button type="submit">
							<Icon name="check" size={16} />
							Save changes
						</Button>
						{saved && <span className="fs-sm text-muted">Saved (local only — not persisted).</span>}
					</div>
				</form>
			</div>
		</section>
	);
}
