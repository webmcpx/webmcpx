// Light/dark theme. The initial value is applied by the inline script in app.html (before first paint);
// this module only reads it back and switches it.

export type ThemeName = 'light' | 'dark';

class Theme {
	current = $state<ThemeName>('dark');

	/** Reads the theme app.html applied. Call once on the client. */
	sync() {
		this.current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
	}

	toggle() {
		const next: ThemeName = this.current === 'dark' ? 'light' : 'dark';
		const apply = () => {
			document.documentElement.dataset.theme = next;
			this.current = next;
		};
		try {
			localStorage.setItem('theme', next);
		} catch {
			// Storage can be blocked; the switch still works for this visit.
		}
		// A cross-fade where supported; the reduced-motion rule in base.css shortens it to nothing.
		if (document.startViewTransition) document.startViewTransition(apply);
		else apply();
	}
}

export const theme = new Theme();
