/* ════════════════════════════════════
   Not Found — unknown SPA routes
   ════════════════════════════════════ */

import { type JSX } from "react";
import Icon from "../components/Icon";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function NotFoundPage(): JSX.Element {
	return (
		<>
			<Header />
			<a href="#main-content" className="skip-link">Skip to content</a>
			<main id="main-content">
				<section className="section">
					<div className="section-inner section-inner--center">
						<div className="trust-icon" aria-hidden="true">
							<Icon name="x-circle" size={28} />
						</div>
						<h1 className="section-title">Page not found</h1>
						<p className="section-desc">
							This address does not exist on softether.app. If you followed a
							link here, the page may have moved.
						</p>
						<div className="hero-actions hero-actions--top">
							<a href="/" className="btn btn-primary">
								<Icon name="arrow-left" size={18} />
								Back to Home
							</a>
							<a href="/library" className="btn btn-secondary">
								SoftEtherZig Library
							</a>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
