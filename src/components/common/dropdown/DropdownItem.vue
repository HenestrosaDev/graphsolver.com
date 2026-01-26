<script setup lang="ts">
defineProps<{
	active?: boolean;
	danger?: boolean;
}>();
</script>

<template>
	<button
		type="button"
		class="block w-full px-4 py-2 text-left text-sm duration-150"
		:class="[
			danger
				? 'text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30'
				: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 ' +
					'hover:text-slate-900 dark:hover:text-slate-100',
			active ? 'bg-slate-100 font-medium dark:bg-slate-800' : '',
		]"
	>
		<slot />
	</button>
</template>
