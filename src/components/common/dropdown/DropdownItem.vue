<script setup lang="ts">
defineProps<{
	active?: boolean;
	danger?: boolean;
}>();
</script>

<template>
	<button
		type="button"
		class="block w-full text-left px-4 py-2 text-sm  duration-150"
		:class="[
			danger
				? 'text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30'
				: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
			active ? 'bg-slate-100 dark:bg-slate-800 font-medium' : '',
		]"
	>
		<slot />
	</button>
</template>
