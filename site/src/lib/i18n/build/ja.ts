// 日本語：ベンチマークの質問と、エージェントに貼り付けるプロンプト（server/localize.ts を参照）。
// 和文と英数字の間は半角スペース、約物は全角（dict/ja.ts と同じ）。
import type { BuildCopy } from '#lib/server/localize.ts';

const copy: BuildCopy = {
	questions: {
		'docs-config-path': 'Orbit に別のパスから設定ファイルを読ませる環境変数はどれですか？',
		'docs-deploy-strategies': 'orbit deploy を実行するとき、どのロールアウト戦略を選べますか？',
		'docs-deploy-timeout': '`orbit deploy` のデフォルトのタイムアウトは何秒で、どのフラグで変更できますか？',
		'docs-exit-code': 'CI のステップが orbit の終了コード 4 で失敗しました。これはどういう意味ですか？',
		'docs-retained-releases': 'Orbit はロールバック用に、過去のリリースをデフォルトでいくつ保持しますか？',
		'live-cloudflare-d1-database-size':
			'Workers Paid プランを使っています。Cloudflare D1 のデータベース 1 つは最大どこまで大きくできますか？',
		'live-cloudflare-kv-key-size':
			'Cloudflare Workers KV のキーはどこまで長くできますか？キーの最大サイズを知りたいです。',
		'live-cloudflare-kv-value-size': 'Cloudflare Workers KV に保存できる値 1 つの最大サイズはいくつですか？',
		'live-cloudflare-queues-message-size':
			'Cloudflare Queue に送れるメッセージの最大サイズは？メッセージ 1 件あたりの上限が必要です。',
		'live-cloudflare-workers-free-requests':
			'Cloudflare の Workers Free プランでは、Workers は 1 日に何リクエストまで処理でき、どこで上限に達しますか？',
		'live-notion-page-size':
			'Notion API の結果をページングしています。一覧系エンドポイントで 1 回の呼び出しに指定できる page_size の最大値はいくつですか？',
		'live-notion-rate-limit-code':
			'Notion インテグレーションがリクエストを送りすぎたとき、API はレスポンスボディにどのエラーコード文字列を返しますか？',
		'live-notion-request-limit':
			'Business と Enterprise 以外のプランで、Notion API は接続ごとに 1 分あたり何リクエストまで許可していますか？',
		'live-notion-rich-text-limit':
			'API で Notion のページに長い段落を書き込んでいます。1 回のリクエストで、rich text オブジェクト 1 つのテキスト内容は最大何文字までですか？',
		'live-notion-upload-size':
			'Notion API へのシングルパートアップロードで送れるファイルの最大サイズは？それを超えるとマルチパートに切り替える必要があります。',
		'live-spec-contrast':
			'このサイトの仕様は、標準サイズの本文テキストに最低どのくらいのコントラスト比を求めていますか？',
		'live-spec-hsts': 'この仕様によると、本番環境の HSTS ヘッダーにはどの max-age を設定すべきですか？',
		'live-spec-inp': 'この仕様では、良好な応答性の目標として INP をいくつに定めていますか？',
		'live-spec-meta-description': 'この仕様によると、ページの meta description はどのくらいの長さにすべきですか？',
		'live-spec-touch-target':
			'この仕様は、ボタンなどのインタラクティブな要素に最低どのくらいのタップ領域を求めていますか？',
		'live-woo-apparel-count': 'このストアの Apparel カテゴリーには商品がいくつあり、それぞれ何ですか？',
		'live-woo-cheapest-in-stock': 'このストアで在庫のある最も安い商品は何で、いくらですか？',
		'live-woo-notebook-stock':
			'チーム用に Agent Notebooks をいくつか買いたいです。在庫はあといくつ残っていますか？',
		'live-woo-on-sale': '今このストアでセール中の商品はありますか？セール価格はいくらですか？',
		'live-woo-out-of-stock': 'このストアで在庫切れの商品はどれですか？',
		'store-cart-total':
			'Stoneware Teapot と Speckled Bowl を 1 つずつカートに入れて、カートの合計金額を教えてください。',
		'store-cheapest-blue-mug': 'いちばん安い青いマグを 2 つカートに入れてください。',
		'store-green-gift': '$30 未満で今すぐ買える緑色のギフトを探しています。何がありますか？',
		'store-priciest-teapot': '取り扱っている中でいちばん高いティーポットをカートに入れてください。',
		'store-restock-date': 'Ash Glaze Vase はいつ再入荷しますか？ストアの表記どおりの日付で教えてください。'
	},
	prompts: {
		mcp: '扱うすべての Web ページで、何かを読んだりクリックしたりする前に、まず WebMCP を使ってください。あなた自身のブラウザーでも、あなたが書く・実行するスクリプト（Playwright、Selenium、Puppeteer、browser-use、CDP）でも同じです。WebMCP にネイティブ対応している場合も例外ではありません。webmcpx でセットアップし（https://webmcpx.dev/llms.txt を読んでください）、今後のすべてのタスクに適用されるよう、このルールをエージェントの指示ファイル（AGENTS.md、CLAUDE.md など）に追加してください。最後に動作を証明してください：https://webmcpx.dev を開き、その WebMCP ツールを一覧表示して、どれか 1 つを呼び出します。',
		agent: 'webmcpx でこのサイトに WebMCP を追加してください：`npx skills add webmcpx/webmcpx -y` を実行し、その skill に従ったうえで、`npx webmcpx tools <local URL>` でツールを確認してください。',
		own: 'https://webmcpx.dev/llms.txt を読んでから、このプロジェクトを調べて、AI エージェントにとって役立つ WebMCP ツールを提案してください。どれを追加するか私に確認し、そのうえで webmcpx で追加してください。'
	}
};

export default copy;
