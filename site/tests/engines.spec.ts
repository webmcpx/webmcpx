// Runs in Chromium (no WebMCP flag), Firefox and WebKit (playwright.config.ts). The test is the agent:
// like any automation (Playwright, Selenium, Puppeteer), it opens the site and calls its WebMCP tools
// through document.modelContext, the spec's getTools() and executeTool(). The site loads the drop-in
// from the CDN; the test serves this checkout's built package (dist/ and wasm/) at that URL instead.
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { LOADER_URL } from '../src/lib/content/snippets.ts';

const PACKAGE = new URL('../../packages/webmcpx/', import.meta.url);
const CDN = LOADER_URL.replace(/dist\/auto\.js$/, '');
const TYPES: Record<string, string> = { js: 'text/javascript', wasm: 'application/wasm' };

/** Serves the CDN's copy of webmcpx from this checkout; returns the files the page asked for. */
async function serveLocalPackage(page: Page) {
	const fetched: string[] = [];
	await page.route(`${CDN}**`, async (route) => {
		const path = route.request().url().slice(CDN.length).split('?')[0];
		fetched.push(path);
		await route.fulfill({
			body: readFileSync(new URL(path, PACKAGE)),
			headers: {
				'content-type': TYPES[path.split('.').pop() ?? ''] ?? 'application/octet-stream',
				'access-control-allow-origin': '*'
			}
		});
	});
	return fetched;
}

interface Tool {
	name: string;
}
interface ModelContext {
	getTools(): Promise<Tool[]>;
	executeTool(tool: Tool, input?: object): Promise<string>;
}

/** What an automation script runs in the page: list the tools, then call one by its descriptor. */
const listTools = (page: Page) =>
	page.evaluate(async () => {
		const mc = (document as unknown as { modelContext?: ModelContext }).modelContext;
		return mc ? (await mc.getTools()).map((t) => t.name) : [];
	});
const callTool = (page: Page, name: string, input: object) =>
	page.evaluate(
		async ([name, input]) => {
			const mc = (document as unknown as { modelContext: ModelContext }).modelContext;
			const tool = (await mc.getTools()).find((t) => t.name === name);
			if (!tool) throw new Error(`no tool ${name}`);
			// executeTool() JSON-serializes what the tool returned, and a webmcpx tool returns its
			// envelope as JSON text: a JSON string literal, parsed twice (agent/page.js does the same).
			return JSON.parse(JSON.parse(await mc.executeTool(tool, input)));
		},
		[name, input] as const
	);

test('an automation agent lists and calls the site tools at document.modelContext', async ({ page }) => {
	const fetched = await serveLocalPackage(page);
	await page.goto('/');
	await expect.poll(() => listTools(page)).toEqual(['fetch_as_markdown', 'get_page_context', 'search_page']);
	expect(fetched).toContain('dist/polyfill.js');

	const context = await callTool(page, 'get_page_context', {});
	expect(context.ok).toBe(true);
	expect(context.data.url).toBe('http://127.0.0.1:4174/');
	expect(context.data.title).toMatch(/webmcpx/);
	expect(context.data.headings.length).toBeGreaterThan(0);

	// The WebAssembly engine loads on this first text call, in every engine.
	const found = await callTool(page, 'search_page', { query: 'benchmark' });
	expect(found.ok).toBe(true);
	expect(found.data.results.length).toBeGreaterThan(0);
});

test('a page with its own WebMCP never loads the polyfill', async ({ page }) => {
	const fetched = await serveLocalPackage(page);
	// A native document.modelContext, as Chrome with WebMCP or the ChatGPT and Codex browsers give.
	await page.addInitScript(() => {
		const names: string[] = [];
		const native = { registerTool: async (tool: Tool) => void names.push(tool.name), names };
		Object.defineProperty(Document.prototype, 'modelContext', { get: () => native });
	});
	await page.goto('/');
	await expect
		.poll(() =>
			page.evaluate(() =>
				[...(document as unknown as { modelContext: { names: string[] } }).modelContext.names].sort()
			)
		)
		.toEqual(['fetch_as_markdown', 'get_page_context', 'search_page']);
	expect(fetched).toContain('dist/auto.js');
	expect(fetched).not.toContain('dist/polyfill.js');
});
