export const evidence = [
	{
		id: 'leadership',
		title: 'Leading engineers through delivery',
		fact: 'Leads and mentors 10 engineers across experience levels. Serves as primary technical solution designer, translating customer needs into architectures and implementation plans.',
		href: '#about',
		source: 'Resume · Zoovu / XGen AI'
	},
	{
		id: 'intent',
		title: 'Turning user intent into reliable AI',
		fact: 'Observed merchandising workflows, then designed and implemented a catalog-grounded agent that translates natural language into deterministic, inspectable filters. Merchandisers could build complex filters independently in minutes.',
		href: '#case-study',
		source: 'Project story · XGen AI'
	},
	{
		id: 'scale',
		title: 'Building systems that handle real scale',
		fact: 'Built an in-house filtering and faceting engine used by recommendation and search systems serving millions of requests per day. Work includes caching and reliability.',
		href: '#impact',
		source: 'Resume · XGen AI'
	},
	{
		id: 'cost',
		title: 'Making AI more efficient',
		fact: 'Reduced LLM spending by 24% in 2026. Leads engineering for a generative AI search product.',
		href: '#impact',
		source: 'Resume · Zoovu / XGen AI'
	},
	{
		id: 'frontend',
		title: 'Working across modern frontend stacks',
		fact: 'Frontend skills include TypeScript, Svelte/SvelteKit, React/Next.js, Angular, Tailwind and React Native. Testing skills include Playwright and Vitest.',
		href: '#about',
		source: 'Resume · Technical skills'
	},
	{
		id: 'operations',
		title: 'Connecting software to physical operations',
		fact: 'Worked on an in-house live manufacturing dashboard at Denso. Automated an inventory workflow saving 150 hours a year. Background in mechanical and process engineering.',
		href: '#about',
		source: 'Resume · Denso'
	}
] as const;
export type EvidenceId = (typeof evidence)[number]['id'];
export type RoleMatch = {
	matches: { evidenceId: EvidenceId; requirement: string }[];
	gaps: string[];
};
export function getEvidence(id: EvidenceId) {
	return evidence.find((item) => item.id === id)!;
}

// Facts and destinations are authored, never generated. Model text must quote the visitor's input.
export function validateMatch(value: unknown, input: string): RoleMatch {
	if (!value || typeof value !== 'object') throw new Error('Invalid match.');
	const result = value as Record<string, unknown>;
	if (
		!Array.isArray(result.matches) ||
		result.matches.length > 3 ||
		!Array.isArray(result.gaps) ||
		result.gaps.length > 3
	)
		throw new Error('Invalid result structure.');
	const quoted = (text: unknown): text is string =>
		typeof text === 'string' &&
		text.trim().length > 0 &&
		text.length <= 300 &&
		input.includes(text);
	const seen = new Set<string>();
	const matches = result.matches.map((item: unknown) => {
		if (!item || typeof item !== 'object') throw new Error('Invalid connection.');
		const match = item as Record<string, unknown>;
		if (
			!evidence.some((e) => e.id === match.evidenceId) ||
			!quoted(match.requirement) ||
			seen.has(String(match.evidenceId))
		)
			throw new Error('Ungrounded connection.');
		seen.add(String(match.evidenceId));
		return { evidenceId: match.evidenceId as EvidenceId, requirement: match.requirement };
	});
	if (!result.gaps.every(quoted)) throw new Error('Ungrounded gap.');
	return { matches, gaps: [...new Set(result.gaps as string[])] };
}

export const roleExamples: { label: string; input: string; result: RoleMatch }[] = [
	{
		label: 'Engineering lead',
		input:
			'We need an engineering lead to mentor a team, turn customer needs into architecture, and ship dependable systems at scale.',
		result: {
			matches: [
				{ evidenceId: 'leadership', requirement: 'mentor a team' },
				{ evidenceId: 'intent', requirement: 'turn customer needs into architecture' },
				{ evidenceId: 'scale', requirement: 'ship dependable systems at scale' }
			],
			gaps: []
		}
	},
	{
		label: 'AI product engineer',
		input:
			'We need someone to build reliable AI experiences, reduce inference costs, and work in TypeScript and React.',
		result: {
			matches: [
				{ evidenceId: 'intent', requirement: 'build reliable AI experiences' },
				{ evidenceId: 'cost', requirement: 'reduce inference costs' },
				{ evidenceId: 'frontend', requirement: 'TypeScript and React' }
			],
			gaps: []
		}
	},
	{
		label: 'A new industry',
		input:
			'We are building manufacturing tools and need experience with operational dashboards, frontend engineering, and aviation certification.',
		result: {
			matches: [
				{ evidenceId: 'operations', requirement: 'operational dashboards' },
				{ evidenceId: 'frontend', requirement: 'frontend engineering' }
			],
			gaps: ['aviation certification']
		}
	}
];
