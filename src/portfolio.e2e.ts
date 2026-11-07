import { test, expect, type Page } from '@playwright/test';

async function mockModel(page: Page, response: unknown, stall = false) {
	await page.addInitScript(
		({ response, stall }) => {
			Object.defineProperty(navigator, 'gpu', { value: {}, configurable: true });
			const NativeWorker = window.Worker;
			class SimulatedModelWorker extends EventTarget {
				onmessage: ((event: MessageEvent) => void) | null = null;
				onerror: ((event: ErrorEvent) => void) | null = null;
				postMessage(message: { id: number; operation: string }) {
					if (message.operation === 'initialize')
						Reflect.set(
							window,
							'modelInitializations',
							(Reflect.get(window, 'modelInitializations') ?? 0) + 1
						);
					if (stall) return;
					setTimeout(
						() =>
							this.onmessage?.(
								new MessageEvent('message', {
									data: {
										id: message.id,
										type: 'complete',
										data: message.operation === 'initialize' ? null : response
									}
								})
							),
						0
					);
				}
				terminate() {}
			}
			window.Worker = new Proxy(NativeWorker, {
				construct(target, args) {
					return String(args[0]).includes('ai.worker')
						? new SimulatedModelWorker()
						: Reflect.construct(target, args);
				}
			});
		},
		{ response, stall }
	);
}

test('examples give immediate evidence and gaps without AI downloads', async ({ page }) => {
	const failures: string[] = [],
		modelRequests: string[] = [];
	page.on('pageerror', (error) => failures.push(error.message));
	page.on('request', (request) => {
		if (/huggingface|mlc-ai|ai\.worker/.test(request.url())) modelRequests.push(request.url());
	});
	await page.goto('http://localhost:4173');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('I turn complex');
	await expect(page.locator('.scene-controls')).toHaveCount(1);
	await page.screenshot({ path: test.info().outputPath('desktop.png'), fullPage: true });
	await page.getByRole('button', { name: 'Engineering lead', exact: true }).click();
	await expect(page.getByText('EXAMPLE PREVIEW · NO AI USED')).toBeVisible();
	await expect(page.locator('.connection')).toHaveCount(3);
	await page.getByRole('button', { name: 'A new industry', exact: true }).click();
	await expect(page.locator('.connection')).toHaveCount(2);
	await expect(page.locator('.match-gaps')).toContainText('aviation certification');
	await page.getByLabel('What are you looking for?').fill('My own description');
	await expect(page.locator('.connection')).toHaveCount(0);
	await page.getByLabel('Discover a baseball Easter egg').click();
	await expect(page.getByText('THE SEVENTH-INNING STRETCH')).toBeVisible();
	expect(modelRequests).toEqual([]);
	expect(failures).toEqual([]);
});

test('custom roles get grounded evidence after explicit download consent', async ({ page }) => {
	await mockModel(page, {
		matches: [
			{ evidenceId: 'leadership', requirement: 'mentor a team' },
			{ evidenceId: 'cost', requirement: 'reduce inference costs' }
		],
		gaps: []
	});
	await page.goto('http://localhost:4173');
	await page
		.getByLabel('What are you looking for?')
		.fill('We need someone to mentor a team and reduce inference costs.');
	await page.getByRole('button', { name: 'Match this role' }).click();
	await expect(page.getByText(/roughly 400 MB/)).toBeVisible();
	await expect(page.locator('.connection')).toHaveCount(0);
	await page.getByRole('button', { name: 'Download & match' }).click();
	await expect(page.getByText('LOCAL AI · VERIFY RELEVANCE')).toBeVisible();
	await expect(page.locator('.connection')).toHaveCount(2);
	await expect(page.locator('.connection').last()).toContainText('24%');
	await page.getByRole('link', { name: 'Resume · Zoovu / XGen AI' }).first().click();
	await expect(page).toHaveURL(/#about$/);
});

test('unsupported devices and invalid model output retain the visitor input', async ({ page }) => {
	await page.addInitScript(() =>
		Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true })
	);
	await page.goto('http://localhost:4173');
	await page.getByLabel('What are you looking for?').fill('We need a team lead.');
	await page.getByRole('button', { name: 'Match this role' }).click();
	await page.getByRole('button', { name: 'Download & match' }).click();
	await expect(page.getByText(/Local AI could not start/)).toBeVisible();
	await expect(page.getByLabel('What are you looking for?')).toHaveValue('We need a team lead.');
	await page.getByRole('button', { name: 'Engineering lead', exact: true }).click();
	await expect(page.locator('.connection')).toHaveCount(3);
});

