export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const imageUrl = query.url as string;

    if (!imageUrl) {
        throw createError({
            statusCode: 400,
            statusMessage: 'URL parameter required'
        });
    }

    // Security: Only allow your Strapi server
    if (!imageUrl.startsWith('http://54.38.138.75:1337/')) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Invalid image source'
        });
    }

    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                statusMessage: 'Image not found'
            });
        }

        const buffer = await response.arrayBuffer();

        setHeader(event, 'Content-Type', response.headers.get('content-type') || 'image/jpeg');
        setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

        return buffer;
    } catch (e: any) {
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || 'Failed to fetch image',
        });
    }
});