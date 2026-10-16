/**
 * Background Pattern SVG & CSS Rendering Engine.
 * Adds atmospheric depth and texture (Dot Grid, Circuit Board, Mesh Gradient, Noise, Topographic).
 */

export interface PatternOptions {
  opacity?: number;
  color?: string;
  className?: string;
}

export interface MeshGradientOptions {
  colors?: string[]; // 3-4 gradient stops
  opacity?: number;
}

/**
 * 1. Dot Grid (Engineering paper pattern)
 */
export function renderDotGrid(options: PatternOptions = {}): string {
  const opacity = options.opacity ?? 0.18;
  const color = options.color ?? "#94a3b8";

  return `
    <div class="swag-bg-pattern swag-pattern-dotgrid ${options.className ?? ""}">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotGridPattern" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="${color}" fill-opacity="${opacity}" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGridPattern)" />
      </svg>
    </div>
  `;
}

/**
 * 2. Circuit Board (Tech PCB traces and solder pads)
 */
export function renderCircuitBoard(options: PatternOptions = {}): string {
  const opacity = options.opacity ?? 0.15;
  const color = options.color ?? "#38bdf8";

  return `
    <div class="swag-bg-pattern swag-pattern-circuit ${options.className ?? ""}">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuitPattern" width="120" height="120" patternUnits="userSpaceOnUse">
            <g stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5" fill="none">
              <!-- Horizontal & Vertical Traces -->
              <path d="M 0 30 L 50 30 L 70 50 L 120 50" />
              <path d="M 30 120 L 30 80 L 50 60 L 50 0" />
              <path d="M 90 0 L 90 35 L 110 55 L 120 55" />
              <path d="M 0 95 L 45 95 L 65 115 L 120 115" />
            </g>
            <!-- Solder Pads / Nodes -->
            <circle cx="50" cy="30" r="3" fill="${color}" fill-opacity="${opacity * 1.5}" />
            <circle cx="70" cy="50" r="3" fill="${color}" fill-opacity="${opacity * 1.5}" />
            <circle cx="30" cy="80" r="3" fill="${color}" fill-opacity="${opacity * 1.5}" />
            <circle cx="50" cy="60" r="3" fill="${color}" fill-opacity="${opacity * 1.5}" />
            <circle cx="90" cy="35" r="3" fill="${color}" fill-opacity="${opacity * 1.5}" />
            <circle cx="45" cy="95" r="3" fill="${color}" fill-opacity="${opacity * 1.5}" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuitPattern)" />
      </svg>
    </div>
  `;
}

/**
 * 3. Mesh Gradient (Fluid organic blob gradients)
 */
export function renderMeshGradient(options: MeshGradientOptions = {}): string {
  const colors = options.colors ?? ["#6366f1", "#0ea5e9", "#a855f7", "#ec4899"];
  const opacity = options.opacity ?? 0.22;

  const c1 = colors[0] || "#6366f1";
  const c2 = colors[1] || "#0ea5e9";
  const c3 = colors[2] || "#a855f7";
  const c4 = colors[3] || "#ec4899";

  return `
    <div class="swag-bg-pattern swag-pattern-mesh" style="opacity: ${opacity};">
      <div class="mesh-blob blob-1" style="background: radial-gradient(circle, ${c1} 0%, transparent 70%);"></div>
      <div class="mesh-blob blob-2" style="background: radial-gradient(circle, ${c2} 0%, transparent 70%);"></div>
      <div class="mesh-blob blob-3" style="background: radial-gradient(circle, ${c3} 0%, transparent 70%);"></div>
      <div class="mesh-blob blob-4" style="background: radial-gradient(circle, ${c4} 0%, transparent 70%);"></div>
      <style>
        .swag-pattern-mesh {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          filter: blur(80px);
          z-index: 0;
        }
        .mesh-blob {
          position: absolute;
          border-radius: 50%;
        }
        .blob-1 { width: 500px; height: 500px; top: -100px; left: -100px; }
        .blob-2 { width: 600px; height: 600px; top: -50px; right: -150px; }
        .blob-3 { width: 550px; height: 550px; bottom: -120px; left: 10%; }
        .blob-4 { width: 450px; height: 450px; bottom: -80px; right: -50px; }
      </style>
    </div>
  `;
}

/**
 * 4. Noise Texture (Film grain SVG filter overlay)
 */
export function renderNoiseTexture(options: PatternOptions = {}): string {
  const opacity = options.opacity ?? 0.05;

  return `
    <div class="swag-bg-pattern swag-pattern-noise" style="opacity: ${opacity};">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
      <style>
        .swag-pattern-noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          mix-blend-mode: overlay;
          z-index: 1;
        }
      </style>
    </div>
  `;
}

/**
 * 5. Topographic Contours (Map-style wavy contour lines)
 */
export function renderTopographic(options: PatternOptions = {}): string {
  const opacity = options.opacity ?? 0.12;
  const color = options.color ?? "#6366f1";

  return `
    <div class="swag-bg-pattern swag-pattern-topographic ${options.className ?? ""}">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="topoPattern" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 0 50 Q 50 20 100 50 T 200 50" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.2" />
            <path d="M 0 80 Q 40 110 100 80 T 200 80" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.2" />
            <path d="M 0 120 Q 60 90 120 120 T 200 120" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.2" />
            <path d="M 0 160 Q 30 180 90 160 T 200 160" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topoPattern)" />
      </svg>
    </div>
  `;
}
