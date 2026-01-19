let nodes = [];
// Variables globales para Floyd (para consultas rápidas)
let floydDistMatrix = [];
let floydNextMatrix = [];

const toChar = (i) => String.fromCharCode(65 + i);
const toIdx = (char) => char.toUpperCase().charCodeAt(0) - 65;

// --- Translations ---
const translations = {
  es: {
    title: "Herramienta Grafos Completa",
    pageTitle: "Herramienta Grafos Completa: Floyd, Dijkstra & MST",
    vertices: "Vértices:",
    language: "Idioma:",
    createMatrix: "Crear Matriz",
    inputMatrix: "Matriz de Entrada",
    interpretZero: "Interpretar '0' como \"Sin Conexión\"",
    emptyCell: "Casilla vacía = Sin conexión.",
    dijkstra: "Dijkstra",
    floyd: "Floyd-Warshall",
    mst: "Árbol Mínimo (MST)",
    properties: "Propiedades",
    latex: "Generar LaTeX",
    origin: "Origen:",
    destination: "Destino:",
    calculatePath: "Calcular Camino",
    minCost: "Coste Mínimo:",
    path: "Camino:",
    floydDesc:
      "Calcula todos los caminos mínimos entre pares y el diámetro del grafo.",
    calculateFloyd: "Calcular Pasos Floyd",
    queriesDiameter: "Consultas y Diámetro",
    graphDiameter: "Diámetro del Grafo",
    queryPath: "Consultar Camino:",
    distance: "Distancia:",
    stepMatrices: "Matrices de Pasos (Iteraciones)",
    calculateMST: "Calcular MST",
    totalMinCost: "Coste Mínimo Total",
    edgesSolution: "Aristas (Formato Solución)",
    copy: "Copiar",
    uniqueMST: "¿Existe otro MST distinto?",
    notConnected: "Grafo no conexo",
    no: "NO",
    yes: "SÍ",
    unreachable: "Inalcanzable",
    noPath: "No existe",
    updateAnalysis: "Actualizar Análisis",
    order: "Orden",
    size: "Medida",
    adjacentTo: "Adyacentes a:",
    degreeSequence: "Secuencia Grados",
    isolated: "Aislados",
    connectedComponents: "Componentes Conexas",
    sizeComp: "Medida Comp.",
    compComplement: "CC Complementario",
    generateLatex: "Generar LaTeX",
    copyToClipboard: "Copiar al Portapapeles",
    symmetricGraph: "ℹ️ Grafo Simétrico (No Dirigido).",
    asymmetricGraph: "ℹ️ Grafo No Simétrico (Dirigido).",
    step: "Paso",
    pivot: "Pivot"
  },
  en: {
    title: "Complete Graph Tool",
    pageTitle: "Complete Graph Tool: Floyd, Dijkstra & MST",
    vertices: "Vertices:",
    language: "Language:",
    createMatrix: "Create Matrix",
    inputMatrix: "Input Matrix",
    interpretZero: "Interpret '0' as \"No Connection\"",
    emptyCell: "Empty cell = No connection.",
    dijkstra: "Dijkstra",
    floyd: "Floyd-Warshall",
    mst: "Minimum Spanning Tree (MST)",
    properties: "Properties",
    latex: "Generate LaTeX",
    origin: "Origin:",
    destination: "Destination:",
    calculatePath: "Calculate Path",
    minCost: "Minimum Cost:",
    path: "Path:",
    floydDesc: "Calculates all pairs shortest paths and the graph diameter.",
    calculateFloyd: "Calculate Floyd Steps",
    queriesDiameter: "Queries and Diameter",
    graphDiameter: "Graph Diameter",
    queryPath: "Query Path:",
    distance: "Distance:",
    stepMatrices: "Step Matrices (Iterations)",
    calculateMST: "Calculate MST",
    totalMinCost: "Total Minimum Cost",
    edgesSolution: "Edges (Solution Format)",
    copy: "Copy",
    uniqueMST: "Is there another distinct MST?",
    notConnected: "Graph not connected",
    no: "NO",
    yes: "YES",
    unreachable: "Unreachable",
    noPath: "No path exists",
    updateAnalysis: "Update Analysis",
    order: "Order",
    size: "Size",
    adjacentTo: "Adjacent to:",
    degreeSequence: "Degree Sequence",
    isolated: "Isolated",
    connectedComponents: "Connected Components",
    sizeComp: "Comp. Size",
    compComplement: "Complement CC",
    generateLatex: "Generate LaTeX",
    copyToClipboard: "Copy to Clipboard",
    copied: "Copied to clipboard!",
    symmetricGraph: "ℹ️ Symmetric Graph (Undirected).",
    asymmetricGraph: "ℹ️ Asymmetric Graph (Directed).",
    step: "Step",
    pivot: "Pivot"
  }
};

