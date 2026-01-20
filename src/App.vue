<script setup lang="ts">
import { ref } from 'vue';
import { useGraph } from './composables/useGraph';

// Componentes UI
import Navbar from './components/Navbar.vue';
import MatrixInput from './components/MatrixInput.vue';
import ToastNotification from './components/ToastNotification.vue';

// Tabs (Nombres corregidos)
import TabFloyd from './components/tabs/TabFloyd.vue';
import TabProperties from './components/tabs/TabProperties.vue';
import TabMst from './components/tabs/TabMst.vue';
import TabLatex from './components/tabs/TabLatex.vue';
import TabDijkstra from './components/tabs/TabDijkstra.vue';
import TabVisualizer from './components/tabs/TabVisualizer.vue';

// Lógica del grafo
const { generateRandomGraph } = useGraph();

// Estado de la navegación
const activeTab = ref<string>('Graph');
const tabs = [
	{ id: 'Graph', label: 'Visualizar Grafo' },
  { id: 'Dijkstra', label: 'Dijkstra' },
  { id: 'Floyd', label: 'Floyd-Warshall' },
  { id: 'MST', label: 'MST (Kruskal)' },
  { id: 'Properties', label: 'Propiedades' },
  { id: 'Latex', label: 'LaTeX' }
];
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
    
    <Navbar />

    <div class="max-w-5xl mx-auto p-4 md:p-8">
      
      <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        
<div class="text-center md:text-left">
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
            GraphSolver <span class="text-blue-600">Pro</span>
          </h1>
          <p class="text-slate-500 text-sm font-medium mt-1">Algoritmos y análisis de grafos</p>
        </div>

        <div class="flex gap-2">
          <button 
            @click="generateRandomGraph" 
            class="text-sm bg-white text-slate-600 border border-slate-200 font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95 flex items-center gap-2"
            title="Rellenar con valores aleatorios (mantiene tamaño)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Aleatorio
          </button>
        </div>
      </div>

      <MatrixInput />

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
        
        <div class="flex overflow-x-auto border-b border-slate-200 bg-slate-50/50 scrollbar-hide">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 outline-none whitespace-nowrap"
            :class="activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="p-4 sm:p-8">
          <KeepAlive>
            <component :is="
							activeTab === 'Graph' ? TabVisualizer :
              activeTab === 'Floyd' ? TabFloyd : 
              activeTab === 'Properties' ? TabProperties :
              activeTab === 'MST' ? TabMst :
              activeTab === 'Latex' ? TabLatex :
              activeTab === 'Dijkstra' ? TabDijkstra : null
            " />
          </KeepAlive>
        </div>
      </div>

    </div>
    
    <ToastNotification />
  </div>
</template>

<style>
/* Utilidad para ocultar scrollbar en los tabs */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>