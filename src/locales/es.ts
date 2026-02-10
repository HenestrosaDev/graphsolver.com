export default {
	head: {
		title: "GraphSolver | Resolución interactiva de algoritmos de grafos",
		description:
			"Herramienta interactiva para resolver algoritmos de grafos como Dijkstra, " +
			"Floyd-Warshall y Kruskal. Visualiza y calcula rutas óptimas en grafos.",
		keywords:
			"algoritmos de grafos, dijkstra, floyd-warshall, kruskal, ruta más corta, " +
			"visualización de grafos, solucionador de grafos",
		ogImage: "/og-image.png",
	},
	common: {
		appName: "GraphSolver",
		notification: "Notificación",
		close: "Cerrar",
		yes: "Sí",
		no: "No",
		emptySet: "∅",
		showHelpTooltip: "Mostrar tooltip de ayuda",
	},
	navbar: {
		githubTitle: "Ver código en GitHub",
	},
	footer: {
		help: "Ayuda",
		github: "GitHub",
		madeBy: "Hecho por",
		madeWith: "con",
		love: "amor",
		and: "y",
		vue: "Vue 3",
	},
	theme: {
		toLight: "Cambiar a tema claro",
		toDark: "Cambiar a tema oscuro",
	},
	language: {
		es: "ES",
		en: "EN",
	},
	app: {
		adjacencyTitle: "Matriz de adyacencia",
		analysisTitle: "Análisis del grafo",
		visualizationTitle: "Visualización",
		algorithmsTitle: "Algoritmos",
		propertiesTitle: "Propiedades",
		toast: {
			unsupportedFormat: "Formato no soportado",
			importSuccess: "Grafo importado con éxito",
			invalidContent: "El contenido del archivo no es válido",
			readError: "Error al leer archivo",
			pasteSuccess: "Contenido importado",
			pasteError: "Error de formato",
		},
	},
	graphIO: {
		export: "Exportar",
		import: "Importar",
		download: "Descargar",
		copy: "Copiar",
		paste: "Pegar",
		file: "Archivo",
		text: "Texto",
		exportToast: "Archivo .{ext} exportado",
		copyToast: "{format} copiado al portapapeles",
		copyError: "Error al copiar",
	},
	modalPaste: {
		title: "Pegar contenido",
		formatLabel: "Formato",
		contentLabel: "Contenido",
		placeholder: "Pega los datos del grafo aquí",
		cancel: "Cancelar",
		import: "Importar",
	},
	modalExport: {
		title: "Exportar {format}",
		formatLabel: "Formato",
		contentLabel: "Código generado",
		placeholder: "Selecciona un formato para ver el código generado",
		copy: "Copiar",
		download: "Descargar",
	},
	matrixInput: {
		vertices: "Vértices",
		random: "Aleatorio",
		randomTitle: "Generar valores aleatorios",
		clear: "Vaciar",
		clearTitle: "Vaciar todos los valores",
	},
	algorithmsSection: {
		label: "Algoritmo",
		options: {
			dijkstra: "Dijkstra",
			floyd: "Floyd-Warshall",
			mst: "Kruskal (MST)",
		},
	},
	dijkstra: {
		routeTitle: "Cálculo de ruta",
		origin: "Desde",
		destination: "Hasta",
		minCost: "Coste mínimo",
		optimalPath: "Camino óptimo",
		iterationsTable: "Tabla de iteraciones",
		iteration: "Iteración",
		pivot: "Pivote",
		stepLabel: "Paso {step}",
		unreachableCost: "Inalcanzable",
		noPath: "No existe camino",
	},
	floyd: {
		routeTitle: "Cálculo de ruta",
		origin: "Desde",
		destination: "Hasta",
		minCost: "Coste mínimo",
		optimalPath: "Camino óptimo",
		diameter: "Diámetro del grafo",
		diameterTooltip: "La mayor distancia mínima entre cualquier par de vértices conectados del grafo.",
		iterationsTable: "Tabla de iteraciones",
		stepCounter: "Paso {current} de {total}",
		previous: "Anterior",
		next: "Siguiente",
		initialTitle: "Estado inicial",
		stepTitle: "Iteración k={k} (pivote {pivot})",
		initialDescription: "Matriz de adyacencia inicial. Los nodos no conectados directamente son ∞.",
		iterationDescription:
			"Calculando rutas pasando por el nodo intermedio {pivot}. Las filas y " +
			"columnas resaltadas no cambian en esta iteración.",
		unreachableCost: "Inalcanzable",
		noPath: "No existe camino",
	},
	kruskal: {
		resultTitle: "Resultado",
		minCost: "Coste mínimo",
		minCostTooltip:
			"Coste mínimo para conectar todos los vértices del grafo.<br><br>Cálculo: Tras ejecutar " +
			"el algoritmo de Kruskal, se ignoran las aristas que formarían ciclos y se suman los pesos " +
			"de las aristas restantes que conforman el Árbol Generador Mínimo.",
		edgesSelected: "Aristas seleccionadas",
		edgesTooltip: "Lista de aristas que forman el Árbol Generador Mínimo, ordenadas por peso y lexicográficamente.",
		uniqueSolution: "Solución única",
		uniqueTooltip:
			"Determina si existe otro conjunto de aristas que forme un Árbol Generador Mínimo válido con el " +
			"mismo coste total.",
		invalidGraph: "No válido",
		requiresUndirected: "El algoritmo espera un grafo no dirigido",
		notConnected: "Grafo no conexo (no existe árbol)",
		uniqueYes: "Sí",
		uniqueNo: "No",
	},
	visualizer: {
		overlayTitle: "Interacción desactivada",
		overlayDescription: "Pulsa el candado 🔒 de abajo para interactuar con el grafo.",
		scrollMode: "Modo scroll activado",
		interactionMode: "Modo interacción activado",
		zoomOut: "Alejar",
		zoomIn: "Acercar",
		fitView: "Ajustar vista",
		downloadPng: "Descargar como imagen PNG",
		fullscreen: "Pantalla completa",
		escHint: "Pulsa ESC para salir",
		imageDownloaded: "Imagen descargada correctamente",
	},
	properties: {
		cardTitles: {
			basic: "Propiedades básicas",
			degrees: "Grados",
			vertices: "Vértices",
			topology: "Topología",
			eulerian: "Euleriano",
			complementary: "Grafo complementario",
		},
		cardTooltips: {
			complementary:
				"El grafo complementario <span style=\"text-decoration: overline;\">G</span> tiene los mismos " +
				"vértices que el original, pero sus aristas son exactamente los pares de vértices que no " +
				"son adyacentes (no tienen arista directa) en el grafo base. Es como el \"negativo\" del " +
				"grafo base: donde ahora hay camino, desaparece, y donde no lo hay, aparece.",
		},
		labels: {
			graphType: "Tipo de grafo",
			order: "Orden",
			measure: "Medida",
			maxMeasure: "Medida máxima",
			density: "Densidad",
			degreeSequence: "Secuencia de grados",
			minDegree: "Grado mínimo (δ)",
			maxDegree: "Grado máximo (Δ)",
			regularity: "Regularidad",
			adjacentsTo: "Adyacentes a",
			connectedComponents: "Componentes conexas",
			isolatedVertices: "Vértices aislados",
			connected: "Conexo",
			structure: "Clasificación estructural",
			bipartite: "Bipartito",
			eulerian: "Euleriano",
			hamiltonian: "Hamiltoniano",
			complementaryOrder: "Orden",
			complementaryMeasure: "Medida",
			complementaryConnectedComponents: "Componentes conexas",
		},
		values: {
			directed: "Dirigido (asimétrico)",
			undirected: "No dirigido (simétrico)",
			regular: "{degree}-Regular",
			notRegular: "No regular",
			yes: "Sí",
			no: "No",
			eulerian: {
				cycle: "Ciclo",
				path: "Camino",
				none: "No",
			},
			structure: {
				tree: "Árbol",
				forest: "Bosque",
				connectedCyclic: "Cíclico conexo",
				disconnectedCyclic: "Disconexo con ciclos",
				weakConnectedCyclic: "Cíclico débilmente conexo",
				weakConnectedAcyclic: "Acíclico débilmente conexo",
				disconnected: "Disconexo",
			},
			hamiltonian: {
				yes: "Sí",
				no: "No",
				npLimit: "NP-Limit (>12)",
			},
		},
		tooltips: {
			order: "Número de vértices del grafo. Se denota como <i>n</i>.",
			measure:
				"Número de aristas del grafo. Se denota como <i>m</i>.<br><br><b>Nota</b>: En grafos no " +
				"dirigidos, cada arista se cuenta una sola vez.",
			maxMeasure:
				"Número máximo de aristas (<i>m<sub>max</sub></i>) posibles para este grafo {type}." +
				"<br><br><b>Fórmula</b>: {formula}",
			density:
				"Proporción de aristas existentes (<i>m</i>) frente al máximo posible (<i>m<sub>max</sub></i>). " +
				"Un 100% indica un <b>grafo completo</b> (<i>K<sub>n</sub></i>).<br><br><b>Fórmula</b>: <i>m</i> " +
				" / <i>m<sub>max</sub></i>",
			degreeSequence:
				"Lista de grados de cada vértice en orden.<br><br><b>Definición</b>: El grado de un vértice " +
				"es el número de aristas que inciden en él.",
			regularity:
				"Un grafo es <b>regular</b> si todos sus vértices tienen el mismo grado. En ese caso, se " +
				"denomina <i>k-Regular</i>, siendo <i>k</i> el grado común.",
			adjacencyList: "Muestra los vértices conectados directamente al vértice seleccionado.",
			connectedComponents:
				"Número de componentes conexas dentro del grafo. Se calcula mediante algoritmos de búsqueda " +
				"en profundidad (DFS) o búsqueda en anchura (BFS).<br><br><b>Definición</b>: Una componente " +
				"conexa es un subgrafo en el que cualquier par de vértices están conectados entre sí por " +
				"caminos, y que no está conectado a ningún vértice fuera del subgrafo.",
			isolatedVertices: "Número de vértices que no están conectados a ningún otro vértice dentro del grafo.",
			connected: "Indica si existe un camino entre cualquier par de vértices.",
			structure: "Descripción del tipo de grafo según su estructura y propiedades básicas.",
			bipartite:
				"Un grafo es bipartito si sus vértices pueden dividirse en dos conjuntos disjuntos y cada " +
				"arista conecta vértices de conjuntos distintos. Se comprueba con 2-coloración BFS sobre la " +
				"versión no dirigida; los bucles o conflictos de color lo invalidan.",
			eulerian:
				"Un grafo es <b>euleriano</b> si contiene un ciclo que recorre todas las aristas exactamente " +
				"una vez.<br><br><b>Dificultad computacional:</b> Determinar si un grafo es euleriano es un " +
				"problema polinomialmente resoluble (P). <br><br><b>Tipos:</b><br>• <b>Ciclo</b>: Todos los " +
				"vértices tienen grado par.<br>• <b>Camino</b>: Exactamente dos vértices tienen grado impar." +
				"<br>• <b>No</b>: No cumple las condiciones anteriores.",
			hamiltonian:
				" Un grafo es <b>hamiltoniano</b> si contiene un ciclo que visita cada vértice exactamente " +
				"una vez.<br><br><b>Dificultad computacional:</b> Determinar si un grafo es hamiltoniano es " +
				"un problema NP-completo. <br><br><b>Nota</b>: No se realizará el análisis para grafos con " +
				"más de 12 vértices debido a limitaciones computacionales.",
			complementaryOrder: "Número de aristas del grafo complementario. Tiene el mismo orden que el grafo original.",
			complementaryMeasure:
				"Número de aristas del grafo complementario.<br><br><b>Fórmula:</b> <i>m<sub><span " +
				"style='text-decoration: overline;'>G</span></sub></i> = <i>m<sub>max</sub></i> - <i>m<sub>G</sub></i>",
			complementaryConnectedComponents:
				"Las componentes conexas de <i><span style='text-decoration: overline;'>G</span></i> son los " +
				"subgrafos independientes que se forman al trazar las aristas que faltaban en el original. " +
				"Si en el grafo original dos grupos estaban totalmente aislados, en el complementario esos " +
				"grupos se fusionan.",
		},
	},
};
