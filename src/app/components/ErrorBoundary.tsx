/* ════════════════════════════════════
   Error boundary with fallback UI
   ════════════════════════════════════ */

import { Component, type ErrorInfo, type ReactNode } from "react";
import "./ErrorBoundary.css";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("ErrorBoundary caught:", error, info.componentStack);
	}

	render() {
		if (!this.state.hasError) return this.props.children;

		return (
			<div className="error-fallback">
				<div className="error-fallback-icon">!</div>
				<h2 className="error-fallback-title">Something went wrong</h2>
				<p className="error-fallback-desc">
					An unexpected error occurred. Please try refreshing the page.
				</p>
				<button
					className="btn btn-primary"
					onClick={() => {
						this.setState({ hasError: false, error: null });
						window.location.reload();
					}}
				>
					Refresh Page
				</button>
			</div>
		);
	}
}
