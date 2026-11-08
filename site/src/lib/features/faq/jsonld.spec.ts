import { describe, expect, it } from 'vitest';
import { homeJsonLd, jsonForScript } from './jsonld.ts';

describe('homeJsonLd', () => {
	it('publishes each question with its answer', () => {
		const [, faq] = homeJsonLd({ items: { a: { q: 'Q?', a: 'A.' } } }, 'desc', 'en') as {
			mainEntity: { name: string; acceptedAnswer: { text: string } }[];
		}[];
		expect(faq.mainEntity).toEqual([
			{ '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } }
		]);
	});
	it('cannot close its script tag early', () => {
		expect(jsonForScript({ a: '</script><b>' })).not.toContain('<');
	});
});
