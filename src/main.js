import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./styles.css";

const CELL_SCALE = 2.55;

const crystalSystems = [
  {
    id: "cubic",
    name: "Cúbico",
    summary: "Alta simetría: tres aristas equivalentes y ángulos rectos.",
    params: { a: 1, b: 1, c: 1, alpha: 90, beta: 90, gamma: 90 },
  },
  {
    id: "tetragonal",
    name: "Tetragonal",
    summary: "Base cuadrada con un eje vertical diferente.",
    params: { a: 1, b: 1, c: 1.48, alpha: 90, beta: 90, gamma: 90 },
  },
  {
    id: "orthorhombic",
    name: "Ortorrómbico",
    summary: "Tres aristas distintas con ángulos rectos.",
    params: { a: 1, b: 1.28, c: 1.68, alpha: 90, beta: 90, gamma: 90 },
  },
  {
    id: "hexagonal",
    name: "Hexagonal",
    summary: "Base con 120° y eje principal perpendicular.",
    params: { a: 1, b: 1, c: 1.58, alpha: 90, beta: 90, gamma: 120 },
  },
  {
    id: "rhombohedral",
    name: "Romboédrico",
    summary: "Aristas equivalentes con ángulos iguales no rectos.",
    params: { a: 1, b: 1, c: 1, alpha: 76, beta: 76, gamma: 76 },
  },
  {
    id: "monoclinic",
    name: "Monoclínico",
    summary: "Dos ángulos rectos y una inclinación característica.",
    params: { a: 1, b: 1.25, c: 1.55, alpha: 90, beta: 106, gamma: 90 },
  },
  {
    id: "triclinic",
    name: "Triclínico",
    summary: "La celda general: aristas y ángulos diferentes.",
    params: { a: 1, b: 1.18, c: 1.42, alpha: 78, beta: 103, gamma: 112 },
  },
];

const structures = {
  sc: {
    name: "Cúbica simple",
    short: "CS",
    atomsPerCell: "1",
    coordination: "6",
    apf: 0.52,
    radiusRelation: "r = a / 2",
    radiusFactor: 0.5,
    positions: [
      { frac: [0, 0, 0], type: "corner" },
      { frac: [1, 0, 0], type: "corner" },
      { frac: [0, 1, 0], type: "corner" },
      { frac: [0, 0, 1], type: "corner" },
      { frac: [1, 1, 0], type: "corner" },
      { frac: [1, 0, 1], type: "corner" },
      { frac: [0, 1, 1], type: "corner" },
      { frac: [1, 1, 1], type: "corner" },
    ],
  },
  bcc: {
    name: "Cúbica centrada en el cuerpo",
    short: "BCC",
    atomsPerCell: "2",
    coordination: "8",
    apf: 0.68,
    radiusRelation: "r = (√3 a) / 4",
    radiusFactor: Math.sqrt(3) / 4,
    positions: [
      { frac: [0, 0, 0], type: "corner" },
      { frac: [1, 0, 0], type: "corner" },
      { frac: [0, 1, 0], type: "corner" },
      { frac: [0, 0, 1], type: "corner" },
      { frac: [1, 1, 0], type: "corner" },
      { frac: [1, 0, 1], type: "corner" },
      { frac: [0, 1, 1], type: "corner" },
      { frac: [1, 1, 1], type: "corner" },
      { frac: [0.5, 0.5, 0.5], type: "body" },
    ],
  },
  fcc: {
    name: "Cúbica centrada en las caras",
    short: "FCC",
    atomsPerCell: "4",
    coordination: "12",
    apf: 0.74,
    radiusRelation: "r = (√2 a) / 4",
    radiusFactor: Math.sqrt(2) / 4,
    positions: [
      { frac: [0, 0, 0], type: "corner" },
      { frac: [1, 0, 0], type: "corner" },
      { frac: [0, 1, 0], type: "corner" },
      { frac: [0, 0, 1], type: "corner" },
      { frac: [1, 1, 0], type: "corner" },
      { frac: [1, 0, 1], type: "corner" },
      { frac: [0, 1, 1], type: "corner" },
      { frac: [1, 1, 1], type: "corner" },
      { frac: [0.5, 0.5, 0], type: "face" },
      { frac: [0.5, 0.5, 1], type: "face" },
      { frac: [0.5, 0, 0.5], type: "face" },
      { frac: [0.5, 1, 0.5], type: "face" },
      { frac: [0, 0.5, 0.5], type: "face" },
      { frac: [1, 0.5, 0.5], type: "face" },
    ],
  },
};

const interstitialTypeLabels = {
  all: "Todos",
  octahedral: "Octaédricos",
  tetrahedral: "Tetraédricos",
  cubic: "Cúbicos",
};

const interstitialTypeNotes = {
  all: "Muestra los huecos disponibles típicos para la estructura seleccionada.",
  octahedral: "Sitios rodeados idealmente por 6 átomos vecinos.",
  tetrahedral: "Sitios rodeados idealmente por 4 átomos vecinos.",
  cubic: "Sitios rodeados idealmente por 8 átomos vecinos.",
};

const interstitialSitesByStructure = {
  sc: [
    { frac: [0.5, 0.5, 0.5], type: "cubic", label: "Centro cúbico", coordination: 8 },
  ],
  bcc: [
    { frac: [0.5, 0.5, 0], type: "octahedral", label: "Centro de cara", coordination: 6 },
    { frac: [0.5, 0.5, 1], type: "octahedral", label: "Centro de cara", coordination: 6 },
    { frac: [0.5, 0, 0.5], type: "octahedral", label: "Centro de cara", coordination: 6 },
    { frac: [0.5, 1, 0.5], type: "octahedral", label: "Centro de cara", coordination: 6 },
    { frac: [0, 0.5, 0.5], type: "octahedral", label: "Centro de cara", coordination: 6 },
    { frac: [1, 0.5, 0.5], type: "octahedral", label: "Centro de cara", coordination: 6 },
    { frac: [0.5, 0, 0], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0.5, 1, 0], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0.5, 0, 1], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0.5, 1, 1], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0, 0.5, 0], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [1, 0.5, 0], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0, 0.5, 1], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [1, 0.5, 1], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0, 0, 0.5], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [1, 0, 0.5], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0, 1, 0.5], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [1, 1, 0.5], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0.5, 0.25, 0], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.5, 0.75, 0], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.25, 0.5, 0], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.75, 0.5, 0], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.5, 0.25, 1], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.5, 0.75, 1], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.25, 0.5, 1], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.75, 0.5, 1], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.5, 0, 0.25], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.5, 0, 0.75], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.5, 1, 0.25], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.5, 1, 0.75], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
  ],
  fcc: [
    { frac: [0.5, 0.5, 0.5], type: "octahedral", label: "Centro del cuerpo", coordination: 6 },
    { frac: [0.5, 0, 0], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0.5, 1, 0], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0.5, 0, 1], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0.5, 1, 1], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0, 0.5, 0], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [1, 0.5, 0], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0, 0.5, 1], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [1, 0.5, 1], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0, 0, 0.5], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [1, 0, 0.5], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0, 1, 0.5], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [1, 1, 0.5], type: "octahedral", label: "Centro de arista", coordination: 6 },
    { frac: [0.25, 0.25, 0.25], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.75, 0.25, 0.25], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.25, 0.75, 0.25], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.25, 0.25, 0.75], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.75, 0.75, 0.25], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.75, 0.25, 0.75], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.25, 0.75, 0.75], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
    { frac: [0.75, 0.75, 0.75], type: "tetrahedral", label: "Tetraedro", coordination: 4 },
  ],
};

