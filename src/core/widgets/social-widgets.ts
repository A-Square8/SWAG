/**
 * Social Proof & Comparison Widgets.
 * Includes Testimonial cards, Star ratings, Tweet/Post embeds, and Feature Matrices (✅/❌).
 */

import { IconEngine } from "../icons/index.js";

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  avatarInitials?: string;
}

export interface StarRatingOptions {
  rating?: number; // e.g. 4.9
  maxRating?: number; // e.g. 5
  reviewCount?: number | string; // e.g. "2,450"
  color?: string;
}

export interface TweetEmbedData {
  authorName: string;
  handle: string;
  avatarUrl?: string;
  content: string;
  timestamp?: string;
  likes?: string | number;
  retweets?: string | number;
  verified?: boolean;
}

export interface FeatureMatrixItem {
  feature: string;
  us: boolean | string;
  competitor1?: boolean | string;
  competitor2?: boolean | string;
}

export interface FeatureMatrixOptions {
  ourName?: string;
  competitor1Name?: string;
  competitor2Name?: string;
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
 * 1. Testimonial Card
 */
export function renderTestimonial(item: TestimonialItem): string {
  const initials = item.avatarInitials || item.author.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return `
    <div class="swag-testimonial-card">
      <div class="quote-mark">“</div>
      <p class="testimonial-quote">${escapeHtml(item.quote)}</p>
      <div class="testimonial-author-row">
        ${
          item.avatarUrl
            ? `<img src="${item.avatarUrl}" class="testimonial-avatar" alt="${escapeHtml(item.author)}" />`
            : `<div class="testimonial-avatar-initials">${escapeHtml(initials)}</div>`
        }
        <div class="author-info">
          <div class="author-name">${escapeHtml(item.author)}</div>
          <div class="author-role">${escapeHtml(item.role || "")}${item.company ? ` · ${escapeHtml(item.company)}` : ""}</div>
        </div>
      </div>
      <style>
        .swag-testimonial-card {
          position: relative;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 28px 32px;
          color: #f8fafc;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
          text-align: left;
        }
        .quote-mark {
          position: absolute;
          top: 14px;
          right: 24px;
          font-size: 64px;
          font-family: Georgia, serif;
          line-height: 1;
          color: rgba(99, 102, 241, 0.25);
          pointer-events: none;
        }
        .testimonial-quote {
          font-size: 18px;
          line-height: 1.6;
          font-weight: 500;
          color: #f1f5f9;
          margin: 0 0 20px 0;
          font-style: italic;
        }
        .testimonial-author-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .testimonial-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #6366f1;
        }
        .testimonial-avatar-initials {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #0ea5e9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          color: #ffffff;
        }
        .author-name {
          font-size: 15px;
          font-weight: 700;
          color: #f8fafc;
        }
        .author-role {
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </div>
  `;
}

/**
 * 2. Star Rating Display
 */
export function renderStarRating(options: StarRatingOptions = {}): string {
  const rating = options.rating ?? 5.0;
  const max = options.maxRating ?? 5;
  const color = options.color ?? "#f59e0b";

  let stars = "";
  for (let i = 1; i <= max; i++) {
    const filled = i <= Math.round(rating);
    stars += `<span class="star ${filled ? "filled" : "empty"}">★</span>`;
  }

  return `
    <div class="swag-star-rating">
      <div class="stars-cluster" style="color: ${color};">${stars}</div>
      <span class="rating-number">${rating.toFixed(1)}</span>
      ${options.reviewCount ? `<span class="review-count">(${options.reviewCount} reviews)</span>` : ""}
      <style>
        .swag-star-rating {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: Inter, sans-serif;
        }
        .stars-cluster {
          font-size: 20px;
          letter-spacing: 2px;
        }
        .stars-cluster .empty {
          opacity: 0.25;
        }
        .rating-number {
          font-weight: 800;
          font-size: 16px;
          color: #f8fafc;
        }
        .review-count {
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </div>
  `;
}

/**
 * 3. Tweet / Social Embed Card
 */
export function renderTweetEmbed(tweet: TweetEmbedData): string {
  return `
    <div class="swag-tweet-card">
      <div class="tweet-header">
        <div class="tweet-avatar-wrap">
          ${
            tweet.avatarUrl
              ? `<img src="${tweet.avatarUrl}" class="tweet-avatar" alt="${escapeHtml(tweet.authorName)}" />`
              : `<div class="tweet-avatar-ph">${tweet.authorName[0]}</div>`
          }
        </div>
        <div class="tweet-user">
          <div class="tweet-name">
            ${escapeHtml(tweet.authorName)}
            ${tweet.verified ? `<span class="tweet-verified">✓</span>` : ""}
          </div>
          <div class="tweet-handle">${escapeHtml(tweet.handle)}</div>
        </div>
        <div class="tweet-icon">𝕏</div>
      </div>
      <div class="tweet-body">
        ${escapeHtml(tweet.content)}
      </div>
      <div class="tweet-footer">
        ${tweet.timestamp ? `<span class="tweet-time">${escapeHtml(tweet.timestamp)}</span>` : ""}
        <div class="tweet-metrics">
          ${tweet.retweets ? `<span>🔁 ${tweet.retweets}</span>` : ""}
          ${tweet.likes ? `<span>❤️ ${tweet.likes}</span>` : ""}
        </div>
      </div>
      <style>
        .swag-tweet-card {
          background: #000000;
          border: 1px solid #2f3336;
          border-radius: 16px;
          padding: 20px 24px;
          color: #e7e9ea;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 520px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
          text-align: left;
        }
        .tweet-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .tweet-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
        }
        .tweet-avatar-ph {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #1d9bf0;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .tweet-user { flex: 1; }
        .tweet-name {
          font-weight: 700;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tweet-verified {
          color: #1d9bf0;
          font-size: 13px;
        }
        .tweet-handle {
          font-size: 13px;
          color: #71767b;
        }
        .tweet-icon {
          font-size: 20px;
          font-weight: 800;
          color: #71767b;
        }
        .tweet-body {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 14px;
          white-space: pre-wrap;
        }
        .tweet-footer {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #71767b;
          border-top: 1px solid #2f3336;
          padding-top: 10px;
        }
        .tweet-metrics {
          display: flex;
          gap: 16px;
        }
      </style>
    </div>
  `;
}

/**
 * 4. Feature Matrix Comparison Table (✅/❌)
 */
export function renderFeatureMatrix(
  items: FeatureMatrixItem[],
  options: FeatureMatrixOptions = {},
): string {
  const ourName = options.ourName ?? "This Project";
  const comp1 = options.competitor1Name ?? "Traditional Way";
  const comp2 = options.competitor2Name;

  function formatVal(v: boolean | string | undefined, isOur: boolean): string {
    if (v === true) {
      return `<span class="val-check ${isOur ? "our-check" : ""}">✓</span>`;
    }
    if (v === false) {
      return `<span class="val-cross">✗</span>`;
    }
    return `<span>${escapeHtml(String(v ?? "—"))}</span>`;
  }

  const rowsHtml = items.map((item) => `
    <tr>
      <td class="col-feature">${escapeHtml(item.feature)}</td>
      <td class="col-our">${formatVal(item.us, true)}</td>
      <td class="col-comp">${formatVal(item.competitor1, false)}</td>
      ${comp2 ? `<td class="col-comp">${formatVal(item.competitor2, false)}</td>` : ""}
    </tr>
  `).join("\n");

  return `
    <div class="swag-feature-matrix">
      <table>
        <thead>
          <tr>
            <th class="col-feature">Feature</th>
            <th class="col-our">${escapeHtml(ourName)}</th>
            <th class="col-comp">${escapeHtml(comp1)}</th>
            ${comp2 ? `<th class="col-comp">${escapeHtml(comp2)}</th>` : ""}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <style>
        .swag-feature-matrix {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          overflow: hidden;
          width: 100%;
          font-family: Inter, sans-serif;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
        }
        .swag-feature-matrix table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .swag-feature-matrix th {
          background: #111827;
          padding: 14px 18px;
          font-size: 13px;
          font-weight: 700;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .swag-feature-matrix td {
          padding: 12px 18px;
          font-size: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
        }
        .col-feature { font-weight: 600; width: 45%; }
        .col-our {
          background: rgba(99, 102, 241, 0.08);
          color: #f8fafc;
          font-weight: 700;
          text-align: center;
        }
        .col-comp {
          text-align: center;
          color: #64748b;
        }
        .val-check {
          color: #10b981;
          font-size: 18px;
          font-weight: 900;
        }
        .val-check.our-check {
          color: #38bdf8;
          font-size: 20px;
        }
        .val-cross {
          color: #ef4444;
          font-size: 16px;
        }
      </style>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// 5. Dynamic Comparison Table (Arbitrary columns & rows, ✅/❌, metrics, badges)
// ---------------------------------------------------------------------------

export interface ComparisonTableRowObject {
  feature?: string;
  label?: string;
  values: Array<string | boolean | number>;
  highlight?: boolean;
}
export type ComparisonTableRow = ComparisonTableRowObject | Array<string | boolean | number>;

export interface ComparisonTableData {
  headers?: string[];
  rows?: ComparisonTableRow[];
  items?: Array<Record<string, unknown>>;
  ourColumnIndex?: number;
}

export interface ComparisonTableOptions {
  ourName?: string;
  title?: string;
  highlightOurColumn?: boolean;
  compact?: boolean;
}

function parseCellVal(v: unknown): string | boolean | number {
  if (typeof v === "boolean" || typeof v === "number") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "yes" || s === "✓" || s === "y") return true;
    if (s === "false" || s === "no" || s === "✗" || s === "n" || s === "x") return false;
    return v.trim();
  }
  return String(v ?? "—");
}

export function parseComparisonTableData(
  input: unknown,
  defaultOurName = "Our Solution",
): ComparisonTableData {
  // If already structured
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.headers) && Array.isArray(obj.rows)) {
      return {
        headers: obj.headers.map(String),
        rows: obj.rows as ComparisonTableRow[],
        ourColumnIndex: typeof obj.ourColumnIndex === "number" ? obj.ourColumnIndex : 1,
      };
    }
    if (Array.isArray(obj.items)) {
      return parseComparisonTableData(obj.items, defaultOurName);
    }
  }

  // If array of items/strings
  if (Array.isArray(input) && input.length > 0) {
    // Case A: Array of FeatureMatrixItem objects: { feature, us, competitor1, competitor2 }
    if (typeof input[0] === "object" && input[0] !== null && ("feature" in input[0] || "us" in input[0])) {
      const hasComp2 = input.some((it) => "competitor2" in it && it.competitor2 !== undefined);
      const headers = ["Feature", defaultOurName, "Legacy Tools"];
      if (hasComp2) headers.push("Alternatives");

      const rows: ComparisonTableRow[] = input.map((it: any) => {
        const feat = it.feature || it.name || it.label || "Feature";
        const vals: Array<string | boolean | number> = [parseCellVal(it.us), parseCellVal(it.competitor1 ?? false)];
        if (hasComp2) vals.push(parseCellVal(it.competitor2 ?? false));
        return { feature: feat, values: vals };
      });

      return { headers, rows, ourColumnIndex: 1 };
    }

    // Case B: Array of array rows: [["Feature", "Us", "Them"], ...]
    if (Array.isArray(input[0])) {
      const headers = (input[0] as unknown[]).map(String);
      const rows = input.slice(1).map((r) => (r as unknown[]).map(parseCellVal));
      return { headers, rows, ourColumnIndex: 1 };
    }

    // Case C: Array of strings (Markdown table rows or pipe/colon separated)
    if (typeof input[0] === "string") {
      const stringLines = (input as string[])
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !/^[\s|:-]+$/.test(l));

      const parsedGrid: string[][] = [];
      for (const line of stringLines) {
        if (line.includes("|")) {
          const cells = line
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((c) => c.trim());
          if (cells.length >= 2) parsedGrid.push(cells);
        } else if (line.includes(":")) {
          const colonIdx = line.indexOf(":");
          const feat = line.slice(0, colonIdx).trim();
          const rest = line.slice(colonIdx + 1).trim();
          if (rest.includes(" vs ")) {
            const [ourVal, compVal] = rest.split(" vs ").map((s) => s.trim());
            parsedGrid.push([feat, ourVal, compVal]);
          } else {
            parsedGrid.push([feat, rest, "Manual"]);
          }
        }
      }

      if (parsedGrid.length > 0) {
        const firstRowIsHeader =
          parsedGrid.length > 1 &&
          parsedGrid[0].some((c) => /feature|capability|metric|stack|tool|solution/i.test(c));

        const headers = firstRowIsHeader
          ? parsedGrid[0]
          : ["Capability", defaultOurName, "Legacy Way"];

        const dataRows = firstRowIsHeader ? parsedGrid.slice(1) : parsedGrid;
        const rows: ComparisonTableRow[] = dataRows.map((cells) => {
          const vals = cells.map(parseCellVal);
          return { feature: String(vals[0]), values: vals.slice(1) };
        });

        return { headers, rows, ourColumnIndex: 1 };
      }
    }
  }

  // Case D: Single multi-line string containing a Markdown table
  if (typeof input === "string" && input.includes("\n")) {
    return parseComparisonTableData(input.split("\n"), defaultOurName);
  }

  // Default fallback if empty
  return {
    headers: ["Capability", defaultOurName, "Traditional Tooling"],
    rows: [
      { feature: "Zero-Config Automation", values: [true, false] },
      { feature: "Strict Type Safety & Schemas", values: [true, false] },
      { feature: "High-Throughput Concurrent Engine", values: [true, false] },
      { feature: "Sub-Second Execution Loops", values: [true, false] },
      { feature: "Local Privacy-First Processing", values: [true, false] },
    ],
    ourColumnIndex: 1,
  };
}

export function renderComparisonTable(
  data: ComparisonTableData,
  options: ComparisonTableOptions = {},
): string {
  const ourName = options.ourName ?? "Our Stack";
  const ourColIdx = data.ourColumnIndex ?? 1;
  const headers = data.headers && data.headers.length > 0 ? data.headers : ["Feature", ourName, "Legacy"];
  const rows = data.rows && data.rows.length > 0 ? data.rows : [];

  function formatCellValue(val: unknown, isOurCol: boolean): string {
    if (val === true) {
      return `<span class="val-check ${isOurCol ? "our-check" : ""}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>`;
    }
    if (val === false) {
      return `<span class="val-cross"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>`;
    }
    if (typeof val === "string") {
      if (val.startsWith("✓") || val.startsWith("✔")) {
        const text = val.replace(/^[✓✔]\s*/, "");
        return `<span class="val-check ${isOurCol ? "our-check" : ""}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>${text ? ` <span class="val-label">${escapeHtml(text)}</span>` : ""}</span>`;
      }
      if (val.startsWith("✗") || val.startsWith("✘")) {
        const text = val.replace(/^[✗✘]\s*/, "");
        return `<span class="val-cross"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>${text ? ` <span class="val-label">${escapeHtml(text)}</span>` : ""}</span>`;
      }
    }
    const str = String(val ?? "—");
    if (/^(\+?[0-9]+[a-z%/\s]*|<[0-9]+.*|[0-9]+x.*)$/i.test(str.trim())) {
      return `<span class="val-metric ${isOurCol ? "our-metric" : ""}">${escapeHtml(str)}</span>`;
    }
    return `<span class="val-text">${escapeHtml(str)}</span>`;
  }

  const rowCount = rows.length;
  const densityClass = rowCount <= 4 ? "density-roomy" : rowCount <= 6 ? "density-normal" : "density-compact";

  const rowsHtml = rows
    .map((r, rIdx) => {
      let cellValues: Array<string | boolean | number> = [];
      let isHighlightRow = false;

      if (Array.isArray(r)) {
        cellValues = r;
      } else {
        cellValues = r.values ? [...r.values] : [];
        if (r.feature && cellValues.length === headers.length - 1) {
          cellValues = [r.feature, ...cellValues];
        } else if (cellValues.length === 0 && r.feature) {
          cellValues = [r.feature];
        }
        isHighlightRow = Boolean(r.highlight);
      }

      const rowTds = headers
        .map((_, colIdx) => {
          const val = cellValues[colIdx] ?? (colIdx === 0 ? "—" : false);
          const isOurCol = colIdx === ourColIdx;
          const isFirstCol = colIdx === 0;

          if (isFirstCol) {
            return `<td class="col-feature">${escapeHtml(String(val))}</td>`;
          }
          return `<td class="${isOurCol ? "col-our" : "col-comp"}">${formatCellValue(val, isOurCol)}</td>`;
        })
        .join("");

      return `<tr class="${isHighlightRow ? "highlight-row" : ""}" style="--row-idx: ${rIdx};">${rowTds}</tr>`;
    })
    .join("\n");

  return `
    <div class="swag-comparison-table ${densityClass}">
      ${options.title ? `<div class="swag-comparison-table-title" style="font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 16px;">${escapeHtml(options.title)}</div>` : ""}
      <table>
        <thead>
          <tr>
            ${headers
              .map((h, colIdx) => {
                const isOurCol = colIdx === ourColIdx;
                if (colIdx === 0) {
                  return `<th class="col-feature-head">${escapeHtml(h)}</th>`;
                }
                if (isOurCol) {
                  return `
                    <th class="col-our-head">
                      <div class="head-highlight-wrap">
                        <span class="head-title">${escapeHtml(h)}</span>
                        <span class="head-pill">OPTIMIZED</span>
                      </div>
                    </th>`;
                }
                return `<th class="col-comp-head">${escapeHtml(h)}</th>`;
              })
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <style>
        .swag-comparison-table {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          overflow: hidden;
          width: 100%;
          font-family: Inter, system-ui, sans-serif;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
        }
        .swag-comparison-table table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .swag-comparison-table th {
          background: #0f172a;
          color: #94a3b8;
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          letter-spacing: 0.04em;
        }
        .swag-comparison-table.density-roomy th { padding: 16px 20px; font-size: 14px; }
        .swag-comparison-table.density-normal th { padding: 13px 18px; font-size: 13px; }
        .swag-comparison-table.density-compact th { padding: 10px 14px; font-size: 12px; }

        .col-feature-head { width: 38%; }
        .col-our-head {
          background: rgba(99, 102, 241, 0.16) !important;
          border-left: 1px solid rgba(99, 102, 241, 0.35);
          border-right: 1px solid rgba(99, 102, 241, 0.35);
          text-align: center;
        }
        .head-highlight-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .head-title {
          color: #38bdf8;
          font-weight: 800;
        }
        .head-pill {
          font-size: 10px;
          font-weight: 800;
          background: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
        .col-comp-head { text-align: center; }

        .swag-comparison-table td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          color: #e2e8f0;
        }
        .swag-comparison-table.density-roomy td { padding: 15px 20px; font-size: 15px; }
        .swag-comparison-table.density-normal td { padding: 12px 18px; font-size: 14px; }
        .swag-comparison-table.density-compact td { padding: 9px 14px; font-size: 13px; }

        .col-feature {
          font-weight: 600;
          color: #f1f5f9;
        }
        .col-our {
          background: rgba(99, 102, 241, 0.08);
          border-left: 1px solid rgba(99, 102, 241, 0.2);
          border-right: 1px solid rgba(99, 102, 241, 0.2);
          text-align: center;
          font-weight: 700;
        }
        .col-comp {
          text-align: center;
          color: #94a3b8;
        }
        .val-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
        }
        .val-check.our-check {
          color: #38bdf8;
          filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5));
        }
        .val-cross {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          opacity: 0.75;
        }
        .val-metric {
          font-weight: 800;
          color: #f8fafc;
        }
        .val-metric.our-metric {
          color: #38bdf8;
        }
        .val-text {
          font-size: 13px;
        }
      </style>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// 6. Interactive Checklist Widget (with Tick Pop & Glow Animations)
// ---------------------------------------------------------------------------

export interface ChecklistItem {
  label: string;
  checked?: boolean;
  badge?: string;
  detail?: string;
  details?: string;
}

export interface ChecklistOptions {
  title?: string;
  animated?: boolean;
  columns?: 1 | 2;
}

export function parseChecklistItems(input: unknown): ChecklistItem[] {
  if (Array.isArray(input) && input.length > 0) {
    // If elements are objects
    if (typeof input[0] === "object" && input[0] !== null) {
      return input.map((it: any) => {
        const detail = it.detail ? String(it.detail) : it.details ? String(it.details) : it.desc ? String(it.desc) : undefined;
        return {
          label: String(it.label || it.title || it.text || "Item"),
          checked: it.checked !== false,
          badge: it.badge ? String(it.badge) : undefined,
          detail,
          details: detail,
        };
      });
    }

    // If elements are strings
    if (typeof input[0] === "string") {
      return (input as string[])
        .map((raw) => raw.trim())
        .filter((raw) => raw.length > 0)
        .map((str) => {
          let checked = true;
          let clean = str;

          // Markdown task list check: - [x] or - [ ]
          const taskMatch = clean.match(/^[-*]\s*\[([ xX])\]\s*(.*)$/);
          if (taskMatch) {
            checked = taskMatch[1].toLowerCase() === "x";
            clean = taskMatch[2].trim();
          } else if (clean.startsWith("✓") || clean.startsWith("✔")) {
            checked = true;
            clean = clean.replace(/^[✓✔]\s*/, "");
          } else if (clean.startsWith("✗") || clean.startsWith("✕")) {
            checked = false;
            clean = clean.replace(/^[✗✕]\s*/, "");
          }

          let badge: string | undefined;
          let detail: string | undefined;

          // Check for colon detail: Task: detail
          if (clean.includes(":")) {
            const colonIdx = clean.indexOf(":");
            detail = clean.slice(colonIdx + 1).trim();
            clean = clean.slice(0, colonIdx).trim();
          }

          // Check for bracket badge anywhere: Task [VERIFIED]
          const badgeMatch = clean.match(/\[([A-Z0-9_\-\s]{2,12})\]/i);
          if (badgeMatch) {
            badge = badgeMatch[1].toUpperCase().trim();
            clean = clean.replace(/\[([A-Z0-9_\-\s]{2,12})\]/i, "").trim();
          }

          return {
            label: clean,
            checked,
            badge: badge || (checked ? "VERIFIED" : undefined),
            detail,
            details: detail,
          };
        });
    }
  }

  // Single string with newlines
  if (typeof input === "string" && input.includes("\n")) {
    return parseChecklistItems(input.split("\n"));
  }

  // Default fallback items
  return [
    { label: "End-to-End Pipeline Execution", checked: true, badge: "VERIFIED", detail: "Deterministic execution without manual intervention" },
    { label: "Contract & Schema Validation", checked: true, badge: "STRICT", detail: "Strict runtime boundary and type checking" },
    { label: "Automated Multi-Platform Artifacts", checked: true, badge: "READY", detail: "Production deliverables compiled and verified" },
    { label: "Local Privacy-First Processing", checked: true, badge: "PASS", detail: "Zero cloud dependency and complete privacy guarantee" },
  ];
}

export function renderChecklist(
  items: ChecklistItem[],
  options: ChecklistOptions = {},
): string {
  const isTwoCol = options.columns === 2 || (options.columns === undefined && items.length > 5);

  const itemsHtml = items
    .map((item, idx) => {
      const isChecked = item.checked !== false;
      return `
        <div class="swag-checklist-item ${isChecked ? "checked" : "unchecked"}" style="--item-idx: ${idx};">
          <div class="tick-box ${isChecked ? "checked" : "unchecked"}">
            ${
              isChecked
                ? `<svg class="tick-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                     <path class="tick-path" d="M20 6L9 17l-5-5"></path>
                   </svg>`
                : `<span class="tick-cross-mark">✕</span>`
            }
          </div>
          <div class="item-body">
            <div class="item-header-row">
              <span class="item-label">${escapeHtml(item.label)}</span>
              ${item.badge ? `<span class="item-badge ${isChecked ? "badge-checked" : "badge-unchecked"}">${escapeHtml(item.badge)}</span>` : ""}
            </div>
            ${(item.details || item.detail) ? `<p class="item-detail">${escapeHtml(item.details || item.detail || "")}</p>` : ""}
          </div>
        </div>
      `;
    })
    .join("\n");

  return `
    <div class="swag-checklist-container ${isTwoCol ? "two-columns" : "single-column"}">
      ${itemsHtml}
      <style>
        .swag-checklist-container {
          display: grid;
          gap: 14px;
          width: 100%;
          font-family: Inter, system-ui, sans-serif;
        }
        .swag-checklist-container.single-column {
          grid-template-columns: 1fr;
        }
        .swag-checklist-container.two-columns {
          grid-template-columns: repeat(2, 1fr);
        }

        .swag-checklist-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 16px 20px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          animation: swag-card-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: calc(var(--item-idx, 0) * 0.1s);
        }
        .swag-checklist-item.checked {
          border-color: rgba(16, 185, 129, 0.3);
        }
        .swag-checklist-item.unchecked {
          border-color: rgba(239, 68, 68, 0.2);
          opacity: 0.65;
        }

        .tick-box {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tick-box.checked {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(56, 189, 248, 0.2));
          border: 2px solid #10b981;
          color: #10b981;
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
          animation: swag-tick-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, swag-tick-glow 3s infinite ease-in-out;
          animation-delay: calc(var(--item-idx, 0) * 0.12s);
        }
        .tick-box.unchecked {
          background: rgba(239, 68, 68, 0.12);
          border: 2px dashed #ef4444;
          color: #ef4444;
        }

        .tick-icon-svg {
          width: 20px;
          height: 20px;
        }
        .tick-path {
          stroke-dasharray: 24;
          stroke-dashoffset: 0;
          animation: swag-check-draw 0.45s ease forwards;
          animation-delay: calc(var(--item-idx, 0) * 0.12s + 0.1s);
        }
        .tick-cross-mark {
          font-size: 15px;
          font-weight: 700;
        }

        .item-body {
          flex: 1;
          min-width: 0;
        }
        .item-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .item-label {
          font-size: 16px;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1.3;
        }
        .item-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }
        .item-badge.badge-checked {
          background: rgba(16, 185, 129, 0.18);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .item-badge.badge-unchecked {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .item-detail {
          margin: 6px 0 0 0;
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.45;
        }

        @keyframes swag-card-pop {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes swag-tick-pop {
          0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
          70% { transform: scale(1.2) rotate(4deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes swag-tick-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.35); }
          50% { box-shadow: 0 0 24px rgba(16, 185, 129, 0.75), 0 0 35px rgba(56, 189, 248, 0.4); }
        }
        @keyframes swag-check-draw {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
      </style>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// 7. Dynamic Bullet Points Widget (Icons, Badges, Staggered Grid)
// ---------------------------------------------------------------------------

export interface BulletItem {
  title: string;
  desc?: string;
  description?: string;
  icon?: string;
  badge?: string;
}

export interface BulletPointsOptions {
  columns?: 1 | 2;
  showIcons?: boolean;
  showBadges?: boolean;
}

function resolveIconForBullet(title: string, desc?: string, explicitIcon?: string): string {
  if (explicitIcon) return explicitIcon;
  const text = `${title} ${desc ?? ""}`.toLowerCase();
  if (/speed|fast|perf|instant|latency|optimi/i.test(text)) return "zap";
  if (/secur|shield|guard|safe|auth|priva/i.test(text)) return "shield";
  if (/scale|modular|layer|pipeline|struct/i.test(text)) return "layers";
  if (/terminal|cli|command|exec|run/i.test(text)) return "terminal";
  if (/data|store|cache|db|sql|state/i.test(text)) return "database";
  if (/api|network|cloud|web|connect|http/i.test(text)) return "globe";
  if (/test|verif|valid|contract|type/i.test(text)) return "check-circle";
  if (/ai|llm|smart|reason|intel/i.test(text)) return "sparkles";
  if (/code|syntax|lang|compil/i.test(text)) return "code";
  if (/git|branch|commit|pr/i.test(text)) return "git-branch";
  return "cpu";
}

export function parseBulletItems(input: unknown): BulletItem[] {
  if (Array.isArray(input) && input.length > 0) {
    if (typeof input[0] === "object" && input[0] !== null) {
      return input.map((it: any, idx) => {
        const desc = it.desc ? String(it.desc) : it.description ? String(it.description) : undefined;
        return {
          title: String(it.title || it.name || it.label || `Point ${idx + 1}`),
          desc,
          description: desc,
          icon: it.icon ? String(it.icon) : undefined,
          badge: it.badge ? String(it.badge) : undefined,
        };
      });
    }

    if (typeof input[0] === "string") {
      return (input as string[])
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((raw, idx) => {
          let clean = raw.replace(/^[-*•]\s*/, "");
          let badge: string | undefined;
          let desc: string | undefined;

          // Numbered prefix: 01 Title: Desc
          const numMatch = clean.match(/^([0-9]{1,2})\s*[:.)-]\s*(.*)$/);
          if (numMatch) {
            badge = numMatch[1].padStart(2, "0");
            clean = numMatch[2].trim();
          }

          // Strip leading emoji symbol if present (e.g. ⚡, 🔒, 🚀)
          const emojiMatch = clean.match(/^([\p{Extended_Pictographic}\u2600-\u27BF])\s*(.*)$/u);
          if (emojiMatch) {
            clean = emojiMatch[2].trim();
          }

          if (clean.includes(":")) {
            const colonIdx = clean.indexOf(":");
            desc = clean.slice(colonIdx + 1).trim();
            clean = clean.slice(0, colonIdx).trim();
          }

          return {
            title: clean,
            desc,
            description: desc,
            badge: badge || String(idx + 1).padStart(2, "0"),
          };
        });
    }
  }

  if (typeof input === "string" && input.includes("\n")) {
    return parseBulletItems(input.split("\n"));
  }

  return [
    { title: "High-Throughput Processing", desc: "Engineered for real-time responsiveness and low latency loops", description: "Engineered for real-time responsiveness and low latency loops", badge: "01" },
    { title: "Strict Runtime Contracts", desc: "End-to-end type validation ensuring predictable system behavior", description: "End-to-end type validation ensuring predictable system behavior", badge: "02" },
    { title: "Modular Architecture", desc: "Decoupled components enabling pluggable extension and maintenance", description: "Decoupled components enabling pluggable extension and maintenance", badge: "03" },
    { title: "Zero-Config Execution", desc: "Production-ready sensible defaults working seamlessly out of the box", description: "Production-ready sensible defaults working seamlessly out of the box", badge: "04" },
  ];
}

export function renderBulletPoints(
  items: BulletItem[],
  options: BulletPointsOptions = {},
): string {
  const isTwoCol = options.columns === 2 || (options.columns === undefined && items.length > 4);

  const itemsHtml = items
    .map((item, idx) => {
      const descText = item.description || item.desc;
      const iconKey = resolveIconForBullet(item.title, descText, item.icon);
      const iconSvg = IconEngine.getSvg(iconKey, { size: 28, color: "var(--swag-primary, #6366f1)" });
      const badge = item.badge || String(idx + 1).padStart(2, "0");

      return `
        <div class="swag-bullet-card" style="--card-idx: ${idx};">
          <div class="bullet-icon-box">
            ${iconSvg}
          </div>
          <div class="bullet-content">
            <div class="bullet-header">
              <span class="bullet-badge">${escapeHtml(badge)}</span>
              <h3 class="bullet-title">${escapeHtml(item.title)}</h3>
            </div>
            ${descText ? `<p class="bullet-desc">${escapeHtml(descText)}</p>` : ""}
          </div>
        </div>
      `;
    })
    .join("\n");

  return `
    <div class="swag-bullets-grid ${isTwoCol ? "two-cols" : "single-col"}">
      ${itemsHtml}
      <style>
        .swag-bullets-grid {
          display: grid;
          gap: 16px;
          width: 100%;
          font-family: Inter, system-ui, sans-serif;
        }
        .swag-bullets-grid.single-col {
          grid-template-columns: 1fr;
        }
        .swag-bullets-grid.two-cols {
          grid-template-columns: repeat(2, 1fr);
        }

        .swag-bullet-card {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 18px 22px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          animation: swag-bullet-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: calc(var(--card-idx, 0) * 0.08s);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .swag-bullet-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .bullet-icon-box {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bullet-content {
          flex: 1;
          min-width: 0;
        }
        .bullet-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bullet-badge {
          font-size: 11px;
          font-weight: 800;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.15);
          padding: 2px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }
        .bullet-title {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1.3;
        }
        .bullet-desc {
          margin: 6px 0 0 0;
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.45;
        }

        @keyframes swag-bullet-in {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      </style>
    </div>
  `;
}

