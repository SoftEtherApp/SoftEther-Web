/* ════════════════════════════════════
   Login — auth entry point.
   Demo mode: any email/password signs in locally (no backend yet).
   ════════════════════════════════════ */

import { useState, type FormEvent, type JSX } from "react";
import { Button, Field, Input } from "@devstroop/react-ui";
import Icon from "../../components/Icon";
import { navigate } from "../../App";
import { useAuth } from "../../auth/useAuth";
import { consumeAuthNext } from "../../auth/auth-next";
import { roleForEmail } from "../../auth/session";

export default function LoginPage(): JSX.Element {
	const { signIn } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const role = roleForEmail(email);
		const name = email.split("@")[0] || "Admin";
		signIn({ id: btoa(email.toLowerCase()), name, email, role });
		navigate(consumeAuthNext() ?? (role === "admin" ? "/admin" : "/profile"));
	};

	return (
		<div>
			<h1 className="m-0 mb-sm fs-lg fw-700 text-primary">Welcome back</h1>
			<p className="m-0 mb-xl text-muted fs-sm">Sign in to your account.</p>
			<form onSubmit={handleSubmit} noValidate className="d-flex flex-col gap-md">
				<Field label="Email" htmlFor="email">
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
					/>
				</Field>
				<Field
					label={
						<span className="d-flex items-center justify-between">
							Password
							<a
								href="/forgot-password"
								className="fs-xs text-secondary"
								onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}
							>
								Forgot password?
							</a>
						</span>
					}
					htmlFor="password"
				>
					<div className="pos-relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							className="pr-xl"
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
				</Field>
				<Button type="submit" fullWidth>
					Sign in
				</Button>
			</form>
			<div className="d-flex items-center gap-md my-lg text-muted fs-xs">
				<span className="flex-grow-1 bordered-t" />
				<span>or</span>
				<span className="flex-grow-1 bordered-t" />
			</div>
			<a
				href="/register"
				className="text-none"
				onClick={(e) => { e.preventDefault(); navigate("/register"); }}
			>
				<Button variant="secondary" fullWidth>
					Create an account
				</Button>
			</a>
			<p className="m-0 mt-lg text-center text-muted fs-xs">
				Demo mode — any email and password signs you in locally. Use{" "}
				<span className="text-secondary">admin@softether.app</span> for admin access.
			</p>
		</div>
	);
}