const repeatPresets = {
  single: { label: "1 × 1 × 1", dims: [1, 1, 1] },
  sheet: { label: "2 × 2 × 1", dims: [2, 2, 1] },
  block2: { label: "2 × 2 × 2", dims: [2, 2, 2] },
  block3: { label: "3 × 3 × 2", dims: [3, 3, 2] },
};

const state = {
  systemId: "cubic",
  structureId: "sc",
  repeatId: "block2",
  referenceAtomKey: "auto",
  h: 1,
  k: 1,
  l: 1,
  packing: true,
  plane: true,
  axes: true,
  coordinationShell: true,
  interstitials: true,
  interstitialType: "all",
};

const ui = {
  systemButtons: document.querySelector("#systemButtons"),
  structureSelect: document.querySelector("#structureSelect"),
  repeatSelect: document.querySelector("#repeatSelect"),
  referenceAtomSelect: document.querySelector("#referenceAtomSelect"),
  packingToggle: document.querySelector("#packingToggle"),
  planeToggle: document.querySelector("#planeToggle"),
  axisToggle: document.querySelector("#axisToggle"),
  coordinationToggle: document.querySelector("#coordinationToggle"),
  interstitialToggle: document.querySelector("#interstitialToggle"),
  interstitialSelect: document.querySelector("#interstitialSelect"),
  hInput: document.querySelector("#hInput"),
  kInput: document.querySelector("#kInput"),
  lInput: document.querySelector("#lInput"),
  hRange: document.querySelector("#hRange"),
  kRange: document.querySelector("#kRange"),
  lRange: document.querySelector("#lRange"),
  millerOutput: document.querySelector("#millerOutput"),
  planeTitle: document.querySelector("#planeTitle"),
  resetView: document.querySelector("#resetView"),
  systemName: document.querySelector("#systemName"),
  systemSummary: document.querySelector("#systemSummary"),
  cellParams: document.querySelector("#cellParams"),
  structureName: document.querySelector("#structureName"),
  atomsPerCell: document.querySelector("#atomsPerCell"),
  coordination: document.querySelector("#coordination"),
  visibleCells: document.querySelector("#visibleCells"),
  visibleNeighbors: document.querySelector("#visibleNeighbors"),
  interstitialCount: document.querySelector("#interstitialCount"),
  interstitialType: document.querySelector("#interstitialType"),
  referenceAtomLabel: document.querySelector("#referenceAtomLabel"),
  interstitialNote: document.querySelector("#interstitialNote"),
  apfValue: document.querySelector("#apfValue"),
  apfBar: document.querySelector("#apfBar"),
  radiusRelation: document.querySelector("#radiusRelation"),
  planeEquation: document.querySelector("#planeEquation"),
  intercepts: document.querySelector("#intercepts"),
  planeSliceSvg: document.querySelector("#planeSliceSvg"),
  planeAtomsCount: document.querySelector("#planeAtomsCount"),
  planeEffectiveAtoms: document.querySelector("#planeEffectiveAtoms"),
  planeArea: document.querySelector("#planeArea"),
  planarDensity: document.querySelector("#planarDensity"),
  planeSliceCaption: document.querySelector("#planeSliceCaption"),
  planeAreaFormula: document.querySelector("#planeAreaFormula"),
};

const container = document.querySelector("#sceneContainer");
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(6.1, 4.5, 7.1);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3.2;
controls.maxDistance = 14;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const root = new THREE.Group();
const helperRoot = new THREE.Group();
scene.add(root, helperRoot);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8fa39b, 2.6);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
keyLight.position.set(4, 6, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xf2d08b, 0.8);
fillLight.position.set(-3, 2, -4);
scene.add(fillLight);

const materials = {
  cell: new THREE.LineBasicMaterial({ color: 0x136f63, linewidth: 2 }),
  grid: new THREE.LineBasicMaterial({ color: 0xced8cf, transparent: true, opacity: 0.45 }),
  corner: new THREE.MeshStandardMaterial({
    color: 0x2f67c8,
    roughness: 0.45,
    metalness: 0.08,
  }),
  body: new THREE.MeshStandardMaterial({
    color: 0xb9502f,
    roughness: 0.42,
    metalness: 0.12,
  }),
  face: new THREE.MeshStandardMaterial({
    color: 0x2f8f64,
    roughness: 0.44,
    metalness: 0.1,
  }),
  cutAtom: new THREE.MeshStandardMaterial({
    color: 0xf2b233,
    emissive: 0x6b3d06,
    emissiveIntensity: 0.12,
    roughness: 0.38,
    metalness: 0.1,
  }),
  coordReference: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x7a4cc2,
    emissiveIntensity: 0.25,
    roughness: 0.32,
    metalness: 0.08,
  }),
  coordLine: new THREE.LineBasicMaterial({ color: 0x7a4cc2, transparent: true, opacity: 0.86 }),
  coordHalo: new THREE.MeshBasicMaterial({
    color: 0x7a4cc2,
    wireframe: true,
    transparent: true,
    opacity: 0.72,
  }),
  coordGhost: new THREE.MeshStandardMaterial({
    color: 0xa27be6,
    transparent: true,
    opacity: 0.72,
    roughness: 0.4,
    metalness: 0.05,
  }),
  interstitialOctahedral: new THREE.MeshStandardMaterial({
    color: 0x00a7b5,
    emissive: 0x004d57,
    emissiveIntensity: 0.28,
    transparent: true,
    opacity: 0.9,
    roughness: 0.28,
    metalness: 0.05,
  }),
  interstitialTetrahedral: new THREE.MeshStandardMaterial({
    color: 0xcf4ba4,
    emissive: 0x5a123f,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.9,
    roughness: 0.28,
    metalness: 0.05,
  }),
  interstitialCubic: new THREE.MeshStandardMaterial({
    color: 0x5867d8,
    emissive: 0x1d2774,
    emissiveIntensity: 0.24,
    transparent: true,
    opacity: 0.86,
    roughness: 0.3,
    metalness: 0.05,
  }),
  interstitialOctahedralShell: new THREE.MeshBasicMaterial({
    color: 0x00a7b5,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  }),
  interstitialTetrahedralShell: new THREE.MeshBasicMaterial({
    color: 0xcf4ba4,
    wireframe: true,
    transparent: true,
    opacity: 0.58,
  }),
  interstitialCubicShell: new THREE.MeshBasicMaterial({
    color: 0x5867d8,
    wireframe: true,
    transparent: true,
    opacity: 0.52,
  }),
  plane: new THREE.MeshStandardMaterial({
    color: 0xd69a20,
    transparent: true,
    opacity: 0.44,
    side: THREE.DoubleSide,
    roughness: 0.5,
    metalness: 0,
  }),
  planeLine: new THREE.LineBasicMaterial({ color: 0x8f5617 }),
  axisA: new THREE.MeshBasicMaterial({ color: 0x136f63 }),
  axisB: new THREE.MeshBasicMaterial({ color: 0x2f67c8 }),
  axisC: new THREE.MeshBasicMaterial({ color: 0xb9502f }),
};

