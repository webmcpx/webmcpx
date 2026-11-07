import type { Arm } from './bench.ts';

/** How each benchmark arm is colored, everywhere it appears (its name: `proof.arms.<arm>`). */
export const ARMS: { arm: Arm; bar: string; text: string }[] = [
	{ arm: 'baseline', bar: 'bg-paper-2 border-2 border-ink', text: 'text-ink-3' },
	{ arm: 'webmcp', bar: 'bg-marker border-2 border-ink', text: 'text-ink' }
];
