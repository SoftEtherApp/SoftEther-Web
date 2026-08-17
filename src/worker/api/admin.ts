/* ════════════════════════════════════
   Admin API — read endpoints (epic #16) + write
   endpoints (epic #16, #27).

   All routes live behind the bearer guard mounted in
   index.ts (ADMIN_API_TOKEN, fail closed). Writes log
   every mutation to activity_log so the dashboard feed
   stays honest without extra plumbing.

   Invite semantics: creating a user answers 201 and sets
   status 'invited' (no password hash yet). Emailing an
   invitation is out of scope here — the account activates
   when the user registers with the same email.
   ════════════════════════════════════ */

import { count, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";

import { getDb, type Db } from "../db/client";
import * as schema from "../db/schema";
import { normalizeEmail, normalizeName } from "../auth/validate";
import {
	parseEnabled,
	parseRole,
	parseUserStatus,
	DEFAULT_INVITE_ROLE,
	type UserStatus,
} from "../admin/validate";
import type { AppEnv } from "../env";

export const adminRoutes = new Hono<{ Bindings: AppEnv }>();

/** Record a mutation in activity_log (actor is the service token — there is
 *  no per-user session behind the bearer guard yet). */
function logActivity(db: Db, action: string, detail: string): Promise<void> {
	return db
		.insert(schema.activityLog)
		.values({ actor: "admin", action, detail })
		.then(() => undefined);
}

/* ── Read ── */

adminRoutes.get("/stats", async (c) => {
	try {
		const db = getDb(c.env.DB);
		const [users, releases, flags] = await Promise.all([
			db.select({ value: count() }).from(schema.users),
			db.select({ value: count() }).from(schema.releases),
			db.select({ value: count() }).from(schema.featureFlags),
		]);
		return c.json({
			users: users[0].value,
			releases: releases[0].value,
			featureFlags: flags[0].value,
		});
	} catch (err) {
		console.error("Error fetching admin stats:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

adminRoutes.get("/users", async (c) => {
	try {
		const db = getDb(c.env.DB);
		const rows = await db
			.select({
				id: schema.users.id,
				email: schema.users.email,
				name: schema.users.name,
				role: schema.users.role,
				status: schema.users.status,
				createdAt: schema.users.createdAt,
			})
			.from(schema.users)
			.orderBy(desc(schema.users.createdAt));
		return c.json(rows);
	} catch (err) {
		console.error("Error fetching admin users:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

adminRoutes.get("/roles", async (c) => {
	try {
		const db = getDb(c.env.DB);
		const rows = await db.select().from(schema.roles).orderBy(schema.roles.id);
		return c.json(rows);
	} catch (err) {
		console.error("Error fetching admin roles:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

adminRoutes.get("/permissions", async (c) => {
	try {
		const db = getDb(c.env.DB);
		const rows = await db.select().from(schema.permissions).orderBy(schema.permissions.id);
		return c.json(rows);
	} catch (err) {
		console.error("Error fetching admin permissions:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

adminRoutes.get("/features", async (c) => {
	try {
		const db = getDb(c.env.DB);
		const rows = await db.select().from(schema.featureFlags).orderBy(schema.featureFlags.id);
		return c.json(rows);
	} catch (err) {
		console.error("Error fetching admin features:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

adminRoutes.get("/activity", async (c) => {
	try {
		const db = getDb(c.env.DB);
		const rows = await db
			.select()
			.from(schema.activityLog)
			.orderBy(desc(schema.activityLog.createdAt))
			.limit(50);
		return c.json(rows);
	} catch (err) {
		console.error("Error fetching admin activity:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

/* ── Write: invite user ── */

adminRoutes.post("/users", async (c) => {
	try {
		const body = await c.req.json<Record<string, unknown>>().catch(() => null);
		if (!body || typeof body !== "object") {
			return c.json({ error: "Invalid request body" }, 400);
		}
		const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
		if (!email) return c.json({ error: "Invalid email" }, 400);
		const name = normalizeName(typeof body.name === "string" ? body.name : "");
		if (!name) return c.json({ error: "Invalid name" }, 400);
		const role = parseRole(body.role, DEFAULT_INVITE_ROLE);
		if (role === null) return c.json({ error: `Role must be at most ${32} characters` }, 400);

		const db = getDb(c.env.DB);
		const existing = await db
			.select({ id: schema.users.id })
			.from(schema.users)
			.where(eq(schema.users.email, email));
		if (existing.length > 0) {
			return c.json({ error: "Email is already registered" }, 409);
		}

		const inserted = await db
			.insert(schema.users)
			.values({ email, name, role, status: "invited" })
			.returning({
				id: schema.users.id,
				email: schema.users.email,
				name: schema.users.name,
				role: schema.users.role,
				status: schema.users.status,
				createdAt: schema.users.createdAt,
			});
		await logActivity(db, "users.invite", email);
		return c.json(inserted[0], 201);
	} catch (err) {
		console.error("Error inviting user:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

/* ── Write: update user (status / role) ── */

adminRoutes.patch("/users/:id", async (c) => {
	try {
		const id = Number.parseInt(c.req.param("id"), 10);
		if (!Number.isInteger(id) || id <= 0) {
			return c.json({ error: "Invalid user id" }, 400);
		}
		const body = await c.req.json<Record<string, unknown>>().catch(() => null);
		if (!body || typeof body !== "object") {
			return c.json({ error: "Invalid request body" }, 400);
		}

		let status: UserStatus | null = null;
		let role: string | null = null;
		let changed = false;

		if (body.status !== undefined) {
			status = parseUserStatus(body.status);
			if (status === null) return c.json({ error: "Invalid status" }, 400);
			changed = true;
		}
		if (body.role !== undefined) {
			if (typeof body.role !== "string" || body.role.trim() === "") {
				return c.json({ error: "Invalid role" }, 400);
			}
			role = parseRole(body.role, DEFAULT_INVITE_ROLE);
			if (role === null) return c.json({ error: `Role must be at most ${32} characters` }, 400);
			changed = true;
		}
		if (!changed) return c.json({ error: "Nothing to update" }, 400);

		const db = getDb(c.env.DB);
		const existing = await db
			.select({ id: schema.users.id, email: schema.users.email })
			.from(schema.users)
			.where(eq(schema.users.id, id));
		if (existing.length === 0) return c.json({ error: "User not found" }, 404);

		const updated = await db
			.update(schema.users)
			.set({
				...(status !== null ? { status } : {}),
				...(role !== null ? { role } : {}),
			})
			.where(eq(schema.users.id, id))
			.returning({
				id: schema.users.id,
				email: schema.users.email,
				name: schema.users.name,
				role: schema.users.role,
				status: schema.users.status,
				createdAt: schema.users.createdAt,
			});

		if (status !== null) {
			const action = status === "suspended" ? "users.suspend" : status === "active" ? "users.reactivate" : "users.status";
			await logActivity(db, action, existing[0].email);
		}
		if (role !== null) {
			await logActivity(db, "users.role", `${existing[0].email} → ${role}`);
		}
		return c.json(updated[0]);
	} catch (err) {
		console.error("Error updating user:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});

/* ── Write: toggle feature flag ── */

adminRoutes.patch("/features/:key", async (c) => {
	try {
		const key = c.req.param("key").trim();
		if (key === "") return c.json({ error: "Invalid feature key" }, 400);
		const body = await c.req.json<Record<string, unknown>>().catch(() => null);
		if (!body || typeof body !== "object") {
			return c.json({ error: "Invalid request body" }, 400);
		}
		const enabled = parseEnabled(body.enabled);
		if (enabled === null) return c.json({ error: "Invalid enabled value" }, 400);

		const db = getDb(c.env.DB);
		const existing = await db
			.select({ id: schema.featureFlags.id })
			.from(schema.featureFlags)
			.where(eq(schema.featureFlags.key, key));
		if (existing.length === 0) return c.json({ error: "Feature flag not found" }, 404);

		const updated = await db
			.update(schema.featureFlags)
			.set({ enabled, updatedAt: sql`(unixepoch())` })
			.where(eq(schema.featureFlags.key, key))
			.returning();
		await logActivity(db, "features.toggle", `${key}=${enabled}`);
		return c.json(updated[0]);
	} catch (err) {
		console.error("Error toggling feature flag:", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});