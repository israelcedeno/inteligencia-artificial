// ==========================================
// NAVEGACIÓN DE LA PRESENTACIÓN
// ==========================================

const slides = [...document.querySelectorAll(".slide")];
const dotsHost = document.getElementById("dots");
const currentNumber = document.getElementById("currentNumber");
const progressValue = document.getElementById("progressValue");
const totalSlides = document.getElementById("totalSlides");

if (totalSlides) {
  totalSlides.textContent = String(slides.length).padStart(2, "0");
}

let currentSlide = 0;

// Crear indicadores de cada diapositiva
slides.forEach((slide, index) => {
  const dot = document.createElement("button");

  dot.className = "dot" + (index === 0 ? " active" : "");
  dot.title = `Ir a diapositiva ${index + 1}`;
  dot.setAttribute("aria-label", dot.title);

  dot.addEventListener("click", () => showSlide(index));
  dotsHost.appendChild(dot);
});

const dots = [...dotsHost.querySelectorAll(".dot")];

// Mostrar una diapositiva y activar su animación
function showSlide(index) {
  currentSlide = Math.max(0, Math.min(slides.length - 1, index));

  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    slide.setAttribute("aria-hidden", i !== currentSlide ? "true" : "false");
  });

  // Reiniciar animaciones CSS al regresar a una diapositiva
  const activeSlide = slides[currentSlide];
  void activeSlide.offsetWidth;
  activeSlide.classList.add("active");

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });

  currentNumber.textContent =
    String(currentSlide + 1).padStart(2, "0");

  progressValue.style.width =
    `${((currentSlide + 1) / slides.length) * 100}%`;

  document.getElementById("prevBtn").disabled = currentSlide === 0;

  document.getElementById("nextBtn").textContent =
    currentSlide === slides.length - 1
      ? "Volver al inicio ↺"
      : "Siguiente →";
}

// Botones anterior y siguiente
document.getElementById("prevBtn").addEventListener("click", () => {
  showSlide(currentSlide - 1);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  showSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
});

// Botón de regreso desde la diapositiva final
const thanksHomeBtn = document.getElementById("thanksHomeBtn");

if (thanksHomeBtn) {
  thanksHomeBtn.addEventListener("click", () => showSlide(0));
}

// Atajos del teclado
document.addEventListener("keydown", (event) => {
  const tag = document.activeElement
    ? document.activeElement.tagName
    : "";

  if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    showSlide(currentSlide + 1);
  }

  if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    showSlide(currentSlide - 1);
  }

  if (event.key === "Home") showSlide(0);
  if (event.key === "End") showSlide(slides.length - 1);
});

// ==========================================
// PANTALLA COMPLETA Y NOTIFICACIONES
// ==========================================

const toast = document.getElementById("toast");

function notify(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

document.getElementById("fullscreenBtn").addEventListener(
  "click",
  async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      notify("No se pudo activar la pantalla completa.");
    }
  }
);

// ==========================================
// GRAFO DE EJEMPLO PARA DIJKSTRA
// ==========================================

const nodes = {
  A: { x: 70, y: 165 },
  B: { x: 205, y: 65 },
  C: { x: 205, y: 265 },
  D: { x: 385, y: 65 },
  E: { x: 475, y: 215 }
};

// Conexiones y pesos
const edges = [
  ["A", "B", 4],
  ["A", "C", 1],
  ["C", "B", 2],
  ["B", "D", 1],
  ["C", "D", 5],
  ["D", "E", 3],
  ["B", "E", 7],
  ["C", "E", 9]
];

// Crear lista de adyacencia
const graph = {};

Object.keys(nodes).forEach((node) => {
  graph[node] = [];
});

edges.forEach(([a, b, weight]) => {
  graph[a].push({ to: b, weight });
  graph[b].push({ to: a, weight });
});

// Elementos HTML de la simulación
let sim = null;