test('ungrounded model output is rejected and an unrelated role can return no matches', async ({
	page
}) => {
	await mockModel(page, {
		matches: [{ evidenceId: 'fictional', requirement: 'team lead' }],
		gaps: []
	});
	await page.goto('http://localhost:4173');
	await page.getByLabel('What are you looking for?').fill('We need a team lead.');
	await page.getByRole('button', { name: 'Match this role' }).click();
	await page.getByRole('button', { name: 'Download & match' }).click();
	await expect(page.getByText(/Local matching failed/)).toBeVisible();
	await page.getByText('Technical details', { exact: true }).click();
	await expect(page.locator('.match-diagnostics')).toContainText('Ungrounded connection');
	await page.getByRole('button', { name: 'Match this role' }).click();
	await expect(page.getByRole('button', { name: 'Download & match' })).toHaveCount(0);
	expect(await page.evaluate(() => Reflect.get(window, 'modelInitializations'))).toBe(1);
	await expect(page.locator('.connection')).toHaveCount(0);
	await expect(page.getByLabel('What are you looking for?')).toHaveValue('We need a team lead.');
	await mockModel(page, { matches: [], gaps: ['aviation certification'] });
	await page.reload();
	await page.getByLabel('What are you looking for?').fill('aviation certification');
	await page.getByRole('button', { name: 'Match this role' }).click();
	await page.getByRole('button', { name: 'Download & match' }).click();
	await expect(page.getByText('No clear connection found.')).toBeVisible();
	await expect(page.locator('.match-gaps')).toContainText('aviation certification');
});

test('a download can be canceled without losing the description', async ({ page }) => {
	await mockModel(page, null, true);
	await page.goto('http://localhost:4173');
	await page.getByLabel('What are you looking for?').fill('Build an AI product.');
	await page.getByRole('button', { name: 'Match this role' }).click();
	await page.getByRole('button', { name: 'Download & match' }).click();
	await page.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(page.getByLabel('What are you looking for?')).toHaveValue('Build an AI product.');
	await expect(page.getByRole('button', { name: 'Match this role' })).toBeEnabled();
});

test('the personal ballpark still supports drag rotation', async ({ page }) => {
	await page.goto('http://localhost:4173');
	await expect(page.locator('.scene-controls')).toHaveCount(1);
	const canvas = page.locator('canvas');
	const before = await canvas.screenshot();
	const bounds = (await canvas.boundingBox())!;
	await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
	await page.mouse.down();
	await page.mouse.move(bounds.x + bounds.width / 2 + 100, bounds.y + bounds.height / 2, {
		steps: 10
	});
	await page.mouse.up();
	expect((await canvas.screenshot()).equals(before)).toBe(false);
});

test('responsive layouts fit and the resume is available', async ({ page, request }) => {
	await page.goto('http://localhost:4173');
	await page.getByRole('button', { name: 'A new industry', exact: true }).click();
	for (const width of [320, 390, 768, 1280]) {
		await page.setViewportSize({ width, height: 844 });
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
		).toBe(false);
	}
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.locator('.scene-controls')).toHaveCount(1);
	await page.screenshot({ path: test.info().outputPath('mobile.png'), fullPage: true });
	const resume = await request.get('http://localhost:4173/Hunter-Woodall-Resume.pdf');
	expect(resume.ok()).toBe(true);
	expect(resume.headers()['content-type']).toContain('application/pdf');
});

