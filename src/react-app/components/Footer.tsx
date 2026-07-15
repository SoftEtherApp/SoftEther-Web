/* ════════════════════════════════════
   Shared Footer
   ════════════════════════════════════ */

import Icon from "./Icon";
import { LIBRARY_REPO_URL } from "./Header";
import "./Footer.css";

export default function Footer() {
	return (
		<footer className="footer">
			<div className="footer-inner">
				<div className="footer-brand">
					<img src="/logo.png" alt="" width={24} height={24} />
					<span>SoftEther App</span>
				</div>
				<p className="footer-copy">
					Copyright &copy; {new Date().getFullYear()} <a href="https://devstroop.com" target="_blank" rel="noopener noreferrer">
						<strong>Devstroop</strong>
					</a>. Built with
					open-source <strong>SoftEtherZig</strong> library.
				</p>
				<div className="footer-links">
					<a
						href={LIBRARY_REPO_URL}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon name="github" size={18} />
					</a>
					<a href="https://softether.app" target="_blank" rel="noopener noreferrer">
						SoftEther.app
					</a>
					<a href="/library">Library</a>
				</div>
			</div>
			<p className="footer-legal">
				SoftEther App is a third-party implementation based on SoftEther VPN source code.
				We do not have any affiliation with SoftEther Corporation or its developers.
			</p>
		</footer>
	);
}
