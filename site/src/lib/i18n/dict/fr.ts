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
		verdicts: {
			title: 'Comment fonctionnent les verdicts · webmcpx',
			description:
				'Ce que veut dire chaque verdict, comment se déroule un scan, et où signaler un verdict erroné.'
		},
		home: {
			title: 'webmcpx : WebMCP pour tous les sites et tous les agents',
			description:
				'Trouvez les outils WebMCP de n’importe quel site, rendez le vôtre prêt pour les agents en une ligne, offrez WebMCP à Claude Code ou Codex partout. Open source.'
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
			proof: 'Classement',
			vsMcp: 'vs MCP',
			sites: 'Côté site',
			agents: 'Côté agent',
			issues: 'Lacunes',
			docs: 'Doc'
		}
	},

	footer: {
		tagline: 'Outils WebMCP standard pour tout site, et un linter pour les vôtres.',
		license: 'Licence MIT · un projet communautaire indépendant.',
		badge: 'Ce site est prêt pour les agents : vérifiez en direct',
		columns: { product: 'Produit', project: 'Projet', webmcp: 'WebMCP' },
		links: {
			scan: 'Scanner votre site',
			verdicts: 'Comment fonctionnent les verdicts',
			proof: 'Classement',
			sites: 'Pour votre site',
			agents: 'Pour votre agent',
			issues: 'Lacunes',
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
		title: { text: 'Rendez votre site {mark}', mark: 'prêt pour les agents' },
		lead: 'Dans notre benchmark, les agents ont consommé {mark} avec WebMCP (meilleur cas : {site}, {model}). Voyez ce que les agents tirent de votre site, puis corrigez en une ligne.',
		// The part of the lead set in highlighter ({best} is the ratio).
		leadMark: 'jusqu’à {best} moins de tokens',
		// Without a published run (no number to quote).
		leadPlain:
			'Les agents IA lisent déjà vos pages. Voyez ce qu’ils en retirent, puis donnez-leur de vrais outils en une ligne.',
		try: 'Essayez {sites}',
		entry: { question: 'Pas de site, juste des agents ?', agent: 'Configurer votre agent' }
	},

	logos: {
		title: {
			text: '{count} parlent déjà WebMCP',
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

	what: {
		kicker: 'WebMCP, c’est quoi ?',
		title: 'WebMCP est en train de devenir le standard du web pour les agents IA. On y va à fond',
		lead: 'Des ingénieurs de Google et de Microsoft le rédigent au W3C, l’organisme derrière les standards du web, et Chrome et Edge le testent déjà. Aujourd’hui, Claude Code, Codex et tous les autres agents utilisent votre site comme une capture d’écran : ils regardent, devinent sur quel bouton cliquer et réessaient. Lent, coûteux, fragile. Avec WebMCP, votre site dit aux agents exactement ce qu’ils peuvent faire, comme chercher, lire ou ajouter au panier, et ils n’ont plus qu’à demander. Nous pensons que tous les sites le parleront, alors nous avons créé webmcpx pour que le vôtre le parle dès aujourd’hui.',
		sources: {
			mind2web: 'Online-Mind2Web : les agents échouent sur environ 4 tâches réelles sur 10',
			snapshot: 'Un snapshot de page coûte de 12k à 77k tokens',
			windtunnel: 'WindTunnel : outils contre clics, chronométré',
			draft: 'Brouillon WebMCP, W3C Web Machine Learning CG (éditeurs de Google et Microsoft)',
			status: 'État de l’implémentation (origin trials dans Chrome et Edge)',
			chromeTrial: 'Chrome : origin trial WebMCP',
			chromeStatus: 'Chrome Platform Status',
			edgeTrial: 'Microsoft Edge : origin trial WebMCP',
			edgeExplainer: 'Explainer de Microsoft Edge',
			method: 'Notre méthode de benchmark'
		},
		steps: {
			register: {
				title: 'Votre site liste ses outils',
				text: 'Chacun est une action avec un nom et une courte description, comme « chercher des produits » ou « ajouter au panier » : ce que vos boutons font déjà.'
			},
			list: {
				title: 'L’agent voit la liste',
				text: 'Le navigateur lui donne les outils de votre site et ce dont chacun a besoin, sans lire toute la page ni deviner.'
			},
			call: {
				title: 'L’agent les utilise',
				text: 'Dans l’onglet même du visiteur, déjà connecté : pas de nouveau serveur, pas de connexion en plus.'
			}
		},
		webmcpx: {
			// Who we are and why webmcpx exists, right under the logo (facts only: see the footer notices).
			about:
				'Un projet communautaire indépendant et open source, sans lien avec le W3C ni aucun éditeur de navigateur. Nous faisons webmcpx pour que WebMCP serve dès aujourd’hui : les sites obtiennent de bons outils sans les écrire, les agents trouvent les mêmes réponses avec moins de tokens, et chaque chiffre publié peut être refait.',
			title: 'Lancez-vous dès aujourd’hui avec webmcpx, sur votre site et dans votre agent',
			lead: 'Tout ce qui tient encore WebMCP à l’écart de la plupart des sites, réglé : une ligne sur votre site, une commande dans votre agent, et plus rien à gérer.',
			compare: {
				caption: 'WebMCP à la main comparé à webmcpx',
				hand: 'WebMCP à la main',
				webmcpx: 'Avec webmcpx'
			},
			items: {
				support: {
					label: 'Prise en charge navigateurs',
					hand: 'Chrome et Edge seulement, derrière un flag ou en origin trial. Firefox et Safari : rien pour l’instant.',
					webmcpx:
						'Le polyfill officiel du W3C partout où WebMCP manque : vos outils sont là dès aujourd’hui dans Chrome, Firefox et Safari.'
				},
				tools: {
					label: 'Des outils sur chaque page',
					hand: 'Vous concevez et écrivez chacun d’eux, page par page.',
					webmcpx:
						'Recherche, lecture et contexte de la page sur chaque page, avec une seule balise script. Sans code.'
				},
				actions: {
					label: 'Vos propres actions',
					hand: 'Schémas, annotations et gestion des erreurs, écrits à la main pour chacune.',
					webmcpx:
						'Un appel tool(), un hook pour React, Vue ou Svelte, ou les formulaires que vous avez déjà.'
				},
				agents: {
					label: 'Dans Claude Code, Codex, Cursor',
					hand: 'Construire votre propre pont, ou attendre que chaque agent le prenne en charge.',
					webmcpx:
						'npx webmcpx mcp : les outils de chaque page, plus les outils standard sur n’importe quel site, même sans webmcpx.'
				},
				draft: {
					label: 'Évolutions de la spec',
					hand: 'Suivre chaque changement du brouillon et réécrire vos outils.',
					webmcpx:
						'Nous suivons le brouillon du W3C et évoluons avec lui : vous mettez à jour un seul paquet.'
				},
				correct: {
					label: 'Faire les choses bien',
					hand: 'Formes de résultat, codes d’erreur, budgets de sortie, pagination, annotations : tout repose sur vous.',
					webmcpx:
						'Juste par défaut : une même forme de résultat, des codes d’erreur exploitables par l’agent, des budgets de sortie, la pagination et des annotations correctes.'
				},
				safe: {
					label: 'Sûr pour les agents',
					hand: 'Instructions cachées et caractères invisibles dans les descriptions d’outils ou le texte de la page : faciles à rater, faciles à exploiter.',
					webmcpx:
						'Les outils standard ne font que lire, le texte caché reste à l’écart, les caractères invisibles sont retirés et le linter signale les instructions cachées dans vos outils.'
				},
				testing: {
					label: 'Tester',
					hand: 'Activer un flag Chrome, ouvrir les DevTools et croiser les doigts.',
					webmcpx:
						'npx webmcpx tools localhost:3000 liste vos outils dans n’importe quel navigateur, sans flag ; le scanner vérifie n’importe quelle URL en ligne.'
				},
				proof: {
					label: 'La preuve que ça paie',
					hand: 'Votre intuition.',
					webmcpx:
						'Un benchmark public de WebMCP face à la lecture de la page : jusqu’à {best} moins de tokens pour les mêmes réponses (meilleur cas : {site}, {model}). Relancez-le en une commande.',
					webmcpxPlain: 'Chaque question et chaque exécution sont publiques : relancez-les en une commande.'
				},
				cost: {
					label: 'Coût',
					hand: 'Votre temps, sur chaque page et à chaque changement.',
					webmcpx: 'Gratuit et open source (MIT), environ 2,7 Ko au chargement, sans compte ni serveur.'
				}
			},
			sites: 'Ajoutez-le à votre site',
			agents: 'Ajoutez-le à votre agent'
		}
	},
	why: {
		kicker: 'Pourquoi WebMCP ?',
		title: 'Ce que WebMCP apporte à votre site',
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
			'WebMCP est un brouillon du Community Group du W3C (2 novembre 2026), pas un standard du W3C. Le navigateur de l’app de bureau ChatGPT et Codex peuvent appeler les outils WebMCP d’un site ; Chrome le propose derrière un flag ou en origin trial. Les annotations sont des indications que le site déclare, pas des garanties.',
		also: 'Et aussi :'
	},

	proof: {
		kicker: 'Classement',
		title: 'Ce que WebMCP fait économiser, modèle par modèle',
		lead: 'Un agent lit, clique et remplit à partir de snapshots de la page ; l’autre appelle les outils WebMCP du site. Choisissez un modèle ; les plus fortes économies d’abord.',
		byModel: 'Benchmark par modèle',
		models: 'Modèles',
		model: 'Modèle',
		site: 'Site',
		rank: 'Rang {n}',
		ranking: 'Classé par taux de réussite avec WebMCP, puis par coût par exécution.',
		modelHeading: '{name} ({provider})',
		empty: {
			title: 'Aucune exécution publiée pour l’instant',
			text: 'Lancez {command} et cette section se remplira.'
		},
		selected: {
			one: 'Cas sélectionnés, {shown} sur {total} : la question où WebMCP a utilisé au plus la moitié des tokens. {results} sont publics ; vous pouvez aussi relancer le benchmark avec {command}.',
			other:
				'Cas sélectionnés, {shown} sur {total} : les questions où WebMCP a utilisé au plus la moitié des tokens. {results} sont publics ; vous pouvez aussi relancer le benchmark avec {command}.'
		},
		results: 'Tous les résultats',
		none: {
			title: 'Aucune question n’atteint le seuil sur {model}',
			text: 'Toutes les questions et les deux variantes figurent dans les résultats complets ci-dessus.'
		},
		local: 'local',
		arms: { baseline: 'Sans WebMCP', webmcp: 'Avec WebMCP' },
		tokens: 'tokens',
		stats: '{time} · {steps} étapes · {cost} par tâche',
		na: 'n. d.',
		solved: 'Résolu {n}',
		failed: 'Échec {n}',
		fewerTokens: 'moins de tokens',
		moreTokens: 'plus de tokens',
		open: 'Ouvrir',
		opens: '(ouvre {site})',
		rotator: {
			label: 'Questions',
			role: 'carrousel'
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
			cost_usd: { label: 'Coût', unit: 'USD par tâche', column: 'coût' }
		},
		chart: {
			question: 'Question',
			solved: 'Résolu',
			head: '{metric} · {unit}',
			better: 'Plus court, c’est mieux',
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
			webmcp:
				'Avec WebMCP : uniquement les outils que la page enregistre (les siens, ou ceux de webmcpx sur nos sites de test).',
			graded: 'Notation sur les faits présents dans la réponse et sur l’état de la page. Pas de LLM juge.',
			live: 'Un site en ligne : il fournit ses propres outils WebMCP.',
			local: 'Un site de test local : ses outils viennent de webmcpx.',
			scope:
				'30 questions sur 6 sites, dont 27 en lecture seule ; les plus gros gains viennent des outils de recherche des sites eux-mêmes.',
			runs: '3 exécutions par question et par bras : 3 sur 3 est un indice, pas la preuve de 100 %.',
			measures:
				'Le temps est la boucle de l’agent après le chargement de la page ; le coût est l’usage API du modèle aux tarifs datés, cache compris.',
			failures:
				'Chaque exécution échouée dit pourquoi dans les résultats (blocage du site, réponse hors page, limite d’étapes…).',
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
		title: 'Ce qui distingue WebMCP de MCP, et pourquoi il vous faut les deux',
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
				webmcp:
					'Brouillon du Community Group du W3C. ChatGPT (bureau) et Codex l’appellent ; Chrome : origin trial.',
				mcp: 'Un projet de la Linux Foundation, plus de 10 000 serveurs publics.'
			}
		},
		useBoth: 'Combinez-les',
		verdict:
			'MCP sert les agents qui n’ouvrent jamais votre site. WebMCP sert les agents qui travaillent dans l’onglet, aux côtés de votre utilisateur. Faites tourner les deux sur un même back-end : Shopify le fait déjà.'
	},

	fix: {
		title: 'Pour votre site',
		lead: 'Les agents IA lisent déjà vos pages. Donnez-leur de vrais outils en deux étapes : demandez à votre agent de code (Claude Code, Codex, Cursor), ou faites-le à la main.',
		alternatives: { npm: 'npm', agent: 'Agent' },
		facts: '~2,7 Ko chargés · Rust + WebAssembly · licence MIT',
		html: 'Collez-le avant {tag}. Dans les navigateurs sans WebMCP, il ajoute le polyfill du W3C.',
		standard: {
			title: 'Outils standard : une ligne',
			lead: 'Recherche, lecture et contexte sur chaque page. Sans code.'
		}
	},

	agents: {
		title: 'Pour votre agent',
		lead: 'Votre agent lit chaque page de la manière la plus coûteuse. Donnez-lui plutôt les outils de la page : sur les sites mesurés, les mêmes réponses pour une fraction des tokens. Ça marche sur n’importe quel site, et c’est le MCP que tout setup Claude Code et Codex devrait avoir.',
		saving: {
			range: { other: 'De {low} à {high} moins de tokens sur les {n} modèles du classement.' },
			best: 'Jusqu’à {high} moins de tokens au classement.',
			losses: {
				other:
					'Exécutions complètes : sur {worse} des {total} questions par modèle, WebMCP a consommé plus de tokens.'
			}
		},
		prompt: 'Un prompt : votre agent se configure seul, puis le prouve sur webmcpx.dev.',
		ways: {
			mcp: {
				label: 'Agents avec MCP',
				text: 'Claude Code, Codex, Cursor : ajoutez {cmd}. Il ouvre les pages dans son propre Chromium, sans flag.'
			},
			browser: {
				label: 'Agents qui pilotent un navigateur',
				text: 'Playwright, Selenium, Puppeteer, browser-use, CDP ; Chrome, Firefox, Safari : appelez {api} dans la page. Tout site doté de webmcpx l’expose.'
			}
		},
		hype: {
			up: 'Jusqu’à',
			fewer: 'de tokens en moins',
			same: 'Les mêmes réponses.',
			bestCase: 'Meilleur cas : {site}, {model}'
		},
		worksWith: 'Fonctionne avec tout agent et tout navigateur',
		note: 'Un prompt : votre agent se configure, utilise WebMCP d’abord partout et le prouve sur webmcpx.dev.'
	},

	own: {
		title: 'Les actions de votre site',
		lead: 'Ajouter au panier, réserver, chercher dans le catalogue : les fonctions que vos boutons appellent déjà, en outils que les agents appellent directement.',
		notes: {
			agent:
				'Votre agent lit ce que fait webmcpx, repère dans votre projet les actions qui valent la peine d’être exposées, vous demande lesquelles ajouter, puis les ajoute et les vérifie.',
			form: 'Sans JavaScript : l’API déclarative de WebMCP. La balise script l’ajoute là où le navigateur ne l’a pas encore.',
			js: 'Depuis npm, ou importé depuis le même CDN que la balise script.',
			hook: 'Enregistré tant que le composant est monté, retiré quand il disparaît.'
		}
	},

	verdicts: {
		title: 'Comment le scanner décide',
		lead: 'Trois verdicts, des règles ouvertes. Si l’un vous semble faux, dites-le-nous : c’est ce retour qui l’améliore.',
		// {rules} is a list of lint rule names (code).
		items: {
			ready:
				'La page enregistre au moins un outil WebMCP, le linter n’y trouve aucune erreur et le score agent-ready atteint 70 ou plus. Les avertissements, comme un nom trop long, ne bloquent pas.',
			issues:
				'La page enregistre des outils, mais au moins l’un d’eux a une erreur du linter ({rules}, ou une taille au-delà de sa limite stricte), ou le score est inférieur à 70.',
			missing:
				'La page n’enregistre aucun outil WebMCP. Nous indiquons combien de tokens un agent dépenserait à lire la page à la place.'
		},
		how: {
			title: 'Comment se déroule un scan',
			steps: [
				'Nous ouvrons la page dans un Chrome headless sur notre serveur, sans cookies ni connexion.',
				'Avant que les scripts de la page s’exécutent, nous ajoutons un hôte WebMCP, pour qu’elle enregistre ses outils comme dans le navigateur d’un agent. Il accepte aussi les anciens navigator.modelContext et provideContext, pour que les sites qui les utilisent montrent quand même leurs outils.',
				'Une fois la page chargée et ses outils stabilisés, nous lisons le nom, la description, le schéma d’entrée et les annotations de chacun, puis nous les passons au linter.',
				'Les tokens sont estimés à partir du texte de la page : ses caractères divisés par quatre.',
				'Pour le score, le même navigateur récupère le robots.txt, le llms.txt, le sitemap, la version Markdown, les en-têtes Link, l’index Agent Skills et le catalogue d’API du site (3 s chacun, même origine, sans cookies), et ne retient que leur présence.',
				'Le score, sur 100 : WebMCP 50 (outils 25, aucune erreur de lint 15, outils tous décrits 5, outils tous annotés 5), coût pour les agents 15 (plein avec des outils ; sinon selon le nombre de tokens de la page), lisible 20 et découvrable 15 (5 par vérification).',
				'Un résultat est réutilisé pendant 10 minutes ; chaque visiteur peut lancer un nouveau scan par minute.'
			]
		},
		rules: 'Toutes les règles du linter, avec leurs raisons',
		disagree: 'Un verdict vous semble faux ? {link}',
		disagreeLink: 'Ouvrez une issue avec le lien du scan.'
	},

	issues: {
		kicker: 'Issues de la spec',
		title: 'Les demandes de la spec que webmcpx gère déjà',
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

	faq: {
		kicker: 'FAQ',
		title: 'Questions sur WebMCP',
		items: {
			what: {
				q: 'Qu’est-ce que WebMCP ?',
				a: 'Une API navigateur, en cours de rédaction au sein du W3C Web Machine Learning Community Group : la page déclare des outils avec document.modelContext.registerTool(), et l’agent IA les appelle au lieu de lire des captures d’écran ou le HTML de la page. Les outils s’exécutent dans l’onglet même de l’utilisateur.'
			},
			site: {
				q: 'Comment rendre mon site prêt pour les agents ?',
				a: 'Ajoutez la balise script de webmcpx : chaque page reçoit des outils standard (recherche, lecture, contexte de la page) sans autre code. Déclarez ensuite vos propres actions, comme la recherche ou l’ajout au panier, avec tool(). Scannez votre site ici pour vérifier.'
			},
			agent: {
				q: 'Comment utiliser WebMCP depuis Claude Code ou Codex ?',
				a: 'Lancez claude mcp add webmcpx -- npx -y webmcpx mcp (pour Codex : codex mcp add webmcpx -- npx -y webmcpx mcp). Votre agent ouvre alors les pages dans son propre Chromium et récupère, sur n’importe quel site, les outils WebMCP de chaque page en plus des outils standard.'
			},
			browsers: {
				q: 'Ça marche dans Firefox et Safari ?',
				a: 'Oui. Quand un navigateur n’a pas son propre WebMCP, webmcpx charge le polyfill WebMCP du W3C, sur les pages HTTPS. Chrome, Firefox et Safari voient les mêmes outils.'
			},
			standard: {
				q: 'WebMCP est-il un standard du W3C ?',
				a: 'Pas encore. C’est un brouillon du W3C Web Machine Learning Community Group (2 novembre 2026). Chrome et Edge le proposent en origin trial, Mozilla reste neutre et WebKit a des objections. webmcpx suit le brouillon et charge le polyfill du W3C : vos outils fonctionnent dès maintenant et évoluent avec la spec.'
			},
			safe: {
				q: 'Est-il sûr de laisser des agents appeler les outils de mon site ?',
				a: 'Les outils s’exécutent dans l’onglet même de l’utilisateur, avec ses propres permissions, et ne peuvent rien faire que la page ne puisse déjà faire. Les outils standard de webmcpx ne lisent que ce que la page affiche, caractères invisibles retirés. Marquez avec consequentialHint vos propres outils qui modifient quelque chose, pour que les agents puissent d’abord demander à l’utilisateur, et laissez le linter signaler les instructions cachées dans les descriptions d’outils.'
			},
			mcp: {
				q: 'WebMCP, c’est la même chose que MCP ?',
				a: 'Non. WebMCP reprend le modèle d’outils de MCP, mais c’est une API navigateur, pas le protocole MCP : les outils vivent dans la page et s’exécutent dans l’onglet de l’utilisateur. Les deux se complètent, et le serveur MCP de webmcpx fait le lien.'
			}
		}
	},

	scan: {
		form: 'Scanner un site',
		address: 'Adresse de votre site',
		placeholder: 'votresite.fr',
		submit: 'Scanner mon site',
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
			basics: '{tools} et aucune erreur de lint, mais il manque quelques bases pour les agents.',
			cache: {
				label: 'Résultat en cache.',
				expires: 'Expire dans {time}.',
				expired: 'Ce résultat en cache a expiré.',
				rescan: 'Relancer le scan'
			},
			score: {
				title: 'Score agent-ready',
				of: '{score}/100',
				need: 'Prêt pour les agents à partir de {min}, avec des outils WebMCP et aucune erreur de lint.',
				groups: {
					webmcp: 'WebMCP',
					cost: 'Coût pour les agents',
					readable: 'Lisible',
					discoverable: 'Découvrable'
				},
				items: {
					tools: {
						label: 'Outils WebMCP',
						fix: 'Ajoutez une balise script : chaque page gagne recherche, lecture et contexte de page.'
					},
					lint: {
						label: 'Aucune erreur de lint',
						fix: 'Corrigez les points ci-dessous (npx webmcpx lint les trouve dans votre code source).'
					},
					descriptions: {
						label: 'Outils tous décrits',
						fix: 'Donnez à chaque outil une description sur laquelle les agents peuvent agir.'
					},
					annotations: {
						label: 'Outils tous annotés',
						fix: 'Marquez chaque outil readOnlyHint, ou consequentialHint quand il modifie quelque chose.'
					},
					cost: {
						label: 'Économe pour les agents',
						fix: 'Les agents lisent toute la page : les outils leur permettent de demander juste ce qu’il faut.',
						read: 'Environ {tokens} pour lire cette page.',
						tools: 'Les agents appellent ses outils au lieu de lire la page.'
					},
					llms_txt: {
						label: 'llms.txt',
						fix: 'Publiez /llms.txt : ce qu’est votre site et où les agents trouvent le reste.'
					},
					markdown: {
						label: 'Version Markdown',
						fix: 'Servez la page en Markdown (Accept: text/markdown) ou liez-en une avec rel="alternate".'
					},
					robots: {
						label: 'Ouvert aux agents IA',
						fix: 'Votre robots.txt bloque les agents IA (Disallow: / pour eux).'
					},
					sitemap: {
						label: 'Sitemap',
						fix: 'Publiez /sitemap.xml, ou une ligne Sitemap: dans robots.txt.'
					},
					link_headers: {
						label: 'En-têtes Link',
						fix: 'Ajoutez des en-têtes de réponse Link qui mènent les agents vers llms.txt et votre documentation (RFC 8288).'
					},
					agent_skills: {
						label: 'Index Agent Skills',
						fix: 'Publiez /.well-known/agent-skills/index.json.'
					},
					api_catalog: {
						label: 'Catalogue d’API',
						fix: 'Listez vos API dans /.well-known/api-catalog (RFC 9727).'
					}
				}
			},
			ready: {
				one: '{n} outil que les agents peuvent appeler directement. Bien joué.',
				other: '{n} outils que les agents peuvent appeler directement. Bien joué.'
			},
			readySelf: {
				one: '{n} outil que les agents peuvent appeler directement. Encore heureux.',
				other: '{n} outils que les agents peuvent appeler directement. Encore heureux.'
			},
			tools: 'Outils trouvés',
			more: '+{n} de plus',
			findings: 'Résultats du lint',
			fix: 'Corriger WebMCP',
			lint: 'Trouvez chaque problème dans votre code source, avec sa correction :',
			terminal: 'terminal',
			badge: 'Affichez-le. Choisissez un badge et collez-le sur votre site :',
			badgeNote:
				'Le SVG est inclus dans le code : rien ne se charge depuis chez nous. Il renvoie vers un scan en direct de votre site, que chacun peut vérifier.',
			badgeStyle: 'Style du badge',
			badgeTitle: 'Prêt pour les agents : vérifiez-le en direct avec webmcpx',
			share: 'Partager',
			shared: 'Lien copié',
			save: 'Enregistrer en PDF',
			savePng: 'Enregistrer en PNG',
			printed: 'Scanné par webmcpx.dev le {date}. Relancer le scan : {link}'
		},
		badges: {
			card: { name: 'Carte', fits: 'Pages claires' },
			flat: { name: 'Plat', fits: 'Pieds de page' },
			readme: { name: 'README', fits: 'GitHub et npm' },
			dark: { name: 'Sombre', fits: 'Pages sombres' }
		},
		errors: {
			invalid: 'Saisissez un site, par exemple notion.com ou https://example.com/docs.',
			offline: 'Le scanner est hors ligne. Lancez-le en local avec `just serve`.',
			noScanner: 'Cette copie du site n’a pas de scanner. Lancez-le en local avec `just serve`.',
			busy: 'Le scanner est occupé. Réessayez dans {s} s.',
			busyLater: 'Le scanner est occupé. Réessayez dans une minute.',
			running: 'Votre scan précédent est encore en cours. Attendez qu’il se termine, puis relancez.',
			timeout: 'La page a mis trop de temps à répondre.',
			badAddress: 'Cette adresse ne peut pas être scannée.',
			unreadable: 'Impossible de lire la page.',
			withDetail: '{lead} ({detail})',
			other: 'Échec du scan ({status}).'
		}
	},

	brand: {
		kicker: 'Charte · design system',
		title: 'Du papier, de l’encre et une jonction',
		lead: 'Une page déclare ses outils ; le navigateur s’interpose ; page et agent se rencontrent sans que l’un remplace l’autre. Le symbole dessine cette rencontre. Tout ce qui suit est rendu à partir du code en production.',
		name: {
			kicker: '01 · Nom',
			title: 'webmcpx, toujours en minuscules',
			rules: [
				'Toujours en minuscules : webmcpx, même en début de phrase (reformulez plutôt la phrase).',
				'Dans le code et les commandes, composez-le en Geist Mono.',
				'WebMCP est l’API du navigateur, écrite comme l’écrit le brouillon.',
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
			tabsItems: { one: 'Premier', two: 'Deuxième' },
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
			title: 'Utilisez le nom librement. Sans jouer les officiels',
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
		code: 'Code {title}',
		prompt: 'prompt',
		terminal: 'terminal'
	}
};

export default fr;
