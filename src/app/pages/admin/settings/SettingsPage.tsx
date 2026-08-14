/* ════════════════════════════════════
   Settings — admin settings (local state only until the admin API is wired)
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
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
					<div className="admin-card">
						<h2 className="admin-card-title text-primary">General</h2>
						<p className="admin-card-desc">Branding shown on the public site.</p>
						<div className="d-grid gap-md" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
							<div>
								<label className="label" htmlFor="siteName">Site name</label>
								<input id="siteName" className="input" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
							</div>
							<div>
								<label className="label" htmlFor="siteUrl">Site URL</label>
								<input id="siteUrl" className="input" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
							</div>
							<div>
								<label className="label" htmlFor="defaultTheme">Default theme</label>
								<select id="defaultTheme" className="input" value={defaultTheme} onChange={(e) => setDefaultTheme(e.target.value)}>
									<option value="dark">Dark</option>
									<option value="light">Light</option>
								</select>
							</div>
						</div>
					</div>

					<div className="admin-card">
						<h2 className="admin-card-title text-primary">Security</h2>
						<p className="admin-card-desc">Session and account policies.</p>
						<div className="d-flex flex-col gap-md">
							<div className="d-flex items-center gap-md flex-wrap">
								<div className="mw-420 flex-1">
									<label className="label" htmlFor="sessionTimeout">Session timeout (hours)</label>
									<input id="sessionTimeout" className="input" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} />
								</div>
								<div className="d-flex items-center gap-md" style={{ paddingTop: 22 }}>
									<label className="switch">
										<input type="checkbox" checked={enforce2fa} onChange={(e) => setEnforce2fa(e.target.checked)} />
										<span className="switch-slider" />
									</label>
									<span className="fs-sm text-secondary">Enforce 2FA for admins</span>
								</div>
							</div>
							<div className="d-flex items-center gap-md">
								<label className="switch">
									<input type="checkbox" checked={publicSignup} onChange={(e) => setPublicSignup(e.target.checked)} />
									<span className="switch-slider" />
								</label>
								<span className="fs-sm text-secondary">Allow public account creation</span>
							</div>
						</div>
					</div>

					<div className="admin-card">
						<h2 className="admin-card-title text-primary">API</h2>
						<p className="admin-card-desc">Endpoints consumed by the client and release pipeline.</p>
						<div className="admin-empty m-0">
							<Icon name="key" size={16} />
							<span>API tokens and webhook secrets will live here once the backend is connected.</span>
						</div>
					</div>

					<div className="d-flex items-center gap-md">
						<button type="submit" className="btn btn-primary">
							<Icon name="check" size={16} />
							Save changes
						</button>
						{saved && <span className="fs-sm text-muted">Saved (local only — not persisted).</span>}
					</div>
				</form>
			</div>
		</section>
	);
}
