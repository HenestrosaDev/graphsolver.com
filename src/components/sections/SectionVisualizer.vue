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
import { Network, type Data } from "vis-network";
import { DataSet } from "vis-data";
import { useGraph } from "../../composables/useGraph";
import { useToast } from "../../composables/useToast";

const { getGraphData, nodes, highlightedPath } = useGraph();
const { triggerToast } = useToast();

const networkContainer = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
let networkInstance: Network | null = null;
let resizeObserver: ResizeObserver | null = null;

// Estados
const isLocked = ref(true);
const isFullscreen = ref(false);
const showOverlayHint = ref(false);
let overlayTimeout: number | null = null;

// --- Interacciones Táctiles ---
// Al tocar la pantalla
const handleTouchStart = () => {
	if (overlayTimeout) clearTimeout(overlayTimeout);
	showOverlayHint.value = true;
};

// Al levantar el dedo
const handleTouchEnd = () => {
	overlayTimeout = window.setTimeout(() => {
		showOverlayHint.value = false;
	}, 300);
};

// --- Bloqueo / Desbloqueo ---
const toggleLock = () => {
	isLocked.value = !isLocked.value;
	if (!isLocked.value) showOverlayHint.value = false;

	const msg = isLocked.value
		? "Modo scroll activado"
		: "Modo interacción activado";
	triggerToast({ title: msg, severity: "info" });
};

// --- Pantalla completa ---
const toggleFullscreen = async () => {
	isFullscreen.value = !isFullscreen.value;

	// Esperar a que el Teleport mueva el DOM y Vue actualice clases
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

// --- Preparación de Datos (Igual que antes) ---
const parseData = () => {
	const { n, matrix, isSymmetric } = getGraphData();

	// 1. Nodos
	const visNodes = new DataSet(
		nodes.value.map((label, id) => ({
			id,
			label,
			color: { background: "#EFF6FF", border: "#2563EB", highlight: "#BFDBFE" },
			font: {
				size: 20,
				face: "ui-sans-serif, system-ui",
				color: "#1e293b",
				bold: true,
			},
			shape: "circle",
			borderWidth: 2,
			margin: 15,
			shadow: { enabled: true, color: "rgba(0,0,0,0.1)", x: 2, y: 2 },
		}))
	);

	// 2. Aristas
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
					arrows: isSymmetric
						? undefined
						: { to: { enabled: true, scaleFactor: 1 } },
					color: isHighlighted
						? { color: "#ef4444", highlight: "#ef4444" }
						: { color: "#64748b", highlight: "#2563EB" },
					font: {
						align: "middle",
						color: "#000000",
						strokeWidth: 0,
						background: "rgba(255,255,255,0.85)",
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
				centralGravity: 0.2, // Gravedad baja ayuda a que no se apiñen
				springLength: 250,
				springConstant: 0.05,
				damping: 0.09,
			},
			// Importante: aseguramos que haga iteraciones antes de mostrarse
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

	networkInstance = new Network(
		networkContainer.value,
		data as unknown as Data,
		options
	);

	// --- CÓDIGO AÑADIDO ---
	// Una vez que el grafo calcula su posición inicial, desactivamos las físicas.
	// Esto hace que los nodos se queden "congelados" en su sitio.
	networkInstance.on("stabilizationIterationsDone", () => {
		networkInstance.setOptions({ physics: { enabled: false } });
	});

	// Opcional: Si quieres reactivar físicas mientras arrastras (solo para ese nodo)
	// y desactivarlas al soltar, puedes usar estos eventos.
	// Pero para lo que pides (que NO se mueva el resto), el código de arriba es suficiente.

	// ----------------------

	// Fit the graph to view
	networkInstance.fit();
};

// --- Controles ---
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

	// 1. Encontrar el elemento canvas dentro del contenedor
	const canvas = networkContainer.value.querySelector("canvas");
	if (!canvas) return;

	// 2. Obtener el contexto 2D
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	// 3. Guardar el estado actual del canvas
	ctx.save();

	// 4. Dibujar un fondo blanco detrás de todo (destination-over)
	// Esto es necesario porque el canvas de vis-network es transparente por defecto.
	ctx.globalCompositeOperation = "destination-over";
	ctx.fillStyle = "#ffffff";
	// Usamos el ancho/alto interno del canvas para cubrirlo todo
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// 5. Obtener la imagen en base64
	const dataURL = canvas.toDataURL("image/png");

	// 6. Restaurar el estado del canvas (volver a hacerlo transparente para la interacción)
	ctx.restore();

	// 7. Crear un enlace temporal para forzar la descarga
	const link = document.createElement("a");
	link.href = dataURL;
	link.download = `grafo-exportado-${new Date().getTime()}.png`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	triggerToast({ title: "Imagen descargada correctamente", severity: "info" });
};

