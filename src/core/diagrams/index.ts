/**
 * Pure inline SVG Diagram Rendering Engine.
 * Zero external dependencies. Renders pipelines, flowcharts, architectures, dependency trees, and layer stacks.
 */

export interface PipelineStep {
  label: string;
  sublabel?: string;
  icon?: string; // e.g. "git", "build", "test", "deploy"
  status?: "pending" | "running" | "completed" | "error";
  duration?: string;
}

export interface PipelineOptions {
  width?: number;
  height?: number;
  title?: string;
  accentColor?: string;
}

export interface FlowchartNode {
  id: string;
  label: string;
  type?: "process" | "decision" | "start" | "end";
  x?: number;
  y?: number;
  color?: string;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
  type?: "solid" | "dashed";
}

export interface FlowchartOptions {
  width?: number;
  height?: number;
  title?: string;
}

export interface ArchitectureService {
  id: string;
  name: string;
  category?: "client" | "gateway" | "service" | "database" | "cache" | "queue" | "external";
  tech?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  label?: string;
  bidirectional?: boolean;
}

export interface ArchitectureOptions {
  width?: number;
  height?: number;
  title?: string;
  subtitle?: string;
}

export interface DependencyTreeNode {
  name: string;
  version?: string;
  children?: DependencyTreeNode[];
}

export interface DependencyTreeOptions {
  width?: number;
  height?: number;
  title?: string;
}

export interface LayerItem {
  name: string;
  description?: string;
  badge?: string;
  tech?: string[];
  color?: string;
}

export interface LayerStackOptions {
  width?: number;
  height?: number;
  title?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * 1. Linear Pipeline (Horizontal CI/CD or data flow)
 */
export function parsePipelineSteps(input: unknown): PipelineStep[] {
  if (Array.isArray(input) && input.length > 0) {
    if (typeof input[0] === "object" && input[0] !== null) {
      return input.map((it: any, idx) => ({
        label: String(it.label || it.name || it.title || `Step ${idx + 1}`),
        sublabel: it.sublabel ? String(it.sublabel) : undefined,
        duration: it.duration ? String(it.duration) : undefined,
        status: it.status ?? (idx === 0 ? "completed" : idx === 1 ? "running" : "pending"),
        icon: it.icon ? String(it.icon) : undefined,
      }));
    }

    if (typeof input[0] === "string") {
      const count = input.length;
      return (input as string[])
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((raw, idx) => {
          let clean = raw.replace(/^[0-9]{1,2}[:.)-]\s*/, "");
          let duration: string | undefined;

          if (clean.includes(":")) {
            const colonIdx = clean.indexOf(":");
            duration = clean.slice(colonIdx + 1).trim();
            clean = clean.slice(0, colonIdx).trim();
          }

          let status: PipelineStep["status"] = "pending";
          if (idx < count - 1) {
            status = "completed";
          } else {
            status = "running";
          }

          return {
            label: clean,
            duration,
            status,
          };
        });
    }
  }

  return [
    { label: "1. Ingest", status: "completed", duration: "50ms" },
    { label: "2. Validate", status: "completed", duration: "120ms" },
    { label: "3. Execute", status: "completed", duration: "450ms" },
    { label: "4. Deliver", status: "running", duration: "Active" },
  ];
}

/**
 * 1. Linear Pipeline (Horizontal CI/CD or data flow)
 */
