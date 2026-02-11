export type MatrixRow = (number | string)[];
export type Matrix = MatrixRow[];

export interface GraphData {
	n: number;
	matrix: number[][]; // Processed matrix with Infinity/numbers
	hasArc: boolean[][]; // Boolean adjacency matrix
	isSymmetric: boolean;
	symmetryType: "strict" | "non-strict" | "asymmetric";
	rawValues: Matrix; // Raw matrix (user inputs)
	nodes: string[]; // Array of labels ['A', 'B', 'C'...]
}

export interface MSTResult {
	cost: number | string;
	edges: string;
	isUniqueKey: "uniqueYes" | "uniqueNo" | "notConnected" | "requiresUndirected";
}

export interface GraphAnalysis {
	orden: number;
	medida: number;
	isSymmetric: boolean;
	symmetryType: "strict" | "non-strict" | "asymmetric";
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
	hasCycles: boolean; // true if there are cycles
	isBipartite: boolean; // true if it admits 2-coloring
	structureType:
		| "tree"
		| "forest"
		| "connectedCyclic"
		| "disconnectedCyclic"
		| "weakConnectedCyclic"
		| "weakConnectedAcyclic"
		| "stronglyConnected"
		| "directedAcyclic";
	isHamiltonian: boolean | "npLimit"; // true, false o "NP"
}

export interface FloydStep {
	matrix: number[][];
	pivot: number;
	k?: number;
}
