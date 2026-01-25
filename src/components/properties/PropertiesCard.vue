<script setup lang="ts">
import { computed } from "vue";
import Tooltip from "../common/Tooltip.vue";

type CardTheme = "default" | "purple";

interface Props {
	title?: string;
	tooltip?: string;
	theme?: CardTheme;
}

const props = withDefaults(defineProps<Props>(), {
	theme: "default",
});

const styles = {
	default: {
		header: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-100",
		container:
			"bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
	},
	purple: {
		header:
			"bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100",
		container:
			"bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-800",
	},
};

const currentStyle = computed(() => styles[props.theme]);
</script>

<template>
	<div
		class="rounded-lg shadow-sm border  text-slate-800 dark:text-slate-100"
		:class="currentStyle.container"
	>
		<div class="rounded-t-lg" :class="currentStyle.header">
			<div class="px-4 py-3 flex justify-between">
				<div
					class="text-xs font-bold uppercase tracking-wide shrink-0 flex items-center gap-2 flex-1"
					:class="currentStyle.header"
				>
					<slot name="header">
						{{ title }}
					</slot>
				</div>

				<Tooltip v-if="tooltip" :text="tooltip" />
			</div>
		</div>

		<div class="rounded-b-lg">
			<div class="px-4 py-3 space-y-2">
				<slot />
			</div>
		</div>
	</div>
</template>
