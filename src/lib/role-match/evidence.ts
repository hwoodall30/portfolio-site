export type Evidence = {
	id: string;
	title: string;
	fact: string;
	tags: readonly string[];
	href?: `#${string}` | `https://${string}` | `http://${string}`;
	links?: readonly { label: string; href: `https://${string}` }[];
	source?: string;
};

// Add authored experience here. Links and source labels are optional.
export const evidence = [
	{
		id: 'signalflow',
		tags: ['frontend', 'JavaScript', 'UI library', 'signals', 'reactivity', 'interactive widgets'],
		title: 'Building a lightweight reactive UI library',
		fact: 'Created SignalFlow, a JavaScript library that uses signals for fine-grained UI updates at runtime. Enables projects without a framework to add interactive widgets without a build step or heavy framework dependencies.',
		href: 'https://github.com/hwoodall30/SignalFlow',
		source: 'Personal project · SignalFlow'
	},
	{
		id: 'freelance-websites',
		tags: [
			'frontend',
			'web development',
			'websites',
			'freelance',
			'freelance web development',
			'graphic design',
			'client delivery'
		],
		title: 'Delivering websites for freelance clients',
		fact: 'Built websites for a local graphic design company as a freelance developer, including Village Collab and Vote Facts Blount.',
		links: [
			{ label: 'Village Collab', href: 'https://www.village-collab.org/' },
			{ label: 'Vote Facts Blount', href: 'https://votefactsblount.com/' }
		],
		source: 'Freelance work'
	},
	{
		id: 'workout-rivals',
		tags: ['application development', 'fitness', 'fitness competitions', 'statistics tracking'],
		title: 'Building a fitness competition app',
		fact: 'Created Workout Rivals, an application that lets users start fitness competitions with one another and track their workout statistics throughout each competition.',
		href: 'https://workout-rivals.woodallstack.dev/',
		source: 'Personal project · Workout Rivals'
	},
	{
		id: 'golf-app',
		tags: [
			'application development',
			'golf',
			'location data',
			'distance calculations',
			'club recommendations'
		],
		title: 'Turning course location data into golf shot guidance',
		fact: 'Created a golf application that uses location data for a local course to calculate shot distances and recommend clubs for individual shots.',
		href: 'https://golf-app.woodallstack.dev/',
		source: 'Personal project · Golf app'
	},
	{
		id: 'leadership',
		tags: [
			'engineering leadership',
			'engineering management',
			'junior engineers',
			'mentoring',
			'team management',
			'architecture',
			'technical planning'
		],
		title: 'Leading engineers through delivery',
		fact: 'Leads and mentors 10 engineers across experience levels. Serves as primary technical solution designer, translating customer needs into architectures and implementation plans.',
		href: '#about',
		source: 'Resume · Zoovu / XGen AI'
	},
	{
		id: 'generative-ai',
		tags: ['generative AI', 'enterprise search', 'retrieval', 'high traffic'],
		title: 'Building generative AI products',
		fact: 'Leading engineering for Enterprise AI search and retrieval platform serving millions of requests/day for Fortune 500 brands.',
		source: 'Resume · Zoovu / XGen AI'
	},
	{
		id: 'intent',
		tags: [
			'AI agents',
			'natural language filters',
			'catalog data',
			'deterministic filters',
			'product engineering'
		],
		title: 'Turning user intent into reliable AI',
		fact: 'Observed merchandising workflows, then designed and implemented a catalog-grounded agent that translates natural language into deterministic, inspectable filters. Merchandisers could build complex filters independently in minutes.',
		href: '#case-study',
		source: 'Project story · XGen AI'
	},
	{
		id: 'scale',
		tags: [
			'backend',
			'search',
			'recommendations',
			'filtering',
			'faceting',
			'caching',
			'reliability',
			'scale'
		],
		title: 'Building systems that handle real scale',
		fact: 'Built an in-house filtering and faceting engine used by recommendation and search systems serving millions of requests per day. Work includes caching and reliability.',
		href: '#impact',
		source: 'Resume · XGen AI'
	},
	{
		id: 'cost',
		tags: ['LLM', 'inference costs', 'cost optimization', 'generative AI'],
		title: 'Making AI more efficient',
		fact: 'Reduced LLM spending by 24% in 2026. Leads engineering for a generative AI search product.',
		href: '#impact',
		source: 'Resume · Zoovu / XGen AI'
	},
	{
		id: 'frontend',
		tags: [
			'frontend',
			'TypeScript',
			'Svelte',
			'SvelteKit',
			'React',
			'Next.js',
			'Angular',
			'Tailwind',
			'React Native',
			'Playwright',
			'Vitest'
		],
		title: 'Working across modern frontend stacks',
		fact: 'Frontend skills include TypeScript, Svelte/SvelteKit, React/Next.js, Angular, Tailwind and React Native. Testing skills include Playwright and Vitest.',
		href: '#about',
		source: 'Resume · Technical skills'
	},
	{
		id: 'operations',
		tags: [
			'manufacturing',
			'operational dashboards',
			'inventory automation',
			'inventory',
			'process engineering'
		],
		title: 'Connecting software to physical operations',
		fact: 'Worked on an in-house live manufacturing dashboard at Denso. Automated an inventory workflow saving 150 hours a year. Background in mechanical and process engineering.',
		href: '#about',
		source: 'Resume · Denso'
	},
	{
		id: 'data-pipelines',
		tags: ['backend', 'ETL', 'data ingestion', 'data normalization', 'multi-tenant'],
		title: 'Owning multi-tenant data ingestion',
		fact: 'Owns a multi-tenant ETL pipeline that ingests and normalizes customer data from many source formats.',
		source: 'Resume · Zoovu / XGen AI'
	},
	{
		id: 'backend-apis',
		tags: [
			'backend',
			'API development',
			'GraphQL',
			'Go',
			'Python',
			'JavaScript',
			'C#',
			'databases',
			'frontend'
		],
		title: 'Developing customer-facing platforms and APIs',
		fact: 'Developed a customer-facing platform and backend APIs using GraphQL, Go, and Python at XGen AI. Built frontend and backend architectures using JavaScript and C# and administered databases for production applications at Denso.',
		source: 'Resume · XGen AI / Denso'
	},
	{
		id: 'mcp-tooling',
		tags: ['MCP', 'AI tools', 'natural language administration', 'role-scoped access'],
		title: 'Building MCP tools for natural-language administration',
		fact: 'Built an MCP server that gives staff natural-language administrative control and provides customers with role-scoped, read-only access.',
		source: 'Resume · XGen AI'
	},
	{
		id: 'customer-delivery',
		tags: [
			'enterprise customers',
			'implementations',
			'onboarding',
			'cross-functional collaboration',
			'customer feedback',
			'Gucci',
			'Sonos',
			'Coach customer'
		],
		title: 'Guiding enterprise implementations and onboarding',
		fact: 'Leads customer implementations and onboarding, partnering with Product, Design, and Operations to prioritize improvements informed by customer feedback. Led a team delivering AI software to enterprise customers including Gucci, Sonos, and Coach.',
		source: 'Resume · Zoovu / XGen AI'
	}
] as const satisfies readonly Evidence[];
export type EvidenceId = (typeof evidence)[number]['id'];
export type RoleMatch = {
	matches: { evidenceId: EvidenceId; requirement: string }[];
	gaps: string[];
};
export function getEvidence(id: EvidenceId): Evidence {
	return evidence.find((item) => item.id === id)!;
}

// Facts and destinations are authored, never generated. Model text must quote the visitor's input.
export function validateMatch(value: unknown, input: string): RoleMatch {
	if (!value || typeof value !== 'object') throw new Error('Invalid match.');
	const result = value as Record<string, unknown>;
	if (
		!Array.isArray(result.matches) ||
		result.matches.length > evidence.length ||
		!Array.isArray(result.gaps)
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
