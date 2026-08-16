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
