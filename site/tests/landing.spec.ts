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
	for (const path of ['/', '/design']) {
		await page.goto(path);
		if (path === '/') {
			// Include the scan result card in the audit.
			await page.getByLabel("Your site's address").first().fill('docs.example.com');
			await page.getByRole('button', { name: 'Scan it' }).first().click();
			await expect(page.getByText('Agent-ready').first()).toBeVisible();
			await page
				.locator('details')
				.first()
				.evaluate((d) => ((d as HTMLDetailsElement).open = true));
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
	expect(html).toContain('Best live case');
	expect(html).toContain('How many requests per minute does the Notion API allow');
});

test('content is visible without JavaScript', async ({ browser }) => {
	const page = await browser.newPage({ javaScriptEnabled: false });
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'One line. Agent-ready.' })).toBeVisible();
	// The featured site is labelled as the best case; every question stays readable in the full table.
	await expect(page.getByText('Best live case')).toBeVisible();
	await page.getByText(/Every question on one chart/).click();
	await expect(page.locator('#proof table')).toContainText('cloudflare-kv-value-size');
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
	await expect(page.getByRole('link', { name: 'Fix it with one line' })).toHaveAttribute('href', '#fix');
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

test('the full benchmark switches metrics', async ({ page }) => {
	await page.goto('/');
	await page.getByText(/Every question on one chart/).click();
	const proof = page.locator('#proof');
	await proof.getByRole('tab', { name: 'Time' }).click();
	await expect(proof.getByRole('table')).toContainText('seconds per run');
});

test('the site filter shows each site and each question on its own, never averaged', async ({ page }) => {
	await page.goto('/#proof');
	const proof = page.locator('#proof');
	const sites = proof.getByRole('tablist', { name: 'Site' });
	await expect(sites.getByRole('tab', { name: /Notion/ })).toHaveAttribute('aria-selected', 'true');
	await expect(proof.getByText(/requests per minute does the Notion API/)).toBeVisible();
	await expect(proof.getByRole('link', { name: /developers\.notion\.com/ })).toBeVisible();

	await sites.getByRole('tab', { name: /Cloudflare/ }).click();
	await expect(proof.getByText(/Workers KV/)).toBeVisible();
	await expect(proof.getByText(/average/i)).toHaveCount(0);
});

test('a site with several questions rotates them, and the rotation can be paused', async ({ page }) => {
	await page.clock.install();
	await page.goto('/#proof');
	const proof = page.locator('#proof');
	await proof.getByRole('tab', { name: /Orbit docs/ }).click();
	const dots = proof.getByRole('button', { name: /^Question \d of 4$/ });
	await expect(dots).toHaveCount(4);
	await expect(proof.getByRole('button', { name: 'Question 1 of 4' })).toHaveAttribute(
		'aria-current',
		'true'
	);

	// Rotation pauses while the pointer is over it: move away, then let time pass.
	await page.mouse.move(0, 0);
	await page.clock.runFor(5100);
	await expect(proof.getByRole('button', { name: 'Question 2 of 4' })).toHaveAttribute(
		'aria-current',
		'true'
	);

	await proof.getByRole('button', { name: 'Question 3 of 4' }).click();
	await expect(proof.getByText(/exit code 4/)).toBeVisible();
	await proof.getByRole('button', { name: 'Pause rotation' }).click();
	await page.mouse.move(0, 0);
	await page.clock.runFor(12000);
	await expect(proof.getByRole('button', { name: 'Question 3 of 4' })).toHaveAttribute(
		'aria-current',
		'true'
	);
});

test('no automatic rotation for people who prefer reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.clock.install();
	await page.goto('/#proof');
	const proof = page.locator('#proof');
	await proof.getByRole('tab', { name: /Orbit docs/ }).click();
	await page.mouse.move(0, 0);
	await page.clock.runFor(12000);
	await expect(proof.getByRole('button', { name: 'Question 1 of 4' })).toHaveAttribute(
		'aria-current',
		'true'
	);
});
