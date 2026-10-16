/**
 * Pure inline SVG Chart Rendering Engine.
 * Zero external dependencies. Self-contained vector graphics for slides, reels, and video sections.
 */

export interface BarChartItem {
  label: string;
  value: number;
  color?: string;
  formattedValue?: string;
}

export interface BarChartOptions {
  width?: number;
  height?: number;
  layout?: "horizontal" | "vertical";
  title?: string;
  maxValue?: number;
  showValues?: boolean;
  barColor?: string;
}

export interface PieChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartOptions {
  width?: number;
  height?: number;
  donut?: boolean;
  innerRadiusRatio?: number;
  showLegend?: boolean;
  title?: string;
}

export interface LinePoint {
  x: string | number;
  y: number;
}

export interface LineGraphSeries {
  name: string;
  color?: string;
  data: LinePoint[];
}

export interface LineGraphOptions {
  width?: number;
  height?: number;
  title?: string;
  showArea?: boolean;
  showDots?: boolean;
  showGrid?: boolean;
}

export interface RadarChartItem {
  axis: string;
  value: number; // 0 to max
  max?: number;
}

export interface RadarChartOptions {
  width?: number;
  height?: number;
  title?: string;
  color?: string;
  fillOpacity?: number;
  levels?: number;
}

export interface ProgressRingOptions {
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
}

export interface SparklineOptions {
  width?: number;
  height?: number;
  color?: string;
  showFill?: boolean;
  strokeWidth?: number;
}

export interface HeatmapItem {
  row: number;
  col: number;
  value: number; // 0..1 or absolute
  label?: string;
}

export interface HeatmapOptions {
  rows?: number;
  cols?: number;
  cellSize?: number;
  gap?: number;
  colorScale?: string[];
  title?: string;
}

