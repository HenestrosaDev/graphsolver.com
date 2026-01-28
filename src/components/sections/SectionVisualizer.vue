<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useGraph } from "../../composables/useGraph";
import { useToast } from "../../composables/useToast";
import { useTheme } from "../../composables/useTheme";
import { useTouch } from "../../composables/useTouch";
import { useGraphVisualizer } from "../../composables/useGraphVisualizer";
import VisualizerControls from "../visualizer/VisualizerControls.vue";
import VisualizerTouchHint from "../visualizer/VisualizerTouchHint.vue";

const { getGraphData, nodes, highlightedPath } = useGraph();
const { triggerToast } = useToast();
const { isDark } = useTheme();
const { hasTouch } = useTouch();
const { t } = useI18n();

const $networkContainer = ref<HTMLElement | null>(null);
const $wrapper = ref<HTMLElement | null>(null);

// States
const isLocked = ref(true);
const isFullscreen = ref(false);
const showOverlayHint = ref(false);
let overlayTimeout: number | null = null;

// --- TOUCH INTERACTIONS ---
// When touching the screen
const handleTouchStart = () => {
	if (overlayTimeout) clearTimeout(overlayTimeout);
	showOverlayHint.value = true;
};

// When lifting the finger
const handleTouchEnd = () => {
	overlayTimeout = window.setTimeout(() => {
		showOverlayHint.value = false;
	}, 300);
};

// --- Lock / Unlock ---
const {
	setInteractionLocked,
	zoomIn,
	zoomOut,
	fitGraph,
	exportImage,
	resizeAndFit,
} = useGraphVisualizer({
	containerRef: $networkContainer,
	wrapperRef: $wrapper,
	getGraphData,
	nodes,
	highlightedPath,
	isDark,
});

const toggleLock = () => {
	isLocked.value = !isLocked.value;
	if (!isLocked.value) showOverlayHint.value = false;

	setInteractionLocked(isLocked.value);

	const msg = isLocked.value ? t("visualizer.scrollMode") : t("visualizer.interactionMode");
	triggerToast({ title: msg, severity: "info" });
};

const handleExportImage = () => {
	const didExport = exportImage();
	if (didExport) {
		triggerToast({ title: t("visualizer.imageDownloaded"), severity: "success" });
	}
};

// --- Fullscreen ---
const toggleFullscreen = async () => {
	isFullscreen.value = !isFullscreen.value;

	// Wait for the Teleport to move the DOM and Vue to update classes
	await nextTick();
	resizeAndFit();
};

const handleKeydown = (e: KeyboardEvent) => {
	if (e.key === "Escape" && isFullscreen.value) {
		toggleFullscreen();
	}
};

onMounted(() => {
	window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
	<div class="relative h-full min-h-137.5 w-full">
		<Teleport
			to="body"
			:disabled="!isFullscreen"
		>
			<div
				ref="$wrapper"
				class="
					flex flex-col overflow-hidden border-gray-200 bg-slate-50 shadow-inner
					dark:border-slate-800 dark:bg-slate-900
				"
				:class="[
					isFullscreen
						? 'fixed inset-0 z-9999 h-screen w-screen rounded-none border-0'
						: 'relative h-full min-h-137.5 w-full rounded-xl border', // Adapt to parent size
				]"
			>
				<div
					ref="$networkContainer"
					class="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
					:class="{ 'touch-manipulation': isLocked && hasTouch, 'touch-none': !isLocked && hasTouch }"
				/>

				<VisualizerTouchHint
					:is-locked="isLocked"
					:is-fullscreen="isFullscreen"
					:show-overlay-hint="showOverlayHint"
					:title="t('visualizer.overlayTitle')"
					:description="t('visualizer.overlayDescription')"
					@touchstart="handleTouchStart"
					@touchend="handleTouchEnd"
				/>

				<VisualizerControls
					:is-locked="isLocked"
					:is-fullscreen="isFullscreen"
					:show-overlay-hint="showOverlayHint"
					:has-touch="hasTouch"
					:zoom-out-label="t('visualizer.zoomOut')"
					:zoom-in-label="t('visualizer.zoomIn')"
					:fit-view-label="t('visualizer.fitView')"
					:download-png-label="t('visualizer.downloadPng')"
					:fullscreen-label="t('visualizer.fullscreen')"
					@toggle-lock="toggleLock"
					@zoom-out="zoomOut"
					@zoom-in="zoomIn"
					@fit-graph="fitGraph"
					@export-image="handleExportImage"
					@toggle-fullscreen="toggleFullscreen"
				/>

				<div
					v-if="isFullscreen"
					class="
						animate-fade-in pointer-events-none absolute top-6 left-1/2 z-20
						hidden -translate-x-1/2 rounded-full border border-gray-100
						bg-white/90 px-4 py-1.5 text-xs font-medium text-slate-500
						shadow-sm backdrop-blur sm:block dark:border-slate-700
						dark:bg-slate-900/85 dark:text-slate-200
					"
				>
					{{ t("visualizer.escHint") }}
				</div>
			</div>
		</Teleport>
	</div>
</template>

<style scoped>
/* Let the user scroll and zoom, but disable double-tap to zoom */
.touch-manipulation {
	touch-action: manipulation;
}

/* Ignore all native browser gestures (scroll, zoom, double-tap zoom) */
.touch-none {
	touch-action: none;
}
</style>
