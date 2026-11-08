// Deutsch: die Benchmark-Fragen und die Prompts zum Einfügen in den Agenten (siehe server/localize.ts).
// Prompts an den Agenten duzen ihn, wie man mit Agenten schreibt.
import type { BuildCopy } from '#lib/server/localize.ts';

const copy: BuildCopy = {
	questions: {
		'docs-config-path': 'Mit welcher Umgebungsvariable liest Orbit seine Konfigurationsdatei aus einem anderen Pfad?',
		'docs-deploy-strategies': 'Welche Rollout-Strategien kann ich bei orbit deploy wählen?',
		'docs-deploy-timeout': 'Was ist der Standard-Timeout von `orbit deploy`, und welches Flag ändert ihn?',
		'docs-exit-code': 'Mein CI-Schritt ist mit orbit-Exit-Code 4 fehlgeschlagen. Was bedeutet das?',
		'docs-retained-releases': 'Wie viele frühere Releases behält Orbit standardmäßig für ein Rollback?',
		'live-cloudflare-d1-database-size':
			'Ich nutze den Plan Workers Paid. Wie groß darf eine einzelne Cloudflare-D1-Datenbank maximal werden?',
		'live-cloudflare-kv-key-size':
			'Wie lang darf ein Key in Cloudflare Workers KV sein? Ich suche die maximale Key-Größe.',
		'live-cloudflare-kv-value-size':
			'Wie groß darf ein einzelner Wert in Cloudflare Workers KV maximal sein?',
		'live-cloudflare-queues-message-size':
			'Wie groß darf eine Nachricht an eine Cloudflare Queue höchstens sein? Ich brauche das Größenlimit pro Nachricht.',
		'live-cloudflare-workers-free-requests':
			'Wie viele Requests pro Tag schaffen meine Workers im Cloudflare-Plan Workers Free, bevor das Limit greift?',
		'live-notion-page-size':
			'Ich paginiere durch Ergebnisse der Notion API. Welche page_size kann ich bei den List-Endpoints maximal pro Aufruf anfordern?',
		'live-notion-rate-limit-code':
			'Wenn meine Notion-Integration zu viele Requests sendet: Welchen Fehlercode-String schreibt die API in den Response-Body?',
		'live-notion-request-limit':
			'Wie viele Requests pro Minute erlaubt die Notion API pro Verbindung in Plänen außer Business und Enterprise?',
		'live-notion-rich-text-limit':
			'Ich schreibe lange Absätze über die API in eine Notion-Seite. Wie viele Zeichen darf der Textinhalt eines einzelnen Rich-Text-Objekts in einem Request höchstens haben?',
		'live-notion-upload-size':
			'Wie groß darf eine Datei bei einem Single-Part-Upload an die Notion API höchstens sein, bevor ich auf einen Multi-Part-Upload umsteigen muss?',
		'live-spec-contrast':
			'Welches Mindest-Kontrastverhältnis verlangt die Spec dieser Website für Fließtext in normaler Größe?',
		'live-spec-hsts': 'Welches max-age soll laut dieser Spec in meinem HSTS-Header für Produktion stehen?',
		'live-spec-inp': 'Welchen INP-Wert setzt diese Spec als Ziel für gute Reaktionsfähigkeit?',
		'live-spec-meta-description': 'Wie lang sollte die Meta-Description einer Seite laut dieser Spec sein?',
		'live-spec-touch-target':
			'Welche Mindestgröße für Touch-Ziele verlangt diese Spec bei Buttons und anderen interaktiven Elementen?',
		'live-woo-apparel-count': 'Wie viele Produkte hat dieser Shop in der Kategorie Apparel, und welche sind es?',
		'live-woo-cheapest-in-stock': 'Was ist das günstigste vorrätige Produkt in diesem Shop, und was kostet es?',
		'live-woo-notebook-stock':
			'Ich möchte ein paar Agent Notebooks für mein Team kaufen. Wie viele sind noch auf Lager?',
		'live-woo-on-sale': 'Ist in diesem Shop gerade etwas im Angebot? Wie hoch ist der Angebotspreis?',
		'live-woo-out-of-stock': 'Welches Produkt in diesem Shop ist ausverkauft?',
		'store-cart-total':
			'Leg eine Stoneware Teapot und eine Speckled Bowl in meinen Warenkorb und sag mir dann die Warenkorbsumme.',
		'store-cheapest-blue-mug': 'Leg zwei Stück der günstigsten blauen Tasse in meinen Warenkorb.',
		'store-green-gift': 'Ich brauche ein grünes Geschenk unter $30, das ich sofort kaufen kann. Was haben Sie da?',
		'store-priciest-teapot': 'Leg die teuerste Teekanne aus dem Sortiment in meinen Warenkorb.',
		'store-restock-date':
			'Wann ist die Ash Glaze Vase wieder auf Lager? Nenn das Datum so, wie der Shop es schreibt.'
	},
	prompts: {
		mcp: 'Nutze WebMCP auf jeder Webseite, mit der du arbeitest, zuerst, bevor du irgendetwas liest oder anklickst: in deinem eigenen Browser und in jedem Skript, das du schreibst oder ausführst (Playwright, Selenium, Puppeteer, browser-use, CDP), auch wenn du WebMCP nativ unterstützt. Richte es mit webmcpx ein (lies https://webmcpx.dev/llms.txt) und nimm diese Regel in deine Agent-Anweisungen auf (AGENTS.md, CLAUDE.md oder Entsprechendes), damit sie für jede künftige Aufgabe gilt. Beweise dann, dass es funktioniert: Öffne https://webmcpx.dev, liste die WebMCP-Tools der Seite auf und rufe eines auf.',
		agent: 'Füge dieser Website mit webmcpx WebMCP hinzu: Führe `npx skills add webmcpx/webmcpx -y` aus, folge dem Skill und prüfe dann die Tools mit `npx webmcpx tools <local URL>`.',
		own: 'Lies https://webmcpx.dev/llms.txt, sieh dir dann dieses Projekt an und schlag die WebMCP-Tools vor, die ein KI-Agent hier nützlich fände. Frag mich, welche ich will, und füge sie dann mit webmcpx hinzu.'
	}
};

export default copy;
