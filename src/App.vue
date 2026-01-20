<script setup lang="ts">
import { ref } from 'vue';
import { useGraph } from './composables/useGraph';
import { useToast } from './composables/useToast'; // Usamos tu sistema de notificaciones

// Componentes UI
import Navbar from './components/common/Navbar.vue';
import Footer from './components/common/Footer.vue';
import MatrixInput from './components/sections/SectionMatrixInput.vue';
import ToastNotification from './components/common/ToastNotification.vue';

// Always visible components
import TabVisualizer from './components/sections/SectionVisualizer.vue';
import TabProperties from './components/sections/SectionProperties.vue';
import TabLatex from './components/sections/SectionLatex.vue';

// Algorithm components
import AlgorithmFloyd from './components/algorithms/AlgorithmFloyd.vue';
import AlgorithmKruskal from './components/algorithms/AlgorithmKruskal.vue';
import AlgorithmDijkstra from './components/algorithms/AlgorithmDijkstra.vue';

// Traemos las nuevas funciones
const { generateRandomGraph, toJSON, loadFromJSON } = useGraph();
const { triggerToast } = useToast();

const selectedAlgorithm = ref<string>('dijkstra');
const fileInput = ref<HTMLInputElement | null>(null); // Referencia al input oculto

const algorithms = [
  { id: 'dijkstra', label: 'Dijkstra', component: AlgorithmDijkstra },
  { id: 'floyd', label: 'Floyd-Warshall', component: AlgorithmFloyd },
  { id: 'mst', label: 'Kruskal (MST)', component: AlgorithmKruskal }
];

// --- Lógica Exportar ---
const handleExport = () => {
  const json = toJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `grafo-backup-${new Date().getTime()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  triggerToast('Archivo JSON exportado correctamente');
};

// --- Lógica Importar ---
const triggerImport = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    const success = loadFromJSON(content);

    if (success) {
      triggerToast('Grafo importado con éxito');
    } else {
      triggerToast('Error: El archivo JSON no es válido');
    }

    // Limpiar input para permitir cargar el mismo archivo 2 veces seguidas
    if (fileInput.value) fileInput.value.value = '';
  };
  reader.readAsText(file);
};
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 flex flex-col"
  >
    <Navbar />

    <main class="grow w-full max-w-5xl mx-auto p-4 md:p-8">
      <input type="file" ref="fileInput" class="hidden" accept=".json" @change="handleFileChange" />

      <div class="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
        <h2
          class="text-xl font-bold text-slate-700 flex items-center gap-2 self-start xl:self-center"
        >
          <span
            class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded uppercase tracking-wider font-bold"
            >Editor</span
          >
          Matriz de Adyacencia
        </h2>

        <div class="flex flex-wrap gap-2 w-full xl:w-auto justify-start xl:justify-end">
          <div class="flex gap-2 mr-2 border-r border-slate-200 pr-4">
            <button
              @click="handleExport"
              class="text-sm bg-white text-slate-600 border border-slate-200 font-medium py-2 px-3 rounded-lg shadow-sm hover:bg-slate-50 hover:text-green-600 transition-all active:scale-95 flex items-center gap-2"
              title="Guardar grafo en archivo JSON"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
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
              <span class="hidden sm:inline">Exportar</span>
            </button>

            <button
              @click="triggerImport"
              class="text-sm bg-white text-slate-600 border border-slate-200 font-medium py-2 px-3 rounded-lg shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all active:scale-95 flex items-center gap-2"
              title="Cargar grafo desde archivo JSON"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span class="hidden sm:inline">Importar</span>
            </button>
          </div>

          <button
            @click="generateRandomGraph"
            class="text-sm bg-white text-slate-600 border border-slate-200 font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            Aleatorio
          </button>
        </div>
      </div>

      <MatrixInput />

      <h2 class="mt-18 text-xl font-bold text-slate-700 flex items-center gap-2 mb-4">
        <span
          class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded uppercase tracking-wider font-bold"
        >
          Dashboard
        </span>
        Visualización y Algoritmos
      </h2>

      <!-- Main Dashboard Layout -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Left Column: Always Visible Components -->
        <div class="space-y-6">
          <!-- Visual Graph -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 class="text-lg font-bold text-slate-700 flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Visualización del Grafo
              </h3>
            </div>
            <div class="p-6">
              <TabVisualizer />
            </div>
          </div>

          <!-- Properties -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 class="text-lg font-bold text-slate-700 flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Propiedades del Grafo
              </h3>
            </div>
            <div class="p-6">
              <TabProperties />
            </div>
          </div>

          <!-- LaTeX Export -->
        </div>

        <!-- Right Column: Algorithm Selection and Results -->
        <div class="space-y-6">
          <div>
            <!-- Algorithm Selector -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 class="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <svg
                    class="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                  Algoritmos
                </h3>
              </div>
              <div class="p-6">
                <div class="mb-4">
                  <label
                    for="algorithm-select"
                    class="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Seleccionar Algoritmo
                  </label>
                  <select
                    id="algorithm-select"
                    v-model="selectedAlgorithm"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                  >
                    <option v-for="algo in algorithms" :key="algo.id" :value="algo.id">
                      {{ algo.label }}
                    </option>
                  </select>
                </div>

                <!-- Algorithm Results -->
                <div class="mt-8">
                  <KeepAlive>
                    <component
                      :is="algorithms.find((a) => a.id === selectedAlgorithm)?.component"
                    />
                  </KeepAlive>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 class="text-lg font-bold text-slate-700 flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0V1m10 3V1m0 3l1 1v16a2 2 0 01-2 2H6a2 2 0 01-2-2V5l1-1z"
                  />
                </svg>
                Exportar a LaTeX
              </h3>
            </div>
            <div class="p-6">
              <TabLatex />
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    <ToastNotification />
  </div>
</template>
