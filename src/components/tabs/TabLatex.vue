<script setup lang="ts">
import { ref } from 'vue';
import { useGraph } from '../../composables/useGraph';

// 1. Obtenemos acceso al composable global
const { getGraphData, nodes } = useGraph();

// 2. Estado local
const latexOutput = ref<string>('');
const showToast = ref<boolean>(false);

// 3. Generar código LaTeX
const generateLatex = () => {
  const { n, rawValues } = getGraphData();
  
  // Definir columnas: |c|c|c|...
  const cols = "|c".repeat(n + 1) + "|";

  let t = `\\begin{table}[h]\n\\centering\n\\begin{tabular}{${cols}}\n\\hline\n`;
  
  // Cabecera: Vacio & A & B & C ...
  t += ` & ${nodes.value.join(" & ")} \\\\ \\hline\n`;

  // Filas
  for (let i = 0; i < n; i++) {
    // Etiqueta de fila (A, B, C...)
    t += nodes.value[i];
    
    for (let j = 0; j < n; j++) {
      let val = rawValues[i][j];
      
      // Lógica de visualización:
      // Si es null o string vacío -> Espacio en blanco
      // Si tiene valor -> El valor
      // Nota: rawValues viene del input directo, así que conserva el formato visual
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

// 4. Copiar al portapapeles
const copyToClipboard = async () => {
  if (!latexOutput.value) return;
  
  try {
    await navigator.clipboard.writeText(latexOutput.value);
    // Mostrar Toast
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  } catch (err) {
    console.error('Error al copiar: ', err);
  }
};
</script>

<template>
  <div class="animate-fade-in relative">
    
    <div class="flex flex-col sm:flex-row gap-4 mb-4">
      <button 
        @click="generateLatex" 
        class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <span>⚡ Generar LaTeX</span>
      </button>

      <button 
        @click="copyToClipboard" 
        :disabled="!latexOutput"
        class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>📋 Copiar al Portapapeles</span>
      </button>
    </div>

    <div class="relative">
      <textarea 
        v-model="latexOutput" 
        readonly
        placeholder="Pulsa 'Generar LaTeX' para ver el código aquí..."
        class="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 text-gray-700 resize-none shadow-inner"
      ></textarea>
      
      <div v-if="!latexOutput" class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <span class="text-4xl">📝</span>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="showToast" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span>¡Código copiado!</span>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* Animación de entrada del contenido */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Transición del Toast */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>