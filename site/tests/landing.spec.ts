import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

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
	for (const path of ['/', '/brand', '/benchmark/gpt-6.1-sol/']) {
		await page.goto(path);
		if (path === '/') {
			// Include the scan result card in the audit.
			await page.getByLabel("Your site's address").first().fill('docs.example.com');
			await page.getByRole('button', { name: 'Scan my site' }).first().click();
			await expect(page.getByText('Agent-ready').first()).toBeVisible();
			// Audit the tools table too.
			await page.locator('#leaderboard').getByRole('tab', { name: 'Tools' }).first().click();
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
	await expect(page.getByRole('heading', { name: 'For your site', exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'For your agent', exact: true })).toBeVisible();
	// The home renders the open site only (a lighter page): its best case is there without JavaScript.
	await expect(page.getByText(/Notion page through the API/).first()).toBeVisible();
	// Each model's own page renders every site and tab: everything reads without JavaScript there.
	await page.goto('/benchmark/gpt-6-luna/');
	await expect(page.getByText(/requests per minute does the Notion API/).first()).toBeVisible();
	const tools = page.getByRole('region', { name: 'WebMCP tools on Notion' });
	await expect(tools.locator('tbody tr')).toHaveCount(5);
	await expect(tools.getByText('read_skill', { exact: true })).toBeVisible();
	await expect(tools.getByRole('button')).toHaveCount(0);
	await expect(page.getByText(/Cloudflare Workers KV/).first()).toBeVisible();
	await page.close();
});

test('without JavaScript, every model is a link to its own prerendered benchmark page', async ({
	browser
}) => {
	const page = await browser.newPage({ javaScriptEnabled: false });
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Benchmark by model' });
	await expect(nav.getByRole('link')).toHaveCount(await nav.getByRole('listitem').count());
	await nav.getByRole('link', { name: 'GPT-6.1 Sol' }).click();
	await expect(page).toHaveURL(/\/benchmark\/gpt-6\.1-sol\/$/);
	await expect(page.getByText(/^gpt-6\.1-sol, reasoning medium/).first()).toBeVisible();
	await expect(page.getByRole('link', { name: 'All results' })).toHaveAttribute(
		'href',
		/bench\/gpt-6\.1-sol\.json$/
	);
	await page.close();
});

test('the site address input has focus on load, ready to type', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByLabel("Your site's address").first()).toBeFocused();
	await page.keyboard.type('docs.example.com');
	await expect(page.getByLabel("Your site's address").first()).toHaveValue('docs.example.com');
});

test('hovering or focusing a tool shows its description', async ({ page }) => {
	await mockScan(page);
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('docs.example.com');
	await page.getByRole('button', { name: 'Scan my site' }).first().click();
	const tools = page.getByRole('list', { name: 'Tools found' });
	const first = tools.getByRole('button').first();
	await first.hover();
	const tip = page.locator('body > div.absolute');
	await expect(tip).toBeVisible();
	// Screen readers get the description in the chip's name.
	expect((await first.textContent()) ?? '').toContain(((await tip.textContent()) ?? '').trim());
	await page.mouse.move(0, 0);
	await expect(tip).toHaveCount(0);
});

test('a long tool description wraps inside the tooltip on a phone', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const long = 'x'.repeat(100);
	await mockScan(page, { ...REPORT, tools: [{ ...REPORT.tools[0], description: long }] });
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('docs.example.com');
	await page.getByRole('button', { name: 'Scan my site' }).first().click();
	await page.getByRole('list', { name: 'Tools found' }).getByRole('button').first().focus();
	await expect(page.locator('body > div.absolute')).toHaveText(long);
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
	expect(overflow).toBeLessThanOrEqual(0);
});

