import { ref, computed, watch } from "vue";
import type { Matrix, GraphData } from "../types/graph";

// Global state (shared between components)
const numNodes = ref<number>(4);
const rawMatrix = ref<Matrix>([]);
const highlightedPath = ref<string[]>([]);

export function useGraph() {
	const nodes = computed<string[]>(() =>
		Array.from({ length: numNodes.value }, (_, i) =>
			String.fromCharCode(65 + i)
		)
	);

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
		if (
			rawMatrix.value.length === newN &&
			rawMatrix.value.every((row) => row.length === newN)
		) {
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
				const numVal =
					typeof val === "string" && val === "" ? NaN : Number(val);

				const isEmpty = val === "" || val === null || val === undefined;
				const isZero = numVal === 0;
				const isMinusOne = numVal === -1;

				const isConnection =
					!isEmpty && !isMinusOne && !isNaN(numVal) && !isZero;

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
			// We save both directions to ensure vis-network detects it
			// regardless of how the edge is defined internally
			highlightedPath.value.push(u + v); // Ex: "AB"
			highlightedPath.value.push(v + u); // Ex: "BA"
		}
	};

	const toJSON = () => {
		return JSON.stringify(
			{
				numNodes: numNodes.value,
				rawMatrix: rawMatrix.value,
				timestamp: new Date().toISOString(), // Useful metadata
			},
			null,
			2
		); // Pretty indented
	};

	const toLaTeX = () => {
		const n = numNodes.value;
		let latex = "\\begin{pmatrix}\n";
		for (let i = 0; i < n; i++) {
			const row = [];
			for (let j = 0; j < n; j++) {
				const val = rawMatrix.value[i][j];
				row.push(val === "" ? "-" : val.toString());
			}
			latex += row.join(" & ") + " \\\\\n";
		}
		latex += "\\end{pmatrix}";
		return latex;
	};

	const toDot = () => {
		const { hasArc, isSymmetric } = getGraphData();
		const n = numNodes.value;
		let dot = isSymmetric ? "graph G {\n" : "digraph G {\n";
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (hasArc[i][j]) {
					const u = nodes.value[i];
					const v = nodes.value[j];
					const weight = rawMatrix.value[i][j];
					if (isSymmetric && i < j) {
						dot += `  ${u} -- ${v} [label="${weight}"];\n`;
					} else if (!isSymmetric) {
						dot += `  ${u} -> ${v} [label="${weight}"];\n`;
					}
				}
			}
		}
		dot += "}";
		return dot;
	};

	// --- NEW: Import state ---
	const loadFromJSON = (jsonString: string): boolean => {
		try {
			const parsed = JSON.parse(jsonString);

			// Basic validations to not break the app
			if (!parsed.rawMatrix || !Array.isArray(parsed.rawMatrix))
				throw new Error("Invalid format");
			if (typeof parsed.numNodes !== "number")
				throw new Error("Missing number of nodes");

			// Apply data
			numNodes.value = parsed.numNodes;
			rawMatrix.value = parsed.rawMatrix;

			return true; // Success
		} catch (e) {
			console.error("Error importing JSON:", e);
			return false; // Error
		}
	};

	const loadFromLaTeX = (latexString: string): boolean => {
		try {
			// Simple parser for LaTeX matrix like \begin{pmatrix} a & b \\ c & d \end{pmatrix}
			const matrixMatch = latexString.match(
				/\\begin\{pmatrix\}\s*(.*?)\s*\\end\{pmatrix\}/s
			);
			if (!matrixMatch) throw new Error("Invalid LaTeX format");

			const rows = matrixMatch[1]
				.split("\\\\")
				.map((r) => r.trim())
				.filter((r) => r.length > 0);
			const matrix = rows.map((row) =>
				row.split("&").map((cell) => cell.trim())
			);

			const n = matrix.length;
			if (n === 0 || matrix[0].length !== n)
				throw new Error("Non-square matrix");

			numNodes.value = n;
			rawMatrix.value = matrix.map((row) =>
				row.map((cell) => (cell === "-" || cell === "0" ? "" : cell))
			);

			// Ensure diagonal is 0
			for (let i = 0; i < n; i++) {
				rawMatrix.value[i][i] = "0";
			}
			return true;
		} catch (e) {
			console.error("Error importing LaTeX:", e);
			return false;
		}
	};

	const loadFromDot = (dotString: string): boolean => {
		try {
			// Simple parser for dot format
			const edgeRegex = /(\w+)\s*(--|->)\s*(\w+)\s*\[label="(\d+)"\]/g;

			const nodeSet = new Set<string>();
			const edges = [];

			let match;
			while ((match = edgeRegex.exec(dotString)) !== null) {
				const u = match[1];
				const type = match[2];
				const v = match[3];
				const weight = match[4];
				nodeSet.add(u);
				nodeSet.add(v);
				edges.push({ u, v, weight, isUndirected: type === "--" });
			}

			const nodesList = Array.from(nodeSet).sort();
			const n = nodesList.length;
			if (n === 0) return false;
			const matrix: Matrix = Array(n)
				.fill(0)
				.map(() => Array(n).fill(""));

			numNodes.value = n;
			rawMatrix.value = matrix;

			edges.forEach((edge) => {
				const uIdx = nodesList.indexOf(edge.u);
				const vIdx = nodesList.indexOf(edge.v);
				rawMatrix.value[uIdx][vIdx] = edge.weight;
				if (edge.isUndirected) {
					rawMatrix.value[vIdx][uIdx] = edge.weight;
				}
			});

			return true;
		} catch (e) {
			console.error("Error importing Dot:", e);
			return false;
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
		toJSON,
		toLaTeX,
		toDot,
		loadFromJSON,
		loadFromLaTeX,
		loadFromDot,
		toIdx,
		toChar,
	};
}
