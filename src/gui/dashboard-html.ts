/**
 * Complete Single Page Application dashboard frontend for SWAG.
 * High-density developer interface: pitch black canvas, crisp orange accents,
 * left-aligned vertical navigation, clean inline SVG icons, and interactive control suites.
 */

export function generateDashboardHtml(projectPath: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWAG &mdash; Developer Social Media Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #000000;
      --sidebar-bg: #080808;
      --panel-bg: #0d0d0d;
      --panel-border: #1a1a1a;
      --panel-border-hover: #2a2a2a;
      --fg: #ffffff;
      --fg-secondary: #e5e5e5;
      --muted: #737373;
      --muted-dark: #404040;
      --primary: #ff6600;
      --primary-hover: #ff5500;
      --primary-dim: rgba(255, 102, 0, 0.12);
      --success: #22c55e;
      --success-dim: rgba(34, 197, 94, 0.12);
      --danger: #ef4444;
      --danger-dim: rgba(239, 68, 68, 0.12);
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --radius: 4px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--font-sans);
      font-size: 13px;
      line-height: 1.5;
      height: 100vh;
      overflow: hidden;
      display: flex;
    }

    /* Layout: Fixed Left Sidebar + Main Content */
    #sidebar {
      width: 250px;
      min-width: 250px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--panel-border);
      display: flex;
      flex-direction: column;
      user-select: none;
      z-index: 50;
    }

    .brand-section {
      padding: 18px 20px;
      border-bottom: 1px solid var(--panel-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-title {
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.08em;
      color: var(--fg);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      padding: 2px 5px;
      border: 1px solid var(--primary);
      color: var(--primary);
      border-radius: 2px;
      letter-spacing: 0.05em;
    }

    .project-indicator {
      padding: 12px 20px;
      border-bottom: 1px solid var(--panel-border);
      background: #050505;
    }

    .project-indicator-label {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }

    .project-indicator-path {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--fg-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-list {
      flex: 1;
      padding: 14px 10px;
      overflow-y: auto;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      border-radius: var(--radius);
      color: var(--muted);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.1s ease, background-color 0.1s ease;
      border-left: 2px solid transparent;
    }

    .nav-item:hover {
      color: var(--fg);
      background-color: #121212;
    }

    .nav-item.active {
      color: var(--fg);
      background-color: #141414;
      border-left-color: var(--primary);
      font-weight: 600;
    }

    .nav-item svg {
      width: 15px;
      height: 15px;
      stroke-width: 1.75;
      stroke: currentColor;
      fill: none;
      flex-shrink: 0;
    }

    .nav-item.active svg {
      stroke: var(--primary);
    }

    .sidebar-footer {
      padding: 14px 20px;
      border-top: 1px solid var(--panel-border);
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background: var(--primary);
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
    }

    /* Main Content Area */
    #main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: var(--bg);
    }

    .top-bar {
      height: 52px;
      min-height: 52px;
      border-bottom: 1px solid var(--panel-border);
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg);
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted);
    }

    .breadcrumbs .active-crumb {
      color: var(--fg);
      font-weight: 600;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .content-body {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
    }

    .tab-pane {
      display: none;
    }

    .tab-pane.active {
      display: block;
    }

    /* Component primitives */
    .section-header {
      margin-bottom: 24px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      border-bottom: 1px solid var(--panel-border);
      padding-bottom: 16px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--fg);
      letter-spacing: -0.01em;
      margin-bottom: 4px;
    }

    .section-desc {
      font-size: 12px;
      color: var(--muted);
    }

    /* Button styles */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      border-radius: var(--radius);
      cursor: pointer;
      text-decoration: none;
      transition: background 0.1s, border-color 0.1s, color 0.1s;
      border: 1px solid var(--panel-border);
      background: #111111;
      color: var(--fg);
    }

    .btn:hover {
      background: #1a1a1a;
      border-color: #333333;
    }

    .btn-primary {
      background: var(--primary);
      border-color: var(--primary);
      color: #000000;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
      border-color: var(--primary-hover);
      color: #000000;
    }

    .btn-danger {
      background: transparent;
      border-color: #3a1515;
      color: var(--danger);
    }

    .btn-danger:hover {
      background: var(--danger-dim);
      border-color: var(--danger);
    }

    .btn svg {
      width: 13px;
      height: 13px;
      stroke-width: 2;
      stroke: currentColor;
      fill: none;
    }

    /* Form inputs */
    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      background: #0a0a0a;
      border: 1px solid var(--panel-border);
      border-radius: var(--radius);
      color: var(--fg);
      font-family: var(--font-mono);
      font-size: 12px;
      padding: 8px 12px;
      outline: none;
      transition: border-color 0.1s;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: var(--primary);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    /* Grids & Cards */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .panel {
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: var(--radius);
      padding: 18px 20px;
    }

    .panel-header {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Key Value table list */
    .kv-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .kv-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid #161616;
      font-size: 12px;
    }

    .kv-key {
      color: var(--muted);
      font-family: var(--font-mono);
    }

    .kv-val {
      color: var(--fg);
      font-family: var(--font-mono);
      font-weight: 500;
    }

    /* Badges */
    .tag {
      display: inline-flex;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 2px;
      background: #141414;
      border: 1px solid #242424;
      color: var(--fg-secondary);
    }

    .tag-orange {
      background: var(--primary-dim);
      border-color: rgba(255, 102, 0, 0.3);
      color: var(--primary);
    }

    .tag-green {
      background: var(--success-dim);
      border-color: rgba(34, 197, 94, 0.3);
      color: var(--success);
    }

    /* Asset Grid */
    .asset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .asset-box {
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: var(--radius);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .asset-media-wrap {
      width: 100%;
      height: 180px;
      background: #050505;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      cursor: pointer;
      position: relative;
    }

    .asset-media-wrap img, .asset-media-wrap video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .asset-meta-body {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-top: 1px solid var(--panel-border);
    }

    .asset-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--fg);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .asset-tags {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .asset-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
      padding-top: 8px;
      border-top: 1px solid #161616;
    }

    /* Outputs section */
    .output-item {
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: var(--radius);
      margin-bottom: 20px;
      padding: 20px;
    }

    .output-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .output-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .output-version {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
      color: var(--fg);
    }

    .video-player-box {
      width: 100%;
      background: #000;
      border: 1px solid var(--panel-border);
      border-radius: var(--radius);
      overflow: hidden;
      margin: 14px 0;
    }

    .video-player-box video {
      width: 100%;
      max-height: 480px;
      display: block;
      background: #000;
    }

    .chapters-timeline {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .chapter-btn {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 4px 8px;
      background: #141414;
      border: 1px solid #222222;
      color: var(--fg-secondary);
      border-radius: 2px;
      cursor: pointer;
    }

    .chapter-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Image preview in output */
    .output-img-preview {
      max-width: 100%;
      max-height: 400px;
      border: 1px solid var(--panel-border);
      border-radius: var(--radius);
      display: block;
      margin: 12px 0;
      cursor: pointer;
    }

    .file-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .file-chip {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 4px 10px;
      background: #121212;
      border: 1px solid #222222;
      color: var(--fg);
      border-radius: 2px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }

    .file-chip:hover {
      border-color: #444;
    }

    /* Modals / Lightbox */
    #modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    #modal-overlay.active {
      display: flex;
    }

    .modal-content {
      background: #0d0d0d;
      border: 1px solid #262626;
      border-radius: var(--radius);
      max-width: 900px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-head {
      padding: 14px 18px;
      border-bottom: 1px solid #202020;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    }

    .modal-body pre {
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
      color: #e5e5e5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .modal-media-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #000;
      max-height: 65vh;
      overflow: hidden;
    }

    .modal-media-wrap img, .modal-media-wrap video {
      max-width: 100%;
      max-height: 65vh;
      object-fit: contain;
    }

    /* Toast notification */
    #toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #141414;
      border: 1px solid var(--panel-border);
      border-left: 3px solid var(--primary);
      padding: 12px 18px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--fg);
      border-radius: var(--radius);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      z-index: 2000;
      display: none;
    }
  </style>
