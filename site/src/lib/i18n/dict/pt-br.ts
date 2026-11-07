// Português do Brasil. Transcreação de en.ts: mesmas chaves, mesmos placeholders.
// Plurais: em pt-BR, Intl.PluralRules usa `one` para 0 e 1, `other` para o resto.

import type { Messages } from './en.ts';

const ptBr: Messages = {
	layout: {
		skip: 'Pular para o conteúdo',
		suggest: {
			text: 'Este site também está em português.',
			action: 'Ler em português',
			dismiss: 'Fechar'
		}
	},

	meta: {
		verdicts: {
			title: 'Como funcionam os vereditos do scan · webmcpx',
			description:
				'O que cada veredito do scan significa, como um scan roda e onde dizer que um veredito está errado.'
		},
		home: {
			title: 'webmcpx: seu site está pronto para agentes?',
			description:
				'Verifique se qualquer site tem ferramentas WebMCP. Uma tag script deixa o seu pronto para agentes. Benchmark reproduzível, open source.'
		},
		brand: {
			title: 'Marca e design system · webmcpx',
			description:
				'O manual de marca e o design system do webmcpx: logo, cor, tipografia, componentes e uso da marca.'
		},
		benchmark: {
			title: 'Benchmark do webmcpx: {model}',
			description: 'Com e sem WebMCP no {model}: tokens, tempo, passos e custo por pergunta.'
		}
	},

	header: {
		nav: 'Principal',
		home: 'início',
		menu: 'Menu',
		language: 'Idioma',
		links: {
			why: 'Por quê',
			proof: 'Benchmark',
			vsMcp: 'vs MCP',
			fix: 'Instalar',
			issues: 'Issues',
			docs: 'Docs'
		}
	},

	footer: {
		tagline: 'Ferramentas WebMCP padrão para todo site, e um linter para as suas.',
		license: 'Licença MIT · um projeto independente da comunidade.',
		badge: 'Este site está pronto para agentes: confira ao vivo',
		columns: { product: 'Produto', project: 'Projeto', webmcp: 'WebMCP' },
		links: {
			scan: 'Escaneie seu site',
			verdicts: 'Como funcionam os vereditos',
			proof: 'Benchmark',
			install: 'Instalar',
			issues: 'Issues resolvidas',
			brand: 'Marca e design',
			trademark: 'Política de marca',
			spec: 'Rascunho da spec',
			specIssues: 'Issues da spec'
		},
		notices: [
			'O webmcpx é um projeto independente, sem vínculo com LF Projects, Agentic AI Foundation, Anthropic, W3C, Google ou Microsoft, nem endossado por eles.',
			'Model Context Protocol e o logo do MCP são marcas comerciais da LF Projects, LLC.',
			'W3C® é uma marca comercial do World Wide Web Consortium.'
		]
	},

	hero: {
		stamp: 'Novo',
		draft: 'Acompanha o rascunho do WebMCP de {date}',
		title: { text: 'Deixe seu site {mark}.', mark: 'pronto para agentes' },
		lead: 'Agentes de IA já leem suas páginas. Veja o que eles recebem e entregue ferramentas de verdade com uma linha.',
		try: 'Experimente {sites}'
	},

	logos: {
		title: { text: '{count} já falam WebMCP.', count: { one: '{n}+ site', other: '{n}+ sites' } },
		lead: 'Clique em qualquer um para escaneá-lo ao vivo.',
		scan: '{site}: escanear este site',
		note: 'Contagem: sites no ar no {directory} ({date}). O {knownGood}, mais rigoroso, viu {n} sites registrarem ferramentas ao executar suas páginas ({verifiedDate}). Logos verificados com o scanner em {checked}; pertencem aos seus donos, sem nenhum vínculo.',
		directory: 'diretório do webmcp.com',
		knownGood: 'índice Known Good'
	},

	sources: {
		title: 'Fontes',
		draft: 'Rascunho do WebMCP',
		explainer: 'Explainer do WebMCP',
		ours: 'Nosso benchmark',
		snapshotCost: 'Custo do snapshot, medido',
		shopifyCheckout: 'Checkout da Shopify',
		mcpSpec: 'Especificação do MCP',
		shopifyBoth: 'Shopify nos dois'
	},

	why: {
		kicker: 'Por que WebMCP?',
		title: 'Dê aos agentes um contrato, não um print.',
		lead: 'Com WebMCP, sua página entrega aos agentes de IA ferramentas tipadas que rodam na própria aba do usuário. Veja o que muda, começando pela evidência mais forte.',
		today: 'Hoje',
		with: 'Com WebMCP',
		reasons: {
			finish: {
				title: 'Agentes que terminam o trabalho',
				pain: 'Em sites no ar, o melhor agente testado falhou em cerca de 4 a cada 10 tarefas, principalmente em filtros, ordenação e navegação.',
				gain: 'O agente chama uma ferramenta com entrada tipada em vez de adivinhar qual botão faz o quê.'
			},
			tokens: {
				title: 'Uma fração dos tokens',
				pain: 'Um único snapshot de página pode custar de 12 mil a 77 mil tokens, e o agente o reenvia a cada passo.',
				gain: 'Uma chamada devolve só os dados pedidos: até {best} menos tokens em {bestSite} no nosso benchmark (melhor caso).'
			},
			speed: {
				title: 'Segundos, não minutos',
				pain: 'Olhar, pensar, clicar, repetir: em tarefas difíceis em sites no ar, agentes rodaram por até 44 minutos.',
				gain: 'Uma chamada substitui uma sequência de cliques: mediana 3,4× mais rápida no benchmark da WindTunnel.'
			},
			backend: {
				title: 'Sem servidor novo. Sem OAuth.',
				pain: 'Dar uma API aos agentes costuma exigir um backend separado, estado duplicado e um fluxo de autenticação.',
				gain: 'As ferramentas são o seu código de front-end, rodando com a sessão que o usuário já tem. A Shopify já faz assim em produção.'
			},
			loop: {
				title: 'O usuário continua no controle',
				pain: 'O agente age longe dos olhos do usuário, ou o manda para outro lugar.',
				gain: 'O agente trabalha na página que o usuário está vendo, e as ferramentas podem sinalizar ações que pedem confirmação.'
			},
			state: {
				title: 'Mesmo carrinho, mesmo formulário',
				pain: 'Uma API de backend não enxerga o carrinho, o formulário ou a seleção abertos na aba do usuário.',
				gain: 'As ferramentas agem sobre o estado que o usuário vê, e a página se atualiza enquanto o agente trabalha.'
			},
			control: {
				title: 'Você define o que o agente faz',
				pain: 'Um agente que lê a página pode clicar em tudo o que o usuário pode.',
				gain: 'Você publica as ações, as entradas de cada uma e a sua própria validação.'
			},
			small: {
				title: 'Leve de pôr, seguro de ignorar',
				pain: 'Deixar o site pronto para agentes parece um projetão.',
				gain: 'Alguns registros de ferramenta. Navegadores sem WebMCP os ignoram, e um header os desliga.'
			}
		},
		status:
			'WebMCP é um rascunho de Community Group do W3C (2 de novembro de 2026), não um padrão do W3C. O navegador do app de desktop do ChatGPT e o Codex podem chamar as ferramentas WebMCP de um site; no Chrome, ele roda atrás de uma flag ou em origin trial. As anotações são dicas que o site declara, não garantias.',
		also: 'E também:'
	},

	proof: {
		kicker: 'Benchmark',
		title: 'Mesmo agente. Mesma pergunta.',
		lead: 'Um agente lê, clica e preenche a partir de snapshots da página; o outro chama as ferramentas WebMCP do site. Escolha um modelo; as maiores economias vêm primeiro.',
		byModel: 'Benchmark por modelo',
		models: 'Modelos',
		model: 'Modelo',
		site: 'Site',
		tiers: { cheap: 'barato', frontier: 'fronteira' },
		modelHeading: '{name} ({provider})',
		empty: {
			title: 'Nenhuma execução publicada ainda.',
			text: 'Rode {command} para preencher esta seção.'
		},
		selected: {
			one: 'Casos selecionados: {shown} de {total} pergunta, em que o WebMCP usou no máximo metade dos tokens. {results} são públicos, ou rode você mesmo com {command}.',
			other:
				'Casos selecionados: {shown} de {total} perguntas, em que o WebMCP usou no máximo metade dos tokens. {results} são públicos, ou rode você mesmo com {command}.'
		},
		results: 'Todos os resultados',
		none: {
			title: 'Nenhuma pergunta passou no critério com o {model}.',
			text: 'Todas as perguntas, nos dois cenários, estão nos resultados completos acima.'
		},
		local: 'local',
		arms: { baseline: 'Sem WebMCP', webmcp: 'Com WebMCP' },
		tokens: 'tokens',
		stats: '{time} · {steps} passos · {cost} por 1 mil',
		na: 'n/d',
		solved: 'Resolveu {n}',
		failed: 'Falhou {n}',
		fewerTokens: 'menos tokens',
		moreTokens: 'mais tokens',
		open: 'Abrir',
		opens: '(abre {site})',
		rotator: {
			label: 'Perguntas',
			item: 'Pergunta {n} de {total}',
			pause: 'Pausar rotação',
			resume: 'Retomar rotação'
		},
		details: 'Detalhes de {site}',
		tabs: {
			tokens: 'Tokens',
			duration_ms: 'Tempo',
			steps: 'Passos',
			cost_usd: 'Custo',
			tools: 'Ferramentas',
			method: 'Método'
		},
		metrics: {
			tokens: { label: 'Tokens', unit: 'tokens por execução', column: 'tokens' },
			duration_ms: { label: 'Tempo', unit: 'segundos por execução', column: 'tempo' },
			steps: { label: 'Passos', unit: 'turnos do modelo por execução', column: 'passos' },
			cost_usd: { label: 'Custo', unit: 'USD por 1.000 execuções', column: 'custo' }
		},
		chart: {
			question: 'Pergunta',
			solved: 'Resolvida',
			head: '{metric} · {unit}',
			caption: '{metric} por pergunta, em {unit}; quanto menor, melhor. Taxa de sucesso por cenário.',
			armMetric: '{arm}: {metric}',
			armSolved: '{arm}: resolvida',
			row: '{site}: {question}',
			localSite: '{site} (site de teste local)'
		},
		method: {
			setup: {
				one: '{model}, raciocínio {effort}, Chrome headless. Mesmo prompt e mesmo limite de passos nos dois cenários; {n} execução por pergunta e cenário.',
				other:
					'{model}, raciocínio {effort}, Chrome headless. Mesmo prompt e mesmo limite de passos nos dois cenários; {n} execuções por pergunta e cenário.'
			},
			setupNoEffort: {
				one: '{model}, Chrome headless. Mesmo prompt e mesmo limite de passos nos dois cenários; {n} execução por pergunta e cenário.',
				other:
					'{model}, Chrome headless. Mesmo prompt e mesmo limite de passos nos dois cenários; {n} execuções por pergunta e cenário.'
			},
			baseline: 'Sem WebMCP: um agente baseado em snapshots do DOM, que lê, clica e preenche.',
			webmcp:
				'Com WebMCP: só as ferramentas que a página registra (as dela, ou as do webmcpx nos nossos sites de teste).',
			graded: 'Avaliado pelos fatos na resposta e pelo estado da página. Sem LLM como juiz.',
			live: 'Um site no ar: ele publica as próprias ferramentas WebMCP.',
			local: 'Um site de teste local: as ferramentas vêm do webmcpx.',
			reproduce: 'reproduza você mesmo'
		},
		tools: {
			label: 'Ferramentas WebMCP em {site}',
			title: {
				one: 'A {n} ferramenta WebMCP que {site} registra',
				other: 'As {n} ferramentas WebMCP que {site} registra'
			},
			fromRun: 'como o agente as viu · {date}',
			fromSnapshot: 'descrições registradas em {date} · benchmark em {runDate}',
			tool: 'Ferramenta',
			description: 'Descrição',
			called: 'Chamada',
			notCalled: 'Não chamada',
			missing: '(não registrada quando o snapshot foi feito)'
		}
	},

	versus: {
		kicker: 'WebMCP vs MCP',
		title: 'A mesma ideia de ferramenta. Outro lugar.',
		lead: 'O WebMCP pega emprestado o modelo de ferramentas do MCP, mas é uma API do navegador, não o protocolo MCP. Os dois se complementam.',
		caption: 'WebMCP comparado ao MCP',
		aspect: 'Aspecto',
		rows: {
			where: {
				label: 'Onde a ferramenta roda',
				webmcp: 'No JavaScript da sua página, na aba do usuário.',
				mcp: 'Em um processo de servidor, local (stdio) ou remoto.'
			},
			call: {
				label: 'Como o agente chama',
				webmcp:
					'Uma API do navegador, document.modelContext; o navegador intermedeia cada chamada. Sem JSON-RPC.',
				mcp: 'JSON-RPC 2.0 via stdio ou Streamable HTTP.'
			},
			run: {
				label: 'O que você roda',
				webmcp: 'O front-end que você já tem. Nenhum servidor novo.',
				mcp: 'Um servidor MCP que você hospeda e opera.'
			},
			auth: {
				label: 'Autenticação',
				webmcp: 'A sessão em que o usuário já está logado. Nenhum token para emitir.',
				mcp: 'Autorização baseada em OAuth para servidores remotos.'
			},
			discovery: {
				label: 'Descoberta',
				webmcp: 'Assim que a página abre. Não há nada a descobrir antes da visita.',
				mcp: 'tools/list em um endpoint conhecido, e registries públicos.'
			},
			lifetime: {
				label: 'Ciclo de vida',
				webmcp: 'Enquanto a página estiver aberta.',
				mcp: 'Sempre ativo, sem precisar de navegador.'
			},
			user: {
				label: 'O usuário',
				webmcp: 'Presente, na mesma página que o agente.',
				mcp: 'Opcional: funciona headless.'
			},
			covers: {
				label: 'Abrange',
				webmcp: 'Só ferramentas, com schemas de entrada e saída.',
				mcp: 'Ferramentas, recursos e prompts, além de elicitation e extensões.'
			},
			hints: {
				label: 'Dicas nas ferramentas',
				webmcp:
					'readOnlyHint, consequentialHint, untrustedContentHint. Mesma origem (same-origin) por padrão.',
				mcp: 'readOnlyHint, destructiveHint, idempotentHint, openWorldHint.'
			},
			status: {
				label: 'Status',
				webmcp: 'Rascunho de Community Group do W3C. ChatGPT desktop e Codex chamam; Chrome: origin trial.',
				mcp: 'Um projeto da Linux Foundation, com mais de 10.000 servidores públicos.'
			}
		},
		useBoth: 'Use os dois',
		verdict:
			'O MCP atende agentes que nunca abrem o seu site. O WebMCP atende agentes que trabalham na sua aba, ao lado do seu usuário. Rode os dois sobre o mesmo backend: a Shopify já faz isso.'
	},

	fix: {
		title: 'Dois passos. Pronto para agentes.',
		lead: 'O passo 1 coloca ferramentas no seu site. O passo 2 deixa seu agente chamá-las.',
		alternatives: { npm: 'npm', agent: 'seu agente de código' },
		facts: '~3,2 KB ao carregar · Rust + WebAssembly · MIT',
		// {tag} is `</body>` and {docs} a link: keep them. ChatGPT, Codex and Chromium are product names.
		steps: {
			site: { title: 'No seu site', lead: 'Cole antes de {tag}. Onde não há WebMCP, ele não faz nada.' },
			agent: {
				title: 'No seu agente',
				lead: 'Seu agente recebe as ferramentas WebMCP de cada página que abrir, em qualquer Chromium e sem flag no navegador: o polyfill do W3C carrega antes da página.',
				skip: 'Usa o app de desktop do ChatGPT ou o app do Codex? Pule este passo: eles chamam ferramentas WebMCP de forma nativa ({docs}).'
			}
		},
		docs: 'docs da OpenAI'
	},

	own: {
		title: 'Deixe os agentes agirem, não adivinharem',
		lead: 'Hoje, um agente que quer pôr algo no carrinho sai clicando e adivinhando, e muitas vezes erra. Entregue a ele a função que o seu botão já chama: entrada tipada, resposta clara e a sessão do próprio usuário.',
		notes: {
			agent:
				'Seu agente lê o que o webmcpx faz, encontra no projeto as ações que vale expor, pergunta quais você quer, depois adiciona e confere.',
			form: 'Sem JavaScript: a API declarativa do WebMCP. A tag de script adiciona onde o navegador ainda não tem.',
			js: 'Pelo npm, ou importando da mesma CDN da tag de script.',
			hook: 'Registrada enquanto o componente está montado, removida quando ele sai.'
		}
	},

	closing: {
		title: 'Escaneie agora o site que você tem aberto.',
		lead: 'O veredito, as ferramentas e o que um agente leria no lugar delas, com um card para compartilhar.'
	},

	verdicts: {
		title: 'Como o scanner decide',
		lead: 'Três vereditos, regras abertas. Se algum parecer errado, avise: é esse o feedback que melhora o scanner.',
		// {rules} is a list of lint rule names (code).
		items: {
			ready:
				'A página registra ao menos uma ferramenta WebMCP e o linter não acha erros nelas. Avisos, como um nome longo ou anotações faltando, não impedem.',
			issues:
				'A página registra ferramentas, mas ao menos uma tem um erro do linter: {rules}, ou um tamanho acima do limite rígido.',
			missing:
				'A página não registra nenhuma ferramenta WebMCP. Mostramos quantos tokens um agente gastaria lendo a página no lugar delas.'
		},
		how: {
			title: 'Como um scan roda',
			steps: [
				'Abrimos a página num Chrome headless no nosso servidor, sem cookies e sem login.',
				'Antes de os scripts da página rodarem, adicionamos um host WebMCP, para que a página registre as ferramentas como faria no navegador de um agente. Ele também aceita os antigos navigator.modelContext e provideContext, para que sites feitos com eles ainda mostrem suas ferramentas.',
				'Depois que a página carrega e as ferramentas se estabilizam, lemos nome, descrição, schema de entrada e anotações de cada uma e passamos o linter.',
				'Os tokens são estimados a partir do texto da página: os caracteres divididos por quatro.',
				'Um resultado vale por 10 minutos; cada visitante pode iniciar um scan novo por minuto.'
			]
		},
		rules: 'Todas as regras do linter, com os motivos',
		disagree: 'Acha que um veredito está errado? {link}',
		disagreeLink: 'Abra uma issue com o link do scan.'
	},

	issues: {
		kicker: 'Das issues da spec',
		title: 'O que a comunidade pediu. Feito.',
		items: {
			shared: {
				title: 'Ferramentas compartilhadas',
				fix: 'Uma tag script registra search_page, fetch_as_markdown e get_page_context do webmcpx; search_site, quando você passa a sua busca.'
			},
			errors: {
				title: 'Erros que orientam o agente',
				fix: 'As ferramentas do webmcpx devolvem falhas esperadas como resultado: um código de erro estável, uma flag retryable e uma dica.'
			},
			paging: {
				title: 'Resultados paginados',
				fix: 'Toda ferramenta do webmcpx usa o mesmo formato de resultado, com limites de saída e paginação por truncated + next_cursor.'
			},
			frozen: {
				title: 'modelContext congelado',
				fix: 'O webmcpx só chama registerTool(), nunca faz atribuição. Testado contra um modelContext congelado.'
			},
			hidden: {
				title: 'Instruções ocultas',
				fix: 'Removidas do texto da página em tempo de execução; o linter as aponta e o --fix as tira do código-fonte.'
			},
			length: {
				title: 'Limites de tamanho',
				fix: 'O webmcpx lint verifica as regras de nome e aponta descrições acima do que o Chrome orienta.'
			},
			budget: {
				title: 'Limite de ferramentas',
				fix: 'O webmcpx lint avisa acima de 20 ferramentas por página e dá erro acima de 100 (regra nossa, não do rascunho).'
			}
		}
	},

	scan: {
		form: 'Escanear um site',
		address: 'Endereço do seu site',
		placeholder: 'seusite.com.br',
		submit: 'Escanear',
		scanning: 'Escaneando…',
		steps: [
			'Abrindo a página…',
			'Procurando ferramentas WebMCP…',
			'Lendo como um agente…',
			'Rodando o lint nas ferramentas…'
		],
		verdicts: { ready: 'Pronto', issues: 'Quase', missing: 'Ainda não' },
		failed: 'Não foi possível escanear.',
		result: {
			missing:
				'Nenhuma ferramenta WebMCP. Os agentes precisam ler cerca de {tokens} desta página e adivinhar.',
			tokens: { one: '{n} token', other: '{n} tokens' },
			issues: {
				one: '{tools}, mas com {n} erro de lint em que os agentes vão tropeçar.',
				other: '{tools}, mas com {n} erros de lint em que os agentes vão tropeçar.'
			},
			toolCount: { one: '{n} ferramenta', other: '{n} ferramentas' },
			ready: {
				one: '{n} ferramenta que os agentes chamam direto. Boa.',
				other: '{n} ferramentas que os agentes chamam direto. Boa.'
			},
			readySelf: {
				one: '{n} ferramenta que os agentes chamam direto. Em casa de ferreiro, espeto de aço.',
				other: '{n} ferramentas que os agentes chamam direto. Em casa de ferreiro, espeto de aço.'
			},
			tools: 'Ferramentas encontradas',
			more: '+{n} outras',
			findings: 'Resultados do lint',
			fix: 'Resolva com uma linha. Cole antes de {tag}:',
			lint: 'Encontre todos os problemas no seu código-fonte, com as correções:',
			terminal: 'terminal',
			badge: 'Mostre isso. Escolha um badge e cole no seu site:',
			badgeNote:
				'O SVG vai dentro do código, então nada é carregado de nós. Ele aponta para um scan ao vivo do seu site, e qualquer pessoa pode conferir.',
			badgeStyle: 'Estilo do badge',
			badgeTitle: 'Pronto para agentes: confira ao vivo com o webmcpx',
			share: 'Compartilhar',
			shared: 'Link copiado'
		},
		badges: {
			card: { name: 'Cartão', fits: 'Páginas claras' },
			flat: { name: 'Plano', fits: 'Rodapés' },
			readme: { name: 'README', fits: 'GitHub e npm' },
			dark: { name: 'Escuro', fits: 'Páginas escuras' }
		},
		errors: {
			invalid: 'Digite um site como notion.com ou https://example.com/docs.',
			offline: 'O scanner está offline. Rode localmente com `just serve`.',
			noScanner: 'Esta cópia do site não tem scanner. Rode localmente com `just serve`.',
			busy: 'Um scan por minuto, por favor. Tente de novo em {s} s.',
			busyLater: 'O scanner está ocupado. Tente de novo em um minuto.',
			timeout: 'A página demorou demais para responder.',
			badAddress: 'Esse endereço não pode ser escaneado.',
			unreadable: 'Não foi possível ler a página.',
			withDetail: '{lead} ({detail})',
			other: 'O scan falhou ({status}).'
		}
	},

	brand: {
		kicker: 'Marca e design system',
		title: 'Papel, tinta e uma junção.',
		lead: 'A página declara suas ferramentas; o navegador fica no meio; página e agente se encontram sem que um substitua o outro. A marca desenha esse encontro. Tudo abaixo é renderizado a partir do código que vai para produção.',
		name: {
			kicker: '01 · Nome',
			title: 'webmcpx, sempre em minúsculas',
			rules: [
				'Sempre em minúsculas: webmcpx, inclusive no início da frase (nesse caso, reescreva a frase).',
				'Em código e comandos, use Geist Mono.',
				'WebMCP é a API do navegador, escrita como o rascunho a escreve.',
				'webmcpx não é o WebMCP em si e nunca reivindica o nome WebMCP.'
			]
		},
		logo: {
			kicker: '02 · Logo',
			title: 'Três marcas, uma ideia',
			lead: 'Use a Junção sempre que puder. O Cartão é o badge e o ícone de app (32px ou mais); a Página com fenda é a alternativa.',
			marks: {
				junction: { name: 'Junção', role: 'Marca principal' },
				card: { name: 'Cartão', role: 'Badge e ícone de app, 32px ou mais' },
				'page-slot': { name: 'Página com fenda', role: 'Alternativa' }
			},
			assets: {
				mark: { label: 'Marca', use: 'Uma cor (currentColor). Docs, READMEs, slides.' },
				inverse: { label: 'Invertida', use: 'Papel sobre um quadrado de tinta.' },
				favicon: { label: 'Favicon', use: '16–32px. Acompanha o modo claro e o escuro.' },
				appIcon: { label: 'Ícone', use: 'Colorido, para exportar em 512px.' },
				avatar: { label: 'Avatar', use: 'Margem de 20%: seguro em recorte circular.' }
			},
			asset: '{label} {use}',
			assetLabel: '{label}.',
			download: 'Baixar SVG: {mark}, {asset}'
		},
		construction: {
			kicker: '03 · Construção',
			title: 'Grade de 24 unidades, vão de 2',
			lead: 'Dois chevrons preenchidos, espelhados. Braços de 4,5 unidades nas pontas, vértices cortados retos ao longo de 2 unidades e, entre eles, um vão de 2 unidades que nunca se fecha: esse vão é o navegador.',
			grid: 'A Junção desenhada na grade de 24 unidades',
			clearSpace: 'Área de respiro',
			clearSpaceText:
				'Mantenha ao redor da marca um espaço livre igual a metade da altura dela e, ao redor do lockup, igual à altura do x.',
			minSize: 'Tamanho mínimo',
			minSizeText: 'A marca só desce até 16px na variante favicon. O lockup tem no mínimo 24px de altura.'
		},
		color: {
			kicker: '04 · Cor',
			title: 'Papel e tinta, um marca-texto',
			lead: 'Os valores vêm de tokens.css. Escolha a arte pelo fundo em que ela vai ficar, não pelo tema de quem lê.',
			uses: {
				paper: 'Fundo da página',
				'paper-2': 'Painéis rebaixados, trilhas',
				card: 'Cards e campos sobre o papel',
				ink: 'Texto, bordas, sombras, botões primários',
				'ink-2': 'Texto secundário',
				'ink-3': 'Legendas e rótulos',
				hairline: 'Divisórias finas',
				marker: 'Marca-texto: o único destaque',
				good: 'Pronto, aprovado (texto)',
				'good-soft': 'Pronto, aprovado (preenchimento)',
				bad: 'Ausente, reprovado (texto)',
				'bad-soft': 'Ausente, reprovado (preenchimento)',
				code: 'Fundo dos blocos de código',
				'on-code': 'Texto nos blocos de código'
			},
			pairs: 'Pares de texto aprovados',
			pairsNote: 'A WCAG 2.2 AA exige 4,5:1 para texto corrido; um teste garante isso.',
			pairsText: 'Texto sobre fundo',
			pairsContrast: 'Contraste',
			pair: '{text} sobre {bg}',
			yellow: 'Amarelo é fundo, nunca figura',
			yellowText:
				'O amarelo marca-texto sobre o papel mede {ratio}: não sustenta forma nem texto. Use-o por trás da tinta: uma {word}, um chip, um ícone de app.',
			yellowWord: 'palavra destacada'
		},
		type: {
			kicker: '05 · Tipografia',
			title: 'Bricolage, Geist, Geist Mono',
			styles: {
				giant: { name: 'Bricolage Grotesque · gigante', sample: 'Pronto' },
				headline: { name: 'Bricolage Grotesque · título', sample: 'Mesmo agente. Mesma pergunta.' },
				body: { name: 'Geist · texto', sample: 'Frases curtas que dá para conferir. Uma ideia em cada.' },
				mono: { name: 'Geist Mono · código e rótulos', sample: 'document.modelContext.registerTool()' }
			}
		},
		components: {
			kicker: '06 · Componentes',
			title: 'Contornos de 2px, sombras duras',
			lead: 'src/lib/components/ui. As variantes são receitas de tailwind-variants; as formas vêm dos mesmos tokens.',
			buttons: 'Button · variante × tamanho',
			stamps: 'Stamp · tom',
			card: 'Card',
			interactive: 'Card interativo (hover)',
			empty: 'Estado vazio',
			tabs: 'Tabs',
			tabsLabel: 'Exemplo',
			tabsItems: { one: 'Primeira', two: 'Segunda' },
			tabsPanel: 'Painel de {label}. Use as setas do teclado.',
			codeBlock: 'CodeBlock (destacado no build)'
		},
		misuse: {
			kicker: '07 · Usos indevidos',
			title: 'Não faça',
			items: {
				stretch: 'Não estique nem achate',
				rotate: 'Não gire',
				outline: 'Não adicione contornos nem traços',
				yellow: 'Não desenhe em amarelo',
				shadow: 'Não adicione sombras nem efeitos à marca',
				touch: 'Não feche o vão entre os chevrons'
			}
		},
		trademark: {
			kicker: '08 · Marcas',
			title: 'Use o nome à vontade. Não pareça oficial.',
			lead: 'O código tem licença MIT; o nome e as marcas não estão cobertos por essa licença. A política completa está em TRADEMARK.md.',
			sayIt: 'Diga assim',
			never: 'Nunca',
			ok: [
				'Implementa o WebMCP Draft Community Group Report (relatório de rascunho) do W3C Web Machine Learning Community Group (não é um padrão do W3C).',
				'Feito com webmcpx. Compatível com webmcpx.',
				'Funciona no Chrome com a flag do WebMCP ativada.'
			],
			no: ['A biblioteca oficial do WebMCP', 'Padrão W3C WebMCP', 'Certificado MCP', 'webmcpx para Chrome'],
			voice: 'Voz',
			voiceText: 'Frases curtas que dá para conferir. Números em vez de adjetivos.',
			wordsUse: 'Palavras que usamos',
			wordsAvoid: 'Palavras que evitamos',
			use: [
				'declara',
				'expõe',
				'chama',
				'medido',
				'segue o rascunho do Community Group',
				'funciona com webmcpx'
			],
			avoid: [
				'oficial',
				'padrão W3C',
				'em conformidade com o W3C',
				'certificado MCP',
				'revolucionário',
				'mágico'
			],
			notices: 'Avisos legais',
			read: 'Ler o TRADEMARK.md'
		}
	},

	benchmarkPage: {
		back: 'Voltar para a página inicial'
	},

	ui: {
		copy: 'Copiar',
		copied: 'Copiado',
		copyLabel: 'Copiar para a área de transferência',
		copyNamed: 'Copiar {title}',
		code: 'Código de {title}'
	}
};

export default ptBr;
