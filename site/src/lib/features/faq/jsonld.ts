// Structured data for the home page (schema.org JSON-LD): what webmcpx is, and the FAQ's questions and
// answers, from the same copy the page shows.
import { ORIGIN, REPO } from '#lib/content/site.ts';

export interface Faq {
	items: Record<string, { q: string; a: string }>;
}

export function homeJsonLd(faq: Faq, description: string, lang: string): object[] {
	return [
		{
			'@context': 'https://schema.org',
			'@type': 'SoftwareApplication',
			name: 'webmcpx',
			applicationCategory: 'DeveloperApplication',
			operatingSystem: 'Any (browser, Node.js)',
			description,
			url: `${ORIGIN}/`,
			codeRepository: REPO,
			license: 'https://opensource.org/licenses/MIT',
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
			inLanguage: lang
		},
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			inLanguage: lang,
			mainEntity: Object.values(faq.items).map((i) => ({
				'@type': 'Question',
				name: i.q,
				acceptedAnswer: { '@type': 'Answer', text: i.a }
			}))
		}
	];
}

/** JSON for a <script type="application/ld+json">: `<` escaped, so no text can close the script early. */
export const jsonForScript = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
