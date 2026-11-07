import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Scrolls to the bottom so every reveal is in its final state. */
async function scrollThrough(page: Page) {
	await page.evaluate(async () => {
		for (let y = 0; y < document.body.scrollHeight; y += 500) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 30));
		}
	});
}

const REPORT = {
	url: 'https://docs.example.com/',
	final_url: 'https://docs.example.com/',
	title: 'Docs',
	verdict: 'ready',
	tools: [{ name: 'search_docs', description: 'Search.', params: ['query'], read_only: true }],
	diagnostics: [],
	page_tokens: 2100,
	// A 1x1 transparent PNG, as the scanner would return it.
	favicon:
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
	elapsed_ms: 900
};

/** The preview server has no scan API: answer `/api/scan` from the test. */
async function mockScan(page: Page, body: object = REPORT, status = 200) {
	const seen: string[] = [];
	await page.route('**/api/scan?**', async (route) => {
		seen.push(new URL(route.request().url()).searchParams.get('url') ?? '');
		await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
	});
	return seen;
}

test('no axe violations', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await mockScan(page);
	for (const path of ['/', '/brand']) {
		await page.goto(path);
		if (path === '/') {
			// Include the scan result card in the audit.
			await page.getByLabel("Your site's address").first().fill('docs.example.com');
			await page.getByRole('button', { name: 'Scan it' }).first().click();
			await expect(page.getByText('Agent-ready').first()).toBeVisible();
			// Audit the tools table too.
			await page.locator('#proof').getByRole('tab', { name: 'Tools' }).first().click();
		}
		await scrollThrough(page);
		const { violations } = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
			.analyze();
		expect(violations.map((v) => `${path}: ${v.id} (${v.nodes.length})`)).toEqual([]);
	}
});

test('fits a 390 px phone without horizontal scroll', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await scrollThrough(page);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('the benchmark numbers are in the prerendered HTML', async ({ request }) => {
	const html = await (await request.get('/')).text();
	expect(html).toMatch(/fewer tokens|more tokens/);
	// The featured site and its question are named in the HTML, not added by JavaScript.
	// The best case (Cloudflare, by token saving) is first and already in the HTML, not added by JavaScript.
	expect(html).toContain('How many requests per day can my Workers handle');
});

test('content is visible without JavaScript', async ({ browser }) => {
	const page = await browser.newPage({ javaScriptEnabled: false });
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'One line. Agent-ready.' })).toBeVisible();
	// Every tab panel is in the HTML: the best case first, then every other site, tools included.
	await expect(page.getByText(/requests per minute does the Notion API/).first()).toBeVisible();
	const tools = page.getByRole('region', { name: 'WebMCP tools on Notion' });
	await expect(tools.locator('tbody tr')).toHaveCount(5);
	await expect(tools.getByText('read_skill', { exact: true })).toBeVisible();
	await expect(tools.getByRole('button')).toHaveCount(0);
	await expect(page.getByText(/Cloudflare Workers KV/).first()).toBeVisible();
	await page.close();
});

test('scanning a site shows the verdict and its tools', async ({ page }) => {
	const seen = await mockScan(page);
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('docs.example.com');
	await page.getByRole('button', { name: 'Scan it' }).first().click();
	await expect(page.getByText('Agent-ready').first()).toBeVisible();
	await expect(page.getByRole('list', { name: 'Tools found' })).toContainText('search_docs');
	expect(seen).toEqual(['https://docs.example.com/']);
});

test('a site without WebMCP gets the fix', async ({ page }) => {
	await mockScan(page, { ...REPORT, verdict: 'missing', tools: [] });
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('plain.example.com');
	await page.keyboard.press('Enter');
	await expect(page.getByText('Not yet')).toBeVisible();
	// The fix is right there, ready to copy.
	const fix = page.locator('#scan').getByRole('figure').filter({ hasText: 'index.html' });
	await expect(fix).toContainText('cdn.jsdelivr.net/npm/webmcpx/src/auto.js');
	await expect(fix.getByRole('button', { name: /Copy/ })).toBeVisible();
});

test('scan errors are shown, not swallowed', async ({ page }) => {
	await mockScan(page, { error: '10.0.0.1 is not a public address' }, 400);
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('http://10.0.0.1/');
	await page.keyboard.press('Enter');
	await expect(page.getByText('10.0.0.1 is not a public address')).toBeVisible();
});

test('logos scan their site, and shared links rerun a scan', async ({ page }) => {
	const seen = await mockScan(page);
	await page.goto('/');
	await page.getByRole('button', { name: /Notion.*scan this site/ }).click();
	await expect(page.getByText('Agent-ready').first()).toBeVisible();
	await page.goto('/?scan=https%3A%2F%2Fkith.com%2F');
	await expect(page.getByText('Agent-ready').first()).toBeVisible();
	await expect.poll(() => seen).toEqual(['https://developers.notion.com/', 'https://kith.com/']);
});

