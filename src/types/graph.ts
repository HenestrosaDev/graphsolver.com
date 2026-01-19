export type MatrixRow = (number | string)[];
export type Matrix = MatrixRow[];

export interface GraphData {
	n: number;
	matrix: number[][];    // Matriz procesada con Infinity/números
	hasArc: boolean[][];   // Matriz booleana de adyacencia
	isSymmetric: boolean;
	rawValues: Matrix;     // Matriz cruda (inputs del usuario)
	nodes: string[];       // Array de etiquetas ['A', 'B', 'C'...]
}

export interface MSTResult {
	cost: number;
	edges: string;
	isUnique: boolean | string; // Puede ser string "Grafo no conexo"
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
	compCc: number | string;
}

export interface FloydStep {
	title: string;
	matrix: number[][];
	pivot: number;
}