test('an agent-ready site can pick one of four badge styles, inline or a README image', async ({ page }) => {
	await mockScan(page);
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('docs.example.com');
	await page.getByRole('button', { name: 'Scan my site' }).first().click();
	const styles = page.getByRole('group', { name: 'Badge style' }).getByRole('radio');
	await expect(styles).toHaveCount(4);
	await expect(styles.first()).toBeChecked();
	const embed = page.locator('#scan').getByRole('figure').filter({ hasText: 'badge.html' });
	const card = await embed.textContent();
	await page.getByText('Flat', { exact: true }).click();
	await expect(styles.nth(1)).toBeChecked();
	await expect(embed).toContainText('width="158" height="20"');
	expect(await embed.textContent()).not.toBe(card);
	await page.getByText('Dark', { exact: true }).click();
	await expect(embed).toContainText('#3d3c37');
	await expect(embed).not.toContainText('<img');
	// READMEs can't hold inline SVG: Markdown for an image of the latest verdict, linking to a live scan.
	await page.getByText('README', { exact: true }).click();
	const readme = page.locator('#scan').getByRole('figure').filter({ hasText: 'README.md' });
	await expect(readme).toContainText('[![');
	await expect(readme).toContainText('/badge/docs.example.com.svg)](');
	await expect(readme).toContainText('/?scan=https%3A%2F%2Fdocs.example.com%2F#scan)');
});

