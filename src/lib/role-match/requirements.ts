import { validateMatch, type RoleMatch } from './evidence';

export function requirementsFrom(input: string): { id: string; text: string }[] {
	const chunks: string[] = [];
	for (const excerpt of input.match(/(?:[^.!?;\n,]|\.(?=\S))+[.!?;\n,]*/g) ?? []) {
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
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new Error('Invalid selection.');
	const selections = value as Record<string, unknown>;
	const requirements = requirementsFrom(input);
	if (
		Object.keys(selections).length !== requirements.length ||
		Object.keys(selections).some((id) => !requirements.some((r) => r.id === id))
	) {
		throw new Error('Unknown or missing requirement.');
	}
	const matches: { evidenceId: unknown; requirement: string }[] = [];
	const gaps: string[] = [];
	const seen = new Set<unknown>();
	for (const requirement of requirements) {
		const ids = selections[requirement.id];
		if (!Array.isArray(ids) || new Set(ids).size !== ids.length)
			throw new Error('Invalid evidence selection.');
		if (ids.length === 0) gaps.push(requirement.text);
		for (const evidenceId of ids) {
			if (!seen.has(evidenceId)) {
				matches.push({ evidenceId, requirement: requirement.text });
				seen.add(evidenceId);
			}
		}
	}
	return validateMatch({ matches, gaps }, input);
}
