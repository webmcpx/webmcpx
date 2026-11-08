// Logos of the sites shown on the page, as path data only (no markup, no scripts), drawn in
// currentColor so they follow the design system. Real brands use their own published artwork,
// never a redrawing: the source of each is noted. Logos belong to their owners; showing one only states
// that the site ships WebMCP. Our fictional test brands (Orbit, Kiln & Co) have original marks.

import {
	siAnthropic,
	siCloudflare,
	siGooglegemini,
	siNotion,
	siWoocommerce,
	type SimpleIcon
} from 'simple-icons';

export interface Logo {
	viewBox: string;
	/** Filled shapes. */
	paths: { d: string; evenodd?: boolean }[];
	/** Lines drawn in currentColor (round caps and joins). */
	strokes?: { d: string; width: number }[];
	/** Strokes knocked out of the filled shapes (for marks drawn as a line on a tile). */
	cutouts?: { d: string; width: number }[];
	/** The logo spells the name, so the label is not repeated next to it. */
	wordmark: boolean;
}

export const fromSimpleIcon = (icon: SimpleIcon, viewBox = '0 0 24 24', wordmark = false): Logo => ({
	viewBox,
	paths: [{ d: icon.path }],
	wordmark
});

/** simple-icons (CC0, collected from each brand's guidelines). */
export const NOTION = fromSimpleIcon(siNotion);
export const CLOUDFLARE = fromSimpleIcon(siCloudflare);
/** simple-icons; cropped to the mark's bounds (measured: 24 x 4.84), it is a wide wordmark. */
export const WOOCOMMERCE = fromSimpleIcon(siWoocommerce, '0 9.58 24 4.84', true);

// Model providers, for the benchmark's model switcher.
/** simple-icons. */
export const ANTHROPIC = fromSimpleIcon(siAnthropic);
export const GEMINI = fromSimpleIcon(siGooglegemini);
/** OpenAI's blossom, from its own wordmark file (https://commons.wikimedia.org/wiki/File:OpenAI_Logo.svg,
 * credited to OpenAI), the mark only; the bounds are measured (316 x 320). */
export const OPENAI: Logo = {
	viewBox: '0 0 320 320',
	paths: [
		{
			d: 'm297.06 130.97c7.26-21.79 4.76-45.66-6.85-65.48-17.46-30.4-52.56-46.04-86.84-38.68-15.25-17.18-37.16-26.95-60.13-26.81-35.04-.08-66.13 22.48-76.91 55.82-22.51 4.61-41.94 18.7-53.31 38.67-17.59 30.32-13.58 68.54 9.92 94.54-7.26 21.79-4.76 45.66 6.85 65.48 17.46 30.4 52.56 46.04 86.84 38.68 15.24 17.18 37.16 26.95 60.13 26.8 35.06.09 66.16-22.49 76.94-55.86 22.51-4.61 41.94-18.7 53.31-38.67 17.57-30.32 13.55-68.51-9.94-94.51zm-120.28 168.11c-14.03.02-27.62-4.89-38.39-13.88.49-.26 1.34-.73 1.89-1.07l63.72-36.8c3.26-1.85 5.26-5.32 5.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zm-128.84-55.03c-7.03-12.14-9.56-26.37-7.15-40.18.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83l-64.41 37.19c-28.69 16.52-65.33 6.7-81.92-21.95zm-16.77-139.09c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91-26.93 15.55c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94-7.01 12.14-18.05 21.44-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8c-3.23-1.89-7.23-1.89-10.47 0l-77.79 44.92v-31.1c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22 6.99 12.12 9.52 26.31 7.15 40.1zm-168.51 55.43-26.94-15.55c-.29-.14-.48-.42-.52-.74v-74.39c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07l-63.72 36.8c-3.26 1.85-5.26 5.31-5.24 9.06l-.04 89.79zm14.63-31.54 34.65-20.01 34.65 20v40.01l-34.65 20-34.65-20z'
		}
	],
	wordmark: false
};



/** https://specification.website/favicon.svg (2026-11-07): the line is cut out of the tile. */
export const SPECIFICATION_WEBSITE: Logo = {
	viewBox: '0 0 64 64',
	paths: [{ d: 'M12 0h40a12 12 0 0 1 12 12v40a12 12 0 0 1-12 12H12A12 12 0 0 1 0 52V12A12 12 0 0 1 12 0z' }],
	cutouts: [{ d: 'M12 26 L22 46 L30 31 L38 46 L52 18', width: 6 }],
	wordmark: false
};

/** Original mark for the Orbit docs test site, drafted with Codex image generation, hand-built SVG. */
export const ORBIT: Logo = {
	viewBox: '0 0 24 24',
	paths: [{ d: 'M16.75 5a2.25 2.25 0 1 0 4.5 0a2.25 2.25 0 1 0-4.5 0Z' }],
	strokes: [{ d: 'M12.3 5.11A7.5 7.5 0 1 0 18.5 12.5', width: 3.5 }],
	wordmark: false
};

/** Original mark for the Kiln & Co test store, drafted with Codex image generation, hand-built SVG. */
export const KILN: Logo = {
	viewBox: '0 0 24 24',
	paths: [
		{
			d: 'M9 5.01V2.5h6v2.51A9 9 0 0 1 21 13.5v7a1 1 0 0 1-1 1h-4v-8a4 4 0 0 0-8 0v8H4a1 1 0 0 1-1-1v-7a9 9 0 0 1 6-8.49Z'
		},
		{ d: 'M12.4 12c.7 3-2.9 3.8-2.9 6.2a2.5 2.5 0 0 0 5 0c0-1.9-1-2.8-2.1-6.2Z' }
	],
	wordmark: false
};
