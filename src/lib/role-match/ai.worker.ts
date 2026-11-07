import { CreateMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm';
import { attempt } from '../helpers/attempt';
import { evidence } from './evidence';
import { MODEL_ID } from './config';
import { matchingMessages } from './matching-prompt';
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
		stage = 'Inference';
		const result = await engine.chat.completions.create({
			messages: matchingMessages(requirements),
			temperature: 0,
			max_tokens: 220,
			response_format: {
				type: 'json_object',
				schema: JSON.stringify({
					type: 'object',
					properties: {
						matches: {
							type: 'array',
							maxItems: 3,
							items: {
								type: 'object',
								properties: {
									evidenceId: { type: 'string', enum: evidence.map((item) => item.id) },
									requirementId: { type: 'string', enum: requirements.map((r) => r.id) }
								},
								required: ['evidenceId', 'requirementId'],
								additionalProperties: false
							}
						},
						gaps: {
							type: 'array',
							maxItems: 3,
							items: { type: 'string', enum: requirements.map((r) => r.id) }
						}
					},
					required: ['matches', 'gaps'],
					additionalProperties: false
				})
			}
		});
		console.debug('[Local AI] Model response:', result);
		stage = 'Response validation';
		if (result.choices[0]?.finish_reason === 'length')
			throw new Error('The response reached its token limit.');
		return resolveSelection(JSON.parse(result.choices[0]?.message.content ?? 'null'), prompt);
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
