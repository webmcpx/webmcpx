// The landing is fully static: prerendered at build time, hydrated in the browser.
export const prerender = true;
// Every page is written as <route>/index.html, which any static server (including `just serve`) serves.
export const trailingSlash = 'always';
