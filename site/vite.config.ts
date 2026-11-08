import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
			},
			adapter: adapter(),
			// Inline the stylesheet (~10 KB gzip, ~50 KB raw) into the prerendered HTML: no render-blocking
			// request. Raise it with the stylesheet: past the threshold the CSS silently becomes a blocking file.
			inlineStyleThreshold: 64_000
		})
	],
	// In `vite dev`, the scan API comes from `just serve` (the Rust server).
	server: { proxy: { '/api': 'http://127.0.0.1:4173' } },
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
