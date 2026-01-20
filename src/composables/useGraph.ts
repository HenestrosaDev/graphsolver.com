import { ref, computed, watch } from 'vue';
import type { Matrix, GraphData } from '../types/graph';

// Estado global (compartido entre componentes)
const numNodes = ref<number>(4);
const rawMatrix = ref<Matrix>([]);
const treatZeroAsNull = ref<boolean>(true);
const highlightedPath = ref<string[]>([]);

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

  // Watcher para redimensionar reactivamente
  watch(numNodes, (newN, oldN) => {
    if (newN < 2) return; // Mínimo de seguridad
    if (!rawMatrix.value.length) {
      createGrid();
      return;
    }

    const currentMatrix = rawMatrix.value;
    const newMatrix: Matrix = [];

    // Crear nueva matriz con el tamaño correcto
    for (let i = 0; i < newN; i++) {
      const newRow: (number | string)[] = [];
      for (let j = 0; j < newN; j++) {
        if (i < oldN && j < oldN) {
          // Copiar valores existentes
          newRow.push(currentMatrix[i][j]);
        } else {
          // Nuevas celdas: diagonal = 0, resto = vacío
          newRow.push(i === j ? 0 : '');
        }
      }
      newMatrix.push(newRow);
    }

    // Reasignar la matriz completa para asegurar reactividad
    rawMatrix.value = newMatrix;
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
    const n = numNodes.value;
    
    // Configuración
    const connectionProbability = 0.5; // 50% de probabilidad de conexión
    const maxWeight = 20; 
    
    const newMatrix: Matrix = [];

    for (let i = 0; i < n; i++) {
      const row: (number | string)[] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          row.push(0);
        } else {
          const hasConnection = Math.random() < connectionProbability;
          if (hasConnection) {
            const weight = Math.floor(Math.random() * maxWeight) + 1;
            row.push(weight);
          } else {
            row.push('');
          }
        }
      }
      newMatrix.push(row);
    }
    
    rawMatrix.value = newMatrix;
  };

  const clearMatrix = () => {
    const n = numNodes.value;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          rawMatrix.value[i][j] = 0;
        } else {
          rawMatrix.value[i][j] = ''; 
        }
      }
    }
  };

  const clearHighlights = () => {
    highlightedPath.value = [];
  };

  const setHighlightPath = (nodesInPath: string[]) => {
    highlightedPath.value = [];
    if (nodesInPath.length < 2) return;

    for (let i = 0; i < nodesInPath.length - 1; i++) {
      const u = nodesInPath[i];
      const v = nodesInPath[i+1];
      // Guardamos ambas direcciones para asegurar que vis-network lo detecte
      // independientemente de cómo esté definida la arista internamente
      highlightedPath.value.push(u + v); // Ej: "AB"
      highlightedPath.value.push(v + u); // Ej: "BA"
    }
  };

  const toIdx = (char: string): number => char.toUpperCase().charCodeAt(0) - 65;
  const toChar = (idx: number): string => String.fromCharCode(65 + idx);

  return {
    numNodes,
    rawMatrix,
    treatZeroAsNull,
    nodes,
    highlightedPath,
    clearHighlights,
    setHighlightPath,
    createGrid,
    getGraphData,
    generateRandomGraph,
    clearMatrix,
    toIdx,
    toChar
  };
}