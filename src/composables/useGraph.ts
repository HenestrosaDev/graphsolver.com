import { ref, computed, watch } from 'vue';
import type { Matrix, GraphData } from '../types/graph';

// Estado global
const numNodes = ref<number>(4);
const rawMatrix = ref<Matrix>([]);
const treatZeroAsNull = ref<boolean>(true);

export function useGraph() {
  
  const nodes = computed<string[]>(() => 
    Array.from({ length: numNodes.value }, (_, i) => String.fromCharCode(65 + i))
  );

  // Función para inicializar desde cero (reset total)
  const createGrid = (): void => {
    const n = numNodes.value;
    const newMatrix: Matrix = [];
    for (let i = 0; i < n; i++) {
      const row: (number | string)[] = [];
      for (let j = 0; j < n; j++) {
        row.push(i === j ? 0 : '');
      }
      newMatrix.push(row);
    }
    rawMatrix.value = newMatrix;
  };

  // --- NUEVO: Watcher para redimensionar reactivamente ---
  watch(numNodes, (newN, oldN) => {
    if (newN < 2) return; // Mínimo de seguridad
    if (!rawMatrix.value.length) {
      createGrid();
      return;
    }

    const currentMatrix = rawMatrix.value;

    if (newN > oldN) {
      // 1. Agrandar: Añadir columnas a las filas existentes
      for (let i = 0; i < oldN; i++) {
        for (let j = oldN; j < newN; j++) {
          currentMatrix[i].push(''); // Rellenar nuevas columnas con vacío
        }
      }
      // 2. Agrandar: Añadir nuevas filas completas
      for (let i = oldN; i < newN; i++) {
        const newRow: (number | string)[] = [];
        for (let j = 0; j < newN; j++) {
          newRow.push(i === j ? 0 : ''); // Diagonal 0, resto vacío
        }
        currentMatrix.push(newRow);
      }
    } else if (newN < oldN) {
      // 1. Encoger: Cortar filas sobrantes
      currentMatrix.length = newN;
      // 2. Encoger: Cortar columnas sobrantes de las filas restantes
      for (let i = 0; i < newN; i++) {
        currentMatrix[i].length = newN;
      }
    }
    // No hace falta reasignar rawMatrix.value porque los arrays son reactivos en Vue
  });

  const getGraphData = (): GraphData => {
    const n = numNodes.value;
    const matrix: number[][] = [];
    const hasArc: boolean[][] = [];
    let isSymmetric = true;

    for(let i=0; i<n; i++) {
      matrix[i] = [];
      hasArc[i] = [];
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const val = rawMatrix.value[i]?.[j]; // Optional chaining por seguridad
        const numVal = typeof val === 'string' && val === '' ? NaN : Number(val);
        
        const isEmpty = (val === '' || val === null || val === undefined);
        const isZero = (numVal === 0);
        const isMinusOne = (numVal === -1);
        
        const isConnection = !isEmpty && !isMinusOne && !isNaN(numVal) && !(isZero && treatZeroAsNull.value);

        if (!isConnection) {
          matrix[i][j] = Infinity;
          hasArc[i][j] = false;
        } else {
          matrix[i][j] = numVal;
          hasArc[i][j] = (i !== j);
        }
      }
    }

    for(let i=0; i<n; i++) {
      for(let j=0; j<n; j++) {
        if(hasArc[i][j] !== hasArc[j][i]) {
          isSymmetric = false;
          break;
        }
      }
    }

    return { 
      n, 
      matrix, 
      hasArc, 
      isSymmetric, 
      rawValues: rawMatrix.value, 
      nodes: nodes.value 
    };
  };

	const generateRandomGraph = () => {
    // CAMBIO: Usamos el valor actual seleccionado por el usuario
    const n = numNodes.value;
    
    // Configuración
    const connectionProbability = 0.5; // 50% de probabilidad de conexión
    const maxWeight = 20; // Pesos entre 1 y 20 para que no salgan números gigantes
    
    const newMatrix: Matrix = [];

    for (let i = 0; i < n; i++) {
      const row: (number | string)[] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          // Diagonal siempre 0
          row.push(0);
        } else {
          // Decidir si hay conexión o está vacío
          const hasConnection = Math.random() < connectionProbability;
          
          if (hasConnection) {
            // Generar peso random
            const weight = Math.floor(Math.random() * maxWeight) + 1;
            row.push(weight);
          } else {
            // Dejar vacío (infinito)
            row.push('');
          }
        }
      }
      newMatrix.push(row);
    }
    
    // Actualizamos la matriz manteniendo el tamaño actual
    rawMatrix.value = newMatrix;
  };

  const toIdx = (char: string): number => char.toUpperCase().charCodeAt(0) - 65;
  const toChar = (idx: number): string => String.fromCharCode(65 + idx);

  return {
    numNodes,
    rawMatrix,
    treatZeroAsNull,
    nodes,
    createGrid,
    getGraphData,
    generateRandomGraph,
    toIdx,
    toChar
  };
}