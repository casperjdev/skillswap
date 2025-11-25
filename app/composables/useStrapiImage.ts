export const useStrapiImage = (path?: string | null) => {
    if (!path) return '';

    // Construct the full Strapi URL
    let fullUrl: string;
    if (path.startsWith('http')) {
        fullUrl = path;
    } else {
        fullUrl = `http://54.38.138.75:1337${path.startsWith('/') ? path : '/' + path}`;
    }
    fetch(fullUrl, { method: 'GET' }).catch(() => {});
    // Return the proxy URL with encoded parameter
    return `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`;
};