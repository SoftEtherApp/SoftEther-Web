/* ════════════════════════════════════
   Register — new account.
   Demo mode: creates a local session (no backend yet).
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import Icon from "../../components/Icon";
import { navigate } from "../../App";
import { useAuth } from "../../auth/useAuth";

export default function RegisterPage(): JSX.Element {
	const { signIn } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		signIn({ id: btoa(email.toLowerCase()), name: name || "Admin", email });
		navigate("/admin");
	};

	return (
		<div>
			<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Create account</h1>
			<p className="m-0 mb-xl text-muted fs-sm">Create your new account.</p>
			<form onSubmit={handleSubmit} noValidate className="d-flex flex-col gap-md">
				<div>
					<label className="label" htmlFor="name">Display name</label>
					<input
						id="name"
						type="text"
						className="input"
						placeholder="Jane Doe"
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoComplete="name"
					/>
				</div>
				<div>
					<label className="label" htmlFor="email">Email</label>
					<input
						id="email"
						type="email"
						className="input"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
					/>
				</div>
				<div>
					<label className="label" htmlFor="password">Password</label>
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
					<label className="label" htmlFor="confirm">Confirm password</label>
					<div className="pos-relative">
						<input
							id="confirm"
							type={showPassword ? "text" : "password"}
							className="input pr-xl"
							placeholder="Repeat your password"
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
					Create account
				</button>
			</form>
			<p className="m-0 mt-lg text-center text-muted fs-xs">
				Demo mode — creates a local session with no backend.
			</p>
			<p className="m-0 mt-sm text-center text-muted fs-sm">
				Already have an account?{" "}
				<a
					href="/login"
					className="text-secondary"
					onClick={(e) => { e.preventDefault(); navigate("/login"); }}
				>
					Sign in
				</a>
			</p>
		</div>
	);
}
