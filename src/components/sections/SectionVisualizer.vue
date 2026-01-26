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
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { Network, type Data } from "vis-network";
import { DataSet } from "vis-data";
import { useGraph } from "../../composables/useGraph";
import { useToast } from "../../composables/useToast";
import { useTheme } from "../../composables/useTheme";
import { useTouch } from "../../composables/useTouch";

const { getGraphData, nodes, highlightedPath } = useGraph();
const { triggerToast } = useToast();
const { isDark } = useTheme();
const { hasTouch } = useTouch();
const { t } = useI18n();

const networkContainer = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
let networkInstance: Network | null = null;
let resizeObserver: ResizeObserver | null = null;

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
const toggleLock = () => {
	isLocked.value = !isLocked.value;
	if (!isLocked.value) showOverlayHint.value = false;

	if (networkInstance) {
		networkInstance.setOptions({
			interaction: {
				zoomView: !isLocked.value,
				dragView: true,
				dragNodes: !isLocked.value,
			},
		});
	}

	const msg = isLocked.value ? t("visualizer.scrollMode") : t("visualizer.interactionMode");
	triggerToast({ title: msg, severity: "info" });
};

// --- Fullscreen ---
const toggleFullscreen = async () => {
	isFullscreen.value = !isFullscreen.value;

	// Wait for the Teleport to move the DOM and Vue to update classes
	await nextTick();

	if (networkInstance) {
		networkInstance.setSize("100%", "100%");
		networkInstance.redraw();
		networkInstance.fit();
	}
};

const handleKeydown = (e: KeyboardEvent) => {
	if (e.key === "Escape" && isFullscreen.value) {
		toggleFullscreen();
	}
};

// --- DATA PREPARATION (Same as before) ---
const parseData = () => {
	const { n, matrix, isSymmetric } = getGraphData();

	// 1. Nodes
	const visNodes = new DataSet(
		nodes.value.map((label, id) => ({
			id,
			label,
			color: {
				background: isDark.value ? "#1e293b" : "#EFF6FF",
				border: isDark.value ? "#60a5fa" : "#2563EB",
				highlight: isDark.value ? "#3b82f6" : "#BFDBFE",
			},
			font: {
				size: 20,
				face: "ui-sans-serif, system-ui",
				color: isDark.value ? "#f1f5f9" : "#1e293b",
				bold: true,
			},
			shape: "circle",
			borderWidth: 2,
			margin: 15,
			shadow: { enabled: true, color: "rgba(0,0,0,0.1)", x: 2, y: 2 },
		})),
	);

	// 2. Edges
	const visEdgesArray = [];
	const limit = n;

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < limit; j++) {
			if (isSymmetric && j < i) continue;

			const weight = matrix[i][j];

			if (weight !== Infinity) {
				const edgeId = nodes.value[i] + nodes.value[j];
				const isHighlighted = highlightedPath.value.includes(edgeId);

				visEdgesArray.push({
					from: i,
					to: j,
					label: String(weight),
					arrows: isSymmetric ? undefined : { to: { enabled: true, scaleFactor: 1 } },
					color: isHighlighted
						? { color: "#ef4444", highlight: "#ef4444" }
						: {
							color: isDark.value ? "#94a3b8" : "#64748b",
							highlight: isDark.value ? "#60a5fa" : "#2563EB",
						},
					font: {
						align: "middle",
						color: isDark.value ? "#f1f5f9" : "#000000",
						strokeWidth: 0,
						background: isDark.value ? "rgba(30,41,59,0.85)" : "rgba(255,255,255,0.85)",
						size: 14,
					},
					width: isHighlighted ? 4 : 2,
					smooth: { type: "curvedCW", roundness: 0.2 },
				});
			}
		}
	}
	return { nodes: visNodes, edges: new DataSet(visEdgesArray) };
};

