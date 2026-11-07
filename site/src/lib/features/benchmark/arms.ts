import type { Arm } from './bench.ts';

/** How each benchmark arm is named and colored, everywhere it appears. */
export const ARMS: { arm: Arm; label: string; bar: string; text: string }[] = [
	{ arm: 'baseline', label: 'Without WebMCP', bar: 'bg-baseline', text: 'text-subtle' },
	{ arm: 'webmcp', label: 'With webmcpx', bar: 'bg-accent', text: 'text-fg' }
];
