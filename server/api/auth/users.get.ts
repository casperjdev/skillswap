import { type StrapiUser } from '~/types/strapi/auth';

export default defineEventHandler<Promise<{ users: StrapiUser[] } | null>>(async (event) => {
	const config = useRuntimeConfig();
	const STRAPI = config.strapiUrl;

	const jwt = getCookie(event, 'token');
	if (!jwt) return null;

	try {
		const users = await $fetch<StrapiUser[]>(`${STRAPI}/users?populate=tags`, {
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
