// The models the benchmark ran on, in the order the switcher shows them: per provider, the cheap model
// first, then the frontier one. A model is shown once its run is published in `content/bench/<id>.json`.

import { ANTHROPIC, GEMINI, OPENAI, type Logo } from './logos.ts';

export interface ModelLook {
	/** The model id, as in the results file. */
	id: string;
	name: string;
	provider: string;
	tier: 'cheap' | 'frontier';
	logo: Logo;
}

export const MODELS: ModelLook[] = [
	{ id: 'gpt-6-luna', name: 'GPT-6 Luna', provider: 'OpenAI', tier: 'cheap', logo: OPENAI },
	{ id: 'gpt-6.1-sol', name: 'GPT-6.1 Sol', provider: 'OpenAI', tier: 'frontier', logo: OPENAI },
	{ id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', provider: 'Anthropic', tier: 'cheap', logo: ANTHROPIC },
	{
		id: 'claude-opus-5-5',
		name: 'Claude Opus 5.5',
		provider: 'Anthropic',
		tier: 'frontier',
		logo: ANTHROPIC
	},
	{ id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', provider: 'Google', tier: 'cheap', logo: GEMINI },
	{ id: 'gemini-4-argon', name: 'Gemini 4 Argon', provider: 'Google', tier: 'frontier', logo: GEMINI }
];

/** How a model is shown; unknown ids show the id. */
export const modelLook = (id: string): Omit<ModelLook, 'logo'> & { logo?: Logo } =>
	MODELS.find((m) => m.id === id) ?? { id, name: id, provider: '', tier: 'cheap' };
