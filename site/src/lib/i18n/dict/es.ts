// Spanish (neutral international Spanish, tú). Transcreated from en.ts: same keys, same placeholders.
import type { Messages } from './en.ts';

const es: Messages = {
	layout: {
		skip: 'Ir al contenido',
		suggest: {
			text: 'Este sitio también está en español.',
			action: 'Leer en español',
			dismiss: 'Cerrar'
		}
	},

	meta: {
		verdicts: {
			title: 'Cómo funcionan los veredictos del escaneo · webmcpx',
			description:
				'Qué significa cada veredicto del escaneo, cómo se hace un escaneo y dónde avisar si un veredicto está mal.'
		},
		home: {
			title: 'webmcpx: WebMCP para cada sitio y cada agente',
			description:
				'Busca herramientas WebMCP en cualquier sitio, deja el tuyo listo para agentes en una línea y dale WebMCP a Claude Code o Codex en cualquier web. Open source.'
		},
		brand: {
			title: 'Marca y sistema de diseño · webmcpx',
			description:
				'El manual de marca y el sistema de diseño de webmcpx: logo, color, tipografía, componentes y uso de la marca.'
		},
		benchmark: {
			title: 'Benchmark de webmcpx: {model}',
			description: 'Con y sin WebMCP en {model}: tokens, tiempo, pasos y costo por pregunta.'
		}
	},

	header: {
		nav: 'Principal',
		home: 'inicio',
		menu: 'Menú',
		language: 'Idioma',
		links: {
			why: 'Por qué',
			proof: 'Ranking',
			vsMcp: 'vs MCP',
			sites: 'Para sitios',
			agents: 'Para agentes',
			issues: 'Huecos',
			docs: 'Docs'
		}
	},

	footer: {
		tagline: 'Herramientas WebMCP estándar para cada web y un linter para las tuyas.',
		license: 'Licencia MIT · un proyecto comunitario independiente.',
		badge: 'Este sitio está listo para agentes: compruébalo en vivo',
		columns: { product: 'Producto', project: 'Proyecto', webmcp: 'WebMCP' },
		links: {
			scan: 'Escanea tu sitio',
			verdicts: 'Cómo funcionan los veredictos',
			proof: 'Ranking',
			sites: 'Para sitios',
			agents: 'Para agentes',
			issues: 'Huecos',
			brand: 'Marca y diseño',
			trademark: 'Política de marca',
			spec: 'Borrador de la spec',
			specIssues: 'Issues de la spec'
		},
		notices: [
			'webmcpx es un proyecto independiente: no está afiliado a LF Projects, la Agentic AI Foundation, Anthropic, el W3C, Google ni Microsoft, ni cuenta con su respaldo.',
			'Model Context Protocol y el logo de MCP son marcas comerciales de LF Projects, LLC.',
			'W3C® es una marca comercial del World Wide Web Consortium.'
		]
	},

	hero: {
		stamp: 'Nuevo',
		draft: 'Sigue el borrador de WebMCP del {date}',
		title: { text: 'Deja tu sitio {mark}', mark: 'listo para agentes' },
		lead: 'En nuestro benchmark, los agentes gastaron {mark} con WebMCP (mejor caso: {site}, {model}). Mira qué reciben los agentes de tu sitio y arréglalo con una línea.',
		// The part of the lead set in highlighter ({best} is the ratio).
		leadMark: 'hasta {best} menos tokens',
		// Without a published run (no number to quote).
		leadPlain:
			'Los agentes de IA ya leen tus páginas. Mira qué obtienen y dales herramientas de verdad con una sola línea.',
		try: 'Prueba {sites}',
		entry: { question: '¿No tienes sitio y solo usas agentes?', agent: 'Configura tu agente' }
	},

	logos: {
		title: {
			text: '{count} ya hablan WebMCP',
			count: { one: 'Más de {n} sitio', other: 'Más de {n} sitios' }
		},
		lead: 'Haz clic en cualquiera para escanearlo en vivo.',
		scan: '{site}: escanear este sitio',
		note: 'Recuento: sitios activos en el {directory} ({date}). El {knownGood}, más estricto, vio a {n} sitios registrar herramientas al ejecutar sus páginas ({verifiedDate}). Logos comprobados con el escáner el {checked}; pertenecen a sus dueños, sin afiliación.',
		directory: 'directorio de webmcp.com',
		knownGood: 'índice Known Good'
	},

	sources: {
		title: 'Fuentes',
		draft: 'Borrador de WebMCP',
		explainer: 'Explainer de WebMCP',
		ours: 'Nuestro benchmark',
		snapshotCost: 'Costo del snapshot, medido',
		shopifyCheckout: 'Checkout de Shopify',
		mcpSpec: 'Especificación de MCP',
		shopifyBoth: 'Shopify con ambos'
	},

	what: {
		kicker: '¿Qué es WebMCP?',
		title: 'WebMCP se está convirtiendo en el estándar de la web para agentes de IA. Vamos con todo',
		lead: 'Ingenieros de Google y Microsoft lo están redactando en el W3C, el organismo detrás de los estándares de la web, y Chrome y Edge ya lo están probando. Hoy, Claude Code, Codex y todos los demás agentes usan tu sitio como si fuera una captura de pantalla: miran, adivinan qué botón pulsar y vuelven a intentarlo. Lento, caro y fácil de romper. Con WebMCP, tu sitio les dice a los agentes exactamente qué pueden hacer, como buscar, leer o añadir al carrito, y ellos simplemente lo piden. Creemos que todos los sitios lo hablarán, así que creamos webmcpx para que el tuyo lo haga hoy mismo.',
		sources: {
			mind2web: 'Online-Mind2Web: los agentes fallan en unas 4 de cada 10 tareas reales',
			snapshot: 'Un snapshot de página cuesta de 12k a 77k tokens',
			windtunnel: 'WindTunnel: tools frente a clics, cronometrado',
			draft: 'Borrador de WebMCP, W3C Web Machine Learning CG (editores de Google y Microsoft)',
			status: 'Estado de implementación (origin trials en Chrome y Edge)',
			chromeTrial: 'Chrome: origin trial de WebMCP',
			chromeStatus: 'Chrome Platform Status',
			edgeTrial: 'Microsoft Edge: origin trial de WebMCP',
			edgeExplainer: 'Explainer de Microsoft Edge',
			method: 'Nuestro método de benchmark'
		},
		steps: {
			register: {
				title: 'Tu página registra herramientas',
				text: 'Un nombre, una descripción, un schema de entrada y una función: las acciones que tus botones ya ejecutan.'
			},
			list: {
				title: 'El navegador las lista',
				text: 'El agente le pregunta al navegador qué puede hacer la página, con entradas tipadas e indicaciones como solo lectura.'
			},
			call: {
				title: 'El agente las llama',
				text: 'En la propia pestaña del usuario, con su sesión: sin servidor nuevo y sin OAuth.'
			}
		},
		webmcpx: {
			// Who we are and why webmcpx exists, right under the logo (facts only: see the footer notices).
			about:
				'Un proyecto comunitario independiente y de código abierto, sin vínculo con el W3C ni con ningún fabricante de navegadores. Hacemos webmcpx para que WebMCP valga la pena hoy: los sitios obtienen buenas herramientas sin escribirlas, los agentes llegan a las mismas respuestas con menos tokens, y cada número que publicamos se puede volver a ejecutar.',
			title: 'Empieza hoy con webmcpx, en tu sitio y en tu agente',
			lead: 'Todo lo que hoy deja a WebMCP fuera de la mayoría de los sitios, resuelto: una línea en tu sitio, un comando en tu agente y nada más de qué preocuparte.',
			compare: {
				caption: 'WebMCP a mano frente a webmcpx',
				hand: 'WebMCP a mano',
				webmcpx: 'Con webmcpx'
			},
			items: {
				support: {
					label: 'Soporte en navegadores',
					hand: 'Solo Chrome y Edge, detrás de un flag o en origin trial. Firefox y Safari: nada todavía.',
					webmcpx:
						'El polyfill oficial del W3C donde falte WebMCP: tus herramientas ya están hoy en Chrome, Firefox y Safari.'
				},
				tools: {
					label: 'Herramientas en cada página',
					hand: 'Diseñas y escribes cada una, página a página.',
					webmcpx:
						'Búsqueda, lectura y contexto de la página en cada página, con una sola etiqueta script. Sin código.'
				},
				actions: {
					label: 'Tus propias acciones',
					hand: 'Esquemas, anotaciones y manejo de errores, escritos a mano para cada una.',
					webmcpx: 'Una llamada a tool(), un hook para React, Vue o Svelte, o los formularios que ya tienes.'
				},
				agents: {
					label: 'En Claude Code, Codex y Cursor',
					hand: 'Construir tu propio puente o esperar a que cada agente lo soporte.',
					webmcpx:
						'npx webmcpx mcp: las herramientas de cada página, más las estándar en cualquier sitio, incluso sin webmcpx.'
				},
				draft: {
					label: 'Cambios en la spec',
					hand: 'Seguir cada cambio del borrador y reescribir tus herramientas.',
					webmcpx: 'Seguimos el borrador del W3C y nos movemos con él: tú actualizas un paquete.'
				},
				correct: {
					label: 'Hacerlo bien',
					hand: 'Formas de resultado, códigos de error, presupuestos de salida, paginación, anotaciones: todo depende de ti.',
					webmcpx:
						'Correcto de serie: una sola forma de resultado, códigos de error con los que el agente puede actuar, presupuestos de salida, paginación y anotaciones correctas.'
				},
				safe: {
					label: 'Seguro para agentes',
					hand: 'Instrucciones ocultas y caracteres invisibles en las descripciones de las herramientas o en el texto de la página: fáciles de pasar por alto, fáciles de explotar.',
					webmcpx:
						'Las herramientas estándar solo leen, el texto oculto queda fuera, los caracteres invisibles se eliminan y el linter detecta instrucciones ocultas en tus herramientas.'
				},
				testing: {
					label: 'Probarlo',
					hand: 'Activar un flag de Chrome, abrir DevTools y cruzar los dedos.',
					webmcpx:
						'npx webmcpx tools localhost:3000 lista tus herramientas en cualquier navegador, sin flags; el escáner revisa cualquier URL en producción.'
				},
				proof: {
					label: 'Pruebas de que compensa',
					hand: 'Tu intuición.',
					webmcpx:
						'Un benchmark público de WebMCP frente a leer la página: hasta {best} menos tokens para las mismas respuestas (mejor caso: {site}, {model}). Repítelo con un comando.',
					webmcpxPlain: 'Cada pregunta y cada ejecución son públicas: repítelas con un comando.'
				},
				cost: {
					label: 'Coste',
					hand: 'Tu tiempo, en cada página y en cada cambio.',
					webmcpx: 'Gratis y de código abierto (MIT), unos 2,7 KB al cargar, sin cuenta y sin servidor.'
				}
			},
			sites: 'Añádelo a tu sitio',
			agents: 'Añádelo a tu agente'
		}
	},
	why: {
		kicker: '¿Por qué WebMCP?',
		title: 'Lo que gana tu sitio con WebMCP',
		lead: 'WebMCP permite que tu página ofrezca a los agentes de IA herramientas tipadas que se ejecutan en la propia pestaña del usuario. Esto es lo que cambia, empezando por la evidencia más sólida.',
		today: 'Hoy',
		with: 'Con WebMCP',
		reasons: {
			finish: {
				title: 'Agentes que terminan el trabajo',
				pain: 'En sitios reales, el mejor agente evaluado falló cerca de 4 de cada 10 tareas, sobre todo en filtros, orden y navegación.',
				gain: 'El agente llama a una herramienta con una entrada tipada en lugar de adivinar qué hace cada botón.'
			},
			tokens: {
				title: 'Una fracción de los tokens',
				pain: 'Un solo snapshot de la página puede costar de 12k a 77k tokens, y el agente lo vuelve a enviar en cada paso.',
				gain: 'Una llamada devuelve solo los datos que pidió: hasta {best} menos tokens en {bestSite} en nuestro benchmark (mejor caso).'
			},
			speed: {
				title: 'Segundos, no minutos',
				pain: 'Mirar, pensar, hacer clic, repetir: en tareas difíciles en sitios reales, los agentes llegaron a tardar 44 minutos.',
				gain: 'Una llamada sustituye una cadena de clics: una mediana 3,4× más rápida en el benchmark de WindTunnel.'
			},
			backend: {
				title: 'Sin servidor nuevo. Sin OAuth',
				pain: 'Dar una API a los agentes suele implicar un backend aparte, estado duplicado y un flujo de autenticación.',
				gain: 'Las herramientas son tu código de front-end y usan la sesión que el usuario ya tiene. Así lo hace Shopify.'
			},
			loop: {
				title: 'El usuario no pierde el control',
				pain: 'Los agentes actúan fuera de su vista, o lo mandan a otro sitio.',
				gain: 'El agente trabaja en la página que el usuario ve, y las herramientas pueden marcar las acciones que requieren confirmación.'
			},
			state: {
				title: 'Mismo carrito, mismo formulario',
				pain: 'Una API de backend no ve el carrito, el formulario ni la selección abiertos en la pestaña del usuario.',
				gain: 'Las herramientas actúan sobre el estado que ve el usuario, así que la página se actualiza mientras el agente trabaja.'
			},
			control: {
				title: 'Tú decides qué hacen los agentes',
				pain: 'Un agente que lee la página puede hacer clic en todo lo que puede el usuario.',
				gain: 'Tú publicas las acciones, sus entradas y tu propia validación.'
			},
			small: {
				title: 'Poco que añadir, nada que romper',
				pain: 'Preparar un sitio para agentes suena a proyecto grande.',
				gain: 'Unos pocos registros de herramientas. Los navegadores sin WebMCP los ignoran, y una cabecera los desactiva.'
			}
		},
		status:
			'WebMCP es un borrador de un Community Group del W3C (2 de noviembre de 2026), no un estándar del W3C. El navegador de la app de escritorio de ChatGPT y Codex pueden llamar a las herramientas WebMCP de un sitio; Chrome lo ofrece detrás de un flag o en origin trial. Las anotaciones son indicaciones que declara el sitio, no garantías.',
		also: 'Además:'
	},

	proof: {
		kicker: 'Ranking',
		title: 'Cuánto ahorra WebMCP, modelo a modelo',
		lead: 'Un agente lee, hace clic y rellena a partir de snapshots de la página; el otro llama a las herramientas WebMCP del sitio. Elige un modelo; primero, los mayores ahorros.',
		byModel: 'Benchmark por modelo',
		models: 'Modelos',
		model: 'Modelo',
		site: 'Sitio',
		rank: 'Puesto {n}',
		ranking: 'Ordenado por acierto con WebMCP y, en empate, por coste por ejecución.',
		modelHeading: '{name} ({provider})',
		empty: {
			title: 'Aún no hay ejecuciones publicadas',
			text: 'Ejecuta {command} y esto se completa.'
		},
		selected: {
			one: 'Casos seleccionados: {shown} de {total} pregunta, en la que WebMCP usó como máximo la mitad de los tokens. {results} son públicos, o ejecútalo tú mismo con {command}.',
			other:
				'Casos seleccionados: {shown} de {total} preguntas, en las que WebMCP usó como máximo la mitad de los tokens. {results} son públicos, o ejecútalo tú mismo con {command}.'
		},
		results: 'Todos los resultados',
		none: {
			title: 'Ninguna pregunta superó el umbral en {model}',
			text: 'Todas las preguntas y ambas variantes están en los resultados completos de arriba.'
		},
		local: 'local',
		arms: { baseline: 'Sin WebMCP', webmcp: 'Con WebMCP' },
		tokens: 'tokens',
		stats: '{time} · {steps} pasos · {cost} por tarea',
		na: 'n/d',
		solved: 'Resuelta {n}',
		failed: 'Fallida {n}',
		fewerTokens: 'menos tokens',
		moreTokens: 'más tokens',
		open: 'Abrir',
		opens: '(abre {site})',
		rotator: {
			label: 'Preguntas',
			role: 'carrusel'
		},
		details: 'Detalles de {site}',
		tabs: {
			tokens: 'Tokens',
			duration_ms: 'Tiempo',
			steps: 'Pasos',
			cost_usd: 'Costo',
			tools: 'Herramientas',
			method: 'Método'
		},
		metrics: {
			tokens: { label: 'Tokens', unit: 'tokens por ejecución', column: 'tokens' },
			duration_ms: { label: 'Tiempo', unit: 'segundos por ejecución', column: 'tiempo' },
			steps: { label: 'Pasos', unit: 'turnos del modelo por ejecución', column: 'pasos' },
			cost_usd: { label: 'Costo', unit: 'USD por tarea', column: 'costo' }
		},
		chart: {
			question: 'Pregunta',
			solved: 'Resuelta',
			head: '{metric} · {unit}',
			better: 'Más corto es mejor',
			caption: '{metric} por pregunta, {unit}; cuanto menos, mejor. Tasa de éxito por variante.',
			armMetric: '{arm}: {metric}',
			armSolved: '{arm}: resuelta',
			row: '{site}: {question}',
			localSite: '{site} (sitio de prueba local)'
		},
		method: {
			setup: {
				one: '{model}, razonamiento {effort}, Chrome headless. Mismo prompt y mismo límite de pasos en ambas variantes; {n} ejecución por pregunta y variante.',
				other:
					'{model}, razonamiento {effort}, Chrome headless. Mismo prompt y mismo límite de pasos en ambas variantes; {n} ejecuciones por pregunta y variante.'
			},
			setupNoEffort: {
				one: '{model}, Chrome headless. Mismo prompt y mismo límite de pasos en ambas variantes; {n} ejecución por pregunta y variante.',
				other:
					'{model}, Chrome headless. Mismo prompt y mismo límite de pasos en ambas variantes; {n} ejecuciones por pregunta y variante.'
			},
			baseline: 'Sin WebMCP: un agente basado en snapshots del DOM que lee, hace clic y rellena.',
			webmcp:
				'Con WebMCP: solo las herramientas que registra la página (las suyas o, en nuestros sitios de prueba, las de webmcpx).',
			graded: 'Evaluado según los hechos de la respuesta y el estado de la página. Sin LLM como juez.',
			live: 'Un sitio real: publica sus propias herramientas WebMCP.',
			local: 'Un sitio de prueba local: sus herramientas vienen de webmcpx.',
			scope:
				'30 preguntas en 6 sitios, 27 de solo lectura; los mayores ahorros vienen de las herramientas de búsqueda de los propios sitios.',
			runs: '3 ejecuciones por pregunta y brazo: 3 de 3 es evidencia, no prueba del 100%.',
			measures:
				'El tiempo es el bucle del agente tras cargar la página; el coste es el uso de API del modelo a precios de lista fechados, con caché.',
			failures:
				'Cada ejecución fallida dice por qué en los resultados (bloqueo del sitio, respuesta fuera de la página, límite de pasos…).',
			reproduce: 'reprodúcelo'
		},
		tools: {
			label: 'Herramientas WebMCP en {site}',
			title: {
				one: '{n} herramienta WebMCP registrada por {site}',
				other: '{n} herramientas WebMCP registradas por {site}'
			},
			fromRun: 'tal como las vio el agente · {date}',
			fromSnapshot: 'descripciones del {date} · benchmark del {runDate}',
			tool: 'Herramienta',
			description: 'Descripción',
			called: 'Llamada',
			notCalled: 'No llamada',
			missing: '(no estaba registrada cuando se tomó el snapshot)'
		}
	},

	versus: {
		kicker: 'WebMCP vs MCP',
		title: 'En qué se diferencia WebMCP de MCP, y por qué necesitas ambos',
		lead: 'WebMCP toma el modelo de herramientas de MCP, pero es una API del navegador, no el protocolo MCP. Se complementan.',
		caption: 'WebMCP frente a MCP',
		aspect: 'Aspecto',
		rows: {
			where: {
				label: 'Dónde se ejecutan',
				webmcp: 'En el JavaScript de tu página, en la pestaña del usuario.',
				mcp: 'En un proceso de servidor, local (stdio) o remoto.'
			},
			call: {
				label: 'Cómo se invocan',
				webmcp:
					'Una API del navegador, document.modelContext; el navegador media en cada llamada. Sin JSON-RPC.',
				mcp: 'JSON-RPC 2.0 sobre stdio o Streamable HTTP.'
			},
			run: {
				label: 'Qué ejecutas',
				webmcp: 'Tu front-end actual. Sin servidor nuevo.',
				mcp: 'Un servidor MCP que alojas y operas.'
			},
			auth: {
				label: 'Autenticación',
				webmcp: 'La sesión que el usuario ya tiene iniciada. Sin tokens que emitir.',
				mcp: 'Autorización basada en OAuth para servidores remotos.'
			},
			discovery: {
				label: 'Descubrimiento',
				webmcp: 'En cuanto se abre la página. Nada que encontrar antes de la visita.',
				mcp: 'tools/list en un endpoint conocido, y registros públicos.'
			},
			lifetime: {
				label: 'Ciclo de vida',
				webmcp: 'Mientras la página esté abierta.',
				mcp: 'Siempre activo, sin necesidad de navegador.'
			},
			user: {
				label: 'El usuario',
				webmcp: 'Presente, en la misma página que el agente.',
				mcp: 'Opcional: funciona en modo headless.'
			},
			covers: {
				label: 'Alcance',
				webmcp: 'Solo herramientas, con esquemas de entrada y salida.',
				mcp: 'Herramientas, recursos y prompts, además de elicitación y extensiones.'
			},
			hints: {
				label: 'Indicaciones',
				webmcp: 'readOnlyHint, consequentialHint, untrustedContentHint. Mismo origen por defecto.',
				mcp: 'readOnlyHint, destructiveHint, idempotentHint, openWorldHint.'
			},
			status: {
				label: 'Estado',
				webmcp:
					'Borrador de un Community Group del W3C. Lo llaman ChatGPT de escritorio y Codex; Chrome: origin trial.',
				mcp: 'Un proyecto de la Linux Foundation, más de 10 000 servidores públicos.'
			}
		},
		useBoth: 'Usa ambos',
		verdict:
			'MCP sirve a los agentes que nunca abren tu sitio. WebMCP, a los que trabajan en la pestaña, junto a tu usuario. Usa ambos sobre un mismo backend: Shopify ya lo hace.'
	},

	fix: {
		title: 'Para tu sitio',
		lead: 'Los agentes de IA ya están leyendo tus páginas. Dales herramientas de verdad en dos pasos: pídeselo a tu agente de código (Claude Code, Codex, Cursor) o hazlo a mano.',
		alternatives: { npm: 'npm', agent: 'Agente' },
		facts: '~2,7 KB al cargar · Rust + WebAssembly · MIT',
		html: 'Pégalo antes de {tag}. En navegadores sin WebMCP, añade el polyfill del W3C.',
		standard: {
			title: 'Herramientas estándar: una línea',
			lead: 'Búsqueda, lectura y contexto en todas las páginas. Sin código.'
		}
	},

	agents: {
		title: 'Para tu agente',
		lead: 'Tu agente lee cada página de la forma cara. Dale en su lugar las herramientas de la página: en los sitios que medimos, las mismas respuestas con una fracción de los tokens. Funciona en cualquier sitio, y es el MCP que todo setup de Claude Code y Codex debería tener.',
		saving: {
			range: { other: 'De {low} a {high} menos tokens en los {n} modelos del ranking.' },
			best: 'Hasta {high} menos tokens en el ranking.',
			losses: {
				other: 'Ejecuciones completas: en {worse} de {total} preguntas por modelo, WebMCP usó más tokens.'
			}
		},
		prompt: 'Un prompt: tu agente se configura solo y lo demuestra en webmcpx.dev.',
		ways: {
			mcp: {
				label: 'Agentes con MCP',
				text: 'Claude Code, Codex, Cursor: añade {cmd}. Abre las páginas en su propio Chromium, sin flags.'
			},
			browser: {
				label: 'Agentes que controlan un navegador',
				text: 'Playwright, Selenium, Puppeteer, browser-use, CDP; Chrome, Firefox, Safari: llama a {api} en la página. Todo sitio con webmcpx lo tiene.'
			}
		},
		hype: {
			up: 'Hasta',
			fewer: 'menos tokens',
			same: 'Las mismas respuestas.',
			bestCase: 'Mejor caso: {site}, {model}'
		},
		worksWith: 'Funciona con cualquier agente y navegador',
		note: 'Un prompt: tu agente se configura, usa WebMCP primero en todo y lo prueba en webmcpx.dev.'
	},

	own: {
		title: 'Las acciones de tu sitio',
		lead: 'Añadir al carrito, reservar, buscar en tu catálogo: las funciones que tus botones ya llaman, como herramientas que los agentes llaman directo.',
		notes: {
			agent:
				'Tu agente lee qué hace webmcpx, encuentra en tu proyecto las acciones que vale la pena exponer, te pregunta cuáles añadir y luego las añade y las comprueba.',
			form: 'Sin JavaScript: la API declarativa de WebMCP. La etiqueta de script la añade donde el navegador aún no la tiene.',
			js: 'Desde npm, o importada desde el mismo CDN que la etiqueta de script.',
			hook: 'Registrada mientras el componente está montado; desaparece al desmontarlo.'
		}
	},

	verdicts: {
		title: 'Cómo decide el escáner',
		lead: 'Tres veredictos, reglas abiertas. Si alguno te parece mal, avísanos: ese feedback es el que lo mejora.',
		// {rules} is a list of lint rule names (code).
		items: {
			ready:
				'La página registra al menos una herramienta WebMCP, el linter no encuentra errores en ellas y la puntuación para agentes es de 70 o más. Los avisos, como un nombre largo, no lo impiden.',
			issues:
				'La página registra herramientas, pero al menos una tiene un error del linter ({rules}, o un tamaño por encima de su límite duro), o la puntuación queda por debajo de 70.',
			missing:
				'La página no registra ninguna herramienta WebMCP. Mostramos cuántos tokens gastaría un agente leyendo la página en su lugar.'
		},
		how: {
			title: 'Cómo se hace un escaneo',
			steps: [
				'Abrimos la página en un Chrome headless en nuestro servidor, sin cookies ni inicio de sesión.',
				'Antes de que corran los scripts de la página, añadimos un host WebMCP, para que registre sus herramientas como lo haría en el navegador de un agente. También acepta los antiguos navigator.modelContext y provideContext, para que los sitios hechos con ellos sigan mostrando sus herramientas.',
				'Cuando la página ha cargado y sus herramientas se estabilizan, leemos el nombre, la descripción, el esquema de entrada y las anotaciones de cada una, y pasamos el linter.',
				'Los tokens se estiman a partir del texto de la página: sus caracteres divididos entre cuatro.',
				'Para la puntuación, el mismo navegador pide el robots.txt, el llms.txt, el sitemap, la versión en Markdown, las cabeceras Link, el índice de Agent Skills y el catálogo de APIs del sitio (3 s cada uno, mismo origen, sin cookies) y solo guarda si cada uno existe.',
				'La puntuación, sobre 100: WebMCP 50 (herramientas 25, sin errores de lint 15, todas las herramientas descritas 5, todas anotadas 5), coste para agentes 15 (completo con herramientas; si no, según los tokens de la página), legible 20 y descubrible 15 (5 por comprobación).',
				'Un resultado se reutiliza durante 10 minutos; cada visitante puede lanzar un escaneo nuevo por minuto.'
			]
		},
		rules: 'Todas las reglas del linter, con sus motivos',
		disagree: '¿Crees que un veredicto está mal? {link}',
		disagreeLink: 'Abre una issue con el enlace del escaneo.'
	},

	issues: {
		kicker: 'Issues de la spec',
		title: 'Peticiones de la spec que webmcpx ya resuelve',
		items: {
			shared: {
				title: 'Herramientas compartidas',
				fix: 'Una etiqueta script registra search_page, fetch_as_markdown y get_page_context de webmcpx; y search_site si le pasas tu búsqueda.'
			},
			errors: {
				title: 'Errores útiles para agentes',
				fix: 'Las herramientas de webmcpx devuelven los fallos esperados como resultado: un código de error estable, un indicador de si se puede reintentar y una pista.'
			},
			paging: {
				title: 'Resultados paginados',
				fix: 'Todas las herramientas de webmcpx usan la misma forma de resultado, con presupuestos de salida y paginación con truncated + next_cursor.'
			},
			frozen: {
				title: 'modelContext congelado',
				fix: 'webmcpx solo llama a registerTool(), nunca asigna. Probado contra un modelContext congelado.'
			},
			hidden: {
				title: 'Instrucciones ocultas',
				fix: 'Se eliminan del texto de la página en tiempo de ejecución; el linter las detecta y --fix las quita del código fuente.'
			},
			length: {
				title: 'Límites de longitud',
				fix: 'webmcpx lint comprueba las reglas de nombres y marca las descripciones que superan las recomendaciones de Chrome.'
			},
			budget: {
				title: 'Presupuesto de herramientas',
				fix: 'webmcpx lint avisa con más de 20 herramientas por página y da error con más de 100 (es nuestra política, no la del borrador).'
			}
		}
	},

	faq: {
		kicker: 'FAQ',
		title: 'Preguntas sobre WebMCP',
		items: {
			what: {
				q: '¿Qué es WebMCP?',
				a: 'Una API del navegador, en borrador en el W3C Web Machine Learning Community Group: la página registra herramientas con document.modelContext.registerTool() y un agente de IA las llama en lugar de leer capturas de pantalla o el HTML de la página. Las herramientas se ejecutan en la propia pestaña del usuario.'
			},
			site: {
				q: '¿Cómo dejo mi sitio listo para agentes?',
				a: 'Añade la etiqueta script de webmcpx: cada página obtiene herramientas estándar (búsqueda, lectura, contexto de la página) sin escribir más código. Después registra tus propias acciones, como buscar o añadir al carrito, con tool(). Escanea tu sitio aquí para comprobarlo.'
			},
			agent: {
				q: '¿Cómo uso WebMCP desde Claude Code o Codex?',
				a: 'Ejecuta claude mcp add webmcpx -- npx -y webmcpx mcp (en Codex: codex mcp add webmcpx -- npx -y webmcpx mcp). A partir de ahí, tu agente abre las páginas en su propio Chromium y recibe las herramientas WebMCP de cada página, además de las estándar, en cualquier sitio.'
			},
			browsers: {
				q: '¿Funciona en Firefox y Safari?',
				a: 'Sí. Cuando el navegador no trae WebMCP propio, webmcpx carga el polyfill de WebMCP del W3C, en páginas HTTPS. Chrome, Firefox y Safari ven las mismas herramientas.'
			},
			standard: {
				q: '¿WebMCP es un estándar del W3C?',
				a: 'Todavía no. Es un borrador del W3C Web Machine Learning Community Group (2 de noviembre de 2026). Chrome y Edge lo ofrecen en origin trials, Mozilla se mantiene neutral y WebKit tiene objeciones. webmcpx sigue el borrador y carga el polyfill del W3C, así que tus herramientas funcionan ya y evolucionan con la spec.'
			},
			safe: {
				q: '¿Es seguro dejar que los agentes llamen a las herramientas de mi sitio?',
				a: 'Las herramientas se ejecutan en la propia pestaña del usuario, con sus propios permisos, y no pueden hacer nada que la página no pudiera hacer ya. Las herramientas estándar de webmcpx solo leen lo que muestra la página, sin caracteres invisibles. Marca con consequentialHint tus herramientas que cambian algo, para que los agentes puedan preguntar antes al usuario, y deja que el linter detecte instrucciones ocultas en las descripciones de las herramientas.'
			},
			mcp: {
				q: '¿WebMCP es lo mismo que MCP?',
				a: 'No. WebMCP toma prestado el modelo de herramientas de MCP, pero es una API del navegador, no el protocolo MCP: las herramientas viven en la página y se ejecutan en la pestaña del usuario. Se complementan, y el servidor MCP de webmcpx conecta ambos mundos.'
			}
		}
	},

	scan: {
		form: 'Escanear un sitio',
		address: 'La dirección de tu sitio',
		placeholder: 'tusitio.com',
		submit: 'Escanear mi sitio',
		scanning: 'Escaneando…',
		steps: [
			'Abriendo la página…',
			'Buscando herramientas WebMCP…',
			'Leyéndola como un agente…',
			'Analizando con el linter…'
		],
		verdicts: { ready: 'Listo', issues: 'Casi', missing: 'Aún no' },
		failed: 'No se pudo escanear.',
		result: {
			missing:
				'Sin herramientas WebMCP. Los agentes tienen que leer unos {tokens} de esta página y adivinar.',
			tokens: { one: '{n} token', other: '{n} tokens' },
			issues: {
				one: '{tools}, pero con {n} error de lint con el que tropezarán los agentes.',
				other: '{tools}, pero con {n} errores de lint con los que tropezarán los agentes.'
			},
			toolCount: { one: '{n} herramienta', other: '{n} herramientas' },
			basics: '{tools} y ningún error de lint, pero faltan algunos básicos para agentes.',
			cache: {
				label: 'Resultado en caché.',
				expires: 'Caduca en {time}.',
				expired: 'Este resultado en caché ha caducado.',
				rescan: 'Escanear de nuevo'
			},
			score: {
				title: 'Puntuación para agentes',
				of: '{score}/100',
				need: 'Listo para agentes desde {min}, con herramientas WebMCP y sin errores de lint.',
				groups: {
					webmcp: 'WebMCP',
					cost: 'Coste para agentes',
					readable: 'Legible',
					discoverable: 'Descubrible'
				},
				items: {
					tools: {
						label: 'Herramientas WebMCP',
						fix: 'Añade una etiqueta script: cada página obtiene búsqueda, lectura y contexto de la página.'
					},
					lint: {
						label: 'Sin errores de lint',
						fix: 'Corrige los hallazgos de abajo (npx webmcpx lint los encuentra en tu código).'
					},
					descriptions: {
						label: 'Herramientas descritas',
						fix: 'Dale a cada herramienta una descripción con la que los agentes puedan actuar.'
					},
					annotations: {
						label: 'Herramientas anotadas',
						fix: 'Marca cada herramienta con readOnlyHint, o con consequentialHint cuando cambia algo.'
					},
					cost: {
						label: 'Barato para agentes',
						fix: 'Los agentes leen la página entera: con herramientas piden solo lo que necesitan.'
					},
					llms_txt: {
						label: 'llms.txt',
						fix: 'Publica /llms.txt: qué es tu sitio y dónde encuentran los agentes el resto.'
					},
					markdown: {
						label: 'Versión en Markdown',
						fix: 'Sirve la página en Markdown (Accept: text/markdown) o enlaza una con rel="alternate".'
					},
					robots: {
						label: 'Abierto a agentes de IA',
						fix: 'Tu robots.txt deja fuera a los agentes de IA (Disallow: / para ellos).'
					},
					sitemap: {
						label: 'Sitemap',
						fix: 'Publica /sitemap.xml, o una línea Sitemap: en robots.txt.'
					},
					link_headers: {
						label: 'Cabeceras Link',
						fix: 'Añade cabeceras de respuesta Link que lleven a los agentes a llms.txt y a tu documentación (RFC 8288).'
					},
					agent_skills: {
						label: 'Índice de Agent Skills',
						fix: 'Publica /.well-known/agent-skills/index.json.'
					},
					api_catalog: {
						label: 'Catálogo de APIs',
						fix: 'Lista tus APIs en /.well-known/api-catalog (RFC 9727).'
					}
				}
			},
			ready: {
				one: '{n} herramienta que los agentes pueden llamar directamente. Bien hecho.',
				other: '{n} herramientas que los agentes pueden llamar directamente. Bien hecho.'
			},
			readySelf: {
				one: '{n} herramienta que los agentes pueden llamar directamente. Faltaría más.',
				other: '{n} herramientas que los agentes pueden llamar directamente. Faltaría más.'
			},
			tools: 'Herramientas encontradas',
			more: '+{n} más',
			findings: 'Hallazgos del linter',
			fix: 'Corregir',
			lint: 'Encuentra todos los problemas en tu código fuente, con su corrección:',
			terminal: 'terminal',
			badge: 'Muéstralo. Elige una insignia y pégala en tu sitio:',
			badgeNote:
				'El SVG va dentro del código, así que no se carga nada desde nuestros servidores. Enlaza a un escaneo en vivo de tu sitio, para que cualquiera pueda comprobarlo.',
			badgeStyle: 'Estilo de insignia',
			badgeTitle: 'Listo para agentes: compruébalo en vivo con webmcpx',
			share: 'Compartir',
			shared: 'Enlace copiado'
		},
		badges: {
			card: { name: 'Tarjeta', fits: 'Páginas claras' },
			flat: { name: 'Plana', fits: 'Pies de página' },
			readme: { name: 'README', fits: 'GitHub y npm' },
			dark: { name: 'Oscura', fits: 'Páginas oscuras' }
		},
		errors: {
			invalid: 'Escribe un sitio como notion.com o https://example.com/docs.',
			offline: 'El escáner no está disponible. Ejecútalo en local con `just serve`.',
			noScanner: 'Esta copia del sitio no tiene escáner. Ejecútalo en local con `just serve`.',
			busy: 'El escáner está ocupado. Vuelve a intentarlo en {s} s.',
			busyLater: 'El escáner está ocupado. Vuelve a intentarlo en un minuto.',
			running: 'Tu escaneo anterior sigue en curso. Espera a que termine y vuelve a escanear.',
			timeout: 'La página tardó demasiado en responder.',
			badAddress: 'Esa dirección no se puede escanear.',
			unreadable: 'No se pudo leer la página.',
			withDetail: '{lead} ({detail})',
			other: 'El escaneo falló ({status}).'
		}
	},

	brand: {
		kicker: 'Marca · sistema de diseño',
		title: 'Papel, tinta y un cruce',
		lead: 'Una página declara sus herramientas; el navegador se sitúa en medio; página y agente se encuentran sin que uno sustituya al otro. La marca dibuja ese encuentro. Todo lo que sigue se renderiza a partir del código que se publica.',
		name: {
			kicker: '01 · Nombre',
			title: 'webmcpx, siempre en minúsculas',
			rules: [
				'Siempre en minúsculas: webmcpx, también al inicio de una oración (en ese caso, mejor reescribe la oración).',
				'En código y comandos, escríbelo en Geist Mono.',
				'WebMCP es la API del navegador y se escribe como la escribe el borrador.',
				'webmcpx no es WebMCP en sí y nunca reclama el nombre WebMCP.'
			]
		},
		logo: {
			kicker: '02 · Logo',
			title: 'Tres marcas, una idea',
			lead: 'Usa el Cruce siempre que puedas. La Tarjeta es la insignia y el icono de app (desde 32px); la Página con ranura es la alternativa.',
			marks: {
				junction: { name: 'Cruce', role: 'Marca principal' },
				card: { name: 'Tarjeta', role: 'Insignia e icono de app, desde 32px' },
				'page-slot': { name: 'Página con ranura', role: 'Alternativa' }
			},
			assets: {
				mark: { label: 'Marca', use: 'Un solo color (currentColor). Docs, READMEs, presentaciones.' },
				inverse: { label: 'Inversa', use: 'Papel sobre un cuadrado de tinta.' },
				favicon: { label: 'Favicon', use: '16–32px. Se adapta al modo claro y al oscuro.' },
				appIcon: { label: 'Icono app', use: 'En color, para exportaciones de 512px.' },
				avatar: { label: 'Avatar', use: 'Margen interno del 20 %: seguro en un recorte circular.' }
			},
			asset: '{label} {use}',
			assetLabel: '{label}.',
			download: 'Descargar {mark}, {asset}, en SVG'
		},
		construction: {
			kicker: '03 · Construcción',
			title: 'Una retícula de 24 unidades, un hueco de 2',
			lead: 'Dos chevrones rellenos, simétricos. Brazos de 4,5 unidades en los extremos, vértices cortados en plano a lo largo de 2 unidades y, entre ellos, un hueco de 2 unidades que nunca se cierra: ese hueco es el navegador.',
			grid: 'El Cruce dibujado sobre su retícula de 24 unidades',
			clearSpace: 'Área de protección',
			clearSpaceText:
				'Deja alrededor de la marca un espacio libre igual a la mitad de su altura y, alrededor del logotipo completo, igual a la altura de la x.',
			minSize: 'Tamaño mínimo',
			minSizeText:
				'La marca baja hasta 16px solo en su variante de favicon. El logotipo completo, al menos 24px de alto.'
		},
		color: {
			kicker: '04 · Color',
			title: 'Papel y tinta, un solo resaltador',
			lead: 'Los valores se leen de tokens.css. Elige la versión según el fondo sobre el que va, no según el tema del lector.',
			uses: {
				paper: 'Fondo de página',
				'paper-2': 'Paneles hundidos, pistas',
				card: 'Tarjetas y campos sobre papel',
				ink: 'Texto, bordes, sombras, botón principal',
				'ink-2': 'Texto secundario',
				'ink-3': 'Leyendas y etiquetas',
				hairline: 'Separadores finos',
				marker: 'Resaltador: el único acento',
				good: 'Listo, aprobado (texto)',
				'good-soft': 'Listo, aprobado (relleno)',
				bad: 'Ausente, fallido (texto)',
				'bad-soft': 'Ausente, fallido (relleno)',
				code: 'Fondo de bloques de código',
				'on-code': 'Texto sobre bloques de código'
			},
			pairs: 'Pares de texto aprobados',
			pairsNote: 'WCAG 2.2 AA exige 4,5:1 para el texto de cuerpo; una prueba lo verifica.',
			pairsText: 'Texto sobre fondo',
			pairsContrast: 'Contraste',
			pair: '{text} sobre {bg}',
			yellow: 'El amarillo es fondo, nunca figura',
			yellowText:
				'El amarillo resaltador sobre papel mide {ratio}: no puede sostener una forma ni un texto. Úsalo detrás de la tinta: una {word}, un chip, un icono de app.',
			yellowWord: 'palabra resaltada'
		},
		type: {
			kicker: '05 · Tipografía',
			title: 'Bricolage, Geist, Geist Mono',
			styles: {
				giant: { name: 'Bricolage Grotesque · gigante', sample: 'Para agentes' },
				headline: { name: 'Bricolage Grotesque · titular', sample: 'Mismo agente. Misma pregunta.' },
				body: { name: 'Geist · cuerpo', sample: 'Frases cortas que puedes comprobar. Una idea por frase.' },
				mono: { name: 'Geist Mono · código y etiquetas', sample: 'document.modelContext.registerTool()' }
			}
		},
		components: {
			kicker: '06 · Componentes',
			title: 'Contornos de 2px, sombras duras',
			lead: 'src/lib/components/ui. Las variantes son recetas de tailwind-variants; las formas salen de los mismos tokens.',
			buttons: 'Button · variante × tamaño',
			stamps: 'Stamp · tono',
			card: 'Card',
			interactive: 'Card interactiva (al pasar el cursor)',
			empty: 'Estado vacío',
			tabs: 'Tabs',
			tabsLabel: 'Ejemplo',
			tabsItems: { one: 'Primera', two: 'Segunda' },
			tabsPanel: 'Panel de {label}. Usa las flechas del teclado.',
			codeBlock: 'CodeBlock (resaltado en tiempo de compilación)'
		},
		misuse: {
			kicker: '07 · Usos incorrectos',
			title: 'Qué no hacer',
			items: {
				stretch: 'No la estires ni la aplastes',
				rotate: 'No la gires',
				outline: 'No le añadas contornos ni trazos',
				yellow: 'No la dibujes en amarillo',
				shadow: 'No añadas sombras ni efectos a la marca',
				touch: 'No cierres el hueco entre los chevrones'
			}
		},
		trademark: {
			kicker: '08 · Marcas',
			title: 'Usa el nombre con libertad. No parezcas oficial',
			lead: 'El código tiene licencia MIT; el nombre y las marcas no están cubiertos por esa licencia. La política completa está en TRADEMARK.md.',
			sayIt: 'Dilo así',
			never: 'Nunca',
			ok: [
				'Implementa el Draft Community Group Report de WebMCP del W3C Web Machine Learning Community Group (no es un estándar del W3C).',
				'Creado con webmcpx. Compatible con webmcpx.',
				'Funciona en Chrome con el flag de WebMCP activado.'
			],
			no: [
				'La biblioteca oficial de WebMCP',
				'Estándar WebMCP del W3C',
				'Certificado por MCP',
				'webmcpx para Chrome'
			],
			voice: 'Voz',
			voiceText: 'Frases cortas que puedes comprobar. Números antes que adjetivos.',
			wordsUse: 'Palabras que usamos',
			wordsAvoid: 'Palabras que evitamos',
			use: [
				'declara',
				'expone',
				'llama',
				'medido',
				'sigue el borrador de Community Group',
				'funciona con webmcpx'
			],
			avoid: [
				'oficial',
				'estándar del W3C',
				'conforme al W3C',
				'certificado por MCP',
				'revolucionario',
				'mágico'
			],
			notices: 'Avisos',
			read: 'Leer TRADEMARK.md'
		}
	},

	benchmarkPage: {
		back: 'Volver al inicio'
	},

	ui: {
		copy: 'Copiar',
		copied: 'Copiado',
		copyLabel: 'Copiar al portapapeles',
		copyNamed: 'Copiar {title}',
		code: 'Código de {title}',
		prompt: 'prompt',
		terminal: 'terminal'
	}
};

export default es;
