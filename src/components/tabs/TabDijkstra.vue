<script setup lang="ts">
import { ref } from 'vue';
import { useGraph } from '../../composables/useGraph';

// Definimos la interfaz para los pasos de la tabla
interface DijkstraStep {
  step: number;
  dists: (number | string)[]; // Puede ser número o símbolo de infinito
  pivot: string;
}

const { getGraphData, nodes, toIdx } = useGraph();

// Estado Reactivo
const startNode = ref<string>('A');
const endNode = ref<string>('G');
const steps = ref<DijkstraStep[]>([]);
const finalCost = ref<string | number>('-');
const finalPath = ref<string>('-');
const isSolved = ref(false);

const solveDijkstra = () => {
  const { n, matrix } = getGraphData();
  
  // Validar entradas
  const sIdx = toIdx(startNode.value);
  const eIdx = toIdx(endNode.value);
  
  if (sIdx < 0 || sIdx >= n || eIdx < 0 || eIdx >= n) {
    alert("Nodos de origen o destino no válidos");
    return;
  }

  // Inicialización
  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  const parent = new Array(n).fill(null);
  
  dist[sIdx] = 0;
  steps.value = []; // Reset pasos

  // Bucle principal (n iteraciones)
  for (let i = 0; i < n; i++) {
    // 1. Encontrar nodo no visitado con menor distancia (Pivote)
    let u = -1;
    let minVal = Infinity;

    for (let v = 0; v < n; v++) {
      if (!visited[v] && dist[v] < minVal) {
        minVal = dist[v];
        u = v;
      }
    }

    // Preparar datos para la tabla (visualización)
    // Convertimos Infinity a -1 para visualizar como pedía tu ejercicio original, 
    // o puedes usar '∞' si prefieres estética. Aquí uso lógica mixta: -1 en datos, ∞ visual.
    const currentDistDisplay = dist.map(d => d === Infinity ? -1 : d);
    
    const pivotChar = (u !== -1) ? nodes.value[u] : "-";

    // Guardar paso
    steps.value.push({
      step: i,
      dists: currentDistDisplay,
      pivot: pivotChar
    });

    // Si no quedan nodos alcanzables o ya llegamos (opcional break), paramos
    if (u === -1) break;
    
    visited[u] = true;

    // 2. Relajar aristas (Actualizar vecinos)
    for (let v = 0; v < n; v++) {
      // Si no visitado, hay arista válida y la distancia actual no es infinita
      if (!visited[v] && matrix[u][v] !== Infinity && dist[u] !== Infinity) {
        if (dist[u] + matrix[u][v] < dist[v]) {
          dist[v] = dist[u] + matrix[u][v];
          parent[v] = u;
        }
      }
    }
  }

  // Reconstrucción del camino
  if (dist[eIdx] === Infinity) {
    finalCost.value = "Inalcanzable";
    finalPath.value = "No existe camino";
  } else {
    finalCost.value = dist[eIdx];
    let curr: number | null = eIdx;
    let pathArr: string[] = [];
    
    while (curr !== null) {
      pathArr.push(nodes.value[curr]);
      curr = parent[curr];
    }
    // El camino se reconstruye al revés
    finalPath.value = pathArr.reverse().join("");
  }

  isSolved.value = true;
};
</script>

<template>
  <div class="animate-fade-in">
    <div class="flex flex-wrap items-end gap-4 mb-6 bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm">
      
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500 uppercase">Origen</label>
        <select v-model="startNode" class="w-20 p-2 border border-blue-300 rounded font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
          <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500 uppercase">Destino</label>
        <select v-model="endNode" class="w-20 p-2 border border-blue-300 rounded font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
          <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <button @click="solveDijkstra" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-all duration-200 active:scale-95 h-[42px]">
        Calcular Camino Mínimo
      </button>
    </div>

    <div v-if="isSolved" class="space-y-6">
      
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 class="font-bold text-gray-700">Tabla de Pasos</h3>
          <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">-1 indica Infinito (∞)</span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 font-bold">Iteración</th>
                <th v-for="n in nodes" :key="n" class="px-4 py-3 text-center">{{ n }}</th>
                <th class="px-4 py-3 text-center text-blue-600 font-bold">Pivot</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in steps" :key="row.step" class="hover:bg-blue-50/50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  Paso i={{ row.step }}
                </td>
                <td v-for="(val, idx) in row.dists" :key="idx" class="px-4 py-3 text-center font-mono text-gray-600">
                  {{ val }}
                </td>
                <td class="px-4 py-3 text-center font-bold text-pink-600 bg-pink-50/30">
                  {{ row.pivot }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-sm">
        
        <div class="flex-1 w-full text-center md:text-left">
          <span class="block text-xs font-bold text-gray-500 uppercase mb-1">Coste Mínimo</span>
          <div class="bg-white p-3 rounded border border-green-200 inline-block w-full md:w-auto min-w-[120px]">
            <span class="text-2xl font-mono font-bold text-green-700">{{ finalCost }}</span>
          </div>
        </div>

        <div class="flex-[2] w-full text-center md:text-left">
          <span class="block text-xs font-bold text-gray-500 uppercase mb-1">Camino Reconstruido</span>
          <div class="bg-white p-3 rounded border border-green-200 block w-full">
            <span class="text-xl font-mono font-bold text-blue-600 tracking-wider break-all">
              {{ finalPath }}
            </span>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>