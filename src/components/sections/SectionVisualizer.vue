<script setup lang="ts">
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
	triggerToast(msg);
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
				centralGravity: 0.2,
				springLength: 250,
				springConstant: 0.05,
				damping: 0.09,
			},
			stabilization: { enabled: true, iterations: 1000, updateInterval: 25 },
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

	triggerToast("Imagen descargada correctamente");
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
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-10 w-10 mb-3 opacity-90"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
							<p class="font-bold text-lg">Mapa bloqueado</p>
							<p class="text-sm text-slate-200 mt-1 leading-snug">
								Desbloquea el mapa para interactuar.
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
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-5"
						>
							<path stroke="none" d="M0 0h24v24H0z" fill="none" />
							<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
							<path d="M7 10l6 0" />
							<path d="M21 21l-6 -6" />
						</svg>
					</button>

					<button
						@click="zoomIn"
						class="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
						title="Acercar"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-5"
						>
							<path stroke="none" d="M0 0h24v24H0z" fill="none" />
							<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
							<path d="M7 10l6 0" />
							<path d="M10 7l0 6" />
							<path d="M21 21l-6 -6" />
						</svg>
					</button>

					<button
						@click="fitGraph"
						class="p-2 rounded-full text-blue-50 bg-blue-600 hover:text-blue-600 hover:bg-blue-50 transition"
						title="Ajustar vista"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-5"
						>
							<path stroke="none" d="M0 0h24v24H0z" fill="none" />
							<path d="M12 20v2" />
							<path
								d="M12.816 16.58c-.207 .267 -.504 .42 -.816 .42c-.312 0 -.61 -.153 -.816 -.42l-2.908 -3.748a1.39 1.39 0 0 1 0 -1.664l2.908 -3.748c.207 -.267 .504 -.42 .816 -.42c.312 0 .61 .153 .816 .42l2.908 3.748a1.39 1.39 0 0 1 0 1.664l-2.908 3.748"
							/>
							<path d="M12 2v2" />
							<path d="M3 12h2" />
							<path d="M19 12h2" />
						</svg>
					</button>

					<button
						@click="toggleLock"
						class="lg:hidden p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
						:class="{
							'text-blue-600 bg-blue-50 ring-1 ring-blue-200': !isLocked,
						}"
					>
						<svg
							v-if="isLocked"
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
						<svg
							v-else
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
							/>
						</svg>
					</button>

					<button
						@click="exportImage"
						class="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
						title="Exportar imagen"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
					</button>

					<button
						@click="toggleFullscreen"
						class="hidden lg:block p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
						:class="{
							'text-blue-600 bg-blue-50 ring-1 ring-blue-200': isFullscreen,
						}"
						title="Pantalla completa"
					>
						<svg
							v-if="!isFullscreen"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-5"
						>
							<path stroke="none" d="M0 0h24v24H0z" fill="none" />
							<path d="M16 4l4 0l0 4" />
							<path d="M14 10l6 -6" />
							<path d="M8 20l-4 0l0 -4" />
							<path d="M4 20l6 -6" />
							<path d="M16 20l4 0l0 -4" />
							<path d="M14 14l6 6" />
							<path d="M8 4l-4 0l0 4" />
							<path d="M4 4l6 6" />
						</svg>

						<svg
							v-else
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-5"
						>
							<path stroke="none" d="M0 0h24v24H0z" fill="none" />
							<path d="M18 6l-12 12" />
							<path d="M6 6l12 12" />
						</svg>
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
