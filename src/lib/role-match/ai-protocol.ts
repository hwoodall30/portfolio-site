export type AIRequest = { id: number; operation: 'initialize' | 'match'; prompt?: string };
export type AIResponse =
	| { id: number; type: 'progress'; progress: number }
	| { id: number; type: 'complete'; data: unknown }
	| { id: number; type: 'error'; message: string };
