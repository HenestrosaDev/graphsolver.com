<script setup lang="ts">
import { computed } from "vue";
import AppTooltip from "../common/AppTooltip.vue";

type CardTheme = "default" | "purple";

interface Props {
	title?: string;
	tooltip?: string;
	theme?: CardTheme;
}

const props = withDefaults(defineProps<Props>(), {
	title: "",
	tooltip: "",
	theme: "default",
});

const styles = {
	default: {
		header: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-100",
		container: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
	},
	purple: {
		header: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100",
		container: "bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-800",
	},
};

const currentStyle = computed(() => styles[props.theme]);
</script>

<template>
	<div
		class="rounded-lg border text-slate-800 shadow-sm dark:text-slate-100"
		:class="currentStyle.container"
	>
		<div
			class="rounded-t-lg"
			:class="currentStyle.header"
		>
			<div class="flex justify-between px-4 py-3">
				<div
					class="flex flex-1 shrink-0 items-center gap-2 text-xs font-bold tracking-wide uppercase"
					:class="currentStyle.header"
				>
					<slot name="header">
						{{ title }}
					</slot>
				</div>

				<AppTooltip
					v-if="tooltip"
					:text="tooltip"
				/>
			</div>
		</div>

		<div class="rounded-b-lg">
			<div class="space-y-2 px-4 py-3">
				<slot />
			</div>
		</div>
	</div>
</template>
