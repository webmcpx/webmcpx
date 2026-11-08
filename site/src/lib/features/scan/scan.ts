import cardSvg from '#lib/content/badges/card.svg?raw';
import darkSvg from '#lib/content/badges/dark.svg?raw';
import flatSvg from '#lib/content/badges/flat.svg?raw';
import { fmt } from '#lib/i18n/format.ts';
import type { Messages } from '#lib/i18n/dict/en.ts';

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

/** One line of the score; `id` names its label and fix in the dictionary (scan.result.score.items). */
export interface ScoreItem {
	id: ScoreItemId;
	points: number;
	max: number;
}
export type ScoreItemId =
	| 'tools'
	| 'lint'
	| 'descriptions'
	| 'annotations'
	| 'cost'
	| 'llms_txt'
	| 'markdown'
	| 'robots'
	| 'sitemap'
	| 'link_headers'
	| 'agent_skills'
	| 'api_catalog';
/** The checks by group, in the order the page shows them. */
export const SCORE_GROUPS: { id: 'webmcp' | 'cost' | 'readable' | 'discoverable'; items: ScoreItemId[] }[] = [
	{ id: 'webmcp', items: ['tools', 'lint', 'descriptions', 'annotations'] },
	{ id: 'cost', items: ['cost'] },
	{ id: 'readable', items: ['llms_txt', 'markdown', 'robots', 'sitemap'] },
	{ id: 'discoverable', items: ['link_headers', 'agent_skills', 'api_catalog'] }
];
/** The lowest score of an agent-ready site (scan.rs READY_SCORE). */
export const READY_SCORE = 70;

export interface Report {
	url: string;
	final_url: string;
	title: string;
	verdict: Verdict;
	tools: ScanTool[];
	diagnostics: Finding[];
	page_tokens: number;
	/** The agent-ready score, 0 to 100 (scan.rs `score`). */
	score: number;
	/** What the score is made of: each check's points out of its maximum. */
	score_items: ScoreItem[];
	/** The site's icon as a small data:image URI, or null. */
	favicon: string | null;
	elapsed_ms: number;
}

/**
 * Why a scan failed, as data: the page turns it into words in its language with `errorText()`.
 * `status` is the HTTP status, or 0 when the scanner could not be reached; `detail` is the server's own
 * (English) reason; `retryAfter` the seconds from a 429's `Retry-After` header.
 */
export interface Failure {
	status: number;
	detail: string | null;
	retryAfter: number | null;
}

export type Outcome = { ok: true; report: Report } | { ok: false; failure: Failure };

/** The messages `errorText()` picks from (`m.scan.errors`). */
export type ScanErrors = Messages['scan']['errors'];

/** A failed scan in the reader's language. The server's detail stays in English, in parentheses. */
export function errorText(
	status: number,
	detail: string | null,
	retryAfter: number | null,
	m: ScanErrors
): string {
	const withDetail = (lead: string) => (detail ? fmt(m.withDetail, { lead, detail }) : lead);
	switch (status) {
		case 0:
			return m.offline;
		case 404:
			return m.noScanner;
		case 429:
			return retryAfter != null ? fmt(m.busy, { s: retryAfter }) : m.busyLater;
		case 504:
			return m.timeout;
		case 400:
			return withDetail(m.badAddress);
		case 422:
			return withDetail(m.unreadable);
		default:
			return fmt(m.other, { status });
	}
}

/** `Retry-After` in seconds: a number, or an HTTP date from now; null when absent or unreadable. */
function retryAfter(header: string | null, now = Date.now()): number | null {
	if (!header) return null;
	const s = Number(header);
	if (Number.isFinite(s) && s >= 0) return Math.ceil(s);
	const at = Date.parse(header);
	return Number.isNaN(at) ? null : Math.max(0, Math.ceil((at - now) / 1000));
}

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
		return { ok: false, failure: { status: 0, detail: null, retryAfter: null } };
	}
	const body = (await res.json().catch(() => null)) as Report | { error?: string } | null;
	if (!res.ok || !body || !('verdict' in body)) {
		const detail = body && 'error' in body && body.error ? body.error : null;
		return {
			ok: false,
			// A 200 without a report is the scanner misbehaving: report it like a server error.
			failure: {
				status: res.ok ? 502 : res.status,
				detail,
				retryAfter: retryAfter(res.headers.get('Retry-After'))
			}
		};
	}
	return { ok: true, report: body };
}

export const errors = (r: Report) => r.diagnostics.filter((d) => d.severity === 'error').length;
export const warnings = (r: Report) => r.diagnostics.filter((d) => d.severity === 'warning').length;

/** The link that re-runs this scan when opened: `/?scan=<url>` (`home` is the landing in the reader's language). */
export const shareLink = (origin: string, url: string, home = '/') =>
	`${origin}${home}?scan=${encodeURIComponent(url)}`;

/**
 * The badge styles. All but `readme` are inlined into the embed code, so those sites load nothing from our server. Their names
 * are in the dictionary (`scan.badges.<id>`); the artwork's own <title> stays English, like the logo.
 */
export const BADGES = [
	{ id: 'card', svg: cardSvg.trim() },
	{ id: 'flat', svg: flatSvg.trim() },
	{ id: 'dark', svg: darkSvg.trim() },
	// READMEs can't hold inline SVG (GitHub strips it): an image of the site's latest verdict, served by us.
	{ id: 'readme', svg: flatSvg.trim() }
] as const;
export type BadgeStyle = (typeof BADGES)[number]['id'];

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * The HTML a site pastes to show it is agent-ready: the badge SVG itself, inside a link back to a live
 * scan of that site. Nothing is fetched from us; the link lets anyone check the claim (and credits us).
 * `title` is the link's tooltip (`m.scan.result.badgeTitle`), `home` the landing to re-scan on.
 */
export function badgeEmbed(
	origin: string,
	url: string,
	style: BadgeStyle,
	title: string,
	home = '/'
): string {
	const href = `${shareLink(origin, url, home)}#scan`;
	if (style === 'readme') {
		const image = `${origin}/badge/${host(url)}.svg`;
		return `[![${title.replace(/[[\]]/g, '')}](${image})](${href})`;
	}
	const svg = BADGES.find((b) => b.id === style)?.svg ?? BADGES[0].svg;
	return `<a href="${attr(href)}" title="${attr(title)}">${svg}</a>`;
}