export function renderPipeline(
  steps: PipelineStep[],
  options: PipelineOptions = {},
): string {
  const width = options.width ?? 720;
  const height = options.height ?? 180;
  const title = options.title;
  const accentColor = options.accentColor ?? "#6366f1";

  if (steps.length === 0) {
    return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  const padX = 24;
  const topOffset = title ? 48 : 20;
  const effectiveW = width - padX * 2;
  const stepCount = steps.length;
  const gap = stepCount <= 4 ? 32 : stepCount <= 6 ? 20 : 14;
  const boxW = Math.max(88, Math.min(145, (effectiveW - (stepCount - 1) * gap) / stepCount));
  const boxH = 76;
  const totalStepsWidth = stepCount * boxW + (stepCount - 1) * gap;
  const startX = padX + Math.max(0, (effectiveW - totalStepsWidth) / 2);
  const startY = topOffset + (height - topOffset - boxH) / 2;

  let stepsXml = "";
  let titleXml = "";

  if (title) {
    titleXml = `<text x="24" y="28" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>`;
  }

  const labelFontSize = stepCount <= 4 ? 13 : stepCount <= 6 ? 11 : 10;

  steps.forEach((step, i) => {
    const x = startX + i * (boxW + gap);
    const y = startY;
    const isLast = i === steps.length - 1;

    let statusBorder = "rgba(255,255,255,0.12)";
    let statusBg = "rgba(15, 23, 42, 0.8)";
    let badgeColor = "#64748b";

    if (step.status === "completed") {
      statusBorder = "#10b981";
      statusBg = "rgba(16, 185, 129, 0.12)";
      badgeColor = "#10b981";
    } else if (step.status === "running") {
      statusBorder = accentColor;
      statusBg = "rgba(99, 102, 241, 0.18)";
      badgeColor = accentColor;
    } else if (step.status === "error") {
      statusBorder = "#ef4444";
      statusBg = "rgba(239, 68, 68, 0.12)";
      badgeColor = "#ef4444";
    }

    stepsXml += `
      <g class="pipeline-step">
        <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="12" fill="${statusBg}" stroke="${statusBorder}" stroke-width="1.5" />
        <circle cx="${x + 18}" cy="${y + 20}" r="4.5" fill="${badgeColor}" />
        <text x="${x + 28}" y="${y + 24}" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#94a3b8">STEP ${i + 1}</text>
        <text x="${x + 12}" y="${y + 46}" font-family="Inter, sans-serif" font-size="${labelFontSize}" font-weight="700" fill="#f8fafc">${escapeXml(step.label)}</text>
        ${
          step.sublabel || step.duration
            ? `<text x="${x + 12}" y="${y + 62}" font-family="Inter, sans-serif" font-size="10" font-weight="500" fill="#64748b">${escapeXml(step.duration ?? step.sublabel ?? "")}</text>`
            : ""
        }
      </g>
    `;

    // Connector Arrow
    if (!isLast) {
      const arrowStartX = x + boxW + 2;
      const arrowEndX = arrowStartX + gap - 4;
      const arrowY = y + boxH / 2;
      stepsXml += `
        <g class="pipeline-arrow">
          <line x1="${arrowStartX}" y1="${arrowY}" x2="${arrowEndX}" y2="${arrowY}" stroke="#64748b" stroke-width="2" stroke-linecap="round" />
          <polygon points="${arrowEndX + 2},${arrowY} ${arrowEndX - 4},${arrowY - 3.5} ${arrowEndX - 4},${arrowY + 3.5}" fill="#64748b" />
        </g>
      `;
    }
  });

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-diagram swag-pipeline">
    ${titleXml}
    ${stepsXml}
  </svg>`;
}

// ---------------------------------------------------------------------------
// 2. Flowchart & Decision Tree Logic
// ---------------------------------------------------------------------------

export function parseFlowchartData(input: unknown): { nodes: FlowchartNode[]; edges: FlowchartEdge[] } {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.nodes) && obj.nodes.length > 0) {
      return {
        nodes: obj.nodes as FlowchartNode[],
        edges: (obj.edges as FlowchartEdge[]) || [],
      };
    }
  }

  if (Array.isArray(input) && input.length > 0) {
    if (typeof input[0] === "object" && input[0] !== null && "id" in input[0]) {
      return { nodes: input as FlowchartNode[], edges: [] };
    }

    if (typeof input[0] === "string") {
      const rawLines = (input as string[]).map((s) => s.trim()).filter((s) => s.length > 0);
      const nodes: FlowchartNode[] = [];
      const edges: FlowchartEdge[] = [];

      let prevId: string | null = null;
      let decisionId: string | null = null;
      let decisionBranchCount = 0;
      let branchProcessIds: string[] = [];

      rawLines.forEach((line, idx) => {
        let type: FlowchartNode["type"] = "process";
        let label = line;
        let edgeLabel: string | undefined;

        if (/^start/i.test(line)) {
          type = "start";
          label = line.replace(/^start[:\s-]*/i, "").trim() || "Start";
        } else if (/^decision|if\b|\?/i.test(line)) {
          type = "decision";
          label = line.replace(/^decision[:\s-]*/i, "").trim();
          if (label.includes("->")) {
            label = label.split("->")[0].trim();
          }
        } else if (/^end|finish|done/i.test(line)) {
          type = "end";
          label = line.replace(/^end[:\s-]*/i, "").trim() || "Complete";
        } else {
          label = line.replace(/^process[:\s-]*/i, "").trim();
        }

        const branchMatch = label.match(/[\(\[\-]\s*(YES|NO|TRUE|FALSE|SUCCESS|FAIL|PASS)\s*[\)\]\:]?/i);
        if (branchMatch) {
          edgeLabel = branchMatch[1].toUpperCase();
          label = label.replace(/[\(\[\-]\s*(YES|NO|TRUE|FALSE|SUCCESS|FAIL|PASS)\s*[\)\]\:]?/i, "").trim();
        }

        const id = `node-${idx + 1}`;
        nodes.push({ id, label: label || `Step ${idx + 1}`, type });

        if (type === "decision") {
          decisionId = id;
          decisionBranchCount = 0;
          branchProcessIds = [];
        }

        if (prevId) {
          if (type === "end") {
            if (branchProcessIds.length > 0) {
              branchProcessIds.forEach((bId) => {
                edges.push({ from: bId, to: id });
              });
            } else {
              edges.push({ from: prevId, to: id });
            }
          } else if (decisionId && decisionBranchCount < 2 && type === "process") {
            const autoLabel = edgeLabel || (decisionBranchCount === 0 ? "YES" : "NO");
            edges.push({ from: decisionId, to: id, label: autoLabel });
            branchProcessIds.push(id);
            decisionBranchCount++;
          } else {
            edges.push({ from: prevId, to: id, label: edgeLabel });
          }
        }
        prevId = id;
      });

      if (nodes.length > 0) {
        return { nodes, edges };
      }
    }
  }

  return {
    nodes: [
      { id: "start", label: "Incoming Request", type: "start" },
      { id: "decision", label: "Valid Schema?", type: "decision", color: "#f59e0b" },
      { id: "proc-fast", label: "Run Core Engine", type: "process", color: "#10b981" },
      { id: "proc-fallback", label: "Handle Exception", type: "process", color: "#ef4444" },
      { id: "end", label: "Verified Output", type: "end", color: "#38bdf8" },
    ],
    edges: [
      { from: "start", to: "decision" },
      { from: "decision", to: "proc-fast", label: "YES" },
      { from: "decision", to: "proc-fallback", label: "NO" },
      { from: "proc-fast", to: "end" },
      { from: "proc-fallback", to: "end" },
    ],
  };
}

export function renderFlowchart(
  nodes: FlowchartNode[],
  edges: FlowchartEdge[],
  options: FlowchartOptions = {},
): string {
  const width = options.width ?? 720;
  const height = options.height ?? 380;
  const title = options.title;

  let titleXml = "";
  if (title) {
    titleXml = `<text x="24" y="28" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>`;
  }

  // Node position map
  const nodeMap = new Map<string, FlowchartNode>();
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();

  nodes.forEach((n) => {
    nodeMap.set(n.id, n);
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
  });

  edges.forEach((e) => {
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1);
    outEdges.get(e.from)?.push(e.to);
  });

  // Calculate layout if any node lacks coordinates
  const needsLayout = nodes.some((n) => n.x === undefined || n.y === undefined);
  if (needsLayout) {
    // Topological depth assignment
    const depths = new Map<string, number>();
    const roots = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0 || n.type === "start");
    if (roots.length === 0 && nodes.length > 0) roots.push(nodes[0]);

    const queue: Array<{ id: string; depth: number }> = roots.map((r) => ({ id: r.id, depth: 0 }));
    roots.forEach((r) => depths.set(r.id, 0));

    while (queue.length > 0) {
      const cur = queue.shift()!;
      const targets = outEdges.get(cur.id) || [];
      for (const tgt of targets) {
        const nextDepth = cur.depth + 1;
        if (!depths.has(tgt) || depths.get(tgt)! < nextDepth) {
          depths.set(tgt, nextDepth);
          queue.push({ id: tgt, depth: nextDepth });
        }
      }
    }

    // Assign fallback depth for unreached nodes
    let maxAssignedDepth = 0;
    nodes.forEach((n) => {
      const d = depths.get(n.id) ?? 0;
      if (d > maxAssignedDepth) maxAssignedDepth = d;
    });

    nodes.forEach((n, idx) => {
      if (!depths.has(n.id)) {
        depths.set(n.id, (idx % (maxAssignedDepth + 1)));
      }
    });

    // Group nodes by depth
    const levels = new Map<number, FlowchartNode[]>();
    nodes.forEach((n) => {
      const d = depths.get(n.id) ?? 0;
      if (!levels.has(d)) levels.set(d, []);
      levels.get(d)!.push(n);
    });

    const levelCount = Math.max(1, ...levels.keys()) + 1;
    const colWidth = (width - 140) / Math.max(1, levelCount - 1);
    const startYOffset = title ? 55 : 25;
    const availableH = height - startYOffset - 30;

    levels.forEach((lvlNodes, lvlIndex) => {
      const countInLevel = lvlNodes.length;
      const x = 50 + lvlIndex * colWidth;
      const rowSpacing = availableH / Math.max(1, countInLevel);

      lvlNodes.forEach((n, rowIdx) => {
        n.x = Math.round(x);
        n.y = Math.round(startYOffset + rowIdx * rowSpacing + (rowSpacing - 48) / 2);
      });
    });
  }

  let edgesXml = "";
  edges.forEach((edge) => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return;

    const fromIsDecision = fromNode.type === "decision";
    const toIsDecision = toNode.type === "decision";

    const nodeW = 120;
    const nodeH = 48;

    const fxCenter = (fromNode.x ?? 0) + nodeW / 2;
    const fyCenter = (fromNode.y ?? 0) + nodeH / 2;
    const txCenter = (toNode.x ?? 0) + nodeW / 2;
    const tyCenter = (toNode.y ?? 0) + nodeH / 2;

    let fx = fxCenter;
    let fy = fyCenter;
    let tx = txCenter;
    let ty = tyCenter;

    // Connect from right of source to left of target if going rightward
    if (txCenter > fxCenter + 30) {
      fx = (fromNode.x ?? 0) + nodeW + (fromIsDecision ? 6 : 0);
      fy = fyCenter;
      tx = (toNode.x ?? 0) - 6;
      ty = tyCenter;
    } else if (txCenter < fxCenter - 30) {
      fx = (fromNode.x ?? 0) - (fromIsDecision ? 6 : 0);
      fy = fyCenter;
      tx = (toNode.x ?? 0) + nodeW + 6;
      ty = tyCenter;
    } else if (tyCenter > fyCenter) {
      fx = fxCenter;
      fy = (fromNode.y ?? 0) + nodeH + 4;
      tx = txCenter;
      ty = (toNode.y ?? 0) - 6;
    } else {
      fx = fxCenter;
      fy = (fromNode.y ?? 0) - 4;
      tx = txCenter;
      ty = (toNode.y ?? 0) + nodeH + 6;
    }

    const midX = (fx + tx) / 2;
    const midY = (fy + ty) / 2;
    const isYes = edge.label?.toUpperCase() === "YES" || edge.label?.toUpperCase() === "TRUE";
    const isNo = edge.label?.toUpperCase() === "NO" || edge.label?.toUpperCase() === "FALSE";
    const edgeColor = isYes ? "#10b981" : isNo ? "#ef4444" : "#38bdf8";
    const markerId = isYes ? "flowchart-arrow-yes" : isNo ? "flowchart-arrow-no" : "flowchart-arrow";

    edgesXml += `
      <line x1="${fx}" y1="${fy}" x2="${tx}" y2="${ty}" stroke="${edgeColor}" stroke-width="2" stroke-dasharray="${edge.type === "dashed" ? "4,4" : "none"}" marker-end="url(#${markerId})" />
      ${
        edge.label
          ? `<rect x="${midX - 18}" y="${midY - 11}" width="36" height="20" rx="6" fill="#0f172a" stroke="${edgeColor}" stroke-width="1.2" />
             <text x="${midX}" y="${midY + 3.5}" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="800" fill="${edgeColor}">${escapeXml(edge.label)}</text>`
          : ""
      }
    `;
  });

  let nodesXml = "";
  nodes.forEach((n) => {
    const x = n.x ?? 0;
    const y = n.y ?? 0;
    const color = n.color ?? (n.type === "decision" ? "#f59e0b" : n.type === "start" ? "#10b981" : n.type === "end" ? "#38bdf8" : "#6366f1");

    if (n.type === "decision") {
      // Diamond
      const cx = x + 60;
      const cy = y + 24;
      nodesXml += `
        <g class="flowchart-node decision-node">
          <polygon points="${cx},${cy - 28} ${cx + 64},${cy} ${cx},${cy + 28} ${cx - 64},${cy}" fill="rgba(245, 158, 11, 0.15)" stroke="${color}" stroke-width="2" filter="drop-shadow(0 0 8px rgba(245,158,11,0.3))" />
          <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#f8fafc">${escapeXml(n.label)}</text>
        </g>
      `;
    } else if (n.type === "start" || n.type === "end") {
      // Stadium / pill shape
      nodesXml += `
        <g class="flowchart-node terminal-node">
          <rect x="${x}" y="${y}" width="124" height="48" rx="24" fill="rgba(15, 23, 42, 0.85)" stroke="${color}" stroke-width="2" />
          <text x="${x + 62}" y="${y + 28}" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#f8fafc">${escapeXml(n.label)}</text>
        </g>
      `;
    } else {
      // Process rectangle
      nodesXml += `
        <g class="flowchart-node process-node">
          <rect x="${x}" y="${y}" width="124" height="48" rx="10" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
          <circle cx="${x + 14}" cy="${y + 24}" r="3.5" fill="${color}" />
          <text x="${x + 66}" y="${y + 28}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#f8fafc">${escapeXml(n.label)}</text>
        </g>
      `;
    }
  });

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-diagram swag-flowchart">
    <defs>
      <marker id="flowchart-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="flowchart-arrow-yes" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
      </marker>
      <marker id="flowchart-arrow-no" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
      </marker>
    </defs>
    ${titleXml}
    ${edgesXml}
    ${nodesXml}
  </svg>`;
}

/**
 * 3. Architecture Diagram (Microservices, topology, components)
 */
export function renderArchitectureDiagram(
  services: ArchitectureService[],
  connections: ArchitectureConnection[],
  options: ArchitectureOptions = {},
): string {
  const width = options.width ?? 760;
  const height = options.height ?? 420;
  const title = options.title;
  const subtitle = options.subtitle;

  let titleXml = "";
  if (title) {
    titleXml = `
      <text x="28" y="32" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>
      ${subtitle ? `<text x="28" y="52" font-family="Inter, sans-serif" font-size="12" fill="#94a3b8">${escapeXml(subtitle)}</text>` : ""}
    `;
  }

  const categoryColors: Record<string, { bg: string; border: string; badge: string }> = {
    client: { bg: "rgba(56, 189, 248, 0.12)", border: "#0ea5e9", badge: "#38bdf8" },
    gateway: { bg: "rgba(99, 102, 241, 0.12)", border: "#6366f1", badge: "#818cf8" },
    service: { bg: "rgba(168, 85, 247, 0.12)", border: "#a855f7", badge: "#c084fc" },
    database: { bg: "rgba(16, 185, 129, 0.12)", border: "#10b981", badge: "#34d399" },
    cache: { bg: "rgba(245, 158, 11, 0.12)", border: "#f59e0b", badge: "#fbbf24" },
    queue: { bg: "rgba(236, 72, 153, 0.12)", border: "#ec4899", badge: "#f472b6" },
    external: { bg: "rgba(148, 163, 184, 0.12)", border: "#64748b", badge: "#94a3b8" },
  };

  const serviceMap = new Map<string, ArchitectureService>();
  services.forEach((s) => serviceMap.set(s.id, s));

  // Connections
  let connXml = "";
  connections.forEach((c) => {
    const fromS = serviceMap.get(c.from);
    const toS = serviceMap.get(c.to);
    if (!fromS || !toS) return;

    const fw = fromS.width ?? 140;
    const fh = fromS.height ?? 60;
    const tw = toS.width ?? 140;
    const th = toS.height ?? 60;

    const fx = fromS.x + fw / 2;
    const fy = fromS.y + fh / 2;
    const tx = toS.x + tw / 2;
    const ty = toS.y + th / 2;

    const midX = (fx + tx) / 2;
    const midY = (fy + ty) / 2;

    connXml += `
      <line x1="${fx}" y1="${fy}" x2="${tx}" y2="${ty}" stroke="#475569" stroke-width="2" stroke-dasharray="4,4" />
      ${
        c.label
          ? `<rect x="${midX - 24}" y="${midY - 9}" width="48" height="18" rx="4" fill="#090d16" stroke="#334155" stroke-width="1" />
             <text x="${midX}" y="${midY + 4}" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#94a3b8">${escapeXml(c.label)}</text>`
          : ""
      }
    `;
  });

  // Services
  let svcXml = "";
  services.forEach((s) => {
    const sw = s.width ?? 140;
    const sh = s.height ?? 64;
    const theme = categoryColors[s.category ?? "service"] || categoryColors.service;

    svcXml += `
      <g class="arch-service" transform="translate(${s.x}, ${s.y})">
        <rect width="${sw}" height="${sh}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1.5" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.3))" />
        <text x="12" y="22" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="${theme.badge}">${(s.category ?? "SERVICE").toUpperCase()}</text>
        <text x="12" y="42" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#f8fafc">${escapeXml(s.name)}</text>
        ${
          s.tech
            ? `<text x="${sw - 12}" y="22" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="#94a3b8">${escapeXml(s.tech)}</text>`
            : ""
        }
      </g>
    `;
  });

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-diagram swag-architecture">
    ${titleXml}
    ${connXml}
    ${svcXml}
  </svg>`;
}

