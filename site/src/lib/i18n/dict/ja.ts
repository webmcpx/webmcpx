// Japanese (ja-JP). Transcreated from en.ts: same keys, same placeholders. Japanese has only the `other`
// plural category. Key term for "agent-ready": エージェント対応.
import type { Messages } from './en.ts';

const ja: Messages = {
	layout: {
		skip: '本文へスキップ',
		suggest: {
			text: 'このサイトは日本語でも読めます。',
			action: '日本語で読む',
			dismiss: '閉じる'
		}
	},

	meta: {
		verdicts: {
			title: 'スキャン判定の仕組み · webmcpx',
			description: '各判定の意味、スキャンの流れ、判定が違うと思ったときの連絡先。'
		},
		home: {
			title: 'webmcpx：すべてのサイトとエージェントに WebMCP を',
			description:
				'あらゆるサイトの WebMCP ツールをスキャン。1 行で自分のサイトをエージェント対応にし、Claude Code や Codex にどのサイトでも WebMCP を。オープンソース。'
		},
		brand: {
			title: 'ブランドとデザインシステム · webmcpx',
			description:
				'webmcpx のブランドマニュアルとデザインシステム。ロゴ、カラー、書体、コンポーネント、商標の使い方。'
		},
		benchmark: {
			title: 'webmcpx ベンチマーク：{model}',
			description: '{model} で WebMCP あり・なしを比較。質問ごとのトークン、時間、ステップ、コスト。'
		}
	},

	header: {
		nav: 'メイン',
		home: 'ホーム',
		menu: 'メニュー',
		language: '言語',
		links: {
			why: 'メリット',
			proof: 'リーダーボード',
			vsMcp: 'MCP 比較',
			sites: 'サイト',
			agents: 'エージェント',
			issues: 'ギャップ',
			docs: 'Docs'
		}
	},

	footer: {
		tagline: 'あらゆるサイトに標準の WebMCP ツールを。自作ツールにはリンターを。',
		license: 'MIT ライセンス · 独立したコミュニティプロジェクトです。',
		badge: 'このサイトはエージェント対応済み：ライブで確認',
		columns: { product: 'プロダクト', project: 'プロジェクト', webmcp: 'WebMCP' },
		links: {
			scan: 'サイトをスキャン',
			verdicts: '判定の仕組み',
			proof: 'リーダーボード',
			sites: 'サイト向け',
			agents: 'エージェント向け',
			issues: 'ギャップ',
			brand: 'ブランドとデザイン',
			trademark: '商標ポリシー',
			spec: '仕様ドラフト',
			specIssues: '仕様の Issues'
		},
		notices: [
			'webmcpx は独立したプロジェクトであり、LF Projects、Agentic AI Foundation、Anthropic、W3C、Google、Microsoft のいずれとも提携しておらず、承認も受けていません。',
			'Model Context Protocol および MCP ロゴは LF Projects, LLC の商標です。',
			'W3C® は World Wide Web Consortium の商標です。'
		]
	},

	hero: {
		stamp: '最新',
		draft: '{date} 版の WebMCP ドラフトに追従',
		title: { text: 'そのサイトを、{mark}に', mark: 'エージェント対応' },
		lead: '私たちのベンチマークでは、WebMCPを使うとエージェントの{mark}されました（最良ケース：{site}、{model}）。あなたのサイトでエージェントが何を得るかを確認し、1行で改善しましょう。',
		// The part of the lead set in highlighter ({best} is the ratio).
		leadMark: 'トークンが最大{best}削減',
		// Without a published run (no number to quote).
		leadPlain:
			'AI エージェントは、すでにあなたのページを読んでいます。何が見えているかを確かめたら、1 行で本物のツールを渡しましょう。',
		try: 'お試し：{sites}',
		entry: { question: 'サイトはなく、エージェントだけ使う？', agent: 'エージェントを設定' }
	},

	logos: {
		title: { text: '{count}が、すでに WebMCP に対応', count: { other: '{n} 以上のサイト' } },
		lead: 'ロゴをクリックすると、そのサイトをその場でスキャンします。',
		scan: '{site}：このサイトをスキャン',
		note: '件数は {directory}に掲載中の稼働サイト（{date}）。より厳格な {knownGood}では、ページを実際に実行して {n} サイトがツールを登録することを確認しています（{verifiedDate}）。ロゴは {checked} にスキャナーで確認済み。各ロゴの権利は所有者に帰属し、当プロジェクトとの提携関係はありません。',
		directory: 'webmcp.com のディレクトリ',
		knownGood: 'Known Good インデックス'
	},

	sources: {
		title: '出典',
		draft: 'WebMCP ドラフト',
		explainer: 'WebMCP Explainer',
		ours: '当プロジェクトのベンチマーク',
		snapshotCost: 'スナップショットのコスト（実測）',
		shopifyCheckout: 'Shopify のチェックアウト',
		mcpSpec: 'MCP 仕様',
		shopifyBoth: 'Shopify は両方を採用'
	},

	what: {
		kicker: 'WebMCP とは',
		title: 'WebMCP は AI エージェントのための Web 標準になりつつある。私たちは全力で賭ける',
		lead: 'Google と Microsoft のエンジニアが、Web 標準を策定する団体である W3C でドラフトを書いており、Chrome と Edge ではすでにテストが始まっています。今、Claude Code や Codex をはじめとするあらゆるエージェントは、あなたのサイトをスクリーンショットのように扱っています。眺めて、押すべきボタンを推測し、また試す。遅く、コストがかかり、壊れやすい。WebMCP があれば、サイトが「検索」「読み取り」「カートに追加」など、できることをエージェントに正確に伝え、エージェントはそれを頼むだけです。私たちは、すべてのサイトが WebMCP を話すようになると信じています。だから、あなたのサイトが今日からそうできるよう webmcpx を作りました。',
		sources: {
			mind2web: 'Online-Mind2Web：エージェントは実サイトのタスクの約 4 割で失敗',
			snapshot: 'ページのスナップショット 1 回で 12k〜77k トークン',
			windtunnel: 'WindTunnel：ツールとクリック操作の所要時間を比較',
			draft: 'WebMCP ドラフト、W3C Web Machine Learning CG（エディターは Google と Microsoft）',
			status: '実装状況（Chrome と Edge のオリジントライアル）',
			chromeTrial: 'Chrome：WebMCP オリジントライアル',
			chromeStatus: 'Chrome Platform Status',
			edgeTrial: 'Microsoft Edge：WebMCP オリジントライアル',
			edgeExplainer: 'Microsoft Edge の Explainer',
			method: '当プロジェクトのベンチマーク手法'
		},
		steps: {
			register: {
				title: 'ページがツールを登録',
				text: '名前、説明、入力スキーマ、そして関数。ボタンがすでに実行しているアクションそのものです。'
			},
			list: {
				title: 'ブラウザーが一覧にする',
				text: 'エージェントはブラウザに、そのページで何ができるかを尋ねます。入力は型付きで、読み取り専用などのヒントも付きます。'
			},
			call: {
				title: 'エージェントが呼び出す',
				text: 'ユーザー自身のタブで、そのセッションのまま動きます。新しいサーバーも OAuth も不要です。'
			}
		},
		webmcpx: {
			// Who we are and why webmcpx exists, right under the logo (facts only: see the footer notices).
			about:
				'W3C やブラウザベンダーとは無関係の、独立したオープンソースのコミュニティプロジェクトです。webmcpx は、WebMCP を今日から役立つものにするために作っています。サイトは自分で書かずに良いツールを持て、エージェントは少ないトークンで同じ答えにたどり着き、公開する数値はすべて再現できます。',
			title: '今日から webmcpx を、サイトにもエージェントにも',
			lead: '今日、WebMCP がほとんどのサイトに載らない理由を、まとめて解決。サイトに 1 行、エージェントにコマンドを 1 つ。ほかに気にすることはありません。',
			compare: {
				caption: '手書きの WebMCP と webmcpx の比較',
				hand: '手書きの WebMCP',
				webmcpx: 'webmcpx なら'
			},
			items: {
				support: {
					label: 'ブラウザー対応',
					hand: 'Chrome と Edge のみ、それもフラグかオリジントライアル経由。Firefox と Safari はまだ未対応。',
					webmcpx:
						'WebMCP がない環境では W3C 公式のポリフィルを読み込むので、Chrome、Firefox、Safari で今日からツールが使えます。'
				},
				tools: {
					label: '全ページにツール',
					hand: 'ページごとに、1 つずつ設計して書く。',
					webmcpx: 'script タグ 1 つで、全ページに検索・読み取り・ページコンテキストのツール。コード不要。'
				},
				actions: {
					label: '独自のアクション',
					hand: 'スキーマ、アノテーション、エラー処理を 1 つずつ手書き。',
					webmcpx: 'tool() の呼び出し 1 回、React・Vue・Svelte 用のフック、または既存のフォームで。'
				},
				agents: {
					label: 'Claude Code、Codex、Cursor から',
					hand: 'ブリッジを自作するか、各エージェントの対応を待つ。',
					webmcpx: 'npx webmcpx mcp：各ページのツールに加え、webmcpx のないサイトでも標準ツールが使えます。'
				},
				draft: {
					label: '仕様の変更',
					hand: 'ドラフトの変更をすべて追い、ツールを書き直す。',
					webmcpx: 'W3C のドラフトを追いかけて追従します。あなたはパッケージを 1 つ更新するだけ。'
				},
				correct: {
					label: '正しく作る',
					hand: '結果の形式、エラーコード、出力の上限、ページング、アノテーション。すべて自分で正しく。',
					webmcpx:
						'最初から正しく。統一された結果の形式、エージェントが対処できるエラーコード、出力の上限、ページング、正しいアノテーション。'
				},
				safe: {
					label: 'エージェントにも安全',
					hand: 'ツールの説明やページのテキストに潜む隠し指示や不可視文字。見落としやすく、悪用されやすい。',
					webmcpx:
						'標準ツールは読み取りのみ。隠しテキストは含めず、不可視文字は除去し、ツール内の隠し指示はリンターが検出します。'
				},
				testing: {
					label: 'テスト',
					hand: 'Chrome のフラグを有効にし、DevTools を開いて祈る。',
					webmcpx:
						'npx webmcpx tools localhost:3000 で、どのブラウザーでもフラグなしでツールを一覧表示。スキャナーは公開中のどの URL でもチェックできます。'
				},
				proof: {
					label: '効果の裏付け',
					hand: '勘に頼るだけ。',
					webmcpx:
						'WebMCP とページを読む方式を比べた公開ベンチマーク：同じ答えでトークンを最大 {best} 削減（最良ケース：{site}、{model}）。コマンド 1 つで再実行できます。',
					webmcpxPlain: '質問も実行もすべて公開しています。コマンド 1 つで再実行できます。'
				},
				cost: {
					label: 'コスト',
					hand: 'ページごと、変更のたびにかかるあなたの時間。',
					webmcpx: '無料のオープンソース（MIT）。読み込み時は約 2.7 KB、アカウントもサーバーも不要。'
				}
			},
			sites: 'サイトに導入する',
			agents: 'エージェントに導入する'
		}
	},
	why: {
		kicker: 'なぜ WebMCP なのか',
		title: 'WebMCPでサイトが得るもの',
		lead: 'WebMCP を使うと、ページは型付きのツールを AI エージェントに渡せます。ツールはユーザー自身のタブの中で動きます。何が変わるのか、根拠の強い順に紹介します。',
		today: '現状',
		with: 'WebMCP なら',
		reasons: {
			finish: {
				title: '最後までやり切るエージェント',
				pain: '実際のサイトでは、テストした中で最も優秀なエージェントでもタスクの約 4 割に失敗しました。多くはフィルター、並べ替え、ナビゲーションでのつまずきです。',
				gain: 'どのボタンが何をするのかを推測する代わりに、型付きの入力でツールを呼び出します。'
			},
			tokens: {
				title: 'トークンは数分の一に',
				pain: 'ページのスナップショットは 1 回で 12,000〜77,000 トークンになることもあり、エージェントはそれを毎ステップ送り直します。',
				gain: '呼び出しが返すのは、要求したデータだけです。当プロジェクトのベンチマークでは、{bestSite} でトークン数が最大 {best} 少なくなりました（最良のケース）。'
			},
			speed: {
				title: '数分ではなく、数秒で',
				pain: '見て、考えて、クリックして、また繰り返す。難しい実サイトのタスクでは、エージェントの実行が最長 44 分に及びました。',
				gain: '1 回の呼び出しが、一連のクリックを置き換えます。WindTunnel のベンチマークでは、中央値で 3.4 倍高速でした。'
			},
			backend: {
				title: '新しいサーバーも OAuth も不要',
				pain: 'エージェントに API を提供するとなると、通常は別のバックエンド、二重に管理する状態、認証フローが必要になります。',
				gain: 'ツールはフロントエンドのコードそのもので、ユーザーがすでに持っているセッションで動きます。Shopify もこの方式で提供しています。'
			},
			loop: {
				title: 'ユーザーを置き去りにしない',
				pain: 'エージェントはユーザーの見えないところで動くか、ユーザーを別の場所へ移動させます。',
				gain: 'エージェントはユーザーが見ているページの上で動きます。確認が必要な操作は、ツール側で明示できます。'
			},
			state: {
				title: '同じカート、同じフォーム',
				pain: 'バックエンドの API からは、ユーザーのタブで開いているカートやフォーム、選択状態が見えません。',
				gain: 'ツールはユーザーが見ている状態に対して動くので、エージェントの操作に合わせてページも更新されます。'
			},
			control: {
				title: 'できることは、あなたが決める',
				pain: 'ページを読むエージェントは、ユーザーがクリックできるものなら何でもクリックできます。',
				gain: '公開するのは、あなたが選んだアクションとその入力、そして独自のバリデーションです。'
			},
			small: {
				title: '導入は小さく、無視しても安全',
				pain: 'エージェント対応と聞くと、大きなプロジェクトに思えます。',
				gain: '必要なのは、いくつかのツール登録だけです。WebMCP 非対応のブラウザーはそれを無視し、ヘッダー 1 つで無効にもできます。'
			}
		},
		status:
			'WebMCP は W3C Community Group のドラフト（2026 年 11 月 2 日）であり、W3C 標準ではありません。ChatGPT デスクトップアプリのブラウザーと Codex は、サイトの WebMCP ツールを呼び出せます。Chrome ではフラグかオリジントライアルで動作します。アノテーションはサイトが宣言するヒントであり、保証ではありません。',
		also: 'ほかにも：'
	},

	proof: {
		kicker: 'リーダーボード',
		title: 'WebMCPでどれだけ節約できるか、モデル別に',
		lead: '一方のエージェントはページのスナップショットを見ながら読み、クリックし、入力します。もう一方はサイトの WebMCP ツールを呼び出します。モデルを選んでください。削減効果の大きい順に並んでいます。',
		byModel: 'モデル別のベンチマーク',
		models: 'モデル',
		model: 'モデル',
		site: 'サイト',
		rank: '{n} 位',
		ranking: 'WebMCP での成功率、同率なら 1 回あたりのコストで順位付け。',
		modelHeading: '{name}（{provider}）',
		empty: {
			title: '公開済みの実行結果はまだありません',
			text: '{command} を実行すると、ここに表示されます。'
		},
		selected: {
			other:
				'抜粋したケース：全 {total} 問中 {shown} 問。WebMCP のトークン使用量が半分以下だった質問です。{results}を公開しているほか、{command} で自分で実行することもできます。'
		},
		results: 'すべての結果',
		none: {
			title: '{model} では、基準を満たす質問はありませんでした',
			text: 'すべての質問と両条件の結果は、上の全結果に掲載しています。'
		},
		local: 'テスト',
		arms: { baseline: 'WebMCP なし', webmcp: 'WebMCP あり' },
		tokens: 'トークン',
		stats: '{time} · {steps} ステップ · 1 タスクあたり {cost}',
		na: '記録なし',
		solved: '成功 {n}',
		failed: '失敗 {n}',
		fewerTokens: 'トークン削減',
		moreTokens: 'トークン増加',
		open: '開く',
		opens: '（{site} を開きます）',
		rotator: {
			label: '質問',
			role: 'カルーセル'
		},
		details: '{site} の詳細',
		tabs: {
			tokens: 'トークン',
			duration_ms: '時間',
			steps: 'ステップ',
			cost_usd: 'コスト',
			tools: 'ツール',
			method: '手法'
		},
		metrics: {
			tokens: { label: 'トークン', unit: '実行 1 回あたりのトークン数', column: 'トークン' },
			duration_ms: { label: '時間', unit: '実行 1 回あたりの秒数', column: '時間' },
			steps: { label: 'ステップ', unit: '実行 1 回あたりのモデルのターン数', column: 'ステップ' },
			cost_usd: { label: 'コスト', unit: '1 タスクあたりの USD', column: 'コスト' }
		},
		chart: {
			question: '質問',
			solved: '成功',
			head: '{metric} · {unit}',
			better: '短いほど良い',
			caption: '質問ごとの{metric}（{unit}）。低いほど良好です。条件ごとの成功率も掲載しています。',
			armMetric: '{arm}：{metric}',
			armSolved: '{arm}：成功',
			row: '{site}：{question}',
			localSite: '{site}（ローカルのテストサイト）'
		},
		method: {
			setup: {
				other:
					'{model}、推論レベル {effort}、ヘッドレス Chrome。両条件で同じプロンプトとステップ上限を使い、質問と条件ごとに {n} 回実行しています。'
			},
			setupNoEffort: {
				other:
					'{model}、ヘッドレス Chrome。両条件で同じプロンプトとステップ上限を使い、質問と条件ごとに {n} 回実行しています。'
			},
			baseline: 'WebMCP なし：DOM スナップショットを読み、クリックし、入力するエージェント。',
			webmcp:
				'WebMCP あり：ページが登録したツールだけを使用（サイト独自のもの、またはテスト用サイトでは webmcpx のもの）。',
			graded: '回答に含まれる事実とページの状態で採点します。LLM ジャッジは使いません。',
			live: '実サイト：独自の WebMCP ツールを提供しています。',
			local: 'ローカルのテストサイト：ツールは webmcpx が提供しています。',
			scope: '6 サイトで 30 問、うち 27 問は読み取りのみ。最大の削減はサイト自身の検索ツールによるもの。',
			runs: '質問とアームごとに 3 回実行。3/3 は根拠であって 100% の証明ではない。',
			measures:
				'時間はページ読み込み後のエージェントループ。コストは日付付き定価でのモデルの API 使用量 (キャッシュ込み)。',
			failures: '失敗した実行には結果に理由が記録される (ボット確認、ページ外の回答、ステップ上限など)。',
			reproduce: '再現手順'
		},
		tools: {
			label: '{site} の WebMCP ツール',
			title: { other: '{site} が登録している WebMCP ツール（{n} 個）' },
			fromRun: 'エージェントが受け取った内容 · {date}',
			fromSnapshot: '説明は {date} 時点の登録内容 · 計測は {runDate}',
			tool: 'ツール',
			description: '説明',
			called: '呼び出し',
			notCalled: '呼び出しなし',
			missing: '（スナップショット取得時には未登録）'
		}
	},

	versus: {
		kicker: 'WebMCP と MCP',
		title: 'WebMCPとMCPの違い、そして両方が必要な理由',
		lead: 'WebMCP は MCP のツールモデルを借りていますが、MCP プロトコルではなくブラウザー API です。両者は補い合う関係にあります。',
		caption: 'WebMCP と MCP の比較',
		aspect: '項目',
		rows: {
			where: {
				label: 'ツールの実行場所',
				webmcp: 'ページの JavaScript 内。ユーザーのタブの中で動きます。',
				mcp: 'サーバープロセス内。ローカル（stdio）またはリモート。'
			},
			call: {
				label: '呼び出し方',
				webmcp:
					'ブラウザー API の document.modelContext。各呼び出しはブラウザーが仲介します。JSON-RPC は使いません。',
				mcp: 'stdio または Streamable HTTP 上の JSON-RPC 2.0。'
			},
			run: {
				label: '運用するもの',
				webmcp: '既存のフロントエンド。新しいサーバーは不要です。',
				mcp: '自分でホストし運用する MCP サーバー。'
			},
			auth: {
				label: '認証',
				webmcp: 'ユーザーがすでにサインインしているセッション。トークンを発行する必要はありません。',
				mcp: 'リモートサーバー向けの OAuth ベースの認可。'
			},
			discovery: {
				label: 'ディスカバリー',
				webmcp: 'ページを開いた時点で見つかります。訪問前に探すものはありません。',
				mcp: '既知のエンドポイントへの tools/list と、公開レジストリ。'
			},
			lifetime: {
				label: '有効期間',
				webmcp: 'ページを開いている間だけ。',
				mcp: '常時稼働。ブラウザーは不要です。'
			},
			user: {
				label: 'ユーザー',
				webmcp: 'エージェントと同じページにいます。',
				mcp: 'いなくても構いません。ヘッドレスで動作します。'
			},
			covers: {
				label: '対象範囲',
				webmcp: 'ツールのみ。入力・出力スキーマ付き。',
				mcp: 'ツール、リソース、プロンプト。加えて elicitation と拡張機能。'
			},
			hints: {
				label: 'ツールのヒント',
				webmcp: 'readOnlyHint、consequentialHint、untrustedContentHint。デフォルトで同一オリジン。',
				mcp: 'readOnlyHint、destructiveHint、idempotentHint、openWorldHint。'
			},
			status: {
				label: 'ステータス',
				webmcp:
					'W3C Community Group のドラフト。ChatGPT デスクトップと Codex が呼び出せます。Chrome はオリジントライアル。',
				mcp: 'Linux Foundation のプロジェクト。公開サーバーは 10,000 以上。'
			}
		},
		useBoth: '両方を使う',
		verdict:
			'MCP は、あなたのサイトを開かないエージェントのためのもの。WebMCP は、ユーザーのそばで、そのタブの中で働くエージェントのためのものです。1 つのバックエンドで両方を動かせます。Shopify はすでにそうしています。'
	},

	fix: {
		title: 'あなたのサイトに',
		lead: 'AI エージェントは、すでにあなたのページを読んでいます。2 つのステップで本物のツールを渡しましょう。コーディングエージェント（Claude Code、Codex、Cursor）に頼むか、手で追加します。',
		alternatives: { npm: 'npm を使う場合', agent: 'エージェント' },
		facts: '読込時 ~2.7 KB · Rust + WebAssembly · MIT License',
		html: '{tag} の前に貼るだけ。WebMCP のないブラウザには W3C のポリフィルを追加します。',
		standard: { title: '標準ツール：1 行', lead: '全ページで検索・読み取り・ページ情報。コード不要。' }
	},

	agents: {
		title: 'あなたのエージェントに',
		lead: 'エージェントは、いちばんコストのかかる方法でページを読んでいます。代わりにページのツールを渡しましょう。計測したサイトでは、同じ回答をわずかなトークンで得られました。どのサイトでも動作し、すべての Claude Code と Codex の環境に入れるべき MCP です。',
		saving: {
			range: { other: 'リーダーボードの全 {n} モデルで、トークンを {low}〜{high} 削減。' },
			best: 'リーダーボードで、トークンを最大 {high} 削減。',
			losses: {
				other: '全問を集計。各モデル {total} 問中 {worse} 問では、WebMCP の方がトークンを多く使いました。'
			}
		},
		prompt: 'プロンプトはひとつ。エージェントが自分でセットアップし、webmcpx.dev で動作を確かめます。',
		ways: {
			mcp: {
				label: 'MCP 対応エージェント',
				text: 'Claude Code、Codex、Cursor：{cmd} を追加。専用の Chromium でページを開くので、フラグは不要です。'
			},
			browser: {
				label: 'ブラウザを自分で操作するエージェント',
				text: 'Playwright、Selenium、Puppeteer、browser-use、CDP。Chrome、Firefox、Safari：ページ内で {api} を呼ぶだけ。webmcpx を入れたサイトならどこでも使えます。'
			}
		},
		hype: {
			up: '最大',
			fewer: 'トークン削減',
			same: '答えは同じ。',
			bestCase: '最良ケース：{site}、{model}'
		},
		worksWith: 'あらゆるエージェントとブラウザで動作',
		note: '1 つのプロンプトで、エージェントが自分で設定し、どこでも WebMCP を先に使い、webmcpx.dev で確認します。'
	},

	own: {
		title: 'サイト独自のアクション',
		lead: 'カートに追加、予約、カタログ検索：ボタンがすでに呼んでいる関数を、エージェントが直接呼べるツールに。',
		notes: {
			agent:
				'エージェントが webmcpx の仕組みを読み、プロジェクトの中から公開する価値のある操作を見つけ、どれを追加するか確認したうえで追加・検証します。',
			form: 'JavaScript 不要：WebMCP の宣言的 API です。ブラウザーが未対応なら、スクリプトタグが補います。',
			js: 'npm から、またはスクリプトタグと同じ CDN からインポート。',
			hook: 'コンポーネントがマウントされている間だけ登録され、外れると消えます。'
		}
	},

	verdicts: {
		title: 'スキャナーの判定基準',
		lead: '判定は 3 つ、ルールは公開。おかしいと思ったら教えてください。そのフィードバックで良くなります。',
		// {rules} is a list of lint rule names (code).
		items: {
			ready:
				'ページが WebMCP ツールを 1 つ以上登録し、リンターがエラーを見つけず、エージェント対応スコアが 70 以上の状態です。名前が長いといった警告は妨げになりません。',
			issues:
				'ツールは登録されていますが、少なくとも 1 つにリンターエラーがある（{rules}、またはサイズが上限を超えている）か、スコアが 70 未満です。',
			missing:
				'WebMCP ツールが 1 つも登録されていません。代わりにページを読む場合、エージェントが使うトークン数を表示します。'
		},
		how: {
			title: 'スキャンの流れ',
			steps: [
				'当社のサーバー上のヘッドレス Chrome で、Cookie もログインもなしにページを開きます。',
				'ページのスクリプトが動く前に WebMCP ホストを追加し、エージェントのブラウザーと同じようにツールを登録させます。古い navigator.modelContext と provideContext も受け付けるので、それらで作られたサイトのツールも表示されます。',
				'ページが読み込まれ、ツールが出そろったら、各ツールの名前・説明・入力スキーマ・アノテーションを読み取り、リンターにかけます。',
				'トークン数はページのテキストから見積もります：文字数を 4 で割った値です。',
				'スコアのために、同じブラウザーがサイトの robots.txt、llms.txt、サイトマップ、Markdown 版、Link ヘッダー、Agent Skills インデックス、API カタログを取得し（各 3 s、同一オリジン、Cookie なし）、それぞれが存在するかどうかだけを記録します。',
				'スコアは 100 点満点：WebMCP 50（ツール 25、lint エラーなし 15、全ツールに説明 5、全ツールにアノテーション 5）、エージェントのコスト 15（ツールがあれば満点、なければページのトークン数で決定）、読みやすさ 20、見つけやすさ 15（チェックごとに 5）。',
				'結果は 10 分間再利用され、新しいスキャンは 1 人 1 分に 1 回までです。'
			]
		},
		rules: 'リンターの全ルールと理由',
		disagree: '判定がおかしいと思ったら：{link}',
		disagreeLink: 'スキャンのリンクを添えて issue を作成'
	},

	issues: {
		kicker: '仕様トラッカーから',
		title: 'webmcpxが対応済みのspecへの要望',
		items: {
			shared: {
				title: '共通ツール',
				fix: 'script タグ 1 つで、webmcpx の search_page、fetch_as_markdown、get_page_context を登録します。サイト内検索を渡せば search_site も加わります。'
			},
			errors: {
				title: '対処できるエラー',
				fix: 'webmcpx のツールは、想定内の失敗を結果として返します。安定したエラーコード、リトライ可否のフラグ、ヒント付きです。'
			},
			paging: {
				title: 'ページング対応の結果',
				fix: 'webmcpx のツールはすべて同じ結果の形式を使い、出力の上限と、truncated + next_cursor によるページングを備えています。'
			},
			frozen: {
				title: '凍結された modelContext',
				fix: 'webmcpx は registerTool() を呼ぶだけで、代入はしません。凍結された modelContext に対してテスト済みです。'
			},
			hidden: {
				title: '隠された指示',
				fix: '実行時にページのテキストから除去します。ソースではリンターが検出し、--fix で削除します。'
			},
			length: {
				title: '長さの制限',
				fix: 'webmcpx lint は名前のルールを検査し、Chrome のガイダンスを超える説明を指摘します。'
			},
			budget: {
				title: 'ツール数の上限',
				fix: 'webmcpx lint は、1 ページあたり 20 ツールを超えると警告、100 を超えるとエラーにします（ドラフトではなく当プロジェクトの方針です）。'
			}
		}
	},

	faq: {
		kicker: 'FAQ',
		title: 'WebMCP のよくある質問',
		items: {
			what: {
				q: 'WebMCP とは？',
				a: 'W3C の Web Machine Learning Community Group で策定中のブラウザ API です。ページが document.modelContext.registerTool() でツールを登録し、AI エージェントはスクリーンショットやページの HTML を読む代わりに、そのツールを呼び出します。ツールはユーザー自身のタブで動作します。'
			},
			site: {
				q: 'サイトをエージェント対応にするには？',
				a: 'webmcpx の script タグを追加するだけで、すべてのページに標準ツール（検索、読み取り、ページのコンテキスト）が入ります。ほかのコードは不要です。そのうえで、検索やカートへの追加といった独自のアクションを tool() で登録しましょう。確認は、ここでサイトをスキャンするだけです。'
			},
			agent: {
				q: 'Claude Code や Codex から WebMCP を使うには？',
				a: 'claude mcp add webmcpx -- npx -y webmcpx mcp を実行します（Codex なら codex mcp add webmcpx -- npx -y webmcpx mcp）。以後エージェントは自前の Chromium でページを開き、どのサイトでも各ページの WebMCP ツールと標準ツールを使えます。'
			},
			browsers: {
				q: 'Firefox や Safari でも動きますか？',
				a: 'はい。ブラウザ自体に WebMCP がない場合は、webmcpx が HTTPS ページで W3C の WebMCP ポリフィルを読み込みます。Chrome、Firefox、Safari のどれでも同じツールが見えます。'
			},
			standard: {
				q: 'WebMCP は W3C 標準？',
				a: 'まだです。W3C の Web Machine Learning Community Group のドラフト（2026 年 11 月 2 日）です。Chrome と Edge はオリジントライアルで提供し、Mozilla は中立、WebKit は異議を唱えています。webmcpx はドラフトに追従し、W3C のポリフィルを読み込むので、ツールは今すぐ動き、仕様の変更にもついていきます。'
			},
			safe: {
				q: 'エージェントにサイトのツールを呼ばせても安全？',
				a: 'ツールはユーザー自身のタブで、ユーザー自身の権限のもとで動き、ページがもともとできないことは何もできません。webmcpx の標準ツールはページに表示されている内容を読むだけで、不可視文字は除去されます。何かを変更する独自ツールに consequentialHint を付ければ、エージェントは先にユーザーに確認できます。ツールの説明に隠された指示は、リンターで検出しましょう。'
			},
			mcp: {
				q: 'WebMCP と MCP は同じもの？',
				a: 'いいえ。WebMCP は MCP のツールモデルを借りていますが、MCP プロトコルではなくブラウザ API です。ツールはページの中にあり、ユーザーのタブで動作します。両者は補い合う関係で、webmcpx の MCP サーバーがその 2 つをつなぎます。'
			}
		}
	},

	scan: {
		form: 'サイトをスキャン',
		address: 'サイトのアドレス',
		placeholder: 'yoursite.jp',
		submit: 'サイトをスキャン',
		scanning: 'スキャン中…',
		steps: [
			'ページを開いています…',
			'WebMCP ツールを探しています…',
			'エージェントの目で読んでいます…',
			'ツールを lint しています…'
		],
		verdicts: { ready: 'エージェント対応', issues: 'あと少し', missing: '未対応' },
		failed: 'スキャンできませんでした。',
		result: {
			missing:
				'WebMCP ツールがありません。エージェントはこのページの約 {tokens}を読み、推測するしかありません。',
			tokens: { other: '{n} トークン' },
			issues: {
				other: '{tools}が見つかりましたが、エージェントがつまずく lint エラーが {n} 件あります。'
			},
			toolCount: { other: '{n} 個のツール' },
			basics: '{tools}があり lint エラーもありませんが、エージェント向けの基本がいくつか足りません。',
			cache: {
				label: 'キャッシュされた結果です。',
				expires: '残り {time} で期限切れになります。',
				expired: 'このキャッシュされた結果は期限切れです。',
				rescan: 'もう一度スキャン'
			},
			score: {
				title: 'エージェント対応スコア',
				of: '{score}/100',
				need: '{min} 以上で、WebMCP ツールがあり lint エラーがなければエージェント対応です。',
				groups: {
					webmcp: 'WebMCP',
					cost: 'エージェントのコスト',
					readable: '読みやすさ',
					discoverable: '見つけやすさ'
				},
				items: {
					tools: {
						label: 'WebMCP ツール',
						fix: 'script タグを 1 つ追加すれば、全ページに検索・読み取り・ページコンテキストが入ります。'
					},
					lint: {
						label: 'lint エラーなし',
						fix: '下の指摘を修正してください（npx webmcpx lint でソースから見つけられます）。'
					},
					descriptions: {
						label: '全ツールに説明',
						fix: '各ツールに、エージェントが行動に移せる説明を付けてください。'
					},
					annotations: {
						label: '全ツールにアノテーション',
						fix: '各ツールに readOnlyHint を、何かを変更するなら consequentialHint を付けてください。'
					},
					cost: {
						label: 'エージェントに低コスト',
						fix: 'エージェントはページ全体を読みます。ツールがあれば必要なものだけを頼めます。',
						read: 'このページを読むのに約 {tokens}。',
						tools: 'エージェントはページを読む代わりにツールを呼び出します。'
					},
					llms_txt: {
						label: 'llms.txt',
						fix: '/llms.txt を公開し、サイトの概要と、エージェントが残りを見つける場所を示してください。'
					},
					markdown: {
						label: 'Markdown 版',
						fix: 'ページを Markdown で返す（Accept: text/markdown）か、rel="alternate" で Markdown 版にリンクしてください。'
					},
					robots: {
						label: 'AI エージェントに開放',
						fix: 'robots.txt が AI エージェントを締め出しています（Disallow: /）。'
					},
					sitemap: {
						label: 'サイトマップ',
						fix: '/sitemap.xml を公開するか、robots.txt に Sitemap: 行を追加してください。'
					},
					link_headers: {
						label: 'Link ヘッダー',
						fix: 'llms.txt やドキュメントへ導く Link レスポンスヘッダーを追加してください（RFC 8288）。'
					},
					agent_skills: {
						label: 'Agent Skills インデックス',
						fix: '/.well-known/agent-skills/index.json を公開してください。'
					},
					api_catalog: {
						label: 'API カタログ',
						fix: 'API を /.well-known/api-catalog に掲載してください（RFC 9727）。'
					}
				}
			},
			ready: {
				other: 'エージェントが直接呼び出せるツールが {n} 個あります。いいですね。'
			},
			readySelf: {
				other: 'エージェントが直接呼び出せるツールが {n} 個あります。紺屋の白袴では示しがつきません。'
			},
			tools: '検出されたツール',
			more: 'ほか {n} 件',
			findings: 'lint の指摘事項',
			fix: '修正する',
			lint: 'ソース内の問題をすべて洗い出し、修正案も示します：',
			terminal: 'ターミナル',
			badge: '対応済みであることを示しましょう。バッジを選んで、サイトに貼り付けてください：',
			badgeNote:
				'SVG はコードに直接埋め込まれるので、こちらからは何も読み込みません。リンク先はそのサイトのライブスキャンなので、誰でも確認できます。',
			badgeStyle: 'バッジのスタイル',
			badgeTitle: 'エージェント対応：webmcpx でライブ確認',
			share: '結果を共有',
			shared: 'リンクをコピー済み'
		},
		badges: {
			card: { name: 'カード', fits: '明るいページ' },
			flat: { name: 'フラット', fits: 'フッター' },
			readme: { name: 'README', fits: 'GitHub や npm' },
			dark: { name: 'ダーク', fits: '暗いページ' }
		},
		errors: {
			invalid: 'notion.com や https://example.com/docs のように、サイトを入力してください。',
			offline: 'スキャナーがオフラインです。`just serve` でローカルで実行できます。',
			noScanner: 'このコピーのサイトにはスキャナーがありません。`just serve` でローカルで実行してください。',
			busy: 'スキャナーが混み合っています。{s} 秒後にもう一度お試しください。',
			busyLater: 'スキャナーが混み合っています。1 分ほどしてから、もう一度お試しください。',
			running: '前回のスキャンがまだ実行中です。終わってから、もう一度スキャンしてください。',
			timeout: 'ページの応答に時間がかかりすぎました。',
			badAddress: 'このアドレスはスキャンできません。',
			unreadable: 'ページを読み取れませんでした。',
			withDetail: '{lead}（{detail}）',
			other: 'スキャンに失敗しました（{status}）。'
		}
	},

	brand: {
		kicker: 'ブランド · デザインシステム',
		title: '紙と、インクと、ジャンクション',
		lead: 'ページはツールを宣言し、ブラウザーがその間に立ちます。ページとエージェントは、どちらかが相手に取って代わることなく出会います。ロゴマークが描くのは、その出会いです。以下はすべて、実際にリリースしているコードからレンダリングしています。',
		name: {
			kicker: '01 · 名前',
			title: 'webmcpx は、常に小文字',
			rules: [
				'常に小文字で webmcpx と書きます。文頭でも同じです（気になる場合は文を書き換えてください）。',
				'コードやコマンドの中では Geist Mono で組みます。',
				'WebMCP はブラウザー API の名前で、ドラフトの表記どおりに書きます。',
				'webmcpx は WebMCP そのものではなく、WebMCP という名前を名乗ることもありません。'
			]
		},
		logo: {
			kicker: '02 · ロゴ',
			title: '3 つのマーク、1 つのアイデア',
			lead: 'できる限りジャンクションを使います。カードはバッジとアプリアイコン用（32px 以上）、スロット付きページは代替マークです。',
			marks: {
				junction: { name: 'ジャンクション', role: 'プライマリーマーク' },
				card: { name: 'カード', role: 'バッジとアプリアイコン（32px 以上）' },
				'page-slot': { name: 'スロット付きページ', role: '代替マーク' }
			},
			assets: {
				mark: { label: 'マーク', use: '単色（currentColor）。ドキュメント、README、スライドに。' },
				inverse: { label: '反転', use: 'インクの正方形の上に紙の色で。' },
				favicon: { label: 'ファビコン', use: '16〜32px。ライト／ダークモードに追従します。' },
				appIcon: { label: 'アイコン', use: 'カラー版。512px での書き出し用。' },
				avatar: { label: 'アバター', use: '余白 20%。円形に切り抜いても欠けません。' }
			},
			asset: '{label}{use}',
			assetLabel: '{label}：',
			download: '{mark}の{asset} SVG をダウンロード'
		},
		construction: {
			kicker: '03 · 作図',
			title: '24 ユニットのグリッド、2 ユニットの隙間',
			lead: '鏡像になった 2 つの塗りのシェブロン。腕の端は 4.5 ユニット、頂点は 2 ユニット分を平らにカットし、その間には決して閉じない 2 ユニットの隙間があります。その隙間こそがブラウザーです。',
			grid: '24 ユニットのグリッド上に描いたジャンクション',
			clearSpace: 'アイソレーション',
			clearSpaceText:
				'マークの周囲にはマークの高さの半分、ロックアップの周囲には x の高さと同じだけの余白を確保してください。',
			minSize: '最小サイズ',
			minSizeText:
				'マークを 16px まで縮小できるのは、ファビコン版だけです。ロックアップは高さ 24px 以上にしてください。'
		},
		color: {
			kicker: '04 · カラー',
			title: '紙とインク、蛍光ペンをひとつ',
			lead: '値は tokens.css から読み込んでいます。アートワークは閲覧者のテーマではなく、配置先の背景に合わせて選んでください。',
			uses: {
				paper: 'ページの背景',
				'paper-2': 'くぼんだパネル、トラック',
				card: '紙の上のカードと入力欄',
				ink: 'テキスト、輪郭線、影、プライマリーボタン',
				'ink-2': '補助テキスト',
				'ink-3': 'キャプションとラベル',
				hairline: '細い区切り線',
				marker: '蛍光ペン：唯一のアクセント',
				good: '対応済み・合格（文字）',
				'good-soft': '対応済み・合格（塗り）',
				bad: '未対応・失敗（文字）',
				'bad-soft': '未対応・失敗（塗り）',
				code: 'コードブロックの背景',
				'on-code': 'コードブロック上の文字'
			},
			pairs: '使用できる文字と背景の組み合わせ',
			pairsNote: 'WCAG 2.2 AA は本文に 4.5:1 を求めています。テストでこれを強制しています。',
			pairsText: '背景の上の文字',
			pairsContrast: 'コントラスト',
			pair: '{bg} の上に {text}',
			yellow: '黄色は地に使い、図には使わない',
			yellowText:
				'紙の上の蛍光イエローは {ratio} しかなく、形や文字を担えません。{word}、チップ、アプリアイコンのように、インクの背後に敷いて使ってください。',
			yellowWord: 'ハイライトした語'
		},
		type: {
			kicker: '05 · 書体',
			title: 'Bricolage, Geist, Geist Mono',
			styles: {
				giant: { name: 'Bricolage Grotesque · 特大', sample: 'エージェント対応' },
				headline: { name: 'Bricolage Grotesque · 見出し', sample: '同じエージェント。同じ質問。' },
				body: { name: 'Geist · 本文', sample: '検証できる短い文。1 文に 1 つの考え。' },
				mono: { name: 'Geist Mono · コードとラベル', sample: 'document.modelContext.registerTool()' }
			}
		},
		components: {
			kicker: '06 · コンポーネント',
			title: '2px の輪郭線、硬い影',
			lead: 'src/lib/components/ui。バリアントは tailwind-variants のレシピで、形は同じデザイントークンから作られます。',
			buttons: 'Button · バリアント × サイズ',
			stamps: 'Stamp · トーン',
			card: 'Card',
			interactive: 'インタラクティブな Card（ホバー）',
			empty: '空の状態',
			tabs: 'Tabs',
			tabsLabel: '例',
			tabsItems: { one: '1 つ目', two: '2 つ目' },
			tabsPanel: '{label}のパネル。矢印キーで操作できます。',
			codeBlock: 'CodeBlock（ビルド時にハイライト）'
		},
		misuse: {
			kicker: '07 · 禁止事項',
			title: 'やってはいけないこと',
			items: {
				stretch: '引き伸ばしたり、押しつぶしたりしない',
				rotate: '回転させない',
				outline: 'アウトラインや線を加えない',
				yellow: '黄色で描かない',
				shadow: 'マークに影や効果を加えない',
				touch: 'シェブロン間の隙間を埋めない'
			}
		},
		trademark: {
			kicker: '08 · 商標',
			title: '名前は自由に。公式を装わない',
			lead: 'コードは MIT ライセンスですが、名前とマークはこのライセンスの対象外です。ポリシーの全文は TRADEMARK.md にあります。',
			sayIt: 'このように書く',
			never: '使わない表現',
			ok: [
				'W3C Web Machine Learning Community Group の WebMCP Draft Community Group Report を実装（W3C 標準ではありません）。',
				'webmcpx で構築。webmcpx と互換。',
				'WebMCP フラグを有効にした Chrome で動作。'
			],
			no: ['公式 WebMCP ライブラリ', 'W3C WebMCP 標準', 'MCP 認定', 'Chrome 版 webmcpx'],
			voice: 'トーン',
			voiceText: '検証できる短い文。形容詞より数字。',
			wordsUse: '使う言葉',
			wordsAvoid: '避ける言葉',
			use: [
				'宣言する',
				'公開する',
				'呼び出す',
				'実測した',
				'Community Group のドラフトに追従',
				'webmcpx で動作'
			],
			avoid: ['公式', 'W3C 標準', 'W3C 準拠', 'MCP 認定', '革命的', '魔法'],
			notices: '表記',
			read: 'TRADEMARK.md を読む'
		}
	},

	benchmarkPage: {
		back: 'トップページに戻る'
	},

	ui: {
		copy: 'コピー',
		copied: 'コピー済',
		copyLabel: 'クリップボードにコピー',
		copyNamed: '{title} をコピー',
		code: '{title} のコード',
		prompt: 'プロンプト',
		terminal: 'ターミナル'
	}
};

export default ja;
