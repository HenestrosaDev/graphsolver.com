// eslint-disable-next-line vue/multi-word-component-names
<script setup lang="ts">
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-vue";
import { computed } from "vue";

interface Props {
	totalSteps: number;
	currentStepIndex: number;
	title: string;
	description: string;
	stepCounter: string;
	isDark: boolean;
	prevTitle: string;
	nextTitle: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	"update:current-step-index": [value: number];
}>();

const progressPercentage = computed(() => {
	if (props.totalSteps <= 1) return 0;
	return (props.currentStepIndex / (props.totalSteps - 1)) * 100;
});

const rangeStyle = computed(() => {
	const progressColor = props.isDark ? "rgb(96 165 250)" : "rgb(37 99 235)"; // blue-400 in dark, blue-600 in light
	const remainingColor = props.isDark ? "rgb(71 85 105)" : "rgb(203 213 225)"; // slate-500 in dark, slate-200 in light

	const gradient = `linear-gradient(to right,
		${progressColor} 0%,
		${progressColor} ${progressPercentage.value}%,
		${remainingColor} ${progressPercentage.value}%,
		${remainingColor} 100%)`;

	return {
		background: gradient,
	};
});

const nextStep = () => {
	if (props.currentStepIndex < props.totalSteps - 1) {
		emit("update:current-step-index", props.currentStepIndex + 1);
	}
};

const prevStep = () => {
	if (props.currentStepIndex > 0) {
		emit("update:current-step-index", props.currentStepIndex - 1);
	}
};

// Styles
const buttonStyle =
	"rounded-full border border-transparent p-1.5 text-slate-500 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:border-transparent disabled:hover:shadow-none dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900";
</script>

<template>
	<div
		v-if="totalSteps > 0"
		class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
	>
		<div class="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800">
			<div class="flex flex-col items-center">
				<span
					class="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase dark:bg-blue-900/40 dark:text-blue-200"
				>
					{{ stepCounter }}
				</span>

				<h3 class="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100">
					{{ title }}
				</h3>

				<div class="-mb-1 flex w-full max-w-md items-center justify-center gap-3">
					<button
						:disabled="currentStepIndex === 0"
						:class="buttonStyle"
						:title="prevTitle"
						@click="prevStep"
					>
						<IconChevronLeft class="size-6" />
					</button>

					<div class="relative mx-2 flex flex-1 items-center">
						<input
							:value="currentStepIndex"
							type="range"
							min="0"
							:max="totalSteps - 1"
							:style="rangeStyle"
							class="h-2 w-full cursor-pointer appearance-none rounded-lg accent-blue-600 hover:accent-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
							@input="emit('update:current-step-index', parseInt(($event.target as HTMLInputElement).value))"
						>
					</div>

					<button
						:disabled="currentStepIndex === totalSteps - 1"
						:class="buttonStyle"
						:title="nextTitle"
						@click="nextStep"
					>
						<IconChevronRight class="size-6" />
					</button>
				</div>
			</div>
		</div>

		<div class="min-h-[300px] w-full overflow-x-auto bg-white p-6 transition-all duration-300 dark:bg-slate-900">
			<slot />
		</div>

		<div
			class="border-t border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
		>
			<span>{{ description }}</span>
		</div>
	</div>
</template>
