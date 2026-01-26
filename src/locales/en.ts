export default {
	head: {
		title: "GraphSolver | Interactive graph algorithm solver",
		description:
			"Interactive tool for solving graph algorithms like Dijkstra, Floyd-Warshall, and Kruskal. " +
			"Visualize and compute optimal paths in graphs.",
		keywords:
			"graph algorithms, dijkstra, floyd-warshall, kruskal, shortest path, " + "graph visualization, graph solver",
		ogImage: "/logo.svg",
	},
	common: {
		appName: "GraphSolver",
		notification: "Notification",
		close: "Close",
		yes: "Yes",
		no: "No",
		emptySet: "∅",
		showHelpTooltip: "Show help tooltip",
	},
	navbar: {
		githubTitle: "View code on GitHub",
	},
	footer: {
		help: "Help",
		github: "GitHub",
		madeBy: "Built by",
		madeWith: "with",
		love: "love",
		and: "and",
		vue: "Vue 3",
	},
	theme: {
		toLight: "Switch to light theme",
		toDark: "Switch to dark theme",
	},
	language: {
		es: "ES",
		en: "EN",
	},
	app: {
		adjacencyTitle: "Adjacency Matrix",
		analysisTitle: "Graph Analysis",
		visualizationTitle: "Visualization",
		algorithmsTitle: "Algorithms",
		propertiesTitle: "Properties",
		toast: {
			unsupportedFormat: "Unsupported format",
			importSuccess: "Graph imported successfully",
			invalidContent: "The file content is not valid",
			readError: "Error reading file",
			pasteSuccess: "Content imported",
			pasteError: "Invalid format",
		},
	},
	graphIO: {
		export: "Export",
		import: "Import",
		download: "Download",
		copy: "Copy",
		paste: "Paste",
		file: "File",
		text: "Text",
		exportToast: "Exported .{ext} file",
		copyToast: "{format} copied to clipboard",
		copyError: "Copy failed",
	},
	modalPaste: {
		title: "Paste content",
		formatLabel: "Format",
		contentLabel: "Content",
		placeholder: "Paste your graph data here (e.g. JSON format)",
		cancel: "Cancel",
		import: "Import",
	},
	modalExport: {
		title: "Export {format}",
		formatLabel: "Format",
		contentLabel: "Generated code",
		placeholder: "Select a format to see the generated code",
		copy: "Copy",
		download: "Download",
	},
	matrixInput: {
		vertices: "Vertices",
		random: "Random",
		randomTitle: "Generate random values",
		clear: "Clear",
		clearTitle: "Clear all values",
	},
	algorithmsSection: {
		label: "Algorithm",
		options: {
			dijkstra: "Dijkstra",
			floyd: "Floyd-Warshall",
			mst: "Kruskal (MST)",
		},
	},
	dijkstra: {
		routeTitle: "Route calculation",
		origin: "From",
		destination: "To",
		minCost: "Minimum cost",
		optimalPath: "Optimal path",
		iterationsTable: "Iteration table",
		iteration: "Iteration",
		pivot: "Pivot",
		stepLabel: "Step {step}",
		unreachableCost: "Unreachable",
		noPath: "No path",
	},
	floyd: {
		routeTitle: "Route calculation",
		origin: "From",
		destination: "To",
		minCost: "Minimum cost",
		optimalPath: "Optimal path",
		diameter: "Graph diameter",
		diameterTooltip: "Largest shortest-path distance between any connected pair of vertices.",
		iterationsTable: "Iteration table",
		stepCounter: "Step {current} of {total}",
		previous: "Previous",
		next: "Next",
		initialTitle: "Initial state",
		stepTitle: "Iteration k={k} (pivot {pivot})",
		initialDescription: "Initial adjacency matrix. Nodes not directly connected are ∞.",
		iterationDescription:
			"Computing routes through intermediate node {pivot}. " +
			"Highlighted rows and columns remain unchanged in this iteration.",
		unreachableCost: "Unreachable",
		noPath: "No path",
	},
	kruskal: {
		resultTitle: "Result",
		minCost: "Minimum cost",
		minCostTooltip:
			"Minimum cost required to connect all vertices in the graph.<br><br>" +
			"Calculation: After running Kruskal's algorithm, edges that would form cycles " +
			"are discarded and the remaining edge weights forming the Minimum Spanning Tree are summed.",
		edgesSelected: "Selected edges",
		edgesTooltip: "List of edges that form the Minimum Spanning Tree, ordered by weight " + "and lexicographically.",
		uniqueSolution: "Unique solution",
		uniqueTooltip:
			"Determines whether another set of edges could form a valid Minimum Spanning Tree " + "with the same total cost.",
		invalidGraph: "Invalid",
		requiresUndirected: "The algorithm expects an undirected graph",
		notConnected: "Graph is not connected (no spanning tree)",
		uniqueYes: "Yes",
		uniqueNo: "No",
	},
	visualizer: {
		overlayTitle: "Interaction disabled",
		overlayDescription: "Tap the lock 🔒 below to interact with the graph.",
		scrollMode: "Scroll mode enabled",
		interactionMode: "Interaction mode enabled",
		zoomOut: "Zoom out",
		zoomIn: "Zoom in",
		fitView: "Fit view",
		downloadPng: "Download as PNG",
		fullscreen: "Fullscreen",
		escHint: "Press ESC to exit",
		imageDownloaded: "Image downloaded successfully",
	},
	properties: {
		cardTitles: {
			basic: "Basic properties",
			degrees: "Degrees",
			vertices: "Vertices",
			topology: "Topology",
			eulerian: "Eulerian",
			complementary: "Complementary graph",
		},
		cardTooltips: {
			complementary:
				"The complementary graph Ḡ has the same vertices as the original, but its edges are " +
				"exactly the vertex pairs that are not adjacent in the base graph. Think of it as the " +
				"graph's 'negative': where there is an edge now, it disappears, and where there wasn't, it appears.",
		},
		labels: {
			graphType: "Graph type",
			order: "Order",
			measure: "Size",
			maxMeasure: "Maximum size",
			density: "Density",
			degreeSequence: "Degree sequence",
			minDegree: "Minimum degree (δ)",
			maxDegree: "Maximum degree (Δ)",
			regularity: "Regularity",
			adjacentsTo: "Adjacent to",
			connectedComponents: "Connected components",
			isolatedVertices: "Isolated vertices",
			connected: "Connected",
			structure: "Structural classification",
			bipartite: "Bipartite",
			eulerian: "Eulerian",
			hamiltonian: "Hamiltonian",
			complementaryOrder: "Order",
			complementaryMeasure: "Size",
			complementaryConnectedComponents: "Connected components",
		},
		values: {
			directed: "Directed (asymmetric)",
			undirected: "Undirected (symmetric)",
			regular: "{degree}-Regular",
			notRegular: "Not regular",
			yes: "Yes",
			no: "No",
			eulerian: {
				cycle: "Cycle",
				path: "Path",
				none: "No",
			},
			structure: {
				tree: "Tree",
				forest: "Forest",
				connectedCyclic: "Connected cyclic",
				disconnectedCyclic: "Disconnected with cycles",
				weakConnectedCyclic: "Weakly connected with cycles",
				disconnected: "Disconnected",
			},
			hamiltonian: {
				yes: "Yes",
				no: "No",
				npLimit: "NP-Limit (>12)",
			},
		},
		tooltips: {
			order: "Number of vertices in the graph. Denoted as <i>n</i>.",
			measure:
				"Number of edges in the graph. Denoted as <i>m</i>.<br><br><b>Note</b>: In undirected " +
				"graphs each edge is counted only once.",
			maxMeasure:
				"Maximum possible number of edges (<i>m<sub>max</sub></i>) for this {type} graph." +
				"<br><br><b>Formula</b>: {formula}",
			density:
				"Ratio of existing edges (<i>m</i>) to the maximum possible (<i>m<sub>max</sub></i>). " +
				"100% indicates a <b>complete graph</b> (<i>K<sub>n</sub></i>).<br><br><b>Formula</b>: <i>m</i> / <i>m<sub>max</sub></i>",
			degreeSequence:
				"List of degrees for each vertex in order.<br><br><b>Definition</b>: The degree of a " +
				"vertex is the number of edges incident to it.",
			regularity:
				"A graph is <b>regular</b> if all vertices share the same degree. In that case it is " +
				"called <i>k-Regular</i>, where <i>k</i> is the common degree.",
			adjacencyList: "Shows the vertices directly connected to the selected vertex.",
			connectedComponents:
				"Number of connected components in the graph. Calculated with BFS/DFS.<br><br>" +
				"<b>Definition</b>: A connected component is a subgraph where every pair of vertices is " +
				"connected by paths and no vertex is connected to a vertex outside the subgraph.",
			isolatedVertices: "Number of vertices not connected to any other vertex in the graph.",
			connected: "Indicates whether there is a path between every pair of vertices.",
			structure: "Description of the graph type based on its structure and basic properties.",
			bipartite:
				"A graph is bipartite if its vertices can be split into two disjoint sets and every edge " +
				"connects vertices from different sets. Checked with BFS 2-coloring on the undirected view; " +
				"self-loops or color conflicts invalidate it.",
			eulerian:
				"A graph is <b>Eulerian</b> if it contains a cycle that traverses every edge exactly once." +
				"<br><br><b>Computational complexity:</b> Determining if a graph is Eulerian is solvable in " +
				"polynomial time (P).<br><br><b>Types:</b><br>• <b>Cycle</b>: All vertices have even degree." +
				"<br>• <b>Path</b>: Exactly two vertices have odd degree.<br>• <b>No</b>: Does not meet the previous conditions.",
			hamiltonian:
				"A graph is <b>Hamiltonian</b> if it contains a cycle that visits every vertex exactly once." +
				"<br><br><b>Computational complexity:</b> Determining Hamiltonicity is NP-complete.<br><br>" +
				"<b>Note</b>: Analysis is skipped for graphs with more than 12 vertices due to computational limits.",
			complementaryOrder: "Number of edges in the complementary graph. It has the same order as the original graph.",
			complementaryMeasure:
				"Number of edges in the complementary graph.<br><br><b>Formula:</b> <i>m<sub>Ḡ</sub></i> = " +
				"<i>m<sub>max</sub></i> - <i>m<sub>G</sub></i>",
			complementaryConnectedComponents:
				"Connected components of <i>Ḡ</i> are the independent subgraphs formed when drawing the " +
				"missing edges from the original graph. If two groups were totally isolated in the base graph, " +
				"they merge in the complement.",
		},
	},
};
