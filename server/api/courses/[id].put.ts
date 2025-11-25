import { type Course } from '~/types/strapi/courses';

export default defineEventHandler(async (event) => {
    const { strapiUrl } = useRuntimeConfig();
    const jwt = getCookie(event, 'token');
    const courseId = getRouterParam(event, 'id');

    if (!jwt) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

    const body = await readBody(event);

    try {
        // --- 1) auth & ownership check ---
        const [user, { data: course }] = await Promise.all([
            $fetch<any>(`${strapiUrl}/users/me`, { headers: { Authorization: `Bearer ${jwt}` } }),
            $fetch<{ data: any }>(`${strapiUrl}/courses/${courseId}?populate=authors`, {
                headers: { Authorization: `Bearer ${jwt}` },
            }),
        ]);

        if (!course) throw createError({ statusCode: 404, statusMessage: 'Course not found' });

        const isAuthor = course.authors?.some((a: any) =>
            a.id === user.id || a.documentId === user.documentId
        );
        if (!isAuthor) throw createError({ statusCode: 403, statusMessage: 'Forbidden: You do not own this course' });

        // --- 2) lessons processing: create temp lessons, update existing ones ---
        const validLessonIds: string[] = [];
        const lessons = body.lessons || [];

        for (const l of lessons) {
            // normalize content: remove old inline video marker, then append if provided
            let content = (l.content || '').replace(/<!--\s*videoUrl:\s*[\s\S]*?-->/g, '').trim();
            const videoUrl = (l as any).videoUrl;
            if (videoUrl && String(videoUrl).trim()) content += `\n\n<!-- videoUrl: ${String(videoUrl).trim()} -->`;

            const payload = {
                title: l.title,
                content,
                publishedAt: new Date().toISOString(),
            };

            const isTemp = l.documentId && String(l.documentId).startsWith('temp-');

            if (isTemp) {
                // create new lesson and collect its documentId
                const created = await $fetch<{ data: { documentId: string } }>(`${strapiUrl}/lessons`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${jwt}` },
                    body: { data: payload },
                });
                validLessonIds.push(created.data.documentId);
            } else if (l.documentId) {
                // update existing lesson in-place
                await $fetch(`${strapiUrl}/lessons/${l.documentId}`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${jwt}` },
                    body: { data: payload },
                });
                validLessonIds.push(l.documentId);
            }
        }

        // --- 3) attach lessons to course ---
        const { data } = await $fetch<{ data: Course }>(`${strapiUrl}/courses/${courseId}?populate=lessons`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${jwt}` },
            body: { data: { lessons: validLessonIds } },
        });

        return data;
    } catch (err: any) {
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.statusMessage || err.message || 'Failed to update course',
        });
    }
});
