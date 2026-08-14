/* ════════════════════════════════════
   ResetPassword — set a new password from a reset link.
   Demo mode: shows a success state (nothing is persisted).
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import Icon from "../../components/Icon";
import { navigate } from "../../App";

export default function ResetPasswordPage(): JSX.Element {
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitted(true);
	};

	if (submitted) {
		return (
			<div>
				<div className="d-flex items-center gap-sm mb-sm">
					<div className="stat-card-icon">
						<Icon name="check" size={18} />
					</div>
					<h1 className="m-0 fs-lg fw-700 text-primary">Password updated</h1>
				</div>
				<p className="m-0 mb-xl text-muted fs-sm">
					Your password has been changed. You can sign in with it now.
				</p>
				<a
					href="/login"
					className="btn btn-primary w-100 justify-center"
					onClick={(e) => { e.preventDefault(); navigate("/login"); }}
				>
					Sign in
				</a>
				<p className="m-0 mt-lg text-center text-muted fs-xs">
					Demo mode — nothing is persisted yet.
				</p>
			</div>
		);
	}

	return (
		<div>
			<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Set new password</h1>
			<p className="m-0 mb-xl text-muted fs-sm">
				Choose a strong new password for your account.
			</p>
			<form onSubmit={handleSubmit} noValidate className="d-flex flex-col gap-md">
				<div>
					<label className="label" htmlFor="password">New password</label>
					<div className="pos-relative">
						<input
							id="password"
							type={showPassword ? "text" : "password"}
							className="input pr-xl"
							placeholder="At least 8 characters"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="new-password"
						/>
						<button
							type="button"
							className="password-toggle"
							onClick={() => setShowPassword(!showPassword)}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							<Icon name={showPassword ? "eye-off" : "eye"} size={18} />
						</button>
					</div>
				</div>
				<div>
					<label className="label" htmlFor="confirm">Confirm new password</label>
					<div className="pos-relative">
						<input
							id="confirm"
							type={showPassword ? "text" : "password"}
							className="input pr-xl"
							placeholder="Repeat your new password"
							value={confirm}
							onChange={(e) => setConfirm(e.target.value)}
							autoComplete="new-password"
						/>
						<button
							type="button"
							className="password-toggle"
							onClick={() => setShowPassword(!showPassword)}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							<Icon name={showPassword ? "eye-off" : "eye"} size={18} />
						</button>
					</div>
				</div>
				<button type="submit" className="btn btn-primary w-100 justify-center">
					Update password
				</button>
			</form>
			<p className="m-0 mt-lg text-center text-muted fs-sm">
				Remembered it?{" "}
				<a
					href="/login"
					className="text-secondary"
					onClick={(e) => { e.preventDefault(); navigate("/login"); }}
				>
					Back to sign in
				</a>
			</p>
		</div>
	);
}