// --- Ciclo de Vida ---
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
</script>

<template>
	<div class="relative w-full h-full min-h-[550px]">
		<Teleport to="body" :disabled="!isFullscreen">
			<div
				ref="wrapperRef"
				class="border-gray-200 bg-slate-50 shadow-inner overflow-hidden flex flex-col"
				:class="[
					isFullscreen
						? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none border-0' // z-9999 vence al Navbar
						: 'relative w-full h-full min-h-[550px] rounded-xl border', // Se adapta al padre original
				]"
			>
				<div
					ref="networkContainer"
					class="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
				/>

				<div
					v-if="isLocked && !isFullscreen"
					class="absolute inset-0 z-10 lg:hidden touch-pan-y flex items-center justify-center pb-32"
					@touchstart="handleTouchStart"
					@touchend="handleTouchEnd"
				>
					<Transition name="fade">
						<div
							v-if="showOverlayHint"
							class="bg-slate-900/70 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-white p-6 text-center select-none mx-6 shadow-2xl"
						>
							<IconLock class="size-10 mb-3 opacity-90" />
							<p class="font-bold text-lg">Interacción desactivada</p>
							<p class="text-sm text-slate-200 mt-1 leading-snug">
								Pulsa el candado 🔒 de abajo para interactuar con el grafo.
							</p>
						</div>
					</Transition>
				</div>

				<div
					class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur shadow-lg border border-gray-200/80 rounded-full animate-fade-in transition-all duration-300 hover:shadow-xl hover:scale-102"
				>
					<button
						@click="zoomOut"
						class="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
						title="Alejar"
					>
						<IconZoomOut class="size-5" />
					</button>

					<button
						@click="zoomIn"
						class="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
						title="Acercar"
					>
						<IconZoomIn class="size-5" />
					</button>

					<button
						@click="fitGraph"
						class="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
						title="Ajustar vista"
					>
						<IconKeyframeAlignCenter class="size-5" />
					</button>

					<button
						@click="exportImage"
						class="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
						title="Descargar como imagen PNG"
					>
						<IconCamera class="size-5" />
					</button>

					<button
						@click="toggleFullscreen"
						class="hidden lg:block p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
						:class="{
							'text-blue-600 bg-blue-50 ring-1 ring-blue-200': isFullscreen,
						}"
						title="Pantalla completa"
					>
						<IconArrowsMaximize v-if="!isFullscreen" class="size-5" />
						<IconArrowsMinimize v-else class="size-5" />
					</button>

					<button
						@click="toggleLock"
						class="relative lg:hidden p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
						:class="{
							'text-blue-600 bg-blue-50 ring-1 ring-blue-200': !isLocked,
							'scale-110 bg-white ring-2 ring-blue-400 shadow-xl z-50':
								showOverlayHint,
						}"
					>
						<span
							v-if="showOverlayHint"
							class="absolute inset-0 -z-10 inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"
						/>
						<IconLock v-if="isLocked" class="size-5" />
						<IconLockOpen v-else class="size-5" />
					</button>
				</div>

				<div
					v-if="isFullscreen"
					class="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-medium text-slate-500 shadow-sm pointer-events-none animate-fade-in border border-gray-100"
				>
					Pulsa ESC para salir
				</div>
			</div>
		</Teleport>
	</div>
</template>

<style scoped>
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
