import { describe, expect, it } from 'vitest';
import { matchingMessages } from './matching-prompt';
import { requirementsFrom, resolveSelection } from './requirements';

describe('matching prompt examples', () => {
	it('uses valid evidence and requirement IDs in every demonstration', () => {
		const messages = matchingMessages(requirementsFrom('React'));
		for (let i = 1; i < messages.length - 1; i += 2) {
			const requirements = JSON.parse(messages[i].content);
			const input = requirements.map((r: { text: string }) => r.text).join('\n');
			expect(() => resolveSelection(JSON.parse(messages[i + 1].content), input)).not.toThrow();
		}
	});
	it('preserves multiple supporting entries for a single broad requirement', () => {
		const messages = matchingMessages(requirementsFrom('Front end'));
		const result = resolveSelection(JSON.parse(messages[2].content), 'Front end');
		expect(result.matches.map((match) => match.evidenceId)).toEqual([
			'frontend',
			'freelance-websites',
			'signalflow'
		]);
		expect(result.matches.every((match) => match.requirement === 'Front end')).toBe(true);
	});
});
