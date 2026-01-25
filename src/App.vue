<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useGraph } from "./composables/useGraph";
import { useToast } from "./composables/useToast";
import { useGraphIO } from "./composables/useGraphIO";

// Componentes UI
import Navbar from "./components/common/Navbar.vue";
import Footer from "./components/common/Footer.vue";
import MatrixInput from "./components/sections/SectionMatrixInput.vue";
import ToastNotification from "./components/common/ToastNotification.vue";
import SectionCard from "./components/sections/SectionCard.vue";
import {
	IconDownload,
	IconUpload,
	IconEye,
	IconCpu,
	IconChartBar,
} from "@tabler/icons-vue";

// Always visible components
import SectionVisualizer from "./components/sections/SectionVisualizer.vue";
import SectionProperties from "./components/sections/SectionProperties.vue";

// Algorithm components
import AlgorithmFloyd from "./components/algorithms/AlgorithmFloyd.vue";
import AlgorithmKruskal from "./components/algorithms/AlgorithmKruskal.vue";
import AlgorithmDijkstra from "./components/algorithms/AlgorithmDijkstra.vue";

// Composables
const { toJSON, toLaTeX, toDot, loadFromJSON, loadFromLaTeX, loadFromDot } =
	useGraph();
const { triggerToast } = useToast();
const { downloadFile, copyToClipboard, readFileContent } = useGraphIO();

type FormatKey = "JSON" | "LaTeX" | "Dot";

const formats: Record<FormatKey, {
	serialize: () => string;
	parse: (value: string) => boolean;
	mime: string;
	ext: string;
	accept: string;
}> = {
	JSON: {
		serialize: toJSON,
		parse: loadFromJSON,
		mime: "application/json",
		ext: "json",
		accept: ".json",
	},
	LaTeX: {
		serialize: toLaTeX,
		parse: loadFromLaTeX,
		mime: "text/plain",
		ext: "tex",
		accept: ".tex",
	},
	Dot: {
		serialize: toDot,
		parse: loadFromDot,
		mime: "text/plain",
		ext: "dot",
		accept: ".dot,.gv",
	},
};

const formatOrder: FormatKey[] = ["JSON", "LaTeX", "Dot"];

// Refs
const selectedAlgorithm = ref<string>("dijkstra");
const fileInput = ref<HTMLInputElement | null>(null);
type MenuOpen = "export" | "import" | null;
const menuOpen = ref<MenuOpen>(null);
const showPasteModal = ref(false);
const selectedPasteFormat = ref<FormatKey>("JSON");
const pasteContent = ref("");

// Load saved format
onMounted(() => {
	const saved = localStorage.getItem("pasteFormat");
	if (saved && formatOrder.includes(saved as FormatKey)) {
		selectedPasteFormat.value = saved as FormatKey;
	}
});

const algorithms = [
	{ id: "dijkstra", label: "Dijkstra", component: AlgorithmDijkstra },
	{ id: "floyd", label: "Floyd-Warshall", component: AlgorithmFloyd },
	{ id: "mst", label: "Kruskal (MST)", component: AlgorithmKruskal },
];

const algorithmById = computed(() =>
	Object.fromEntries(algorithms.map((algo) => [algo.id, algo.component]))
);

// --- Export logic ---
const handleExport = () => {
	menuOpen.value = menuOpen.value === "export" ? null : "export";
};

const exportInFormat = (format: FormatKey) => {
	const fmt = formats[format];
	const filename = `grafo-${Date.now()}`;
	downloadFile(fmt.serialize(), filename, fmt.ext, fmt.mime);
	menuOpen.value = null;
};

const copyInFormat = async (format: FormatKey) => {
	const fmt = formats[format];
	await copyToClipboard(fmt.serialize(), format);
	menuOpen.value = null;
};

// --- Import logic ---
const triggerImport = () => {
	menuOpen.value = menuOpen.value === "import" ? null : "import";
};