const svg = document.getElementById("graphSvg");
const distanceGrid = document.getElementById("distanceGrid");
const stepStatus = document.getElementById("stepStatus");
const stepExplanation = document.getElementById("stepExplanation");
const routeResult = document.getElementById("routeResult");
const routeCost = document.getElementById("routeCost");
const sourceSelect = document.getElementById("sourceSelect");
const targetSelect = document.getElementById("targetSelect");

// ==========================================
// DIBUJAR EL GRAFO
// ==========================================

function buildSvg() {
  const edgeMarkup = edges.map(([a, b, weight]) => {
    const p1 = nodes[a];
    const p2 = nodes[b];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;

    const offsetX = (-dy / length) * 11;
    const offsetY = (dx / length) * 11;

    const midX = (p1.x + p2.x) / 2 + offsetX;
    const midY = (p1.y + p2.y) / 2 + offsetY;

    return `
      <g>
        <line class="edge"
          id="edge-${a}-${b}"
          x1="${p1.x}" y1="${p1.y}"
          x2="${p2.x}" y2="${p2.y}">
        </line>
        <text class="edge-label"
          x="${midX}" y="${midY - 5}">${weight}</text>
      </g>
    `;
  }).join("");

  const nodeMarkup = Object.entries(nodes).map(([name, point]) => `
    <g class="node" id="node-${name}">
      <circle cx="${point.x}" cy="${point.y}" r="21"></circle>
      <text x="${point.x}" y="${point.y + 1}">${name}</text>
    </g>
  `).join("");

  svg.innerHTML = edgeMarkup + nodeMarkup;
}

// ==========================================
// INICIALIZAR LA SIMULACIÓN
// ==========================================

function newSimulation() {
  const source = sourceSelect.value;
  const target = targetSelect.value;

  const distances = Object.fromEntries(
    Object.keys(nodes).map((node) => [node, Infinity])
  );

  const previous = Object.fromEntries(
    Object.keys(nodes).map((node) => [node, null])
  );

  distances[source] = 0;

  sim = {
    source,
    target,
    distances,
    previous,
    visited: new Set(),
    current: null,
    done: false,
    round: 0,
    message: `Inicio: distancia(${source}) = 0; los demás nodos comienzan en infinito.`
  };

  renderSimulation();

  stepStatus.textContent = "Inicialización completada";
  stepExplanation.textContent = sim.message;

  routeResult.textContent = "Calcula los pasos para obtener la ruta.";
  routeCost.textContent = `Origen: ${source} · Destino: ${target}`;
}

// ==========================================
// RECONSTRUIR LA RUTA MÍNIMA
// ==========================================

function reconstructPath() {
  if (!sim || !Number.isFinite(sim.distances[sim.target])) {
    return [];
  }

  const path = [];
  let node = sim.target;
  const guard = new Set();

  while (node && !guard.has(node)) {
    guard.add(node);
    path.unshift(node);

    if (node === sim.source) break;

    node = sim.previous[node];
  }

  return path[0] === sim.source ? path : [];
}

// ==========================================
// AVANZAR UNA RONDA
// ==========================================

function advanceStep() {
  if (sim.done) {
    showFinalResult();
    return;
  }

  let current = null;
  let best = Infinity;

  // Elegir el nodo no visitado con menor distancia
  for (const node of Object.keys(nodes)) {
    if (
      !sim.visited.has(node) &&
      sim.distances[node] < best
    ) {
      best = sim.distances[node];
      current = node;
    }
  }

  if (current === null) {
    sim.done = true;
    sim.current = null;
    sim.message = "No quedan nodos alcanzables por visitar.";

    renderSimulation();
    showFinalResult();
    return;
  }

  sim.current = current;
  sim.visited.add(current);

  const changes = [];

  // Actualizar las distancias de sus vecinos
  for (const neighbor of graph[current]) {
    if (sim.visited.has(neighbor.to)) continue;

    const candidate =
      sim.distances[current] + neighbor.weight;

    if (candidate < sim.distances[neighbor.to]) {
      const oldDistance = sim.distances[neighbor.to];

      sim.distances[neighbor.to] = candidate;
      sim.previous[neighbor.to] = current;

      changes.push(
        `${neighbor.to}: ${
          oldDistance === Infinity ? "∞" : oldDistance
        } → ${candidate}`
      );
    }
  }

  sim.round++;

  sim.message = changes.length
    ? `Se revisa ${current}. Distancias mejoradas: ${changes.join("; ")}.`
    : `Se revisa ${current}. No hay distancias vecinas que mejorar.`;

  const remainingReachable = Object.keys(nodes).some(
    (node) =>
      !sim.visited.has(node) &&
      Number.isFinite(sim.distances[node])
  );

  if (
    sim.visited.size === Object.keys(nodes).length ||
    !remainingReachable
  ) {
    sim.done = true;
  }

  renderSimulation();

  stepStatus.textContent = `Ronda ${sim.round}: nodo ${current}`;
  stepExplanation.textContent = sim.message;

  if (sim.done) {
    showFinalResult();
  }
}

