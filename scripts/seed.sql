-- Baseline seed data for the SoftEther App D1 database.
-- Apply with: wrangler d1 execute softether-app --local --file=scripts/seed.sql
--              (omit --local for the remote database)

INSERT OR IGNORE INTO roles (id, `key`, name, description) VALUES
	(1, 'admin', 'Administrator', 'Full access to every area of the admin panel.'),
	(2, 'operator', 'Operator', 'Can manage releases, users, and subscriptions.'),
	(3, 'viewer', 'Viewer', 'Read-only access to the admin panel.');

INSERT OR IGNORE INTO permissions (id, `key`, name, description) VALUES
	(1, 'releases.read', 'View releases', 'See published releases and assets.'),
	(2, 'releases.write', 'Publish releases', 'Create and edit releases.'),
	(3, 'users.read', 'View users', 'See user accounts and profiles.'),
	(4, 'users.write', 'Manage users', 'Create, suspend, and edit users.'),
	(5, 'roles.write', 'Manage roles', 'Create and edit roles and permissions.'),
	(6, 'subscriptions.write', 'Manage subscriptions', 'Issue, cancel, and edit subscriptions.'),
	(7, 'billing.read', 'View billing', 'See plans, invoices, and revenue.'),
	(8, 'settings.write', 'Edit settings', 'Change platform settings and feature flags.');

INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
	(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
	(2, 1), (2, 2), (2, 3), (2, 6), (2, 7),
	(3, 1), (3, 3), (3, 7);

INSERT OR IGNORE INTO plans (id, name, `key`, price_monthly, price_yearly, active, sort_order) VALUES
	(1, 'Free', 'free', 0, 0, 1, 0),
	(2, 'Pro', 'pro', 1200, 11520, 1, 1),
	(3, 'Enterprise', 'enterprise', 4200, 40320, 1, 2);

INSERT OR IGNORE INTO users (id, email, name, role, status, created_at) VALUES
	(1, 'admin@softether.app', 'Akash Shah', 'admin', 'active', unixepoch('now', '-200 days')),
	(2, 'maya@softether.app', 'Maya Patel', 'operator', 'active', unixepoch('now', '-150 days')),
	(3, 'leo@softether.app', 'Leo Fernandes', 'viewer', 'active', unixepoch('now', '-90 days')),
	(4, 'sara@softether.app', 'Sara Ali', 'user', 'active', unixepoch('now', '-45 days')),
	(5, 'jordan@softether.app', 'Jordan Kim', 'user', 'suspended', unixepoch('now', '-12 days'));

INSERT OR IGNORE INTO subscriptions (id, user_id, plan_id, status, renews_at, created_at) VALUES
	(1, 1, 3, 'active', unixepoch('now', '+30 days'), unixepoch('now', '-200 days')),
	(2, 2, 2, 'active', unixepoch('now', '+15 days'), unixepoch('now', '-150 days')),
	(3, 3, 1, 'active', NULL, unixepoch('now', '-90 days')),
	(4, 4, 2, 'active', unixepoch('now', '+22 days'), unixepoch('now', '-45 days')),
	(5, 5, 2, 'past_due', unixepoch('now', '-2 days'), unixepoch('now', '-12 days'));

INSERT OR IGNORE INTO feature_flags (id, `key`, name, description, enabled, updated_at) VALUES
	(1, 'beta.downloads', 'Beta channel downloads', 'Expose pre-release builds on the download page.', 0, unixepoch()),
	(2, 'auto-updates', 'Auto-update notifications', 'Notify clients when a new version is available.', 1, unixepoch()),
	(3, 'teams', 'Team workspaces', 'Allow multi-user team workspaces.', 0, unixepoch()),
	(4, 'analytics.export', 'Analytics export', 'Allow CSV export of analytics data.', 1, unixepoch());

INSERT OR IGNORE INTO activity_log (id, actor, action, detail, created_at) VALUES
	(1, 'admin@softether.app', 'sign_in', 'Signed in from dashboard', unixepoch('now', '-3 hours')),
	(2, 'operator@softether.app', 'release.published', 'Published v2.4.1', unixepoch('now', '-2 days')),
	(3, 'admin@softether.app', 'user.suspended', 'Suspended jordan@softether.app', unixepoch('now', '-5 days')),
	(4, 'system', 'plan.updated', 'Adjusted Pro yearly pricing', unixepoch('now', '-9 days')),
	(5, 'admin@softether.app', 'settings.updated', 'Enabled auto-update notifications', unixepoch('now', '-12 days'));