</head>
<body>

  <!-- Left Sidebar Navigation -->
  <aside id="sidebar">
    <div class="brand-section">
      <div class="brand-title">
        <span>SWAG</span>
        <span class="brand-badge">MCP</span>
      </div>
      <span style="font-family: var(--font-mono); font-size: 10px; color: var(--muted);">v0.1.0</span>
    </div>

    <div class="project-indicator">
      <div class="project-indicator-label">Active Project</div>
      <div class="project-indicator-path" id="sidebar-project-path">${escapeHtml(projectPath)}</div>
    </div>

    <ul class="nav-list">
      <li class="nav-item active" data-tab="overview">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
        Overview
      </li>
      <li class="nav-item" data-tab="capture">
        <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
        Capture Studio
      </li>
      <li class="nav-item" data-tab="assets">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        Asset Catalog
      </li>
      <li class="nav-item" data-tab="render">
        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Studio &amp; Render
      </li>
      <li class="nav-item" data-tab="theme">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 0 20v-20z"></path></svg>
        Theme &amp; Tokens
      </li>
      <li class="nav-item" data-tab="brand">
        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Brand Kit
      </li>
      <li class="nav-item" data-tab="outputs">
        <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Outputs &amp; Media
      </li>
    </ul>

    <div class="sidebar-footer">
      <div><span class="status-dot"></span>127.0.0.1:8420</div>
      <button class="btn" style="padding: 3px 8px; font-size: 10px;" onclick="rescanProject()">Re-Scan</button>
    </div>
  </aside>

  <!-- Main View Area -->
  <main id="main-content">
    <div class="top-bar">
      <div class="breadcrumbs">
        <span>SWAG</span>
        <span>/</span>
        <span class="active-crumb" id="active-breadcrumb">Overview</span>
      </div>
      <div class="top-actions">
        <button class="btn" onclick="exportReleaseBundle()">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export Release Bundle
        </button>
      </div>
    </div>

    <div class="content-body">

      <!-- 1. OVERVIEW TAB -->
      <section id="tab-overview" class="tab-pane active">
        <div class="section-header">
          <div>
            <h2 class="section-title">Project Overview</h2>
            <p class="section-desc">Codebase architecture, detected framework, and extracted routes.</p>
          </div>
          <button class="btn btn-primary" onclick="rescanProject()">
            <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Re-Analyze Project
          </button>
        </div>

        <div class="grid-2">
          <!-- Profile Card -->
          <div class="panel">
            <div class="panel-header">Repository Profile</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--fg); margin-bottom: 6px;" id="proj-name">Loading...</div>
            <div style="font-size: 12px; color: var(--muted); margin-bottom: 16px;" id="proj-desc">Inspecting repository...</div>

            <div class="kv-list">
              <div class="kv-row">
                <span class="kv-key">Framework</span>
                <span class="kv-val" id="proj-framework">-</span>
              </div>
              <div class="kv-row">
                <span class="kv-key">Port</span>
                <span class="kv-val" id="proj-port">-</span>
              </div>
              <div class="kv-row">
                <span class="kv-key">Start Script</span>
                <span class="kv-val" id="proj-cmd">-</span>
              </div>
            </div>

            <div style="margin-top: 16px;">
              <div class="form-label">Tech Stack</div>
              <div id="proj-stack" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
            </div>
          </div>

          <!-- Routes & Features -->
          <div class="panel">
            <div class="panel-header">Discovered Routes &amp; Features</div>
            <div class="form-label">Routes</div>
            <div id="proj-routes" style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px;"></div>

            <div class="form-label">Features Extracted</div>
            <div id="proj-features" style="display: flex; flex-direction: column; gap: 6px;"></div>
          </div>
        </div>
      </section>

      <!-- 2. CAPTURE STUDIO TAB -->
      <section id="tab-capture" class="tab-pane">
        <div class="section-header">
          <div>
            <h2 class="section-title">Playwright Capture Studio</h2>
            <p class="section-desc">Automated headless browser capture with privacy blurring and route exploration.</p>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel">
            <div class="panel-header">Run Capture Session</div>
            <form id="capture-form" onsubmit="executeCapture(event)">
              <div class="form-group">
                <label class="form-label">Target Route</label>
                <input type="text" id="cap-route" class="form-input" value="/" placeholder="/ or /dashboard" />
              </div>

              <div class="form-group">
                <label class="form-label">Color Scheme</label>
                <select id="cap-scheme" class="form-select">
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                  <option value="both">Both (Dark + Light)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Port</label>
                <input type="number" id="cap-port" class="form-input" value="3000" />
              </div>

              <div class="form-group" style="display: flex; gap: 20px; margin-top: 10px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--fg-secondary);">
                  <input type="checkbox" id="cap-fullpage" checked />
                  Full Page Screenshot
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--fg-secondary);">
                  <input type="checkbox" id="cap-video" />
                  Record Screen Video
                </label>
              </div>

              <button type="submit" class="btn btn-primary" id="btn-run-capture" style="margin-top: 16px;">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Launch Capture Pipeline
              </button>
            </form>
          </div>

          <div class="panel">
            <div class="panel-header">Capture Pipeline Logs</div>
            <div id="capture-status" style="font-family: var(--font-mono); font-size: 12px; color: var(--muted); min-height: 200px; white-space: pre-wrap; line-height: 1.6;">Ready to start capture.</div>
          </div>
        </div>
      </section>

      <!-- 3. ASSET CATALOG TAB -->
      <section id="tab-assets" class="tab-pane">
        <div class="section-header">
          <div>
            <h2 class="section-title">Asset Catalog</h2>
            <p class="section-desc">Screenshots and interaction recordings stored in .swag/assets/</p>
          </div>
          <span class="tag tag-orange" id="asset-count">0 Assets</span>
        </div>

        <div class="asset-grid" id="asset-grid">
          <!-- Dynamically populated -->
        </div>
      </section>

      <!-- 4. STUDIO & RENDER TAB -->
      <section id="tab-render" class="tab-pane">
        <div class="section-header">
          <div>
            <h2 class="section-title">Studio &amp; Renderer</h2>
            <p class="section-desc">Generate multi-platform visual assets and video productions directly from GUI.</p>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel">
            <div class="panel-header">Render Parameters</div>
            <form id="render-form" onsubmit="executeRender(event)">
              <div class="form-group">
                <label class="form-label">Target Platform</label>
                <select id="rend-platform" class="form-select">
                  <option value="thumbnail">YouTube Thumbnail (1280x720 PNG)</option>
                  <option value="twitter">X / Twitter Card (1200x675 PNG)</option>
                  <option value="linkedin">LinkedIn Showcase Card (4:5 PNG)</option>
                  <option value="github">GitHub Social Preview (1280x640 PNG)</option>
                  <option value="instagram-post">Instagram Post Carousel (1080x1350 PNG)</option>
                  <option value="instagram-reel">Instagram Reel Video (1080x1920 9:16 MP4 + TTS)</option>
                  <option value="youtube">YouTube Walkthrough Video (1920x1080 16:9 MP4 + Chapters)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Headline / Title</label>
                <input type="text" id="rend-title" class="form-input" placeholder="e.g. Modern Architecture Showcase" required />
              </div>

              <div class="form-group">
                <label class="form-label">Subtitle / Description</label>
                <input type="text" id="rend-subtitle" class="form-input" placeholder="e.g. Full-Stack Performance Breakdown" />
              </div>

              <div class="form-group">
                <label class="form-label">Badge Text</label>
                <input type="text" id="rend-badge" class="form-input" value="NEW RELEASE" />
              </div>

              <div class="form-group">
                <label class="form-label">Associate Asset (Screenshot/Mockup)</label>
                <select id="rend-asset" class="form-select">
                  <option value="">None (Use Pure Vector Template)</option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary" id="btn-render-action" style="margin-top: 14px;">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Render Media Asset
              </button>
            </form>
          </div>

          <div class="panel">
            <div class="panel-header">Render Output Status</div>
            <div id="render-status" style="font-family: var(--font-mono); font-size: 12px; color: var(--muted); min-height: 200px; white-space: pre-wrap; line-height: 1.6;">Select a platform and click Render Media Asset. Output will be saved to swag-output/ and accessible in the Outputs tab.</div>
          </div>
        </div>
      </section>

      <!-- 5. THEME & TOKENS TAB -->
      <section id="tab-theme" class="tab-pane">
        <div class="section-header">
          <div>
            <h2 class="section-title">Theme &amp; Design Tokens</h2>
            <p class="section-desc">Manage color palettes, typography, and test real-time WCAG AA contrast compliance.</p>
          </div>
          <button class="btn btn-primary" onclick="saveThemeSettings()">Save &amp; Apply Theme</button>
        </div>

        <div class="grid-2">
          <div class="panel">
            <div class="panel-header">Theme Presets &amp; Custom Colors</div>
            <div class="form-group">
              <label class="form-label">Preset Selector</label>
              <select id="theme-preset-select" class="form-select" onchange="onPresetChange(this.value)">
                <option value="obsidian-night">Obsidian Night (Dark)</option>
                <option value="dracula">Dracula</option>
                <option value="tokyo-night">Tokyo Night</option>
                <option value="nord">Nord</option>
                <option value="monokai">Monokai</option>
                <option value="solarized-dark">Solarized Dark</option>
                <option value="solarized-light">Solarized Light</option>
                <option value="alabaster-clean">Alabaster Clean (Light)</option>
                <option value="github-dark">GitHub Dark</option>
                <option value="catppuccin">Catppuccin Mocha</option>
                <option value="rose-pine">Rose Pine</option>
                <option value="cyberpunk">Cyberpunk</option>
              </select>
            </div>

            <div class="grid-2" style="margin-top: 16px;">
              <div class="form-group">
                <label class="form-label">Primary Color</label>
                <input type="color" id="tok-primary" class="form-input" style="height: 38px; padding: 2px;" value="#ff6600" oninput="updateContrastPreview()" />
              </div>
              <div class="form-group">
                <label class="form-label">Secondary Color</label>
                <input type="color" id="tok-secondary" class="form-input" style="height: 38px; padding: 2px;" value="#06b6d4" oninput="updateContrastPreview()" />
              </div>
              <div class="form-group">
                <label class="form-label">Background</label>
                <input type="color" id="tok-bg" class="form-input" style="height: 38px; padding: 2px;" value="#000000" oninput="updateContrastPreview()" />
              </div>
              <div class="form-group">
                <label class="form-label">Foreground</label>
                <input type="color" id="tok-fg" class="form-input" style="height: 38px; padding: 2px;" value="#ffffff" oninput="updateContrastPreview()" />
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">WCAG AA Contrast Ratios</div>
            <div id="contrast-box" style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      </section>

      <!-- 6. BRAND KIT TAB -->
      <section id="tab-brand" class="tab-pane">
        <div class="section-header">
          <div>
            <h2 class="section-title">Brand Identity Kit</h2>
            <p class="section-desc">Developer social handle, logo watermark, typography, and outro cards.</p>
          </div>
          <button class="btn btn-primary" onclick="saveBrandSettings()">Save Brand Kit</button>
        </div>

        <div class="panel" style="max-width: 720px;">
          <form id="brand-form" onsubmit="event.preventDefault(); saveBrandSettings();">
            <div class="form-group">
              <label class="form-label">Brand / Developer Name</label>
              <input type="text" id="brand-name" class="form-input" placeholder="e.g. DevStudio or Alex Rivers" />
            </div>

            <div class="form-group">
              <label class="form-label">Primary Developer Handle</label>
              <input type="text" id="brand-handle" class="form-input" placeholder="e.g. @developer" />
            </div>

            <div class="form-group">
              <label class="form-label">Default Call To Action</label>
              <input type="text" id="brand-cta" class="form-input" placeholder="e.g. Star on GitHub and explore the repo" />
            </div>

            <div class="form-group">
              <label class="form-label">Outro Tagline</label>
              <input type="text" id="brand-outro" class="form-input" placeholder="e.g. Open Source Developer Showcase" />
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 12px;">Update Brand Profile</button>
          </form>
        </div>
      </section>

      <!-- 7. OUTPUTS & MEDIA TAB -->
      <section id="tab-outputs" class="tab-pane">
        <div class="section-header">
          <div>
            <h2 class="section-title">Rendered Social Media Content</h2>
            <p class="section-desc">Versioned video files, subtitle tracks, social cards, and release manifests.</p>
          </div>
          <button class="btn" onclick="loadOutputs()">
            <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Refresh Outputs
          </button>
        </div>

        <div id="output-list">
          <!-- Dynamically populated -->
        </div>
      </section>

    </div>
  </main>

  <!-- Global Modal for Code / Lightbox Previews -->
  <div id="modal-overlay" onclick="closeModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-head">
        <span id="modal-title">Viewer</span>
        <button class="btn" style="padding: 2px 8px; font-size: 11px;" onclick="closeModalDirect()">Close</button>
      </div>
      <div class="modal-body" id="modal-body"></div>
    </div>
  </div>

  <!-- Toast -->
  <div id="toast"></div>

  <script>
    // Navigation routing
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        item.classList.add('active');
        const tabKey = item.getAttribute('data-tab');
        const targetPane = document.getElementById('tab-' + tabKey);
        if (targetPane) targetPane.classList.add('active');

        const activeCrumb = document.getElementById('active-breadcrumb');
        if (activeCrumb) activeCrumb.textContent = item.textContent.trim();
      });
    });

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3200);
    }

    function openModal(title, contentHtml) {
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-body').innerHTML = contentHtml;
      document.getElementById('modal-overlay').classList.add('active');
    }

    function closeModal(e) {
      if (e.target.id === 'modal-overlay') {
        document.getElementById('modal-overlay').classList.remove('active');
      }
    }

    function closeModalDirect() {
      document.getElementById('modal-overlay').classList.remove('active');
    }

    // 1. Load Project Profile
    async function loadProject() {
      try {
        const res = await fetch('/api/project');
        const data = await res.json();
        if (data && data.profile) {
          const p = data.profile;
          // Clean sanitized name
          const cleanName = (p.name || 'Repository').replace(/[\\p{Extended_Pictographic}\\uFE0F\\u200D]/gu, '').trim();
          document.getElementById('proj-name').textContent = cleanName;
          document.getElementById('proj-desc').textContent = (p.description || '').replace(/[\\p{Extended_Pictographic}\\uFE0F\\u200D]/gu, '').trim() || 'No description provided.';
          document.getElementById('proj-framework').textContent = p.framework || 'Node.js';
          document.getElementById('proj-port').textContent = p.port || 3000;
          document.getElementById('proj-cmd').textContent = p.runCommand || 'npm run dev';

          const capPort = document.getElementById('cap-port');
          if (capPort && p.port) capPort.value = p.port;

          const stackContainer = document.getElementById('proj-stack');
          if (p.techStack && p.techStack.length > 0) {
            stackContainer.innerHTML = p.techStack.map(t => {
              const label = typeof t === 'object' && t !== null ? (t.name || JSON.stringify(t)) : t;
              return '<span class="tag">' + escapeHtml(label) + '</span>';
            }).join('');
          } else {
            stackContainer.innerHTML = '<span style="color: var(--muted); font-size: 11px;">No dependencies detected.</span>';
          }

          const routesContainer = document.getElementById('proj-routes');
          if (p.routes && p.routes.length > 0) {
            routesContainer.innerHTML = p.routes.map(r => {
              const rPath = typeof r === 'object' && r !== null ? (r.path || '/') : r;
              return '<div class="kv-row"><span class="kv-key">' + escapeHtml(rPath) + '</span><span class="tag tag-green">Discovered</span></div>';
            }).join('');
          } else {
            routesContainer.innerHTML = '<div class="kv-row"><span class="kv-key">/</span><span class="tag tag-green">Default</span></div>';
          }

          const featuresContainer = document.getElementById('proj-features');
          if (p.features && p.features.length > 0) {
            featuresContainer.innerHTML = p.features.map(f => '<div style="color: var(--fg-secondary); font-size: 12px; margin-bottom: 4px;">&bull; ' + f.replace(/[\\p{Extended_Pictographic}\\uFE0F\\u200D]/gu, '').trim() + '</div>').join('');
          } else {
            featuresContainer.innerHTML = '<span style="color: var(--muted); font-size: 11px;">No features extracted from README.</span>';
          }
        }
      } catch (err) {
        console.error('Project load failed', err);
      }
    }

    async function rescanProject() {
      showToast('Re-analyzing repository...');
      await loadProject();
      showToast('Project profile updated.');
    }

    // 2. Load Assets
    async function loadAssets() {
      try {
        const res = await fetch('/api/assets');
        const data = await res.json();
        const grid = document.getElementById('asset-grid');
        const assetSelect = document.getElementById('rend-asset');
        const countTag = document.getElementById('asset-count');

        if (!data || !data.assets || data.assets.length === 0) {
          grid.innerHTML = '<div style="color: var(--muted); grid-column: 1/-1; padding: 30px 0; text-align: center; font-family: var(--font-mono);">No assets captured yet. Use the Capture Studio tab to capture screenshots.</div>';
          countTag.textContent = '0 Assets';
          return;
        }

        countTag.textContent = data.assets.length + ' Assets';

        // Update render select options
        assetSelect.innerHTML = '<option value="">None (Pure Vector Graphics)</option>' +
          data.assets.map(a => '<option value="' + a.id + '">' + (a.metadata?.description || a.id) + '</option>').join('');

        grid.innerHTML = data.assets.map(a => {
          const isVideo = a.type === 'recording' || a.type === 'video';
          // Clean file URL
          const filename = a.filePath.split('/').pop();
          const mediaUrl = '/assets/' + encodeURIComponent(filename);

          return \`
            <div class="asset-box" id="asset-card-\${a.id}">
              <div class="asset-media-wrap" onclick="viewAssetLightbox('\${mediaUrl}', \${isVideo})">
                \${isVideo
                  ? '<video src="' + mediaUrl + '" muted loop playsinline></video>'
                  : '<img src="' + mediaUrl + '" loading="lazy" alt="Asset Preview" onerror="this.src=\\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%2250%%22 x=%2250%%22 text-anchor=%22middle%22 fill=%22%23777%22 font-size=%2210%22>Preview Unavailable</text></svg>\\'" />'
                }
              </div>
              <div class="asset-meta-body">
                <div class="asset-title">\${a.metadata?.description || a.id}</div>
                <div class="asset-tags">
                  <span class="tag tag-orange">\${a.type}</span>
                  <span class="tag">\${a.metadata?.device || 'desktop'}</span>
                  <span class="tag">\${a.metadata?.colorScheme || 'dark'}</span>
                </div>
                <div class="asset-actions">
                  <button class="btn" style="padding: 2px 7px; font-size: 10px;" onclick="copyAssetId('\${a.id}')">Copy ID</button>
                  <button class="btn btn-danger" style="padding: 2px 7px; font-size: 10px;" onclick="deleteAsset('\${a.id}')">Delete</button>
                </div>
              </div>
            </div>
          \`;
        }).join('');
      } catch (err) {
        console.error('Failed to load assets', err);
      }
    }

    function viewAssetLightbox(url, isVideo) {
      if (isVideo) {
        openModal('Video Recording Preview', \`<div class="modal-media-wrap"><video src="\${url}" controls autoplay loop></video></div>\`);
      } else {
        openModal('Full-Resolution Screenshot Preview', \`<div class="modal-media-wrap"><img src="\${url}" /></div>\`);
      }
    }

    function copyAssetId(id) {
      navigator.clipboard.writeText(id);
      showToast('Asset ID copied to clipboard');
    }

    async function deleteAsset(id) {
      if (!confirm('Are you sure you want to delete this asset?')) return;
      try {
        const res = await fetch('/api/asset/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId: id })
        });
        const json = await res.json();
        if (json.success) {
          showToast('Asset deleted.');
          const card = document.getElementById('asset-card-' + id);
          if (card) card.remove();
        }
      } catch (err) {
        alert('Failed to delete asset: ' + err);
      }
    }

    // 3. Playwright Capture Execution
    async function executeCapture(e) {
      e.preventDefault();
      const route = document.getElementById('cap-route').value || '/';
      const scheme = document.getElementById('cap-scheme').value;
      const port = parseInt(document.getElementById('cap-port').value, 10) || 3000;
      const fullPage = document.getElementById('cap-fullpage').checked;
      const recordVideo = document.getElementById('cap-video').checked;

      const schemes = scheme === 'both' ? ['dark', 'light'] : [scheme];
      const statusBox = document.getElementById('capture-status');
      const btn = document.getElementById('btn-run-capture');

      btn.disabled = true;
      btn.textContent = 'Running Capture...';
      statusBox.textContent = 'Launching headless browser...\\nNavigating to ' + route + '...\\nApplying privacy filters...';

      try {
        const res = await fetch('/api/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routes: [route],
            colorSchemes: schemes,
            port,
            fullPage,
            recordVideo
          })
        });
        const data = await res.json();
        if (data.success) {
          statusBox.textContent = 'Capture completed successfully.\\nSaved ' + (data.assets?.length || 0) + ' assets.\\nPrivacy redactions: ' + (data.blurDetections?.length || 0);
          showToast('Capture complete!');
          await loadAssets();
        } else {
          statusBox.textContent = 'Capture error: ' + (data.error || 'Unknown error');
        }
      } catch (err) {
        statusBox.textContent = 'Capture failed: ' + err;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Launch Capture Pipeline';
      }
    }

    // 4. Studio Render Execution
    async function executeRender(e) {
      e.preventDefault();
      const platform = document.getElementById('rend-platform').value;
      const title = document.getElementById('rend-title').value;
      const subtitle = document.getElementById('rend-subtitle').value;
      const badgeText = document.getElementById('rend-badge').value;
      const assetId = document.getElementById('rend-asset').value || undefined;

      const statusBox = document.getElementById('render-status');
      const btn = document.getElementById('btn-render-action');

      btn.disabled = true;
      btn.textContent = 'Rendering Asset...';
      statusBox.textContent = 'Rendering ' + platform + ' asset...\\nProcessing vector graphics and safe-zone layouts...';

      try {
        const res = await fetch('/api/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform, title, subtitle, badgeText, assetId })
        });
        const data = await res.json();
        if (data.success) {
          statusBox.textContent = 'Render completed!\\nPlatform: ' + platform + '\\nFile saved in swag-output/' + platform + '/';
          showToast('Media rendered successfully.');
          await loadOutputs();
        } else {
          statusBox.textContent = 'Render error: ' + (data.error || 'Failed');
        }
      } catch (err) {
        statusBox.textContent = 'Render failed: ' + err;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Render Media Asset';
      }
    }

    // 5. Theme & Tokens
    async function loadTheme() {
      try {
        const res = await fetch('/api/theme');
        const data = await res.json();
        if (data && data.theme && data.theme.tokens) {
          const c = data.theme.tokens.colors;
          if (c.primary) document.getElementById('tok-primary').value = c.primary;
          if (c.secondary) document.getElementById('tok-secondary').value = c.secondary;
          if (c.background) document.getElementById('tok-bg').value = c.background;
          if (c.foreground) document.getElementById('tok-fg').value = c.foreground;
        }
        updateContrastPreview();
      } catch (err) {
        console.error('Failed to load theme', err);
      }
    }

    function calculateLuminance(hex) {
      const rgb = parseInt(hex.replace('#', ''), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function getContrastRatio(hex1, hex2) {
      const lum1 = calculateLuminance(hex1);
      const lum2 = calculateLuminance(hex2);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      return (brightest + 0.05) / (darkest + 0.05);
    }

    function updateContrastPreview() {
      const bg = document.getElementById('tok-bg').value;
      const fg = document.getElementById('tok-fg').value;
      const primary = document.getElementById('tok-primary').value;

      const ratioText = getContrastRatio(fg, bg).toFixed(1);
      const ratioPrimary = getContrastRatio(primary, bg).toFixed(1);

      const passText = ratioText >= 4.5;
      const passPrimary = ratioPrimary >= 3.0;

      const container = document.getElementById('contrast-box');
      container.innerHTML = \`
        <div class="kv-row">
          <span class="kv-key">Text (Foreground on Background)</span>
          <span class="tag \${passText ? 'tag-green' : 'tag-orange'}">\${ratioText}:1 &mdash; \${passText ? 'PASS (WCAG AA)' : 'LOW CONTRAST'}</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">UI Component (Primary on Background)</span>
          <span class="tag \${passPrimary ? 'tag-green' : 'tag-orange'}">\${ratioPrimary}:1 &mdash; \${passPrimary ? 'PASS (UI Component)' : 'LOW CONTRAST'}</span>
        </div>
      \`;
    }

    async function onPresetChange(presetName) {
      try {
        const res = await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preset: presetName })
        });
        const data = await res.json();
        if (data.success && data.theme) {
          const c = data.theme.tokens.colors;
          if (c.primary) document.getElementById('tok-primary').value = c.primary;
          if (c.secondary) document.getElementById('tok-secondary').value = c.secondary;
          if (c.background) document.getElementById('tok-bg').value = c.background;
          if (c.foreground) document.getElementById('tok-fg').value = c.foreground;
          updateContrastPreview();
          showToast('Applied ' + presetName + ' preset');
        }
      } catch (err) {
        alert('Failed to apply preset: ' + err);
      }
    }

    async function saveThemeSettings() {
      const primary = document.getElementById('tok-primary').value;
      const secondary = document.getElementById('tok-secondary').value;
      const background = document.getElementById('tok-bg').value;
      const foreground = document.getElementById('tok-fg').value;

      try {
        const res = await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: {
              tokens: {
                colors: { primary, secondary, background, foreground, cardBackground: '#0d0d0d' }
              }
            }
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Theme tokens saved to .swag/theme.json');
        }
      } catch (err) {
        alert('Failed to save theme: ' + err);
      }
    }

    // 6. Brand Kit
    async function loadBrand() {
      try {
        const res = await fetch('/api/brand');
        const data = await res.json();
        if (data && data.brandKit) {
          const b = data.brandKit;
          document.getElementById('brand-name').value = b.brandName || '';
          document.getElementById('brand-handle').value = b.handle || (b.socials?.[0]?.handle || '');
          document.getElementById('brand-cta').value = b.defaultCTA || '';
          document.getElementById('brand-outro').value = b.outroTagline || '';
        }
      } catch (err) {
        console.error('Failed to load brand', err);
      }
    }

    async function saveBrandSettings() {
      const brandName = document.getElementById('brand-name').value;
      const handle = document.getElementById('brand-handle').value;
      const defaultCTA = document.getElementById('brand-cta').value;
      const outroTagline = document.getElementById('brand-outro').value;

      try {
        const res = await fetch('/api/brand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandKit: { brandName, handle, defaultCTA, outroTagline }
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Brand kit saved.');
        }
      } catch (err) {
        alert('Failed to save brand kit: ' + err);
      }
    }

    // 7. Load Outputs
    async function loadOutputs() {
      try {
        const res = await fetch('/api/outputs');
        const data = await res.json();
        const container = document.getElementById('output-list');

        if (!data || !data.outputs || data.outputs.length === 0) {
          container.innerHTML = '<div style="color: var(--muted); text-align: center; padding: 40px 0; font-family: var(--font-mono);">No rendered media outputs yet. Use the Studio &amp; Render tab or MCP tools to render content.</div>';
          return;
        }

        container.innerHTML = data.outputs.map(out => {
          const dateStr = new Date(out.createdAt).toLocaleDateString();
          let videoPlayerHtml = '';
          let imagePreviewHtml = '';
          let chaptersHtml = '';

          // Look for video
          const videoPath = out.paths.find(p => p.endsWith('.mp4') || p.endsWith('.webm'));
          if (videoPath) {
            const relVideo = videoPath.split('/swag-output/').pop();
            const videoUrl = '/outputs/' + relVideo;
            const videoElemId = 'player-' + out.platform + '-v' + out.version;

            // Check if chapters exist in metadata
            if (out.metadata && out.metadata.chapters && out.metadata.chapters.length > 0) {
              const buttons = out.metadata.chapters.map(ch => \`
                <button class="chapter-btn" onclick="seekVideo('\${videoElemId}', \${ch.seconds})">
                  \${ch.startTime} &mdash; \${ch.title}
                </button>
              \`).join('');
              chaptersHtml = \`<div class="chapters-timeline"><div class="form-label" style="width: 100%; margin-bottom: 2px;">Chapters (Click to jump):</div>\${buttons}</div>\`;
            }

            videoPlayerHtml = \`
              <div class="video-player-box">
                <video id="\${videoElemId}" src="\${videoUrl}" controls preload="metadata"></video>
              </div>
              \${chaptersHtml}
            \`;
          }

          // Look for images (thumbnails or slides)
          const imgPath = out.paths.find(p => p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.webp'));
          if (imgPath && !videoPath) {
            const relImg = imgPath.split('/swag-output/').pop();
            const imgUrl = '/outputs/' + relImg;
            imagePreviewHtml = \`
              <img src="\${imgUrl}" class="output-img-preview" alt="Generated Output" onclick="viewAssetLightbox('\${imgUrl}', false)" />
            \`;
          }

          // File action chips
          const fileChips = out.paths.map(p => {
            const fname = p.split('/').pop();
            const relFile = p.split('/swag-output/').pop();
            const fileUrl = '/outputs/' + relFile;

            if (fname.endsWith('.md') || fname.endsWith('.srt') || fname.endsWith('.json')) {
              return \`<button class="file-chip" onclick="viewTextFile('\${p}', '\${fname}')">\${fname}</button>\`;
            }
            return \`<a href="\${fileUrl}" download class="file-chip">\${fname} &darr;</a>\`;
          }).join('');

          return \`
            <div class="output-item">
              <div class="output-header-bar">
                <div class="output-title-group">
                  <span class="tag tag-orange">\${out.platform}</span>
                  <span class="output-version">Version v\${out.version}</span>
                </div>
                <span style="font-family: var(--font-mono); font-size: 11px; color: var(--muted);">\${dateStr}</span>
              </div>

              \${out.metadata?.title ? '<div style="font-size: 14px; font-weight: 600; color: var(--fg); margin-bottom: 4px;">' + out.metadata.title + '</div>' : ''}
              \${out.metadata?.description ? '<div style="font-size: 12px; color: var(--muted); margin-bottom: 12px; max-width: 800px; white-space: pre-wrap;">' + out.metadata.description + '</div>' : ''}

              \${videoPlayerHtml}
              \${imagePreviewHtml}

              <div class="file-chip-row">
                \${fileChips}
              </div>
            </div>
          \`;
        }).join('');
      } catch (err) {
        console.error('Failed to load outputs', err);
      }
    }

    function seekVideo(playerId, seconds) {
      const vid = document.getElementById(playerId);
      if (vid) {
        vid.currentTime = seconds;
        vid.play();
      }
    }

    async function viewTextFile(fullPath, filename) {
      try {
        const res = await fetch('/api/file-content?path=' + encodeURIComponent(fullPath));
        const data = await res.json();
        if (data.success) {
          openModal(filename, \`
            <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
              <button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('text-preview-block').innerText); showToast('Copied to clipboard');">Copy Text</button>
            </div>
            <pre id="text-preview-block">\${escapeHtml(data.content)}</pre>
          \`);
        } else {
          alert('Could not read file: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Failed to load text file: ' + err);
      }
    }

    async function exportReleaseBundle() {
      try {
        showToast('Compiling release bundle...');
        const res = await fetch('/api/export', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast('Bundle manifest generated: release-manifest.json');
          alert('Release bundle indexed successfully!\\nTotal assets: ' + (data.bundleManifest?.totalAssets || 0) + '\\nManifest: ' + data.manifestPath);
        }
      } catch (err) {
        alert('Export failed: ' + err);
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Initial boot
    loadProject();
    loadAssets();
    loadTheme();
    loadBrand();
    loadOutputs();
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
