<script setup lang="ts">
import { computed } from "vue";
import AppTooltip from "../common/AppTooltip.vue";

type Variant = "badge" | "metric";
type Theme = "default" | "purple";

interface Props {
	label?: string;
	value?: string | number;
	tooltip?: string;
	variant?: Variant;
	theme?: Theme;
	badgeClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	label: "",
	value: "",
	tooltip: "",
	variant: "badge",
	theme: "default",
	badgeClass: "bg-slate-50 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700",
});

const themeStyles = {
	default: {
		label: "text-slate-600 dark:text-slate-300",
		metric: "text-slate-900 dark:text-slate-100",
	},
	purple: {
		label: "text-purple-800 dark:text-purple-100",
		metric: "text-purple-900 dark:text-purple-100",
	},
};

const currentTheme = computed(() => themeStyles[props.theme]);

const valueClasses = computed(() => {
	if (props.variant === "metric") {
		return `font-bold break-all ${currentTheme.value.metric} text-right`;
	}
	return `text-xs text-center font-bold px-3 py-1 rounded-full flex items-center gap-2 ${props.badgeClass}`;
});
</script>

<template>
	<div class="flex items-baseline justify-between gap-4">
		<div
			v-if="label"
			class="flex items-center gap-2"
		>
			<span
				class="text-sm font-medium"
				:class="currentTheme.label"
			>
				{{ label }}
			</span>
			<slot name="label" />
			<AppTooltip
				v-if="tooltip"
				:text="tooltip"
			/>
		</div>

		<slot>
			<span :class="valueClasses">
				{{ value }}
			</span>
		</slot>
	</div>
</template>
