import { describe, expect, it } from 'vitest';
import { evaluationCases } from './evaluation-cases';
import { retrieveEvidence, resolveRanking } from './retrieval';
import { resolveSelection } from './requirements';

describe('authored evidence retrieval', () => {
	for (const scenario of evaluationCases) {
		it(scenario.input, () => {
			const result = resolveSelection(retrieveEvidence(scenario.input), scenario.input);
			expect(result.matches.map((item) => item.evidenceId).sort()).toEqual(
				[...scenario.expected].sort()
			);
		});
	}
	it('retains all candidates when the model omits matches', () => {
		const retrieved = retrieveEvidence('Front end');
		expect(resolveRanking({ r1: ['signalflow'] }, retrieved, 'Front end').matches).toHaveLength(4);
	});
	it('rejects model matches outside the retrieved candidates', () => {
		expect(() =>
			resolveRanking({ r1: ['signalflow'] }, retrieveEvidence('React'), 'React')
		).toThrow('Unretrieved evidence');
	});
});