// ==========================================
// MOSTRAR RESULTADO FINAL
// ==========================================

function showFinalResult() {
  const path = reconstructPath();

  if (!path.length) {
    routeResult.textContent =
      `${sim.target} no es alcanzable desde ${sim.source}.`;

    routeCost.textContent =
      "No existe una ruta conectada en este grafo.";
  } else {
    routeResult.textContent = path.join(" → ");

    routeCost.textContent =
      `Costo mínimo: ${sim.distances[sim.target]} unidades · ` +
      `${sim.visited.size} nodos visitados`;
  }

  stepStatus.textContent = "Cálculo finalizado";

  stepExplanation.textContent = path.length
    ? `La distancia mínima desde ${sim.source} hasta ${sim.target} es ${sim.distances[sim.target]}. La ruta aparece resaltada en verde.`
    : `No se encontró una ruta desde ${sim.source} hasta ${sim.target}.`;
}

// ==========================================
// ACTUALIZAR LA REPRESENTACIÓN VISUAL
// ==========================================

function renderSimulation() {
  document.querySelectorAll(".node").forEach((element) => {
    element.classList.remove("visited", "current", "route");
  });

  document.querySelectorAll(".edge").forEach((element) => {
    element.classList.remove("path");
  });

  sim.visited.forEach((node) => {
    const element = document.getElementById(`node-${node}`);
    if (element) element.classList.add("visited");
  });

  if (sim.current) {
    const element = document.getElementById(`node-${sim.current}`);
    if (element) element.classList.add("current");
  }

  const path = sim.done ? reconstructPath() : [];

  path.forEach((node) => {
    const element = document.getElementById(`node-${node}`);
    if (element) element.classList.add("route");
  });

  // Resaltar conexiones pertenecientes a la ruta mínima
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];

    const edgeElement =
      document.getElementById(`edge-${a}-${b}`) ||
      document.getElementById(`edge-${b}-${a}`);

    if (edgeElement) edgeElement.classList.add("path");
  }

  // Mostrar distancias de todos los nodos
  distanceGrid.innerHTML = Object.keys(nodes).map((node) => {
    const distance =
      sim.distances[node] === Infinity
        ? "∞"
        : sim.distances[node];

    const isFinal =
      sim.done && Number.isFinite(sim.distances[node]);

    return `
      <div class="distance-chip ${isFinal ? "final" : ""}">
        <span>${node}</span>
        <b>${distance}</b>
      </div>
    `;
  }).join("");
}

// ==========================================
// BOTONES DE LA SIMULACIÓN
// ==========================================

document.getElementById("stepBtn").addEventListener(
  "click",
  advanceStep
);

document.getElementById("autoBtn").addEventListener("click", () => {
  let count = 0;

  while (!sim.done && count < 20) {
    advanceStep();
    count++;
  }

  showFinalResult();
});

document.getElementById("resetBtn").addEventListener(
  "click",
  newSimulation
);

sourceSelect.addEventListener("change", newSimulation);
targetSelect.addEventListener("change", newSimulation);

// ==========================================
// INICIAR LA PÁGINA
// ==========================================

buildSvg();
newSimulation();
showSlide(0);