import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/* ════════════════════════════════════
   D1 schema — managed with Drizzle Kit.
   Migrations live in ./drizzle and are
   applied via `wrangler d1 migrations
   apply softether-app [--local|--remote]`.
   ════════════════════════════════════ */

export const releases = sqliteTable(
	"releases",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		tag: text("tag").notNull().unique(),
		version: text("version").notNull(),
		publishedAt: text("published_at").notNull(),
		body: text("body").notNull().default(""),
		createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
	},
	(t) => [index("releases_tag_idx").on(t.tag)],
);

export const releaseAssets = sqliteTable(
	"release_assets",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		releaseId: integer("release_id")
			.notNull()
			.references(() => releases.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		platform: text("platform").notNull(),
		size: integer("size").notNull(),
		r2Key: text("r2_key").notNull(),
	},
	(t) => [index("release_assets_release_idx").on(t.releaseId)],
);

export const users = sqliteTable(
	"users",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		email: text("email").notNull().unique(),
		name: text("name").notNull(),
		role: text("role").notNull().default("user"),
		status: text("status").notNull().default("active"),
		createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
	},
	(t) => [index("users_role_idx").on(t.role)],
);

export const roles = sqliteTable("roles", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	key: text("key").notNull().unique(),
	name: text("name").notNull(),
	description: text("description").notNull().default(""),
});

export const permissions = sqliteTable("permissions", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	key: text("key").notNull().unique(),
	name: text("name").notNull(),
	description: text("description").notNull().default(""),
});

export const rolePermissions = sqliteTable(
	"role_permissions",
	{
		roleId: integer("role_id")
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
		permissionId: integer("permission_id")
			.notNull()
			.references(() => permissions.id, { onDelete: "cascade" }),
	},
	(t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export const featureFlags = sqliteTable("feature_flags", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	key: text("key").notNull().unique(),
	name: text("name").notNull(),
	description: text("description").notNull().default(""),
	enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
	updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
});

export const activityLog = sqliteTable(
	"activity_log",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		actor: text("actor").notNull(),
		action: text("action").notNull(),
		detail: text("detail").notNull().default(""),
		createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
	},
	(t) => [index("activity_created_idx").on(t.createdAt)],
);

export const emailTokens = sqliteTable(
	"email_tokens",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		/** 'verify_email' | 'reset_password' — kind column is not constrained to
		 *  keep the migration simple; tokens.ts validates values. */
		kind: text("kind").notNull(),
		/** SHA-256 hex of the raw token — plaintext is never stored. */
		tokenHash: text("token_hash").notNull(),
		/** Unix seconds; 1h by default. */
		expiresAt: integer("expires_at").notNull(),
		/** Set on first successful verify — enforces single-use atomically. */
		usedAt: integer("used_at"),
		createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
	},
	(t) => [
		index("email_tokens_user_idx").on(t.userId),
		index("email_tokens_kind_idx").on(t.kind),
		index("email_tokens_expires_idx").on(t.expiresAt),
	],
);
