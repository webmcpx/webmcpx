// German (Germany, Austria, Switzerland). Transcreated from en.ts: same keys, same placeholders.
// Register: Sie, sachlich. Key term: "agent-ready" = "agentenfähig".
import type { Messages } from './en.ts';

const de: Messages = {
	layout: {
		skip: 'Zum Inhalt springen',
		suggest: {
			text: 'Diese Website gibt es auch auf Deutsch.',
			action: 'Auf Deutsch lesen',
			dismiss: 'Schließen'
		}
	},

	meta: {
		verdicts: {
			title: 'So entstehen die Scan-Urteile · webmcpx',
			description:
				'Was jedes Scan-Urteil bedeutet, wie ein Scan abläuft und wo du ein falsches Urteil meldest.'
		},
		home: {
			title: 'webmcpx: WebMCP für jede Website und jeden Agenten',
			description:
				'Prüfen Sie jede Website auf WebMCP-Tools, machen Sie Ihre mit einer Zeile agentenfähig und geben Sie Claude Code oder Codex überall WebMCP. Open Source.'
		},
		brand: {
			title: 'Marke und Designsystem · webmcpx',
			description:
				'Markenhandbuch und Designsystem von webmcpx: Logo, Farbe, Schrift, Komponenten und Markennutzung.'
		},
		benchmark: {
			title: 'webmcpx-Benchmark: {model}',
			description: 'Mit und ohne WebMCP auf {model}: Tokens, Zeit, Schritte und Kosten pro Frage.'
		}
	},

	header: {
		nav: 'Hauptnavigation',
		home: 'Startseite',
		menu: 'Menü',
		language: 'Sprache',
		links: {
			why: 'Warum',
			proof: 'Rangliste',
			vsMcp: 'vs. MCP',
			sites: 'Für Websites',
			agents: 'Für Agenten',
			issues: 'Issues',
			docs: 'Doku'
		}
	},

	footer: {
		tagline: 'Standard-WebMCP-Tools für jede Website, ein Linter für Ihre eigenen.',
		license: 'MIT-Lizenz · ein unabhängiges Community-Projekt.',
		badge: 'Diese Website ist agentenfähig: live prüfen',
		columns: { product: 'Produkt', project: 'Projekt', webmcp: 'WebMCP' },
		links: {
			scan: 'Website scannen',
			verdicts: 'So entstehen die Urteile',
			proof: 'Rangliste',
			sites: 'Für Websites',
			agents: 'Für Agenten',
			issues: 'Gelöste Issues',
			brand: 'Marke und Design',
			trademark: 'Markenrichtlinie',
			spec: 'Spezifikationsentwurf',
			specIssues: 'Spec-Issues'
		},
		notices: [
			'webmcpx ist ein unabhängiges Projekt. Es ist weder mit LF Projects, der Agentic AI Foundation, Anthropic, W3C, Google oder Microsoft verbunden noch wird es von ihnen unterstützt.',
			'Model Context Protocol und das MCP-Logo sind Marken von LF Projects, LLC.',
			'W3C® ist eine Marke des World Wide Web Consortium.'
		]
	},

	hero: {
		stamp: 'Neu',
		draft: 'Folgt dem WebMCP-Entwurf vom {date}',
		title: { text: 'Machen Sie Ihre Website {mark}', mark: 'agentenfähig' },
		lead: 'In unserem Benchmark brauchten Agenten mit WebMCP bis zu {best} weniger Tokens (bester Fall: {site}, {model}). Sehen Sie, was Agenten von Ihrer Website bekommen, und beheben Sie es mit einer Zeile.',
		// Without a published run (no number to quote).
		leadPlain:
			'KI-Agenten lesen Ihre Seiten längst. Sehen Sie, was bei ihnen ankommt, und geben Sie ihnen mit einer Zeile echte Tools.',
		try: 'Testen Sie {sites}',
		entry: { question: 'Keine Website, nur Agenten?', agent: 'Agent einrichten' }
	},

	logos: {
		title: {
			text: '{count} sprechen schon WebMCP',
			count: { one: '{n}+ Website', other: '{n}+ Websites' }
		},
		lead: 'Klicken Sie auf ein Logo, um die Website live zu scannen.',
		scan: '{site}: diese Website scannen',
		note: 'Zählung: Live-Websites im {directory} (Stand {date}). Der strengere {knownGood} sah beim Ausführen der Seiten {n} Websites Tools registrieren ({verifiedDate}). Logos am {checked} mit dem Scanner geprüft; sie gehören ihren Inhabern, es besteht keine Verbindung.',
		directory: 'webmcp.com-Verzeichnis',
		knownGood: 'Known-Good-Index'
	},

	sources: {
		title: 'Quellen',
		draft: 'WebMCP-Entwurf',
		explainer: 'WebMCP-Explainer',
		ours: 'Unser Benchmark',
		snapshotCost: 'Snapshot-Kosten, gemessen',
		shopifyCheckout: 'Shopify-Checkout',
		mcpSpec: 'MCP-Spezifikation',
		shopifyBoth: 'Shopify nutzt beides'
	},

	why: {
		kicker: 'Warum WebMCP?',
		title: 'Was Ihre Website mit WebMCP gewinnt',
		lead: 'Mit WebMCP übergibt Ihre Seite KI-Agenten typisierte Tools, die im eigenen Tab des Nutzers laufen. Was sich dadurch ändert, die stärksten Belege zuerst.',
		today: 'Heute',
		with: 'Mit WebMCP',
		reasons: {
			finish: {
				title: 'Agenten, die ans Ziel kommen',
				pain: 'Auf Live-Websites scheiterte der beste getestete Agent an rund 4 von 10 Aufgaben, meist an Filtern, Sortierung und Navigation.',
				gain: 'Agenten rufen ein Tool mit typisierter Eingabe auf, statt zu raten, welcher Button was tut.'
			},
			tokens: {
				title: 'Ein Bruchteil der Tokens',
				pain: 'Ein einziger Seiten-Snapshot kann 12.000 bis 77.000 Tokens kosten, und der Agent schickt ihn bei jedem Schritt erneut.',
				gain: 'Ein Aufruf liefert nur die angefragten Daten: in unserem Benchmark bis zu {best} weniger Tokens auf {bestSite} (im besten Fall).'
			},
			speed: {
				title: 'Sekunden statt Minuten',
				pain: 'Schauen, überlegen, klicken, wiederholen: Bei schwierigen Live-Aufgaben liefen Agenten bis zu 44 Minuten.',
				gain: 'Ein Aufruf ersetzt eine ganze Klickkette: im Benchmark von WindTunnel im Median 3,4× schneller.'
			},
			backend: {
				title: 'Kein neuer Server. Kein OAuth',
				pain: 'Wer Agenten eine API anbieten will, braucht meist ein eigenes Backend, doppelten State und einen Auth-Flow.',
				gain: 'Tools sind Ihr Frontend-Code und laufen mit der Session, die der Nutzer bereits hat. Shopify setzt es genau so ein.'
			},
			loop: {
				title: 'Der Nutzer behält die Kontrolle',
				pain: 'Agenten handeln im Verborgenen oder schicken den Nutzer woandershin.',
				gain: 'Der Agent arbeitet auf der Seite, die der Nutzer sieht, und Tools können Aktionen kennzeichnen, die eine Bestätigung brauchen.'
			},
			state: {
				title: 'Warenkorb und Formular bleiben',
				pain: 'Eine Backend-API sieht weder Warenkorb noch Formular oder Auswahl im Tab des Nutzers.',
				gain: 'Tools arbeiten mit dem Zustand, den der Nutzer sieht; die Seite aktualisiert sich, während der Agent arbeitet.'
			},
			control: {
				title: 'Sie bestimmen, was Agenten tun',
				pain: 'Ein Agent, der die Seite liest, kann alles anklicken, was auch der Nutzer anklicken kann.',
				gain: 'Sie veröffentlichen die Aktionen, ihre Eingaben und Ihre eigene Validierung.'
			},
			small: {
				title: 'Kleiner Aufwand, kein Risiko',
				pain: 'Agentenfähigkeit klingt nach einem großen Projekt.',
				gain: 'Ein paar Tool-Registrierungen. Browser ohne WebMCP überspringen sie, und ein Header schaltet sie ab.'
			}
		},
		status:
			'WebMCP ist ein Entwurf der W3C Community Group (2. November 2026), kein W3C-Standard. Der Browser der ChatGPT-Desktop-App und Codex können die WebMCP-Tools einer Website aufrufen; Chrome bietet es hinter einem Flag oder als Origin Trial an. Annotationen sind Hinweise, die eine Website deklariert, keine Garantien.',
		also: 'Außerdem:'
	},

	proof: {
		kicker: 'Rangliste',
		title: 'Wie viel WebMCP spart, Modell für Modell',
		lead: 'Ein Agent liest, klickt und füllt Formulare anhand von Seiten-Snapshots aus; der andere ruft die WebMCP-Tools der Website auf. Wählen Sie ein Modell; größte Einsparungen zuerst.',
		byModel: 'Benchmark nach Modell',
		models: 'Modelle',
		model: 'Modell',
		site: 'Website',
		rank: 'Platz {n}',
		ranking: 'Sortiert nach Erfolg mit WebMCP, dann nach Kosten pro Lauf.',
		modelHeading: '{name} ({provider})',
		empty: {
			title: 'Noch kein Lauf veröffentlicht',
			text: 'Führen Sie {command} aus, dann erscheinen hier die Ergebnisse.'
		},
		selected: {
			one: 'Ausgewählte Fälle: {shown} von {total} Frage, bei denen WebMCP höchstens die Hälfte der Tokens brauchte. {results} sind öffentlich, oder Sie führen den Benchmark selbst mit {command} aus.',
			other:
				'Ausgewählte Fälle: {shown} von {total} Fragen, bei denen WebMCP höchstens die Hälfte der Tokens brauchte. {results} sind öffentlich, oder Sie führen den Benchmark selbst mit {command} aus.'
		},
		results: 'Alle Ergebnisse',
		none: {
			title: 'Auf {model} erfüllte keine Frage das Kriterium',
			text: 'Alle Fragen und beide Varianten stehen in den vollständigen Ergebnissen oben.'
		},
		local: 'lokal',
		arms: { baseline: 'Ohne WebMCP', webmcp: 'Mit WebMCP' },
		tokens: 'Tokens',
		stats: '{time} · {steps} Schritte · {cost} pro Aufgabe',
		na: 'k. A.',
		solved: 'Gelöst {n}',
		failed: 'Erfolglos {n}',
		fewerTokens: 'weniger Tokens',
		moreTokens: 'mehr Tokens',
		open: 'Öffnen',
		opens: '(öffnet {site})',
		rotator: {
			label: 'Fragen',
			pause: 'Rotation anhalten',
			resume: 'Rotation fortsetzen'
		},
		details: 'Details zu {site}',
		tabs: {
			tokens: 'Tokens',
			duration_ms: 'Zeit',
			steps: 'Schritte',
			cost_usd: 'Kosten',
			tools: 'Tools',
			method: 'Methode'
		},
		metrics: {
			tokens: { label: 'Tokens', unit: 'Tokens pro Lauf', column: 'Tokens' },
			duration_ms: { label: 'Zeit', unit: 'Sekunden pro Lauf', column: 'Zeit' },
			steps: { label: 'Schritte', unit: 'Modellaufrufe pro Lauf', column: 'Schritte' },
			cost_usd: { label: 'Kosten', unit: 'USD pro Aufgabe', column: 'Kosten' }
		},
		chart: {
			question: 'Frage',
			solved: 'Gelöst',
			head: '{metric} · {unit}',
			better: 'Kürzer ist besser',
			caption: '{metric} pro Frage, {unit}; niedriger ist besser. Erfolgsquote pro Variante.',
			armMetric: '{arm}: {metric}',
			armSolved: '{arm}: gelöst',
			row: '{site}: {question}',
			localSite: '{site} (lokale Test-Website)'
		},
		method: {
			setup: {
				one: '{model}, Reasoning {effort}, Headless Chrome. Gleicher Prompt und gleiches Schrittlimit in beiden Varianten; {n} Lauf pro Frage und Variante.',
				other:
					'{model}, Reasoning {effort}, Headless Chrome. Gleicher Prompt und gleiches Schrittlimit in beiden Varianten; {n} Läufe pro Frage und Variante.'
			},
			setupNoEffort: {
				one: '{model}, Headless Chrome. Gleicher Prompt und gleiches Schrittlimit in beiden Varianten; {n} Lauf pro Frage und Variante.',
				other:
					'{model}, Headless Chrome. Gleicher Prompt und gleiches Schrittlimit in beiden Varianten; {n} Läufe pro Frage und Variante.'
			},
			baseline: 'Ohne WebMCP: ein DOM-Snapshot-Agent, der liest, klickt und Formulare ausfüllt.',
			webmcp:
				'Mit WebMCP: nur die Tools, die die Seite registriert (eigene oder, auf unseren Testseiten, die von webmcpx).',
			graded: 'Bewertet anhand der Fakten in der Antwort und des Seitenzustands. Kein LLM-Judge.',
			live: 'Eine Live-Website: Sie liefert eigene WebMCP-Tools mit.',
			local: 'Eine lokale Test-Website: Ihre Tools stammen von webmcpx.',
			scope:
				'30 Fragen auf 6 Websites, 27 davon nur lesend; die größten Einsparungen kommen von den Suchwerkzeugen der Websites selbst.',
			runs: '3 Läufe pro Frage und Arm: 3 von 3 ist ein Hinweis, kein Beweis für 100 %.',
			measures:
				'Zeit ist die Agentenschleife nach dem Laden der Seite; Kosten sind die API-Nutzung des Modells zu datierten Listenpreisen, inklusive Cache.',
			failures:
				'Jeder fehlgeschlagene Lauf nennt den Grund in den Ergebnissen (Bot-Sperre, Antwort nicht von der Seite, Schrittlimit…).',
			reproduce: 'selbst nachstellen'
		},
		tools: {
			label: 'WebMCP-Tools auf {site}',
			title: {
				one: '{site} registriert {n} WebMCP-Tool',
				other: '{site} registriert {n} WebMCP-Tools'
			},
			fromRun: 'so, wie der Agent sie sah · {date}',
			fromSnapshot: 'Beschreibungen Stand {date} · Benchmark vom {runDate}',
			tool: 'Tool',
			description: 'Beschreibung',
			called: 'Genutzt',
			notCalled: 'Nicht genutzt',
			missing: '(beim Snapshot nicht registriert)'
		}
	},

	versus: {
		kicker: 'WebMCP vs. MCP',
		title: 'Wie sich WebMCP von MCP unterscheidet und warum Sie beides brauchen',
		lead: 'WebMCP übernimmt das Tool-Modell von MCP, ist aber eine Browser-API und nicht das MCP-Protokoll. Beide ergänzen sich.',
		caption: 'WebMCP im Vergleich mit MCP',
		aspect: 'Aspekt',
		rows: {
			where: {
				label: 'Wo Tools laufen',
				webmcp: 'Im JavaScript Ihrer Seite, im Tab des Nutzers.',
				mcp: 'In einem Serverprozess, lokal (stdio) oder remote.'
			},
			call: {
				label: 'Aufruf durch Agenten',
				webmcp:
					'Eine Browser-API, document.modelContext; der Browser vermittelt jeden Aufruf. Kein JSON-RPC.',
				mcp: 'JSON-RPC 2.0 über stdio oder Streamable HTTP.'
			},
			run: {
				label: 'Was Sie betreiben',
				webmcp: 'Ihr bestehendes Frontend. Kein neuer Server.',
				mcp: 'Einen MCP-Server, den Sie hosten und betreiben.'
			},
			auth: {
				label: 'Auth',
				webmcp:
					'Die Session, mit der der Nutzer schon angemeldet ist. Es müssen keine Tokens ausgestellt werden.',
				mcp: 'OAuth-basierte Autorisierung für Remote-Server.'
			},
			discovery: {
				label: 'Auffindbarkeit',
				webmcp: 'Sobald die Seite offen ist. Vor dem Besuch gibt es nichts zu finden.',
				mcp: 'tools/list an einem bekannten Endpunkt, dazu öffentliche Registries.'
			},
			lifetime: {
				label: 'Lebensdauer',
				webmcp: 'Solange die Seite offen ist.',
				mcp: 'Immer aktiv, ganz ohne Browser.'
			},
			user: {
				label: 'Der Nutzer',
				webmcp: 'Anwesend, auf derselben Seite wie der Agent.',
				mcp: 'Optional: läuft auch headless.'
			},
			covers: {
				label: 'Umfang',
				webmcp: 'Nur Tools, mit Ein- und Ausgabeschemas.',
				mcp: 'Tools, Resources und Prompts, dazu Elicitation und Extensions.'
			},
			hints: {
				label: 'Tool-Hinweise',
				webmcp: 'readOnlyHint, consequentialHint, untrustedContentHint. Standardmäßig Same-Origin.',
				mcp: 'readOnlyHint, destructiveHint, idempotentHint, openWorldHint.'
			},
			status: {
				label: 'Status',
				webmcp:
					'Entwurf der W3C Community Group. ChatGPT Desktop und Codex rufen es auf; Chrome: Origin Trial.',
				mcp: 'Ein Projekt der Linux Foundation, über 10.000 öffentliche Server.'
			}
		},
		useBoth: 'Beides nutzen',
		verdict:
			'MCP bedient Agenten, die Ihre Website nie öffnen. WebMCP bedient Agenten, die in Ihrem Tab arbeiten, neben Ihrem Nutzer. Betreiben Sie beides auf einem Backend: Shopify macht es bereits so.'
	},

	fix: {
		title: 'Für deine Website',
		lead: 'Zwei Teile. Bitte deinen Coding-Agenten (Claude Code, Codex, Cursor) darum oder mach es von Hand.',
		alternatives: { npm: 'npm', agent: 'Agent' },
		facts: '~2,7 KB geladen · Rust + WebAssembly · MIT-Lizenz',
		html: 'Vor {tag} einfügen. In Browsern ohne WebMCP ergänzt es das W3C-Polyfill.',
		standard: {
			title: 'Standard-Tools: eine Zeile',
			lead: 'Suche, Lesen und Seitenkontext auf jeder Seite. Ohne Code.'
		}
	},

	agents: {
		title: 'Für deinen Agenten',
		lead: 'Funktioniert auf jeder Website. Auf den gemessenen Websites: dieselben Antworten, für einen Bruchteil der Tokens. Der MCP, der in jedes Claude-Code- und Codex-Setup gehört.',
		saving: {
			range: { other: '{low} bis {high} weniger Tokens bei allen {n} Modellen der Rangliste.' },
			best: 'Bis zu {high} weniger Tokens in der Rangliste.',
			losses: {
				other: 'Komplette Läufe: Bei {worse} von {total} Fragen pro Modell brauchte WebMCP mehr Tokens.'
			}
		},
		prompt: 'Ein Prompt: Dein Agent richtet sich selbst ein und beweist es auf webmcpx.dev.',
		ways: {
			mcp: {
				label: 'Agenten mit MCP',
				text: 'Claude Code, Codex, Cursor: {cmd} hinzufügen. Er öffnet Seiten in seinem eigenen Chromium, ohne Flag.'
			},
			browser: {
				label: 'Agenten, die einen Browser steuern',
				text: 'Playwright, Selenium, Puppeteer, browser-use, CDP; Chrome, Firefox, Safari: {api} in der Seite aufrufen. Jede Website mit webmcpx hat es.'
			}
		},
		hype: {
			up: 'Bis zu',
			fewer: 'weniger Tokens',
			same: 'Dieselben Antworten.',
			bestCase: 'Bester Fall: {site}, {model}'
		},
		worksWith: 'Läuft mit jedem MCP-Client und Browser',
		tabs: { scripts: 'Skripte' },
		notes: {
			prompt:
				'Ein Prompt: Dein Agent richtet sich ein, nutzt WebMCP überall zuerst und beweist es auf webmcpx.dev.',
			cli: 'Einmal im Terminal ausführen. Danach sind die WebMCP-Tools jeder Seite Tools deines Agenten.',
			cursor: 'In .cursor/mcp.json (oder Settings → MCP). Derselbe Server für jeden MCP-Client.',
			scripts:
				'Dein eigenes Playwright, Selenium oder Puppeteer: Jede Website mit webmcpx hat document.modelContext, in Chrome, Firefox und Safari.'
		}
	},

	own: {
		title: 'Die Aktionen deiner Website',
		lead: 'In den Warenkorb, buchen, im Katalog suchen: die Funktionen, die deine Buttons schon aufrufen, als Tools, die Agenten direkt aufrufen.',
		notes: {
			agent:
				'Dein Agent liest, was webmcpx macht, findet in deinem Projekt die Aktionen, die sich lohnen, fragt dich, welche er hinzufügen soll, und fügt sie dann hinzu und prüft sie.',
			form: 'Ohne JavaScript: die deklarative WebMCP-API. Das Script-Tag ergänzt sie, wo der Browser sie noch nicht hat.',
			js: 'Über npm, oder aus demselben CDN importiert wie das Script-Tag.',
			hook: 'Registriert, solange die Komponente gemountet ist, und wieder weg, wenn sie verschwindet.'
		}
	},

	verdicts: {
		title: 'So entscheidet der Scanner',
		lead: 'Drei Urteile, offene Regeln. Wirkt eins falsch, sag Bescheid: Genau dieses Feedback macht ihn besser.',
		// {rules} is a list of lint rule names (code).
		items: {
			ready:
				'Die Seite registriert mindestens ein WebMCP-Tool, und der Linter findet darin keine Fehler. Warnungen, etwa ein langer Name oder fehlende Annotationen, stehen dem nicht im Weg.',
			issues:
				'Die Seite registriert Tools, aber mindestens eins hat einen Linter-Fehler: {rules}, oder eine Größe über dem harten Limit.',
			missing:
				'Die Seite registriert kein WebMCP-Tool. Wir zeigen, wie viele Tokens ein Agent stattdessen fürs Lesen der Seite verbrauchen würde.'
		},
		how: {
			title: 'So läuft ein Scan ab',
			steps: [
				'Wir öffnen die Seite in einem Headless-Chrome auf unserem Server, ohne Cookies und ohne Login.',
				'Bevor die Skripte der Seite laufen, fügen wir einen WebMCP-Host hinzu, damit die Seite ihre Tools registriert wie im Browser eines Agenten. Er nimmt auch die älteren navigator.modelContext und provideContext an, damit darauf gebaute Seiten ihre Tools trotzdem zeigen.',
				'Sobald die Seite geladen ist und ihre Tools stehen, lesen wir Name, Beschreibung, Eingabeschema und Annotationen jedes Tools und prüfen sie mit dem Linter.',
				'Tokens werden aus dem Text-Snapshot der Seite geschätzt: Zeichenzahl geteilt durch vier.',
				'Ein Ergebnis gilt 10 Minuten; jeder Besucher kann einen neuen Scan pro Minute starten.'
			]
		},
		rules: 'Alle Linter-Regeln mit Begründung',
		disagree: 'Hältst du ein Urteil für falsch? {link}',
		disagreeLink: 'Öffne ein Issue mit dem Scan-Link.'
	},

	issues: {
		kicker: 'Aus dem Spec-Tracker',
		title: 'Spec-Wünsche, die webmcpx schon erfüllt',
		items: {
			shared: {
				title: 'Gemeinsame Tools',
				fix: 'Ein Script-Tag registriert search_page, fetch_as_markdown und get_page_context von webmcpx; search_site, wenn Sie Ihre Suche übergeben.'
			},
			errors: {
				title: 'Auswertbare Fehler',
				fix: 'webmcpx-Tools geben erwartbare Fehler als Ergebnis zurück: mit stabilem Fehlercode, Retry-Flag und Hinweis.'
			},
			paging: {
				title: 'Paginierte Ergebnisse',
				fix: 'Alle webmcpx-Tools nutzen dieselbe Ergebnisform, mit Ausgabebudgets und Paging über truncated + next_cursor.'
			},
			frozen: {
				title: 'Eingefrorenes modelContext',
				fix: 'webmcpx ruft nur registerTool() auf und weist nie zu. Getestet gegen ein eingefrorenes modelContext.'
			},
			hidden: {
				title: 'Versteckte Anweisungen',
				fix: 'Werden zur Laufzeit aus dem Seitentext entfernt; der Linter meldet sie, und --fix entfernt sie im Quellcode.'
			},
			length: {
				title: 'Längenlimits',
				fix: 'webmcpx lint prüft die Namensregeln und meldet Beschreibungen, die über Chromes Empfehlung hinausgehen.'
			},
			budget: {
				title: 'Tool-Budget',
				fix: 'webmcpx lint warnt bei mehr als 20 Tools pro Seite und meldet bei mehr als 100 einen Fehler (unsere Regel, nicht die des Entwurfs).'
			}
		}
	},

	faq: {
		kicker: 'FAQ',
		title: 'Fragen zu WebMCP',
		items: {
			what: {
				q: 'Was ist WebMCP?',
				a: 'Eine Browser-API, entworfen in der W3C Web Machine Learning Community Group: Eine Seite registriert Tools mit document.modelContext.registerTool(), und ein KI-Agent ruft sie auf, statt Screenshots oder das HTML der Seite zu lesen. Die Tools laufen im eigenen Tab des Nutzers.'
			},
			site: {
				q: 'Wie mache ich meine Website agentenfähig?',
				a: 'Binden Sie das webmcpx-Script-Tag ein: Jede Seite bekommt Standard-Tools (Suche, Lesen, Seitenkontext), ganz ohne weiteren Code. Danach registrieren Sie mit tool() eigene Aktionen wie die Suche oder „In den Warenkorb“. Scannen Sie Ihre Website hier, um es zu prüfen.'
			},
			agent: {
				q: 'Wie nutze ich WebMCP in Claude Code oder Codex?',
				a: 'Führen Sie claude mcp add webmcpx -- npx -y webmcpx mcp aus (Codex: codex mcp add webmcpx -- npx -y webmcpx mcp). Ihr Agent öffnet Seiten dann in seinem eigenen Chromium und bekommt auf jeder Website die WebMCP-Tools der Seite plus die Standard-Tools.'
			},
			browsers: {
				q: 'Funktioniert das in Firefox und Safari?',
				a: 'Ja. Wo ein Browser kein eigenes WebMCP mitbringt, lädt webmcpx auf HTTPS-Seiten das WebMCP-Polyfill des W3C. Chrome, Firefox und Safari sehen dieselben Tools.'
			},
			mcp: {
				q: 'Ist WebMCP dasselbe wie MCP?',
				a: 'Nein. WebMCP übernimmt das Tool-Modell von MCP, ist aber eine Browser-API und nicht das MCP-Protokoll: Die Tools leben in der Seite und laufen im Tab des Nutzers. Beide ergänzen sich, und der MCP-Server von webmcpx verbindet sie.'
			}
		}
	},

	scan: {
		form: 'Website scannen',
		address: 'Adresse Ihrer Website',
		placeholder: 'ihre-website.de',
		submit: 'Scannen',
		scanning: 'Scan läuft…',
		steps: [
			'Seite wird geöffnet…',
			'WebMCP-Tools werden gesucht…',
			'Lesen wie ein Agent…',
			'Tools werden gelintet…'
		],
		verdicts: { ready: 'Agentenfähig', issues: 'Fast', missing: 'Noch nicht' },
		failed: 'Scan nicht möglich.',
		result: {
			missing: 'Keine WebMCP-Tools. Agenten müssen rund {tokens} dieser Seite lesen und raten.',
			tokens: { one: '{n} Token', other: '{n} Tokens' },
			issues: {
				one: '{tools}, aber {n} Lint-Fehler, über den Agenten stolpern.',
				other: '{tools}, aber {n} Lint-Fehler, über die Agenten stolpern.'
			},
			toolCount: { one: '{n} Tool', other: '{n} Tools' },
			ready: {
				one: '{n} Tool, das Agenten direkt aufrufen können. Gut gemacht.',
				other: '{n} Tools, die Agenten direkt aufrufen können. Gut gemacht.'
			},
			readySelf: {
				one: '{n} Tool, das Agenten direkt aufrufen können. Das wollen wir auch hoffen.',
				other: '{n} Tools, die Agenten direkt aufrufen können. Das wollen wir auch hoffen.'
			},
			tools: 'Gefundene Tools',
			more: '+{n} weitere',
			findings: 'Lint-Befunde',
			fix: 'Beheben',
			lint: 'Finden Sie alle Probleme im Quellcode, samt Korrekturen:',
			terminal: 'Terminal',
			badge: 'Zeigen Sie es. Wählen Sie ein Badge und binden Sie es auf Ihrer Website ein:',
			badgeNote:
				'Das SVG steckt im Code, es wird also nichts von uns geladen. Es verlinkt auf einen Live-Scan Ihrer Website, damit jeder es nachprüfen kann.',
			badgeStyle: 'Badge-Stil',
			badgeTitle: 'Agentenfähig: live mit webmcpx prüfen',
			share: 'Ergebnis teilen',
			shared: 'Link kopiert'
		},
		badges: {
			card: { name: 'Karte', fits: 'Helle Seiten' },
			flat: { name: 'Flach', fits: 'Footer' },
			readme: { name: 'README', fits: 'GitHub und npm' },
			dark: { name: 'Dunkel', fits: 'Dunkle Seiten' }
		},
		errors: {
			invalid: 'Geben Sie eine Website ein, etwa notion.com oder https://example.com/docs.',
			offline: 'Der Scanner ist offline. Starten Sie ihn lokal mit `just serve`.',
			noScanner: 'Diese Kopie der Website hat keinen Scanner. Starten Sie ihn lokal mit `just serve`.',
			busy: 'Bitte nur ein Scan pro Minute. Versuchen Sie es in {s} s erneut.',
			busyLater: 'Der Scanner ist ausgelastet. Versuchen Sie es in einer Minute erneut.',
			timeout: 'Die Seite hat zu lange für die Antwort gebraucht.',
			badAddress: 'Diese Adresse lässt sich nicht scannen.',
			unreadable: 'Die Seite konnte nicht gelesen werden.',
			withDetail: '{lead} ({detail})',
			other: 'Scan fehlgeschlagen ({status}).'
		}
	},

	brand: {
		kicker: 'Markenhandbuch · Designsystem',
		title: 'Papier, Tinte und eine Junction',
		lead: 'Eine Seite deklariert ihre Tools; der Browser steht dazwischen; Seite und Agent treffen sich, ohne dass einer den anderen ersetzt. Die Bildmarke zeigt diese Begegnung. Alles Folgende wird aus dem ausgelieferten Code gerendert.',
		name: {
			kicker: '01 · Name',
			title: 'webmcpx, immer kleingeschrieben',
			rules: [
				'Immer klein: webmcpx, auch am Satzanfang (stellen Sie den Satz dann lieber um).',
				'In Code und Befehlen in Geist Mono setzen.',
				'WebMCP ist die Browser-API, geschrieben wie im Entwurf.',
				'webmcpx ist nicht WebMCP selbst und beansprucht nie den Namen WebMCP.'
			]
		},
		logo: {
			kicker: '02 · Logo',
			title: 'Drei Bildmarken, eine Idee',
			lead: 'Verwenden Sie die Junction, wo immer es geht. Die Karte ist Badge und App-Icon (ab 32 px); die Seite mit Slot ist die Alternative.',
			marks: {
				junction: { name: 'Junction', role: 'Hauptmarke' },
				card: { name: 'Karte', role: 'Badge und App-Icon, ab 32 px' },
				'page-slot': { name: 'Seite mit Slot', role: 'Alternative' }
			},
			assets: {
				mark: { label: 'Bildmarke', use: 'Einfarbig (currentColor). Doku, READMEs, Folien.' },
				inverse: { label: 'Invertiert', use: 'Papier auf einem Quadrat in Tinte.' },
				favicon: { label: 'Favicon', use: '16–32 px. Folgt hellem und dunklem Modus.' },
				appIcon: { label: 'App-Icon', use: 'Farbig, für Exporte in 512 px.' },
				avatar: { label: 'Avatar', use: '20 % Innenabstand: sicher bei rundem Zuschnitt.' }
			},
			asset: '{label} {use}',
			assetLabel: '{label}.',
			download: '{mark} {asset} als SVG herunterladen'
		},
		construction: {
			kicker: '03 · Konstruktion',
			title: '24-Einheiten-Raster, 2 Einheiten Spalt',
			lead: 'Zwei gefüllte Chevrons, spiegelbildlich. Schenkel an den Enden 4,5 Einheiten breit, Spitzen über 2 Einheiten flach abgeschnitten und dazwischen ein Spalt von 2 Einheiten, der sich nie schließt: Dieser Spalt ist der Browser.',
			grid: 'Die Junction auf ihrem 24-Einheiten-Raster',
			clearSpace: 'Schutzzone',
			clearSpaceText:
				'Halten Sie um die Bildmarke einen Freiraum von ihrer halben Höhe frei, um das Lockup einen Freiraum in Höhe des x.',
			minSize: 'Mindestgröße',
			minSizeText:
				'Die Bildmarke bis hinunter auf 16 px nur als Favicon-Variante. Das Lockup mindestens 24 px hoch.'
		},
		color: {
			kicker: '04 · Farbe',
			title: 'Papier und Tinte, ein Textmarker',
			lead: 'Die Werte stammen aus tokens.css. Wählen Sie die Grafik nach dem Hintergrund, auf dem sie steht, nicht nach dem Theme des Lesers.',
			uses: {
				paper: 'Seitenhintergrund',
				'paper-2': 'Vertiefte Flächen, Tracks',
				card: 'Karten und Eingabefelder auf Papier',
				ink: 'Text, Konturen, Schatten, Primärbuttons',
				'ink-2': 'Sekundärtext',
				'ink-3': 'Bildunterschriften und Labels',
				hairline: 'Feine Trennlinien',
				marker: 'Textmarker: der einzige Akzent',
				good: 'Bereit, bestanden (Text)',
				'good-soft': 'Bereit, bestanden (Fläche)',
				bad: 'Fehlt, fehlgeschlagen (Text)',
				'bad-soft': 'Fehlt, fehlgeschlagen (Fläche)',
				code: 'Hintergrund von Codeblöcken',
				'on-code': 'Text auf Codeblöcken'
			},
			pairs: 'Freigegebene Textpaare',
			pairsNote: 'WCAG 2.2 AA verlangt 4,5:1 für Fließtext; ein Test stellt das sicher.',
			pairsText: 'Text auf Hintergrund',
			pairsContrast: 'Kontrast',
			pair: '{text} auf {bg}',
			yellow: 'Gelb ist Hintergrund, nie Figur',
			yellowText:
				'Textmarker-Gelb auf Papier erreicht {ratio}: Es trägt weder Form noch Text. Setzen Sie es hinter Tinte: ein {word}, ein Chip, ein App-Icon.',
			yellowWord: 'markiertes Wort'
		},
		type: {
			kicker: '05 · Schrift',
			title: 'Bricolage, Geist, Geist Mono',
			styles: {
				giant: { name: 'Bricolage Grotesque · Display', sample: 'Agentenfähig' },
				headline: {
					name: 'Bricolage Grotesque · Überschrift',
					sample: 'Gleicher Agent. Gleiche Frage.'
				},
				body: { name: 'Geist · Fließtext', sample: 'Kurze Sätze, die man prüfen kann. Je eine Idee.' },
				mono: { name: 'Geist Mono · Code und Labels', sample: 'document.modelContext.registerTool()' }
			}
		},
		components: {
			kicker: '06 · Komponenten',
			title: '2-px-Konturen, harte Schatten',
			lead: 'src/lib/components/ui. Varianten sind tailwind-variants-Rezepte; die Formen stammen aus denselben Tokens.',
			buttons: 'Button · Variante × Größe',
			stamps: 'Stamp · Ton',
			card: 'Card',
			interactive: 'Interaktive Card (Hover)',
			empty: 'Leerer Zustand',
			tabs: 'Tabs',
			tabsLabel: 'Beispiel',
			tabsItems: { one: 'Erster', two: 'Zweiter' },
			tabsPanel: 'Panel für {label}. Nutzen Sie die Pfeiltasten.',
			codeBlock: 'CodeBlock (beim Build hervorgehoben)'
		},
		misuse: {
			kicker: '07 · Fehlgebrauch',
			title: 'Bitte nicht',
			items: {
				stretch: 'Nicht strecken oder stauchen',
				rotate: 'Nicht drehen',
				outline: 'Keine Konturen oder Striche hinzufügen',
				yellow: 'Nicht in Gelb zeichnen',
				shadow: 'Keine Schatten oder Effekte auf der Bildmarke',
				touch: 'Den Spalt zwischen den Chevrons nicht schließen'
			}
		},
		trademark: {
			kicker: '08 · Marken',
			title: 'Name frei nutzbar. Kein offizieller Anschein',
			lead: 'Der Code steht unter MIT-Lizenz; Name und Bildmarken fallen nicht unter diese Lizenz. Die vollständige Richtlinie steht in TRADEMARK.md.',
			sayIt: 'So formulieren Sie es',
			never: 'Niemals',
			ok: [
				'Implementiert den WebMCP Draft Community Group Report der W3C Web Machine Learning Community Group (kein W3C-Standard).',
				'Gebaut mit webmcpx. Kompatibel mit webmcpx.',
				'Funktioniert in Chrome mit aktiviertem WebMCP-Flag.'
			],
			no: [
				'Die offizielle WebMCP-Bibliothek',
				'W3C-WebMCP-Standard',
				'MCP-zertifiziert',
				'webmcpx für Chrome'
			],
			voice: 'Tonalität',
			voiceText: 'Kurze Sätze, die man prüfen kann. Zahlen statt Adjektive.',
			wordsUse: 'Wörter, die wir nutzen',
			wordsAvoid: 'Wörter, die wir meiden',
			use: [
				'deklariert',
				'stellt bereit',
				'ruft auf',
				'gemessen',
				'folgt dem Community-Group-Entwurf',
				'funktioniert mit webmcpx'
			],
			avoid: ['offiziell', 'W3C-Standard', 'W3C-konform', 'MCP-zertifiziert', 'revolutionär', 'magisch'],
			notices: 'Hinweise',
			read: 'TRADEMARK.md lesen'
		}
	},

	benchmarkPage: {
		back: 'Zurück zur Startseite'
	},

	ui: {
		copy: 'Kopieren',
		copied: 'Kopiert',
		copyLabel: 'In die Zwischenablage kopieren',
		copyNamed: '{title} kopieren',
		code: 'Code: {title}'
	}
};

export default de;
