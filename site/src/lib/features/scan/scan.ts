import badgeSvg from '#lib/content/badge.svg?raw';

// Client for `GET /api/scan?url=` (crates/webmcpx-bench/src/scan.rs). Types mirror the Rust `Report`.

export type Verdict = 'ready' | 'issues' | 'missing';

export interface ScanTool {
	name: string;
	description: string;
	params: string[];
	read_only: boolean | null;
}

export interface Finding {
	rule: string;
	severity: 'error' | 'warning';
	message: string;
}

export interface Report {
	url: string;
	final_url: string;
	title: string;
	verdict: Verdict;
	tools: ScanTool[];
	diagnostics: Finding[];
	page_tokens: number;
	/** The site's icon as a small data:image URI, or null. */
	favicon: string | null;
	elapsed_ms: number;
}

export type Outcome = { ok: true; report: Report } | { ok: false; error: string };

/** Trims, and rejects what is obviously not a site, before a round trip. */
export function normalize(input: string): string | null {
	const s = input.trim();
	if (!s || /\s/.test(s)) return null;
	const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`;
	try {
		const u = new URL(withScheme);
		if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
		if (!u.hostname.includes('.') && u.hostname !== 'localhost') return null;
		return u.href;
	} catch {
		return null;
	}
}

export const host = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
};

export async function scan(url: string, fetcher: typeof fetch = fetch): Promise<Outcome> {
	let res: Response;
	try {
		res = await fetcher(`/api/scan?url=${encodeURIComponent(url)}`);
	} catch {
		return { ok: false, error: 'The scanner is offline. Run it locally with `just serve`.' };
	}
	if (res.status === 404) {
		return { ok: false, error: 'This copy of the site has no scanner. Run it locally with `just serve`.' };
	}
	const body = (await res.json().catch(() => null)) as Report | { error?: string } | null;
	if (!res.ok || !body || !('verdict' in body)) {
		const error = body && 'error' in body && body.error ? body.error : `Scan failed (${res.status}).`;
		return { ok: false, error };
	}
	return { ok: true, report: body };
}

export const errors = (r: Report) => r.diagnostics.filter((d) => d.severity === 'error').length;
export const warnings = (r: Report) => r.diagnostics.filter((d) => d.severity === 'warning').length;

/** The link that re-runs this scan when opened: `/?scan=<url>`. */
export const shareLink = (origin: string, url: string) => `${origin}/?scan=${encodeURIComponent(url)}`;

/** The badge artwork, inlined into the embed code: sites never load an image from our server. */
export const BADGE_SVG = badgeSvg.trim();

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * The HTML a site pastes to show it is agent-ready: the badge SVG itself, inside a link back to a live
 * scan of that site. Nothing is fetched from us; the link lets anyone check the claim (and credits us).
 */
export function badgeEmbed(origin: string, url: string): string {
	const href = attr(`${shareLink(origin, url)}#scan`);
	return `<a href="${href}" title="Agent-ready: check it live with webmcpx">${BADGE_SVG}</a>`;
}
