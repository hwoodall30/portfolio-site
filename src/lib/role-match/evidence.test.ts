import { describe, expect, it } from 'vitest';
import { getEvidence, roleExamples, validateMatch } from './evidence';

describe('grounded role matching', () => {
	it('validates every authored preview against its own input', () => {
		for (const example of roleExamples)
			expect(validateMatch(example.result, example.input)).toEqual(example.result);
	});
	it('rejects invented facts, links, and requirement quotes', () => {
		for (const matches of [
			[{ evidenceId: 'made-up-job', requirement: 'mentor a team' }],
			[{ evidenceId: 'leadership', requirement: 'holds aviation certification' }],
			[{ evidenceId: 'leadership', requirement: '' }],
			[
				{ evidenceId: 'leadership', requirement: 'mentor a team' },
				{ evidenceId: 'leadership', requirement: 'mentor a team' }
			]
		])
			expect(() => validateMatch({ matches, gaps: [] }, 'mentor a team')).toThrow();
	});
	it('rejects malformed results and unsupported gap quotes', () => {
		for (const value of [
			null,
			[],
			{},
			{ matches: [], gaps: ['invented requirement'] },
			{ matches: 'leadership', gaps: [] }
		])
			expect(() => validateMatch(value, 'mentor a team')).toThrow();
	});
	it('permits no matches rather than manufacturing relevance', () => {
		expect(
			validateMatch({ matches: [], gaps: ['aviation certification'] }, 'aviation certification')
		).toEqual({ matches: [], gaps: ['aviation certification'] });
	});
	it('keeps every matching entry when more than three support a topic', () => {
		const input = 'Front end';
		const matches = ['frontend', 'signalflow', 'freelance-websites', 'backend-apis'].map(
			(evidenceId) => ({ evidenceId, requirement: input })
		);
		expect(validateMatch({ matches, gaps: [] }, input)).toEqual({ matches, gaps: [] });
	});
	it('discards generated commentary and keeps authored source destinations', () => {
		expect(
			validateMatch(
				{
					matches: [
						{
							evidenceId: 'leadership',
							requirement: 'mentor a team',
							fact: 'invented',
							href: 'https://untrusted.example'
						}
					],
					gaps: [],
					score: 100
				},
				'mentor a team'
			)
		).toEqual({ matches: [{ evidenceId: 'leadership', requirement: 'mentor a team' }], gaps: [] });
		expect(getEvidence('leadership').href).toBe('#about');
	});
});