test('the menu marks the section in view and opens on phones', async ({ page }) => {
	await page.goto('/');
	const menu = page.getByRole('navigation', { name: 'Main' });
	await menu.getByRole('link', { name: 'Leaderboard' }).first().click();
	await expect(menu.getByRole('link', { name: 'Leaderboard' }).first()).toHaveAttribute(
		'aria-current',
		'true'
	);
	await menu.getByRole('link', { name: 'vs MCP' }).first().click();
	await expect(menu.getByRole('link', { name: 'vs MCP' }).first()).toHaveAttribute('aria-current', 'true');
	// One section marked at a time (the language switcher marks the current language separately).
	await expect(menu.locator('[aria-current]:not([hreflang])')).toHaveCount(1);

	await page.setViewportSize({ width: 390, height: 844 });
	await menu.locator('summary').filter({ hasText: 'Menu' }).click();
	await menu.getByRole('link', { name: 'For sites' }).last().click();
	await expect(page).toHaveURL(/#for-sites$/);
	await expect(menu.getByRole('link', { name: 'For sites' }).last()).toBeHidden();
});

test('the language switcher links this page in every language, without JavaScript', async ({ browser }) => {
	const page = await browser.newPage({ javaScriptEnabled: false });
	await page.goto('/brand/');
	const menu = page.getByRole('navigation', { name: 'Main' });
	const switcher = menu.locator('summary').filter({ hasText: 'Language' }).first();
	await switcher.click();
	const list = menu.locator('details[open] ul').first();
	await expect(list.getByRole('link')).toHaveCount(11);
	await expect(list.getByRole('link', { name: 'English' })).toHaveAttribute('aria-current', 'true');
	await expect(list.locator('[aria-current]')).toHaveCount(1);
	const ja = list.getByRole('link', { name: '日本語' });
	await expect(ja).toHaveAttribute('href', '/ja/brand/');
	await expect(ja).toHaveAttribute('hreflang', 'ja');
	await ja.click();
	await expect(page).toHaveURL(/\/ja\/brand\/$/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
	await page.close();
});

test('the menu still marks sections after coming from another page', async ({ page }) => {
	await page.goto('/brand/');
	await expect(page.locator('html[data-hydrated]')).toHaveCount(1);
	const menu = page.getByRole('navigation', { name: 'Main' });
	await menu.getByRole('link', { name: 'Leaderboard' }).first().click();
	await expect(page).toHaveURL(/\/#leaderboard$/);
	await expect(menu.getByRole('link', { name: 'Leaderboard' }).first()).toHaveAttribute(
		'aria-current',
		'true'
	);
});

test('scanning a site shows the verdict and its tools', async ({ page }) => {
	const seen = await mockScan(page);
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('docs.example.com');
	await page.getByRole('button', { name: 'Scan my site' }).first().click();
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
	// The fix is one click away: the install steps.
	await page.locator('#scan').getByRole('link', { name: 'Fix it' }).click();
	await expect(page).toHaveURL(/#for-sites$/);
	await expect(page.locator('#for-sites')).toBeInViewport();
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
	// The logo scrolls up first, then scans.
	await expect.poll(() => seen).toEqual(['https://developers.notion.com/']);
	await expect(page.getByText('Agent-ready').first()).toBeVisible();
	await page.goto('/?scan=https%3A%2F%2Fkith.com%2F');
	await expect(page.getByText('Agent-ready').first()).toBeVisible();
	await expect.poll(() => seen).toEqual(['https://developers.notion.com/', 'https://kith.com/']);
});

test('the detail tabs switch metrics and only show the selected site', async ({ page }) => {
	// Still: the carousel must not move on to another site mid-test.
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	const proof = page.locator('#leaderboard');
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
	await page.goto('/#leaderboard');
	const proof = page.locator('#leaderboard');
	const sites = proof.getByRole('tablist', { name: 'Site' });
	// Sites are ordered by their biggest saving (which one comes first depends on the run): the first is open.
	await expect(sites.getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');
	await sites.getByRole('tab', { name: /Notion/ }).click();
	await expect(proof.getByText(/requests per minute does the Notion API/).first()).toBeVisible();
	await expect(proof.getByRole('link', { name: /developers\.notion\.com/ })).toBeVisible();

	await sites.getByRole('tab', { name: /Cloudflare/ }).click();
	await expect(proof.getByText(/Workers KV/).first()).toBeVisible();
	await expect(proof.getByText(/average/i)).toHaveCount(0);
});

test('the model switcher shows each model on its own run', async ({ page }) => {
	await page.goto('/#leaderboard');
	const proof = page.locator('#leaderboard');
	const models = proof.getByRole('tablist', { name: 'Model' }).getByRole('tab');
	await expect(models.first()).toHaveAttribute('aria-selected', 'true');
	await expect(models.first()).toContainText('GPT-6 Luna');
	const ids: string[] = [];
	for (let i = 0; i < (await models.count()); i++) {
		await models.nth(i).click();
		await expect(models.nth(i)).toHaveAttribute('aria-selected', 'true');
		// Only the selected model's run is shown: its results link and its method.
		const href = await proof.getByRole('link', { name: 'All results' }).getAttribute('href');
		const id = href?.match(/bench\/(.+)\.json$/)?.[1] ?? '';
		ids.push(id);
		await proof.getByRole('tab', { name: 'Method' }).click();
		await expect(
			proof.getByText(new RegExp(`^${id.replaceAll('.', '\\.')}, reasoning medium`)).filter({ visible: true })
		).toHaveCount(1);
	}
	expect(new Set(ids).size).toBe(ids.length);
});

// The carousel: the question on screen, and the site whose logo is selected.
/** The selected site's panel in the carousel (by its tab's aria-controls). */
const sitePanel = async (proof: Locator) => {
	const id = await proof
		.locator('[aria-roledescription=carousel] [role=tab][aria-selected=true]')
		.first()
		.getAttribute('aria-controls');
	return proof.locator(`[id="${id}"]`);
};
const shownQuestion = async (proof: Locator) => (await sitePanel(proof)).locator('p').first().textContent();
/** The selected site's name (its tile's first line; the second is its best saving). */
const selectedSite = (proof: Locator) =>
	proof
		.locator('[aria-roledescription=carousel] [role=tab][aria-selected=true] > span')
		.first()
		.textContent();

/** Lets time pass (a second at a time, as the carousel starts once it is on screen) until the site changes. */
const nextSite = (page: Page, proof: Locator, from: string | null) =>
	expect
		.poll(async () => {
			await page.clock.runFor(1000);
			return selectedSite(proof);
		})
		.not.toBe(from);

test('the carousel moves site by site, the selected logo follows, and picking a site stops it', async ({
	page
}) => {
	await page.clock.install();
	await page.goto('/#leaderboard');
	const proof = page.locator('#leaderboard');
	await page.mouse.move(0, 0);
	// Each move selects the next site's logo and shows that site's question, named above it.
	for (let n = 0; n < 2; n++) {
		const site = await selectedSite(proof);
		const question = await shownQuestion(proof);
		await nextSite(page, proof, site);
		expect(await shownQuestion(proof)).not.toBe(question);
		const now = (await selectedSite(proof))?.replace(/local$/i, '').trim() ?? '';
		await expect((await sitePanel(proof)).locator('h4').first()).toContainText(now);
	}
	// No second way through it: the logos are the only position.
	await expect(proof.getByRole('button', { name: /question/i })).toHaveCount(0);

	// Picking a site by hand stops the rotation for good, even once focus and pointer leave.
	const logos = proof.locator('[aria-roledescription=carousel] [role=tab]');
	await logos.nth(1).click();
	const site = await selectedSite(proof);
	await page.locator('body').click({ position: { x: 1, y: 1 } });
	await page.mouse.move(0, 0);
	await page.clock.runFor(15000);
	expect(await selectedSite(proof)).toBe(site);
});

test('no automatic rotation for people who prefer reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.clock.install();
	await page.goto('/#leaderboard');
	const proof = page.locator('#leaderboard');
	await page.mouse.move(0, 0);
	const site = await selectedSite(proof);
	const question = await shownQuestion(proof);
	await page.clock.runFor(15000);
	expect(await selectedSite(proof)).toBe(site);
	expect(await shownQuestion(proof)).toBe(question);
});

test('the page says its benchmark shows selected cases and links to all results', async ({ page }) => {
	await page.goto('/#leaderboard');
	const proof = page.locator('#leaderboard');
	await expect(proof.getByText(/Selected cases: \d+ of \d+ questions/)).toBeVisible();
	// One model's run at a time: the others render when picked.
	await expect(proof.getByText(/Selected cases:/)).toHaveCount(1);
	await expect(proof.getByRole('link', { name: 'All results' })).toHaveAttribute(
		'href',
		/bench\/[^/]+\.json$/
	);
	// Sites without an impressive case are not shown.
	await expect(proof.getByRole('tab', { name: /WooCommerce/ })).toHaveCount(0);
});

test('the Tools tab shows the site tools, their descriptions and what the agent called', async ({ page }) => {
	await page.goto('/#leaderboard');
	await page
		.locator('#leaderboard')
		.getByRole('tab', { name: /Notion/ })
		.click();
	await page
		.locator('#leaderboard')
		.getByRole('tablist', { name: 'Details for Notion' })
		.getByRole('tab', { name: 'Tools' })
		.click();
	const tools = page.locator('#leaderboard').getByRole('region', { name: 'WebMCP tools on Notion' });
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
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Paper, ink and a junction');
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

test('Why WebMCP gives four sourced reasons, lists the rest and states the draft status', async ({
	page
}) => {
	await page.goto('/#why');
	const why = page.locator('#why');
	await expect(why.getByRole('heading', { level: 3 })).toHaveCount(4);
	await expect(
		why.getByText(/up to \d+(\.\d)?× fewer tokens on \S+ in our benchmark \(best case\)/)
	).toBeVisible();
	// Every reason names where its claim comes from.
	await expect(why.getByText('Sources', { exact: true })).toHaveCount(4);
	await expect(why.getByText('Also:', { exact: true })).toBeVisible();
	await expect(why.getByText('Same cart, same form', { exact: true })).toBeVisible();
	await expect(why.getByText(/Community Group draft .* not a W3C standard/)).toBeVisible();
});

test('WebMCP vs MCP compares them row by row and says to use both', async ({ page }) => {
	await page.goto('/#vs-mcp');
	const vs = page.locator('#vs-mcp');
	const table = vs.getByRole('table', { name: 'WebMCP compared with MCP' });
	await expect(table.getByRole('rowheader')).toHaveCount(10);
	await expect(table.getByRole('row', { name: /How agents call them/ })).toContainText('No JSON-RPC');
	await expect(vs.getByText(/Run both on one backend/)).toBeVisible();
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
	await page.getByRole('button', { name: 'Scan my site' }).first().click();
	const result = page.locator('#scan');
	await expect(result.getByText('Agent-ready').first()).toBeVisible();
	await expect(result.locator('img[src^="data:image/png"]')).toHaveCount(1);
	// A preview of each style (decorative: the radios carry the names).
	await expect(result.locator('fieldset svg[aria-label^="Agent-ready: WebMCP tools checked"]')).toHaveCount(
		4
	);
	const embed = result.getByRole('figure').filter({ hasText: 'badge.html' });
	await expect(embed).toContainText('/?scan=https%3A%2F%2Fdocs.example.com%2F#scan');
	// The badge SVG is inlined: the embed loads nothing from our server.
	await expect(embed).toContainText('<svg');
	await expect(embed).not.toContainText('<img');
});

test('your own tools: the coding agent first, then the same tool written five ways, as keyboard tabs', async ({
	page
}) => {
	await page.goto('/#own');
	const own = page.locator('#own');
	const tabs = own.getByRole('tab');
	await expect(tabs).toHaveText(['Agent', 'React', 'Vue', 'Svelte', 'JavaScript', 'HTML']);
	await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
	await expect(tabs.nth(1).locator('svg')).toHaveCount(1);
	await expect(own.getByRole('tabpanel')).toHaveCount(1);
	await expect(own.getByRole('tabpanel')).toContainText('webmcpx.dev/llms.txt');
	await tabs.first().focus();
	await page.keyboard.press('ArrowRight');
	await expect(own.getByRole('tabpanel')).toContainText('from "webmcpx/react"');
	await page.keyboard.press('End');
	await expect(own.getByRole('tabpanel')).toContainText('toolname="add_to_cart"');
	await expect(own.getByRole('tabpanel').getByRole('button', { name: /Copy/ })).toBeVisible();
});

test('without JavaScript every way to write a tool still shows', async ({ browser }) => {
	const page = await browser.newPage({ javaScriptEnabled: false });
	await page.goto('/');
	await expect(page.locator('#own [role=tabpanel]')).toHaveCount(6);
	await page.close();
});

test('for sites: one line, as tabs that open on your coding agent', async ({ page }) => {
	await page.goto('/#for-sites');
	const sites = page.locator('#for-sites');
	await expect(sites.getByRole('heading', { level: 2 })).toHaveText('For your site');
	// Two parts under one title: the standard tools, then the site's own actions.
	await expect(sites.getByRole('heading', { level: 3 })).toHaveText([
		'1Standard tools: one line',
		'2Your site’s own actions'
	]);
	const install = sites.getByRole('tablist', { name: 'Standard tools: one line' }).getByRole('tab');
	await expect(install).toHaveText(['Agent', 'HTML', 'npm']);
	await expect(install.first()).toHaveAttribute('aria-selected', 'true');
	await expect(sites.getByRole('tabpanel').first()).toContainText('npx skills add webmcpx/webmcpx -y');
	await expect(sites.getByRole('tablist')).toHaveCount(2);
	// Nothing for the agent side here: that is its own section.
	await expect(sites.getByText('npx -y webmcpx mcp')).toHaveCount(0);
});

test('the old #fix links, printed by published CLIs, still land on the site section', async ({ page }) => {
	await page.goto('/#fix');
	await expect(page.locator('#for-sites').getByRole('heading', { level: 2 })).toBeInViewport();
});

test('for agents: the measured saving, the tools it works with, one tab per way to set it up', async ({
	page
}) => {
	await page.goto('/#for-agents');
	const agents = page.locator('#for-agents');
	await expect(agents.getByRole('heading', { level: 2 })).toHaveText('For your agent');
	// Computed from the published runs, linked to them: the best as the big number, the range under it.
	await expect(agents.getByRole('link', { name: /^Up to \d+(\.\d)?× fewer tokens$/ })).toHaveAttribute(
		'href',
		'#leaderboard'
	);
	await expect(
		agents.getByRole('link', {
			name: /^\d+(\.\d)?× to \d+(\.\d)?× fewer tokens across \d+ models on the leaderboard\.$/
		})
	).toBeVisible();
	// The losses sit right under it, never hidden.
	await expect(
		agents.getByText(/^Whole runs: on \d+(–\d+)? of \d+ questions per model, WebMCP used more tokens\.$/)
	).toBeVisible();
	await expect(agents.getByRole('listitem')).toContainText([
		'Claude Code',
		'Codex',
		'Cursor',
		'Chrome',
		'Firefox',
		'Safari'
	]);
	const tabs = agents.getByRole('tab');
	await expect(tabs).toHaveText(['Agent', 'Claude Code', 'Codex', 'Cursor', 'Scripts']);
	// The prompt first; each client's one command a click away.
	await expect(agents.getByRole('tabpanel')).toContainText('Use WebMCP first on every web page');
	await tabs.nth(1).click();
	await expect(agents.getByRole('tabpanel')).toContainText('claude mcp add webmcpx -- npx -y webmcpx mcp');
	await tabs.nth(4).click();
	await expect(agents.getByRole('tabpanel')).toContainText('document.modelContext');
});

test('the scan is the one action in the hero; people with no site get a link to set up their agent', async ({
	page
}) => {
	await page.goto('/');
	const hero = page.locator('#scan');
	await expect(hero.getByRole('link', { name: 'Scan your site' })).toHaveCount(0);
	await hero.getByRole('link', { name: 'Set up your agent' }).click();
	await expect(page).toHaveURL(/#for-agents$/);
	await expect(page.locator('#for-agents')).toBeInViewport();
});

test('the menus name both audiences, in page order', async ({ page }) => {
	await page.goto('/');
	const pill = page.getByRole('navigation', { name: 'Main' }).locator('ul').first();
	await expect(pill.getByRole('link')).toHaveText([
		'Why',
		'Leaderboard',
		'For agents',
		'For sites',
		'vs MCP',
		'Issues',
		'Docs'
	]);
	// tests/i18n.spec.ts checks that the pill fits one line at 1024 px in every language.
	const footer = page.getByRole('contentinfo');
	await expect(footer.getByRole('link', { name: 'For sites' })).toHaveAttribute('href', '/#for-sites');
	await expect(footer.getByRole('link', { name: 'For agents' })).toHaveAttribute('href', '/#for-agents');
});

test('the verdicts page explains each stamp and is linked from every scan result and the footer', async ({
	page
}) => {
	await page.goto('/');
	await page.locator('footer').getByRole('link', { name: 'How verdicts work' }).click();
	await expect(page).toHaveURL(/\/verdicts\/$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('How the scanner decides');
	for (const name of ['Agent-ready', 'Almost', 'Not yet'])
		await expect(page.getByText(name, { exact: true })).toBeVisible();
	await expect(page.getByText('invalid-input-schema')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Open an issue with the scan link.' })).toHaveAttribute(
		'href',
		/template=verdict\.yml/
	);
});

test('a scan with same-named tools in two frames shows both', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await mockScan(page, { ...REPORT, tools: [...REPORT.tools, ...REPORT.tools] });
	await page.goto('/');
	await page.getByLabel("Your site's address").first().fill('docs.example.com');
	await page.getByRole('button', { name: 'Scan my site' }).first().click();
	await expect(
		page.locator('#scan').getByRole('list', { name: 'Tools found' }).getByRole('listitem')
	).toHaveCount(REPORT.tools.length * 2);
	expect(errors).toEqual([]);
});

test("a model's own page shows its place on the leaderboard, not first", async ({ page }) => {
	await page.goto('/');
	const tabs = page.locator('#leaderboard [role=tablist]').first().locator('[role=tab]');
	const last = await tabs.last().textContent();
	const total = await tabs.count();
	const id = (await tabs.last().getAttribute('id'))?.replace(/^.*-tab-/, '');
	await page.goto(`/benchmark/${id}/`);
	await expect(page.locator(`[aria-label="Rank ${total}"]`)).toHaveCount(1);
	await expect(page.getByLabel('Rank 1')).toHaveCount(0);
	expect(last).toContain(String(total));
});

test('a logo takes you up to the scan first, then scans', async ({ page }) => {
	// A slow scan, so the page can be checked while it runs.
	let release!: () => void;
	const held = new Promise<void>((r) => (release = r));
	await page.route('**/api/scan?**', async (route) => {
		await held;
		await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(REPORT) });
	});
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	const logo = page.getByRole('button', { name: /Notion/ }).first();
	await logo.scrollIntoViewIfNeeded();
	await logo.click();
	// Up first (the result box may then nudge itself into view): the scan is in view while it runs.
	await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(100);
	await expect(page.locator('#scan')).toBeInViewport();
	release();
	await expect(page.getByText('Agent-ready').first()).toBeVisible();
});