const drawGraph = () => {
	if (!networkContainer.value) return;

	const data = parseData();

	const options = {
		height: "100%",
		width: "100%",
		physics: {
			enabled: true,
			solver: "repulsion",
			repulsion: {
				nodeDistance: 250,
				centralGravity: 0.2, // Low gravity helps prevent clustering
				springLength: 250,
				springConstant: 0.05,
				damping: 0.09,
			},
			// Important: we ensure it performs iterations before showing
			stabilization: {
				enabled: true,
				iterations: 1000,
				updateInterval: 25,
				fit: true,
			},
		},
		interaction: {
			hover: true,
			zoomView: false,
			dragView: true,
			dragNodes: true,
		},
		layout: { randomSeed: 10 },
	};

	networkInstance = new Network(networkContainer.value, data as unknown as Data, options);

	// --- ADDED CODE ---
	// Once the graph calculates its initial position, we disable physics.
	// This makes the nodes stay "frozen" in place.
	networkInstance.on("stabilizationIterationsDone", () => {
		networkInstance.setOptions({ physics: { enabled: false } });
	});

	// Optional: If you want to reactivate physics while dragging (only for that node)
	// and disable them when releasing, you can use these events.
	// But for what you ask (that the rest does NOT move), the code above is enough.

	// ----------------------

	// Fit the graph to view
	networkInstance.fit();
};

// --- Controls ---
const zoomIn = () =>
	networkInstance?.moveTo({
		scale: networkInstance.getScale() * 1.2,
		animation: { duration: 200, easingFunction: "easeInOutQuad" },
	});

const zoomOut = () =>
	networkInstance?.moveTo({
		scale: networkInstance.getScale() / 1.2,
		animation: { duration: 200, easingFunction: "easeInOutQuad" },
	});

const fitGraph = () => networkInstance?.fit({ animation: true });

const exportImage = () => {
	if (!networkContainer.value || !networkInstance) return;

	// 1. Find the canvas element inside the container
	const canvas = networkContainer.value.querySelector("canvas");
	if (!canvas) return;

	// 2. Get the 2D context
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	// 3. Save the current canvas state
	ctx.save();

	// 4. Draw a white background behind everything (destination-over)
	// This is necessary because the vis-network canvas is transparent by default.
	ctx.globalCompositeOperation = "destination-over";
	ctx.fillStyle = isDark.value ? "#0f172a" : "#ffffff";
	// We use the internal width/height of the canvas to cover everything
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// 5. Get the image in base64
	const dataURL = canvas.toDataURL("image/png");

	// 6. Restore the canvas state (make it transparent again for interaction)
	ctx.restore();

	// 7. Create a temporary link to force the download
	const link = document.createElement("a");
	link.href = dataURL;
	link.download = `grafo-exportado-${new Date().getTime()}.png`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	triggerToast({ title: t("visualizer.imageDownloaded"), severity: "success" });
};

// --- Lifecycle ---
onMounted(() => {
	drawGraph();
	window.addEventListener("keydown", handleKeydown);

	// Watch for container resizing to update the canvas
	if (wrapperRef.value) {
		resizeObserver = new ResizeObserver(() => {
			// This forces Vis.js to recalculate the canvas size
			if (networkInstance) {
				networkInstance.setSize("100%", "100%");
				networkInstance.redraw();
			}
		});
		resizeObserver.observe(wrapperRef.value);
	}
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleKeydown);
	if (resizeObserver) resizeObserver.disconnect();
});

watch([() => getGraphData(), highlightedPath], () => drawGraph(), {
	deep: true,
});

// Watch for theme changes to redraw with new colors
watch(isDark, () => drawGraph());
</script>

