import { ref, computed, watch } from "vue";
import type { Matrix, GraphData } from "../types/graph";

// Global state (shared between components)
const numNodes = ref<number>(4);
const rawMatrix = ref<Matrix>([]);
const highlightedPath = ref<string[]>([]);

export function useGraph() {
	const nodes = computed<string[]>(() => Array.from({ length: numNodes.value }, (_, i) => String.fromCharCode(65 + i)));

	// Function to initialize from scratch (total reset)
	const createGrid = (): void => {
		const n = numNodes.value;
		const newMatrix: Matrix = [];
		for (let i = 0; i < n; i++) {
			const row: (number | string)[] = [];
			for (let j = 0; j < n; j++) {
				row.push(i === j ? 0 : "");
			}
			newMatrix.push(row);
		}
		rawMatrix.value = newMatrix;
	};

	// Watcher to resize reactively
	watch(numNodes, (newN, oldN) => {
		if (newN < 2) return; // Minimum safety
		if (!rawMatrix.value.length) {
			createGrid();
			return;
		}

		// If the matrix already has the correct size, do not resize (for imports)
		if (rawMatrix.value.length === newN && rawMatrix.value.every((row) => row.length === newN)) {
			return;
		}

		const currentMatrix = rawMatrix.value;
		const newMatrix: Matrix = [];

		// Create new matrix with the correct size
		for (let i = 0; i < newN; i++) {
			const newRow: (number | string)[] = [];
			for (let j = 0; j < newN; j++) {
				if (i < oldN && j < oldN) {
					// Copy existing values
					newRow.push(currentMatrix[i][j]);
				} else {
					// New cells: diagonal = 0, rest = empty
					newRow.push(i === j ? 0 : "");
				}
			}
			newMatrix.push(newRow);
		}

		// Reassign the complete matrix to ensure reactivity
		rawMatrix.value = newMatrix;
	});

	const getGraphData = (): GraphData => {
		const n = numNodes.value;
		const matrix: number[][] = [];
		const hasArc: boolean[][] = [];
		let isSymmetric = true;

		for (let i = 0; i < n; i++) {
			matrix[i] = [];
			hasArc[i] = [];
		}

		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const val = rawMatrix.value[i]?.[j]; // Optional chaining for safety
				const numVal = typeof val === "string" && val === "" ? NaN : Number(val);

				const isEmpty = val === "" || val === null || val === undefined;
				const isZero = numVal === 0;
				const isMinusOne = numVal === -1;

				const isConnection = !isEmpty && !isMinusOne && !isNaN(numVal) && !isZero;

				if (!isConnection) {
					matrix[i][j] = Infinity;
					hasArc[i][j] = false;
				} else {
					matrix[i][j] = numVal;
					hasArc[i][j] = i !== j;
				}
			}
		}

		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (hasArc[i][j] !== hasArc[j][i]) {
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
			nodes: nodes.value,
		};
	};

	const generateRandomGraph = () => {
		const n = numNodes.value;

		// Configuration
		const connectionProbability = 0.5; // 50% connection probability
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
						row.push("");
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
					rawMatrix.value[i][j] = "";
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
			const v = nodesInPath[i + 1];
			// Only highlight the directed edge in the path direction
			highlightedPath.value.push(u + v);
		}
	};

	const toIdx = (char: string | undefined | null): number => {
		if (!char) return -1;
		return char.toUpperCase().charCodeAt(0) - 65;
	};
	const toChar = (idx: number): string => String.fromCharCode(65 + idx);

	return {
		numNodes,
		rawMatrix,
		nodes,
		highlightedPath,
		clearHighlights,
		setHighlightPath,
		createGrid,
		getGraphData,
		generateRandomGraph,
		clearMatrix,
		toIdx,
		toChar,
	};
}
