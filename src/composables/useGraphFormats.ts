import { useGraph } from "./useGraph";
import type { Matrix } from "../types/graph";

export type FormatKey = "JSON" | "LaTeX" | "Dot" | "GraphML" | "CSV";

export interface GraphFormat {
	serialize: () => string;
	parse: (value: string) => boolean;
	mime: string;
	ext: string;
	accept: string;
}

// Format conversion functions moved from useGraph
const toJSON = () => {
	const { numNodes, rawMatrix } = useGraph();
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
	const { numNodes, rawMatrix } = useGraph();
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
	const { numNodes, rawMatrix, getGraphData } = useGraph();
	const { hasArc, isSymmetric } = getGraphData();
	const n = numNodes.value;
	let dot = isSymmetric ? "graph G {\n" : "digraph G {\n";
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (hasArc[i][j]) {
				const u = String.fromCharCode(65 + i);
				const v = String.fromCharCode(65 + j);
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

const toGraphML = () => {
	const { numNodes, rawMatrix, getGraphData } = useGraph();
	const { hasArc, isSymmetric } = getGraphData();
	const n = numNodes.value;
	let graphml = '<?xml version="1.0" encoding="UTF-8"?>\n';
	graphml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';
	graphml += '  <key id="weight" for="edge" attr.name="weight" attr.type="double"/>\n';
	graphml += `  <graph id="G" edgedefault="${isSymmetric ? 'undirected' : 'directed'}">\n`;

	// Add nodes
	for (let i = 0; i < n; i++) {
		graphml += `    <node id="n${i}"/>\n`;
	}

	// Add edges
	let edgeId = 0;
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (hasArc[i][j]) {
				const weight = rawMatrix.value[i][j];
				if (isSymmetric && i < j) {
					// For undirected graphs, only add edge once
					graphml += `    <edge id="e${edgeId}" source="n${i}" target="n${j}">\n`;
					graphml += `      <data key="weight">${weight}</data>\n`;
					graphml += '    </edge>\n';
					edgeId++;
				} else if (!isSymmetric) {
					// For directed graphs, add all edges
					graphml += `    <edge id="e${edgeId}" source="n${i}" target="n${j}">\n`;
					graphml += `      <data key="weight">${weight}</data>\n`;
					graphml += '    </edge>\n';
					edgeId++;
				}
			}
		}
	}

	graphml += '</graphml>';
	return graphml;
};

const toCSV = () => {
	const { numNodes, rawMatrix } = useGraph();
	const n = numNodes.value;

	// Create header row with node labels (A, B, C, ...)
	const headers = [''];
	for (let i = 0; i < n; i++) {
		headers.push(String.fromCharCode(65 + i));
	}

	const rows = [headers.join(',')];

	// Add data rows
	for (let i = 0; i < n; i++) {
		const row = [String.fromCharCode(65 + i)]; // Row header
		for (let j = 0; j < n; j++) {
			const val = rawMatrix.value[i][j];
			row.push(val === "" ? "0" : val.toString());
		}
		rows.push(row.join(','));
	}

	return rows.join('\n');
};