const edges = [
  [0, 1],
  [0, 2],
  [0, 4],
  [1, 3],
  [1, 5],
  [2, 3],
  [2, 6],
  [3, 7],
  [4, 5],
  [4, 6],
  [5, 7],
  [6, 7],
];

const cubeCorners = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
];

const cubeEdges = [
  [0, 1],
  [0, 2],
  [0, 4],
  [1, 3],
  [1, 5],
  [2, 3],
  [2, 6],
  [3, 7],
  [4, 5],
  [4, 6],
  [5, 7],
  [6, 7],
];

let activeCell = null;
let activePlane = null;
let activeCutAtoms = [];
let activeAtoms = [];
let activeAtomMeshes = [];
let activeCoordination = null;
let activeInterstitialSites = [];
let activeAtomRadius = 0.2;
let planeOffset = 1;
let resizeFrame = 0;
let lastRenderWidth = 0;
let lastRenderHeight = 0;
let pointerStart = null;

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function currentSystem() {
  return crystalSystems.find((system) => system.id === state.systemId);
}

function currentStructure() {
  return structures[state.structureId];
}

function currentRepeat() {
  return repeatPresets[state.repeatId] ?? repeatPresets.block2;
}

function referenceCellOrigin() {
  return currentRepeat().dims.map((value) => Math.max(0, Math.floor((value - 1) / 2)));
}

function createBasis(params, repeat = currentRepeat().dims) {
  const scale = CELL_SCALE;
  const a = params.a * scale;
  const b = params.b * scale;
  const c = params.c * scale;
  const alpha = degreesToRadians(params.alpha);
  const beta = degreesToRadians(params.beta);
  const gamma = degreesToRadians(params.gamma);
  const ax = new THREE.Vector3(a, 0, 0);
  const bx = new THREE.Vector3(b * Math.cos(gamma), b * Math.sin(gamma), 0);
  const cx = c * Math.cos(beta);
  const cy = (c * (Math.cos(alpha) - Math.cos(beta) * Math.cos(gamma))) / Math.sin(gamma);
  const cz = Math.sqrt(Math.max(c * c - cx * cx - cy * cy, 0.0001));
  const cv = new THREE.Vector3(cx, cy, cz);
  const center = new THREE.Vector3()
    .addScaledVector(ax, repeat[0])
    .addScaledVector(bx, repeat[1])
    .addScaledVector(cv, repeat[2])
    .multiplyScalar(0.5);
  return { a: ax, b: bx, c: cv, center, repeat };
}

function fracToWorld(frac, basis = activeCell) {
  return new THREE.Vector3()
    .addScaledVector(basis.a, frac[0])
    .addScaledVector(basis.b, frac[1])
    .addScaledVector(basis.c, frac[2])
    .sub(basis.center);
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material && !Object.values(materials).includes(node.material)) {
        if (Array.isArray(node.material)) {
          node.material.forEach((mat) => mat.dispose());
        } else {
          node.material.dispose();
        }
      }
    });
  }
}

function formatAngle(value) {
  return `${value}°`;
}

function formatLength(axis, value) {
  return `${axis}=${value.toFixed(2)}`;
}

function formatMiller() {
  return `(${state.h} ${state.k} ${state.l})`;
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: digits,
    minimumFractionDigits: value < 10 && value !== 0 ? Math.min(2, digits) : 0,
  }).format(value);
}

function formatWeight(value) {
  const fractions = [
    [1, "1"],
    [1 / 2, "1/2"],
    [1 / 3, "1/3"],
    [1 / 4, "1/4"],
    [1 / 6, "1/6"],
    [1 / 8, "1/8"],
    [1 / 12, "1/12"],
  ];
  const match = fractions.find(([fraction]) => Math.abs(value - fraction) < 0.015);
  return match ? match[1] : formatNumber(value, 2);
}

function formatEquation() {
  const parts = [
    { value: state.h, axis: "x" },
    { value: state.k, axis: "y" },
    { value: state.l, axis: "z" },
  ].filter((part) => part.value !== 0);

  if (parts.length === 0) return "Plano indefinido";

  return parts
    .map((part, index) => {
      const abs = Math.abs(part.value);
      const coefficient = abs === 1 ? part.axis : `${abs}${part.axis}`;
      if (index === 0) return part.value < 0 ? `-${coefficient}` : coefficient;
      return part.value < 0 ? ` - ${coefficient}` : ` + ${coefficient}`;
    })
    .join("")
    .concat(` = ${planeOffset}`);
}

function normalizedMillerKey() {
  const values = [Math.abs(state.h), Math.abs(state.k), Math.abs(state.l)];
  const nonZero = values.filter((value) => value !== 0);
  if (nonZero.length === 0) return "000";
  const divisor = nonZero.reduce((gcdValue, value) => {
    const gcd = (left, right) => (right === 0 ? left : gcd(right, left % right));
    return gcd(gcdValue, value);
  });
  return values.map((value) => value / divisor).join("");
}

function planeAreaFormulaText() {
  if (!activePlane) return "A no definida: usa al menos un índice distinto de cero.";

  const key = normalizedMillerKey();
  const known = {
    "100": "A(100) = a²",
    "010": "A(010) = a²",
    "001": "A(001) = a²",
    "110": "A(110) = √2 · a²",
    "101": "A(101) = √2 · a²",
    "011": "A(011) = √2 · a²",
    "111": "A(111) = (√3 / 2) · a²",
  };

  const numeric = `${formatNumber(activePlane.areaUnit, 3)} · a²`;
  if (currentSystem().id === "cubic" && known[key]) {
    return `${known[key]} = ${numeric}`;
  }

  return `A = 1/2 · Σ |(vᵢ - v₀) × (vᵢ₊₁ - v₀)| = ${numeric}`;
}