const importInFormat = (format: FormatKey) => {
	const fmt = formats[format];
	if (fileInput.value) {
		fileInput.value.accept = fmt.accept;
		fileInput.value.click();
	}
	menuOpen.value = null;
};

const pasteFromClipboard = () => {
	showPasteModal.value = true;
	menuOpen.value = null;
};

const confirmPaste = () => {
	const fmt = formats[selectedPasteFormat.value];
	const success = fmt.parse(pasteContent.value);
	if (success) {
		triggerToast({
			title: "Contenido importado correctamente",
			severity: "success",
		});
		localStorage.setItem("pasteFormat", selectedPasteFormat.value);
	} else {
		triggerToast({
			title: "Error: El contenido no es válido",
			severity: "error",
		});
	}
	showPasteModal.value = false;
	pasteContent.value = "";
};

const handleFileChange = async (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;

	try {
		const content = await readFileContent(file);

		const extensionMap: Record<string, FormatKey> = {
			json: "JSON",
			tex: "LaTeX",
			dot: "Dot",
			gv: "Dot",
		};
		const extension = file.name.split(".").pop()?.toLowerCase();
		const format = extension ? extensionMap[extension] : undefined;
		if (!format) {
			triggerToast({
				title: "Formato de archivo no soportado",
				severity: "error",
			});
			return;
		}

		const success = formats[format].parse(content);
		if (success) {
			triggerToast({ title: "Grafo importado con éxito", severity: "success" });
		} else {
			triggerToast({
				title: "Error: El archivo no es válido",
				severity: "error",
			});
		}
	} catch (error) {
		triggerToast({ title: "Error al leer el archivo", severity: "error" });
	}

	// Reset file input
	if (fileInput.value) fileInput.value.value = "";
};
</script>

