import type { Attachment } from 'svelte/attachments';

/**
 * Marks an element visible the first time it scrolls into view. Use it through `<Reveal>`, which also
 * renders the `reveal` class on the server, so nothing flickers on hydration. The hidden state lives in
 * base.css and only applies when JavaScript runs.
 */
export function reveal(): Attachment<HTMLElement> {
	return (node) => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					node.dataset.visible = '';
					observer.disconnect();
				}
			},
			{ rootMargin: '0px 0px -10% 0px' }
		);
		observer.observe(node);
		return () => observer.disconnect();
	};
}
