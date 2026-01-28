<script setup lang="ts">
import { IconLock } from "@tabler/icons-vue";

type Props = {
	isLocked: boolean;
	isFullscreen: boolean;
	showOverlayHint: boolean;
	title: string;
	description: string;
};

defineProps<Props>();

defineEmits<{
	"touch-start": [];
	"touch-end": [];
}>();
</script>

<template>
	<div
		v-if="isLocked && !isFullscreen"
		class="absolute inset-0 z-10 flex touch-pan-y items-center justify-center pb-32 lg:hidden"
		@touchstart="$emit('touch-start')"
		@touchend="$emit('touch-end')"
	>
		<Transition name="fade">
			<div
				v-if="showOverlayHint"
				class="mx-6 flex flex-col items-center justify-center rounded-xl bg-slate-900/70 p-6 text-center text-white shadow-2xl backdrop-blur-[2px] select-none"
			>
				<IconLock class="mb-3 size-10 opacity-90" />
				<p class="text-lg font-bold">
					{{ title }}
				</p>
				<p class="mt-1 text-sm leading-snug text-slate-200">
					{{ description }}
				</p>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translateY(10px) scale(0.95);
}
</style>
