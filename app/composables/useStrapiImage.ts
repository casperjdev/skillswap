export const useStrapiImage = (path?: string | null) => {
    if (!path) return '';

    // If already a full URL, use as-is
    if (path.startsWith('http')) {
        return `/api/proxy-image?url=${encodeURIComponent(path)}`;
    }

    // Otherwise, construct the Strapi URL
    const strapiUrl = `http://54.38.138.75:1337${path}`;
    return `/api/proxy-image?url=${encodeURIComponent(strapiUrl)}`;
};