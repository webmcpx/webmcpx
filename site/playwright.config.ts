// End-to-end tests against the prerendered build (what ships), served by `vite preview`.
// Locally they run in the installed Chrome; CI installs Playwright's Chromium. engines.spec.ts also runs
// in Playwright's Firefox and WebKit: an agent driving any engine must find the site's WebMCP tools.
import { defineConfig, devices } from '@playwright/test';

const ENGINES = /engines\.spec\.ts/;

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://127.0.0.1:4174'
	},
	projects: [
		{ name: 'chromium', use: { channel: process.env.CI ? undefined : 'chrome' } },
		{ name: 'firefox', testMatch: ENGINES, use: { ...devices['Desktop Firefox'] } },
		{ name: 'webkit', testMatch: ENGINES, use: { ...devices['Desktop Safari'] } }
	],
	webServer: {
		command: 'npm run build && npx vite preview --port 4174 --strictPort --host 127.0.0.1',
		url: 'http://127.0.0.1:4174',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
