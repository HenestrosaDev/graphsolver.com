<script setup lang="ts">
import GraphLogo from "./GraphLogo.vue";

interface Props {
	logoSize?: string;
}

const props = withDefaults(defineProps<Props>(), {
	logoSize: "size-6",
});
</script>

<template>
	<div class="flex items-center gap-2">
		<GraphLogo :class="props.logoSize" />
		<span class="font-['Outfit'] text-[1.33rem] font-bold tracking-tight text-slate-800 dark:text-slate-100">
			Graph<span class="text-blue-500">Solver</span>
		</span>
	</div>
</template>
