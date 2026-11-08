import { describe, expect, it } from 'vitest';
import { codeParts } from './code.ts';

describe('codeParts', () => {
	it('marks commands and calls as code, keeping the text around them', () => {
		expect(codeParts('Run claude mcp add webmcpx -- npx -y webmcpx mcp, then tool().')).toEqual([
			{ text: 'Run ', code: false },
			{ text: 'claude mcp add webmcpx -- npx -y webmcpx mcp', code: true },
			{ text: ', then ', code: false },
			{ text: 'tool()', code: true },
			{ text: '.', code: false }
		]);
	});
	it('leaves plain text alone', () => {
		expect(codeParts('No code here.')).toEqual([{ text: 'No code here.', code: false }]);
	});
});
