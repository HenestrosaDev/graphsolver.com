<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
	label?: string;
	isOpen: boolean;
	menuClass?: string;
	align?: "left" | "right";
}>();

const _emit = defineEmits(["toggle", "close"]);

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
	},
);
</script>

<template>
	<div
		ref="containerRef"
		class="relative"
	>
		<button
			class="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
			:class="{ 'bg-slate-50 dark:bg-slate-800': isOpen }"
			:title="label"
			@click="$emit('toggle')"
		>
			<div class="text-slate-500 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-300">
				<slot name="icon" />
			</div>
			<span
				v-if="label"
				class="hidden sm:inline"
			>{{ label }}</span>
		</button>

		<Transition name="menu">
			<div
				v-if="isOpen"
				class="absolute top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
				:class="[
					menuClass || 'w-40',
					calculatedAlign === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
				]"
			>
				<slot />
			</div>
		</Transition>

		<div
			v-if="isOpen"
			class="fixed inset-0 z-20 cursor-default bg-transparent"
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
