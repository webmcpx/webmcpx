import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Scrolls to the bottom so every reveal and lazy section is in its final state. */
async function scrollThrough(page: Page) {
	await page.evaluate(async () => {
		for (let y = 0; y < document.body.scrollHeight; y += 500) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 30));
		}
	});
}

for (const colorScheme of ['dark', 'light'] as const) {
	test(`no axe violations, ${colorScheme} theme`, async ({ page }) => {
		await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
		for (const path of ['/', '/design']) {
			await page.goto(path);
			await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
			await scrollThrough(page);
			const { violations } = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
				.analyze();
			expect(violations.map((v) => `${path}: ${v.id} (${v.nodes.length})`)).toEqual([]);
		}
	});
}

test('fits a 390 px phone without horizontal scroll', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await scrollThrough(page);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('the benchmark numbers are in the prerendered HTML', async ({ request }) => {
	const html = await (await request.get('/')).text();
	expect(html).toMatch(/fewer tokens|more tokens/);
	expect(html).toContain('notion-request-limit');
});

test('content is visible without JavaScript', async ({ browser }) => {
	const page = await browser.newPage({ javaScriptEnabled: false });
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Catch broken tools before agents do.' })).toBeVisible();
	await page.close();
});

test('theme toggle switches and persists', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.goto('/');
	await page.getByRole('button', { name: 'Switch to light theme' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('install tabs work with the keyboard', async ({ page }) => {
	await page.goto('/');
	const tabs = page.getByRole('tablist', { name: 'Install' });
	await tabs.getByRole('tab', { name: 'Script tag' }).focus();
	await page.keyboard.press('ArrowRight');
	await expect(tabs.getByRole('tab', { name: 'npm' })).toBeFocused();
	await expect(tabs.getByRole('tab', { name: 'npm' })).toHaveAttribute('aria-selected', 'true');
	await expect(page.getByText("import { register } from 'webmcpx';")).toBeVisible();
});

test('benchmark metric tabs change the chart', async ({ page }) => {
	await page.goto('/');
	const section = page.locator('#benchmark');
	await section.getByRole('tab', { name: 'Time' }).click();
	await expect(section.getByRole('table')).toContainText('seconds per run');
});

test('the playground runs a real webmcpx tool', async ({ page }) => {
	await page.goto('/#playground');
	const section = page.locator('#playground');
	await expect(section.getByText(/\d+ tools registered on this page/)).toBeVisible();
	await section.getByRole('tab', { name: 'search_page' }).click();
	await section.getByRole('button', { name: 'Run tool' }).click();
	await expect(section.locator('pre')).toContainText('"ok": true');
});
