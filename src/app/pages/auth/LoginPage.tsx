/* ════════════════════════════════════
   Login — auth entry point
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import Icon from "../../components/Icon";
import { navigate } from "../../App";

export default function LoginPage(): JSX.Element {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	};

	return (
		<div>
			<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Welcome back</h1>
			<p className="m-0 mb-xl text-muted fs-sm">Sign in to your account.</p>
			<form onSubmit={handleSubmit} noValidate className="d-flex flex-col gap-md">
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
					<div className="d-flex items-center justify-between mb-xs">
						<label className="label m-0" htmlFor="password">Password</label>
						<a
							href="/forgot-password"
							className="fs-xs text-secondary"
							onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}
						>
							Forgot password?
						</a>
					</div>
					<div className="pos-relative">
						<input
							id="password"
							type={showPassword ? "text" : "password"}
							className="input pr-xl"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="current-password"
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
					Sign in
				</button>
			</form>
			<div className="d-flex items-center gap-md my-lg text-muted fs-xs">
				<span className="flex-grow-1 bordered-t" />
				<span>or</span>
				<span className="flex-grow-1 bordered-t" />
			</div>
			<a
				href="/register"
				className="btn btn-secondary w-100 justify-center"
				onClick={(e) => { e.preventDefault(); navigate("/register"); }}
			>
				Create an account
			</a>
		</div>
	);
}
