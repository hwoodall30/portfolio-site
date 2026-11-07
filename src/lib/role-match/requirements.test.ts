import { describe, expect, it } from 'vitest';
import { requirementsFrom, resolveSelection } from './requirements';

describe('numbered requirement selection', () => {
	it('allows every supporting evidence entry for the same requirement', () => {
		const ids = ['frontend', 'freelance-websites', 'signalflow', 'backend-apis'];
		expect(resolveSelection({ r1: ids }, 'Front end')).toEqual({
			matches: ids.map((evidenceId) => ({ evidenceId, requirement: 'Front end' })),
			gaps: []
		});
	});
	it('restores exact source quotes and derives gaps from empty selections', () => {
		const input = 'Mentor a team, build AI products, aviation certification.';
		expect(resolveSelection({ r1: ['leadership'], r2: ['generative-ai'], r3: [] }, input)).toEqual({
			matches: [
				{ evidenceId: 'leadership', requirement: 'Mentor a team,' },
				{ evidenceId: 'generative-ai', requirement: 'build AI products,' }
			],
			gaps: ['aviation certification.']
		});
	});
	it('shows evidence once when it supports several requirements', () => {
		expect(resolveSelection({ r1: ['frontend'], r2: ['frontend'] }, 'React; TypeScript')).toEqual({
			matches: [{ evidenceId: 'frontend', requirement: 'React;' }],
			gaps: []
		});
	});
	it('keeps long excerpts bounded and grounded', () => {
		const input = 'Build useful software '.repeat(180);
		const requirements = requirementsFrom(input);
		expect(requirements.length).toBeGreaterThan(1);
		expect(requirements.every((r) => r.text.length <= 240 && input.includes(r.text))).toBe(true);
	});
	it('preserves dotted technology names while separating sentences', () => {
		expect(requirementsFrom('Next.js and Node.js. Mentor a team.')).toEqual([
			{ id: 'r1', text: 'Next.js and Node.js.' },
			{ id: 'r2', text: 'Mentor a team.' }
		]);
	});
	it('rejects malformed, unknown, missing, swapped, and duplicate IDs', () => {
		for (const selection of [
			null,
			[],
			{},
			{ r99: ['leadership'] },
			{ r1: ['fictional'] },
			{ r1: ['leadership', 'leadership'] },
			{ r1: 'leadership' },
			{ leadership: ['r1'] },
			{ r1: ['leadership'], r2: [] }
		]) {
			expect(() => resolveSelection(selection, 'Mentor a team')).toThrow();
		}
	});
});
