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
			// Horizontally scrollable regions (code, tables, tab lists) may hold wider content on purpose, and
			// the sections' watermark runs past the edge on purpose, clipped by its section (the scroll check
			// above still catches any real overflow).
			if (el.closest('[role="tablist"], pre, table, [role="region"], .overflow-x-auto, .watermark')) continue;
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

			test(`${url} keeps the layout on a phone, a small tablet and desktop`, async ({ page }) => {
				for (const width of [390, 640, 1280]) {
					await page.setViewportSize({ width, height: 900 });
					await page.goto(url);
					await expect(page.locator('html')).toHaveAttribute('lang', l.tag);
					const scroll = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
					expect(scroll, `horizontal scroll at ${width}px`).toBeLessThanOrEqual(0);
					expect(await overflowing(page), `overflow at ${width}px`).toEqual([]);
				}
			});
		}

		test('the menu pill fits between the logo and GitHub, from 1024 px (its smallest width)', async ({
			page
		}) => {
			for (const width of [1024, 1280]) {
				await page.setViewportSize({ width, height: 800 });
				await page.goto(localized('/', l.code));
				const fit = await page.evaluate(() => {
					const nav = document.querySelector('header nav')!;
					const links = [...nav.querySelectorAll('a')];
					const box = (el: Element) => el.getBoundingClientRect();
					const ul = nav.querySelector('ul')!;
					const pill = box(ul);
					const items = [...ul.children].map((li) => box(li).top);
					return {
						lines: new Set(items.map(Math.round)).size,
						// Gaps in px: logo → pill, pill → GitHub (16 is the flex gap: more means nothing is squeezed),
						// GitHub → the window’s edge.
						left: pill.left - box(links[0]).right,
						right: box(links.find((a) => a.textContent?.includes('GitHub'))!).left - pill.right,
						edge: innerWidth - box(links.find((a) => a.textContent?.includes('GitHub'))!).right,
						scroll: document.documentElement.scrollWidth - innerWidth
					};
				});
				expect(fit.lines, `one line at ${width}px`).toBe(1);
				expect(fit.left, `room after the logo at ${width}px`).toBeGreaterThan(16);
				expect(fit.right, `room before GitHub at ${width}px`).toBeGreaterThan(16);
				expect(fit.edge, `GitHub inside the frame at ${width}px`).toBeGreaterThan(16);
				expect(fit.scroll, `no horizontal scroll at ${width}px`).toBeLessThanOrEqual(0);
			}
		});

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

test('the language suggestion is a card clear of the logo and menu', async ({ browser }) => {
	const context = await browser.newContext({ locale: 'pt-BR' });
	const page = await context.newPage();
	await page.goto('/');
	const card = page.locator('[data-language-suggestion]');
	await expect(card).toBeVisible();
	await expect(card).toContainText('Ler em português');
	const box = (await card.boundingBox())!;
	const header = (await page.locator('header').first().boundingBox())!;
	// Below the header, not over it; rounded like the site's cards.
	expect(box.y).toBeGreaterThan(header.y + header.height);
	expect(parseFloat(await card.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(
		8
	);
	expect(
		parseFloat(await card.evaluate((el) => getComputedStyle(el).borderBottomRightRadius))
	).toBeGreaterThan(8);
	await card.getByRole('button').click();
	await expect(card).toHaveCount(0);
	await context.close();
});

test('changing the language keeps a shared scan', async ({ page }) => {
	await page.goto('/?scan=https%3A%2F%2Fdocs.example.com%2F#scan');
	const pt = page.locator('header a[hreflang="pt-BR"]').first();
	await expect(pt).toHaveAttribute('href', '/pt-br/?scan=https%3A%2F%2Fdocs.example.com%2F#scan');
});
