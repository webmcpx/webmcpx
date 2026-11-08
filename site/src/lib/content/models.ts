// The models the benchmark ran on: the cheap and the frontier model of each provider. The page lists
// them in leaderboard order (bench.ts); a model is shown once its run is published in
// `content/bench/<id>.json`.

import { ANTHROPIC, GEMINI, OPENAI, type Logo } from './logos.ts';

export interface ModelLook {
	/** The model id, as in the results file. */
	id: string;
	name: string;
	provider: string;
	logo: Logo;
}

export const MODELS: ModelLook[] = [
	{ id: 'gpt-6-luna', name: 'GPT-6 Luna', provider: 'OpenAI', logo: OPENAI },
	{ id: 'gpt-6.1-sol', name: 'GPT-6.1 Sol', provider: 'OpenAI', logo: OPENAI },
	{ id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', provider: 'Anthropic', logo: ANTHROPIC },
	{
		id: 'claude-opus-5-5',
		name: 'Claude Opus 5.5',
		provider: 'Anthropic',
		logo: ANTHROPIC
	},
	{ id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'Google', logo: GEMINI },
	{ id: 'gemini-4-argon', name: 'Gemini 4 Argon', provider: 'Google', logo: GEMINI }
];

/** How a model is shown; unknown ids show the id. */
export const modelLook = (id: string): Omit<ModelLook, 'logo'> & { logo?: Logo } =>
	MODELS.find((m) => m.id === id) ?? { id, name: id, provider: '' };
