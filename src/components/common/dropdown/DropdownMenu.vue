<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
	label?: string;
	isOpen: boolean;
	menuClass?: string;
	align?: "left" | "right";
}>();

const emit = defineEmits(["toggle", "close"]);

const containerRef = ref<HTMLElement | null>(null);
const calculatedAlign = ref<"left" | "right">("left");

watch(
	() => props.isOpen,
	async (newValue) => {
		if (newValue && containerRef.value) {
			// Get the button's position
			const rect = containerRef.value.getBoundingClientRect();
			const windowWidth = window.innerWidth;

			// If there is a a manual alignment defined, use it.
			if (props.align) {
				calculatedAlign.value = props.align;
				return;
			}

			// If the left edge of the button is beyond 50% of the screen,
			// we assume it's better to align to the right.
			if (rect.left > windowWidth / 2) {
				calculatedAlign.value = "right";
			} else {
				calculatedAlign.value = "left";
			}
		}
	}
);
</script>

<template>
	<div ref="containerRef" class="relative">
		<button
			@click="$emit('toggle')"
			class="text-sm bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium py-2 px-3 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 group relative"
			:class="{ 'bg-slate-50 dark:bg-slate-800': isOpen }"
			:title="label"
		>
			<div class="text-slate-500 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
				<slot name="icon" />
			</div>
			<span v-if="label" class="hidden sm:inline">{{ label }}</span>
		</button>

		<Transition name="menu">
			<div
				v-if="isOpen"
				class="absolute top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-30"
				:class="[
					menuClass || 'w-40',
					calculatedAlign === 'right'
						? 'right-0 origin-top-right'
						: 'left-0 origin-top-left',
				]"
			>
				<slot />
			</div>
		</Transition>

		<div
			v-if="isOpen"
			class="fixed inset-0 z-20 bg-transparent cursor-default"
			@click="$emit('close')"
		/>
	</div>
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active {
	transition: all 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}
</style>