function interceptValue(index, label) {
  if (index === 0) return { label, value: "∞" };
  const numerator = planeOffset;
  const denominator = index;
  const decimal = numerator / denominator;
  if (Number.isInteger(decimal)) return { label, value: `${decimal}${label}` };
  return { label, value: `${numerator}/${denominator}${label}` };
}

function renderSystemButtons() {
  ui.systemButtons.innerHTML = "";
  crystalSystems.forEach((system) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "system-button";
    button.textContent = system.name;
    button.setAttribute("aria-pressed", String(system.id === state.systemId));
    if (system.id === state.systemId) button.classList.add("active");
    button.addEventListener("click", () => {
      state.systemId = system.id;
      renderSystemButtons();
      updateEverything();
    });
    ui.systemButtons.append(button);
  });
}

function syncMillerInputs(axis, value) {
  const next = Math.max(-4, Math.min(4, Number.parseInt(value, 10) || 0));
  state[axis] = next;
  ui[`${axis}Input`].value = String(next);
  ui[`${axis}Range`].value = String(next);
  updateEverything();
}

function atomTypePriority(type) {
  if (type === "body") return 3;
  if (type === "face") return 2;
  return 1;
}

function addFrac(left, right) {
  return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
}

function generateVisibleAtoms() {
  const structure = currentStructure();
  const [nx, ny, nz] = currentRepeat().dims;
  const atoms = new Map();

  for (let x = 0; x < nx; x += 1) {
    for (let y = 0; y < ny; y += 1) {
      for (let z = 0; z < nz; z += 1) {
        const origin = [x, y, z];
        structure.positions.forEach((atom) => {
          const frac = addFrac(origin, atom.frac);
          const key = atomKey(frac);
          const existing = atoms.get(key);
          if (!existing || atomTypePriority(atom.type) > atomTypePriority(existing.type)) {
            atoms.set(key, {
              ...atom,
              frac,
              key,
              world: fracToWorld(frac),
            });
          }
        });
      }
    }
  }

  return [...atoms.values()];
}

function selectedInterstitialSites() {
  const sites = interstitialSitesByStructure[state.structureId] ?? [];
  if (state.interstitialType === "all") return sites;
  return sites.filter((site) => site.type === state.interstitialType);
}

function interstitialMaterialName(type, shell = false) {
  if (type === "tetrahedral") return shell ? "interstitialTetrahedralShell" : "interstitialTetrahedral";
  if (type === "cubic") return shell ? "interstitialCubicShell" : "interstitialCubic";
  return shell ? "interstitialOctahedralShell" : "interstitialOctahedral";
}

function interstitialTypeName(type) {
  return interstitialTypeLabels[type] ?? interstitialTypeLabels.all;
}

function interstitialSummary() {
  if (!state.interstitials) return "Activa la capa para mostrar huecos entre átomos.";
  if (activeInterstitialSites.length === 0) {
    return `${currentStructure().short} no tiene sitios ${interstitialTypeName(state.interstitialType).toLowerCase()} definidos para esta vista.`;
  }

  const counts = activeInterstitialSites.reduce((total, site) => {
    total[site.type] = (total[site.type] ?? 0) + 1;
    return total;
  }, {});
  const parts = Object.entries(counts).map(([type, count]) => `${count} ${interstitialTypeName(type).toLowerCase()}`);
  const selectedSites = selectedInterstitialSites();
  const coordinationValues = [...new Set(selectedSites.map((site) => site.coordination))].sort((a, b) => a - b);
  const coordinationText = coordinationValues.length > 0 ? ` Coordinación del hueco: ${coordinationValues.join("/")}.` : "";
  return `${interstitialTypeNotes[state.interstitialType] ?? interstitialTypeNotes.all} Visibles: ${parts.join(", ")}.${coordinationText}`;
}

function generateVisibleInterstitialSites() {
  const [nx, ny, nz] = currentRepeat().dims;
  const sites = new Map();

  for (let x = 0; x < nx; x += 1) {
    for (let y = 0; y < ny; y += 1) {
      for (let z = 0; z < nz; z += 1) {
        const origin = [x, y, z];
        selectedInterstitialSites().forEach((site) => {
          const frac = addFrac(origin, site.frac);
          const key = `${site.type}:${atomKey(frac)}`;
          if (!sites.has(key)) {
            sites.set(key, {
              ...site,
              frac,
              key,
              world: fracToWorld(frac),
            });
          }
        });
      }
    }
  }

  return [...sites.values()];
}

function interstitialShellGeometry(type, radius) {
  if (type === "tetrahedral") return new THREE.TetrahedronGeometry(radius * 1.95, 0);
  if (type === "cubic") return new THREE.BoxGeometry(radius * 2.45, radius * 2.45, radius * 2.45);
  return new THREE.OctahedronGeometry(radius * 1.9, 0);
}

function buildInterstitialSites(basis) {
  if (!state.interstitials || activeInterstitialSites.length === 0) return;

  const minEdge = Math.min(basis.a.length(), basis.b.length(), basis.c.length());
  const maxRepeat = Math.max(...currentRepeat().dims);
  const coreRadius = minEdge * (maxRepeat > 1 ? 0.052 : 0.07);
  const coreGeometry = new THREE.SphereGeometry(coreRadius, 24, 16);

  activeInterstitialSites.forEach((site) => {
    const core = new THREE.Mesh(coreGeometry, materials[interstitialMaterialName(site.type)]);
    core.position.copy(site.world);
    core.renderOrder = 5;
    core.userData.interstitialSite = site;
    root.add(core);

    const shell = new THREE.Mesh(interstitialShellGeometry(site.type, coreRadius), materials[interstitialMaterialName(site.type, true)]);
    shell.position.copy(site.world);
    shell.renderOrder = 5;
    root.add(shell);
  });
}

