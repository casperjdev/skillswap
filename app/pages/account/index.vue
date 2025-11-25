<script setup lang="ts">
import type { Tag, TagList } from '~/types/strapi/courses';

definePageMeta({
	layout: 'dashboard',
});

const { user, logout } = useAuth();

const toast = useToast();

const currentData = ref({
	username: user.value?.username,
	email: user.value?.email,
	tags: user.value?.tags,
});

const editing = ref(false);

let tags = ref<Tag[]>();

async function edit() {
	if (!tags.value) {
		const res = await $fetch('/api/tags');
		tags.value = res?.res.data;
	}

	editing.value = true;
}

function toggleTag(tag: string) {
	const newTag = tags.value?.find((el) => el.label === tag);
	if (!newTag) return;

	const tagsArr = currentData.value.tags ?? [];

	const index = tagsArr.findIndex((el) => el.label === newTag.label);

	if (index === -1) {
		// Add tag
		tagsArr.push(newTag);
	} else {
		// Remove tag
		tagsArr.splice(index, 1);
	}

	currentData.value.tags = tagsArr;

	currentData.value.tags;
}

async function save() {
	const res = await $fetch('/api/auth/me', {
		method: 'POST',
		body: {
			username: currentData.value.username,
			email: currentData.value.email,
			tags: currentData.value.tags,
		},
	});

	if (!res) {
		toast.error({ title: 'Error!', message: 'Unable to edit profile' });
	} else {
		toast.success({ title: 'Success!', message: 'Changes saved successfully.' });
	}

	editing.value = false;
}

function cancel() {
	currentData.value = {
		username: user.value?.username,
		email: user.value?.email,
		tags: user.value?.tags,
	};

	currentData;

	editing.value = false;
}
</script>

<template>
	<div class="h-[calc(100svh-128px)] flex flex-col items-center max-w-xs gap-2 mx-auto">
		<h1 class="text-neutral-50 font-extrabold text-center">Your Account</h1>
		<Card
			class="w-full backdrop-blur-sm bg-black/10! text-neutral-950/10! flex flex-col gap-2 flex-1">
			<form @submit.prevent class="w-full h-full flex flex-col gap-2">
				<div>
					<h1 class="text-2xs text-neutral-200">Username</h1>
					<p v-show="!editing" class="sm:text-xs text-2xs text-neutral-50 font-extrabold">
						{{ user?.username }}
					</p>
					<input
						v-show="editing"
						v-model="currentData.username"
						type="text"
						name="username"
						placeholder="Username"
						id="username"
						class="w-full rounded-md p-1 text-white font-light text-2xs backdrop-blur-[1px] bg-neutral-50/5 border border-neutral-200/80" />
				</div>
				<div>
					<h1 class="text-2xs text-neutral-200">E-mail</h1>
					<p v-show="!editing" class="sm:text-xs text-2xs text-neutral-50 font-extrabold">
						{{ user?.email }}
					</p>
					<input
						v-show="editing"
						v-model="currentData.email"
						type="email"
						name="email"
						placeholder="E-Mail"
						id="email"
						class="w-full rounded-md p-1 text-white font-light text-2xs backdrop-blur-[1px] bg-neutral-50/5 border border-neutral-200/80" />
				</div>
				<div class="mt-8 text-center">
					<h1 class="text-2xs text-neutral-200 mb-2">
						{{ editing ? 'Select some tags' : 'Things that you like' }}
					</h1>
					<div
						v-show="editing && tags"
						class="flex flex-row gap-2 flex-wrap justify-center items-center max-h-40 overflow-y-scroll">
						<span
							v-for="tag in tags"
							:class="[
								currentData.tags?.find((el) => el.label == tag.label)
									? 'text-neutral-950 bg-neutral-50'
									: 'bg-white/20 text-white',
							]"
							class="text-2xs px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-2 h-fit whitespace-nowrap shrink-0 cursor-pointer"
							@click="() => toggleTag(tag.label)">
							{{ tag.label }}
						</span>
					</div>
					<p
						v-show="!editing && user?.tags.length == 0"
						class="sm:text-xs text-2xs text-neutral-200">
						You do not have any tags set.
					</p>
					<div
						v-show="!editing && user?.tags.length != 0"
						class="flex flex-row gap-2 flex-wrap justify-center items-center max-h-40 overflow-y-scroll">
						<span
							v-for="tag in user?.tags"
							class="bg-white/20 text-2xs text-white px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-2 h-fit whitespace-nowrap shrink-0 cursor-pointer">
							{{ tag.label }}
						</span>
					</div>
				</div>

				<div v-show="!editing" class="w-full mt-auto flex flex-col gap-2">
					<Button class="w-full!" variant="solid" @click="edit()">Edit</Button>

					<Button
						class="w-full! text-red-400! hover:text-red-300 transition-colors"
						variant="clear"
						@click="logout()">
						Log out
					</Button>
				</div>

				<div v-show="editing" class="w-full flex flex-row gap-2 mt-auto">
					<Button class="w-full!" variant="clear" @click="cancel()">Cancel</Button>
					<Button class="w-full!" variant="solid" @click="save()">Save</Button>
				</div>
			</form>
		</Card>
	</div>
</template>
