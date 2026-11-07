export type ModelCache = { files: number; models: { name: string; complete: boolean }[] };
const modelCaches = ['webllm/model', 'webllm/config', 'webllm/wasm'];

// Inspect only local storage. This never downloads model files or imports WebLLM.
export async function inspectModelCache(): Promise<ModelCache> {
	const names = await caches.keys();
	let files = 0;
	const models: ModelCache['models'] = [];
	for (const name of modelCaches.filter((name) => names.includes(name))) {
		const cache = await caches.open(name);
		const requests = await cache.keys();
		files += requests.length;
		if (name !== 'webllm/model') continue;
		for (const request of requests.filter((r) =>
			new URL(r.url).pathname.endsWith('/tensor-cache.json')
		)) {
			const response = await cache.match(request);
			const manifest: unknown = await response?.json();
			const records =
				manifest && typeof manifest === 'object' && 'records' in manifest ? manifest.records : null;
			let complete = Array.isArray(records) && records.length > 0;
			if (Array.isArray(records)) {
				for (const record of records) {
					if (
						!record ||
						typeof record.dataPath !== 'string' ||
						!(await cache.match(new URL(record.dataPath, request.url)))
					) {
						complete = false;
						break;
					}
				}
			}
			const segments = new URL(request.url).pathname.split('/');
			const modelIndex = segments.indexOf('resolve') - 1;
			models.push({
				name: modelIndex >= 0 ? segments[modelIndex] : (segments.at(-2) ?? 'Model'),
				complete
			});
		}
	}
	return { files, models };
}

// Clear all WebLLM model, config and runtime caches for this origin only.
export async function clearModelCache() {
	const names = await caches.keys();
	await Promise.all(
		modelCaches.filter((name) => names.includes(name)).map((name) => caches.delete(name))
	);
}