const DEFAULT_PALETTE = [
  "#6366f1", // Indigo
  "#0ea5e9", // Sky
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#14b8a6", // Teal
  "#f97316", // Orange
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * 1. Bar Chart (Horizontal or Vertical)
 */
export function renderBarChart(
  data: BarChartItem[],
  options: BarChartOptions = {},
): string {
  const width = options.width ?? 640;
  const height = options.height ?? 380;
  const layout = options.layout ?? "horizontal";
  const title = options.title;
  const showValues = options.showValues ?? true;

  if (data.length === 0) {
    return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="swag-chart swag-chart-empty"><text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#94a3b8" font-family="Inter, sans-serif">No data</text></svg>`;
  }

  const values = data.map((d) => d.value);
  const maxVal = options.maxValue ?? Math.max(...values, 1);

  const titleOffset = title ? 40 : 16;
  const chartHeight = height - titleOffset - 24;

  let content = "";
  if (title) {
    content += `<text x="24" y="28" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>`;
  }

  if (layout === "horizontal") {
    const labelWidth = 120;
    const valueWidth = showValues ? 70 : 0;
    const barAreaWidth = width - labelWidth - valueWidth - 48;
    const rowHeight = chartHeight / data.length;
    const barThickness = Math.min(rowHeight * 0.55, 32);

    data.forEach((item, index) => {
      const y = titleOffset + index * rowHeight + (rowHeight - barThickness) / 2;
      const barW = Math.max(4, (item.value / maxVal) * barAreaWidth);
      const color = item.color ?? options.barColor ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
      const valStr = item.formattedValue ?? String(item.value);

      // Label
      content += `<text x="${labelWidth + 14}" y="${y + barThickness / 2 + 4}" text-anchor="end" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">${escapeXml(item.label)}</text>`;
      // Bar background track
      content += `<rect x="${labelWidth + 24}" y="${y}" width="${barAreaWidth}" height="${barThickness}" rx="${barThickness / 2}" fill="rgba(255,255,255,0.06)" />`;
      // Value bar
      content += `<rect x="${labelWidth + 24}" y="${y}" width="${barW}" height="${barThickness}" rx="${barThickness / 2}" fill="${color}" filter="url(#glow-${index})" />`;
      // Value text
      if (showValues) {
        content += `<text x="${labelWidth + 24 + barW + 10}" y="${y + barThickness / 2 + 4}" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#f8fafc">${escapeXml(valStr)}</text>`;
      }
    });
  } else {
    // Vertical layout
    const colWidth = (width - 48) / data.length;
    const barThickness = Math.min(colWidth * 0.6, 48);
    const baseline = titleOffset + chartHeight - 30;

    data.forEach((item, index) => {
      const x = 24 + index * colWidth + (colWidth - barThickness) / 2;
      const barH = Math.max(4, (item.value / maxVal) * (chartHeight - 40));
      const y = baseline - barH;
      const color = item.color ?? options.barColor ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
      const valStr = item.formattedValue ?? String(item.value);

      // Bar
      content += `<rect x="${x}" y="${y}" width="${barThickness}" height="${barH}" rx="6" fill="${color}" />`;
      // Label
      content += `<text x="${x + barThickness / 2}" y="${baseline + 20}" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#94a3b8">${escapeXml(item.label)}</text>`;
      // Value
      if (showValues) {
        content += `<text x="${x + barThickness / 2}" y="${y - 8}" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#f8fafc">${escapeXml(valStr)}</text>`;
      }
    });
  }

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-chart swag-bar-chart">
    <defs>
      <linearGradient id="barGlow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>
    ${content}
  </svg>`;
}

/**
 * 2. Pie / Donut Chart
 */
export function renderPieChart(
  data: PieChartItem[],
  options: PieChartOptions = {},
): string {
  const width = options.width ?? 520;
  const height = options.height ?? 360;
  const donut = options.donut ?? true;
  const innerRatio = options.innerRadiusRatio ?? 0.6;
  const showLegend = options.showLegend ?? true;
  const title = options.title;

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const centerX = showLegend ? width * 0.38 : width / 2;
  const centerY = (height + (title ? 30 : 0)) / 2;
  const outerRadius = Math.min(centerX - 30, centerY - 30, 130);
  const innerRadius = donut ? outerRadius * innerRatio : 0;

  let currentAngle = -Math.PI / 2;
  let paths = "";
  let legendItems = "";

  data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * Math.PI * 2;
    const endAngle = currentAngle + sliceAngle;
    const color = item.color ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
    const percentage = Math.round((item.value / total) * 100);

    const x1 = centerX + outerRadius * Math.cos(currentAngle);
    const y1 = centerY + outerRadius * Math.sin(currentAngle);
    const x2 = centerX + outerRadius * Math.cos(endAngle);
    const y2 = centerY + outerRadius * Math.sin(endAngle);

    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(currentAngle);
    const y4 = centerY + innerRadius * Math.sin(currentAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    let pathD = "";
    if (donut) {
      pathD = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    } else {
      pathD = `M ${centerX} ${centerY} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }

    paths += `<path d="${pathD}" fill="${color}" stroke="#0f172a" stroke-width="2" />`;

    // Legend item
    if (showLegend) {
      const legendX = width * 0.68;
      const legendY = 60 + index * 32;
      legendItems += `
        <g transform="translate(${legendX}, ${legendY})">
          <rect x="0" y="0" width="12" height="12" rx="3" fill="${color}" />
          <text x="20" y="10" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#e2e8f0">${escapeXml(item.label)}</text>
          <text x="140" y="10" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#94a3b8">${percentage}%</text>
        </g>
      `;
    }

    currentAngle = endAngle;
  });

  let titleXml = "";
  if (title) {
    titleXml = `<text x="24" y="28" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>`;
  }

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-chart swag-pie-chart">
    ${titleXml}
    ${paths}
    ${legendItems}
  </svg>`;
}

/**
 * 3. Line Graph (Multi-series with smooth grids & filled areas)
 */
export function renderLineGraph(
  series: LineGraphSeries[],
  options: LineGraphOptions = {},
): string {
  const width = options.width ?? 640;
  const height = options.height ?? 340;
  const title = options.title;
  const showArea = options.showArea ?? true;
  const showDots = options.showDots ?? true;
  const showGrid = options.showGrid ?? true;

  const padLeft = 60;
  const padRight = 30;
  const padTop = title ? 50 : 25;
  const padBottom = 45;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Find max value across all series
  let maxVal = 1;
  let minVal = 0;
  let maxLen = 0;
  series.forEach((s) => {
    s.data.forEach((pt) => {
      if (pt.y > maxVal) maxVal = pt.y;
      if (pt.y < minVal) minVal = pt.y;
    });
    if (s.data.length > maxLen) maxLen = s.data.length;
  });
  if (maxVal === 0) maxVal = 1;

  let gridXml = "";
  if (showGrid) {
    // 4 horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padTop + (chartH / 4) * i;
      const val = Math.round(maxVal - (maxVal / 4) * i);
      gridXml += `
        <line x1="${padLeft}" y1="${y}" x2="${padLeft + chartW}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
        <text x="${padLeft - 12}" y="${y + 4}" text-anchor="end" font-family="Inter, sans-serif" font-size="11" fill="#64748b">${val}</text>
      `;
    }
  }

  // X labels from first series
  let xLabelsXml = "";
  if (series[0] && series[0].data.length > 0) {
    const pts = series[0].data;
    const step = chartW / Math.max(1, pts.length - 1);
    pts.forEach((pt, i) => {
      const x = padLeft + i * step;
      xLabelsXml += `<text x="${x}" y="${padTop + chartH + 20}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#94a3b8">${escapeXml(String(pt.x))}</text>`;
    });
  }

  let pathsXml = "";
  let defsXml = "";

  series.forEach((s, sIdx) => {
    const color = s.color ?? DEFAULT_PALETTE[sIdx % DEFAULT_PALETTE.length];
    const gradId = `areaGrad-${sIdx}`;
    defsXml += `
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.35" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
      </linearGradient>
    `;

    if (s.data.length === 0) return;
    const step = chartW / Math.max(1, s.data.length - 1);
    const coords = s.data.map((pt, i) => {
      const x = padLeft + i * step;
      const y = padTop + chartH - (pt.y / maxVal) * chartH;
      return { x, y };
    });

    const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padTop + chartH} L ${coords[0].x} ${padTop + chartH} Z`;

    if (showArea) {
      pathsXml += `<path d="${areaPath}" fill="url(#${gradId})" />`;
    }
    pathsXml += `<path d="${linePath}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;

    if (showDots) {
      coords.forEach((c) => {
        pathsXml += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="${color}" stroke="#0f172a" stroke-width="2" />`;
      });
    }
  });

  let titleXml = "";
  if (title) {
    titleXml = `<text x="24" y="28" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>`;
  }

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-chart swag-line-chart">
    <defs>${defsXml}</defs>
    ${titleXml}
    ${gridXml}
    ${xLabelsXml}
    ${pathsXml}
  </svg>`;
}

/**
 * 4. Radar / Spider Chart (Project strengths & dimensional metrics)
 */
export function renderRadarChart(
  data: RadarChartItem[],
  options: RadarChartOptions = {},
): string {
  const width = options.width ?? 480;
  const height = options.height ?? 420;
  const title = options.title;
  const color = options.color ?? "#6366f1";
  const fillOpacity = options.fillOpacity ?? 0.35;
  const levels = options.levels ?? 4;

  const centerX = width / 2;
  const centerY = (height + (title ? 30 : 0)) / 2;
  const radius = Math.min(centerX - 60, centerY - 60, 140);

  const numAxes = data.length;
  if (numAxes < 3) {
    return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><text x="${centerX}" y="${centerY}" fill="#94a3b8" text-anchor="middle">Radar requires >= 3 dimensions</text></svg>`;
  }

  let backgroundWeb = "";
  for (let lvl = 1; lvl <= levels; lvl++) {
    const lvlRadius = (radius / levels) * lvl;
    const pts = [];
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
      const x = centerX + lvlRadius * Math.cos(angle);
      const y = centerY + lvlRadius * Math.sin(angle);
      pts.push(`${x},${y}`);
    }
    backgroundWeb += `<polygon points="${pts.join(" ")}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />`;
  }

  // Axes lines and labels
  let axesXml = "";
  const dataPoints: Array<{ x: number; y: number }> = [];

  data.forEach((item, i) => {
    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
    const xEnd = centerX + radius * Math.cos(angle);
    const yEnd = centerY + radius * Math.sin(angle);
    axesXml += `<line x1="${centerX}" y1="${centerY}" x2="${xEnd}" y2="${yEnd}" stroke="rgba(255,255,255,0.12)" stroke-width="1" />`;

    // Label position slightly outside
    const labelDist = radius + 22;
    const lx = centerX + labelDist * Math.cos(angle);
    const ly = centerY + labelDist * Math.sin(angle);
    const anchor = Math.abs(Math.cos(angle)) < 0.2 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
    axesXml += `<text x="${lx}" y="${ly + 4}" text-anchor="${anchor}" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">${escapeXml(item.axis)}</text>`;

    // Data polygon point
    const maxVal = item.max ?? 100;
    const normVal = Math.min(Math.max(item.value / maxVal, 0), 1);
    const dDist = radius * normVal;
    dataPoints.push({
      x: centerX + dDist * Math.cos(angle),
      y: centerY + dDist * Math.sin(angle),
    });
  });

  const polyPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const polygonXml = `
    <polygon points="${polyPoints}" fill="${color}" fill-opacity="${fillOpacity}" stroke="${color}" stroke-width="2.5" />
    ${dataPoints.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}" stroke="#ffffff" stroke-width="2" />`).join("")}
  `;

  let titleXml = "";
  if (title) {
    titleXml = `<text x="24" y="28" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>`;
  }

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-chart swag-radar-chart">
    ${titleXml}
    ${backgroundWeb}
    ${axesXml}
    ${polygonXml}
  </svg>`;
}

