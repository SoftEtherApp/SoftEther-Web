/* ════════════════════════════════════
   Shared Footer
   ════════════════════════════════════ */

import Icon from "./Icon";
import { LIBRARY_REPO_URL } from "./Header";

export default function Footer() {
	return (
		<footer className="footer">
			<div className="footer-inner">
				<div className="footer-brand">
					<img src="/logo.png" alt="" width={24} height={24} />
					<span>SoftEther App</span>
				</div>
				<p className="footer-copy">
					Copyright &copy; {new Date().getFullYear()} Devstroop. Built with
					open-source SoftEtherZig library.
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
		</footer>
	);
}
