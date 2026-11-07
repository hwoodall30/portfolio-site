import { evidence, type EvidenceId } from './evidence';
import { requirementsFrom, resolveSelection } from './requirements';

// Vocabulary aliases, not query-specific overrides. Tags remain the source of relevance.
function terms(text: string): string[] {
	return [
		...new Set(
			text
				.toLowerCase()
				.replace(/next\.js/g, 'nextjs')
				.replace(/node\.js/g, 'nodejs')
				.replace(/front[ -]?end|user interfaces?|\bui\b|web(?:site)? development/g, 'frontend')
				.replace(/back[ -]?end/g, 'backend')
				.replace(/language models?/g, 'llm')
				.replace(/spending|expenses?/g, 'cost')
				.replace(/administrative/g, 'administration')
				.replace(/\b(?:administering|administer|administrative)\b/g, 'administration')
				.replace(/\b(?:coach(?:ing|es)?|mentorship|mentor(?:ing|s)?)\b/g, 'mentor')
				.replace(/\bdevelopers?\b/g, 'engineers')
				.replace(/\b(?:exercise|exercising|workouts?)\b/g, 'fitness')
				.replace(/\bchallenges?\b/g, 'competitions')
				.replace(/\bimports?\b/g, 'ingestion')
				.replace(/\bdatasets?\b/g, 'data')
				.replace(/\bclean\b/g, 'normalize')
				.replace(/plain english|\bconversation\b/g, 'natural language')
				.replace(/permission[ -]scoped/g, 'role scoped')
				.replace(/recommend(?:ations?|ing|ed)?/g, 'recommend')
				.replace(/\bclients?\b/g, 'customer')
				.replace(/\bmanage(?:ment|s|d)?\b/g, 'manage')
				.replace(/\b(?:ingest(?:ion|ing|s)?|normaliz(?:e|ing|ation))\b/g, (word) =>
					word.startsWith('ingest') ? 'ingest' : 'normalize'
				)
				.match(/[a-z0-9]+\+\+|[a-z0-9]+#|[a-z0-9]+/g)
				?.map((word) =>
					word.length > 5 && word.endsWith('ing')
						? word.slice(0, -3)
						: word.length > 3 && word.endsWith('s') && !word.endsWith('ss')
							? word.slice(0, -1)
							: word
				) ?? []
		)
	];
}

const index = evidence.map((item) => ({ id: item.id, tags: item.tags.map(terms) }));
const frequency = new Map<string, number>();
for (const item of index) {
	for (const term of new Set(item.tags.flat())) frequency.set(term, (frequency.get(term) ?? 0) + 1);
}

export function retrieveEvidence(input: string): Record<string, EvidenceId[]> {
	return Object.fromEntries(
		requirementsFrom(input).map((requirement) => {
			const query = new Set(terms(requirement.text));
			const scores = index
				.map((item) => {
					const matchedTags = item.tags.filter(
						(tag) =>
							tag.every((term) => query.has(term)) ||
							(query.size <= 2 && [...query].every((term) => tag.includes(term)))
					);
					const score = Math.max(
						0,
						...matchedTags.map((tag) =>
							tag
								.filter((term) => query.has(term))
								.reduce(
									(sum, term) => sum + Math.log(1 + evidence.length / (frequency.get(term) ?? 1)),
									0
								)
						)
					);
					return { id: item.id, score };
				})
				.sort((a, b) => b.score - a.score);
			const threshold = (scores[0]?.score ?? 0) * 0.45;
			return [
				requirement.id,
				scores.filter((item) => item.score > 0 && item.score >= threshold).map((item) => item.id)
			];
		})
	);
}

export function resolveRanking(
	value: unknown,
	retrieved: Record<string, EvidenceId[]>,
	input: string
) {
	// Validate model shape and IDs before merging. The model cannot introduce unrelated evidence.
	resolveSelection(value, input);
	const ranking = value as Record<string, EvidenceId[]>;
	const selections = Object.fromEntries(
		Object.entries(retrieved).map(([id, candidates]) => {
			if (ranking[id].some((item) => !candidates.includes(item)))
				throw new Error('Unretrieved evidence.');
			return [id, [...new Set([...ranking[id], ...candidates])]];
		})
	);
	return resolveSelection(selections, input);
}