/**
 * 5. Progress Ring (Circular percentage gauge for Lighthouse / test coverage)
 */
export function renderProgressRing(
  value: number,
  options: ProgressRingOptions = {},
): string {
  const max = options.max ?? 100;
  const size = options.size ?? 160;
  const strokeWidth = options.strokeWidth ?? 12;
  const color = options.color ?? "#10b981";
  const bgColor = options.bgColor ?? "rgba(255,255,255,0.08)";
  const label = options.label;
  const sublabel = options.sublabel;

  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference * (1 - percent);
  const displayPercent = Math.round(percent * 100);

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="swag-chart swag-progress-ring">
    <circle
      cx="${center}"
      cy="${center}"
      r="${radius}"
      fill="transparent"
      stroke="${bgColor}"
      stroke-width="${strokeWidth}"
    />
    <circle
      cx="${center}"
      cy="${center}"
      r="${radius}"
      fill="transparent"
      stroke="${color}"
      stroke-width="${strokeWidth}"
      stroke-linecap="round"
      stroke-dasharray="${circumference}"
      stroke-dashoffset="${strokeDashoffset}"
      transform="rotate(-90 ${center} ${center})"
    />
    <text x="${center}" y="${sublabel ? center - 4 : center + 6}" text-anchor="middle" font-family="Inter, sans-serif" font-size="${Math.round(size * 0.22)}" font-weight="800" fill="#f8fafc">
      ${label ?? `${displayPercent}%`}
    </text>
    ${
      sublabel
        ? `<text x="${center}" y="${center + 20}" text-anchor="middle" font-family="Inter, sans-serif" font-size="${Math.round(size * 0.09)}" font-weight="500" fill="#94a3b8">${escapeXml(sublabel)}</text>`
        : ""
    }
  </svg>`;
}

/**
 * 6. Sparkline (Tiny trendline inside cards)
 */
export function renderSparkline(
  values: number[],
  options: SparklineOptions = {},
): string {
  const width = options.width ?? 140;
  const height = options.height ?? 40;
  const color = options.color ?? "#10b981";
  const showFill = options.showFill ?? true;
  const strokeWidth = options.strokeWidth ?? 2.5;

  if (values.length < 2) {
    return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pad = 4;
  const effectiveH = height - pad * 2;
  const step = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = pad + effectiveH - ((v - min) / range) * effectiveH;
    return { x, y };
  });

  const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${lineD} L ${width} ${height} L 0 ${height} Z`;

  const gradId = `sparkGrad-${Math.abs(Math.sin(values[0]) * 10000).toFixed(0)}`;

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-chart swag-sparkline">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
      </linearGradient>
    </defs>
    ${showFill ? `<path d="${areaD}" fill="url(#${gradId})" />` : ""}
    <path d="${lineD}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;
}

