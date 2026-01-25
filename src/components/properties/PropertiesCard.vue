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
		header: "bg-slate-50",
		container: "bg-white border-slate-200",
	},
	purple: {
		header: "bg-purple-100 text-purple-700",
		container: "bg-purple-50 border-purple-100",
	},
};

const currentStyle = computed(() => styles[props.theme]);
</script>

<template>
	<div
		class="rounded-lg shadow-sm border transition-colors"
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