function buildCellEdges(basis) {
  const [nx, ny, nz] = currentRepeat().dims;
  const edgePoints = [];

  for (let x = 0; x < nx; x += 1) {
    for (let y = 0; y < ny; y += 1) {
      for (let z = 0; z < nz; z += 1) {
        const points = [
          fracToWorld([x, y, z], basis),
          fracToWorld([x + 1, y, z], basis),
          fracToWorld([x, y + 1, z], basis),
          fracToWorld([x + 1, y + 1, z], basis),
          fracToWorld([x, y, z + 1], basis),
          fracToWorld([x + 1, y, z + 1], basis),
          fracToWorld([x, y + 1, z + 1], basis),
          fracToWorld([x + 1, y + 1, z + 1], basis),
        ];
        edges.forEach(([start, end]) => {
          edgePoints.push(points[start], points[end]);
        });
      }
    }
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(edgePoints);
  root.add(new THREE.LineSegments(geometry, materials.cell));
}

function buildAtoms(basis) {
  const structure = currentStructure();
  const minEdge = Math.min(basis.a.length(), basis.b.length(), basis.c.length());
  const maxRepeat = Math.max(...currentRepeat().dims);
  const packingScale = maxRepeat > 1 ? 0.46 : 0.7;
  const radius = state.packing ? minEdge * structure.radiusFactor * packingScale : minEdge * 0.075;
  activeAtomRadius = radius;
  activeAtomMeshes = [];
  const geometry = new THREE.SphereGeometry(radius, 48, 24);
  const cutKeys = new Set(activeCutAtoms.map((atom) => atom.key));

  activeAtoms.forEach((atom) => {
    const isCut = state.plane && cutKeys.has(atomKey(atom.frac));
    const mesh = new THREE.Mesh(geometry, isCut ? materials.cutAtom : materials[atom.type]);
    mesh.position.copy(atom.world);
    mesh.userData.atomKey = atom.key;
    mesh.userData.selectableAtom = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    activeAtomMeshes.push(mesh);

    if (isCut) {
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.04, 32, 16),
        new THREE.MeshBasicMaterial({
          color: 0x8f5617,
          wireframe: true,
          transparent: true,
          opacity: 0.45,
        }),
      );
      halo.position.copy(mesh.position);
      root.add(halo);
    }
  });
}

function getCoordinationShell(atoms) {
  const expected = Number.parseInt(currentStructure().coordination, 10);
  if (!Number.isFinite(expected) || atoms.length < 2) return null;

  const structure = currentStructure();
  const [nx, ny, nz] = currentRepeat().dims;
  const visibleKeys = new Set(atoms.map((atom) => atom.key));
  const reference = selectedReferenceAtom(atoms);
  if (!reference) return null;

  const candidates = new Map();
  for (let x = -2; x <= nx + 1; x += 1) {
    for (let y = -2; y <= ny + 1; y += 1) {
      for (let z = -2; z <= nz + 1; z += 1) {
        structure.positions.forEach((atom) => {
          const frac = addFrac([x, y, z], atom.frac);
          const key = atomKey(frac);
          if (key === reference.key) return;
          const existing = candidates.get(key);
          if (!existing || atomTypePriority(atom.type) > atomTypePriority(existing.type)) {
            const world = fracToWorld(frac);
            candidates.set(key, {
              ...atom,
              frac,
              key,
              world,
              isVisible: visibleKeys.has(key),
            });
          }
        });
      }
    }
  }

  const distances = [...candidates.values()]
    .map((atom) => ({
      atom,
      distance: reference.world.distanceTo(atom.world),
    }))
    .filter((item) => item.distance > 1e-5)
    .sort((left, right) => left.distance - right.distance);

  if (distances.length === 0) return null;

  const nearestDistance = distances[0].distance;
  const shell = distances.filter((item) => item.distance <= nearestDistance * 1.06);
  const neighbors = shell.slice(0, expected).map((item) => item.atom);

  return {
    reference,
    neighbors,
    nearestDistance,
    expected,
  };
}

function buildCoordinationShell() {
  if (!state.coordinationShell || !activeCoordination) return;

  const { reference, neighbors } = activeCoordination;
  const linePoints = [];
  neighbors.forEach((neighbor) => {
    linePoints.push(reference.world, neighbor.world);
  });

  if (linePoints.length > 0) {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    root.add(new THREE.LineSegments(lineGeometry, materials.coordLine));
  }

  const haloGeometry = new THREE.SphereGeometry(activeAtomRadius * 1.24, 32, 16);
  const ghostGeometry = new THREE.SphereGeometry(activeAtomRadius * 0.62, 32, 16);
  const referenceMesh = new THREE.Mesh(
    new THREE.SphereGeometry(activeAtomRadius * 0.58, 32, 16),
    materials.coordReference,
  );
  referenceMesh.position.copy(reference.world);
  referenceMesh.renderOrder = 3;
  root.add(referenceMesh);

  [reference, ...neighbors].forEach((atom) => {
    if (!atom.isVisible && atom.key !== reference.key) {
      const ghost = new THREE.Mesh(ghostGeometry, materials.coordGhost);
      ghost.position.copy(atom.world);
      ghost.renderOrder = 2;
      root.add(ghost);
    }

    const halo = new THREE.Mesh(haloGeometry, materials.coordHalo);
    halo.position.copy(atom.world);
    halo.renderOrder = 4;
    root.add(halo);
  });
}

function computePlanePolygon(h, k, l) {
  if (h === 0 && k === 0 && l === 0) {
    return { points: [], offset: 0 };
  }

  const vertexValues = cubeCorners.map(([x, y, z]) => h * x + k * y + l * z);
  const minValue = Math.min(...vertexValues);
  const maxValue = Math.max(...vertexValues);
  const candidateOffsets = [1, -1, 2, -2, 3, -3, 4, -4, 0];
  let offset = candidateOffsets.find((candidate) => candidate >= minValue && candidate <= maxValue);
  if (offset === undefined) offset = (minValue + maxValue) / 2;

  const points = [];
  cubeEdges.forEach(([startIndex, endIndex]) => {
    const start = cubeCorners[startIndex];
    const end = cubeCorners[endIndex];
    const startValue = h * start[0] + k * start[1] + l * start[2] - offset;
    const endValue = h * end[0] + k * end[1] + l * end[2] - offset;

    if (Math.abs(startValue) < 1e-6) points.push(start);
    if (Math.abs(endValue) < 1e-6) points.push(end);
    if (startValue * endValue < 0) {
      const t = startValue / (startValue - endValue);
      points.push([
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t,
      ]);
    }
  });

  const unique = [];
  points.forEach((point) => {
    const key = point.map((value) => value.toFixed(5)).join(":");
    if (!unique.some((item) => item.key === key)) {
      unique.push({ key, point });
    }
  });

  return { points: unique.map((item) => item.point), offset };
}