<template>
	<div class="relative h-full min-h-[550px] w-full">
		<Teleport
			to="body"
			:disabled="!isFullscreen"
		>
			<div
				ref="wrapperRef"
				class="flex flex-col overflow-hidden border-gray-200 bg-slate-50 shadow-inner dark:border-slate-800 dark:bg-slate-900"
				:class="[
					isFullscreen
						? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none border-0' // z-9999 vence al Navbar
						: 'relative h-full min-h-[550px] w-full rounded-xl border', // Se adapta al padre original
				]"
			>
				<div
					ref="networkContainer"
					class="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
					:class="{ 'touch-manipulation': isLocked && hasTouch, 'touch-none': !isLocked && hasTouch }"
				/>

				<div
					v-if="isLocked && !isFullscreen"
					class="absolute inset-0 z-10 flex touch-pan-y items-center justify-center pb-32 lg:hidden"
					@touchstart="handleTouchStart"
					@touchend="handleTouchEnd"
				>
					<Transition name="fade">
						<div
							v-if="showOverlayHint"
							class="mx-6 flex flex-col items-center justify-center rounded-xl bg-slate-900/70 p-6 text-center text-white shadow-2xl backdrop-blur-[2px] select-none"
						>
							<IconLock class="mb-3 size-10 opacity-90" />
							<p class="text-lg font-bold">
								{{ t("visualizer.overlayTitle") }}
							</p>
							<p class="mt-1 text-sm leading-snug text-slate-200">
								{{ t("visualizer.overlayDescription") }}
							</p>
						</div>
					</Transition>
				</div>

				<div
					class="animate-fade-in absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-200/80 bg-white/90 p-1.5 shadow-lg backdrop-blur transition-all duration-300 hover:scale-102 hover:shadow-xl dark:border-slate-700/70 dark:bg-slate-900/85"
					:class="isFullscreen ? 'max-sm:!bottom-16' : ''"
				>
					<button
						v-if="hasTouch"
						class="relative rounded-full p-2 text-gray-500 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
						:class="{
							'bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-700':
								!isLocked,
							'z-50 scale-110 bg-white shadow-xl ring-2 ring-blue-400 dark:bg-slate-900 dark:ring-blue-700':
								showOverlayHint,
						}"
						@click="toggleLock"
					>
						<span
							v-if="showOverlayHint"
							class="absolute inset-0 -z-10 inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"
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
						class="rounded-full p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
						:title="t('visualizer.zoomOut')"
						@click="zoomOut"
					>
						<IconZoomOut class="size-5" />
					</button>

					<button
						class="rounded-full p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
						:title="t('visualizer.zoomIn')"
						@click="zoomIn"
					>
						<IconZoomIn class="size-5" />
					</button>

					<button
						class="rounded-full p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
						:title="t('visualizer.fitView')"
						@click="fitGraph"
					>
						<IconKeyframeAlignCenter class="size-5" />
					</button>

					<button
						class="rounded-full p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
						:title="t('visualizer.downloadPng')"
						@click="exportImage"
					>
						<IconCamera class="size-5" />
					</button>

					<button
						class="rounded-full p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
						:class="{
							'bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-700':
								isFullscreen,
						}"
						:title="t('visualizer.fullscreen')"
						@click="toggleFullscreen"
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

				<div
					v-if="isFullscreen"
					class="animate-fade-in pointer-events-none absolute top-6 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-gray-100 bg-white/90 px-4 py-1.5 text-xs font-medium text-slate-500 shadow-sm backdrop-blur sm:block dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200"
				>
					{{ t("visualizer.escHint") }}
				</div>
			</div>
		</Teleport>
	</div>
</template>

<style scoped>
.touch-manipulation {
	touch-action: manipulation;
}

.touch-none {
	touch-action: none;
}

/* Soft animation for the overlay */
.fade-enter-active,
.fade-leave-active {
	/* cubic-bezier for a smooth and natural "ease-out" effect */
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	/* The element starts a bit lower (10px) and a bit smaller (0.95) */
	/* This creates the effect of "floating in" instead of just blinking */
	transform: translateY(10px) scale(0.95);
}
</style>
