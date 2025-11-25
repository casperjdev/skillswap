export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const imageUrl = query.url as string;

	if (!imageUrl) {
		throw createError({
			statusCode: 400,
			statusMessage: 'URL parameter required',
		});
	}

	// Security: Only allow your Strapi server
	if (!imageUrl.startsWith('http://54.38.138.75:1337/')) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Invalid image source',
		});
	}

	try {
		// Use native fetch
		const response = await fetch(imageUrl);

		if (!response.ok) {
			console.error('Fetch failed:', response.status, response.statusText);
			throw createError({
				statusCode: response.status,
				statusMessage: `Image fetch failed: ${response.statusText}`,
			});
		}

		// Get the image as array buffer
		const imageBuffer = await response.arrayBuffer();

		// Get content type
		const contentType = response.headers.get('content-type') || 'image/jpeg';

		// Set response headers
		setResponseHeader(event, 'Content-Type', contentType);
		setResponseHeader(event, 'Content-Length', imageBuffer.byteLength.toString());
		setResponseHeader(event, 'Cache-Control', 'no-cache');

		// Return the buffer directly
		return new Uint8Array(imageBuffer);
	} catch (e: any) {
		console.error('Proxy image error:', e);
		throw createError({
			statusCode: e.statusCode || 500,
			statusMessage: e.statusMessage || 'Failed to fetch image',
		});
	}
});
