// Français : les questions du benchmark et les prompts à coller dans l’agent (voir server/localize.ts).
import type { BuildCopy } from '#lib/server/localize.ts';

const copy: BuildCopy = {
	questions: {
		'docs-config-path':
			'Quelle variable d’environnement fait lire à Orbit son fichier de configuration depuis un autre chemin ?',
		'docs-deploy-strategies': 'Quelles stratégies de rollout puis-je choisir quand je lance orbit deploy ?',
		'docs-deploy-timeout': 'Quel est le timeout par défaut de `orbit deploy`, et quel flag le modifie ?',
		'docs-exit-code': 'Mon étape de CI a échoué avec le code de sortie orbit 4. Qu’est-ce que ça veut dire ?',
		'docs-retained-releases': 'Par défaut, combien de releases précédentes Orbit garde-t-il pour un rollback ?',
		'live-cloudflare-d1-database-size':
			'Je suis sur l’offre Workers Paid. Jusqu’à quelle taille une base Cloudflare D1 peut-elle grandir ?',
		'live-cloudflare-kv-key-size':
			'Quelle longueur peut avoir une clé dans Cloudflare Workers KV ? Je veux connaître la taille maximale d’une clé.',
		'live-cloudflare-kv-value-size':
			'Quelle est la taille maximale d’une valeur stockée dans Cloudflare Workers KV ?',
		'live-cloudflare-queues-message-size':
			'Quel est le plus gros message que je peux envoyer à une Cloudflare Queue ? Il me faut la limite de taille par message.',
		'live-cloudflare-workers-free-requests':
			'Combien de requêtes par jour mes Workers peuvent-ils traiter sur l’offre Workers Free de Cloudflare avant d’atteindre la limite ?',
		'live-notion-page-size':
			'Je pagine des résultats de l’API Notion. Quel est le plus grand page_size que je peux demander par appel sur les endpoints de liste ?',
		'live-notion-rate-limit-code':
			'Quand mon intégration Notion envoie trop de requêtes, quelle chaîne de code d’erreur l’API met-elle dans le corps de la réponse ?',
		'live-notion-request-limit':
			'Combien de requêtes par minute l’API Notion autorise-t-elle par connexion sur les offres autres que Business et Enterprise ?',
		'live-notion-rich-text-limit':
			'J’écris de longs paragraphes dans une page Notion via l’API. Combien de caractères au maximum le contenu texte d’un seul objet rich text peut-il avoir dans une requête ?',
		'live-notion-upload-size':
			'Quel est le plus gros fichier que je peux envoyer à l’API Notion en upload en une seule partie, avant de devoir passer à un upload en plusieurs parties ?',
		'live-spec-contrast':
			'Quel ratio de contraste minimal la spec de ce site exige-t-elle pour le texte courant de taille normale ?',
		'live-spec-hsts': 'Selon cette spec, quel max-age dois-je mettre dans mon header HSTS en production ?',
		'live-spec-inp': 'Quelle valeur d’INP cette spec fixe-t-elle comme objectif pour une bonne réactivité ?',
		'live-spec-meta-description': 'Selon cette spec, quelle longueur doit faire la meta description d’une page ?',
		'live-spec-touch-target':
			'Quelle taille minimale de zone tactile cette spec exige-t-elle pour les boutons et autres contrôles interactifs ?',
		'live-woo-apparel-count': 'Combien de produits cette boutique a-t-elle dans sa catégorie Apparel, et lesquels ?',
		'live-woo-cheapest-in-stock': 'Quel est le produit en stock le moins cher de cette boutique, et combien coûte-t-il ?',
		'live-woo-notebook-stock':
			'Je veux acheter quelques Agent Notebooks pour mon équipe. Combien en reste-t-il en stock ?',
		'live-woo-on-sale': 'Y a-t-il quelque chose en promo dans cette boutique en ce moment ? À quel prix ?',
		'live-woo-out-of-stock': 'Quel produit de cette boutique est en rupture de stock ?',
		'store-cart-total':
			'Ajoute un Stoneware Teapot et un Speckled Bowl à mon panier, puis donne-moi le total du panier.',
		'store-cheapest-blue-mug': 'Ajoute à mon panier deux exemplaires du mug bleu le moins cher.',
		'store-green-gift': 'Il me faut un cadeau vert à moins de $30, disponible tout de suite. Qu’est-ce que vous avez ?',
		'store-priciest-teapot': 'Mets dans mon panier la théière la plus chère que vous vendez.',
		'store-restock-date':
			'Quand l’Ash Glaze Vase sera-t-il de nouveau en stock ? Donne la date telle que la boutique l’écrit.'
	},
	prompts: {
		mcp: 'Utilise WebMCP en premier sur chaque page web avec laquelle tu travailles, avant de lire ou de cliquer quoi que ce soit : dans ton propre navigateur et dans tout script que tu écris ou exécutes (Playwright, Selenium, Puppeteer, browser-use, CDP), même si tu prends déjà en charge WebMCP nativement. Configure-le avec webmcpx (lis https://webmcpx.dev/llms.txt) et ajoute cette règle à tes instructions d’agent (AGENTS.md, CLAUDE.md ou équivalent) pour qu’elle s’applique à toutes les tâches futures. Puis prouve que ça marche : ouvre https://webmcpx.dev, liste ses outils WebMCP et appelles-en un.',
		agent: 'Ajoute WebMCP à ce site avec webmcpx : lance `npx skills add webmcpx/webmcpx -y`, suis la skill, puis vérifie les outils avec `npx webmcpx tools <local URL>`.',
		own: 'Lis https://webmcpx.dev/llms.txt, puis examine ce projet et propose les outils WebMCP qu’un agent IA trouverait utiles ici. Demande-moi lesquels ajouter, puis ajoute-les avec webmcpx.'
	}
};

export default copy;
