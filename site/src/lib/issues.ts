// Pain points reported in the WebMCP spec tracker and how webmcpx handles them.
// Keep in sync with what the code does; every row must be true today.

export interface Issue {
	number: number | null;
	pain: string;
	fix: string;
}

export const ISSUES: Issue[] = [
	{
		number: 319,
		pain: 'Hundreds of sites hand-roll the same tools: search_site and fetch_as_markdown top the list.',
		fix: 'Standard search_page, fetch_as_markdown, get_page_context and search_site, one script tag.'
	},
	{
		number: 282,
		pain: 'A rejected tool call reaches the agent as a bare UnknownError.',
		fix: 'Tools never reject: every result is an envelope with a stable error code, retryable flag and hint.'
	},
	{
		number: 292,
		pain: 'Results are untyped and cannot say they were truncated.',
		fix: 'Output budgets, truncated + next_cursor paging, the same shape for every tool.'
	},
	{
		number: 293,
		pain: 'Some agent browsers expose a frozen modelContext; polyfills silently fail.',
		fix: 'Only registerTool() is called, never an assignment. Tested against a frozen host.'
	},
	{
		number: 360,
		pain: 'Zero-width, bidi and tag characters hide instructions from humans.',
		fix: 'Stripped from page text at runtime; the linter flags and --fix removes them in source.'
	},
	{
		number: 359,
		pain: 'No agreed limits for names and descriptions; hosts may cut them.',
		fix: 'webmcpx lint warns at Chrome’s guidance and errors at the proposed host floors.'
	},
	{
		number: 255,
		pain: 'A page with 126 tools got WebMCP disabled.',
		fix: 'The tool-budget rule warns above 20 tools per page and errors above 100.'
	}
];

export const issueUrl = (n: number) => `https://github.com/webmachinelearning/webmcp/issues/${n}`;