/**
 * 4. Dependency Tree (Hierarchical package/module structure)
 */
export function renderDependencyTree(
  tree: DependencyTreeNode,
  options: DependencyTreeOptions = {},
): string {
  const width = options.width ?? 580;
  const height = options.height ?? 340;
  const title = options.title;

  let titleXml = "";
  if (title) {
    titleXml = `<text x="24" y="28" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>`;
  }

  let y = title ? 60 : 30;
  let treeLinesXml = "";

  function traverse(node: DependencyTreeNode, depth: number, isLast: boolean, prefix: string) {
    const indent = depth * 28 + 24;
    const nodeColor = depth === 0 ? "#6366f1" : depth === 1 ? "#38bdf8" : "#94a3b8";

    treeLinesXml += `
      <g transform="translate(${indent}, ${y})">
        <circle cx="0" cy="-4" r="4" fill="${nodeColor}" />
        <text x="12" y="0" font-family="JetBrains Mono, monospace" font-size="13" font-weight="${depth === 0 ? "700" : "500"}" fill="#f8fafc">
          ${escapeXml(node.name)}
          ${node.version ? `<tspan fill="#64748b"> @${escapeXml(node.version)}</tspan>` : ""}
        </text>
      </g>
    `;
    y += 28;

    if (node.children) {
      node.children.forEach((child, idx) => {
        traverse(child, depth + 1, idx === (node.children?.length ?? 1) - 1, prefix);
      });
    }
  }

  traverse(tree, 0, true, "");

  return `<svg viewBox="0 0 ${width} ${Math.max(height, y + 20)}" width="${width}" height="${Math.max(height, y + 20)}" xmlns="http://www.w3.org/2000/svg" class="swag-diagram swag-deptree">
    ${titleXml}
    ${treeLinesXml}
  </svg>`;
}

