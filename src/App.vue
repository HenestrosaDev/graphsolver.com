<script setup lang="ts">
import { ref } from 'vue';
import { useGraph } from './composables/useGraph';
import { useToast } from './composables/useToast'; // Usamos tu sistema de notificaciones

// Componentes UI
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import MatrixInput from './components/MatrixInput.vue';
import ToastNotification from './components/ToastNotification.vue';

// Tabs
import TabFloyd from './components/tabs/TabFloyd.vue';
import TabProperties from './components/tabs/TabProperties.vue';
import TabMst from './components/tabs/TabMst.vue';
import TabLatex from './components/tabs/TabLatex.vue';
import TabDijkstra from './components/tabs/TabDijkstra.vue';
import TabVisualizer from './components/tabs/TabVisualizer.vue';

// Traemos las nuevas funciones
const { generateRandomGraph, toJSON, loadFromJSON } = useGraph();
const { triggerToast } = useToast();

const activeTab = ref<string>('Graph');
const fileInput = ref<HTMLInputElement | null>(null); // Referencia al input oculto

const tabs = [
  { id: 'Graph', label: 'Visualizar Grafo' },
  { id: 'Dijkstra', label: 'Dijkstra' },
  { id: 'Floyd', label: 'Floyd-Warshall' },
  { id: 'MST', label: 'MST (Kruskal)' },
  { id: 'Properties', label: 'Propiedades' },
  { id: 'Latex', label: 'LaTeX' }
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

    <main class="flex-grow w-full max-w-5xl mx-auto p-4 md:p-8">
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

      <div class="my-8 border-t border-slate-200"></div>

      <h2 class="text-xl font-bold text-slate-700 flex items-center gap-2 mb-4">
        <span
          class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded uppercase tracking-wider font-bold"
        >
          Dashboard
        </span>
        Visualización y Algoritmos
      </h2>

      <div
        class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]"
      >
        <div class="flex overflow-x-auto border-b border-slate-200 bg-slate-50/50 scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 outline-none whitespace-nowrap"
            :class="
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="p-4 sm:p-8">
          <KeepAlive>
            <component
              :is="
                activeTab === 'Graph'
                  ? TabVisualizer
                  : activeTab === 'Floyd'
                    ? TabFloyd
                    : activeTab === 'Properties'
                      ? TabProperties
                      : activeTab === 'MST'
                        ? TabMst
                        : activeTab === 'Latex'
                          ? TabLatex
                          : activeTab === 'Dijkstra'
                            ? TabDijkstra
                            : null
              "
            />
          </KeepAlive>
        </div>
      </div>
    </main>
    <Footer />
    <ToastNotification />
  </div>
</template>
