/**
 * Complete Single Page Application dashboard frontend for SWAG.
 * Built with rich aesthetics, glassmorphism, dark mode, and interactive tabs.
 */

import { IconEngine } from "../core/icons/index.js";

export function generateDashboardHtml(projectPath: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWAG — Developer Social Media Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(15, 23, 42, 0.7);
      --card-border: rgba(51, 65, 85, 0.6);
      --fg: #f8fafc;
      --muted: #94a3b8;
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.35);
      --secondary: #06b6d4;
      --success: #10b981;
      --accent: #ec4899;
      --radius: 16px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--fg);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      position: relative;
    }

    /* Ambient atmospheric background glows */
    body::before {
      content: "";
      position: fixed;
      top: -20%;
      right: -10%;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
      opacity: 0.15;
      filter: blur(100px);
      pointer-events: none;
      z-index: 0;
    }

    body::after {
      content: "";
      position: fixed;
      bottom: -20%;
      left: -10%;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--secondary) 0%, transparent 70%);
      opacity: 0.12;
      filter: blur(100px);
      pointer-events: none;
      z-index: 0;
    }

    /* Top Navigation Bar */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(20px);
      background: rgba(9, 13, 22, 0.85);
      border-bottom: 1px solid var(--card-border);
      padding: 18px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 14px;
      font-weight: 800;
      font-size: 22px;
      letter-spacing: -0.03em;
    }

    .brand-icon {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      box-shadow: 0 4px 16px var(--primary-glow);
    }

    .project-chip {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--card-border);
      padding: 6px 14px;
      border-radius: 20px;
      color: var(--muted);
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Tab Navigation */
    .nav-tabs {
      display: flex;
      gap: 8px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      padding: 4px;
      border-radius: 12px;
    }

    .nav-tab {
      background: transparent;
      border: none;
      color: var(--muted);
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .nav-tab:hover {
      color: var(--fg);
    }

    .nav-tab.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 2px 10px var(--primary-glow);
    }

    /* Main Container */
    main {
      flex: 1;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 40px;
      position: relative;
      z-index: 10;
    }

    .tab-content {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Glassmorphic Cards */
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      margin-bottom: 24px;
    }

    .card-title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .card-desc {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 24px;
    }

    /* Grid Layouts */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    /* Badges & Chips */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .badge-green {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    /* Tech Stack Pills */
    .tech-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
    }

    .tech-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
    }

    /* Feature List */
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      margin-bottom: 10px;
      font-size: 14px;
    }

    /* Asset Gallery */
    .asset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .asset-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s, border-color 0.2s;
    }

    .asset-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
    }

    .asset-preview {
      width: 100%;
      height: 180px;
      background: #020617;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .asset-preview img, .asset-preview video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .asset-info {
      padding: 16px;
    }

    .asset-desc {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .asset-meta {
      font-size: 12px;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
    }

    /* Color Token Box */
    .token-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .token-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--card-border);
      padding: 10px 14px;
      border-radius: 10px;
    }

    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .token-label {
      font-size: 12px;
      color: var(--muted);
    }

    .token-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
    }

    /* Style Presets Gallery */
    .preset-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .preset-card:hover {
      border-color: var(--primary);
      box-shadow: 0 8px 24px var(--primary-glow);
    }

    .preset-name {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--fg);
    }

    .preset-voice {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.4;
      margin-bottom: 16px;
    }

    /* Output Item */
    .output-item {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .output-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .output-title {
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .output-files {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 14px;
    }

    .output-file-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      padding: 8px 16px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--secondary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .output-file-chip:hover {
      background: rgba(6, 182, 212, 0.15);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--muted);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand-logo">
      <div class="brand-icon" style="display:flex;align-items:center;justify-content:center;">${IconEngine.getSvg("zap", { size: 22, color: "#f8fafc" })}</div>
      <span>SWAG</span>
      <span class="project-chip">${escapeHtml(projectPath)}</span>
    </div>

    <nav class="nav-tabs">
      <button class="nav-tab active" onclick="switchTab('overview')">Overview</button>
      <button class="nav-tab" onclick="switchTab('assets')">Asset Gallery</button>
      <button class="nav-tab" onclick="switchTab('theme')">Theme & Styling</button>
      <button class="nav-tab" onclick="switchTab('brand')">Brand Kit</button>
      <button class="nav-tab" onclick="switchTab('outputs')">Outputs</button>
    </nav>
  </header>

  <main>
    <!-- 1. OVERVIEW TAB -->
    <section id="tab-overview" class="tab-content active">
      <div class="grid-2">
        <div class="card">
          <div class="card-title">Project Profile</div>
          <div class="card-desc">Detected web framework, features, and configuration.</div>
          <div id="project-loading" class="empty-state">Loading project details...</div>
          <div id="project-details" style="display: none;">
            <h2 id="proj-name" style="font-size: 28px; margin-bottom: 8px;"></h2>
            <p id="proj-desc" style="color: var(--muted); margin-bottom: 20px; line-height: 1.5;"></p>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
              <span id="proj-port" class="badge"></span>
              <span id="proj-cmd" class="badge badge-green"></span>
            </div>
            <h4 style="font-size: 14px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px;">Tech Stack</h4>
            <div id="tech-list" class="tech-list"></div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Extracted Features & Routes</div>
          <div class="card-desc">Capabilities extracted from README and route discovery.</div>
          <div id="feature-list"></div>
        </div>
      </div>
    </section>

    <!-- 2. ASSETS TAB -->
    <section id="tab-assets" class="tab-content">
      <div class="card">
        <div class="card-title">Captured Asset Catalog</div>
        <div class="card-desc">Screenshots and interaction recordings stored in .swag/assets/</div>
        <div id="asset-container" class="asset-grid">
          <div class="empty-state">
            <div class="empty-icon" style="display:flex;align-items:center;justify-content:center;margin-bottom:16px;">${IconEngine.getSvg("camera", { size: 48, color: "var(--muted)" })}</div>
            <p>No captured assets yet. Run the <code>capture_project</code> tool to automatically take screenshots and screen recordings!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. THEME & STYLING TAB -->
    <section id="tab-theme" class="tab-content">
      <div class="card">
        <div class="card-title">Active Design Tokens</div>
        <div class="card-desc">CSS variables and WCAG AA contrast status applied to slide cards.</div>
        <div id="contrast-banner" style="margin-bottom: 20px;"></div>
        <div id="token-container" class="token-grid"></div>
      </div>

      <div class="card">
        <div class="card-title">Content Style Presets</div>
        <div class="card-desc">Tone, voice, and vocabulary guidance available for social copy.</div>
        <div id="preset-container" class="grid-3"></div>
      </div>
    </section>

    <!-- 4. BRAND KIT TAB -->
    <section id="tab-brand" class="tab-content">
      <div class="card">
        <div class="card-title">Brand Identity & Social Handles</div>
        <div class="card-desc">Configured brand name, call-to-action, and outro overlay settings.</div>
        <div id="brand-details">
          <div class="empty-state">Loading brand kit...</div>
        </div>
      </div>
    </section>

    <!-- 5. OUTPUTS TAB -->
    <section id="tab-outputs" class="tab-content">
      <div class="card">
        <div class="card-title">Rendered Social Media Content</div>
        <div class="card-desc">Versioned Instagram carousels, Reels MP4s, YouTube videos, and subtitles.</div>
        <div id="output-container">
          <div class="empty-state">
            <div class="empty-icon">🎬</div>
            <p>No rendered outputs yet. Use <code>render_instagram_post</code>, <code>render_instagram_reel</code>, or <code>render_youtube_video</code> to produce content.</p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <script>
    function switchTab(tabId) {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('.nav-tab')).find(b => b.textContent.toLowerCase().includes(tabId));
      if (activeBtn) activeBtn.classList.add('active');
      const target = document.getElementById('tab-' + tabId);
      if (target) target.classList.add('active');
    }

    async function loadData() {
      // 1. Project Profile
      try {
        const res = await fetch('/api/project');
        const data = await res.json();
        if (data && data.profile) {
          const p = data.profile;
          document.getElementById('project-loading').style.display = 'none';
          document.getElementById('project-details').style.display = 'block';
          document.getElementById('proj-name').textContent = p.name;
          document.getElementById('proj-desc').textContent = p.description || 'Web Application';
          document.getElementById('proj-port').textContent = 'Port ' + p.port;
          document.getElementById('proj-cmd').textContent = p.runCommand;

          const techList = document.getElementById('tech-list');
          techList.innerHTML = p.techStack.map(t => '<span class="tech-pill">' + t.name + '</span>').join('');

          const featList = document.getElementById('feature-list');
          const checkIcon = '${IconEngine.getSvg("checkmark", { size: 16, color: "var(--success)" })}';
          featList.innerHTML = p.features.map(f =>
            '<div class="feature-item"><span style="display:inline-flex;align-items:center;color: var(--success);">' + checkIcon + '</span> ' + f.name + '</div>'
          ).join('') || '<div class="empty-state">No features extracted from README.</div>';
        }
      } catch (err) {
        console.error('Failed to load project', err);
      }

      // 2. Assets
      try {
        const res = await fetch('/api/assets');
        const data = await res.json();
        if (data && data.assets && data.assets.length > 0) {
          const container = document.getElementById('asset-container');
          container.innerHTML = data.assets.map(a => {
            const isVideo = a.type === 'recording' || a.type === 'video';
            const mediaUrl = '/' + a.filePath.replace(/^\.swag\\//, 'assets/');
            return \`
              <div class="asset-card">
                <div class="asset-preview">
                  \${isVideo ? '<video src="' + mediaUrl + '" muted autoplay loop playsinline></video>' : '<img src="' + mediaUrl + '" alt="Asset" />'}
                </div>
                <div class="asset-info">
                  <div class="asset-desc">\${a.metadata.description || a.type}</div>
                  <div class="asset-meta">
                    <span class="badge">\${a.type}</span>
                    <span>\${a.metadata.device || 'desktop'}</span>
                  </div>
                </div>
              </div>
            \`;
          }).join('');
        }
      } catch (err) {
        console.error('Failed to load assets', err);
      }

      // 3. Theme & Presets
      try {
        const res = await fetch('/api/theme');
        const data = await res.json();
        if (data && data.theme) {
          const colors = data.theme.tokens.colors;
          const container = document.getElementById('token-container');
          container.innerHTML = Object.entries(colors).map(([k, v]) => \`
            <div class="token-item">
              <div class="color-swatch" style="background-color: \${v};"></div>
              <div>
                <div class="token-label">\${k}</div>
                <div class="token-value">\${v}</div>
              </div>
            </div>
          \`).join('');

          const banner = document.getElementById('contrast-banner');
          if (data.contrastWarnings && data.contrastWarnings.length > 0) {
            banner.innerHTML = '<div class="badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.3); padding: 10px 16px; width: 100%;">⚠️ ' + data.contrastWarnings.join(' • ') + '</div>';
          } else {
            banner.innerHTML = '<div class="badge badge-green" style="padding: 10px 16px; width: 100%;">✓ All colors pass WCAG AA contrast standards (≥ 4.5:1)</div>';
          }
        }

        const presRes = await fetch('/api/styles');
        const presData = await presRes.json();
        if (presData && presData.presets) {
          document.getElementById('preset-container').innerHTML = presData.presets.map(p => \`
            <div class="preset-card">
              <div class="preset-name">\${p.name}</div>
              <div class="preset-voice">\${p.tone.voice}</div>
              <div style="font-size: 12px; color: var(--secondary);">\${p.tone.vocabulary}</div>
            </div>
          \`).join('');
        }
      } catch (err) {
        console.error('Failed to load theme', err);
      }

      // 4. Brand Kit
      try {
        const res = await fetch('/api/brand');
        const data = await res.json();
        if (data && data.brandKit) {
          const b = data.brandKit;
          document.getElementById('brand-details').innerHTML = \`
            <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">\${b.brandName || 'Developer Brand'}</div>
            <p style="color: var(--muted); margin-bottom: 20px;">\${b.defaultCTA}</p>
            <h4 style="font-size: 14px; text-transform: uppercase; color: var(--muted); margin-bottom: 12px;">Connected Handles</h4>
            <div style="display: flex; gap: 12px;">
              \${b.socials.map(s => '<span class="badge">' + s.platform + ': ' + s.handle + '</span>').join('')}
            </div>
          \`;
        }
      } catch (err) {
        console.error('Failed to load brand', err);
      }

      // 5. Outputs
      try {
        const res = await fetch('/api/outputs');
        const data = await res.json();
        if (data && data.outputs && data.outputs.length > 0) {
          document.getElementById('output-container').innerHTML = data.outputs.map(out => {
            const files = out.paths.map(p => {
              const fname = p.split('/').pop();
              return '<span class="output-file-chip">📄 ' + fname + '</span>';
            }).join('');
            return \`
              <div class="output-item">
                <div class="output-header">
                  <div class="output-title">
                    <span class="badge badge-green">\${out.platform}</span>
                    <span>Version v\${out.version}</span>
                  </div>
                  <span style="font-size: 12px; color: var(--muted);">\${new Date(out.createdAt).toLocaleDateString()}</span>
                </div>
                <div style="color: var(--muted); font-size: 14px;">\${out.metadata?.caption || out.metadata?.title || ''}</div>
                <div class="output-files">\${files}</div>
              </div>
            \`;
          }).join('');
        }
      } catch (err) {
        console.error('Failed to load outputs', err);
      }
    }

    loadData();
  </script>
</body>
</html>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
