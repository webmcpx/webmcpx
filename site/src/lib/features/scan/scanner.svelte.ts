// The one scan the page shows. The hero form, the logo wall and the last section all drive it.

import { normalize, scan, type Report } from './scan.ts';

class Scanner {
	input = $state('');
	status = $state<'idle' | 'loading' | 'done' | 'error'>('idle');
	report = $state<Report | null>(null);
	error = $state('');
	/** Increments on every finished scan, so views can react (scroll into view). */
	runs = $state(0);
	#current = 0;

	async run(raw: string = this.input) {
		const url = normalize(raw);
		if (!url) {
			this.status = 'error';
			this.error = 'Type a site like notion.com or https://example.com/docs.';
			return;
		}
		this.input = url;
		this.status = 'loading';
		this.report = null;
		const id = ++this.#current;
		const out = await scan(url);
		// A newer scan started meanwhile: drop this result.
		if (id !== this.#current) return;
		if (out.ok) {
			this.report = out.report;
			this.status = 'done';
		} else {
			this.error = out.error;
			this.status = 'error';
		}
		this.runs++;
	}
}

export const scanner = new Scanner();