test('the detail tabs switch metrics and only show the selected site', async ({ page }) => {
	await page.goto('/');
	const proof = page.locator('#proof');
	await proof.getByRole('tab', { name: /specification\.website/ }).click();
	const details = proof.getByRole('tablist', { name: 'Details for specification.website' });
	await expect(details.getByRole('tab')).toHaveText(['Tokens', 'Time', 'Steps', 'Cost', 'Tools', 'Method']);
	await details.getByRole('tab', { name: 'Time' }).click();
	const table = proof.getByRole('table').filter({ hasText: 'seconds per run' });
	await expect(table).toHaveCount(1);
	await expect(table.locator('tbody tr')).toHaveCount(5);
	await expect(table).not.toContainText('Notion');
	await details.getByRole('tab', { name: 'Method' }).click();
	await expect(
		proof.getByText('A live site: it ships its own WebMCP tools.').filter({ visible: true })
	).toBeVisible();
});

test('the site filter shows each site and each question on its own, never averaged', async ({ page }) => {
	await page.goto('/#proof');
	const proof = page.locator('#proof');
	const sites = proof.getByRole('tablist', { name: 'Site' });
	// Sites are ordered by their biggest saving: Cloudflare first in this run.
	await expect(sites.getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');
	await expect(sites.getByRole('tab').first()).toContainText('Cloudflare');
	await sites.getByRole('tab', { name: /Notion/ }).click();
	await expect(proof.getByText(/requests per minute does the Notion API/).first()).toBeVisible();
	await expect(proof.getByRole('link', { name: /developers\.notion\.com/ })).toBeVisible();

	await sites.getByRole('tab', { name: /Cloudflare/ }).click();
	await expect(proof.getByText(/Workers KV/).first()).toBeVisible();
	await expect(proof.getByText(/average/i)).toHaveCount(0);
});

test('a site with several questions rotates them, and the rotation can be paused', async ({ page }) => {
	await page.clock.install();
	await page.goto('/#proof');
	const proof = page.locator('#proof');
	await proof.getByRole('tab', { name: /specification\.website/ }).click();
	const dots = proof.getByRole('button', { name: /^Question \d of 5$/ });
	await expect(dots).toHaveCount(5);
	await expect(proof.getByRole('button', { name: 'Question 1 of 5' })).toHaveAttribute(
		'aria-current',
		'true'
	);

	// Rotation pauses while the pointer is over it: move away, then let time pass.
	await page.mouse.move(0, 0);
	await page.clock.runFor(5100);
	await expect(proof.getByRole('button', { name: 'Question 2 of 5' })).toHaveAttribute(
		'aria-current',
		'true'
	);

	const before = await proof
		.locator('[aria-roledescription=carousel] p')
		.filter({ visible: true })
		.first()
		.textContent();
	await proof.getByRole('button', { name: 'Question 3 of 5' }).click();
	await expect(proof.getByRole('button', { name: 'Question 3 of 5' })).toHaveAttribute(
		'aria-current',
		'true'
	);
	await expect(
		proof.locator('[aria-roledescription=carousel] p').filter({ visible: true }).first()
	).not.toHaveText(before ?? '');
	await proof.getByRole('button', { name: 'Pause rotation' }).click();
	await page.mouse.move(0, 0);
	await page.clock.runFor(12000);
	await expect(proof.getByRole('button', { name: 'Question 3 of 5' })).toHaveAttribute(
		'aria-current',
		'true'
	);
});

test('no automatic rotation for people who prefer reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.clock.install();
	await page.goto('/#proof');
	const proof = page.locator('#proof');
	await proof.getByRole('tab', { name: /specification\.website/ }).click();
	await page.mouse.move(0, 0);
	await page.clock.runFor(12000);
	await expect(proof.getByRole('button', { name: 'Question 1 of 5' })).toHaveAttribute(
		'aria-current',
		'true'
	);
});

test('switching sites starts the question rotation over', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/#proof');
	const proof = page.locator('#proof');
	await proof.getByRole('tab', { name: /specification\.website/ }).click();
	await proof.getByRole('button', { name: 'Question 4 of 5' }).click();
	await proof.getByRole('tab', { name: /Kiln/ }).click();
	await expect(proof.getByRole('button', { name: 'Question 1 of 4' })).toHaveAttribute(
		'aria-current',
		'true'
	);
});

