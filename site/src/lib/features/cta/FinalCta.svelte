<!-- The last screen repeats the one action that matters. -->
<script lang="ts">
	import { siGithub } from 'simple-icons';
	import BrandIcon from '#lib/components/ui/BrandIcon.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { REPO } from '#lib/content/site.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import ScanForm from '#lib/features/scan/ScanForm.svelte';
</script>

<section aria-labelledby="cta-title" class="px-3 sm:px-5">
	<Reveal>
		<div class="rounded-frame border-2 border-ink bg-marker px-4 py-16 text-center sm:py-24">
			<h2 id="cta-title" class="font-display text-display font-bold text-balance">Is your site next?</h2>
			<p class="mx-auto mt-4 max-w-md text-lg text-ink-2">Scan it, fix it in one line, scan it again.</p>
			<div class="mt-9"><ScanForm size="md" /></div>
			<div class="mt-8">
				<Button href={REPO} variant="outline" size="sm"
					><BrandIcon icon={siGithub} size={16} />Star on GitHub</Button
				>
			</div>
		</div>
	</Reveal>
</section>
