// Where each section's Junction watermark sits: one hand-set composition per section, so the marks zigzag
// down the page (right, left, right...) at different sizes and angles. x and y place the mark's center,
// as a share of the section's box; size is the mark's width at full desktop size.
export interface Mark {
	x: string;
	y: string;
	size: number;
	rotate: number;
}

const BY_SECTION: Record<string, Mark> = {
	why: { x: '88%', y: '18%', size: 560, rotate: 14 },
	leaderboard: { x: '4%', y: '62%', size: 640, rotate: -12 },
	'for-agents': { x: '92%', y: '58%', size: 600, rotate: 8 },
	'for-sites': { x: '6%', y: '22%', size: 480, rotate: -20 },
	'vs-mcp': { x: '90%', y: '70%', size: 520, rotate: 24 },
	issues: { x: '8%', y: '78%', size: 600, rotate: -6 },
	faq: { x: '86%', y: '12%', size: 540, rotate: 16 }
};

/** A section's mark: its own composition, or one derived from its id (stable across builds). */
export function markFor(id: string): Mark {
	const set = BY_SECTION[id];
	if (set) return set;
	let h = 0;
	for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
	const left = h % 2 === 0;
	return {
		x: left ? `${4 + (h % 8)}%` : `${86 + (h % 8)}%`,
		y: `${15 + (h % 60)}%`,
		size: 440 + (h % 200),
		rotate: (h % 40) - 20
	};
}
