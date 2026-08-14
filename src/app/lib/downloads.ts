/* ── Download metadata + grouping helpers ── */

import type { ReleaseAsset } from "../../shared/types";

export function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* Display metadata for known platforms — purely cosmetic, never a whitelist.
   Any asset platform not listed here still renders via the fallbacks below. */
export const PLATFORM_META: Record<string, { name: string; icon: string; group: string; pkg: string; variant: string; arch: string }> = {
	android: { name: "Android", icon: "logo-android", group: "Android", pkg: ".apk", variant: "Installer", arch: "arm64" },
	"android-armv7": { name: "Android (32-bit)", icon: "logo-android", group: "Android", pkg: ".apk", variant: "32-bit", arch: "armv7" },
	"macos-aarch64": { name: "macOS (Apple Silicon)", icon: "logo-apple", group: "macOS", pkg: ".dmg", variant: "Installer", arch: "arm64" },
	"macos-x64": { name: "macOS (Intel)", icon: "logo-apple", group: "macOS", pkg: ".dmg", variant: "Installer", arch: "x64" },
	windows: { name: "Windows", icon: "logo-windows", group: "Windows", pkg: ".msi", variant: "Installer", arch: "x64" },
	"windows-portable": { name: "Windows (Portable)", icon: "logo-windows", group: "Windows", pkg: ".zip", variant: "Portable", arch: "x64" },
	linux: { name: "Linux", icon: "logo-linux", group: "Linux", pkg: ".deb", variant: "Package", arch: "x64" },
};

export const KNOWN_GROUPS = ["Android", "macOS", "Windows", "Linux"];

export function groupFor(platform: string): string {
	return PLATFORM_META[platform]?.group ?? "Other";
}

export function displayNameFor(platform: string): string {
	if (PLATFORM_META[platform]) return PLATFORM_META[platform].name;
	return platform.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function iconFor(platform: string): string {
	return PLATFORM_META[platform]?.icon ?? "package";
}

export function variantFor(platform: string): string {
	return PLATFORM_META[platform]?.variant ?? "Installer";
}

export function pkgFor(asset: ReleaseAsset): string {
	if (PLATFORM_META[asset.platform]) return PLATFORM_META[asset.platform].pkg;
	const m = asset.name.match(/\.([a-z0-9]+)$/i);
	return m ? `.${m[1].toLowerCase()}` : "Package";
}

/* Derive an architecture label from the platform id; unknown ones that carry
   no architecture signal return null so the chip is omitted. */
export function archFor(platform: string): string | null {
	if (PLATFORM_META[platform]) return PLATFORM_META[platform].arch;
	if (/aarch64|arm64|armv8/i.test(platform)) return "arm64";
	if (/armv7|armhf|armeabi-v7a/i.test(platform)) return "armv7";
	if (/amd64|x86_64|win64/i.test(platform)) return "x64";
	if (/x86|i386|i686|win32/i.test(platform)) return "x86";
	return null;
}

/* Canonical per-group order — primary variant first (e.g. 64-bit before
   32-bit, installer before portable). Unknown platforms sort last. */
const PLATFORM_ORDER = [
	"android",
	"android-armv7",
	"macos-aarch64",
	"macos-x64",
	"windows",
	"windows-portable",
	"linux",
];

function platformSortKey(platform: string): number {
	const idx = PLATFORM_ORDER.indexOf(platform);
	return idx === -1 ? PLATFORM_ORDER.length : idx;
}

/* Group release assets by platform group, known groups first, then any
   additional groups in order of first appearance — never skip an asset.
   Within a group, assets follow PLATFORM_ORDER then name. */
export function groupAssets(assets: ReleaseAsset[]): Array<{ group: string; items: ReleaseAsset[] }> {
	const map = new Map<string, ReleaseAsset[]>();
	for (const a of assets) {
		const g = groupFor(a.platform);
		if (!map.has(g)) map.set(g, []);
		map.get(g)!.push(a);
	}
	for (const items of map.values()) {
		items.sort(
			(a, b) =>
				platformSortKey(a.platform) - platformSortKey(b.platform) ||
				a.name.localeCompare(b.name),
		);
	}
	const present = [...map.keys()];
	const ordered = [...KNOWN_GROUPS.filter((g) => present.includes(g)), ...present.filter((g) => !KNOWN_GROUPS.includes(g))];
	return ordered.map((g) => ({ group: g, items: map.get(g)! }));
}
