/* ════════════════════════════════════
   Shared types — used by both the React frontend and the Hono worker
   ═���══════════════════════════════════ */

export interface ReleaseAsset {
	name: string;
	platform: string;
	size: number;
	r2Key: string;
	downloadUrl: string;
}

export interface Release {
	tag: string;
	version: string;
	publishedAt: string;
	body: string;
	assets: ReleaseAsset[];
}