function sortPolygonPoints(points, basis = activeCell) {
  const worldPoints = points.map((point) => fracToWorld(point, basis));
  const centroid = worldPoints
    .reduce((sum, point) => sum.add(point), new THREE.Vector3())
    .multiplyScalar(1 / worldPoints.length);

  let normal = null;
  for (let i = 1; i < worldPoints.length - 1; i += 1) {
    const edgeA = new THREE.Vector3().subVectors(worldPoints[i], worldPoints[0]);
    const edgeB = new THREE.Vector3().subVectors(worldPoints[i + 1], worldPoints[0]);
    const candidate = new THREE.Vector3().crossVectors(edgeA, edgeB);
    if (candidate.lengthSq() > 1e-8) {
      normal = candidate.normalize();
      break;
    }
  }

  if (!normal) {
    return {
      worldPoints,
      centroid,
      normal: new THREE.Vector3(0, 1, 0),
      axisU: new THREE.Vector3(1, 0, 0),
      axisV: new THREE.Vector3(0, 0, 1),
    };
  }

  const axisU = new THREE.Vector3().subVectors(worldPoints[0], centroid).normalize();
  const axisV = new THREE.Vector3().crossVectors(normal, axisU).normalize();
  worldPoints.sort((left, right) => {
    const leftVector = new THREE.Vector3().subVectors(left, centroid);
    const rightVector = new THREE.Vector3().subVectors(right, centroid);
    const leftAngle = Math.atan2(leftVector.dot(axisV), leftVector.dot(axisU));
    const rightAngle = Math.atan2(rightVector.dot(axisV), rightVector.dot(axisU));
    return leftAngle - rightAngle;
  });

  return { worldPoints, centroid, normal, axisU, axisV };
}

function projectToPlane2D(point, planeData) {
  const relative = new THREE.Vector3().subVectors(point, planeData.centroid);
  return {
    x: relative.dot(planeData.axisU),
    y: relative.dot(planeData.axisV),
  };
}

function polygonArea2D(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const nextIndex = (index + 1) % points.length;
    area += points[index].x * points[nextIndex].y - points[nextIndex].x * points[index].y;
  }
  return Math.abs(area) / 2;
}

function createPlaneData(basis, origin = referenceCellOrigin()) {
  const { points, offset } = computePlanePolygon(state.h, state.k, state.l);
  planeOffset = offset;
  if (points.length < 3) return null;

  const globalPoints = points.map((point) => addFrac(origin, point));
  const sorted = sortPolygonPoints(globalPoints, basis);
  const projected = sorted.worldPoints.map((point) =>
    projectToPlane2D(point, {
      centroid: sorted.centroid,
      axisU: sorted.axisU,
      axisV: sorted.axisV,
    }),
  );
  const areaWorld = polygonArea2D(projected);

  return {
    ...sorted,
    projected,
    offset,
    origin,
    areaWorld,
    areaUnit: areaWorld / (CELL_SCALE * CELL_SCALE),
  };
}

function distance2D(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distance2D(point, start);
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return distance2D(point, { x: start.x + dx * t, y: start.y + dy * t });
}

function pointInPolygon2D(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const crosses =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y) +
          currentPoint.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function vertexWeight(vertexIndex, polygon) {
  const current = polygon[vertexIndex];
  const previous = polygon[(vertexIndex - 1 + polygon.length) % polygon.length];
  const next = polygon[(vertexIndex + 1) % polygon.length];
  const prevVector = { x: previous.x - current.x, y: previous.y - current.y };
  const nextVector = { x: next.x - current.x, y: next.y - current.y };
  const prevLength = Math.hypot(prevVector.x, prevVector.y);
  const nextLength = Math.hypot(nextVector.x, nextVector.y);
  if (prevLength === 0 || nextLength === 0) return 0;
  const dot = (prevVector.x * nextVector.x + prevVector.y * nextVector.y) / (prevLength * nextLength);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
  return angle / (Math.PI * 2);
}

function classifyPlanePoint(point, polygon) {
  const epsilon = 0.018;
  const vertexIndex = polygon.findIndex((vertex) => distance2D(point, vertex) < epsilon);
  if (vertexIndex >= 0) {
    return {
      location: "vértice",
      weight: vertexWeight(vertexIndex, polygon),
    };
  }

  const onEdge = polygon.some((start, index) => {
    const end = polygon[(index + 1) % polygon.length];
    return distanceToSegment(point, start, end) < epsilon;
  });
  if (onEdge) return { location: "borde", weight: 0.5 };
  if (pointInPolygon2D(point, polygon)) return { location: "interior", weight: 1 };
  return null;
}

function atomKey(frac) {
  return frac.map((value) => value.toFixed(4)).join(":");
}

function atomTypeLabel(type) {
  if (type === "body") return "centro";
  if (type === "face") return "cara";
  return "esquina";
}

function formatFractionalCoordinate(value) {
  if (Math.abs(value - Math.round(value)) < 1e-6) return `${Math.round(value)}`;
  return `${Number(value.toFixed(2))}`;
}

function atomDisplayLabel(atom) {
  return `${atomTypeLabel(atom.type)} (${atom.frac.map(formatFractionalCoordinate).join(", ")})`;
}

function sortAtomsForSelection(left, right) {
  const typeScore = atomTypePriority(right.type) - atomTypePriority(left.type);
  if (typeScore !== 0) return typeScore;
  return left.frac[0] - right.frac[0] || left.frac[1] - right.frac[1] || left.frac[2] - right.frac[2];
}

function automaticReferenceAtom(atoms) {
  return [...atoms].sort((left, right) => {
    const centerScore = left.world.length() - right.world.length();
    if (Math.abs(centerScore) > 1e-5) return centerScore;
    return atomTypePriority(right.type) - atomTypePriority(left.type);
  })[0];
}

function selectedReferenceAtom(atoms) {
  if (state.referenceAtomKey !== "auto") {
    const selected = atoms.find((atom) => atom.key === state.referenceAtomKey);
    if (selected) return selected;
    state.referenceAtomKey = "auto";
  }
  return automaticReferenceAtom(atoms);
}

function renderReferenceAtomOptions() {
  const previous = state.referenceAtomKey;
  const atoms = [...activeAtoms].sort(sortAtomsForSelection);
  const selectedExists = previous === "auto" || atoms.some((atom) => atom.key === previous);
  if (!selectedExists) state.referenceAtomKey = "auto";

  ui.referenceAtomSelect.innerHTML = "";
  const autoOption = document.createElement("option");
  autoOption.value = "auto";
  autoOption.textContent = "Automático (más central)";
  ui.referenceAtomSelect.append(autoOption);

  atoms.forEach((atom) => {
    const option = document.createElement("option");
    option.value = atom.key;
    option.textContent = atomDisplayLabel(atom);
    ui.referenceAtomSelect.append(option);
  });

  ui.referenceAtomSelect.value = state.referenceAtomKey;
}

