// हिन्दी: बेंचमार्क के सवाल और एजेंट में पेस्ट करने वाले प्रॉम्प्ट (देखें server/localize.ts)।
// शब्दावली dict/hi.ts जैसी: एजेंट, टूल, टोकन, स्पेक।
import type { BuildCopy } from '#lib/server/localize.ts';

const copy: BuildCopy = {
	questions: {
		'docs-config-path': 'कौन-सा environment variable Orbit को उसकी config फ़ाइल किसी दूसरे path से पढ़वाता है?',
		'docs-deploy-strategies': 'orbit deploy चलाते समय मैं कौन-कौन सी rollout strategy चुन सकता हूँ?',
		'docs-deploy-timeout': '`orbit deploy` का डिफ़ॉल्ट timeout कितना है, और कौन-सा flag उसे बदलता है?',
		'docs-exit-code': 'मेरा CI स्टेप orbit के exit code 4 के साथ फ़ेल हुआ। इसका क्या मतलब है?',
		'docs-retained-releases': 'डिफ़ॉल्ट रूप से Orbit rollback के लिए पिछली कितनी releases रखता है?',
		'live-cloudflare-d1-database-size':
			'मैं Workers Paid प्लान पर हूँ। एक Cloudflare D1 डेटाबेस ज़्यादा से ज़्यादा कितना बड़ा हो सकता है?',
		'live-cloudflare-kv-key-size':
			'Cloudflare Workers KV में key कितनी लंबी हो सकती है? मुझे key का अधिकतम साइज़ जानना है।',
		'live-cloudflare-kv-value-size': 'Cloudflare Workers KV में रखी एक value का अधिकतम साइज़ कितना है?',
		'live-cloudflare-queues-message-size':
			'Cloudflare Queue में मैं सबसे बड़ा कितना message भेज सकता हूँ? मुझे हर message की साइज़ लिमिट चाहिए।',
		'live-cloudflare-workers-free-requests':
			'Cloudflare के Workers Free प्लान पर मेरे Workers लिमिट तक पहुँचने से पहले रोज़ कितनी requests संभाल सकते हैं?',
		'live-notion-page-size':
			'मैं Notion API के नतीजों को पेज करके पढ़ रहा हूँ। list endpoints पर एक कॉल में सबसे बड़ा page_size कितना माँग सकता हूँ?',
		'live-notion-rate-limit-code':
			'जब मेरा Notion integration बहुत ज़्यादा requests भेजता है, तो API response body में कौन-सा error code string देता है?',
		'live-notion-request-limit':
			'Business और Enterprise के अलावा बाकी प्लान पर Notion API हर connection को प्रति मिनट कितनी requests की इजाज़त देता है?',
		'live-notion-rich-text-limit':
			'मैं API से Notion पेज में लंबे पैराग्राफ़ लिख रहा हूँ। एक request में एक rich text object के text content में ज़्यादा से ज़्यादा कितने कैरेक्टर हो सकते हैं?',
		'live-notion-upload-size':
			'Notion API पर single-part upload में मैं सबसे बड़ी कितनी फ़ाइल भेज सकता हूँ, जिसके बाद multi-part upload पर जाना पड़े?',
		'live-spec-contrast': 'इस साइट का स्पेक सामान्य साइज़ के body text के लिए कम से कम कितना contrast ratio माँगता है?',
		'live-spec-hsts': 'इस स्पेक के हिसाब से production में अपने HSTS header में कौन-सा max-age रखूँ?',
		'live-spec-inp': 'अच्छी responsiveness के लिए यह स्पेक INP का लक्ष्य कितना तय करता है?',
		'live-spec-meta-description': 'इस स्पेक के मुताबिक़ किसी पेज की meta description कितनी लंबी होनी चाहिए?',
		'live-spec-touch-target':
			'यह स्पेक बटन और दूसरे interactive controls के लिए कम से कम कितना बड़ा tap target माँगता है?',
		'live-woo-apparel-count': 'इस स्टोर की Apparel कैटेगरी में कितने प्रोडक्ट हैं, और कौन-कौन से?',
		'live-woo-cheapest-in-stock': 'इस स्टोर में स्टॉक में मौजूद सबसे सस्ता प्रोडक्ट कौन-सा है, और उसकी क़ीमत क्या है?',
		'live-woo-notebook-stock': 'मुझे अपनी टीम के लिए कुछ Agent Notebooks ख़रीदने हैं। स्टॉक में कितने बचे हैं?',
		'live-woo-on-sale': 'क्या इस स्टोर में अभी कुछ सेल पर है? सेल प्राइस क्या है?',
		'live-woo-out-of-stock': 'इस स्टोर का कौन-सा प्रोडक्ट आउट ऑफ़ स्टॉक है?',
		'store-cart-total':
			'मेरे कार्ट में एक Stoneware Teapot और एक Speckled Bowl डालो, फिर बताओ कार्ट का कुल कितना हुआ।',
		'store-cheapest-blue-mug': 'सबसे सस्ते नीले मग के दो पीस मेरे कार्ट में डालो।',
		'store-green-gift': 'मुझे $30 से कम का कोई हरा गिफ़्ट चाहिए जो अभी ख़रीदा जा सके। आपके पास क्या है?',
		'store-priciest-teapot': 'आप जो सबसे महँगी teapot बेचते हैं, उसे मेरे कार्ट में डालो।',
		'store-restock-date': 'Ash Glaze Vase दोबारा स्टॉक में कब आएगा? तारीख़ वैसे ही बताओ जैसे स्टोर लिखता है।'
	},
	prompts: {
		mcp: 'जिस भी वेब पेज पर आप काम करें, कुछ भी पढ़ने या क्लिक करने से पहले सबसे पहले WebMCP इस्तेमाल करें: अपने ब्राउज़र में भी और हर उस script में भी जो आप लिखें या चलाएँ (Playwright, Selenium, Puppeteer, browser-use, CDP), भले ही आप WebMCP को नेटिव रूप से सपोर्ट करते हों। इसे webmcpx से सेट अप करें (https://webmcpx.dev/llms.txt पढ़ें) और यह नियम अपने एजेंट निर्देशों (AGENTS.md, CLAUDE.md या उसके जैसी फ़ाइल) में जोड़ें, ताकि यह आगे के हर काम पर लागू हो। फिर साबित करें कि यह काम करता है: https://webmcpx.dev खोलें, उसके WebMCP टूल की सूची बनाएँ और उनमें से एक को कॉल करें।',
		agent: 'webmcpx से इस साइट में WebMCP जोड़ें: `npx skills add webmcpx/webmcpx -y` चलाएँ, skill के निर्देश मानें, फिर `npx webmcpx tools <local URL>` से टूल जाँचें।',
		own: 'https://webmcpx.dev/llms.txt पढ़ें, फिर इस प्रोजेक्ट को देखें और सुझाएँ कि यहाँ AI एजेंट के लिए कौन-से WebMCP टूल काम के होंगे। मुझसे पूछें कि कौन-से जोड़ने हैं, फिर उन्हें webmcpx से जोड़ें।'
	}
};

export default copy;
