// Español: las preguntas del benchmark y los prompts para pegar en el agente (ver server/localize.ts).
import type { BuildCopy } from '#lib/server/localize.ts';

const copy: BuildCopy = {
	questions: {
		'docs-config-path':
			'¿Qué variable de entorno hace que Orbit lea su archivo de configuración desde otra ruta?',
		'docs-deploy-strategies': '¿Qué estrategias de rollout puedo elegir al ejecutar orbit deploy?',
		'docs-deploy-timeout': '¿Cuál es el timeout por defecto de `orbit deploy` y qué flag lo cambia?',
		'docs-exit-code': 'Mi paso de CI falló con el código de salida 4 de orbit. ¿Qué significa?',
		'docs-retained-releases': 'Por defecto, ¿cuántas releases anteriores guarda Orbit para hacer rollback?',
		'live-cloudflare-d1-database-size':
			'Estoy en el plan Workers Paid. ¿Hasta qué tamaño puede crecer una sola base de datos de Cloudflare D1?',
		'live-cloudflare-kv-key-size':
			'¿Qué tan larga puede ser una clave en Cloudflare Workers KV? Quiero saber el tamaño máximo de clave.',
		'live-cloudflare-kv-value-size': '¿Cuál es el tamaño máximo de un solo valor guardado en Cloudflare Workers KV?',
		'live-cloudflare-queues-message-size':
			'¿Cuál es el mensaje más grande que puedo enviar a una Cloudflare Queue? Necesito el límite de tamaño por mensaje.',
		'live-cloudflare-workers-free-requests':
			'¿Cuántas solicitudes al día pueden atender mis Workers en el plan Workers Free de Cloudflare antes de llegar al límite?',
		'live-notion-page-size':
			'Estoy paginando resultados de la API de Notion. ¿Cuál es el page_size más grande que puedo pedir por llamada en los endpoints de listado?',
		'live-notion-rate-limit-code':
			'Cuando mi integración de Notion envía demasiadas solicitudes, ¿qué string de código de error pone la API en el cuerpo de la respuesta?',
		'live-notion-request-limit':
			'¿Cuántas solicitudes por minuto permite la API de Notion por conexión en los planes que no son Business y Enterprise?',
		'live-notion-rich-text-limit':
			'Estoy escribiendo párrafos largos en una página de Notion a través de la API. ¿Cuántos caracteres puede tener como máximo el contenido de texto de un solo objeto rich text en una solicitud?',
		'live-notion-upload-size':
			'¿Cuál es el archivo más grande que puedo enviar a la API de Notion en una subida de una sola parte antes de tener que pasar a una subida multiparte?',
		'live-spec-contrast':
			'¿Qué relación de contraste mínima exige la spec de este sitio para el texto de cuerpo de tamaño normal?',
		'live-spec-hsts': 'Según esta spec, ¿qué max-age debo poner en mi header HSTS para producción?',
		'live-spec-inp': '¿Qué valor de INP fija esta spec como objetivo para una buena capacidad de respuesta?',
		'live-spec-meta-description': 'Según esta spec, ¿qué largo debe tener la meta description de una página?',
		'live-spec-touch-target':
			'¿Cuál es el tamaño mínimo de área táctil que exige esta spec para botones y otros controles interactivos?',
		'live-woo-apparel-count': '¿Cuántos productos tiene esta tienda en su categoría Apparel y cuáles son?',
		'live-woo-cheapest-in-stock': '¿Cuál es el producto más barato con stock en esta tienda y cuánto cuesta?',
		'live-woo-notebook-stock': 'Quiero comprar unos Agent Notebooks para mi equipo. ¿Cuántos quedan en stock?',
		'live-woo-on-sale': '¿Hay algo en oferta en esta tienda ahora mismo? ¿Cuál es el precio de oferta?',
		'live-woo-out-of-stock': '¿Qué producto de esta tienda está agotado?',
		'store-cart-total':
			'Agrega un Stoneware Teapot y un Speckled Bowl a mi carrito y luego dime el total del carrito.',
		'store-cheapest-blue-mug': 'Agrega a mi carrito dos unidades de la taza azul más barata.',
		'store-green-gift': 'Necesito un regalo verde de menos de $30 que pueda comprar ahora mismo. ¿Qué tienen?',
		'store-priciest-teapot': 'Pon en mi carrito la tetera más cara que venden.',
		'store-restock-date':
			'¿Cuándo vuelve a haber stock del Ash Glaze Vase? Dame la fecha tal como la escribe la tienda.'
	},
	prompts: {
		mcp: 'Usa WebMCP primero en cada página web con la que trabajes, antes de leer o hacer clic en nada: en tu propio navegador y en cualquier script que escribas o ejecutes (Playwright, Selenium, Puppeteer, browser-use, CDP), aunque ya soportes WebMCP de forma nativa. Configúralo con webmcpx (lee https://webmcpx.dev/llms.txt) y agrega esta regla a tus instrucciones de agente (AGENTS.md, CLAUDE.md o equivalente) para que se aplique en todas las tareas futuras. Luego demuestra que funciona: abre https://webmcpx.dev, lista sus herramientas WebMCP y llama a una.',
		agent: 'Agrega WebMCP a este sitio con webmcpx: ejecuta `npx skills add webmcpx/webmcpx -y`, sigue la skill y luego revisa las herramientas con `npx webmcpx tools <local URL>`.',
		own: 'Lee https://webmcpx.dev/llms.txt, luego revisa este proyecto y sugiere las herramientas WebMCP que le servirían a un agente de IA aquí. Pregúntame cuáles agregar y luego agrégalas con webmcpx.'
	}
};

export default copy;
