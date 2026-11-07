import { describe, expect, it } from 'vitest';
import { fmt, parts, plural } from './format.ts';

describe('fmt', () => {
	it('fills placeholders and keeps unknown ones', () => {
		expect(fmt('Try again in {s} s.', { s: 52 })).toBe('Try again in 52 s.');
		expect(fmt('{a} and {b}', { a: 'x' })).toBe('x and {b}');
	});
});

describe('plural', () => {
	const forms = { one: '{n} tool', other: '{n} tools' };

	it('picks the form by the language rules', () => {
		expect(plural(1, forms)).toBe('{n} tool');
		expect(plural(0, forms)).toBe('{n} tools');
		expect(plural(3, forms)).toBe('{n} tools');
		expect(plural(3, { one: 'a', few: 'b', many: 'c', other: 'd' }, 'ru-RU')).toBe('b');
		expect(plural(5, { one: 'a', few: 'b', many: 'c', other: 'd' }, 'ru-RU')).toBe('c');
	});

	it('falls back to other when a form is missing', () => {
		expect(plural(1, { other: '{n} 件' }, 'ja-JP')).toBe('{n} 件');
		expect(plural(3, { one: 'a', other: 'z' }, 'ru-RU')).toBe('z');
	});
});

describe('parts', () => {
	it('alternates text and placeholder names', () => {
		expect(parts('Make your site {mark}.')).toEqual(['Make your site ', 'mark', '.']);
		expect(parts('{a}{b}')).toEqual(['', 'a', '', 'b', '']);
		expect(parts('plain')).toEqual(['plain']);
	});
});
