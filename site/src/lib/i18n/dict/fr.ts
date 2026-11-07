// French (France; also read in Belgium, Switzerland and Québec). Transcreated from en.ts: same keys,
// same placeholders. Typography: U+202F (espace fine insécable) before : ; ! ? and inside « »,
// U+00A0 as the thousands separator, decimal comma.
import type { Messages } from './en.ts';

const fr: Messages = {
	layout: {
		skip: 'Aller au contenu',
		suggest: {
			text: 'Ce site existe aussi en français.',
			action: 'Lire en français',
			dismiss: 'Fermer'
		}
	},

	meta: {
		home: {
			title: 'webmcpx : votre site est-il prêt pour les agents ?',
			description:
				'Scannez n’importe quel site à la recherche d’outils WebMCP. Une balise script le rend prêt pour les agents. Benchmark reproductible, open source.'
		},
		brand: {
			title: 'Marque et design system · webmcpx',
			description:
				'La charte de marque et le design system de webmcpx : logo, couleurs, typographie, composants et usage de la marque.'
		},
		benchmark: {
			title: 'Benchmark webmcpx : {model}',
			description: 'Avec et sans WebMCP sur {model} : tokens, durée, étapes et coût par question.'
		}
	},

	header: {
		nav: 'Principale',
		home: 'accueil',
		menu: 'Menu',
		language: 'Langue',
		links: {
			why: 'Pourquoi',
			proof: 'Benchmark',
			vsMcp: 'vs MCP',
			fix: 'Installer',
			issues: 'Issues',
			docs: 'Doc'
		}
	},

	footer: {
		tagline: 'Outils WebMCP standard pour tout site, et un linter pour les vôtres.',
		license: 'Licence MIT · un projet communautaire indépendant.',
		columns: { product: 'Produit', project: 'Projet', webmcp: 'WebMCP' },
		links: {
			scan: 'Scanner votre site',
			proof: 'Benchmark',
			install: 'Installer',
			issues: 'Issues résolues',
			brand: 'Marque et design',
			trademark: 'Politique de marque',
			spec: 'Brouillon de la spec',
			specIssues: 'Issues de la spec'
		},
		notices: [
			'webmcpx est un projet indépendant, ni affilié à LF Projects, à l’Agentic AI Foundation, à Anthropic, au W3C, à Google ou à Microsoft, ni approuvé par eux.',
			'Model Context Protocol et le logo MCP sont des marques de LF Projects, LLC.',
			'W3C® est une marque du World Wide Web Consortium.'
		]
	},

	hero: {
		stamp: 'Nouveau',
		draft: 'Suit le brouillon WebMCP du {date}',
		title: { text: 'Rendez votre site {mark}.', mark: 'prêt pour les agents' },
		lead: 'Les agents IA lisent déjà vos pages. Voyez ce qu’ils en retirent, puis donnez-leur de vrais outils en une ligne.',
		try: 'Essayez {sites}'
	},

	logos: {
		title: {
			text: '{count} parlent déjà WebMCP.',
			count: { one: '{n}+ site', other: '{n}+ sites' }
		},
		lead: 'Cliquez sur l’un d’eux pour le scanner en direct.',
		scan: '{site} : scanner ce site',
		note: 'Décompte : sites en ligne de {directory} ({date}). Plus strict, {knownGood} a vu {n} sites enregistrer des outils en exécutant leurs pages ({verifiedDate}). Logos vérifiés avec le scanner le {checked} ; ils appartiennent à leurs propriétaires, sans affiliation.',
		directory: 'l’annuaire webmcp.com',
		knownGood: 'l’index Known Good'
	},

	sources: {
		title: 'Sources',
		draft: 'Brouillon WebMCP',
		explainer: 'Explainer WebMCP',
		ours: 'Notre benchmark',
		snapshotCost: 'Coût d’un snapshot, mesuré',
		shopifyCheckout: 'Paiement Shopify',
		mcpSpec: 'Spécification MCP',
		shopifyBoth: 'Shopify sur les deux'
	},

	why: {
		kicker: 'Pourquoi WebMCP ?',
		title: 'Un contrat pour les agents, pas une capture d’écran.',
		lead: 'WebMCP permet à votre page de confier aux agents IA des outils typés, exécutés dans l’onglet même de l’utilisateur. Voici ce que cela change, en commençant par les preuves les plus solides.',
		today: 'Aujourd’hui',
		with: 'Avec WebMCP',
		reasons: {
			finish: {
				title: 'Des agents qui vont au bout',
				pain: 'Sur des sites en ligne, le meilleur agent testé a échoué sur environ 4 tâches sur 10, surtout sur les filtres, le tri et la navigation.',
				gain: 'L’agent appelle un outil avec une entrée typée au lieu de deviner quel bouton fait quoi.'
			},
			tokens: {
				title: 'Une fraction des tokens',
				pain: 'Un seul snapshot de page peut coûter de 12 000 à 77 000 tokens, et l’agent le renvoie à chaque étape.',
				gain: 'Un appel ne renvoie que les données demandées : jusqu’à {best} moins de tokens sur {bestSite} dans notre benchmark (meilleur cas).'
			},
			speed: {
				title: 'Des secondes, pas des minutes',
				pain: 'Regarder, réfléchir, cliquer, recommencer : sur des tâches difficiles en ligne, des agents ont tourné jusqu’à 44 minutes.',
				gain: 'Un appel remplace une série de clics : une médiane 3,4× plus rapide dans le benchmark de WindTunnel.'
			},
			backend: {
				title: 'Ni serveur en plus, ni OAuth',
				pain: 'Ouvrir une API aux agents implique en général un back-end séparé, un état dupliqué et un flux d’authentification.',
				gain: 'Les outils sont votre code front-end, exécuté avec la session que l’utilisateur a déjà ouverte. C’est ainsi que Shopify le déploie.'
			},
			loop: {
				title: 'L’utilisateur garde la main',
				pain: 'Les agents agissent hors de la vue de l’utilisateur, ou l’envoient ailleurs.',
				gain: 'L’agent travaille sur la page que voit l’utilisateur, et les outils peuvent signaler les actions qui demandent une confirmation.'
			},
			state: {
				title: 'Même panier, même formulaire',
				pain: 'Une API back-end ne voit ni le panier, ni le formulaire, ni la sélection ouverts dans l’onglet de l’utilisateur.',
				gain: 'Les outils agissent sur l’état que voit l’utilisateur : la page se met à jour à mesure que l’agent travaille.'
			},
			control: {
				title: 'C’est vous qui décidez',
				pain: 'Un agent qui lit la page peut cliquer partout où l’utilisateur le peut.',
				gain: 'Vous publiez les actions, leurs entrées et votre propre validation.'
			},
			small: {
				title: 'Vite ajouté, ignoré sans risque',
				pain: 'Rendre un site prêt pour les agents a l’air d’un gros chantier.',
				gain: 'Quelques enregistrements d’outils. Les navigateurs sans WebMCP les ignorent, et un seul en-tête les désactive.'
			}
		},
		status:
			'WebMCP est un brouillon du Community Group du W3C (2 novembre 2026), pas un standard du W3C, en origin trial dans Chrome. Les annotations sont des indications que le site déclare, pas des garanties.'
	},

	proof: {
		kicker: 'Benchmark',
		title: 'Même agent. Même question.',
		lead: 'Un agent lit, clique et remplit à partir de snapshots de la page ; l’autre appelle les outils WebMCP du site. Choisissez un modèle ; les plus fortes économies d’abord.',
		byModel: 'Benchmark par modèle',
		models: 'Modèles',
		model: 'Modèle',
		site: 'Site',
		tiers: { cheap: 'éco', frontier: 'de pointe' },
		modelHeading: '{name} ({provider})',
		empty: {
			title: 'Aucune exécution publiée pour l’instant.',
			text: 'Lancez {command} et cette section se remplira.'
		},
		selected: {
			one: 'Cas sélectionnés, {shown} sur {total} : la question où WebMCP a utilisé au plus la moitié des tokens. {results} sont publics ; vous pouvez aussi relancer le benchmark avec {command}.',
			other:
				'Cas sélectionnés, {shown} sur {total} : les questions où WebMCP a utilisé au plus la moitié des tokens. {results} sont publics ; vous pouvez aussi relancer le benchmark avec {command}.'
		},
		results: 'Tous les résultats',
		none: {
			title: 'Aucune question n’atteint le seuil sur {model}.',
			text: 'Toutes les questions et les deux variantes figurent dans les résultats complets ci-dessus.'
		},
		local: 'local',
		arms: { baseline: 'Sans WebMCP', webmcp: 'Avec webmcpx' },
		tokens: 'tokens',
		stats: '{time} · {steps} étapes · {cost} pour 1 000',
		na: 'n. d.',
		solved: 'Résolu {n}',
		failed: 'Échec {n}',
		fewerTokens: 'moins de tokens',
		moreTokens: 'plus de tokens',
		open: 'Ouvrir',
		opens: '(ouvre {site})',
		rotator: {
			label: 'Questions',
			item: 'Question {n} sur {total}',
			pause: 'Suspendre la rotation',
			resume: 'Reprendre la rotation'
		},
		details: 'Détails pour {site}',
		tabs: {
			tokens: 'Tokens',
			duration_ms: 'Durée',
			steps: 'Étapes',
			cost_usd: 'Coût',
			tools: 'Outils',
			method: 'Méthode'
		},
		metrics: {
			tokens: { label: 'Tokens', unit: 'tokens par exécution', column: 'tokens' },
			duration_ms: { label: 'Durée', unit: 'secondes par exécution', column: 'durée' },
			steps: { label: 'Étapes', unit: 'tours de modèle par exécution', column: 'étapes' },
			cost_usd: { label: 'Coût', unit: 'USD pour 1 000 exécutions', column: 'coût' }
		},
		chart: {
			question: 'Question',
			solved: 'Résolu',
			head: '{metric} · {unit}',
			caption:
				'{metric} par question, en {unit} ; plus c’est bas, mieux c’est. Taux de réussite par variante.',
			armMetric: '{arm} : {metric}',
			armSolved: '{arm} : résolu',
			row: '{site} : {question}',
			localSite: '{site} (site de test local)'
		},
		method: {
			setup: {
				one: '{model}, raisonnement {effort}, Chrome headless. Même prompt et même limite d’étapes dans les deux variantes ; {n} exécution par question et par variante.',
				other:
					'{model}, raisonnement {effort}, Chrome headless. Même prompt et même limite d’étapes dans les deux variantes ; {n} exécutions par question et par variante.'
			},
			setupNoEffort: {
				one: '{model}, Chrome headless. Même prompt et même limite d’étapes dans les deux variantes ; {n} exécution par question et par variante.',
				other:
					'{model}, Chrome headless. Même prompt et même limite d’étapes dans les deux variantes ; {n} exécutions par question et par variante.'
			},
			baseline: 'Sans WebMCP : un agent qui lit, clique et remplit à partir de snapshots du DOM.',
			webmcp: 'Avec webmcpx : uniquement les outils que la page enregistre.',
			graded: 'Notation sur les faits présents dans la réponse et sur l’état de la page. Pas de LLM juge.',
			live: 'Un site en ligne : il fournit ses propres outils WebMCP.',
			local: 'Un site de test local : ses outils viennent de webmcpx.',
			reproduce: 'pour reproduire'
		},
		tools: {
			label: 'Outils WebMCP sur {site}',
			title: {
				one: '{site} enregistre {n} outil WebMCP',
				other: '{site} enregistre {n} outils WebMCP'
			},
			fromRun: 'tels que l’agent les a vus · {date}',
			fromSnapshot: 'descriptions du {date} · benchmark du {runDate}',
			tool: 'Outil',
			description: 'Description',
			called: 'Appelé',
			notCalled: 'Non appelé',
			missing: '(non enregistré au moment du snapshot)'
		}
	},

	versus: {
		kicker: 'WebMCP vs MCP',
		title: 'Même idée d’outils. Pas au même endroit.',
		lead: 'WebMCP reprend le modèle d’outils de MCP, mais c’est une API du navigateur, pas le protocole MCP. Les deux se complètent.',
		caption: 'WebMCP comparé à MCP',
		aspect: 'Critère',
		rows: {
			where: {
				label: 'Où tournent les outils',
				webmcp: 'Dans le JavaScript de votre page, dans l’onglet de l’utilisateur.',
				mcp: 'Dans un processus serveur, local (stdio) ou distant.'
			},
			call: {
				label: 'Mode d’appel',
				webmcp:
					'Une API du navigateur, document.modelContext ; le navigateur sert d’intermédiaire à chaque appel. Pas de JSON-RPC.',
				mcp: 'JSON-RPC 2.0 sur stdio ou Streamable HTTP.'
			},
			run: {
				label: 'Ce que vous exploitez',
				webmcp: 'Votre front-end existant. Aucun nouveau serveur.',
				mcp: 'Un serveur MCP que vous hébergez et exploitez.'
			},
			auth: {
				label: 'Authentification',
				webmcp: 'La session avec laquelle l’utilisateur est déjà connecté. Aucun token à émettre.',
				mcp: 'Autorisation basée sur OAuth pour les serveurs distants.'
			},
			discovery: {
				label: 'Découverte',
				webmcp: 'Dès que la page est ouverte. Rien à trouver avant la visite.',
				mcp: 'tools/list sur un endpoint connu, et des registres publics.'
			},
			lifetime: {
				label: 'Durée de vie',
				webmcp: 'Tant que la page est ouverte.',
				mcp: 'Toujours actif, sans navigateur.'
			},
			user: {
				label: 'L’utilisateur',
				webmcp: 'Présent, sur la même page que l’agent.',
				mcp: 'Facultatif : fonctionne en headless.'
			},
			covers: {
				label: 'Périmètre',
				webmcp: 'Uniquement des outils, avec schémas d’entrée et de sortie.',
				mcp: 'Outils, ressources et prompts, plus l’élicitation et les extensions.'
			},
			hints: {
				label: 'Annotations des outils',
				webmcp: 'readOnlyHint, consequentialHint, untrustedContentHint. Même origine par défaut.',
				mcp: 'readOnlyHint, destructiveHint, idempotentHint, openWorldHint.'
			},
			status: {
				label: 'Statut',
				webmcp: 'Brouillon du Community Group du W3C ; en origin trial dans Chrome.',
				mcp: 'Un projet de la Linux Foundation, plus de 10 000 serveurs publics.'
			}
		},
		useBoth: 'Combinez-les',
		verdict:
			'MCP sert les agents qui n’ouvrent jamais votre site. WebMCP sert les agents qui travaillent dans l’onglet, aux côtés de votre utilisateur. Faites tourner les deux sur un même back-end : Shopify le fait déjà.'
	},

	fix: {
		title: 'Une ligne. Prêt pour les agents.',
		lead: 'Collez-la avant {tag}. Là où WebMCP est absent, elle ne fait rien.',
		alternative: 'ou {code} pour {label}',
		alternatives: { npm: 'npm', agent: 'votre agent de code' },
		gives: {
			search_page: 'trouve le passage',
			fetch_as_markdown: 'lit la page, paginée',
			get_page_context: 'sait où il se trouve'
		},
		facts: '~2,7 Ko chargés · Rust + WebAssembly · licence MIT'
	},

	issues: {
		kicker: 'Issues de la spec',
		title: 'Ce que la communauté demandait. Livré.',
		items: {
			shared: {
				title: 'Outils partagés',
				fix: 'Une balise script enregistre search_page, fetch_as_markdown et get_page_context de webmcpx ; et search_site si vous fournissez votre recherche.'
			},
			errors: {
				title: 'Des erreurs exploitables',
				fix: 'Les outils webmcpx renvoient les échecs prévus sous forme de résultat : un code d’erreur stable, un indicateur de réessai et un conseil.'
			},
			paging: {
				title: 'Résultats paginés',
				fix: 'Chaque outil webmcpx utilise une même forme de résultat, avec des budgets de sortie et une pagination truncated + next_cursor.'
			},
			frozen: {
				title: 'modelContext gelé',
				fix: 'webmcpx appelle uniquement registerTool(), sans jamais rien affecter. Testé avec un modelContext gelé.'
			},
			hidden: {
				title: 'Instructions cachées',
				fix: 'Retirées du texte de la page à l’exécution ; le linter les signale et --fix les supprime du code source.'
			},
			length: {
				title: 'Limites de longueur',
				fix: 'webmcpx lint vérifie les règles de nommage et signale les descriptions qui dépassent les recommandations de Chrome.'
			},
			budget: {
				title: 'Budget d’outils',
				fix: 'webmcpx lint avertit au-delà de 20 outils par page et renvoie une erreur au-delà de 100 (notre règle, pas celle du brouillon).'
			}
		}
	},

	scan: {
		form: 'Scanner un site',
		address: 'Adresse de votre site',
		placeholder: 'votresite.fr',
		submit: 'Scanner',
		scanning: 'En cours…',
		steps: [
			'Ouverture de la page…',
			'Recherche des outils WebMCP…',
			'Lecture comme un agent…',
			'Lint des outils…'
		],
		verdicts: { ready: 'Prêt', issues: 'Presque', missing: 'Pas encore' },
		failed: 'Impossible de scanner ce site.',
		result: {
			missing: 'Aucun outil WebMCP. Les agents doivent lire environ {tokens} de cette page et deviner.',
			tokens: { one: '{n} token', other: '{n} tokens' },
			issues: {
				one: '{tools}, mais {n} erreur de lint sur laquelle les agents vont buter.',
				other: '{tools}, mais {n} erreurs de lint sur lesquelles les agents vont buter.'
			},
			toolCount: { one: '{n} outil', other: '{n} outils' },
			ready: {
				one: '{n} outil que les agents peuvent appeler directement. Bien joué.',
				other: '{n} outils que les agents peuvent appeler directement. Bien joué.'
			},
			tools: 'Outils trouvés',
			more: '+{n} de plus',
			findings: 'Résultats du lint',
			fix: 'Corrigez-le en une ligne, à coller avant {tag} :',
			lint: 'Trouvez chaque problème dans votre code source, avec sa correction :',
			terminal: 'terminal',
			badge: 'Affichez-le. Choisissez un badge et collez-le sur votre site :',
			badgeNote:
				'Le SVG est inclus dans le code : rien ne se charge depuis chez nous. Il renvoie vers un scan en direct de votre site, que chacun peut vérifier.',
			badgeStyle: 'Style du badge',
			badgeTitle: 'Prêt pour les agents : vérifiez-le en direct avec webmcpx',
			share: 'Partager',
			shared: 'Lien copié'
		},
		badges: {
			card: { name: 'Carte', fits: 'Pages claires' },
			flat: { name: 'Plat', fits: 'README, pieds de page' },
			dark: { name: 'Sombre', fits: 'Pages sombres' }
		},
		errors: {
			invalid: 'Saisissez un site, par exemple notion.com ou https://example.com/docs.',
			offline: 'Le scanner est hors ligne. Lancez-le en local avec `just serve`.',
			noScanner: 'Cette copie du site n’a pas de scanner. Lancez-le en local avec `just serve`.',
			busy: 'Un scan par minute, s’il vous plaît. Réessayez dans {s} s.',
			busyLater: 'Le scanner est occupé. Réessayez dans une minute.',
			timeout: 'La page a mis trop de temps à répondre.',
			badAddress: 'Cette adresse ne peut pas être scannée.',
			unreadable: 'Impossible de lire la page.',
			withDetail: '{lead} ({detail})',
			other: 'Échec du scan ({status}).'
		}
	},

	brand: {
		kicker: 'Charte · design system',
		title: 'Du papier, de l’encre et une jonction.',
		lead: 'Une page déclare ses outils ; le navigateur s’interpose ; page et agent se rencontrent sans que l’un remplace l’autre. Le symbole dessine cette rencontre. Tout ce qui suit est rendu à partir du code en production.',
		name: {
			kicker: '01 · Nom',
			title: 'webmcpx, toujours en minuscules',
			rules: [
				'Toujours en minuscules : webmcpx, même en début de phrase (reformulez plutôt la phrase).',
				'Dans le code et les commandes, composez-le en Geist Mono.',
				'WebMCP est l’API du navigateur, écrite comme l’écrit le brouillon. webmcp.zone est le site de la communauté.',
				'webmcpx n’est pas WebMCP et ne revendique jamais le nom WebMCP.'
			]
		},
		logo: {
			kicker: '02 · Logo',
			title: 'Trois symboles, une idée',
			lead: 'Utilisez la Jonction partout où c’est possible. La Carte sert de badge et d’icône d’app (à partir de 32 px) ; la Page à fente est la variante.',
			marks: {
				junction: { name: 'Jonction', role: 'Symbole principal' },
				card: { name: 'Carte', role: 'Badge et icône d’app, dès 32 px' },
				'page-slot': { name: 'Page à fente', role: 'Variante' }
			},
			assets: {
				mark: { label: 'Symbole', use: 'Une couleur (currentColor). Docs, README, présentations.' },
				inverse: { label: 'Inversé', use: 'Papier sur un carré d’encre.' },
				favicon: { label: 'Favicon', use: '16–32 px. Suit les modes clair et sombre.' },
				appIcon: { label: 'Icône app', use: 'En couleur, pour les exports en 512 px.' },
				avatar: { label: 'Avatar', use: 'Marge de 20 % : sans risque dans un recadrage circulaire.' }
			},
			asset: '{label} {use}',
			assetLabel: '{label}.',
			download: 'Télécharger {mark} · {asset} (SVG)'
		},
		construction: {
			kicker: '03 · Construction',
			title: 'Grille de 24 unités, écart de 2',
			lead: 'Deux chevrons pleins, symétriques. Des bras de 4,5 unités aux extrémités, des sommets coupés à plat sur 2 unités, et entre eux un écart de 2 unités qui ne se referme jamais : cet écart, c’est le navigateur.',
			grid: 'La Jonction dessinée sur sa grille de 24 unités',
			clearSpace: 'Zone de protection',
			clearSpaceText:
				'Laissez autour du symbole un espace libre égal à la moitié de sa hauteur, et autour du logotype un espace égal à la hauteur du x.',
			minSize: 'Taille minimale',
			minSizeText:
				'Le symbole jusqu’à 16 px, uniquement en variante favicon. Le logotype, 24 px de haut au minimum.'
		},
		color: {
			kicker: '04 · Couleur',
			title: 'Papier et encre, un surligneur',
			lead: 'Les valeurs sont lues dans tokens.css. Choisissez la version selon le fond sur lequel elle sera posée, pas selon le thème du lecteur.',
			uses: {
				paper: 'Fond de page',
				'paper-2': 'Panneaux en creux, pistes',
				card: 'Cartes et champs sur le papier',
				ink: 'Texte, contours, ombres, bouton primaire',
				'ink-2': 'Texte secondaire',
				'ink-3': 'Légendes et libellés',
				hairline: 'Séparateurs fins',
				marker: 'Surligneur : l’unique accent',
				good: 'Prêt, réussi (texte)',
				'good-soft': 'Prêt, réussi (fond)',
				bad: 'Absent, échoué (texte)',
				'bad-soft': 'Absent, échoué (fond)',
				code: 'Fond des blocs de code',
				'on-code': 'Texte sur les blocs de code'
			},
			pairs: 'Paires de texte approuvées',
			pairsNote: 'WCAG 2.2 AA exige 4,5:1 pour le texte courant ; un test le vérifie.',
			pairsText: 'Texte sur fond',
			pairsContrast: 'Contraste',
			pair: '{text} sur {bg}',
			yellow: 'Le jaune est un fond, jamais une forme',
			yellowText:
				'Le jaune surligneur sur le papier mesure {ratio} : il ne peut porter ni forme ni texte. Utilisez-le derrière l’encre : un {word}, une pastille, une icône d’app.',
			yellowWord: 'mot surligné'
		},
		type: {
			kicker: '05 · Typographie',
			title: 'Bricolage, Geist, Geist Mono',
			styles: {
				giant: { name: 'Bricolage Grotesque · géant', sample: 'Prêt' },
				headline: { name: 'Bricolage Grotesque · titre', sample: 'Même agent. Même question.' },
				body: { name: 'Geist · texte', sample: 'Des phrases courtes et vérifiables. Une idée chacune.' },
				mono: { name: 'Geist Mono · code et libellés', sample: 'document.modelContext.registerTool()' }
			}
		},
		components: {
			kicker: '06 · Composants',
			title: 'Contours de 2 px, ombres nettes',
			lead: 'src/lib/components/ui. Les variantes sont des recettes tailwind-variants ; les formes viennent des mêmes tokens.',
			buttons: 'Button · variante × taille',
			stamps: 'Stamp · ton',
			card: 'Card',
			interactive: 'Card interactive (survol)',
			empty: 'État vide',
			tabs: 'Tabs',
			tabsLabel: 'Exemple',
			tabsItems: { one: 'Premier', two: 'Second' },
			tabsPanel: 'Panneau {label}. Utilisez les touches fléchées.',
			codeBlock: 'CodeBlock (coloration au build)'
		},
		misuse: {
			kicker: '07 · Mauvais usages',
			title: 'À éviter',
			items: {
				stretch: 'Ne pas l’étirer ni l’écraser',
				rotate: 'Ne pas le faire pivoter',
				outline: 'Ne pas ajouter de contours ni de traits',
				yellow: 'Ne pas le dessiner en jaune',
				shadow: 'Ne pas ajouter d’ombres ni d’effets au symbole',
				touch: 'Ne pas refermer l’écart entre les chevrons'
			}
		},
		trademark: {
			kicker: '08 · Marques',
			title: 'Utilisez le nom librement. Sans jouer les officiels.',
			lead: 'Le code est sous licence MIT ; le nom et les symboles ne sont pas couverts par cette licence. La politique complète figure dans TRADEMARK.md.',
			sayIt: 'Formulations correctes',
			never: 'Jamais',
			ok: [
				'Implémente le WebMCP Draft Community Group Report du W3C Web Machine Learning Community Group (pas un standard W3C).',
				'Conçu avec webmcpx. Compatible avec webmcpx.',
				'Fonctionne dans Chrome avec le flag WebMCP activé.'
			],
			no: ['La bibliothèque WebMCP officielle', 'Standard W3C WebMCP', 'Certifié MCP', 'webmcpx pour Chrome'],
			voice: 'Ton',
			voiceText: 'Des phrases courtes et vérifiables. Des chiffres plutôt que des adjectifs.',
			wordsUse: 'Mots que nous employons',
			wordsAvoid: 'Mots que nous évitons',
			use: [
				'déclare',
				'expose',
				'appelle',
				'mesuré',
				'suit le brouillon du Community Group',
				'fonctionne avec webmcpx'
			],
			avoid: ['officiel', 'standard W3C', 'conforme W3C', 'certifié MCP', 'révolutionnaire', 'magique'],
			notices: 'Mentions',
			read: 'Lire TRADEMARK.md'
		}
	},

	benchmarkPage: {
		back: 'Retour à l’accueil'
	},

	ui: {
		copy: 'Copier',
		copied: 'Copié',
		copyLabel: 'Copier dans le presse-papiers',
		copyNamed: 'Copier {title}',
		code: 'Code {title}'
	}
};

export default fr;
