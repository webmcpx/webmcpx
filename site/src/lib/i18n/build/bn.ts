// বাংলা: বেঞ্চমার্কের প্রশ্ন আর এজেন্টে পেস্ট করার প্রম্পট (দেখুন server/localize.ts)।
// শব্দভান্ডার dict/bn.ts-এর মতো: এজেন্ট, টুল, টোকেন, স্পেক; আপনি সম্বোধন, পশ্চিমা অঙ্ক।
import type { BuildCopy } from '#lib/server/localize.ts';

const copy: BuildCopy = {
	questions: {
		'docs-config-path': 'কোন environment variable দিলে Orbit অন্য path থেকে তার config ফাইল পড়ে?',
		'docs-deploy-strategies': 'orbit deploy চালানোর সময় কোন কোন rollout strategy বেছে নিতে পারি?',
		'docs-deploy-timeout': '`orbit deploy`-এর ডিফল্ট timeout কত, আর কোন flag দিয়ে সেটা বদলানো যায়?',
		'docs-exit-code': 'আমার CI ধাপ orbit-এর exit code 4 দিয়ে ফেল করেছে। এর মানে কী?',
		'docs-retained-releases': 'ডিফল্টভাবে rollback-এর জন্য Orbit আগের কয়টি release রেখে দেয়?',
		'live-cloudflare-d1-database-size':
			'আমি Workers Paid প্ল্যানে আছি। একটি Cloudflare D1 ডেটাবেস সর্বোচ্চ কত বড় হতে পারে?',
		'live-cloudflare-kv-key-size':
			'Cloudflare Workers KV-তে একটি key কত লম্বা হতে পারে? আমি key-এর সর্বোচ্চ সাইজ জানতে চাই।',
		'live-cloudflare-kv-value-size': 'Cloudflare Workers KV-তে রাখা একটি value-এর সর্বোচ্চ সাইজ কত?',
		'live-cloudflare-queues-message-size':
			'Cloudflare Queue-তে সবচেয়ে বড় কত সাইজের message পাঠাতে পারি? প্রতি message-এর সাইজ লিমিট দরকার।',
		'live-cloudflare-workers-free-requests':
			'Cloudflare-এর Workers Free প্ল্যানে লিমিটে পৌঁছানোর আগে আমার Workers দিনে কতগুলো request সামলাতে পারে?',
		'live-notion-page-size':
			'আমি Notion API-এর ফলাফল পেজ করে পড়ছি। list endpoint-এ এক কলে সবচেয়ে বড় কত page_size চাইতে পারি?',
		'live-notion-rate-limit-code':
			'আমার Notion integration খুব বেশি request পাঠালে API response body-তে কোন error code string দেয়?',
		'live-notion-request-limit':
			'Business আর Enterprise ছাড়া অন্য প্ল্যানে Notion API প্রতি connection-এ মিনিটে কতগুলো request করতে দেয়?',
		'live-notion-rich-text-limit':
			'আমি API দিয়ে Notion পেজে লম্বা অনুচ্ছেদ লিখছি। এক request-এ একটি rich text object-এর text content-এ সর্বোচ্চ কতগুলো অক্ষর থাকতে পারে?',
		'live-notion-upload-size':
			'single-part upload-এ Notion API-তে সবচেয়ে বড় কত সাইজের ফাইল পাঠাতে পারি, যার পরে multi-part upload-এ যেতে হয়?',
		'live-spec-contrast': 'এই সাইটের স্পেক স্বাভাবিক সাইজের body text-এর জন্য ন্যূনতম কত contrast ratio চায়?',
		'live-spec-hsts': 'এই স্পেক অনুযায়ী production-এ আমার HSTS header-এ কোন max-age দেব?',
		'live-spec-inp': 'ভালো responsiveness-এর লক্ষ্য হিসেবে এই স্পেক INP-এর মান কত ঠিক করেছে?',
		'live-spec-meta-description': 'এই স্পেক অনুযায়ী একটি পেজের meta description কত লম্বা হওয়া উচিত?',
		'live-spec-touch-target':
			'বাটন আর অন্যান্য interactive control-এর জন্য এই স্পেক ন্যূনতম কত বড় tap target চায়?',
		'live-woo-apparel-count': 'এই স্টোরের Apparel ক্যাটাগরিতে কয়টি প্রোডাক্ট আছে, আর সেগুলো কী কী?',
		'live-woo-cheapest-in-stock': 'এই স্টোরে স্টকে থাকা সবচেয়ে সস্তা প্রোডাক্ট কোনটি, আর দাম কত?',
		'live-woo-notebook-stock': 'আমার টিমের জন্য কয়েকটা Agent Notebooks কিনতে চাই। স্টকে আর কয়টা আছে?',
		'live-woo-on-sale': 'এই স্টোরে এখন কিছু কি সেলে আছে? সেল প্রাইস কত?',
		'live-woo-out-of-stock': 'এই স্টোরের কোন প্রোডাক্টটি স্টকে নেই?',
		'store-cart-total':
			'আমার কার্টে একটি Stoneware Teapot আর একটি Speckled Bowl যোগ করুন, তারপর কার্টের মোট দাম বলুন।',
		'store-cheapest-blue-mug': 'সবচেয়ে সস্তা নীল মগটির দুটি আমার কার্টে যোগ করুন।',
		'store-green-gift': '$30-এর কমে এখনই কেনা যায় এমন একটা সবুজ উপহার দরকার। আপনাদের কাছে কী আছে?',
		'store-priciest-teapot': 'আপনারা যে সবচেয়ে দামি teapot বিক্রি করেন, সেটা আমার কার্টে দিন।',
		'store-restock-date': 'Ash Glaze Vase আবার কবে স্টকে আসবে? স্টোর যেভাবে লেখে, সেভাবেই তারিখটা বলুন।'
	},
	prompts: {
		mcp: 'যে ওয়েব পেজেই কাজ করুন, কিছু পড়া বা ক্লিক করার আগে সবার আগে WebMCP ব্যবহার করুন: নিজের ব্রাউজারে, আর আপনার লেখা বা চালানো যেকোনো script-এ (Playwright, Selenium, Puppeteer, browser-use, CDP), এমনকি আপনি নিজে WebMCP সাপোর্ট করলেও। webmcpx দিয়ে সেট আপ করুন (https://webmcpx.dev/llms.txt পড়ুন) এবং নিয়মটি আপনার এজেন্ট নির্দেশনায় (AGENTS.md, CLAUDE.md বা সমতুল্য ফাইল) যোগ করুন, যাতে ভবিষ্যতের প্রতিটি কাজে এটি খাটে। তারপর প্রমাণ করুন যে এটি কাজ করছে: https://webmcpx.dev খুলুন, এর WebMCP টুলের তালিকা দেখান এবং একটি কল করুন।',
		agent: 'webmcpx দিয়ে এই সাইটে WebMCP যোগ করুন: `npx skills add webmcpx/webmcpx -y` চালান, skill-টি অনুসরণ করুন, তারপর `npx webmcpx tools <local URL>` দিয়ে টুলগুলো যাচাই করুন।',
		own: 'https://webmcpx.dev/llms.txt পড়ুন, তারপর এই প্রজেক্টটি দেখে বলুন এখানে একজন AI এজেন্টের কাজে লাগবে এমন কোন কোন WebMCP টুল যোগ করা যায়। কোনগুলো যোগ করব আমাকে জিজ্ঞেস করুন, তারপর webmcpx দিয়ে সেগুলো যোগ করুন।'
	}
};

export default copy;
