# CristalLab 3D

CristalLab 3D es una aplicacion web educativa para visualizar conceptos de cristalografia y ciencia de materiales en un entorno interactivo con Three.js.

Permite estudiar celdas unitarias, sistemas cristalinos, estructuras cubicas, empaquetamiento atomico, planos cristalograficos, indices de Miller, densidad planar y numero de coordinacion.

## Funciones principales

- Visualizacion 3D interactiva con rotacion, zoom y recenter.
- Sistemas cristalinos: cubico, tetragonal, ortorrombico, hexagonal, romboedrico, monoclinico y triclinico.
- Estructuras cubicas: cubica simple (CS), cubica centrada en el cuerpo (BCC) y cubica centrada en las caras (FCC).
- Vista de varias celdas juntas: 1 x 1 x 1, 2 x 2 x 1, 2 x 2 x 2 y 3 x 3 x 2.
- Selector de indices de Miller `(h k l)` con plano 3D y vista 2D proyectada.
- Calculo de intersecciones del plano, area del corte y densidad planar.
- Formula de area para planos comunes como `(100)`, `(110)`, `(111)` y formula general por triangulacion vectorial.
- Resaltado de atomos cortados por el plano.
- Numero de coordinacion teorico y vecinos señalados.
- Seleccion del atomo de referencia haciendo clic directamente sobre atomos del visor 3D.
- Visualizacion de sitios intersticiales octaedricos, tetraedricos y cubicos.
- Verificacion visual automatizada con Playwright.

## Captura conceptual

La pantalla principal se organiza en tres zonas:

- Panel izquierdo: controles de sistema, estructura, numero de celdas, capas visuales e indices de Miller.
- Visor central: escena 3D y panel de densidad planar.
- Panel derecho: parametros de celda, estructura, coordinacion, empaquetamiento e intersecciones.

## Instalacion

Requisitos:

- Node.js 20 o superior
- npm

Instala dependencias:

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Luego abre:

```text
http://127.0.0.1:5173/
```

## Compilar para produccion

```bash
npm run build
```

La salida queda en `dist/`.

## Verificacion visual

Con el servidor de desarrollo corriendo en `127.0.0.1:5173`:

```bash
npm run check:visual
```

La verificacion:

- abre la app en escritorio y movil,
- toma capturas en `screenshots/`,
- revisa que el canvas WebGL no este en blanco,
- detecta desbordes de texto visibles.

## Como usar

1. Selecciona un sistema cristalino.
2. Escoge una estructura cubica: CS, BCC o FCC.
3. Cambia el numero de celdas visibles para comparar la celda unitaria con una red extendida.
4. Ajusta los indices de Miller `(h k l)` para cambiar el plano.
5. Observa la vista 2D del plano, los atomos cortados, el area y la densidad planar.
6. Haz clic en un atomo del modelo 3D para usarlo como referencia de coordinacion.
7. Activa los sitios intersticiales y filtra entre octaedricos, tetraedricos o cubicos.

## Conceptos incluidos

### Indices de Miller

Los indices `(h k l)` se interpretan como los inversos de las intersecciones del plano con los ejes cristalograficos. La app muestra la ecuacion del plano y sus intersecciones.

### Densidad planar

La densidad planar se calcula como:

```text
rho = atomos efectivos sobre el plano / area del plano
```

Los atomos en vertices y bordes aportan fracciones de atomos, mostradas en la vista 2D del plano.

### Area del plano

Para planos cubicos comunes:

```text
A(100) = a^2
A(110) = sqrt(2) * a^2
A(111) = (sqrt(3) / 2) * a^2
```

Para otros planos se usa triangulacion:

```text
A = 1/2 * sum |(v_i - v_0) x (v_{i+1} - v_0)|
```

### Numero de coordinacion

El numero de coordinacion se muestra como valor teorico y tambien visualmente con lineas/halos alrededor del atomo de referencia. Si el vecino esta fuera del bloque visible, se representa como vecino virtual para conservar la coordinacion ideal de la red.

### Sitios intersticiales

Los sitios intersticiales se muestran como marcadores pequeños dentro de la red cristalina:

```text
Octaedrico: hueco coordinado por 6 atomos
Tetraedrico: hueco coordinado por 4 atomos
Cubico: hueco coordinado por 8 atomos
```

La app permite mostrar todos los sitios o filtrar por tipo. En estructuras FCC y BCC se muestran huecos octaedricos y tetraedricos; en cubica simple se muestra el hueco cubico central.

## Estructura del proyecto

```text
.
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── scripts/
│   └── visual-check.mjs
└── src/
    ├── main.js
    └── styles.css
```

## Tecnologias

- Vite
- Three.js
- Playwright
- JavaScript moderno
- CSS responsivo

## Licencia

MIT
