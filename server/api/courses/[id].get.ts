import type { Course } from '~/types/strapi/courses';

export default defineEventHandler<Promise<{ res: Course } | null>>(async (event) => {
	const config = useRuntimeConfig();
	const STRAPI = config.strapiUrl;

	const jwt = getCookie(event, 'token');
	if (!jwt) return null;

	const id = getRouterParam(event, 'id');

	try {
		const res = await $fetch<Course>(`${STRAPI}/courses/${id}?populate=*`, {
			headers: { Authorization: `Bearer ${jwt}` },
		});

		return { res };
	} catch (e) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Invalid token',
		});
	}
});
