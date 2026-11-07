import type { Arm } from './bench.ts';

/** How each benchmark arm is named and colored, everywhere it appears. */
export const ARMS: { arm: Arm; label: string; bar: string; text: string }[] = [
	{ arm: 'baseline', label: 'Without WebMCP', bar: 'bg-paper-2 border-2 border-ink', text: 'text-ink-3' },
	{ arm: 'webmcp', label: 'With webmcpx', bar: 'bg-marker border-2 border-ink', text: 'text-ink' }
];