// Opt-in: downloads the real model rather than simulating the worker contract.
test('real local model connects a team-lead requirement to evidence', async ({ page }) => {
	test.skip(
		process.env.PORTFOLIO_AI_SMOKE !== '1',
		'Enable the optional model download with PORTFOLIO_AI_SMOKE=1.'
	);
	test.setTimeout(600_000);
	await page.goto('http://localhost:4173');
	const supported = await page.evaluate(async () =>
		Boolean(navigator.gpu && (await navigator.gpu.requestAdapter()))
	);
	test.skip(!supported, 'No usable WebGPU adapter in this browser.');
	await page.getByLabel('What are you looking for?').fill('We need someone to mentor a team.');
	await page.getByRole('button', { name: 'Match this role' }).click();
	await page.getByRole('button', { name: 'Download & match' }).click();
	await expect(page.locator('.match-results > .eyebrow, .match-diagnostics')).toBeVisible({
		timeout: 550_000
	});
	const diagnostic = page.locator('.match-diagnostics pre');
	if (await diagnostic.count())
		throw new Error((await diagnostic.textContent()) ?? 'Local AI failed.');
	await expect(page.locator('.connection').first()).toBeVisible();
	for (const role of [
		'We need TypeScript and React experience.',
		'We need to reduce LLM spending.'
	]) {
		await page.getByLabel('What are you looking for?').fill(role);
		await page.getByRole('button', { name: 'Match this role' }).click();
		await expect(page.locator('.match-results > .eyebrow, .match-diagnostics')).toBeVisible({
			timeout: 90_000
		});
		if (await diagnostic.count())
			throw new Error((await diagnostic.textContent()) ?? 'Local AI failed.');
		await expect(page.locator('.connection').first()).toBeVisible();
		await expect(page.getByRole('button', { name: 'Download & match' })).toHaveCount(0);
	}
});

test('cached weights are visible and clearing removes only this site’s WebLLM caches', async ({
	page
}) => {
	await page.goto('http://localhost:4173');
	await page.evaluate(async () => {
		const cache = await caches.open('webllm/model');
		const base = 'https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC/resolve/main/';
		await cache.put(
			base + 'tensor-cache.json',
			new Response(JSON.stringify({ records: [{ dataPath: 'shard0.bin' }] }))
		);
		await cache.put(base + 'shard0.bin', new Response('test weights'));
		const partial = 'https://huggingface.co/mlc-ai/PartialModel/resolve/main/';
		await cache.put(
			partial + 'tensor-cache.json',
			new Response(JSON.stringify({ records: [{ dataPath: 'missing.bin' }] }))
		);
		for (const name of ['webllm/config', 'webllm/wasm', 'unrelated-site-assets']) {
			await (await caches.open(name)).put('/test-cache-file', new Response('test'));
		}
	});
	await page.reload();
	await page.getByText('Model download & storage', { exact: true }).click();
	await expect(page.getByText('All weight files cached', { exact: false })).toBeVisible();
	await expect(page.getByText('Partial weight download', { exact: false })).toBeVisible();
	await page.getByLabel('What are you looking for?').fill('Mentor a team');
	await page.getByRole('button', { name: 'Match this role' }).click();
	await expect(page.getByRole('button', { name: 'Load & match' })).toBeVisible();
	await page.getByRole('button', { name: 'Not now' }).click();
	await page.getByRole('button', { name: 'Clear downloaded models' }).click();
	await expect(
		page
			.locator('.model-storage')
			.getByText('No model files stored for this site.', { exact: true })
	).toBeVisible();
	expect(await page.evaluate(() => caches.has('webllm/model'))).toBe(false);
	expect(await page.evaluate(() => caches.has('webllm/config'))).toBe(false);
	expect(await page.evaluate(() => caches.has('webllm/wasm'))).toBe(false);
	expect(await page.evaluate(() => caches.has('unrelated-site-assets'))).toBe(true);
});
