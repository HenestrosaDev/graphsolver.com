<script setup lang="ts">
import { computed } from "vue";
import Tooltip from "../common/Tooltip.vue";

// Definimos los temas disponibles
type Theme = "default" | "purple";

interface Props {
	label?: string;
	value?: string | number;
	tooltip?: string;
	variant?: "badge" | "metric";
	theme?: Theme;
	badgeClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "badge",
	theme: "default",
	badgeClass: "bg-slate-50 text-slate-900 border-slate-200",
});

// Mapa de colores por tema
const themeStyles = {
	default: {
		label: "text-slate-600",
		metric: "text-slate-900",
	},
	purple: {
		label: "text-purple-800",
		metric: "text-purple-900",
	},
};

const currentTheme = computed(() => themeStyles[props.theme]);

const valueClasses = computed(() => {
	if (props.variant === "metric") {
		// Usamos el color dinámico del tema
		return `font-bold ${currentTheme.value.metric} break-all`;
	}
	return `text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 ${props.badgeClass}`;
});
</script>

<template>
	<div class="flex justify-between items-baseline gap-4">
		<div v-if="label" class="flex items-center gap-2">
			<span class="text-sm font-medium" :class="currentTheme.label">
				{{ label }}
			</span>

			<Tooltip v-if="tooltip" :text="tooltip" />
		</div>

		<slot>
			<span :class="valueClasses">
				{{ value }}
			</span>
		</slot>
	</div>
</template>
