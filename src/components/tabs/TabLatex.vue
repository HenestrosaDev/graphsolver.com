<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGraph } from '../../composables/useGraph';
import { useToast } from '../../composables/useToast';

const { getGraphData, nodes, rawMatrix, numNodes } = useGraph();
const { triggerToast } = useToast();

const latexOutput = ref<string>('');

// Generar código LaTeX automáticamente
const generateLatex = () => {
  const { n, rawValues } = getGraphData();
  
  // Definir columnas: |c|c|c|...
  const cols = "|c".repeat(n + 1) + "|";

  let t = `\\begin{table}[h]\n\\centering\n\\begin{tabular}{${cols}}\n\\hline\n`;
  
  // Cabecera: Vacio & A & B & C ...
  t += ` & ${nodes.value.join(" & ")} \\\\ \\hline\n`;

  // Filas
  for (let i = 0; i < n; i++) {
    t += nodes.value[i]; // Etiqueta fila
    
    for (let j = 0; j < n; j++) {
      let val = rawValues[i][j];
      
      // Lógica de visualización cruda
      if (val === '' || val === null) {
        t += " & "; 
      } else {
        t += ` & ${val}`;
      }
    }
    t += " \\\\ \\hline\n";
  }

  t += "\\end{tabular}\n\\caption{Matriz de Adyacencia}\\end{table}";
  
  latexOutput.value = t;
};

// Copiar al portapapeles
const copyToClipboard = async () => {
  if (!latexOutput.value) return;
  try {
    await navigator.clipboard.writeText(latexOutput.value);
    triggerToast('¡Código LaTeX copiado!');
  } catch (err) {
    console.error('Error al copiar: ', err);
  }
};

// Reactividad automática
watch(
  [rawMatrix, numNodes], 
  () => generateLatex(), 
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="animate-fade-in">
    <div class="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-900">
      
      <button 
        @click="copyToClipboard" 
        class="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/10 transition-all duration-200 backdrop-blur-md text-xs font-medium z-10 active:scale-95 opacity-70 group-hover:opacity-100"
        title="Copiar al portapapeles"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        <span>Copiar Código</span>
      </button>

      <textarea 
        v-model="latexOutput" 
        readonly
        class="w-full h-80 p-5 font-mono text-sm bg-gray-900 text-gray-300 outline-none resize-none block selection:bg-blue-500/30"
        spellcheck="false"
      ></textarea>
      
      <div class="bg-gray-800 text-gray-500 px-4 py-1 text-[10px] font-mono border-t border-gray-700 flex justify-between">
        <span>LaTeX Generated</span>
        <span>{{ latexOutput.length }} chars</span>
      </div>
    </div>
    
    <p class="mt-3 text-xs text-gray-500 text-center">
      Este código genera una tabla formateada lista para pegar en documentos LaTeX.
    </p>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>