// Import functions moved from useGraph
const loadFromJSON = (jsonString: string): boolean => {
	const { numNodes, rawMatrix } = useGraph();
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
	const { numNodes, rawMatrix } = useGraph();
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
	const { numNodes, rawMatrix } = useGraph();
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

const loadFromGraphML = (graphmlString: string): boolean => {
	const { numNodes, rawMatrix } = useGraph();
	try {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(graphmlString, "text/xml");

		// Check for parser errors
		const parseError = xmlDoc.querySelector("parsererror");
		if (parseError) {
			throw new Error("Invalid XML format");
		}

		const graphElement = xmlDoc.querySelector("graph");
		if (!graphElement) {
			throw new Error("No graph element found");
		}

		// Get all nodes and edges
		const nodeElements = xmlDoc.querySelectorAll("node");
		const edgeElements = xmlDoc.querySelectorAll("edge");

		const n = nodeElements.length;
		if (n === 0) return false;

		// Create node mapping (n0 -> 0, n1 -> 1, etc.)
		const nodeMap = new Map<string, number>();
		nodeElements.forEach((node, index) => {
			const id = node.getAttribute("id");
			if (id) {
				nodeMap.set(id, index);
			}
		});

		// Initialize matrix
		const matrix: Matrix = Array(n)
			.fill(0)
			.map(() => Array(n).fill(""));

		numNodes.value = n;
		rawMatrix.value = matrix;

		// Process edges
		edgeElements.forEach((edge) => {
			const sourceId = edge.getAttribute("source");
			const targetId = edge.getAttribute("target");
			const sourceIdx = sourceId ? nodeMap.get(sourceId) : undefined;
			const targetIdx = targetId ? nodeMap.get(targetId) : undefined;

			if (sourceIdx !== undefined && targetIdx !== undefined) {
				// Get weight from data element
				let weight = "1"; // Default weight
				const dataElements = edge.querySelectorAll("data");
				dataElements.forEach((data) => {
					if (data.getAttribute("key") === "weight") {
						weight = data.textContent || "1";
					}
				});

				rawMatrix.value[sourceIdx][targetIdx] = weight;

				// Check if graph is undirected by looking at edgedefault
				const edgedefault = graphElement.getAttribute("edgedefault");
				if (edgedefault === "undirected") {
					rawMatrix.value[targetIdx][sourceIdx] = weight;
				}
			}
		});

		return true;
	} catch (e) {
		console.error("Error importing GraphML:", e);
		return false;
	}
};

const loadFromCSV = (csvString: string): boolean => {
	const { numNodes, rawMatrix } = useGraph();
	try {
		// Split into lines and filter out empty lines
		const lines = csvString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
		if (lines.length === 0) throw new Error("Empty CSV");

		// Parse CSV rows
		const rows = lines.map(line => line.split(',').map(cell => cell.trim()));

		// Check if we have a square matrix (including headers)
		const n = rows.length - 1; // Subtract 1 for header row
		if (n === 0) throw new Error("No data rows");
		if (rows[0].length - 1 !== n) throw new Error("Non-square matrix");

		// Validate all rows have the same number of columns
		for (let i = 1; i < rows.length; i++) {
			if (rows[i].length !== n + 1) throw new Error("Inconsistent row lengths");
		}

		// Initialize matrix
		const matrix: Matrix = Array(n).fill(0).map(() => Array(n).fill(""));

		numNodes.value = n;
		rawMatrix.value = matrix;

		// Fill matrix (skip header row and column)
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				const cellValue = rows[i + 1][j + 1];
				const numValue = parseFloat(cellValue);
				if (isNaN(numValue)) throw new Error(`Invalid number at row ${i + 1}, column ${j + 1}`);
				rawMatrix.value[i][j] = numValue === 0 ? "" : numValue.toString();
			}
		}

		// Ensure diagonal is 0
		for (let i = 0; i < n; i++) {
			rawMatrix.value[i][i] = "0";
		}

		return true;
	} catch (e) {
		console.error("Error importing CSV:", e);
		return false;
	}
};

export const useGraphFormats = () => {
	const formats: Record<FormatKey, GraphFormat> = {
		JSON: {
			serialize: toJSON,
			parse: loadFromJSON,
			mime: "application/json",
			ext: "json",
			accept: ".json",
		},
		LaTeX: {
			serialize: toLaTeX,
			parse: loadFromLaTeX,
			mime: "text/plain",
			ext: "tex",
			accept: ".tex",
		},
		Dot: {
			serialize: toDot,
			parse: loadFromDot,
			mime: "text/plain",
			ext: "dot",
			accept: ".dot,.gv",
		},
		GraphML: {
			serialize: toGraphML,
			parse: loadFromGraphML,
			mime: "application/xml",
			ext: "graphml",
			accept: ".graphml,.xml",
		},
		CSV: {
			serialize: toCSV,
			parse: loadFromCSV,
			mime: "text/csv",
			ext: "csv",
			accept: ".csv",
		},
	};

	const formatOrder: FormatKey[] = ["JSON", "LaTeX", "Dot", "GraphML", "CSV"];

	const getFormatByExtension = (filename: string): FormatKey | undefined => {
		const ext = filename.split(".").pop()?.toLowerCase();
		if (!ext) return undefined;

		return Object.entries(formats).find(([_, config]) =>
			config.accept
				.split(",")
				.map((e) => e.replace(".", ""))
				.includes(ext)
		)?.[0] as FormatKey;
	};

	return { formats, formatOrder, getFormatByExtension };
};
