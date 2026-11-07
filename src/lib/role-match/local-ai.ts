import { validateMatch } from './evidence';
import type { AIRequest, AIResponse } from './ai-protocol';

// The main thread has no runtime import of WebLLM. All inference stays in this worker.
export async function createLocalAI(onProgress: (progress: number) => void, signal: AbortSignal) {
	const worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' });
	let nextId = 0;
	let closed = false;
	const pending = new Map<
		number,
		{
			resolve: (value: unknown) => void;
			reject: (reason: Error) => void;
			timer: ReturnType<typeof setTimeout>;
		}
	>();
	function dispose() {
		if (closed) return;
		closed = true;
		worker.terminate();
		signal.removeEventListener('abort', dispose);
		for (const request of pending.values()) {
			clearTimeout(request.timer);
			request.reject(new Error('Local AI stopped.'));
		}
		pending.clear();
	}
	worker.onmessage = (event: MessageEvent<AIResponse>) => {
		const message = event.data;
		if (message.type === 'progress') {
			onProgress(message.progress);
			return;
		}
		const request = pending.get(message.id);
		if (!request) return;
		clearTimeout(request.timer);
		pending.delete(message.id);
		if (message.type === 'error') request.reject(new Error(message.message));
		else request.resolve(message.data);
	};
	worker.onerror = dispose;
	signal.addEventListener('abort', dispose, { once: true });
	if (signal.aborted) {
		dispose();
		throw new Error('Local AI stopped.');
	}
	function request(operation: AIRequest['operation'], prompt?: string): Promise<unknown> {
		if (closed) return Promise.reject(new Error('Local AI stopped.'));
		const id = nextId++;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(
				() => {
					dispose();
				},
				operation === 'initialize' ? 600_000 : 90_000
			);
			pending.set(id, { resolve, reject, timer });
			worker.postMessage({ id, operation, prompt } satisfies AIRequest);
		});
	}
	try {
		await request('initialize');
		return {
			dispose,
			get available() {
				return !closed;
			},
			async match(prompt: string) {
				return validateMatch(await request('match', prompt.slice(0, 4000)), prompt);
			}
		};
	} catch (error) {
		dispose();
		throw error instanceof Error ? error : new Error('Local AI could not start.');
	}
}