function getCutAtoms(planeData) {
  if (!planeData) return [];
  const structure = currentStructure();
  const planeValue = (frac) => state.h * frac[0] + state.k * frac[1] + state.l * frac[2] - planeData.offset;

  return structure.positions
    .map((atom) => {
      if (Math.abs(planeValue(atom.frac)) > 1e-6) return null;
      const frac = addFrac(planeData.origin, atom.frac);
      const world = fracToWorld(frac);
      const projected = projectToPlane2D(world, planeData);
      const classification = classifyPlanePoint(projected, planeData.projected);
      if (!classification) return null;
      return {
        ...atom,
        frac,
        key: atomKey(frac),
        world,
        projected,
        label: atomTypeLabel(atom.type),
        ...classification,
      };
    })
    .filter(Boolean);
}

function buildPlane() {
  if (!state.plane) return;

  if (!activePlane) return;
  const { worldPoints, centroid, normal } = activePlane;
  const positions = [];
  worldPoints.forEach((point) => positions.push(point.x, point.y, point.z));

  const indices = [];
  for (let i = 1; i < worldPoints.length - 1; i += 1) {
    indices.push(0, i, i + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  root.add(new THREE.Mesh(geometry, materials.plane));

  const outline = [...worldPoints, worldPoints[0]];
  const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outline);
  root.add(new THREE.Line(outlineGeometry, materials.planeLine));

  const arrowLength = Math.min(activeCell.a.length(), activeCell.b.length(), activeCell.c.length()) * 0.42;
  const arrow = new THREE.ArrowHelper(normal, centroid, arrowLength, 0xb9502f, arrowLength * 0.24, arrowLength * 0.11);
  root.add(arrow);
}

function makeTextSprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "700 32px Inter, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.5, 0.25, 1);
  return sprite;
}

function addAxisArrow(vector, label, color, material) {
  const origin = fracToWorld([0, 0, 0]).addScaledVector(vector, -0.04);
  const length = vector.length() * 1.12;
  const direction = vector.clone().normalize();
  const arrow = new THREE.ArrowHelper(direction, origin, length, color, length * 0.09, length * 0.04);
  helperRoot.add(arrow);

  const sprite = makeTextSprite(label, `#${color.toString(16).padStart(6, "0")}`);
  sprite.position.copy(origin).addScaledVector(direction, length + 0.18);
  sprite.material = sprite.material.clone();
  sprite.material.color = material.color;
  helperRoot.add(sprite);
}

function buildAxes() {
  if (!state.axes) return;
  addAxisArrow(activeCell.a, "a", 0x136f63, materials.axisA);
  addAxisArrow(activeCell.b, "b", 0x2f67c8, materials.axisB);
  addAxisArrow(activeCell.c, "c", 0xb9502f, materials.axisC);
}

function buildReferenceGrid() {
  const grid = new THREE.GridHelper(7, 14, 0xc8d2ca, 0xdfe5de);
  grid.position.y = -2.15;
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  helperRoot.add(grid);
}

function rebuildScene() {
  clearGroup(root);
  clearGroup(helperRoot);
  activeCell = createBasis(currentSystem().params, currentRepeat().dims);
  activePlane = createPlaneData(activeCell);
  activeCutAtoms = getCutAtoms(activePlane);
  activeAtoms = generateVisibleAtoms();
  activeInterstitialSites = generateVisibleInterstitialSites();
  activeCoordination = getCoordinationShell(activeAtoms);
  buildReferenceGrid();
  buildCellEdges(activeCell);
  buildPlane();
  buildAtoms(activeCell);
  buildInterstitialSites(activeCell);
  buildCoordinationShell();
  buildAxes();
}

function renderPlaneSlice() {
  const width = 320;
  const height = 236;
  const padding = 28;

  if (!activePlane) {
    ui.planeSliceSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    ui.planeSliceSvg.innerHTML = `<text class="slice-empty" x="${width / 2}" y="${height / 2}">Plano indefinido</text>`;
    ui.planeAtomsCount.textContent = "0";
    ui.planeEffectiveAtoms.textContent = "0";
    ui.planeArea.textContent = "0 u²";
    ui.planarDensity.textContent = "0";
    ui.planeSliceCaption.textContent = "Usa al menos un índice distinto de cero para definir el plano.";
    ui.planeAreaFormula.textContent = planeAreaFormulaText();
    return;
  }

  const allPoints = [...activePlane.projected, ...activeCutAtoms.map((atom) => atom.projected)];
  const minX = Math.min(...allPoints.map((point) => point.x));
  const maxX = Math.max(...allPoints.map((point) => point.x));
  const minY = Math.min(...allPoints.map((point) => point.y));
  const maxY = Math.max(...allPoints.map((point) => point.y));
  const spanX = Math.max(maxX - minX, 0.01);
  const spanY = Math.max(maxY - minY, 0.01);
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY);
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;

  const toSvg = (point) => ({
    x: offsetX + (point.x - minX) * scale,
    y: height - (offsetY + (point.y - minY) * scale),
  });

  const polygon = activePlane.projected
    .map(toSvg)
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

  const atomRadius = Math.max(10, Math.min(20, Math.min(spanX, spanY) * scale * 0.12));
  const atomsSvg = activeCutAtoms
    .map((atom) => {
      const point = toSvg(atom.projected);
      const labelY = point.y + atomRadius + 11 > height - 6 ? point.y - atomRadius - 10 : point.y + atomRadius + 12;
      return `
        <g>
          <circle class="slice-atom" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${atomRadius.toFixed(1)}" />
          <circle class="slice-atom-core" cx="${(point.x - atomRadius * 0.28).toFixed(1)}" cy="${(point.y - atomRadius * 0.28).toFixed(1)}" r="${(atomRadius * 0.28).toFixed(1)}" />
          <text class="slice-label" x="${point.x.toFixed(1)}" y="${labelY.toFixed(1)}">${formatWeight(atom.weight)}</text>
        </g>`;
    })
    .join("");

  const emptyText =
    activeCutAtoms.length === 0
      ? `<text class="slice-empty" x="${width / 2}" y="${height / 2}">Sin centros atómicos en este plano</text>`
      : "";

  const effectiveAtoms = activeCutAtoms.reduce((sum, atom) => sum + atom.weight, 0);
  const density = activePlane.areaUnit > 0 ? effectiveAtoms / activePlane.areaUnit : 0;

  ui.planeSliceSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  ui.planeSliceSvg.innerHTML = `
    <polygon class="slice-polygon" points="${polygon}" />
    ${atomsSvg}
    ${emptyText}
  `;
  ui.planeAtomsCount.textContent = `${activeCutAtoms.length}`;
  ui.planeEffectiveAtoms.textContent = formatNumber(effectiveAtoms, 2);
  ui.planeArea.textContent = `${formatNumber(activePlane.areaUnit, 2)} u²`;
  ui.planarDensity.textContent = `${formatNumber(density, 3)} átomos/u²`;
  ui.planeSliceCaption.textContent =
    "Las etiquetas indican la fracción del átomo que pertenece al polígono mostrado.";
  ui.planeAreaFormula.textContent = planeAreaFormulaText();
}

