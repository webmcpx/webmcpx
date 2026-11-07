// Splits `webmcpx lint` text output into lines with a tone, for coloring the terminal sample.

export type Tone = 'error' | 'warning' | 'snippet' | 'summary' | 'plain';

export interface Line {
	text: string;
	tone: Tone;
}

export function toneOf(line: string): Tone {
	if (/^\S+:\d+:\d+: error/.test(line)) return 'error';
	if (/^\S+:\d+:\d+: warning/.test(line)) return 'warning';
	if (line.startsWith('  |')) return 'snippet';
	if (/^\d+ error\(s\)/.test(line)) return 'summary';
	return 'plain';
}

export const lines = (output: string): Line[] =>
	output.split('\n').map((text) => ({ text, tone: toneOf(text) }));
