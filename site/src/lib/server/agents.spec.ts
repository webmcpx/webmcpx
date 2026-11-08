import { describe, expect, it } from 'vitest';
import { homeMarkdown, llmsTxt } from './agents.ts';

// The pages for agents are built from the site's copy: a {placeholder} left unfilled is published as is.
describe('pages for agents', () => {
	it('fill every placeholder of the copy', () => {
		for (const text of [homeMarkdown(), llmsTxt()]) expect(text).not.toMatch(/\{[a-zA-Z]+\}/);
	});
});