/**
 * 7. Heatmap Grid (GitHub commit activity style or service matrix)
 */
export function renderHeatmap(
  data: HeatmapItem[],
  options: HeatmapOptions = {},
): string {
  const rows = options.rows ?? 7;
  const cols = options.cols ?? 20;
  const cellSize = options.cellSize ?? 16;
  const gap = options.gap ?? 4;
  const title = options.title;

  const colorScale = options.colorScale ?? [
    "rgba(255,255,255,0.05)",
    "#0e4429",
    "#006d32",
    "#26a641",
    "#39d353",
  ];

  const padLeft = 24;
  const padTop = title ? 44 : 20;
  const width = padLeft + cols * (cellSize + gap) + 24;
  const height = padTop + rows * (cellSize + gap) + 24;

  // Build grid map
  const gridMap: Record<string, HeatmapItem> = {};
  data.forEach((d) => {
    gridMap[`${d.row}-${d.col}`] = d;
  });

  let cellsXml = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const item = gridMap[`${r}-${c}`];
      const val = item ? Math.min(Math.max(item.value, 0), 1) : 0;
      const colorIdx = Math.min(Math.floor(val * colorScale.length), colorScale.length - 1);
      const color = colorScale[colorIdx];
      const x = padLeft + c * (cellSize + gap);
      const y = padTop + r * (cellSize + gap);

      cellsXml += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="3" fill="${color}" />`;
    }
  }

  let titleXml = "";
  if (title) {
    titleXml = `<text x="${padLeft}" y="28" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>`;
  }

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-chart swag-heatmap">
    ${titleXml}
    ${cellsXml}
  </svg>`;
}
