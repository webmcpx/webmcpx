// End-to-end tests against the prerendered build (what ships), served by `vite preview`.
// Locally they run in the installed Chrome; CI installs Playwright's Chromium.
import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://127.0.0.1:4174',
		channel: process.env.CI ? undefined : 'chrome'
	},
	webServer: {
		command: 'npm run build && npx vite preview --port 4174 --strictPort --host 127.0.0.1',
		url: 'http://127.0.0.1:4174',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
