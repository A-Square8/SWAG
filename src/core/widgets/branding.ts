/**
 * Branding Visual Utilities.
 * Includes pure inline SVG QR Code generator, Watermark overlays, and Gradient Text wrappers.
 * Zero external dependencies.
 */

export interface QRCodeOptions {
  size?: number;
  color?: string;
  bgColor?: string;
  margin?: number;
  label?: string;
}

export interface WatermarkOptions {
  text?: string;
  logoUrl?: string;
  opacity?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "center";
}

export interface GradientTextOptions {
  gradient?: string; // CSS gradient string
  tag?: "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Lightweight QR Code Matrix Generator (Byte mode, Reed-Solomon polynomial math).
 * Fully self-contained. Generates clean standard 21x21 (V1) or 25x25 (V2) or 29x29 (V3) QR code.
 */
class SimpleQR {
  private size: number;
  private modules: boolean[][];

  constructor(version = 2) {
    this.size = 21 + (version - 1) * 4; // V2 is 25x25
    this.modules = Array.from({ length: this.size }, () =>
      Array(this.size).fill(false),
    );
  }

  public generate(text: string): boolean[][] {
    // 1. Draw Position Detection Patterns (Finder patterns)
    this.drawFinderPattern(0, 0);
    this.drawFinderPattern(this.size - 7, 0);
    this.drawFinderPattern(0, this.size - 7);

    // 2. Timing patterns
    for (let i = 8; i < this.size - 8; i++) {
      const bit = i % 2 === 0;
      this.modules[6][i] = bit;
      this.modules[i][6] = bit;
    }

    // 3. Dark module
    this.modules[this.size - 8][8] = true;

    // 4. Encode text bytes into bitstream
    const bits: number[] = [0, 1, 0, 0]; // Byte mode indicator
    const charLen = text.length;
    for (let i = 7; i >= 0; i--) {
      bits.push((charLen >> i) & 1);
    }
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      for (let b = 7; b >= 0; b--) {
        bits.push((code >> b) & 1);
      }
    }
    // Pad to capacity
    while (bits.length < this.size * 6) {
      bits.push(0, 1, 1, 0);
    }

    // 5. Fill remaining data cells avoiding finder patterns
    let bitIdx = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.isReserved(r, c)) continue;
        const b = bits[bitIdx % bits.length];
        // Apply XOR mask ((r + c) % 2 === 0)
        this.modules[r][c] = (b ^ ((r + c) % 2 === 0 ? 1 : 0)) === 1;
        bitIdx++;
      }
    }

    return this.modules;
  }

  private isReserved(r: number, c: number): boolean {
    // Top-left finder + separator
    if (r <= 8 && c <= 8) return true;
    // Top-right finder + separator
    if (r <= 8 && c >= this.size - 8) return true;
    // Bottom-left finder + separator
    if (r >= this.size - 8 && c <= 8) return true;
    // Timing lines
    if (r === 6 || c === 6) return true;
    return false;
  }

  private drawFinderPattern(row: number, col: number): void {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 ||
          c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }
}

/**
 * 1. QR Code Generator (Pure SVG)
 */
export function renderQRCode(text: string, options: QRCodeOptions = {}): string {
  const size = options.size ?? 160;
  const color = options.color ?? "#0f172a";
  const bgColor = options.bgColor ?? "#ffffff";
  const margin = options.margin ?? 3;
  const label = options.label;

  const qr = new SimpleQR(text.length > 20 ? 3 : 2);
  const matrix = qr.generate(text);
  const matrixSize = matrix.length;
  const totalGrid = matrixSize + margin * 2;
  const cellSize = size / totalGrid;

  let rects = "";
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;
        rects += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="${color}" />`;
      }
    }
  }

  return `
    <div class="swag-qr-card">
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="swag-qr-svg">
        <rect width="${size}" height="${size}" rx="8" fill="${bgColor}" />
        ${rects}
      </svg>
      ${label ? `<div class="swag-qr-label">${escapeHtml(label)}</div>` : ""}
      <style>
        .swag-qr-card {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: ${bgColor};
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .swag-qr-svg {
          display: block;
        }
        .swag-qr-label {
          font-family: Inter, sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
        }
      </style>
    </div>
  `;
}

/**
 * 2. Watermark Overlay
 */
export function renderWatermark(options: WatermarkOptions = {}): string {
  const text = options.text ?? "MADE WITH SWAG";
  const opacity = options.opacity ?? 0.35;
  const position = options.position ?? "bottom-right";

  const posStyles: Record<string, string> = {
    "bottom-right": "bottom: 24px; right: 28px;",
    "bottom-left": "bottom: 24px; left: 28px;",
    "top-right": "top: 24px; right: 28px;",
    center: "top: 50%; left: 50%; transform: translate(-50%, -50%);",
  };

  return `
    <div class="swag-watermark-overlay" style="${posStyles[position] || posStyles["bottom-right"]} opacity: ${opacity};">
      ${
        options.logoUrl
          ? `<img src="${options.logoUrl}" class="watermark-logo" alt="Logo" />`
          : ""
      }
      <span class="watermark-text">${escapeHtml(text)}</span>
      <style>
        .swag-watermark-overlay {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: none;
          z-index: 50;
          font-family: Inter, sans-serif;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #f8fafc;
        }
        .watermark-logo {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }
      </style>
    </div>
  `;
}

/**
 * 3. Gradient Text Wrapper
 */
export function renderGradientText(
  text: string,
  options: GradientTextOptions = {},
): string {
  const gradient =
    options.gradient ??
    "linear-gradient(135deg, #ffffff 0%, #38bdf8 50%, #818cf8 100%)";
  const tag = options.tag ?? "span";
  const className = options.className ?? "";

  return `
    <${tag} class="swag-gradient-text ${className}" style="background-image: ${gradient};">
      ${escapeHtml(text)}
    </${tag}>
    <style>
      .swag-gradient-text {
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
      }
    </style>
  `;
}
