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
/**
 * The checks by group, from the oldest, most basic web practice to the newest: robots.txt (1994), sitemaps
 * (2005), llms.txt (2024), Markdown for agents (2025); Link headers (RFC 5988, 2010), the API catalog
 * (RFC 9727, 2025), Agent Skills discovery (draft); then what agents pay, and WebMCP last, from having tools
 * to passing the linter.
 */
export const SCORE_GROUPS: { id: 'webmcp' | 'cost' | 'readable' | 'discoverable'; items: ScoreItemId[] }[] = [
	{ id: 'readable', items: ['robots', 'sitemap', 'llms_txt', 'markdown'] },
	{ id: 'discoverable', items: ['link_headers', 'api_catalog', 'agent_skills'] },
	{ id: 'cost', items: ['cost'] },
	{ id: 'webmcp', items: ['tools', 'descriptions', 'annotations', 'lint'] }
];
/** The groups in two columns from sm up (7 and 5 checks): the web basics, then the agent level. One column on phones, in order. */
export const SCORE_COLUMNS = [SCORE_GROUPS.slice(0, 2), SCORE_GROUPS.slice(2)];
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
	/** Present when the report comes from the scanner's cache: its age and when that copy expires. */
	cached?: { age_s: number; expires_in_s: number };
}

/**
 * Why a scan failed, as data: the page turns it into words in its language with `errorText()`.
 * `status` is the HTTP status, or 0 when the scanner could not be reached; `detail` is the server's own
 * (English) reason; `code` its machine-readable reason (`scan_running`: the visitor's previous scan has
 * not ended); `retryAfter` the seconds from a 429's `Retry-After` header.
 */
export interface Failure {
	status: number;
	detail: string | null;
	code: string | null;
	retryAfter: number | null;
}

export type Outcome = { ok: true; report: Report } | { ok: false; failure: Failure };

/** The messages `errorText()` picks from (`m.scan.errors`). */
export type ScanErrors = Messages['scan']['errors'];

/** A failed scan in the reader's language. The server's detail stays in English, in parentheses. */
export function errorText(failure: Failure, m: ScanErrors): string {
	const { status, detail, retryAfter } = failure;
	const withDetail = (lead: string) => (detail ? fmt(m.withDetail, { lead, detail }) : lead);
	switch (status) {
		case 0:
			return m.offline;
		case 404:
			return m.noScanner;
		case 429:
			if (failure.code === 'scan_running') return m.running;
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
		return { ok: false, failure: { status: 0, detail: null, code: null, retryAfter: null } };
	}
	const body = (await res.json().catch(() => null)) as Report | { error?: string; code?: string } | null;
	if (!res.ok || !body || !('verdict' in body)) {
		const detail = body && 'error' in body && body.error ? body.error : null;
		const code = body && 'code' in body && body.code ? body.code : null;
		return {
			ok: false,
			// A 200 without a report is the scanner misbehaving: report it like a server error.
			failure: {
				status: res.ok ? 502 : res.status,
				detail,
				code,
				retryAfter: retryAfter(res.headers.get('Retry-After'))
			}
		};
	}
	return { ok: true, report: body };
}

export const errors = (r: Report) => r.diagnostics.filter((d) => d.severity === 'error').length;
export const warnings = (r: Report) => r.diagnostics.filter((d) => d.severity === 'warning').length;

/**
 * The link that re-runs this scan when opened (`home` is the landing in the reader's language). A plain
 * https address reads as itself, `/scan/notion.com/docs`, which the server sends on to `/?scan=<url>`
 * (server.rs, `pretty_scan`); anything else (http, a port, a query or a fragment) keeps `/?scan=<url>`.
 */
export function shareLink(origin: string, url: string, home = '/'): string {
	let u: URL | undefined;
	try {
		u = new URL(url);
	} catch {
		u = undefined;
	}
	if (u && u.protocol === 'https:' && !u.port && !u.username && !u.password && !u.search && !u.hash)
		return `${origin}${home}scan/${u.hostname}${u.pathname === '/' ? '' : u.pathname}`;
	return `${origin}${home}?scan=${encodeURIComponent(url)}`;
}

/** A post on X with `text` and the scan's link (X shortens and previews it: the share card). */
export const postOnX = (text: string, link: string) =>
	`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;

/**
 * The badge styles. All but `readme` are inlined into the embed code, so those sites load nothing from our server. Their names
 * are in the dictionary (`scan.badges.<id>`); the artwork's own <title> stays English, like the logo.
 */
export const BADGES = [
	{ id: 'flat', svg: flatSvg.trim() },
	{ id: 'card', svg: cardSvg.trim() },
	{ id: 'dark', svg: darkSvg.trim() }
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
	const svg = BADGES.find((b) => b.id === style)?.svg ?? BADGES[0].svg;
	return `<a href="${attr(href)}" title="${attr(title)}">${svg}</a>`;
}

/**
 * The same badge for Markdown (READMEs can't hold inline SVG; GitHub strips it): an image served by us,
 * `/badge/<host>.svg?style=…`, which shows this artwork while the site is agent-ready and its real verdict
 * otherwise (scan/card.rs, badge_styled), linked to a live re-scan.
 */
export function badgeMarkdown(
	origin: string,
	url: string,
	style: BadgeStyle,
	title: string,
	home = '/'
): string {
	const href = `${shareLink(origin, url, home)}#scan`;
	const image = `${origin}/badge/${host(url)}.svg?style=${style}`;
	return `[![${title.replace(/[[\]]/g, '')}](${image})](${href})`;
}
