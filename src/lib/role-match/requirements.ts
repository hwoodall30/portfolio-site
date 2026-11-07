import { validateMatch, type RoleMatch } from './evidence';

export function requirementsFrom(input: string): { id: string; text: string }[] {
	const chunks: string[] = [];
	for (const excerpt of input.match(/[^.!?;\n,]+[.!?;\n,]*/g) ?? []) {
		let remaining = excerpt.trim();
		while (remaining) {
			let end = Math.min(240, remaining.length);
			if (end < remaining.length) {
				const boundary = remaining.lastIndexOf(' ', end);
				if (boundary > 100) end = boundary;
			}
			chunks.push(remaining.slice(0, end).trim());
			remaining = remaining.slice(end).trim();
		}
	}
	return chunks.map((text, i) => ({ id: `r${i + 1}`, text }));
}

export function resolveSelection(value: unknown, input: string): RoleMatch {
	if (!value || typeof value !== 'object') throw new Error('Invalid selection.');
	const v = value as Record<string, unknown>;
	if (!Array.isArray(v.matches) || !Array.isArray(v.gaps)) throw new Error('Invalid selection.');
	const requirements = requirementsFrom(input);
	function quote(id: unknown) {
		const requirement = requirements.find((r) => r.id === id);
		if (!requirement) throw new Error('Unknown requirement.');
		return requirement.text;
	}
	return validateMatch(
		{
			matches: v.matches.map((item: unknown) => {
				if (!item || typeof item !== 'object') throw new Error('Invalid selection.');
				const m = item as Record<string, unknown>;
				return { evidenceId: m.evidenceId, requirement: quote(m.requirementId) };
			}),
			gaps: v.gaps.map(quote)
		},
		input
	);
}
