// Links and names used across the site. One place to change them.
// Internal links go through resolve(), so the site also works under a base path.

import { resolve } from '$app/paths';

export const REPO = 'https://github.com/webmcpx/webmcpx';
export const NPM = 'https://www.npmjs.com/package/webmcpx';
export const SPEC = 'https://webmachinelearning.github.io/webmcp/';
export const SPEC_ISSUES = 'https://github.com/webmachinelearning/webmcp/issues';
export const COMMUNITY = 'https://webmcp.zone';

export const NAV = [
	{ label: 'Benchmark', href: `${resolve('/')}#benchmark` },
	{ label: 'How it works', href: `${resolve('/')}#how` },
	{ label: 'Issues', href: `${resolve('/')}#issues` },
	{ label: 'Playground', href: `${resolve('/')}#playground` },
	{ label: 'Lint', href: `${resolve('/')}#lint` }
];

export const HOME = resolve('/');
export const DESIGN = resolve('/design');
