<script setup lang="ts">
import {
	IconZoomOut,
	IconZoomIn,
	IconKeyframeAlignCenter,
	IconCamera,
	IconArrowsMaximize,
	IconArrowsMinimize,
	IconLock,
	IconLockOpen,
} from "@tabler/icons-vue";

const containerBaseClass = [
	"animate-fade-in",
	"absolute",
	"bottom-6",
	"left-1/2",
	"z-20",
	"flex",
	"-translate-x-1/2",
	"items-center",
	"gap-1",
	"rounded-full",
	"border",
	"border-gray-200/80",
	"bg-white/90",
	"p-1.5",
	"shadow-lg",
	"backdrop-blur",
	"transition-all",
	"duration-300",
	"hover:scale-102",
	"hover:shadow-xl",
	"dark:border-slate-700/70",
	"dark:bg-slate-900/85",
].join(" ");

const buttonBaseClass = [
	"rounded-full",
	"p-2",
	"text-gray-500",
	"transition-all",
	"duration-300",
	"hover:bg-blue-50",
	"hover:text-blue-600",
	"dark:text-slate-300",
	"dark:hover:bg-slate-800",
	"dark:hover:text-blue-300",
].join(" ");

const lockButtonClass = "relative";

const lockActiveClass = [
	"bg-blue-50",
	"text-blue-600",
	"ring-1",
	"ring-blue-200",
	"dark:bg-blue-900/30",
	"dark:text-blue-200",
	"dark:ring-blue-700",
].join(" ");

const lockHintClass = [
	"z-50",
	"scale-110",
	"bg-white",
	"shadow-xl",
	"ring-2",
	"ring-blue-400",
	"dark:bg-slate-900",
	"dark:ring-blue-700",
].join(" ");

const fullscreenActiveClass = [
	"bg-blue-50",
	"text-blue-600",
	"ring-1",
	"ring-blue-200",
	"dark:bg-blue-900/40",
	"dark:text-blue-200",
	"dark:ring-blue-700",
].join(" ");

type Props = {
	isLocked: boolean;
	isFullscreen: boolean;
	showOverlayHint: boolean;
	hasTouch: boolean;
	zoomOutLabel: string;
	zoomInLabel: string;
	fitViewLabel: string;
	downloadPngLabel: string;
	fullscreenLabel: string;
};

defineProps<Props>();

defineEmits<{
	"toggle-lock": [];
	"zoom-out": [];
	"zoom-in": [];
	"fit-graph": [];
	"export-image": [];
	"toggle-fullscreen": [];
}>();
</script>

<template>
	<div :class="[containerBaseClass, isFullscreen ? 'max-sm:bottom-16!' : '']">
		<button
			v-if="hasTouch"
			:class="[
				buttonBaseClass,
				lockButtonClass,
				{ [lockActiveClass]: !isLocked, [lockHintClass]: showOverlayHint },
			]"
			@click="$emit('toggle-lock')"
		>
			<span
				v-if="showOverlayHint"
				class="
					absolute inset-0 -z-10 inline-flex h-full w-full animate-ping
					rounded-full bg-blue-400 opacity-75
				"
			/>
			<IconLock
				v-if="isLocked"
				class="size-5"
			/>
			<IconLockOpen
				v-else
				class="size-5"
			/>
		</button>

		<button
			:class="buttonBaseClass"
			:title="zoomOutLabel"
			@click="$emit('zoom-out')"
		>
			<IconZoomOut class="size-5" />
		</button>

		<button
			:class="buttonBaseClass"
			:title="zoomInLabel"
			@click="$emit('zoom-in')"
		>
			<IconZoomIn class="size-5" />
		</button>

		<button
			:class="buttonBaseClass"
			:title="fitViewLabel"
			@click="$emit('fit-graph')"
		>
			<IconKeyframeAlignCenter class="size-5" />
		</button>

		<button
			:class="buttonBaseClass"
			:title="downloadPngLabel"
			@click="$emit('export-image')"
		>
			<IconCamera class="size-5" />
		</button>

		<button
			:class="[buttonBaseClass, { [fullscreenActiveClass]: isFullscreen }]"
			:title="fullscreenLabel"
			@click="$emit('toggle-fullscreen')"
		>
			<IconArrowsMaximize
				v-if="!isFullscreen"
				class="size-5"
			/>
			<IconArrowsMinimize
				v-else
				class="size-5"
			/>
		</button>
	</div>
</template>
