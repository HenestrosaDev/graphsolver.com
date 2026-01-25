<script setup lang="ts">
defineProps<{
	title: string;
	bodyClass?: string;
}>();
</script>

<template>
	<div
		class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
	>
		<div class="bg-slate-50 px-6 py-4 border-b border-slate-200 shrink-0">
			<h3 class="text-lg font-bold text-slate-700 flex items-center gap-2">
				<slot name="icon"></slot>
				{{ title }}
			</h3>
		</div>

		<div class="p-6" :class="bodyClass">
			<slot />
		</div>
	</div>
</template>
