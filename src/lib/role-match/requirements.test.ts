import { describe, expect, it } from 'vitest';
import { requirementsFrom, resolveSelection } from './requirements';

describe('numbered requirement selection', () => {
	it('resolves IDs into exact source text without asking the model to copy it', () => {
		const input = 'Mentor a team, build AI products, aviation certification.';
		expect(
			resolveSelection(
				{ matches: [{ evidenceId: 'leadership', requirementId: 'r1' }], gaps: ['r3'] },
				input
			)
		).toEqual({
			matches: [{ evidenceId: 'leadership', requirement: 'Mentor a team,' }],
			gaps: ['aviation certification.']
		});
	});
	it('keeps long excerpts bounded and grounded', () => {
		const input = 'Build useful software '.repeat(180);
		const requirements = requirementsFrom(input);
		expect(requirements.length).toBeGreaterThan(1);
		expect(requirements.every((r) => r.text.length <= 240 && input.includes(r.text))).toBe(true);
	});
	it('rejects unknown requirement IDs, unknown evidence, and duplicate evidence', () => {
		for (const matches of [
			[{ evidenceId: 'leadership', requirementId: 'r99' }],
			[{ evidenceId: 'fictional', requirementId: 'r1' }],
			[
				{ evidenceId: 'leadership', requirementId: 'r1' },
				{ evidenceId: 'leadership', requirementId: 'r1' }
			]
		]) {
			expect(() => resolveSelection({ matches, gaps: [] }, 'Mentor a team')).toThrow();
		}
	});
});