// --- Core Data ---
function getGraphData() {
  const n = nodes.length;
  const treatZeroAsNull = document.getElementById("zeroAsNull").checked;
  let matrix = [];
  let hasArc = [];
  let isSymmetric = true;
  let rawValues = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    hasArc[i] = [];
    rawValues[i] = [];
    for (let j = 0; j < n; j++) {
      let val = document.getElementById(`cell-${i}-${j}`).value;
      rawValues[i][j] = val;
      let numVal = parseFloat(val);
      let isConnection =
        !(val === "" || val === null) && !(numVal === 0 && treatZeroAsNull);

      if (!isConnection) {
        matrix[i][j] = Infinity;
        hasArc[i][j] = false;
      } else {
        matrix[i][j] = numVal;
        hasArc[i][j] = i !== j;
      }
    }
  }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (hasArc[i][j] !== hasArc[j][i]) isSymmetric = false;
  return { n, matrix, hasArc, isSymmetric, rawValues };
}

// --- UI Setup ---
function createGrid() {
  const n = parseInt(document.getElementById("numNodes").value);
  nodes = Array.from({ length: n }, (_, i) => toChar(i));

  let html =
    "<table><thead><tr><th></th>" +
    nodes.map((n) => `<th>${n}</th>`).join("") +
    "</tr></thead><tbody>";
  for (let i = 0; i < n; i++) {
    html += `<tr><td style="font-weight:bold; background:#eee;">${nodes[i]}</td>`;
    for (let j = 0; j < n; j++) {
      let disabled = i === j ? "disabled" : "";
      html += `<td><input type="number" class="matrix-input" id="cell-${i}-${j}" value="${i === j ? 0 : ""}" ${disabled}></td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  document.getElementById("matrix-container").innerHTML = html;
  document.getElementById("main-interface").style.display = "block";

  // Actualizar Selectors
  updateSelectors(["adjTargetSelector", "floydStart", "floydEnd"]);
}

function updateSelectors(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const oldVal = el.value;
    el.innerHTML = "";
    nodes.forEach((n) => {
      let opt = document.createElement("option");
      opt.value = n;
      opt.innerText = n;
      el.appendChild(opt);
    });
    // Restaurar valor si es posible, sino default
    if (nodes.includes(oldVal)) el.value = oldVal;
    else if (id === "floydEnd" && nodes.length > 1) el.value = nodes[1]; // Default B for end
  });
}

function openTab(evt, name) {
  Array.from(document.getElementsByClassName("tab-content")).forEach(
    (x) => (x.style.display = "none")
  );
  Array.from(document.getElementsByClassName("tab-button")).forEach(
    (x) => (x.className = x.className.replace(" active", ""))
  );
  document.getElementById(name).style.display = "block";
  if (evt) evt.currentTarget.className += " active";
  if (name === "Properties") calculateProperties();
  if (name === "Latex") generateLatex();
}

function updateUI() {
  if (document.querySelector(".tab-button.active").innerText === "Propiedades")
    calculateProperties();
}

// --- FLOYD-WARSHALL ALGORITHM ---
function solveFloyd() {
  const { n, matrix } = getGraphData();

  // Inicializar matrices D y Next
  // next[i][j] guarda el siguiente nodo para ir de i a j
  let dist = [];
  let next = [];

  for (let i = 0; i < n; i++) {
    dist[i] = [];
    next[i] = [];
    for (let j = 0; j < n; j++) {
      dist[i][j] = matrix[i][j];
      if (matrix[i][j] !== Infinity && i !== j) {
        next[i][j] = j;
      } else {
        next[i][j] = null;
      }
    }
  }

  const container = document.getElementById("floyd-steps-container");
  container.innerHTML = "";

  // Mostrar D(0)
  renderFloydMatrix(dist, -1, "Matriz Inicial D(0)", container);

  // Algoritmo Floyd
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
    // Mostrar D(k+1)
    renderFloydMatrix(
      dist,
      k,
      `Iteración k=${k} (Vértice ${nodes[k]})`,
      container
    );
  }

  // Guardar resultado global para consultas
  floydDistMatrix = dist;
  floydNextMatrix = next;

  // Calcular Diámetro
  let diameter = 0;
  let hasInf = false;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        if (dist[i][j] === Infinity) hasInf = true;
        else if (dist[i][j] > diameter) diameter = dist[i][j];
      }
    }
  }

  document.getElementById("floyd-diameter").innerText = hasInf
    ? `${diameter} (Existen pares infinitos)`
    : diameter;
  document.getElementById("floyd-results").style.display = "block";

  // Ejecutar consulta por defecto (ej A->C)
  document.getElementById("floydStart").value = nodes[0]; // A
  if (n > 2) document.getElementById("floydEnd").value = nodes[2]; // C
  queryFloydPath();
}

function renderFloydMatrix(dist, k, title, container) {
  let html = `<div class="floyd-step"><h4>${title}</h4><table class="floyd-matrix-table">`;
  // Header
  html +=
    "<tr><th></th>" + nodes.map((n) => `<th>${n}</th>`).join("") + "</tr>";

  for (let i = 0; i < dist.length; i++) {
    html += `<tr><th>${nodes[i]}</th>`;
    for (let j = 0; j < dist.length; j++) {
      let val = dist[i][j] === Infinity ? "∞" : dist[i][j];
      // Resaltar celdas modificadas o involucradas (opcional, aquí simple)
      html += `<td>${val}</td>`;
    }
    html += "</tr>";
  }
  html += "</table></div>";
  container.innerHTML += html;
}

function queryFloydPath() {
  if (!floydDistMatrix.length) return;
  const sChar = document.getElementById("floydStart").value;
  const eChar = document.getElementById("floydEnd").value;
  const u = toIdx(sChar);
  const v = toIdx(eChar);

  const dist = floydDistMatrix[u][v];

  if (dist === Infinity) {
    const lang = document.documentElement.lang || "es";
    document.getElementById("floyd-query-dist").innerText =
      translations[lang].unreachable;
    document.getElementById("floyd-query-path").innerText = "-";
    return;
  }

  document.getElementById("floyd-query-dist").innerText = dist;

  // Reconstruir camino usando Next Matrix
  let path = [nodes[u]];
  let curr = u;
  while (curr !== v) {
    curr = floydNextMatrix[curr][v];
    path.push(nodes[curr]);
  }
  document.getElementById("floyd-query-path").innerText = path.join("");
}

// --- MST ALGORITHM (Kruskal) ---
class UnionFind {
  constructor(n) {
    this.parent = [...Array(n).keys()];
  }
  find(i) {
    if (this.parent[i] === i) return i;
    return (this.parent[i] = this.find(this.parent[i]));
  }
  union(i, j) {
    const rootI = this.find(i),
      rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootI] = rootJ;
      return true;
    }
    return false;
  }
}

function solveMST() {
  const { n, matrix } = getGraphData();
  let edges = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (matrix[i][j] !== Infinity)
        edges.push({
          u: i,
          v: j,
          w: matrix[i][j],
          id: `${nodes[i]}${nodes[j]}`
        });

  edges.sort((a, b) => (a.w !== b.w ? a.w - b.w : a.id.localeCompare(b.id)));

  let uf = new UnionFind(n),
    mstEdges = [],
    mstCost = 0;
  for (let e of edges)
    if (uf.union(e.u, e.v)) {
      mstEdges.push(e);
      mstCost += e.w;
    }

  mstEdges.sort((a, b) => (a.w !== b.w ? a.w - b.w : a.id.localeCompare(b.id)));
  const edgeString = mstEdges
    .map((e) =>
      nodes[e.u] < nodes[e.v]
        ? nodes[e.u] + nodes[e.v]
        : nodes[e.v] + nodes[e.u]
    )
    .join(",");

  document.getElementById("mst-cost").innerText = mstCost;
  document.getElementById("mst-edges").innerText = edgeString;

  let isUnique = true,
    connectedCount = 0,
    root = uf.find(0);
  for (let i = 0; i < n; i++) if (uf.find(i) === root) connectedCount++;

  if (connectedCount < n) {
    const lang = document.documentElement.lang || "es";
    document.getElementById("mst-unique").innerText =
      translations[lang].notConnected;
  } else {
    for (let edgeToRemove of mstEdges) {
      let ufTest = new UnionFind(n),
        testCost = 0,
        edgesCount = 0;
      for (let e of edges) {
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
    const lang = document.documentElement.lang || "es";
    document.getElementById("mst-unique").innerText = isUnique
      ? translations[lang].no
      : translations[lang].yes;
  }
  document.getElementById("mst-results").style.display = "block";
}

// --- PROPIEDADES ---
function calculateProperties() {
  const { n, hasArc, isSymmetric } = getGraphData();
  const alertBox = document.getElementById("type-alert");
  alertBox.style.display = "block";
  const lang = document.documentElement.lang || "es";
  alertBox.innerText = isSymmetric
    ? translations[lang].symmetricGraph
    : translations[lang].asymmetricGraph;

  document.getElementById("prop-orden").innerText = n;
  let totalArcs = 0,
    degrees = new Array(n).fill(0),
    inD = new Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (hasArc[i][j]) {
        totalArcs++;
        degrees[i]++;
        inD[j]++;
      }
  document.getElementById("prop-medida").innerText = isSymmetric
    ? totalArcs / 2
    : totalArcs;

  // Adyacentes dinámico
  const targetNodeChar = document.getElementById("adjTargetSelector").value;
  const targetIdx = toIdx(targetNodeChar);
  let adjNodes = [];
  if (targetIdx >= 0 && targetIdx < n)
    for (let j = 0; j < n; j++)
      if (hasArc[targetIdx][j]) adjNodes.push(nodes[j]);
  document.getElementById("prop-adj").innerText = adjNodes
    .sort((a, b) => b.localeCompare(a))
    .join(",");

  document.getElementById("prop-seq").innerText = [...degrees]
    .sort((a, b) => b - a)
    .join(",");
  let isolated = 0;
  for (let i = 0; i < n; i++) if (degrees[i] + inD[i] === 0) isolated++;
  document.getElementById("prop-iso").innerText = isolated;

  let visited = new Array(n).fill(false),
    cc = 0;
  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      cc++;
      let q = [i];
      visited[i] = true;
      while (q.length) {
        let u = q.shift();
        for (let v = 0; v < n; v++) {
          if (!visited[v] && (hasArc[u][v] || hasArc[v][u])) {
            visited[v] = true;
            q.push(v);
          }
        }
      }
    }
  }
  document.getElementById("prop-cc").innerText = cc;

  let maxEdges = isSymmetric ? (n * (n - 1)) / 2 : n * (n - 1);
  document.getElementById("prop-comp-size").innerText = Math.max(
    0,
    maxEdges - (isSymmetric ? totalArcs / 2 : totalArcs)
  );

  let compMatrix = [];
  for (let i = 0; i < n; i++) {
    compMatrix[i] = [];
    for (let j = 0; j < n; j++) compMatrix[i][j] = i !== j && !hasArc[i][j];
  }
  let visitedComp = new Array(n).fill(false),
    ccComp = 0;
  for (let i = 0; i < n; i++) {
    if (!visitedComp[i]) {
      ccComp++;
      let q = [i];
      visitedComp[i] = true;
      while (q.length) {
        let u = q.shift();
        for (let v = 0; v < n; v++) {
          if (!visitedComp[v] && (compMatrix[u][v] || compMatrix[v][u])) {
            visitedComp[v] = true;
            q.push(v);
          }
        }
      }
    }
  }
  document.getElementById("prop-comp-cc").innerText = ccComp;
}

// --- DIJKSTRA ---
function solveDijkstra() {
  const { n, matrix } = getGraphData();
  const startIdx = toIdx(document.getElementById("startNode").value);
  const endIdx = toIdx(document.getElementById("endNode").value);

  let dist = new Array(n).fill(Infinity),
    visited = new Array(n).fill(false),
    parent = new Array(n).fill(null);
  dist[startIdx] = 0;
  let steps = [];

  for (let i = 0; i < n; i++) {
    let u = -1,
      minVal = Infinity;
    for (let v = 0; v < n; v++)
      if (!visited[v] && dist[v] < minVal) {
        minVal = dist[v];
        u = v;
      }
    steps.push({
      step: i,
      dists: dist.map((d) => (d === Infinity ? -1 : d)),
      pivot: u !== -1 ? nodes[u] : "-"
    });
    if (u === -1) break;
    visited[u] = true;
    for (let v = 0; v < n; v++) {
      if (!visited[v] && matrix[u][v] !== Infinity && dist[u] !== Infinity) {
        if (dist[u] + matrix[u][v] < dist[v]) {
          dist[v] = dist[u] + matrix[u][v];
          parent[v] = u;
        }
      }
    }
  }
  const b = document.getElementById("stepsBody");
  b.innerHTML = "";
  const lang = document.documentElement.lang || "es";
  document.getElementById("stepsHeader").innerHTML =
    `<th>${translations[lang].step}</th>` +
    nodes.map((x) => `<th>${x}</th>`).join("") +
    `<th>${translations[lang].pivot}</th>`;
  steps.forEach(
    (s) =>
      (b.innerHTML += `<tr><td>${s.step}</td>${s.dists.map((d) => `<td>${d}</td>`).join("")}<td style="font-weight:bold; color:#d63384;">${s.pivot}</td></tr>`)
  );

  const lang = document.documentElement.lang || "es";
  let path = translations[lang].noPath,
    cost = translations[lang].unreachable;
  if (dist[endIdx] !== Infinity) {
    cost = dist[endIdx];
    let curr = endIdx,
      arr = [];
    while (curr !== null) {
      arr.push(nodes[curr]);
      curr = parent[curr];
    }
    path = arr.reverse().join("");
  }
  document.getElementById("finalCost").innerText = cost;
  document.getElementById("finalPath").innerText = path;
  document.getElementById("results-area").style.display = "block";
}

// --- LATEX ---
function generateLatex() {
  const { n, rawValues } = getGraphData();
  let t = `\\begin{table}[h]\n\\centering\n\\begin{tabular}{|${"c".repeat(n + 1)}|}\n\\hline\n & ${nodes.join(" & ")} \\\\ \\hline\n`;
  for (let i = 0; i < n; i++) {
    t += nodes[i];
    for (let j = 0; j < n; j++)
      t += " & " + (rawValues[i][j] === "" ? " " : rawValues[i][j]);
    t += " \\\\ \\hline\n";
  }
  t += "\\end{tabular}\n\\caption{Matriz}\\end{table}";
  document.getElementById("latexOutput").value = t;
}

// --- UTILS ---
function copyToClipboard(elementId, isValue = false) {
  const text = isValue
    ? document.getElementById(elementId).value
    : document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text).then(() => {
    const x = document.getElementById("toast");
    x.className = "show";
    setTimeout(() => {
      x.className = x.className.replace("show", "");
    }, 2000);
  });
}

// --- Internationalization ---
function changeLanguage() {
  const lang = document.getElementById("languageSelect").value;
  document.documentElement.lang = lang;
  localStorage.setItem("language", lang);
  updateTranslations();
}

function updateTranslations() {
  const lang = document.documentElement.lang || "es";
  const trans = translations[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (trans[key]) {
      el.textContent = trans[key];
    }
  });
}

// Initialize language
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("language") || "es";
  document.getElementById("languageSelect").value = savedLang;
  document.documentElement.lang = savedLang;
  updateTranslations();
});
