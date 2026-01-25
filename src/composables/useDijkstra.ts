export interface DijkstraStep {
	step: number;
	dists: (number | string)[];
	pivot: string;
	changes: number[];
}

export interface DijkstraResult {
	steps: DijkstraStep[];
	cost: number | null;
	path: string | null;
	pathArr: string[];
	status: "ok" | "unreachable";
}

const formatPath = (indices: number[], labels: string[]): string[] =>
	indices.map((idx) => labels[idx]);

export const computeDijkstra = (
	matrix: number[][],
	nodeLabels: string[],
	startLabel: string,
	endLabel: string
): DijkstraResult => {
	const n = matrix.length;
	const startIdx = nodeLabels.indexOf(startLabel);
	const endIdx = nodeLabels.indexOf(endLabel);

	if (startIdx < 0 || endIdx < 0) {
		return {
			steps: [],
			cost: null,
			path: null,
			pathArr: [],
			status: "unreachable",
		};
	}

	const dist = new Array(n).fill(Infinity);
	const visited = new Array(n).fill(false);
	const parent: Array<number | null> = new Array(n).fill(null);
	const steps: DijkstraStep[] = [];

	dist[startIdx] = 0;

	// Track changes from the *previous* iteration to display in the *current* row
	let previousChanges: number[] = [];

	for (let i = 0; i < n; i++) {
		let u = -1;
		let minVal = Infinity;

		// Select Pivot (u)
		for (let v = 0; v < n; v++) {
			if (!visited[v] && dist[v] < minVal) {
				minVal = dist[v];
				u = v;
			}
		}

		// Record the state (Snapshot BEFORE relaxation)
		// Row 0 will show: Pivot A, Dists [0, ∞...], Changes []
		steps.push({
			step: i,
			dists: dist.map((d) => (d === Infinity ? "∞" : d)),
			pivot: u !== -1 ? nodeLabels[u] : "-",
			changes: [...previousChanges], // Highlights the changes that led to THIS state
		});

		if (u === -1) break;

		visited[u] = true;
		previousChanges = []; // Reset for the calculations we are about to do

		// Relax edges (update neighbors)
		for (let v = 0; v < n; v++) {
			if (!visited[v] && matrix[u][v] !== Infinity && dist[u] !== Infinity) {
				if (dist[u] + matrix[u][v] < dist[v]) {
					dist[v] = dist[u] + matrix[u][v];
					parent[v] = u;
					previousChanges.push(v); // Mark this index as changed for the NEXT row
				}
			}
		}
	}

	// --- Path Reconstruction ---
	if (dist[endIdx] === Infinity) {
		return {
			steps,
			cost: null,
			path: null,
			pathArr: [],
			status: "unreachable",
		};
	}

	let curr: number | null = endIdx;
	const pathIndices: number[] = [];
	while (curr !== null) {
		pathIndices.push(curr);
		curr = parent[curr];
	}
	pathIndices.reverse();

	const pathArr = formatPath(pathIndices, nodeLabels);

	return {
		steps,
		cost: dist[endIdx],
		path: pathArr.join(" → "),
		pathArr,
		status: "ok",
	};
};
