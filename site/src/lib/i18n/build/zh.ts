// 简体中文：基准测试的问题，以及粘贴给智能体的提示词（见 server/localize.ts）。
// 全角标点，中文与英文、数字之间留半角空格（同 dict/zh.ts）。
import type { BuildCopy } from '#lib/server/localize.ts';

const copy: BuildCopy = {
	questions: {
		'docs-config-path': '哪个环境变量能让 Orbit 从其他路径读取配置文件？',
		'docs-deploy-strategies': '运行 orbit deploy 时，可以选择哪些发布策略？',
		'docs-deploy-timeout': '`orbit deploy` 的默认超时是多少？用哪个参数修改？',
		'docs-exit-code': '我的 CI 步骤失败了，orbit 退出码是 4。这是什么意思？',
		'docs-retained-releases': '默认情况下，Orbit 会保留多少个历史版本用于回滚？',
		'live-cloudflare-d1-database-size': '我用的是 Workers Paid 套餐。单个 Cloudflare D1 数据库最大能有多大？',
		'live-cloudflare-kv-key-size': 'Cloudflare Workers KV 的键最长可以是多少？我想知道键的最大长度。',
		'live-cloudflare-kv-value-size': 'Cloudflare Workers KV 中单个值最大是多少？',
		'live-cloudflare-queues-message-size': '发送到 Cloudflare Queue 的消息最大能有多大？我需要单条消息的大小上限。',
		'live-cloudflare-workers-free-requests':
			'在 Cloudflare 的 Workers Free 套餐下，我的 Workers 每天最多能处理多少请求才会触发限制？',
		'live-notion-page-size':
			'我在分页读取 Notion API 的结果。列表类接口每次调用最多能请求多大的 page_size？',
		'live-notion-rate-limit-code': '我的 Notion 集成发送请求过多时，API 会在响应体里返回哪个错误码字符串？',
		'live-notion-request-limit':
			'在 Business 和 Enterprise 以外的套餐中，Notion API 每个连接每分钟允许多少个请求？',
		'live-notion-rich-text-limit':
			'我在通过 API 往 Notion 页面写长段落。一次请求中，单个 rich text 对象的文本内容最多能有多少个字符？',
		'live-notion-upload-size':
			'用单段上传发送到 Notion API 的文件最大能有多大？超过多少就必须改用分段上传？',
		'live-spec-contrast': '这个网站的规范要求正常字号的正文文本最低对比度是多少？',
		'live-spec-hsts': '按照这份规范，生产环境的 HSTS 响应头应该设置多大的 max-age？',
		'live-spec-inp': '这份规范把良好响应性的 INP 目标值定为多少？',
		'live-spec-meta-description': '按照这份规范，页面的 meta description 应该多长？',
		'live-spec-touch-target': '这份规范要求按钮和其他交互控件的最小点击区域是多大？',
		'live-woo-apparel-count': '这家店的 Apparel 分类里有多少件商品？分别是哪些？',
		'live-woo-cheapest-in-stock': '这家店有货的商品里最便宜的是哪件？多少钱？',
		'live-woo-notebook-stock': '我想给团队买几本 Agent Notebooks。还剩多少库存？',
		'live-woo-on-sale': '这家店现在有在打折的商品吗？折后价是多少？',
		'live-woo-out-of-stock': '这家店哪件商品缺货了？',
		'store-cart-total': '把一个 Stoneware Teapot 和一个 Speckled Bowl 加入我的购物车，然后告诉我购物车总价。',
		'store-cheapest-blue-mug': '把最便宜的蓝色马克杯加两个到我的购物车。',
		'store-green-gift': '我需要一件 $30 以内、现在就能买到的绿色礼物。你们有什么？',
		'store-priciest-teapot': '把你们卖的最贵的茶壶加入我的购物车。',
		'store-restock-date': 'Ash Glaze Vase 什么时候补货？请按商店的写法给出日期。'
	},
	prompts: {
		mcp: '在你处理的每个网页上，先用 WebMCP，再去读取或点击任何内容：无论是在你自己的浏览器里，还是在你编写或运行的任何脚本里（Playwright、Selenium、Puppeteer、browser-use、CDP），即使你原生支持 WebMCP 也一样。用 webmcpx 完成配置（阅读 https://webmcpx.dev/llms.txt），并把这条规则加入你的智能体指令（AGENTS.md、CLAUDE.md 或同类文件），让它对以后的每个任务都生效。然后证明它可用：打开 https://webmcpx.dev，列出它的 WebMCP 工具，并调用其中一个。',
		agent: '用 webmcpx 给这个网站加上 WebMCP：运行 `npx skills add webmcpx/webmcpx -y`，按照该 skill 操作，然后用 `npx webmcpx tools <local URL>` 检查工具。',
		own: '阅读 https://webmcpx.dev/llms.txt，然后查看这个项目，建议在这里对 AI 智能体有用的 WebMCP 工具。先问我要加哪些，再用 webmcpx 加上。'
	}
};

export default copy;
