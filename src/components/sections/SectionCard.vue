<script setup lang="ts">
defineProps<{
	title: string;
	bodyClass?: string;
}>();
</script>

<template>
	<div
		class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
	>
		<div class="shrink-0 border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800">
			<h3 class="flex items-center gap-2 text-lg font-bold text-slate-700 dark:text-slate-100">
				<slot name="icon" />
				{{ title }}
			</h3>
		</div>

		<div
			class="p-6"
			:class="bodyClass"
		>
			<slot />
		</div>
	</div>
</template>