function updatePanel() {
  const system = currentSystem();
  const params = system.params;
  const structure = currentStructure();
  const miller = formatMiller();
  const invalidPlane = state.h === 0 && state.k === 0 && state.l === 0;

  ui.millerOutput.textContent = miller;
  ui.planeTitle.textContent = invalidPlane ? "(h k l)" : miller;
  ui.planeTitle.classList.toggle("invalid-plane", invalidPlane);
  ui.systemName.textContent = system.name;
  ui.systemSummary.textContent = system.summary;
  ui.cellParams.innerHTML = [
    ["a", formatLength("a", params.a)],
    ["b", formatLength("b", params.b)],
    ["c", formatLength("c", params.c)],
    ["α", formatAngle(params.alpha)],
    ["β", formatAngle(params.beta)],
    ["γ", formatAngle(params.gamma)],
  ]
    .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  ui.structureName.textContent = `${structure.name} (${structure.short})`;
  ui.atomsPerCell.textContent = structure.atomsPerCell;
  ui.coordination.textContent = structure.coordination;
  ui.visibleCells.textContent = currentRepeat().label;
  ui.visibleNeighbors.textContent = activeCoordination
    ? `${activeCoordination.neighbors.length}/${activeCoordination.expected}`
    : "0";
  ui.interstitialCount.textContent = state.interstitials ? `${activeInterstitialSites.length}` : "Ocultos";
  ui.interstitialType.textContent = interstitialTypeName(state.interstitialType);
  renderReferenceAtomOptions();
  ui.referenceAtomLabel.textContent = activeCoordination
    ? `Referencia: ${atomDisplayLabel(activeCoordination.reference)}`
    : "Referencia no disponible";
  ui.interstitialNote.textContent = interstitialSummary();
  ui.apfValue.textContent = `${Math.round(structure.apf * 100)}%`;
  ui.apfBar.style.width = `${structure.apf * 100}%`;
  ui.radiusRelation.textContent = structure.radiusRelation;

  ui.planeEquation.textContent = invalidPlane ? "Plano indefinido" : formatEquation();
  ui.intercepts.innerHTML = [
    interceptValue(state.h, "a"),
    interceptValue(state.k, "b"),
    interceptValue(state.l, "c"),
  ]
    .map((item) => `<div><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join("");

  renderPlaneSlice();
}

function updateEverything() {
  rebuildScene();
  updatePanel();
}

function updatePointerFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickAtomFromEvent(event) {
  updatePointerFromEvent(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(activeAtomMeshes, false);
  return hits.find((hit) => hit.object.userData.selectableAtom)?.object.userData.atomKey ?? null;
}

function selectReferenceAtom(atomKey) {
  if (!atomKey) return;
  state.referenceAtomKey = atomKey;
  updateEverything();
}

function handleCanvasPointerDown(event) {
  if (event.button !== 0) return;
  pointerStart = { x: event.clientX, y: event.clientY };
}

function handleCanvasPointerUp(event) {
  if (event.button !== 0 || !pointerStart) return;
  const movement = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  pointerStart = null;
  if (movement > 5) return;
  selectReferenceAtom(pickAtomFromEvent(event));
}

function handleCanvasPointerMove(event) {
  if (event.buttons !== 0) return;
  renderer.domElement.style.cursor = pickAtomFromEvent(event) ? "pointer" : "grab";
}

function resizeRenderer(force = false) {
  resizeFrame = 0;
  const width = Math.floor(container.clientWidth);
  const height = Math.floor(container.clientHeight);
  if (width === 0 || height === 0) return;
  if (!force && width === lastRenderWidth && height === lastRenderHeight) return;
  lastRenderWidth = width;
  lastRenderHeight = height;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function scheduleResize() {
  if (resizeFrame) return;
  resizeFrame = requestAnimationFrame(() => resizeRenderer(true));
}

function resetCamera() {
  const span = activeCell
    ? new THREE.Vector3()
        .addScaledVector(activeCell.a, currentRepeat().dims[0])
        .addScaledVector(activeCell.b, currentRepeat().dims[1])
        .addScaledVector(activeCell.c, currentRepeat().dims[2])
    : new THREE.Vector3(4, 4, 4);
  const distance = Math.max(7, span.length() * 1.45);
  camera.position.set(distance * 0.64, distance * 0.48, distance * 0.75);
  controls.target.set(0, 0, 0);
  controls.minDistance = distance * 0.22;
  controls.maxDistance = distance * 2.4;
  controls.update();
}

function attachEvents() {
  ui.structureSelect.addEventListener("change", (event) => {
    state.structureId = event.target.value;
    updateEverything();
  });

  ui.repeatSelect.addEventListener("change", (event) => {
    state.repeatId = event.target.value;
    state.referenceAtomKey = "auto";
    updateEverything();
    resetCamera();
  });

  ui.referenceAtomSelect.addEventListener("change", (event) => {
    state.referenceAtomKey = event.target.value;
    updateEverything();
  });

  ui.packingToggle.addEventListener("change", (event) => {
    state.packing = event.target.checked;
    updateEverything();
  });

  ui.planeToggle.addEventListener("change", (event) => {
    state.plane = event.target.checked;
    updateEverything();
  });

  ui.axisToggle.addEventListener("change", (event) => {
    state.axes = event.target.checked;
    updateEverything();
  });

  ui.coordinationToggle.addEventListener("change", (event) => {
    state.coordinationShell = event.target.checked;
    updateEverything();
  });

  ui.interstitialToggle.addEventListener("change", (event) => {
    state.interstitials = event.target.checked;
    updateEverything();
  });

  ui.interstitialSelect.addEventListener("change", (event) => {
    state.interstitialType = event.target.value;
    updateEverything();
  });

  ["h", "k", "l"].forEach((axis) => {
    ui[`${axis}Input`].addEventListener("input", (event) => syncMillerInputs(axis, event.target.value));
    ui[`${axis}Range`].addEventListener("input", (event) => syncMillerInputs(axis, event.target.value));
  });

  ui.resetView.addEventListener("click", resetCamera);
  window.addEventListener("resize", scheduleResize);
  renderer.domElement.addEventListener("pointerdown", handleCanvasPointerDown);
  renderer.domElement.addEventListener("pointerup", handleCanvasPointerUp);
  renderer.domElement.addEventListener("pointermove", handleCanvasPointerMove);
  renderer.domElement.addEventListener("pointerleave", () => {
    renderer.domElement.style.cursor = "grab";
    pointerStart = null;
  });
}

function animate() {
  resizeRenderer();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

renderSystemButtons();
attachEvents();
scheduleResize();
updateEverything();
resetCamera();
animate();
