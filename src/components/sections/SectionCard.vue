<script setup lang="ts">
defineProps<{
	title: string;
	bodyClass?: string;
}>();
</script>

<template>
	<div
		class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden "
	>
		<div class="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
			<h3 class="text-lg font-bold text-slate-700 dark:text-slate-100 flex items-center gap-2">
				<slot name="icon"></slot>
				{{ title }}
			</h3>
		</div>

		<div class="p-6" :class="bodyClass">
			<slot />
		</div>
	</div>
</template>
