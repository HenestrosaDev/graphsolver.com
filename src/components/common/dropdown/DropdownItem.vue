<script setup lang="ts">
defineProps<{
	active?: boolean;
	danger?: boolean;
}>();
</script>

<template>
	<button
		type="button"
		class="block w-full text-left px-4 py-2 text-sm transition-colors duration-150"
		:class="[
			danger
				? 'text-red-600 hover:bg-red-50'
				: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
			active ? 'bg-slate-100 font-medium' : '',
		]"
	>
		<slot />
	</button>
</template>