/**
 * 5. Layer Stack (Frontend → API → Core → Database layers)
 */
export function renderLayerStack(
  layers: LayerItem[],
  options: LayerStackOptions = {},
): string {
  const width = options.width ?? 640;
  const height = options.height ?? 340;
  const title = options.title;

  let titleXml = "";
  if (title) {
    titleXml = `<text x="24" y="28" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#f8fafc">${escapeXml(title)}</text>`;
  }

  const topOffset = title ? 48 : 20;
  const padX = 30;
  const stackW = width - padX * 2;
  const layerH = Math.min(56, (height - topOffset - 24) / Math.max(layers.length, 1) - 10);

  let stackXml = "";
  layers.forEach((layer, i) => {
    const y = topOffset + i * (layerH + 10);
    const color = layer.color ?? "#6366f1";

    stackXml += `
      <g class="layer-item" transform="translate(${padX}, ${y})">
        <rect width="${stackW}" height="${layerH}" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
        <rect width="6" height="${layerH}" rx="3" fill="${color}" />
        <text x="24" y="${layerH / 2 + 5}" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#f8fafc">${escapeXml(layer.name)}</text>
        ${
          layer.description
            ? `<text x="180" y="${layerH / 2 + 5}" font-family="Inter, sans-serif" font-size="12" fill="#94a3b8">${escapeXml(layer.description)}</text>`
            : ""
        }
        ${
          layer.tech && layer.tech.length > 0
            ? `<text x="${stackW - 20}" y="${layerH / 2 + 5}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="#38bdf8">${escapeXml(layer.tech.join(" · "))}</text>`
            : ""
        }
      </g>
    `;
  });

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-diagram swag-layer-stack">
    ${titleXml}
    ${stackXml}
  </svg>`;
}
