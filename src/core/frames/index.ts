/**
 * Device Frame HTML/CSS Rendering Engine.
 * Provides realistic hardware mockups (MacBook, iPhone, iPad, Multi-Device)
 * with bezels, camera notches, Dynamic Island, and glass reflections.
 */

export interface FrameOptions {
  width?: number | string;
  height?: number | string;
  shadow?: boolean;
  reflection?: boolean;
  titleBar?: boolean;
  urlBar?: string;
}

export interface MultiDeviceOptions {
  laptopContent: string;
  phoneContent: string;
  laptopUrl?: string;
  phoneUrl?: string;
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
 * 1. MacBook Laptop Frame
 */
export function renderMacBookFrame(
  contentHtml: string,
  options: FrameOptions = {},
): string {
  const shadow = options.shadow ?? true;
  const urlBar = options.urlBar ? escapeHtml(options.urlBar) : "";

  return `
    <div class="swag-frame-macbook-wrap ${shadow ? "has-shadow" : ""}">
      <div class="macbook-screen-lid">
        <div class="macbook-camera-notch">
          <span class="camera-lens"></span>
        </div>
        ${
          urlBar
            ? `
          <div class="macbook-browser-bar">
            <div class="macbook-window-dots">
              <span class="dot close"></span>
              <span class="dot min"></span>
              <span class="dot zoom"></span>
            </div>
            <div class="macbook-url-field">${urlBar}</div>
          </div>
        `
            : ""
        }
        <div class="macbook-viewport">
          ${contentHtml}
        </div>
      </div>
      <div class="macbook-base">
        <div class="macbook-notch-indent"></div>
      </div>
      <div class="macbook-bottom-shadow"></div>
      <style>
        .swag-frame-macbook-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }
        .swag-frame-macbook-wrap.has-shadow {
          filter: drop-shadow(0 25px 40px rgba(0, 0, 0, 0.45));
        }
        .macbook-screen-lid {
          position: relative;
          width: 88%;
          background: #0d1117;
          border-radius: 14px 14px 0 0;
          border: 8px solid #2d3748;
          border-bottom: 2px solid #1a202c;
          overflow: hidden;
        }
        .macbook-camera-notch {
          height: 14px;
          background: #2d3748;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .camera-lens {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #0ea5e9;
          box-shadow: 0 0 3px rgba(14, 165, 233, 0.8);
        }
        .macbook-browser-bar {
          display: flex;
          align-items: center;
          background: #1e293b;
          padding: 6px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          gap: 12px;
        }
        .macbook-window-dots {
          display: flex;
          gap: 6px;
        }
        .macbook-window-dots .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }
        .macbook-window-dots .close { background: #ef4444; }
        .macbook-window-dots .min { background: #f59e0b; }
        .macbook-window-dots .zoom { background: #10b981; }
        .macbook-url-field {
          flex: 1;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          font-family: JetBrains Mono, monospace;
          font-size: 11px;
          color: #94a3b8;
          padding: 2px 8px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .macbook-viewport {
          position: relative;
          width: 100%;
          min-height: 380px;
          background: #020617;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .macbook-viewport img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .macbook-base {
          position: relative;
          width: 100%;
          height: 14px;
          background: linear-gradient(180deg, #4b5563 0%, #374151 70%, #1f2937 100%);
          border-radius: 0 0 10px 10px;
          display: flex;
          justify-content: center;
        }
        .macbook-notch-indent {
          width: 120px;
          height: 5px;
          background: #111827;
          border-radius: 0 0 6px 6px;
        }
      </style>
    </div>
  `;
}

/**
 * 2. iPhone Mobile Frame
 */
export function renderIPhoneFrame(
  contentHtml: string,
  options: FrameOptions = {},
): string {
  const shadow = options.shadow ?? true;

  return `
    <div class="swag-frame-iphone-wrap ${shadow ? "has-shadow" : ""}">
      <div class="iphone-body">
        <div class="iphone-island-row">
          <div class="iphone-island">
            <span class="island-camera"></span>
            <span class="island-sensor"></span>
          </div>
        </div>
        <div class="iphone-screen">
          ${contentHtml}
        </div>
        <div class="iphone-home-indicator"></div>
      </div>
      <style>
        .swag-frame-iphone-wrap {
          display: inline-flex;
          justify-content: center;
          width: 320px;
          margin: 0 auto;
        }
        .swag-frame-iphone-wrap.has-shadow {
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5));
        }
        .iphone-body {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 19.5;
          background: #020617;
          border-radius: 46px;
          border: 10px solid #1f2937;
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .iphone-island-row {
          position: absolute;
          top: 10px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 20;
          pointer-events: none;
        }
        .iphone-island {
          width: 90px;
          height: 24px;
          background: #000;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 14px;
          gap: 6px;
        }
        .island-camera {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0ea5e9;
          opacity: 0.8;
        }
        .island-sensor {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1e293b;
        }
        .iphone-screen {
          width: 100%;
          height: 100%;
          background: #020617;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .iphone-screen img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .iphone-home-indicator {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 110px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 2px;
          z-index: 20;
        }
      </style>
    </div>
  `;
}

/**
 * 3. iPad Tablet Frame
 */
export function renderIPadFrame(
  contentHtml: string,
  options: FrameOptions = {},
): string {
  const shadow = options.shadow ?? true;

  return `
    <div class="swag-frame-ipad-wrap ${shadow ? "has-shadow" : ""}">
      <div class="ipad-body">
        <div class="ipad-camera-dot"></div>
        <div class="ipad-screen">
          ${contentHtml}
        </div>
      </div>
      <style>
        .swag-frame-ipad-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
        }
        .swag-frame-ipad-wrap.has-shadow {
          filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.45));
        }
        .ipad-body {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #020617;
          border-radius: 28px;
          border: 14px solid #1f2937;
          overflow: hidden;
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.08);
        }
        .ipad-camera-dot {
          position: absolute;
          top: 50%;
          left: -10px;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0ea5e9;
          z-index: 20;
        }
        .ipad-screen {
          width: 100%;
          height: 100%;
          background: #020617;
          overflow: hidden;
        }
        .ipad-screen img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      </style>
    </div>
  `;
}

/**
 * 4. Multi-Device Composition (Desktop + Mobile overlay)
 */
export function renderMultiDeviceFrame(options: MultiDeviceOptions): string {
  const laptopHtml = renderMacBookFrame(options.laptopContent, {
    urlBar: options.laptopUrl,
    shadow: true,
  });
  const phoneHtml = renderIPhoneFrame(options.phoneContent, {
    shadow: true,
  });

  return `
    <div class="swag-multi-device-stage">
      <div class="stage-laptop">
        ${laptopHtml}
      </div>
      <div class="stage-phone">
        ${phoneHtml}
      </div>
      <style>
        .swag-multi-device-stage {
          position: relative;
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .stage-laptop {
          width: 82%;
          z-index: 1;
        }
        .stage-phone {
          width: 32%;
          margin-left: -16%;
          margin-bottom: -10px;
          z-index: 10;
        }
      </style>
    </div>
  `;
}
