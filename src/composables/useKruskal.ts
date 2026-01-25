import type { MSTResult } from "../types/graph";

interface Edge {
	u: number;
	v: number;
	w: number;
	id: string;
}

class UnionFind {
	parent: number[];
	constructor(n: number) {
		this.parent = Array.from({ length: n }, (_, i) => i);
	}
	find(i: number): number {
		if (this.parent[i] === i) return i;
		this.parent[i] = this.find(this.parent[i]);
		return this.parent[i];
	}
	union(i: number, j: number): boolean {
		const rootI = this.find(i);
		const rootJ = this.find(j);
		if (rootI === rootJ) return false;
		this.parent[rootI] = rootJ;
		return true;
	}
}

const formatEdgeId = (u: number, v: number, labels: string[]): string => {
	const n1 = labels[u];
	const n2 = labels[v];
	return n1 < n2 ? n1 + n2 : n2 + n1;
};

export const computeKruskal = (
	matrix: number[][],
	nodeLabels: string[]
): MSTResult => {
	const n = matrix.length;
	const edges: Edge[] = [];

	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			if (matrix[i][j] !== Infinity) {
				edges.push({
					u: i,
					v: j,
					w: matrix[i][j],
					id: formatEdgeId(i, j, nodeLabels),
				});
			}
		}
	}

	edges.sort((a, b) => (a.w !== b.w ? a.w - b.w : a.id.localeCompare(b.id)));

	const uf = new UnionFind(n);
	const mstEdges: Edge[] = [];
	let mstCost = 0;

	for (const e of edges) {
		if (uf.union(e.u, e.v)) {
			mstEdges.push(e);
			mstCost += e.w;
		}
	}

	mstEdges.sort((a, b) => (a.w !== b.w ? a.w - b.w : a.id.localeCompare(b.id)));

	const edgeString = mstEdges.map((e) => e.id).join(", ");

	// Connectivity check and uniqueness determination
	let connectedCount = 0;
	const root = uf.find(0);
	for (let i = 0; i < n; i++) {
		if (uf.find(i) === root) connectedCount++;
	}

	let uniqueStatus: 'uniqueYes' | 'uniqueNo' | 'notConnected' = 'uniqueYes';

	if (connectedCount < n) {
		uniqueStatus = 'notConnected';
	} else {
		let isUnique = true;
		for (const edgeToRemove of mstEdges) {
			const ufTest = new UnionFind(n);
			let testCost = 0;
			let edgesCount = 0;
			for (const e of edges) {
				if (e === edgeToRemove) continue;
				if (ufTest.union(e.u, e.v)) {
					testCost += e.w;
					edgesCount++;
				}
			}
			if (edgesCount === n - 1 && testCost === mstCost) {
				isUnique = false;
				break;
			}
		}
		uniqueStatus = isUnique ? 'uniqueYes' : 'uniqueNo';
	}

	return { cost: mstCost, edges: edgeString, isUniqueKey: uniqueStatus };
};
