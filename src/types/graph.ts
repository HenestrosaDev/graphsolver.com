export type MatrixRow = (number | string)[];
export type Matrix = MatrixRow[];

export interface GraphData {
	n: number;
	matrix: number[][]; // Matriz procesada con Infinity/números
	hasArc: boolean[][]; // Matriz booleana de adyacencia
	isSymmetric: boolean;
	rawValues: Matrix; // Matriz cruda (inputs del usuario)
	nodes: string[]; // Array de etiquetas ['A', 'B', 'C'...]
}

export interface MSTResult {
	cost: number;
	edges: string;
	isUnique: boolean | string;
}

export interface GraphAnalysis {
	orden: number;
	medida: number;
	isSymmetric: boolean;
	adjList: string;
	seq: string;
	isolated: number;
	cc: number;
	compSize: number;
	compCc: number;
	maxEdges: number;
	density: number; // 0 to 1
	isComplete: boolean; // true if density is 1
	minDegree: number; // δ
	maxDegree: number; // Δ
	isRegular: boolean; // true if min == max
	isTree: boolean; // true if connected & acyclic
	isForest: boolean; // true if acyclic (multiple trees)
	eulerianType: "cycle" | "path" | "none";
	isConnected: boolean; // cc == 1
	hasCycles: boolean; // true si hay bucles
	isBipartite: boolean; // true si admite 2-coloración
	structureType:
		| "tree"
		| "forest"
		| "connectedCyclic"
		| "disconnectedCyclic"
		| "weakConnectedCyclic"
		| "weakConnectedAcyclic"
		| "disconnected";
	isHamiltonian: boolean | "npLimit"; // true, false o "NP"
}

export interface FloydStep {
	matrix: number[][];
	pivot: number;
	k?: number;
}
