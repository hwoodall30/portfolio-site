import { CreateMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm';
import { attempt } from '../helpers/attempt';
import { MODEL_ID } from './config';
import { matchingMessages, matchingSchema } from './matching-prompt';
import { retrieveEvidence, resolveRanking } from './retrieval';
import { requirementsFrom, resolveSelection } from './requirements';
import type { AIRequest, AIResponse } from './ai-protocol';

let engine: MLCEngineInterface | null = null;
self.onmessage = async (event: MessageEvent<AIRequest>) => {
	const { id, operation, prompt } = event.data;
	let stage = 'Model initialization';
	const result = await attempt<string, unknown>(async () => {
		if (operation === 'initialize') {
			engine = await CreateMLCEngine(MODEL_ID, {
				initProgressCallback: (report) =>
					self.postMessage({ id, type: 'progress', progress: report.progress } satisfies AIResponse)
			});
			return null;
		}
		if (!engine || typeof prompt !== 'string') throw new Error('Model or input is not ready.');
		const requirements = requirementsFrom(prompt);
		const candidates = retrieveEvidence(prompt);
		const baseline = resolveSelection(candidates, prompt);
		console.debug('[Local AI] Retrieved candidates:', candidates);
		if (!baseline.matches.length) return baseline;
		stage = 'Inference';
		const ranked = await attempt<string, typeof baseline>(async () => {
			const result = await engine!.chat.completions.create({
				messages: matchingMessages(requirements, candidates),
				temperature: 0,
				max_tokens: 1024,
				response_format: { type: 'json_object', schema: JSON.stringify(matchingSchema(candidates)) }
			});
			console.debug('[Local AI] Model response:', result);
			if (result.choices[0]?.finish_reason === 'length')
				throw new Error('The response reached its token limit.');
			return resolveRanking(
				JSON.parse(result.choices[0]?.message.content ?? 'null'),
				candidates,
				prompt
			);
		});
		if (ranked.error !== null) {
			console.warn('[Local AI] Ranking failed; retaining retrieved evidence:', ranked.error);
			return baseline;
		}
		return ranked.data;
	});
	self.postMessage(
		result.error !== null
			? ({
					id,
					type: 'error',
					message: stage + ': ' + String(result.error).slice(0, 800)
				} satisfies AIResponse)
			: ({ id, type: 'complete', data: result.data } satisfies AIResponse)
	);
};
