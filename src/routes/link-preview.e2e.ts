import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const origin = 'http://localhost:4173';
const videoPath = '/share/hw.mp4';

// Exercise HTTP delivery, since Apple's preview loader rejects this video when
// a host ignores its Range request, even though a full-file download plays.
test('preview video supports full downloads and HEAD', async ({ request }) => {
	const expected = await readFile('src/lib/server/assets/hw-preview.mp4');
	const response = await request.get(origin + videoPath);
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toBe('video/mp4');
	expect(response.headers()['cache-control']).toContain('no-transform');
	expect(await response.body()).toEqual(expected);
	const head = await request.head(origin + videoPath);
	expect(head.status()).toBe(200);
	expect(head.headers()['content-length']).toBe(String(expected.length));
	expect(head.headers()['accept-ranges']).toBe('bytes');
	expect((await head.body()).length).toBe(0);
});

test('preview video returns the requested byte ranges', async ({ request }) => {
	const expected = await readFile('src/lib/server/assets/hw-preview.mp4');
	for (const [range, start, end] of [
		['bytes=0-1', 0, 1],
		['bytes=1024-2047', 1024, 2047],
		['bytes=-32', expected.length - 32, expected.length - 1],
		[`bytes=${expected.length - 32}-`, expected.length - 32, expected.length - 1]
	] as const) {
		const response = await request.get(origin + videoPath, { headers: { Range: range } });
		expect(response.status()).toBe(206);
		expect(response.headers()['content-range']).toBe(`bytes ${start}-${end}/${expected.length}`);
		expect(response.headers()['content-length']).toBe(String(end - start + 1));
		expect(await response.body()).toEqual(expected.subarray(start, end + 1));
	}
});

test('preview video rejects unsatisfiable ranges and respects If-Range', async ({ request }) => {
	const expected = await readFile('src/lib/server/assets/hw-preview.mp4');
	const invalid = await request.get(origin + videoPath, {
		headers: { Range: `bytes=${expected.length}-` }
	});
	expect(invalid.status()).toBe(416);
	expect(invalid.headers()['content-range']).toBe(`bytes */${expected.length}`);
	const changed = await request.get(origin + videoPath, {
		headers: { Range: 'bytes=0-1', 'If-Range': '"old-version"' }
	});
	expect(changed.status()).toBe(200);
	expect(await changed.body()).toEqual(expected);
});
