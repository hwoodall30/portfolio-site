/* eslint-disable @typescript-eslint/no-explicit-any -- Preserve the existing generic result helper contract. */
// --- Attempt ---
type AttemptSuccess<T> = { data: T; error: null };
type AttemptFailure<E> = { data: null; error: E };
type AttemptResult<E, T> = AttemptSuccess<T> | AttemptFailure<E>;
type AttemptResultAsync<E, T> = Promise<AttemptResult<E, T>>;

export function attempt<E = Error, T = any>(operation: () => Promise<T>): AttemptResultAsync<E, T>;
export function attempt<E = Error, T = any>(operation: () => T): AttemptResult<E, T>;
export function attempt<E = Error, T = any>(
	operation: () => T | Promise<T>
): AttemptResult<E, T> | AttemptResultAsync<E, T> {
	try {
		const result = operation();

		if (isPromiseLike(result)) {
			return result
				.then((data) => ({ data, error: null }) as const)
				.catch((err) => ({ data: null, error: err?.toString() as E }) as const);
		}

		return { data: result, error: null } as const;
	} catch (err) {
		if (err instanceof Error) {
			return { data: null, error: err.message as E } as const;
		}
		return { data: null, error: err?.toString() as E } as const;
	}
}

export function isPromiseLike<T>(value: T | PromiseLike<T>): value is PromiseLike<T> {
	return (
		value !== null &&
		(typeof value === 'object' || typeof value === 'function') &&
		'then' in value &&
		typeof value.then === 'function'
	);
}
