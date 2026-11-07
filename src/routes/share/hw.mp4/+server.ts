import { read } from '$app/server';
import video from '#lib/server/assets/hw-preview.mp4?url';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	const bytes = await read(video).arrayBuffer();
	const size = bytes.byteLength;
	const headers = new Headers({
		'Content-Type': 'video/mp4',
		'Content-Length': String(size),
		'Accept-Ranges': 'bytes',
		// Apple's preview loader needs byte ranges. Keep proxies from transforming
		// or caching a full response that would swallow subsequent range requests.
		'Cache-Control': 'no-store, no-transform'
	});

	const range = request.headers.get('range');
	// Without a matching validator, If-Range requests receive the full file.
	const match = !request.headers.has('if-range') && range?.match(/^bytes=(\d*)-(\d*)$/);
	if (match && (match[1] || match[2])) {
		const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
		const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
		if (!Number.isSafeInteger(start) || start >= size || start > end) {
			headers.set('Content-Range', `bytes */${size}`);
			headers.set('Content-Length', '0');
			return new Response(null, { status: 416, headers });
		}
		headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
		headers.set('Content-Length', String(end - start + 1));
		return new Response(bytes.slice(start, end + 1), { status: 206, headers });
	}

	return new Response(bytes, { headers });
};

export const HEAD: RequestHandler = async () => {
	const response = read(video);
	await response.body?.cancel();
	return new Response(null, {
		headers: {
			'Content-Type': 'video/mp4',
			'Content-Length': response.headers.get('content-length')!,
			'Accept-Ranges': 'bytes',
			'Cache-Control': 'no-store, no-transform'
		}
	});
};
