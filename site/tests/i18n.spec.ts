// Every language: the right <html lang>, the original layout (no horizontal scroll at 390 px, nothing
// sticking out of the viewport on desktop), accessible, and reachable from the switcher and the suggestion.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { LOCALES, localized } from '../src/lib/i18n/locales.ts';

const PAGES = ['/', '/brand/', '/benchmark/gpt-6-luna/'];

/** Elements wider than the viewport, by selector-ish description. */
async function overflowing(page: Page): Promise<string[]> {
	return page.evaluate(() => {
		const width = document.documentElement.clientWidth;
		const out: string[] = [];
		for (const el of document.querySelectorAll<HTMLElement>('main *, header *, footer *')) {
			// Horizontally scrollable regions (code, tables, tab lists) may hold wider content on purpose.
			if (el.closest('[role="tablist"], pre, table, [role="region"], .overflow-x-auto')) continue;
			const r = el.getBoundingClientRect();
			if (r.width && (r.right > width + 1 || r.left < -1)) {
				out.push(
					`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} "${el.textContent?.trim().slice(0, 40)}"`
				);
			}
		}
		return out.slice(0, 5);
	});
}

for (const l of LOCALES) {
	test.describe(`${l.name} (${l.code})`, () => {
		for (const path of PAGES) {
			const url = localized(path, l.code);

			test(`${url} keeps the layout on a phone and on desktop`, async ({ page }) => {
				for (const width of [390, 1280]) {
					await page.setViewportSize({ width, height: 900 });
					await page.goto(url);
					await expect(page.locator('html')).toHaveAttribute('lang', l.tag);
					const scroll = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
					expect(scroll, `horizontal scroll at ${width}px`).toBeLessThanOrEqual(0);
					expect(await overflowing(page), `overflow at ${width}px`).toEqual([]);
				}
			});
		}

		test('links every language with hreflang', async ({ page }) => {
			await page.goto(localized('/brand/', l.code));
			const alternates = page.locator('link[rel="alternate"][hreflang]');
			await expect(alternates).toHaveCount(LOCALES.length + 1);
			await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', /\/brand\/$/);
		});
	});
}

for (const code of ['ja', 'hi', 'de', 'zh'] as const) {
	test(`no axe violations in ${code}`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto(localized('/', code));
		const { violations } = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
			.analyze();
		expect(violations.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([]);
	});
}

test('the switcher keeps the page and changes the language', async ({ page }) => {
	await page.goto('/brand/');
	const menu = page.getByRole('navigation', { name: 'Main' });
	await menu.locator('details summary').filter({ hasText: /EN/i }).first().click();
	await menu.getByRole('link', { name: 'Português (Brasil)' }).first().click();
	await expect(page).toHaveURL(/\/pt-br\/brand\/$/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test.describe('a visitor whose browser is in Portuguese', () => {
	test.use({ locale: 'pt-BR' });

	test('is offered Portuguese once, without a redirect', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
		const offer = page.locator('aside[lang="pt-BR"]');
		await expect(offer).toBeVisible();
		await expect(offer.getByRole('link')).toHaveAttribute('href', '/pt-br/');
		await offer.getByRole('button').click();
		await expect(offer).toHaveCount(0);
		await page.reload();
		await expect(page.locator('aside[lang="pt-BR"]')).toHaveCount(0);
	});

	test('accepting the offer opens the page in Portuguese', async ({ page }) => {
		await page.goto('/brand/');
		await page.locator('aside[lang="pt-BR"]').getByRole('link').click();
		await expect(page).toHaveURL(/\/pt-br\/brand\/$/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
		await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveCount(1);
		await expect(page.locator('aside[lang="pt-BR"]')).toHaveCount(0);
	});
});
