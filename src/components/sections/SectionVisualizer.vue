<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'; // Added onUnmounted
import { Network, type Data } from 'vis-network';
import { DataSet } from 'vis-data';
import { useGraph } from '../../composables/useGraph';
import { useToast } from '../../composables/useToast';

const { getGraphData, nodes, highlightedPath } = useGraph();
const { triggerToast } = useToast();

const networkContainer = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
let networkInstance: Network | null = null;
let resizeObserver: ResizeObserver | null = null;

const isLocked = ref(true);
const showOverlayHint = ref(false);
let overlayTimeout: number | null = null;

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

const toggleLock = () => {
  isLocked.value = !isLocked.value;
  if (!isLocked.value) showOverlayHint.value = false;
  
  const msg = isLocked.value ? 'Modo scroll activado' : 'Modo interacción activado';
  triggerToast(msg);
};

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
      margin: 15,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', x: 2, y: 2 }
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
          arrows: isSymmetric ? undefined : { to: { enabled: true, scaleFactor: 1 } },
          color: isHighlighted ? { color: '#ef4444', highlight: '#ef4444' } : { color: '#64748b', highlight: '#2563EB' },
          font: { align: 'middle', color: '#000000', strokeWidth: 0, background: 'rgba(255,255,255,0.85)', size: 14 },
          width: isHighlighted ? 4 : 2,
          smooth: { type: 'curvedCW', roundness: 0.2 } 
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
    // Make sure height is 100% to fill container
    height: '100%',
    width: '100%',
    physics: {
      enabled: true,
      solver: 'repulsion', 
      repulsion: {
        nodeDistance: 250,
        centralGravity: 0.2,
        springLength: 250,
        springConstant: 0.05,
        damping: 0.09
      },
      stabilization: { 
        enabled: true,
        iterations: 1000,
        updateInterval: 25
      }
    },
    interaction: {
      hover: true,
      zoomView: false,
      dragView: true,
      dragNodes: true
    },
    layout: { randomSeed: 10 } 
  };

  networkInstance = new Network(networkContainer.value, data as unknown as Data, options);
};

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

const exportImage = () => {
  if (!networkContainer.value || !networkInstance) return;

  // 1. Encontrar el elemento canvas dentro del contenedor
  const canvas = networkContainer.value.querySelector('canvas');
  if (!canvas) return;

  // 2. Obtener el contexto 2D
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 3. Guardar el estado actual del canvas
  ctx.save();

  // 4. Dibujar un fondo blanco detrás de todo (destination-over)
  // Esto es necesario porque el canvas de vis-network es transparente por defecto.
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = '#ffffff';
  // Usamos el ancho/alto interno del canvas para cubrirlo todo
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 5. Obtener la imagen en base64
  const dataURL = canvas.toDataURL('image/png');

  // 6. Restaurar el estado del canvas (volver a hacerlo transparente para la interacción)
  ctx.restore();

  // 7. Crear un enlace temporal para forzar la descarga
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `grafo-exportado-${new Date().getTime()}.png`; // Nombre único con timestamp
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  triggerToast('Imagen descargada correctamente');
};

// --- Ciclo de Vida ---
onMounted(() => {
  drawGraph();

  // Watch for container resizing to update the canvas
  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => {
        // This forces Vis.js to recalculate the canvas size
        if (networkInstance) {
            networkInstance.setSize('100%', '100%');
            networkInstance.redraw();
        }
    });
    resizeObserver.observe(wrapperRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(
  [() => getGraphData(), highlightedPath], 
  () => drawGraph(),
  { deep: true }
);
</script>

<template>
  <div class="animate-fade-in relative group z-0 w-full h-full">
    
    <div 
      ref="wrapperRef"
      class="relative w-full h-full min-h-[550px] border border-gray-200 rounded-xl bg-slate-50 shadow-inner overflow-hidden"
    >
        
        <div 
          ref="networkContainer" 
          class="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        ></div>

        <div 
          v-if="isLocked"
          class="absolute inset-0 z-10 md:hidden touch-pan-y flex items-center justify-center pb-32"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <Transition name="fade">
            <div 
              v-if="showOverlayHint"
              class="bg-slate-900/70 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-white p-6 text-center select-none mx-6 shadow-2xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p class="font-bold text-lg">Mapa bloqueado</p>
              <p class="text-sm text-slate-200 mt-1 leading-snug">
                Desbloquea el mapa para interactuar.
              </p>
            </div>
          </Transition>
        </div>
    </div>

    <div class="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
      
      <button 
        @click="toggleLock" 
        class="md:hidden bg-white p-2 rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition active:scale-95 mb-2"
        :class="{ 'ring-2 ring-blue-400 text-blue-600': !isLocked }"
        :title="isLocked ? 'Desbloquear' : 'Bloquear'"
      >
        <svg v-if="isLocked" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      </button>

      <button
        @click="exportImage" 
        class="bg-white p-2 rounded-lg shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition active:scale-95 mb-2"
        title="Descargar como imagen PNG"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

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