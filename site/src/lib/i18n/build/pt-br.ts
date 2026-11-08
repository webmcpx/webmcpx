// Português (Brasil): as perguntas do benchmark e os prompts para colar no agente (ver server/localize.ts).
import type { BuildCopy } from '#lib/server/localize.ts';

const copy: BuildCopy = {
	questions: {
		'docs-config-path': 'Qual variável de ambiente faz o Orbit ler o arquivo de configuração de outro caminho?',
		'docs-deploy-strategies': 'Quais estratégias de rollout posso escolher ao rodar orbit deploy?',
		'docs-deploy-timeout': 'Qual é o timeout padrão do `orbit deploy` e qual flag muda esse valor?',
		'docs-exit-code': 'Meu passo de CI falhou com o código de saída 4 do orbit. O que isso significa?',
		'docs-retained-releases': 'Por padrão, quantas releases anteriores o Orbit guarda para rollback?',
		'live-cloudflare-d1-database-size':
			'Estou no plano Workers Paid. Até que tamanho um único banco de dados do Cloudflare D1 pode crescer?',
		'live-cloudflare-kv-key-size':
			'Qual o tamanho máximo de uma chave no Cloudflare Workers KV? Quero saber o limite de tamanho da chave.',
		'live-cloudflare-kv-value-size': 'Qual é o tamanho máximo de um único valor guardado no Cloudflare Workers KV?',
		'live-cloudflare-queues-message-size':
			'Qual é a maior mensagem que posso enviar para uma Cloudflare Queue? Preciso do limite de tamanho por mensagem.',
		'live-cloudflare-workers-free-requests':
			'Quantas requisições por dia meus Workers aguentam no plano Workers Free da Cloudflare antes de bater no limite?',
		'live-notion-page-size':
			'Estou paginando resultados da API do Notion. Qual o maior page_size que posso pedir por chamada nos endpoints de listagem?',
		'live-notion-rate-limit-code':
			'Quando minha integração do Notion envia requisições demais, qual string de código de erro a API coloca no corpo da resposta?',
		'live-notion-request-limit':
			'Quantas requisições por minuto a API do Notion permite por conexão nos planos que não são Business e Enterprise?',
		'live-notion-rich-text-limit':
			'Estou escrevendo parágrafos longos numa página do Notion pela API. Qual o número máximo de caracteres que o conteúdo de texto de um único objeto rich text pode ter numa requisição?',
		'live-notion-upload-size':
			'Qual o maior arquivo que posso enviar à API do Notion num upload de parte única antes de precisar mudar para upload em várias partes?',
		'live-spec-contrast': 'Qual taxa de contraste mínima a spec deste site exige para texto corrido de tamanho normal?',
		'live-spec-hsts': 'Segundo esta spec, que max-age devo colocar no meu header HSTS em produção?',
		'live-spec-inp': 'Qual valor de INP esta spec define como meta para uma boa responsividade?',
		'live-spec-meta-description': 'Segundo esta spec, qual deve ser o tamanho da meta description de uma página?',
		'live-spec-touch-target':
			'Qual o tamanho mínimo de área de toque que esta spec exige para botões e outros controles interativos?',
		'live-woo-apparel-count': 'Quantos produtos esta loja tem na categoria Apparel, e quais são?',
		'live-woo-cheapest-in-stock': 'Qual é o produto mais barato em estoque nesta loja, e quanto custa?',
		'live-woo-notebook-stock': 'Quero comprar alguns Agent Notebooks para o meu time. Quantos ainda tem em estoque?',
		'live-woo-on-sale': 'Tem alguma coisa em promoção nesta loja agora? Qual o preço promocional?',
		'live-woo-out-of-stock': 'Qual produto desta loja está fora de estoque?',
		'store-cart-total':
			'Coloque um Stoneware Teapot e um Speckled Bowl no meu carrinho e depois me diga o total do carrinho.',
		'store-cheapest-blue-mug': 'Coloque duas unidades da caneca azul mais barata no meu carrinho.',
		'store-green-gift': 'Preciso de um presente verde abaixo de $30 que eu possa comprar agora. O que vocês têm?',
		'store-priciest-teapot': 'Coloque no meu carrinho o bule mais caro que vocês vendem.',
		'store-restock-date':
			'Quando o Ash Glaze Vase volta ao estoque? Informe a data do jeito que a loja escreve.'
	},
	prompts: {
		mcp: 'Use WebMCP primeiro em toda página web com que você trabalhar, antes de ler ou clicar em qualquer coisa: no seu próprio navegador e em qualquer script que você escrever ou rodar (Playwright, Selenium, Puppeteer, browser-use, CDP), mesmo que você já suporte WebMCP nativamente. Configure com o webmcpx (leia https://webmcpx.dev/llms.txt) e adicione esta regra às suas instruções de agente (AGENTS.md, CLAUDE.md ou equivalente) para que ela valha em todas as tarefas futuras. Depois prove que funciona: abra https://webmcpx.dev, liste as ferramentas WebMCP do site e chame uma.',
		agent: 'Adicione WebMCP a este site com o webmcpx: rode `npx skills add webmcpx/webmcpx -y`, siga a skill e depois confira as ferramentas com `npx webmcpx tools <local URL>`.',
		own: 'Leia https://webmcpx.dev/llms.txt, depois analise este projeto e sugira as ferramentas WebMCP que um agente de IA acharia úteis aqui. Me pergunte quais adicionar e então adicione com o webmcpx.'
	}
};

export default copy;