test('the page says its benchmark shows selected cases and links to all results', async ({ page }) => {
	await page.goto('/#proof');
	const proof = page.locator('#proof');
	await expect(proof.getByText(/Selected cases: \d+ of \d+ questions/)).toBeVisible();
	await expect(proof.getByRole('link', { name: 'All results' })).toHaveAttribute('href', /bench\.json$/);
	// Sites without an impressive case are not shown.
	await expect(proof.getByRole('tab', { name: /WooCommerce/ })).toHaveCount(0);
});

test('the Tools tab shows the site tools, their descriptions and what the agent called', async ({ page }) => {
	await page.goto('/#proof');
	await page
		.locator('#proof')
		.getByRole('tab', { name: /Notion/ })
		.click();
	await page
		.locator('#proof')
		.getByRole('tablist', { name: 'Details for Notion' })
		.getByRole('tab', { name: 'Tools' })
		.click();
	const tools = page.locator('#proof').getByRole('region', { name: 'WebMCP tools on Notion' });
	await expect(tools.getByRole('heading', { name: /WebMCP tools Notion registers/ })).toBeVisible();
	await expect(tools.locator('tbody tr')).toHaveCount(5);
	await expect(tools.locator('tbody tr').first()).toContainText('search_docs');
	await expect(tools.getByText(/Search the Notion Docs documentation/)).toBeVisible();
	await expect(tools.getByText(/^search_docs\(/).first()).toBeVisible();
	// Schema 4 runs record the tools the agent was given: no snapshot disclaimer.
	await expect(tools.getByText(/as the agent saw them/)).toBeVisible();
	// Descriptions are always in full: no toggle.
	await expect(tools.getByRole('button')).toHaveCount(0);
});

test('the brand page shows the marks, real token values and downloadable assets', async ({
	page,
	request
}) => {
	await page.goto('/brand');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Paper, ink and a junction.');
	// Hex values come from tokens.css; ink on paper is the main pair.
	await expect(page.getByText(/ink on paper/).first()).toBeVisible();
	const downloads = page.getByRole('link', { name: /Download .* SVG/ });
	await expect(downloads).toHaveCount(15);
	for (const href of await downloads.evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
		const res = await request.get(href!);
		expect(res.status(), href!).toBe(200);
		expect(await res.text(), href!).not.toMatch(/stroke|Gradient|<text|<image/);
	}
	await expect(page.getByRole('link', { name: 'Read TRADEMARK.md' })).toBeVisible();
});

test('every page carries the trademark notices', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText(/not affiliated with or endorsed by LF Projects/)).toBeVisible();
});

test('Why WebMCP shows four reasons, the saving computed from the run', async ({ page }) => {
	await page.goto('/#why');
	const why = page.locator('#why');
	await expect(why.getByRole('heading', { level: 3 })).toHaveCount(4);
	await expect(why.getByText(/up to \d+(\.\d)?× fewer tokens on \S/)).toBeVisible();
});

test('a scan submitted before JavaScript is ready still runs', async ({ browser }) => {
	const page = await browser.newPage({ javaScriptEnabled: false });
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('notion.com');
	await page.keyboard.press('Enter');
	// The plain form submission lands on the shareable scan link the page runs on load.
	await expect(page).toHaveURL(/\?scan=notion\.com#scan$/);
	await page.close();
});

test('keyboard focus is visible on the ink footer', async ({ page }) => {
	await page.goto('/');
	const link = page.locator('footer').getByRole('link', { name: 'GitHub' });
	await link.focus();
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Tab');
	const [outline, panel] = await link.evaluate((a) => [
		getComputedStyle(a).outlineColor,
		getComputedStyle(a.closest('footer > div')!).backgroundColor
	]);
	expect(outline).not.toBe(panel);
	expect(await link.evaluate((a) => getComputedStyle(a).outlineStyle)).toBe('solid');
});

test('an agent-ready site gets its favicon and a badge to embed that links to a live scan', async ({
	page
}) => {
	await mockScan(page);
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('docs.example.com');
	await page.getByRole('button', { name: 'Scan it' }).first().click();
	const result = page.locator('#scan');
	await expect(result.getByText('Agent-ready').first()).toBeVisible();
	await expect(result.locator('img[src^="data:image/png"]')).toHaveCount(1);
	await expect(result.getByRole('img', { name: /Agent-ready: WebMCP tools checked/ })).toBeVisible();
	const embed = result.getByRole('figure').filter({ hasText: 'badge.html' });
	await expect(embed).toContainText('/?scan=https%3A%2F%2Fdocs.example.com%2F#scan');
	await expect(embed).toContainText('/badge/agent-ready.svg');
	const badge = await page.request.get('/badge/agent-ready.svg');
	expect(badge.status()).toBe(200);
});
