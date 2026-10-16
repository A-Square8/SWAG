/**
 * Developer Native Visual Widgets.
 * Includes Terminal windows, Code Diffs, Git Graphs, File Trees, API Cards, and Badge Walls.
 */

export interface TerminalLine {
  text: string;
  type?: "command" | "output" | "success" | "error" | "warning" | "comment";
}

export interface TerminalOptions {
  title?: string;
  prompt?: string;
  width?: string | number;
  height?: string | number;
}

export interface DiffLine {
  type: "add" | "del" | "normal";
  content: string;
  lineNumber?: number;
}

export interface CodeDiffOptions {
  filename?: string;
  language?: string;
  oldFilename?: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  author?: string;
  branch?: string;
  tag?: string;
}

export interface GitGraphOptions {
  width?: number;
  height?: number;
}

export interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  comment?: string;
}

export interface ApiEndpointItem {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description?: string;
  status?: number;
}

export interface BadgeItem {
  label: string;
  value: string;
  color?: string; // e.g. "green", "blue", "orange"
  logo?: string;
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
 * 1. Terminal Output Window
 */
export function renderTerminal(
  lines: Array<string | TerminalLine>,
  options: TerminalOptions = {},
): string {
  const title = options.title ?? "bash — 80x24";
  const defaultPrompt = options.prompt ?? "$ ";

  const renderedLines = lines.map((line) => {
    if (typeof line === "string") {
      if (line.startsWith("$ ") || line.startsWith("> ")) {
        return `<div class="term-line cmd"><span class="term-prompt">${escapeHtml(line.slice(0, 2))}</span><span class="term-cmd-text">${escapeHtml(line.slice(2))}</span></div>`;
      }
      return `<div class="term-line out">${escapeHtml(line)}</div>`;
    }
    const type = line.type ?? "output";
    if (type === "command") {
      return `<div class="term-line cmd"><span class="term-prompt">${escapeHtml(defaultPrompt)}</span><span class="term-cmd-text">${escapeHtml(line.text)}</span></div>`;
    }
    return `<div class="term-line ${type}">${escapeHtml(line.text)}</div>`;
  }).join("\n");

  return `
    <div class="swag-terminal-window">
      <div class="term-header">
        <div class="term-dots">
          <span class="dot close"></span>
          <span class="dot min"></span>
          <span class="dot zoom"></span>
        </div>
        <div class="term-title">${escapeHtml(title)}</div>
        <div class="term-spacer"></div>
      </div>
      <div class="term-body">
        ${renderedLines}
      </div>
      <style>
        .swag-terminal-window {
          background: #090d16;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          overflow: hidden;
          font-family: JetBrains Mono, monospace;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          width: 100%;
          text-align: left;
        }
        .term-header {
          display: flex;
          align-items: center;
          background: #111827;
          padding: 8px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .term-dots {
          display: flex;
          gap: 6px;
        }
        .term-dots .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .term-dots .close { background: #ef4444; }
        .term-dots .min { background: #f59e0b; }
        .term-dots .zoom { background: #10b981; }
        .term-title {
          flex: 1;
          text-align: center;
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
        }
        .term-spacer { width: 40px; }
        .term-body {
          padding: 16px 20px;
          font-size: 13px;
          line-height: 1.6;
          color: #e2e8f0;
          overflow-x: auto;
        }
        .term-line {
          margin: 3px 0;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .term-line.cmd {
          color: #f8fafc;
          font-weight: 600;
        }
        .term-prompt {
          color: #38bdf8;
          margin-right: 6px;
        }
        .term-line.success { color: #34d399; }
        .term-line.error { color: #f87171; }
        .term-line.warning { color: #fbbf24; }
        .term-line.comment { color: #64748b; font-style: italic; }
      </style>
    </div>
  `;
}

/**
 * 2. Code Diff Viewer (Green additions / Red deletions)
 */
export function renderCodeDiff(
  lines: DiffLine[],
  options: CodeDiffOptions = {},
): string {
  const filename = options.filename ?? "diff.patch";

  const diffRows = lines.map((line, idx) => {
    const sign = line.type === "add" ? "+" : line.type === "del" ? "-" : " ";
    const lineNum = line.lineNumber ?? idx + 1;
    return `
      <div class="diff-line diff-${line.type}">
        <span class="diff-num">${lineNum}</span>
        <span class="diff-sign">${sign}</span>
        <span class="diff-text">${escapeHtml(line.content)}</span>
      </div>
    `;
  }).join("\n");

  return `
    <div class="swag-code-diff">
      <div class="diff-header">
        <span class="diff-file-icon">📄</span>
        <span class="diff-filename">${escapeHtml(filename)}</span>
      </div>
      <div class="diff-body">
        ${diffRows}
      </div>
      <style>
        .swag-code-diff {
          background: #090d16;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          overflow: hidden;
          font-family: JetBrains Mono, monospace;
          font-size: 13px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
          text-align: left;
        }
        .diff-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #111827;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
        }
        .diff-body {
          padding: 10px 0;
          line-height: 1.5;
        }
        .diff-line {
          display: flex;
          padding: 2px 14px;
        }
        .diff-line.diff-add {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }
        .diff-line.diff-del {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }
        .diff-line.diff-normal {
          color: #94a3b8;
        }
        .diff-num {
          width: 32px;
          color: #475569;
          user-select: none;
        }
        .diff-sign {
          width: 18px;
          font-weight: 700;
          user-select: none;
        }
        .diff-text {
          flex: 1;
          white-space: pre;
        }
      </style>
    </div>
  `;
}

/**
 * 3. Git Commit Graph
 */
export function renderGitGraph(
  commits: GitCommit[],
  options: GitGraphOptions = {},
): string {
  const width = options.width ?? 600;
  const height = options.height ?? 280;

  const rowHeight = 44;
  const nodeX = 40;

  let graphXml = "";
  commits.forEach((c, idx) => {
    const y = 30 + idx * rowHeight;
    const isLast = idx === commits.length - 1;

    // Line downwards
    if (!isLast) {
      graphXml += `<line x1="${nodeX}" y1="${y}" x2="${nodeX}" y2="${y + rowHeight}" stroke="#6366f1" stroke-width="2.5" />`;
    }

    // Commit node circle
    graphXml += `<circle cx="${nodeX}" cy="${y}" r="6" fill="#6366f1" stroke="#090d16" stroke-width="2.5" />`;

    // Commit hash
    graphXml += `<text x="${nodeX + 22}" y="${y + 4}" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#38bdf8">${escapeHtml(c.hash.slice(0, 7))}</text>`;

    // Message
    graphXml += `<text x="${nodeX + 90}" y="${y + 4}" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#f8fafc">${escapeHtml(c.message)}</text>`;

    // Tag / Branch badge
    if (c.tag || c.branch) {
      const badgeText = c.tag ? `tag: ${c.tag}` : c.branch || "";
      graphXml += `
        <rect x="${width - 110}" y="${y - 10}" width="90" height="20" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1" />
        <text x="${width - 65}" y="${y + 4}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="600" fill="#34d399">${escapeHtml(badgeText)}</text>
      `;
    }
  });

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" class="swag-git-graph">
    ${graphXml}
  </svg>`;
}

/**
 * 4. File Tree
 */
export function renderFileTree(nodes: FileTreeNode[]): string {
  function renderNodes(list: FileTreeNode[], depth: number): string {
    return list.map((node) => {
      const indent = depth * 20;
      const icon = node.type === "folder" ? "📁" : "📄";
      const isFolder = node.type === "folder";

      let html = `
        <div class="tree-row" style="padding-left: ${indent}px;">
          <span class="tree-icon">${icon}</span>
          <span class="tree-name ${isFolder ? "folder" : "file"}">${escapeHtml(node.name)}</span>
          ${node.comment ? `<span class="tree-comment">// ${escapeHtml(node.comment)}</span>` : ""}
        </div>
      `;

      if (node.children && node.children.length > 0) {
        html += renderNodes(node.children, depth + 1);
      }
      return html;
    }).join("\n");
  }

  return `
    <div class="swag-file-tree">
      ${renderNodes(nodes, 0)}
      <style>
        .swag-file-tree {
          background: #090d16;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px 20px;
          font-family: JetBrains Mono, monospace;
          font-size: 13px;
          line-height: 1.8;
          color: #e2e8f0;
          text-align: left;
        }
        .tree-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tree-icon { font-size: 14px; }
        .tree-name.folder { font-weight: 700; color: #38bdf8; }
        .tree-name.file { color: #f8fafc; }
        .tree-comment { color: #64748b; font-size: 11px; margin-left: 12px; font-style: italic; }
      </style>
    </div>
  `;
}

/**
 * 5. API Endpoint Cards
 */
export function renderApiEndpoints(endpoints: ApiEndpointItem[]): string {
  const methodColors: Record<string, { bg: string; color: string }> = {
    GET: { bg: "rgba(16, 185, 129, 0.2)", color: "#34d399" },
    POST: { bg: "rgba(99, 102, 241, 0.2)", color: "#818cf8" },
    PUT: { bg: "rgba(245, 158, 11, 0.2)", color: "#fbbf24" },
    PATCH: { bg: "rgba(236, 72, 153, 0.2)", color: "#f472b6" },
    DELETE: { bg: "rgba(239, 68, 68, 0.2)", color: "#f87171" },
  };

  const rows = endpoints.map((ep) => {
    const style = methodColors[ep.method] || methodColors.GET;
    return `
      <div class="api-card-row">
        <span class="api-badge" style="background: ${style.bg}; color: ${style.color};">${ep.method}</span>
        <span class="api-path">${escapeHtml(ep.path)}</span>
        ${ep.description ? `<span class="api-desc">${escapeHtml(ep.description)}</span>` : ""}
        ${ep.status ? `<span class="api-status">${ep.status}</span>` : ""}
      </div>
    `;
  }).join("\n");

  return `
    <div class="swag-api-endpoints">
      ${rows}
      <style>
        .swag-api-endpoints {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        .api-card-row {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 16px;
          font-family: JetBrains Mono, monospace;
        }
        .api-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .api-path {
          font-size: 13px;
          font-weight: 600;
          color: #f8fafc;
        }
        .api-desc {
          margin-left: auto;
          font-size: 12px;
          font-family: Inter, sans-serif;
          color: #94a3b8;
        }
        .api-status {
          font-size: 11px;
          color: #64748b;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
        }
      </style>
    </div>
  `;
}

/**
 * 6. Badge Wall (Shields.io style pill badges)
 */
export function renderBadgeWall(badges: BadgeItem[]): string {
  const badgeColors: Record<string, string> = {
    green: "#10b981",
    blue: "#0ea5e9",
    purple: "#8b5cf6",
    orange: "#f59e0b",
    red: "#ef4444",
    gray: "#64748b",
  };

  const pills = badges.map((b) => {
    const rightBg = badgeColors[b.color ?? "blue"] || (b.color ?? "#0ea5e9");
    return `
      <div class="swag-shield-badge">
        <span class="shield-label">${escapeHtml(b.label)}</span>
        <span class="shield-val" style="background: ${rightBg};">${escapeHtml(b.value)}</span>
      </div>
    `;
  }).join("\n");

  return `
    <div class="swag-badge-wall">
      ${pills}
      <style>
        .swag-badge-wall {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .swag-shield-badge {
          display: inline-flex;
          border-radius: 4px;
          overflow: hidden;
          font-family: Inter, sans-serif;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .shield-label {
          background: #334155;
          color: #ffffff;
          padding: 4px 8px;
        }
        .shield-val {
          color: #ffffff;
          padding: 4px 8px;
        }
      </style>
    </div>
  `;
}
