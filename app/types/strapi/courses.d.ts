export interface Course {
	id: number;
	documentId: string;
	title: string;
	description: string;
	cover?: StrapiMedia;
	tags: Tag[];
	createdAt: string;
	updatedAt: string;
	lessons?: Lesson[];
}

export interface CourseList {
	data: Course[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

export interface Tag {
	id: number;
	documentId: string;
	label: string;
	createdAt: string;
	updatedAt: string;
}

export interface Lesson {
	id: number;
	documentId: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface StrapiMediaFormat {
	name: string;
	hash: string;
	ext: string;
	mime: string;
	width: number;
	height: number;
	size: number;
	url: string;
}

export interface StrapiMedia {
	id: number;
	name: string;
	alternativeText: string | null;
	caption: string | null;
	width: number;
	height: number;
	formats: Record<string, StrapiMediaFormat> | null;
	hash: string;
	ext: string;
	mime: string;
	size: number;
	url: string;
	previewUrl: string | null;
	provider: string;
	createdAt: string;
	updatedAt: string;
}
