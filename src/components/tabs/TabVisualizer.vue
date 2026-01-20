<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { useGraph } from '../../composables/useGraph';


const { getGraphData, nodes } = useGraph();

const networkContainer = ref<HTMLElement | null>(null);
let networkInstance: Network | null = null;

// --- Preparación de Datos ---
const parseData = () => {
  const { n, matrix, isSymmetric } = getGraphData();
  
  // 1. Nodos
  const visNodes = new DataSet(
    nodes.value.map((label, id) => ({
      id,
      label,
      color: { background: '#EFF6FF', border: '#2563EB', highlight: '#BFDBFE' },
      font: { size: 20, face: 'ui-sans-serif, system-ui', color: '#1e293b', bold: true },
      shape: 'circle',
      borderWidth: 2,
      margin: 12,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', x: 2, y: 2 }
    }))
  );

  // 2. Aristas
  const visEdgesArray = [];
  const limit = n; 
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < limit; j++) {
      if (isSymmetric && j < i) continue; // Evitar duplicados en no dirigidos

      const weight = matrix[i][j];
      
      if (weight !== Infinity) {
        visEdgesArray.push({
          from: i,
          to: j,
          label: String(weight),
          arrows: isSymmetric ? undefined : { to: { enabled: true, scaleFactor: 1 } },
          color: { color: '#64748b', highlight: '#2563EB' },
          font: { align: 'top', color: '#475569', strokeWidth: 0, background: 'rgba(255,255,255,0.7)' },
          width: 2,
          smooth: { type: 'continuous' } // Curvas suaves
        });
      }
    }
  }
  const visEdges = new DataSet(visEdgesArray);

  return { nodes: visNodes, edges: visEdges };
};

// --- Inicialización ---
const drawGraph = () => {
  if (!networkContainer.value) return;

  const data = parseData();
  
  const options = {
    physics: {
      enabled: true,
      stabilization: { iterations: 200 },
      barnesHut: {
        gravitationalConstant: -3000,
        springLength: 120,
        springConstant: 0.05,
        damping: 0.09
      }
    },
    interaction: {
      hover: true,
      zoomView: false,  // NO permite zoom con rueda, ya que es raro con el touchpad
      dragView: true,  // Permite arrastrar lienzo
      dragNodes: true  // Permite mover nodos
    },
    layout: { randomSeed: 10 } // Semilla fija para consistencia visual
  };

  networkInstance = new Network(networkContainer.value, data, options);
};

// --- Controles de Zoom ---
const zoomIn = () => {
  if (!networkInstance) return;
  const scale = networkInstance.getScale() + 0.3;
  networkInstance.moveTo({ scale: scale, animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
};

const zoomOut = () => {
  if (!networkInstance) return;
  const scale = networkInstance.getScale() - 0.3;
  networkInstance.moveTo({ scale: scale, animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
};

const fitGraph = () => {
  if (!networkInstance) return;
  networkInstance.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
};

// --- Ciclo de Vida ---
onMounted(() => {
  drawGraph();
});

watch(
  () => getGraphData(), 
  () => drawGraph(),
  { deep: true }
);
</script>

<template>
  <div class="animate-fade-in relative group">
    
    <div 
      ref="networkContainer" 
      class="w-full h-[550px] border border-gray-200 rounded-xl bg-slate-50 shadow-inner cursor-grab active:cursor-grabbing overflow-hidden relative"
    ></div>

    <div class="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      
      <button 
        @click="zoomIn" 
        class="bg-white p-2 rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition active:scale-95"
        title="Acercar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <button 
        @click="zoomOut" 
        class="bg-white p-2 rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition active:scale-95"
        title="Alejar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>

      <button 
        @click="fitGraph" 
        class="bg-white p-2 rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition active:scale-95 mt-2"
        title="Centrar y Ajustar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>