// Simplified Chinese (mainland China). Transcreated from en.ts; same keys, same placeholders.
// Typography: full-width punctuation, a half-width space between Chinese and Latin letters or numbers.
// Glossary: AI agent = AI 智能体 / 智能体, agent-ready = 智能体就绪, tool = 工具, token = token,
// benchmark = 基准测试, scan = 扫描, linter = linter, prompt = 提示词, origin trial = 源试用.

import type { Messages } from './en.ts';

const zh: Messages = {
	layout: {
		skip: '跳到正文',
		suggest: {
			text: '本站也有简体中文版。',
			action: '切换到中文',
			dismiss: '关闭'
		}
	},

	meta: {
		verdicts: {
			title: '扫描判定是怎么来的 · webmcpx',
			description: '每种扫描判定的含义、扫描如何进行，以及判定有误时去哪里反馈。'
		},
		home: {
			title: 'webmcpx：你的网站智能体就绪了吗？',
			description:
				'扫描任意网站的 WebMCP 工具。一个 script 标签，让网站智能体就绪。基准测试可复现，代码开源。'
		},
		brand: {
			title: '品牌与设计系统 · webmcpx',
			description: 'webmcpx 品牌手册与设计系统：标志、颜色、字体、组件，以及商标使用规范。'
		},
		benchmark: {
			title: 'webmcpx 基准测试：{model}',
			description: '在 {model} 上对比用与不用 WebMCP：每个问题的 token、耗时、步数和成本。'
		}
	},

	header: {
		nav: '主导航',
		home: '首页',
		menu: '菜单',
		language: '语言',
		links: {
			why: '为什么',
			proof: '基准测试',
			vsMcp: '对比 MCP',
			fix: '安装',
			issues: '社区诉求',
			docs: '文档'
		}
	},

	footer: {
		tagline: '为任意网站提供标准 WebMCP 工具，再为你自己的工具配一个 linter。',
		license: 'MIT 许可证 · 独立社区项目。',
		badge: '本站已智能体就绪：点击实时检测',
		columns: { product: '产品', project: '项目', webmcp: 'WebMCP' },
		links: {
			scan: '扫描你的网站',
			verdicts: '判定规则',
			proof: '基准测试',
			install: '安装',
			issues: '解决了哪些问题',
			brand: '品牌与设计',
			trademark: '商标政策',
			spec: '规范草案',
			specIssues: '规范议题'
		},
		notices: [
			'webmcpx 是独立项目，与 LF Projects、Agentic AI Foundation、Anthropic、W3C、Google 或 Microsoft 均无隶属关系，也未获其背书。',
			'Model Context Protocol 及 MCP 标志是 LF Projects, LLC 的商标。',
			'W3C® 是万维网联盟（World Wide Web Consortium）的商标。'
		]
	},

	hero: {
		stamp: '最新',
		draft: '已跟进 {date} 版 WebMCP 草案',
		// \u200b: where the headline may break (headings only break at punctuation and these).
		title: { text: '让你的网站\u200b{mark}。', mark: '智能体就绪' },
		lead: 'AI 智能体已经在读你的网页。先看看它们读到了什么，再用一行代码给它们真正的工具。',
		try: '试试 {sites}'
	},

	logos: {
		title: { text: '{count}已经用上 WebMCP。', count: { other: '{n}+ 个网站' } },
		lead: '点击任意一个，实时扫描。',
		scan: '{site}：扫描此网站',
		note: '数量：{directory}中的在线网站（{date}）。更严格的 {knownGood} 实际运行了这些页面，确认有 {n} 个网站注册了工具（{verifiedDate}）。Logo 于 {checked} 经扫描器核验；Logo 归各自所有者所有，与本项目无关联。',
		directory: 'webmcp.com 目录',
		knownGood: 'Known Good 索引'
	},

	sources: {
		title: '来源',
		draft: 'WebMCP 草案',
		explainer: 'WebMCP 说明文档',
		ours: '我们的基准测试',
		snapshotCost: '快照成本实测',
		shopifyCheckout: 'Shopify 结账',
		mcpSpec: 'MCP 规范',
		shopifyBoth: 'Shopify 两者并用'
	},

	why: {
		kicker: '为什么用 WebMCP？',
		title: '给智能体契约，而不是截图。',
		lead: 'WebMCP 让页面把带类型的工具交给 AI 智能体，工具就在用户自己的标签页里运行。下面是它带来的改变，证据最强的排在最前。',
		today: '现在',
		with: '用上 WebMCP',
		reasons: {
			finish: {
				title: '智能体能把事办完',
				pain: '在真实网站上，测试中表现最好的智能体也有约 4 成任务失败，大多卡在筛选、排序和导航上。',
				gain: '智能体调用工具、传入带类型的参数，不用再猜哪个按钮是干什么的。'
			},
			tokens: {
				title: '只花一小部分 token',
				pain: '一次页面快照就要 12k 到 77k token，而智能体每一步都要重新发送一遍。',
				gain: '一次调用只返回所需的数据：在我们的基准测试中，{bestSite} 上的 token 最多少用 {best}（最佳情况）。'
			},
			speed: {
				title: '秒级，而不是分钟级',
				pain: '看、想、点，再来一遍：在高难度的真实任务上，智能体最长跑了 44 分钟。',
				gain: '一次调用替代一连串点击：在 WindTunnel 的基准测试中，中位耗时快 3.4 倍。'
			},
			backend: {
				title: '无需新服务器，无需 OAuth。',
				pain: '给智能体开放 API，通常意味着单独的后端、重复的状态和一套鉴权流程。',
				gain: '工具就是你的前端代码，沿用用户已有的会话运行。Shopify 就是这样上线的。'
			},
			loop: {
				title: '用户始终知情、可控',
				pain: '智能体在用户看不见的地方操作，或者把用户带去别处。',
				gain: '智能体就在用户眼前的页面上工作，工具还能标记哪些操作需要用户确认。'
			},
			state: {
				title: '同一个购物车，同一张表单',
				pain: '后端 API 看不到用户标签页里打开的购物车、表单或选中项。',
				gain: '工具直接作用于用户看到的状态，智能体一边操作，页面一边更新。'
			},
			control: {
				title: '智能体能做什么，你说了算',
				pain: '能读页面的智能体，用户能点的它都能点。',
				gain: '开放哪些操作、接受什么输入、怎么校验，都由你来定。'
			},
			small: {
				title: '接入很轻，忽略也无害',
				pain: '让网站支持智能体，听上去像个大工程。',
				gain: '注册几个工具就够了。不支持 WebMCP 的浏览器会直接跳过，一个响应头就能把它们关掉。'
			}
		},
		status:
			'WebMCP 是 W3C 社区组草案（2026 年 11 月 2 日），不是 W3C 标准。ChatGPT 桌面版的内置浏览器和 Codex 可以调用网站的 WebMCP 工具；Chrome 则需要开启 flag 或加入源试用（origin trial）。注解是网站自行声明的提示，不是保证。',
		also: '另外：'
	},

	proof: {
		kicker: '基准测试',
		title: '同一个智能体，同一个问题。',
		lead: '一个智能体靠页面快照来读、点、填；另一个调用网站的 WebMCP 工具。选一个模型看看，节省最多的排在最前。',
		byModel: '按模型查看基准测试',
		models: '模型',
		model: '模型',
		site: '网站',
		tiers: { cheap: '低价', frontier: '前沿' },
		modelHeading: '{name}（{provider}）',
		empty: {
			title: '还没有发布任何运行结果。',
			text: '运行 {command}，这里就会有数据。'
		},
		selected: {
			other:
				'精选案例：{total} 个问题中的 {shown} 个，即 WebMCP 的 token 用量不超过一半的问题。{results}均已公开，你也可以用 {command} 自己跑一遍。'
		},
		results: '全部结果',
		none: {
			title: '在 {model} 上没有问题达到这一标准。',
			text: '每个问题和两组的数据都在上方的全部结果里。'
		},
		local: '本地',
		arms: { baseline: '不用 WebMCP', webmcp: '用 WebMCP' },
		tokens: 'token',
		stats: '{time} · {steps} 步 · 每千次 {cost}',
		na: '暂无',
		solved: '解决 {n}',
		failed: '失败 {n}',
		fewerTokens: 'token 更少',
		moreTokens: 'token 更多',
		open: '打开',
		opens: '（打开 {site}）',
		rotator: {
			label: '问题',
			item: '第 {n} 个问题，共 {total} 个',
			pause: '暂停轮播',
			resume: '继续轮播'
		},
		details: '{site} 的详情',
		tabs: {
			tokens: 'Token',
			duration_ms: '耗时',
			steps: '步数',
			cost_usd: '成本',
			tools: '工具',
			method: '方法'
		},
		metrics: {
			tokens: { label: 'Token', unit: '每次运行的 token 数', column: 'token' },
			duration_ms: { label: '耗时', unit: '每次运行的秒数', column: '耗时' },
			steps: { label: '步数', unit: '每次运行的模型轮次', column: '步数' },
			cost_usd: { label: '成本', unit: '每 1,000 次运行的美元数', column: '成本' }
		},
		chart: {
			question: '问题',
			solved: '解决',
			head: '{metric} · {unit}',
			better: '越短越好',
			caption: '{metric}（按问题统计，{unit}）：越低越好。另附各组成功率。',
			armMetric: '{arm}：{metric}',
			armSolved: '{arm}：解决情况',
			row: '{site}：{question}',
			localSite: '{site}（本地测试网站）'
		},
		method: {
			setup: {
				other:
					'{model}，推理强度 {effort}，无头 Chrome。两组使用相同的提示词和步数上限；每个问题每组运行 {n} 次。'
			},
			setupNoEffort: {
				other: '{model}，无头 Chrome。两组使用相同的提示词和步数上限；每个问题每组运行 {n} 次。'
			},
			baseline: '不用 WebMCP：基于 DOM 快照的智能体，靠读、点、填完成操作。',
			webmcp: '用 WebMCP：只能使用页面注册的工具（网站自带的，或在我们的测试站点上由 webmcpx 提供）。',
			graded: '按答案中的事实和页面状态评分，不用 LLM 当评委。',
			live: '真实网站：自带 WebMCP 工具。',
			local: '本地测试网站：工具由 webmcpx 提供。',
			reproduce: '复现步骤'
		},
		tools: {
			label: '{site} 上的 WebMCP 工具',
			title: { other: '{site} 注册的 {n} 个 WebMCP 工具' },
			fromRun: '智能体当时看到的版本 · {date}',
			fromSnapshot: '描述按 {date} 的注册内容 · 基准测试运行于 {runDate}',
			tool: '工具',
			description: '描述',
			called: '已调用',
			notCalled: '未调用',
			missing: '（拍摄快照时尚未注册）'
		}
	},

	versus: {
		kicker: 'WebMCP 与 MCP',
		title: '工具理念相同，运行位置不同。',
		lead: 'WebMCP 借鉴了 MCP 的工具模型，但它是浏览器 API，不是 MCP 协议。两者互为补充。',
		caption: 'WebMCP 与 MCP 对比',
		aspect: '维度',
		rows: {
			where: {
				label: '工具在哪运行',
				webmcp: '在页面的 JavaScript 里，在用户的标签页中。',
				mcp: '在服务器进程里，本地（stdio）或远程。'
			},
			call: {
				label: '智能体如何调用',
				webmcp: '浏览器 API document.modelContext，每次调用都经由浏览器居中处理。不用 JSON-RPC。',
				mcp: '基于 stdio 或 Streamable HTTP 的 JSON-RPC 2.0。'
			},
			run: {
				label: '你要运行什么',
				webmcp: '你现有的前端，无需新服务器。',
				mcp: '一个由你托管和运维的 MCP 服务器。'
			},
			auth: {
				label: '鉴权',
				webmcp: '沿用用户已登录的会话，无需签发 token。',
				mcp: '远程服务器使用基于 OAuth 的授权。'
			},
			discovery: {
				label: '发现',
				webmcp: '打开页面即可发现；访问之前无从查找。',
				mcp: '已知端点上的 tools/list，以及公开的注册表。'
			},
			lifetime: {
				label: '生命周期',
				webmcp: '页面开着多久，就存在多久。',
				mcp: '常驻运行，不需要浏览器。'
			},
			user: {
				label: '用户',
				webmcp: '在场，与智能体在同一个页面上。',
				mcp: '可有可无：能以无头方式运行。'
			},
			covers: {
				label: '覆盖范围',
				webmcp: '只有工具，带输入和输出 schema。',
				mcp: '工具、资源和提示词，外加征询（elicitation）和扩展。'
			},
			hints: {
				label: '工具提示',
				webmcp: 'readOnlyHint、consequentialHint、untrustedContentHint。默认同源。',
				mcp: 'readOnlyHint、destructiveHint、idempotentHint、openWorldHint。'
			},
			status: {
				label: '状态',
				webmcp: 'W3C 社区组草案。ChatGPT 桌面版和 Codex 可调用；Chrome：源试用。',
				mcp: 'Linux 基金会旗下项目，公开服务器超过 10,000 个。'
			}
		},
		useBoth: '两者并用',
		verdict:
			'MCP 服务于从不打开你网站的智能体；WebMCP 服务于在你的标签页里、和用户并肩工作的智能体。两者可以跑在同一个后端上：Shopify 已经这么做了。'
	},

	fix: {
		title: '两步，智能体就绪。',
		lead: '第 1 步在你的网站上提供工具，第 2 步让你的智能体调用它们。',
		alternatives: { npm: 'npm', agent: '智能体' },
		facts: '加载约 2.4 KB · Rust + WebAssembly · MIT 许可证',
		// {tag} is `</body>` and {docs} a link: keep them. ChatGPT, Codex and Chromium are product names.
		steps: {
			site: { title: '在你的网站上', lead: '粘贴到 {tag} 之前。没有 WebMCP 的地方，它什么也不做。' },
			agent: {
				title: '在你的智能体里',
				lead: '你的智能体能拿到它打开的每个页面的 WebMCP 工具，任何 Chromium 都行，无需浏览器 flag：W3C polyfill 会先于页面加载。',
				skip: '用的是 ChatGPT 桌面应用或 Codex 应用？跳过这一步：它们原生调用 WebMCP 工具（{docs}）。'
			}
		},
		docs: 'OpenAI 文档'
	},

	own: {
		title: '让智能体动手，而不是瞎猜',
		lead: '如今，智能体想把商品加入购物车时，只能到处点击、靠猜，还常常出错。把你的按钮本来就在调用的函数交给它：类型明确的输入、清晰的结果，用的还是用户自己的会话。',
		notes: {
			agent: '你的智能体会读懂 webmcpx 做什么，在项目里找出值得开放的操作，问你要加哪些，然后添加并检查。',
			form: '无需 JavaScript：WebMCP 的声明式 API。浏览器还不支持时，脚本标签会补上。',
			js: '通过 npm，或从与脚本标签相同的 CDN 导入。',
			hook: '组件挂载期间注册，卸载时自动移除。'
		}
	},

	verdicts: {
		title: '扫描器如何判定',
		lead: '三种判定，规则公开。觉得哪个不对就告诉我们：正是这种反馈让它变得更好。',
		// {rules} is a list of lint rule names (code).
		items: {
			ready: '页面至少注册了一个 WebMCP 工具，且 linter 没有发现错误。名称过长、缺少注解之类的警告不影响。',
			issues: '页面注册了工具，但至少有一个存在 linter 错误：{rules}，或者大小超过硬性上限。',
			missing: '页面没有注册任何 WebMCP 工具。我们会显示智能体改为阅读页面要花多少 token。'
		},
		how: {
			title: '扫描如何进行',
			steps: [
				'我们在自己的服务器上用无头 Chrome 打开页面，不带 Cookie，也不登录。',
				'在页面脚本运行之前，我们加入一个 WebMCP 宿主，让页面像在智能体的浏览器里一样注册工具。它也接受旧的 navigator.modelContext 和 provideContext，基于它们构建的网站也能显示工具。',
				'页面加载完成、工具稳定后，我们读取每个工具的名称、描述、输入 schema 和注解，并用 linter 检查。',
				'token 数根据页面文本估算：字符数除以 4。',
				'结果会复用 10 分钟；每位访客每分钟可以发起一次新的扫描。'
			]
		},
		rules: '全部 linter 规则及其理由',
		disagree: '觉得判定有误？{link}',
		disagreeLink: '附上扫描链接提交 issue。'
	},

	issues: {
		kicker: '来自规范议题区',
		title: '社区提过的需求，已经实现。',
		items: {
			shared: {
				title: '共享工具',
				fix: '一个 script 标签即可注册 webmcpx 的 search_page、fetch_as_markdown 和 get_page_context；传入你的站内搜索后，还会注册 search_site。'
			},
			errors: {
				title: '智能体能处理的错误',
				fix: 'webmcpx 工具把预期内的失败作为结果返回：稳定的错误码、能否重试的标记，以及一条提示。'
			},
			paging: {
				title: '分页结果',
				fix: '所有 webmcpx 工具使用统一的结果结构，带输出预算，并用 truncated + next_cursor 分页。'
			},
			frozen: {
				title: '冻结的 modelContext',
				fix: 'webmcpx 只调用 registerTool()，从不直接赋值。已针对冻结的 modelContext 做过测试。'
			},
			hidden: {
				title: '隐藏指令',
				fix: '运行时从页面文本中剔除；linter 会标记出来，--fix 会在源码中删除。'
			},
			length: {
				title: '长度限制',
				fix: 'webmcpx lint 检查命名规则，并标记超出 Chrome 建议长度的描述。'
			},
			budget: {
				title: '工具数量上限',
				fix: 'webmcpx lint 在单页超过 20 个工具时警告，超过 100 个时报错（这是我们的规则，不是草案的）。'
			}
		}
	},

	scan: {
		form: '扫描网站',
		address: '你的网站地址',
		placeholder: 'yoursite.com',
		submit: '开始扫描',
		scanning: '扫描中…',
		steps: ['正在打开页面…', '正在查找 WebMCP 工具…', '正在像智能体一样阅读…', '正在检查工具规范…'],
		verdicts: { ready: '智能体就绪', issues: '差一点', missing: '还没有' },
		failed: '无法扫描这个网站。',
		result: {
			missing: '没有 WebMCP 工具。智能体得读完这个页面约 {tokens}，然后靠猜。',
			tokens: { other: '{n} 个 token' },
			issues: { other: '{tools}，但有 {n} 个 lint 错误会让智能体出错。' },
			toolCount: { other: '{n} 个工具' },
			ready: { other: '{n} 个工具可供智能体直接调用。漂亮。' },
			readySelf: {
				other: '{n} 个工具可供智能体直接调用。打铁还需自身硬。'
			},
			tools: '发现的工具',
			more: '+{n} 个',
			findings: 'lint 结果',
			fix: '修复',
			lint: '找出源码里的所有问题，并给出修复方案：',
			terminal: '终端',
			badge: '亮出来。选一个徽章，贴到你的网站上：',
			badgeNote:
				'SVG 直接内嵌在代码里，不会从我们这里加载任何东西。徽章链接到对你网站的实时扫描，谁都可以验证。',
			badgeStyle: '徽章样式',
			badgeTitle: '智能体就绪：用 webmcpx 实时验证',
			share: '分享结果',
			shared: '链接已复制'
		},
		badges: {
			card: { name: '卡片', fits: '浅色页面' },
			flat: { name: '扁平', fits: '页脚' },
			readme: { name: 'README', fits: 'GitHub 和 npm' },
			dark: { name: '深色', fits: '深色页面' }
		},
		errors: {
			invalid: '请输入网站地址，例如 notion.com 或 https://example.com/docs。',
			offline: '扫描器已离线。可以用 `just serve` 在本地运行。',
			noScanner: '这个站点副本没有扫描器。可以用 `just serve` 在本地运行。',
			busy: '每分钟只能扫描一次，请在 {s} 秒后重试。',
			busyLater: '扫描器正忙，请一分钟后再试。',
			timeout: '页面响应超时。',
			badAddress: '这个地址无法扫描。',
			unreadable: '无法读取这个页面。',
			withDetail: '{lead}（{detail}）',
			other: '扫描失败（{status}）。'
		}
	},

	brand: {
		kicker: '品牌手册 · 设计系统',
		title: '纸、墨与交汇点。',
		lead: '页面声明自己的工具，浏览器居于其间；页面与智能体在此相遇，谁也不取代谁。标志画的就是这次相遇。下面的一切都由实际发布的代码渲染。',
		name: {
			kicker: '01 · 名称',
			title: 'webmcpx，始终小写',
			rules: [
				'始终小写：webmcpx，位于句首也一样（宁可改写句子）。',
				'在代码和命令中，使用 Geist Mono 字体。',
				'WebMCP 是浏览器 API，拼写与草案保持一致。',
				'webmcpx 不是 WebMCP 本身，也从不以 WebMCP 自称。'
			]
		},
		logo: {
			kicker: '02 · 标志',
			title: '三个标志，一个理念',
			lead: '能用交汇点的地方都用交汇点。卡片用作徽章和应用图标（32px 及以上）；带槽页面是备用标志。',
			marks: {
				junction: { name: '交汇点', role: '主标志' },
				card: { name: '卡片', role: '徽章和应用图标，32px 及以上' },
				'page-slot': { name: '带槽页面', role: '备用标志' }
			},
			assets: {
				mark: { label: '标志', use: '单色（currentColor）。用于文档、README、幻灯片。' },
				inverse: { label: '反白', use: '墨色方块上的纸色标志。' },
				favicon: { label: 'Favicon', use: '16–32px，自动适配浅色和深色模式。' },
				appIcon: { label: '应用图标', use: '彩色，用于导出 512px 图标。' },
				avatar: { label: '头像', use: '20% 内边距：裁成圆形也安全。' }
			},
			asset: '{label}{use}',
			assetLabel: '{label}：',
			download: '下载 SVG：{mark}，{asset}'
		},
		construction: {
			kicker: '03 · 构造',
			title: '24 单位网格，2 单位间隙',
			lead: '两个实心 V 形，互为镜像。两臂末端宽 4.5 单位，顶点削平 2 单位，两者之间留出 2 单位的间隙，永不闭合：这道间隙就是浏览器。',
			grid: '绘制在 24 单位网格上的交汇点标志',
			clearSpace: '安全区',
			clearSpaceText: '标志四周的留白至少为标志高度的一半；组合标志四周的留白至少为字母 x 的高度。',
			minSize: '最小尺寸',
			minSizeText: '标志只有 favicon 版本可以缩到 16px。组合标志高度至少 24px。'
		},
		color: {
			kicker: '04 · 颜色',
			title: '纸与墨，外加一支荧光笔',
			lead: '色值读取自 tokens.css。按作品所在的背景选择版本，而不是按读者的主题。',
			uses: {
				paper: '页面背景',
				'paper-2': '凹陷面板、轨道',
				card: '纸面上的卡片和输入框',
				ink: '文字、描边、阴影、主按钮',
				'ink-2': '次要文字',
				'ink-3': '说明文字和标签',
				hairline: '细分隔线',
				marker: '荧光笔：唯一的强调色',
				good: '就绪、通过（文字）',
				'good-soft': '就绪、通过（填充）',
				bad: '缺失、失败（文字）',
				'bad-soft': '缺失、失败（填充）',
				code: '代码块背景',
				'on-code': '代码块上的文字'
			},
			pairs: '认可的文字配色',
			pairsNote: 'WCAG 2.2 AA 要求正文对比度达到 4.5:1；有测试强制检查。',
			pairsText: '文字 / 背景',
			pairsContrast: '对比度',
			pair: '{bg} 上的 {text}',
			yellow: '黄色只做背景，不做图形',
			yellowText:
				'荧光黄在纸色上的对比度只有 {ratio}：承载不了形状或文字。把它垫在墨色内容下面：一个{word}、一个标签、一个应用图标。',
			yellowWord: '高亮词'
		},
		type: {
			kicker: '05 · 字体',
			title: 'Bricolage、Geist、Geist Mono',
			styles: {
				giant: { name: 'Bricolage Grotesque · 特大', sample: '智能体就绪' },
				headline: { name: 'Bricolage Grotesque · 标题', sample: '同一个智能体，同一个问题。' },
				body: { name: 'Geist · 正文', sample: '短句，可核验。一句只讲一件事。' },
				mono: { name: 'Geist Mono · 代码与标签', sample: 'document.modelContext.registerTool()' }
			}
		},
		components: {
			kicker: '06 · 组件',
			title: '2px 描边，硬阴影',
			lead: 'src/lib/components/ui。变体是 tailwind-variants 配方；形状来自同一套设计 token。',
			buttons: 'Button · 变体 × 尺寸',
			stamps: 'Stamp · 色调',
			card: 'Card',
			interactive: '可交互的 Card（悬停）',
			empty: '空状态',
			tabs: 'Tabs',
			tabsLabel: '示例',
			tabsItems: { one: '第一项', two: '第二项' },
			tabsPanel: '“{label}”的面板。用方向键切换。',
			codeBlock: 'CodeBlock（构建时高亮）'
		},
		misuse: {
			kicker: '07 · 误用',
			title: '不要这样做',
			items: {
				stretch: '不要拉伸或压扁',
				rotate: '不要旋转',
				outline: '不要添加描边或轮廓',
				yellow: '不要用黄色绘制',
				shadow: '不要给标志添加阴影或特效',
				touch: '不要合上两个 V 形之间的间隙'
			}
		},
		trademark: {
			kicker: '08 · 商标',
			title: '名字随便用，别装官方。',
			lead: '代码采用 MIT 许可证；名称和标志不在该许可证范围内。完整政策见 TRADEMARK.md。',
			sayIt: '可以这样说',
			never: '绝不要说',
			ok: [
				'实现了 W3C Web Machine Learning 社区组的 WebMCP 社区组报告草案（Draft Community Group Report，并非 W3C 标准）。',
				'基于 webmcpx 构建。兼容 webmcpx。',
				'可在开启 WebMCP flag 的 Chrome 中使用。'
			],
			no: ['官方 WebMCP 库', 'W3C WebMCP 标准', '通过 MCP 认证', 'Chrome 版 webmcpx'],
			voice: '语气',
			voiceText: '短句，可核验。用数字说话，少用形容词。',
			wordsUse: '我们用的词',
			wordsAvoid: '我们不用的词',
			use: ['声明', '暴露', '调用', '实测', '跟进社区组草案', '兼容 webmcpx'],
			avoid: ['官方', 'W3C 标准', '符合 W3C 规范', '通过 MCP 认证', '革命性', '神奇'],
			notices: '声明',
			read: '阅读 TRADEMARK.md'
		}
	},

	benchmarkPage: {
		back: '返回首页'
	},

	ui: {
		copy: '复制',
		copied: '已复制',
		copyLabel: '复制到剪贴板',
		copyNamed: '复制 {title}',
		code: '{title} 代码'
	}
};

export default zh;
