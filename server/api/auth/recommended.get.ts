import type { CourseList } from '~/types/strapi/courses';

export default defineEventHandler<Promise<{ res: CourseList } | null>>(async (event) => {
	const config = useRuntimeConfig();
	const STRAPI = config.strapiUrl;

	const jwt = getCookie(event, 'token');
	if (!jwt) return null;

	try {
		const res = await $fetch<CourseList>(`${STRAPI}/user/me/recommended?pagination[limit]=4`, {
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