<template>
	<div
		class="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 flex flex-col overflow-x-hidden"
	>
		<Navbar />

		<main class="grow w-full max-w-5xl mx-auto p-4 py-6 md:p-8">
			<input
				type="file"
				ref="fileInput"
				class="hidden"
				@change="handleFileChange"
			/>

			<div class="flex justify-between items-center mb-6 gap-4">
				<h2 class="text-2xl font-bold text-slate-700 flex items-center gap-2">
					Matriz de adyacencia
				</h2>

				<div class="flex flex-wrap gap-2">
					<div class="flex gap-2">
						<div class="relative">
							<button
								@click="handleExport"
								class="text-sm bg-white text-slate-600 border border-slate-200 font-medium py-2 px-3 rounded-lg shadow-sm hover:bg-slate-50 hover:text-green-600 transition-all active:scale-95 flex items-center gap-2"
								title="Seleccionar formato para exportar"
							>
								<IconDownload class="size-4" />
								<span class="hidden sm:inline">Exportar</span>
							</button>

							<Transition name="menu">
								<div
									v-if="menuOpen === 'export'"
									class="absolute top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10"
								>
										<template v-for="(formatKey, idx) in formatOrder" :key="formatKey">
											<div
												:class="[
													'px-4 py-2 text-xs font-bold text-slate-500 uppercase',
													{ 'border-t border-slate-100': idx > 0 },
												]"
											>
												{{ formatKey }}
											</div>
											<button
												@click="exportInFormat(formatKey)"
												class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
											>
												Descargar
											</button>
											<button
												@click="copyInFormat(formatKey)"
												class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
											>
												Copiar
											</button>
										</template>
								</div>
							</Transition>
						</div>

						<div class="relative">
							<button
								@click="triggerImport"
								class="text-sm bg-white text-slate-600 border border-slate-200 font-medium py-2 px-3 rounded-lg shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95 flex items-center gap-2"
								title="Seleccionar formato para importar"
							>
								<IconUpload class="size-4" />
								<span class="hidden sm:inline">Importar</span>
							</button>

							<Transition name="menu">
								<div
									v-if="menuOpen === 'import'"
									class="absolute top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10"
								>
									<div
										class="px-4 py-2 text-xs font-bold text-slate-500 uppercase"
									>
										Archivo
									</div>
										<button
											v-for="formatKey in formatOrder"
											:key="`file-` + formatKey"
											@click="importInFormat(formatKey)"
											class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
										>
											{{ formatKey }}
										</button>
									<div
										class="px-4 py-2 text-xs font-bold text-slate-500 uppercase border-t border-slate-100"
									>
										Texto
									</div>
									<button
										@click="pasteFromClipboard"
										class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
									>
										Pegar
									</button>
								</div>
							</Transition>
						</div>
					</div>
				</div>
			</div>

			<MatrixInput />

			<h2
				class="mt-18 text-2xl font-bold text-slate-700 flex items-center gap-2 mb-6"
			>
				Análisis del grafo
			</h2>

			<div
				class="lg:grid lg:grid-cols-2 max-lg:flex max-lg:flex-col gap-6 items-stretch"
			>
				<div class="h-full">
					<SectionCard
						title="Visualización"
						class="h-full flex flex-col"
						body-class="flex-1 flex flex-col min-h-[400px]"
					>
						<template #icon>
							<IconEye class="size-5 text-amber-600" />
						</template>
						<SectionVisualizer class="flex-1 w-full h-full" />
					</SectionCard>
				</div>

				<div class="space-y-6">
					<div>
						<SectionCard title="Algoritmos">
							<template #icon>
								<IconCpu class="size-5 text-indigo-600" />
							</template>
							<div class="mb-4">
								<label
									for="algorithm-select"
									class="block text-xs uppercase font-bold text-slate-500 mb-3"
								>
									Algoritmo
								</label>
								<select
									id="algorithm-select"
									v-model="selectedAlgorithm"
									class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
								>
									<option
										v-for="algo in algorithms"
										:key="algo.id"
										:value="algo.id"
									>
										{{ algo.label }}
									</option>
								</select>
							</div>
							<div class="mt-8">
								<KeepAlive>
									<component
												:is="algorithmById[selectedAlgorithm]"
									/>
								</KeepAlive>
							</div>
						</SectionCard>
					</div>
				</div>

				<SectionCard title="Propiedades" class="col-span-2">
					<template #icon>
						<IconChartBar class="size-5 text-green-600" />
					</template>
					<SectionProperties />
				</SectionCard>
			</div>
		</main>

		<div
			v-if="menuOpen"
			class="fixed inset-0 z-5"
			@click="menuOpen = null"
		/>

		<Transition name="modal">
			<div
				v-if="showPasteModal"
				class="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-sm"
				@click.self="showPasteModal = false"
			>
				<div class="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full mx-4">
					<h3 class="text-lg font-bold mb-4 text-slate-800">Pegar contenido</h3>
					<div class="mb-4">
						<label class="block text-sm font-medium text-slate-700 mb-2">
							Formato:
						</label>
						<select
							v-model="selectedPasteFormat"
							class="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
						>
								<option v-for="formatKey in formatOrder" :key="formatKey" :value="formatKey">
									{{ formatKey }}
								</option>
						</select>
					</div>
					<div class="mb-4">
						<label class="block text-sm font-medium text-slate-700 mb-2">
							Contenido:
						</label>
						<textarea
							v-model="pasteContent"
							class="w-full h-32 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
							placeholder="Pega aquí el contenido..."
						></textarea>
					</div>
					<div class="flex justify-end gap-2">
						<button
							@click="showPasteModal = false"
							class="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
						>
							Cancelar
						</button>
						<button
							@click="confirmPaste"
							class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							Importar
						</button>
					</div>
				</div>
			</div>
		</Transition>

		<Footer />
		<ToastNotification />
	</div>
</template>

<style>
.menu-enter-active,
.menu-leave-active {
	transition: all 0.2s ease;
}

.menu-enter-from {
	opacity: 0;
	transform: translateY(-8px);
}

.menu-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}

.modal-enter-active,
.modal-leave-active {
	transition: all 0.3s ease;
}

.modal-enter-from {
	opacity: 0;
	transform: scale(0.95);
}

.modal-leave-to {
	opacity: 0;
	transform: scale(0.95);
}
</style>
