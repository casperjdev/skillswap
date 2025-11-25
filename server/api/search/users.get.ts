import { type StrapiUser } from '~/types/strapi/auth';

export default defineEventHandler<Promise<{ users: StrapiUser[] } | null>>(async (event) => {
	const config = useRuntimeConfig();
	const STRAPI = config.strapiUrl;

	const jwt = getCookie(event, 'token');
	if (!jwt) return null;

	const query = getQuery(event);

	try {
		const users = await $fetch<StrapiUser[]>(`${STRAPI}/users/search?populate=tags&q=${query.q}`, {
			headers: { Authorization: `Bearer ${jwt}` },
		});

		return { users };
	} catch (e) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Invalid token',
		});
	}
});
