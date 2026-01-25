<script setup lang="ts">
import Logo from "./Logo.vue";

interface Props {
	logoSize?: string;
}

const props = withDefaults(defineProps<Props>(), {
	logoSize: "size-6",
});
</script>

<template>
	<div class="flex items-center gap-2">
		<Logo :class="props.logoSize" />
		<span
			class="text-[1.33rem] font-bold text-slate-800 dark:text-slate-100 tracking-tight font-['Outfit']"
		>
			Graph<span class="text-blue-500">Solver</span>
		</span>
	</div>
</template>
