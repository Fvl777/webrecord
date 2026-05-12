import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Download,
  Square as StopSquare,
  HelpCircle,
  X,
  Monitor,
  Smartphone,
  Square as SquareIcon,
  Globe,
  XCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  AlertCircle,
  Activity,
  Cpu,
  Signal,
  Layers,
  Plus,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// Output presets — fixed pixel resolutions for HQ recording
// ────────────────────────────────────────────────────────────────────────────
const PRESETS = {
  standard: {
    id: 'standard',
    label: 'Broadcast HD',
    shortLabel: '16:9',
    width: 1920,
    height: 1080,
    icon: Monitor,
    description: '1080p · studio quality',
  },
  hd720: {
    id: 'hd720',
    label: 'HD 720',
    shortLabel: '16:9',
    width: 1280,
    height: 720,
    icon: Monitor,
    description: '720p · lighter on CPU',
  },
  shorts: {
    id: 'shorts',
    label: 'Vertical',
    shortLabel: '9:16',
    width: 1080,
    height: 1920,
    icon: Smartphone,
    description: '1080×1920 · Shorts / Reels / TikTok',
  },
  square: {
    id: 'square',
    label: 'Square',
    shortLabel: '1:1',
    width: 1080,
    height: 1080,
    icon: SquareIcon,
    description: '1080×1080 · Instagram',
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Stylesheet — dark broadcast-console aesthetic
// Typography: Bricolage Grotesque (display) · Inter Tight (UI) · JetBrains Mono (data)
// ────────────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  :root {
    --bg-0: #0a0b0d;
    --bg-1: #111317;
    --bg-2: #161a1f;
    --bg-3: #1d2229;
    --bg-4: #252b34;
    --line: #2a313c;
    --line-soft: #1f242c;
    --text-0: #f5f7fa;
    --text-1: #c9d0d9;
    --text-2: #8b95a3;
    --text-3: #5b6573;
    --accent: #ff3b3b;
    --accent-dim: #b91c1c;
    --accent-glow: rgba(255, 59, 59, 0.18);
    --signal: #22c55e;
    --signal-dim: #16a34a;
    --warn: #f59e0b;
    --info: #38bdf8;
    --violet: #a78bfa;
    --shadow-deep: 0 24px 48px -12px rgba(0,0,0,0.55), 0 8px 16px -8px rgba(0,0,0,0.4);
  }

  * { box-sizing: border-box; }

  .bcast-app {
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-columns: 320px 1fr 360px;
    grid-template-areas:
      "topbar topbar topbar"
      "sources stage mixer"
      "transport transport transport";
    height: 100vh;
    background: var(--bg-0);
    font-family: 'Inter Tight', system-ui, sans-serif;
    color: var(--text-1);
    font-feature-settings: 'ss01', 'cv11';
    overflow: hidden;
  }

  /* ── Top bar ───────────────────────────────────────────────────────── */
  .topbar {
    grid-area: topbar;
    background: linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%);
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 56px;
    position: relative;
  }
  .topbar::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: -1px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent) 20%, var(--accent) 80%, transparent);
    opacity: 0.25;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-mark {
    position: relative;
    width: 32px; height: 32px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    border-radius: 8px;
    display: grid;
    place-items: center;
    overflow: hidden;
  }
  .brand-mark::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 20%, var(--accent-glow), transparent 60%);
  }
  .brand-mark-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent-glow), 0 0 0 2px rgba(255,59,59,0.15);
    position: relative;
  }
  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }
  .brand-name {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: -0.02em;
    color: var(--text-0);
  }
  .brand-name span { color: var(--accent); }
  .brand-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-top: 3px;
  }

  .topbar-center {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .preset-pill-group {
    display: flex;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 3px;
    gap: 2px;
  }
  .preset-pill {
    background: transparent;
    border: none;
    padding: 6px 14px;
    border-radius: 999px;
    cursor: pointer;
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .preset-pill:hover:not(:disabled) { color: var(--text-0); background: var(--bg-3); }
  .preset-pill.active {
    background: var(--bg-4);
    color: var(--text-0);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.3);
  }
  .preset-pill:disabled { opacity: 0.4; cursor: not-allowed; }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .stat-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: var(--text-2);
  }
  .stat-chip-label { color: var(--text-3); }
  .stat-chip-val { color: var(--text-0); font-weight: 600; }

  .icon-btn-bare {
    background: transparent;
    border: 1px solid transparent;
    padding: 7px;
    border-radius: 6px;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
  }
  .icon-btn-bare:hover { background: var(--bg-2); color: var(--text-0); border-color: var(--line); }

  /* ── Side panels (sources & mixer) ─────────────────────────────────── */
  .panel {
    background: var(--bg-1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }
  .panel.sources { grid-area: sources; border-right: 1px solid var(--line); }
  .panel.mixer { grid-area: mixer; border-left: 1px solid var(--line); }

  .panel-header {
    height: 40px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--line-soft);
    background: var(--bg-2);
  }
  .panel-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .panel-title svg { color: var(--text-3); }
  .panel-body {
    flex: 1;
    overflow: auto;
    padding: 14px;
    min-height: 0;
  }
  .panel-body::-webkit-scrollbar { width: 8px; }
  .panel-body::-webkit-scrollbar-track { background: transparent; }
  .panel-body::-webkit-scrollbar-thumb { background: var(--bg-3); border-radius: 4px; }
  .panel-body::-webkit-scrollbar-thumb:hover { background: var(--bg-4); }

  /* ── Source items ──────────────────────────────────────────────────── */
  .source-card {
    background: var(--bg-2);
    border: 1px solid var(--line-soft);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    transition: all 0.15s;
  }
  .source-card.active {
    border-color: var(--signal-dim);
    background: linear-gradient(180deg, rgba(34,197,94,0.04), var(--bg-2));
  }
  .source-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .source-card-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-0);
  }
  .source-card-name svg { color: var(--text-2); }
  .source-state {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 2px 7px;
    border-radius: 3px;
    font-weight: 700;
  }
  .source-state.live { background: rgba(34,197,94,0.12); color: var(--signal); }
  .source-state.idle { background: var(--bg-3); color: var(--text-3); }

  .source-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: var(--text-3);
    line-height: 1.5;
    margin: 6px 0 10px;
    word-break: break-all;
  }
  .source-meta strong { color: var(--text-1); font-weight: 500; }
  .source-actions {
    display: flex;
    gap: 6px;
  }
  .source-btn {
    flex: 1;
    border: 1px solid var(--line);
    background: var(--bg-3);
    color: var(--text-1);
    padding: 7px 10px;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .source-btn:hover { background: var(--bg-4); color: var(--text-0); }
  .source-btn.primary {
    background: var(--violet);
    border-color: var(--violet);
    color: #1a1325;
  }
  .source-btn.primary:hover { background: #b9a3fb; }
  .source-btn.danger {
    background: transparent;
    border-color: var(--accent-dim);
    color: var(--accent);
  }
  .source-btn.danger:hover { background: rgba(255,59,59,0.08); }

  .empty-source {
    border: 1.5px dashed var(--line);
    border-radius: 8px;
    padding: 20px 14px;
    text-align: center;
    color: var(--text-3);
    font-size: 0.78rem;
    line-height: 1.5;
  }
  .empty-source-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: var(--bg-2);
    display: grid;
    place-items: center;
    margin: 0 auto 10px;
    color: var(--text-2);
  }

  /* ── Stage / preview ───────────────────────────────────────────────── */
  .stage {
    grid-area: stage;
    background: var(--bg-0);
    background-image:
      radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0);
    background-size: 20px 20px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .stage-header {
    height: 40px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--line-soft);
  }
  .stage-tabs {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .stage-tab {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 4px;
    color: var(--text-3);
    background: transparent;
    border: 1px solid transparent;
  }
  .stage-tab.active {
    color: var(--text-0);
    background: var(--bg-2);
    border-color: var(--line);
  }
  .stage-tab .live-dot {
    display: inline-block;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent);
    margin-right: 6px;
    animation: pulseDot 1.8s infinite;
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 var(--accent-glow); }
    50% { opacity: 0.6; box-shadow: 0 0 0 4px rgba(255,59,59,0); }
  }

  .stage-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: var(--text-3);
  }
  .stage-meta-item { display: flex; align-items: center; gap: 5px; }
  .stage-meta-item svg { color: var(--text-3); }

  .stage-canvas-wrap {
    flex: 1;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    position: relative;
  }
  .stage-frame {
    background: #000;
    border: 1px solid var(--line);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    box-shadow: var(--shadow-deep);
    /* aspect-ratio is set inline; these constraints make it shrink to fit */
    max-width: 100%;
    max-height: 100%;
    /* prevent flex items from forcing a min size */
    min-width: 0;
    min-height: 0;
    width: auto;
    height: auto;
    /* The browser computes whichever of max-width/max-height is binding,
       and the unset dimension follows from aspect-ratio. */
  }
  .stage-frame::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 7px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255,59,59,0.4), transparent 30%, transparent 70%, rgba(167,139,250,0.3));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .stage-frame.live::before { opacity: 1; }

  .stage-frame video,
  .stage-frame canvas.preview-canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: #000;
  }

  .stage-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    color: var(--text-3);
    text-align: center;
    padding: 40px;
    gap: 16px;
  }
  .stage-empty-mark {
    width: 64px; height: 64px;
    border-radius: 16px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    display: grid;
    place-items: center;
    color: var(--text-2);
    position: relative;
  }
  .stage-empty-mark::after {
    content: '';
    position: absolute;
    inset: -8px;
    border: 1px solid var(--line);
    border-radius: 22px;
    opacity: 0.4;
  }
  .stage-empty h3 {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
    color: var(--text-0);
    margin: 0;
    letter-spacing: -0.02em;
  }
  .stage-empty p {
    margin: 0;
    max-width: 380px;
    line-height: 1.55;
    font-size: 0.88rem;
  }

  /* Stage HUD overlays */
  .hud-overlay {
    position: absolute;
    pointer-events: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    z-index: 5;
  }
  .hud-tl {
    top: 12px; left: 12px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .hud-tr {
    top: 12px; right: 12px;
    display: flex;
    gap: 6px;
    flex-direction: column;
    align-items: flex-end;
  }
  .hud-bl {
    bottom: 12px; left: 12px;
  }
  .hud-tag {
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 4px 10px;
    border-radius: 4px;
    color: var(--text-0);
    font-weight: 600;
    letter-spacing: 0.06em;
    border: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .hud-tag.live {
    background: rgba(255,59,59,0.92);
    border-color: rgba(255,255,255,0.2);
    color: white;
  }
  .hud-tag.live::before {
    content: '';
    width: 6px; height: 6px; border-radius: 50%;
    background: white;
    animation: pulseDot 1s infinite;
  }
  .hud-tag.rec {
    background: rgba(255,59,59,0.92);
    color: white;
  }
  .hud-tag.rec::before {
    content: '';
    width: 6px; height: 6px; border-radius: 50%;
    background: white;
    animation: pulseDot 1s infinite;
  }

  /* ── Mixer ─────────────────────────────────────────────────────────── */
  .mixer-channel {
    background: var(--bg-2);
    border: 1px solid var(--line-soft);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
  }
  .mixer-channel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .mixer-channel-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-0);
  }
  .mixer-channel-name svg { color: var(--text-2); }
  .mute-btn {
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--text-1);
    padding: 4px 10px;
    border-radius: 5px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: all 0.15s;
  }
  .mute-btn:hover:not(:disabled) { background: var(--bg-4); }
  .mute-btn.muted {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: white;
  }
  .mute-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .meter-shell {
    height: 10px;
    background: var(--bg-0);
    border: 1px solid var(--line-soft);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }
  .meter-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--signal) 0%, var(--signal) 60%, var(--warn) 75%, var(--accent) 92%);
    will-change: width;
    box-shadow: 0 0 8px rgba(34,197,94,0.4);
  }
  .meter-fill.meter-off {
    opacity: 0.3;
    background: var(--text-3);
    box-shadow: none;
  }
  .meter-segments {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent calc(5% - 1px),
      rgba(0,0,0,0.4) calc(5% - 1px),
      rgba(0,0,0,0.4) 5%
    );
    pointer-events: none;
  }
  .meter-scale {
    display: flex;
    justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    color: var(--text-3);
    margin-top: 4px;
  }

  .channel-info {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    color: var(--text-3);
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1.4;
  }
  .channel-info.warn { color: var(--warn); }

  .device-select {
    width: 100%;
    margin-top: 8px;
    padding: 7px 10px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    border-radius: 6px;
    color: var(--text-1);
    font-size: 0.78rem;
    font-family: 'Inter Tight', sans-serif;
    cursor: pointer;
  }
  .device-select:disabled { opacity: 0.5; cursor: not-allowed; }
  .device-select:focus { outline: none; border-color: var(--violet); }

  /* ── Transport bar ─────────────────────────────────────────────────── */
  .transport {
    grid-area: transport;
    height: 76px;
    background: linear-gradient(180deg, var(--bg-1) 0%, #08090b 100%);
    border-top: 1px solid var(--line);
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 16px;
    position: relative;
  }
  .transport::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--line), transparent);
  }

  .transport-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .transport-section + .transport-section {
    padding-left: 16px;
    border-left: 1px solid var(--line-soft);
    height: 44px;
  }
  .spacer { flex: 1; }

  .label-stack {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
  .label-stack-key {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
  .label-stack-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    color: var(--text-0);
    font-weight: 600;
    margin-top: 2px;
  }
  .label-stack-val.live { color: var(--accent); }
  .label-stack-val.signal { color: var(--signal); }

  .btn-action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 18px;
    border: 1px solid var(--line);
    background: var(--bg-3);
    color: var(--text-0);
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Inter Tight', sans-serif;
  }
  .btn-action:hover:not(:disabled) { background: var(--bg-4); border-color: #3a414c; }
  .btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-record {
    background: linear-gradient(180deg, #2a2f37, #1a1e25);
    border-color: #3a414c;
  }
  .btn-record:hover:not(:disabled) {
    background: linear-gradient(180deg, #343a44, #1f2530);
  }
  .btn-record .rec-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent-glow);
  }

  .btn-stop {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }
  .btn-stop:hover { background: #ff5454; }

  .btn-download {
    background: var(--signal-dim);
    border-color: var(--signal-dim);
    color: white;
  }
  .btn-download:hover { background: var(--signal); }

  /* recording indicator pill */
  .rec-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,59,59,0.1);
    border: 1px solid rgba(255,59,59,0.3);
    padding: 8px 14px;
    border-radius: 999px;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    font-weight: 700;
  }
  .rec-pill .rec-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulseDot 1.2s infinite;
  }

  /* ── Status strip ─────────────────────────────────────────────────── */
  .status-strip {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 16px;
    height: 28px;
    border-bottom: 1px solid var(--line-soft);
    background: var(--bg-1);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    color: var(--text-3);
  }
  .status-item { display: flex; align-items: center; gap: 6px; }
  .status-item .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--text-3);
  }
  .status-item.ok .dot { background: var(--signal); }
  .status-item.live .dot {
    background: var(--accent);
    animation: pulseDot 1.2s infinite;
  }
  .status-item.warn .dot { background: var(--warn); }

  /* ── Modals & popovers ────────────────────────────────────────────── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 6, 8, 0.78);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: overlayIn 0.2s ease-out;
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .modal {
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 14px;
    width: 100%;
    max-width: 460px;
    box-shadow: var(--shadow-deep);
    overflow: hidden;
    animation: modalIn 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2);
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .modal-head {
    padding: 18px 20px;
    border-bottom: 1px solid var(--line-soft);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .modal-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 700;
    font-size: 1.15rem;
    color: var(--text-0);
    margin: 0;
    letter-spacing: -0.01em;
  }
  .modal-close {
    background: transparent;
    border: 1px solid var(--line);
    color: var(--text-2);
    width: 28px; height: 28px;
    border-radius: 6px;
    cursor: pointer;
    display: grid;
    place-items: center;
  }
  .modal-close:hover { background: var(--bg-3); color: var(--text-0); }
  .modal-body {
    padding: 20px;
    max-height: 65vh;
    overflow: auto;
  }
  .modal-foot {
    padding: 14px 20px;
    border-top: 1px solid var(--line-soft);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    background: var(--bg-2);
  }

  .field {
    margin-bottom: 14px;
  }
  .field-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .field-input-wrap { position: relative; }
  .field input,
  .field select {
    width: 100%;
    padding: 10px 12px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    border-radius: 6px;
    color: var(--text-0);
    font-size: 0.85rem;
    font-family: 'JetBrains Mono', monospace;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }
  .field input:focus,
  .field select:focus {
    outline: none;
    border-color: var(--violet);
    background: var(--bg-3);
  }
  .field-input-wrap input { padding-right: 38px; }
  .field-toggle {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    padding: 6px;
    cursor: pointer;
    color: var(--text-2);
    border-radius: 4px;
    display: flex;
  }
  .field-toggle:hover { background: var(--bg-3); color: var(--text-0); }
  .field-hint {
    font-size: 0.72rem;
    color: var(--text-3);
    margin-top: 6px;
    line-height: 1.5;
  }
  .field-hint a { color: var(--info); text-decoration: none; }
  .field-hint a:hover { text-decoration: underline; }
  .field-hint code {
    background: var(--bg-3);
    padding: 1px 6px;
    border-radius: 3px;
    font-family: 'JetBrains Mono', monospace;
    color: var(--text-1);
    font-size: 0.95em;
  }

  .btn-secondary {
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--text-1);
    padding: 9px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    font-family: 'Inter Tight', sans-serif;
  }
  .btn-secondary:hover { background: var(--bg-4); color: var(--text-0); }

  .btn-primary {
    background: linear-gradient(180deg, var(--accent) 0%, var(--accent-dim) 100%);
    border: 1px solid var(--accent);
    color: white;
    padding: 9px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter Tight', sans-serif;
  }
  .btn-primary:hover:not(:disabled) { background: linear-gradient(180deg, #ff5454, var(--accent-dim)); }
  .btn-primary:disabled {
    background: var(--bg-3);
    border-color: var(--line);
    color: var(--text-3);
    cursor: not-allowed;
  }

  /* Guide */
  .guide-list { display: flex; flex-direction: column; gap: 14px; }
  .guide-item { display: flex; gap: 12px; }
  .guide-num {
    flex-shrink: 0;
    width: 26px; height: 26px;
    background: var(--bg-3);
    border: 1px solid var(--line);
    color: var(--accent);
    border-radius: 6px;
    display: grid;
    place-items: center;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 0.78rem;
  }
  .guide-text { flex: 1; font-size: 0.88rem; line-height: 1.55; color: var(--text-1); }
  .guide-text strong {
    display: block;
    color: var(--text-0);
    font-weight: 600;
    margin-bottom: 2px;
  }

  /* Responsive */
  @media (max-width: 1100px) {
    .bcast-app {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto 1fr auto auto;
      grid-template-areas:
        "topbar"
        "sources"
        "stage"
        "mixer"
        "transport";
    }
    .panel.sources, .panel.mixer {
      max-height: 220px;
      border-left: none;
      border-right: none;
      border-bottom: 1px solid var(--line);
    }
  }

  @media (max-width: 720px) {
    .topbar-center { display: none; }
    .stat-chip { display: none; }
    .transport { flex-wrap: wrap; height: auto; padding: 12px; gap: 10px; }
    .transport-section + .transport-section { padding-left: 0; border-left: none; height: auto; }
  }
`;

// ────────────────────────────────────────────────────────────────────────────
// App component
// ────────────────────────────────────────────────────────────────────────────
export default function DesktopApp() {
  // ── Source (screen / tab capture) ────────────────────────────────────
  const bgVideoRef = useRef(null);
  const bgStreamRef = useRef(null);
  const recordCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const compositeRafRef = useRef(null);
  const [sourceActive, setSourceActive] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('');
  const [sourceDims, setSourceDims] = useState({ w: 0, h: 0 });
  const [systemAudioAvailable, setSystemAudioAvailable] = useState(false);

  // ── Output preset ────────────────────────────────────────────────────
  const [presetId, setPresetId] = useState('standard');
  const preset = PRESETS[presetId];

  // ── Recording ────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // ── Audio ────────────────────────────────────────────────────────────
  const [micEnabled, setMicEnabled] = useState(true);
  const [systemAudioEnabled, setSystemAudioEnabled] = useState(true);
  const [micDevices, setMicDevices] = useState([]);
  const [selectedMicId, setSelectedMicId] = useState('default');

  const micStreamRef = useRef(null);
  const systemAudioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioDestRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const sysAnalyserRef = useRef(null);
  const levelRafRef = useRef(null);
  // Meter levels are written directly to DOM via refs to avoid the
  // ~60fps re-render storm that was causing visible UI jerk.
  const micMeterRef = useRef(null);
  const sysMeterRef = useRef(null);
  const masterMeterRef = useRef(null);

  // ── UI ───────────────────────────────────────────────────────────────
  const [showGuide, setShowGuide] = useState(false);

  // One-time cleanup of stale localStorage keys from the removed streaming feature.
  useEffect(() => {
    try {
      localStorage.removeItem('bcast.streamKey');
      localStorage.removeItem('bcast.relayUrl');
      localStorage.removeItem('bcast.rtmpUrl');
    } catch {}
  }, []);

  // Wall clock is rendered by the <Clock /> subcomponent so its tick
  // doesn't re-render the entire app once per second.

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  // ── Source: screen / tab capture ─────────────────────────────────────
  const stopSource = useCallback(() => {
    if (bgStreamRef.current) {
      bgStreamRef.current.getTracks().forEach(t => t.stop());
      bgStreamRef.current = null;
    }
    if (bgVideoRef.current) bgVideoRef.current.srcObject = null;
    setSourceActive(false);
    setSourceLabel('');
    setSourceDims({ w: 0, h: 0 });
    setSystemAudioAvailable(false);
  }, []);

  const startSource = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert('Screen capture is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: preset.width },
          height: { ideal: preset.height },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      stream.getVideoTracks()[0].addEventListener('ended', () => stopSource());

      bgStreamRef.current = stream;
      setSystemAudioAvailable(stream.getAudioTracks().length > 0);

      const video = bgVideoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play().catch(() => {});
      }

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings ? track.getSettings() : {};
      setSourceLabel(track.label || settings.displaySurface || 'Captured source');
      setSourceDims({ w: settings.width || 0, h: settings.height || 0 });
      setSourceActive(true);
    } catch (err) {
      console.warn('Display capture cancelled or failed:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (compositeRafRef.current) clearInterval(compositeRafRef.current);
      if (bgStreamRef.current) bgStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Mic device enumeration ──────────────────────────────────────────
  const refreshMicDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMicDevices(devices.filter(d => d.kind === 'audioinput'));
    } catch (err) {
      console.warn('Could not enumerate audio devices:', err);
    }
  }, []);

  const requestMicPermissionAndList = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      await refreshMicDevices();
    } catch (err) {
      console.warn('Mic permission denied or failed:', err);
      await refreshMicDevices();
    }
  }, [refreshMicDevices]);

  useEffect(() => {
    refreshMicDevices();
    if (navigator.mediaDevices?.addEventListener) {
      const handler = () => refreshMicDevices();
      navigator.mediaDevices.addEventListener('devicechange', handler);
      return () => navigator.mediaDevices.removeEventListener('devicechange', handler);
    }
  }, [refreshMicDevices]);

  // ── Audio mixing ────────────────────────────────────────────────────
  const buildAudioStream = async () => {
    const wantMic = micEnabled;
    const wantSystem = systemAudioEnabled && sourceActive && systemAudioAvailable;

    let micStream = null;
    if (wantMic) {
      try {
        const constraints = {
          audio: {
            deviceId: selectedMicId && selectedMicId !== 'default'
              ? { exact: selectedMicId } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        };
        micStream = await navigator.mediaDevices.getUserMedia(constraints);
        micStreamRef.current = micStream;
      } catch (err) {
        console.error('Microphone access failed:', err);
        alert('Could not access the microphone. Broadcast will continue without mic audio.');
      }
    }

    let systemTrack = null;
    if (wantSystem && bgStreamRef.current) {
      const tracks = bgStreamRef.current.getAudioTracks();
      if (tracks.length > 0) {
        systemTrack = tracks[0].clone();
        systemAudioStreamRef.current = new MediaStream([systemTrack]);
      }
    }

    // Always pass through Web Audio API to guarantee an audio track exists,
    // even when no microphone is selected (silent track), so recording mixers
    // never receive a video-only stream.
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    audioContextRef.current = ctx;
    const dest = ctx.createMediaStreamDestination();
    audioDestRef.current = dest;

    if (micStream) {
      const micSource = ctx.createMediaStreamSource(micStream);
      const micGain = ctx.createGain();
      micGain.gain.value = 1.0;
      const micAnalyser = ctx.createAnalyser();
      micAnalyser.fftSize = 256;
      micSource.connect(micGain);
      micGain.connect(dest);
      micGain.connect(micAnalyser);
      micAnalyserRef.current = micAnalyser;
    }

    if (systemTrack) {
      const sysSource = ctx.createMediaStreamSource(systemAudioStreamRef.current);
      const sysGain = ctx.createGain();
      sysGain.gain.value = 0.8;
      const sysAnalyser = ctx.createAnalyser();
      sysAnalyser.fftSize = 256;
      sysSource.connect(sysGain);
      sysGain.connect(dest);
      sysGain.connect(sysAnalyser);
      sysAnalyserRef.current = sysAnalyser;
    }

    startLevelMeters();
    return dest.stream;
  };

  const startLevelMeters = () => {
    const micData = micAnalyserRef.current
      ? new Uint8Array(micAnalyserRef.current.frequencyBinCount) : null;
    const sysData = sysAnalyserRef.current
      ? new Uint8Array(sysAnalyserRef.current.frequencyBinCount) : null;

    const getPeak = (analyser, buf) => {
      if (!analyser || !buf) return 0;
      analyser.getByteTimeDomainData(buf);
      let peak = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = Math.abs(buf[i] - 128);
        if (v > peak) peak = v;
      }
      return Math.min(1, peak / 128);
    };

    const tick = () => {
      const m = getPeak(micAnalyserRef.current, micData);
      const s = getPeak(sysAnalyserRef.current, sysData);
      const master = Math.max(m, s);
      // Write straight to DOM — bypasses React reconciliation entirely.
      if (micMeterRef.current) micMeterRef.current.style.width = `${(m * 100).toFixed(1)}%`;
      if (sysMeterRef.current) sysMeterRef.current.style.width = `${(s * 100).toFixed(1)}%`;
      if (masterMeterRef.current) masterMeterRef.current.style.width = `${(master * 100).toFixed(1)}%`;
      levelRafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const cleanupAudio = useCallback(() => {
    if (levelRafRef.current) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }
    // Reset meters in the DOM directly.
    if (micMeterRef.current) micMeterRef.current.style.width = '0%';
    if (sysMeterRef.current) sysMeterRef.current.style.width = '0%';
    if (masterMeterRef.current) masterMeterRef.current.style.width = '0%';
    if (micAnalyserRef.current) { try { micAnalyserRef.current.disconnect(); } catch (e) {} micAnalyserRef.current = null; }
    if (sysAnalyserRef.current) { try { sysAnalyserRef.current.disconnect(); } catch (e) {} sysAnalyserRef.current = null; }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (systemAudioStreamRef.current) {
      systemAudioStreamRef.current.getTracks().forEach(t => t.stop());
      systemAudioStreamRef.current = null;
    }
    if (audioDestRef.current) {
      try { audioDestRef.current.disconnect(); } catch (e) {}
      audioDestRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanupAudio(), [cleanupAudio]);

  // ── MediaRecorder helpers ───────────────────────────────────────────
  const pickMimeType = () => {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c;
    }
    return '';
  };

  const computeBitrate = () => {
    const pixels = preset.width * preset.height;
    const fps = 30;
    const bits = Math.round(pixels * fps * 0.1);
    return Math.max(2_500_000, Math.min(bits, 12_000_000));
  };

  const computeFitRect = (srcW, srcH, dstW, dstH) => {
    if (!srcW || !srcH) return { x: 0, y: 0, w: dstW, h: dstH };
    const srcAspect = srcW / srcH;
    const dstAspect = dstW / dstH;
    let w, h;
    if (srcAspect > dstAspect) { w = dstW; h = dstW / srcAspect; }
    else { h = dstH; w = dstH * srcAspect; }
    return { x: (dstW - w) / 2, y: (dstH - h) / 2, w, h };
  };

  // ── Composite render loop (drives both record and live preview) ─────
  const ensureRenderLoop = () => {
    if (compositeRafRef.current) return;
    const recCanvas = recordCanvasRef.current;
    recCanvas.width = preset.width;
    recCanvas.height = preset.height;
    const recCtx = recCanvas.getContext('2d');
    recCtx.imageSmoothingEnabled = true;
    recCtx.imageSmoothingQuality = 'high';

    const renderFrame = () => {
      recCtx.fillStyle = '#000000';
      recCtx.fillRect(0, 0, recCanvas.width, recCanvas.height);

      const video = bgVideoRef.current;
      if (video && video.srcObject && video.readyState >= 2) {
        const r = computeFitRect(video.videoWidth, video.videoHeight, recCanvas.width, recCanvas.height);
        recCtx.drawImage(video, r.x, r.y, r.w, r.h);
      }

      // Mirror to preview canvas (low-cost, downsized)
      const prev = previewCanvasRef.current;
      if (prev) {
        const pctx = prev.getContext('2d');
        if (prev.width !== recCanvas.width || prev.height !== recCanvas.height) {
          prev.width = recCanvas.width;
          prev.height = recCanvas.height;
        }
        pctx.drawImage(recCanvas, 0, 0);
      }
    };

    renderFrame();
    compositeRafRef.current = setInterval(renderFrame, 33);
  };

  const handleGlobalCleanup = useCallback(() => {
    const recActive = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive';
    if (!recActive) {
      if (compositeRafRef.current) {
        clearInterval(compositeRafRef.current);
        compositeRafRef.current = null;
      }
      cleanupAudio();
    }
  }, [cleanupAudio]);

  // Keep preview alive whenever a source is active (even when not recording)
  useEffect(() => {
    if (sourceActive) {
      ensureRenderLoop();
    } else {
      // only stop if not recording
      const recActive = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive';
      if (!recActive && compositeRafRef.current) {
        clearInterval(compositeRafRef.current);
        compositeRafRef.current = null;
        // clear preview
        const prev = previewCanvasRef.current;
        if (prev) {
          const pctx = prev.getContext('2d');
          pctx.clearRect(0, 0, prev.width, prev.height);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceActive, presetId]);

  // ── Recording controls ──────────────────────────────────────────────
  const startRecording = async () => {
    try {
      setRecordedVideoUrl(null);
      recordedChunksRef.current = [];

      const mimeType = pickMimeType();
      const options = { videoBitsPerSecond: computeBitrate() };
      if (mimeType) options.mimeType = mimeType;

      let audioStream = null;
      try { audioStream = await buildAudioStream(); }
      catch (err) { console.error('Audio setup failed:', err); }

      ensureRenderLoop();
      const videoStream = recordCanvasRef.current.captureStream(30);

      const recordStream = new MediaStream();
      videoStream.getVideoTracks().forEach(t => recordStream.addTrack(t));
      if (audioStream) audioStream.getAudioTracks().forEach(t => recordStream.addTrack(t));

      const mediaRecorder = new MediaRecorder(recordStream, options);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        handleGlobalCleanup();
        const blob = new Blob(recordedChunksRef.current, {
          type: mediaRecorder.mimeType || 'video/webm'
        });
        setRecordedVideoUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
      refreshMicDevices();
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Recording is not supported in this browser or an error occurred.');
      handleGlobalCleanup();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = recordedVideoUrl;
    const ext = (mediaRecorderRef.current?.mimeType || '').includes('mp4') ? 'mp4' : 'webm';
    a.download = `broadcast-${preset.id}-${preset.width}x${preset.height}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(recordedVideoUrl);
    document.body.removeChild(a);
  };

  useEffect(() => () => {
    if (compositeRafRef.current) clearInterval(compositeRafRef.current);
  }, []);

  const handlePresetChange = (id) => {
    if (isRecording) return;
    if (id === presetId) return;
    setPresetId(id);
  };

  // ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="bcast-app">

        {/* ─── Top Bar ──────────────────────────────────────────────── */}
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">
              <div className="brand-mark-dot"></div>
            </div>
            <div className="brand-text">
              <div className="brand-name">SIGNAL<span>·</span>CAST</div>
              <div className="brand-tag">Broadcast Console v2.0</div>
            </div>
          </div>

          <div className="topbar-center">
            <div className="preset-pill-group">
              {Object.values(PRESETS).map((p) => {
                const Icon = p.icon;
                const active = p.id === presetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePresetChange(p.id)}
                    disabled={isRecording}
                    className={`preset-pill ${active ? 'active' : ''}`}
                    title={p.description}
                  >
                    <Icon size={13} />
                    <span>{p.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="topbar-right">
            <div className="stat-chip">
              <span className="stat-chip-label">OUT</span>
              <span className="stat-chip-val">{preset.width}×{preset.height}</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-label">FPS</span>
              <span className="stat-chip-val">30</span>
            </div>
            <button
              onClick={() => setShowGuide(true)}
              className="icon-btn-bare"
              title="Guide"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>

        {/* ─── Sources Panel (left) ─────────────────────────────────── */}
        <aside className="panel sources">
          <div className="panel-header">
            <div className="panel-title">
              <Layers size={12} />
              <span>Scene Sources</span>
            </div>
            {!sourceActive && (
              <button
                onClick={startSource}
                className="icon-btn-bare"
                title="Add a source"
                disabled={isRecording}
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          <div className="panel-body">
            {sourceActive ? (
              <div className="source-card active">
                <div className="source-card-head">
                  <div className="source-card-name">
                    <Globe size={14} />
                    <span>Display Capture</span>
                  </div>
                  <div className="source-state live">● LIVE</div>
                </div>
                <div className="source-meta">
                  <strong>{sourceLabel || 'Captured source'}</strong>
                  {sourceDims.w > 0 && (
                    <><br />{sourceDims.w} × {sourceDims.h}</>
                  )}
                  {systemAudioAvailable && (
                    <><br /><Volume2 size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Audio track present</>
                  )}
                </div>
                <div className="source-actions">
                  <button
                    onClick={stopSource}
                    disabled={isRecording}
                    className="source-btn danger"
                  >
                    <XCircle size={13} />
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-source">
                <div className="empty-source-icon">
                  <Layers size={18} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  No source connected.<br />
                  Pick a tab, window, or display to broadcast.
                </div>
                <button
                  onClick={startSource}
                  className="source-btn primary"
                  disabled={isRecording}
                  style={{ width: '100%' }}
                >
                  <Plus size={14} />
                  Add Display Source
                </button>
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <div className="panel-title" style={{ marginBottom: 10, fontSize: '0.62rem' }}>
                <Cpu size={11} />
                Output Profile
              </div>
              <div className="source-card" style={{ marginBottom: 0 }}>
                <div className="source-card-head" style={{ marginBottom: 0 }}>
                  <div className="source-card-name" style={{ fontSize: '0.78rem' }}>
                    {(() => { const Ic = preset.icon; return <Ic size={14} />; })()}
                    <span>{preset.label}</span>
                  </div>
                </div>
                <div className="source-meta" style={{ marginBottom: 0, marginTop: 6 }}>
                  {preset.width}×{preset.height} · {preset.shortLabel} · 30 FPS<br />
                  Target: {(computeBitrate() / 1_000_000).toFixed(1)} Mbps
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Stage / Preview (center) ─────────────────────────────── */}
        <main className="stage">
          <div className="status-strip">
            <div className={`status-item ${sourceActive ? 'ok' : ''}`}>
              <div className="dot"></div>
              <span>SOURCE {sourceActive ? 'CONNECTED' : 'OFFLINE'}</span>
            </div>
            <div className={`status-item ${isRecording ? 'live' : ''}`}>
              <div className="dot"></div>
              <span>REC {isRecording ? 'ACTIVE' : 'IDLE'}</span>
            </div>
            <div style={{ marginLeft: 'auto' }} className="status-item">
              <Clock />
            </div>
          </div>

          <div className="stage-header">
            <div className="stage-tabs">
              <div className="stage-tab active">
                {isRecording && <span className="live-dot"></span>}
                Program
              </div>
              <div className="stage-meta-item" style={{ marginLeft: 12 }}>
                <Activity size={11} /> {preset.shortLabel}
              </div>
            </div>
            <div className="stage-meta">
              <div className="stage-meta-item">
                <Signal size={12} />
                <span>{preset.width}×{preset.height}</span>
              </div>
              <div className="stage-meta-item">
                <span>·</span>
                <span>30 fps</span>
              </div>
            </div>
          </div>

          <div className="stage-canvas-wrap">
            {sourceActive ? (
              <StageFrame
                isRecording={isRecording}
                preset={preset}
              >
                <canvas
                  ref={previewCanvasRef}
                  className="preview-canvas"
                />

                <div className="hud-overlay hud-tl">
                  {isRecording && <div className="hud-tag rec">REC {formatTime(recordingTime)}</div>}
                </div>
                <div className="hud-overlay hud-tr">
                  <div className="hud-tag">{preset.width}×{preset.height}</div>
                  <div className="hud-tag">30 FPS</div>
                </div>
                <div className="hud-overlay hud-bl">
                  <div className="hud-tag">SCENE · DISPLAY</div>
                </div>
              </StageFrame>
            ) : (
              <div className="stage-empty">
                <div className="stage-empty-mark">
                  <Layers size={26} />
                </div>
                <h3>No signal</h3>
                <p>
                  Add a display source from the left panel to start your broadcast.
                  Capture any browser tab, application window, or full screen — your
                  audio mix and output settings are ready when you are.
                </p>
                <button
                  onClick={startSource}
                  className="btn-action"
                  style={{ marginTop: 4 }}
                >
                  <Plus size={16} />
                  Add Source
                </button>
              </div>
            )}
            {/* hidden render target */}
            <canvas ref={recordCanvasRef} style={{ display: 'none' }} />
            {/* hidden source video */}
            <video
              ref={bgVideoRef}
              style={{ display: 'none' }}
              autoPlay
              muted
              playsInline
            />
          </div>
        </main>

        {/* ─── Mixer Panel (right) ──────────────────────────────────── */}
        <aside className="panel mixer">
          <div className="panel-header">
            <div className="panel-title">
              <Activity size={12} />
              <span>Audio Mixer</span>
            </div>
            <button
              onClick={requestMicPermissionAndList}
              className="icon-btn-bare"
              title="Refresh devices"
              disabled={isRecording}
            >
              <Settings size={14} />
            </button>
          </div>

          <div className="panel-body">
            {/* Microphone channel */}
            <div className="mixer-channel">
              <div className="mixer-channel-head">
                <div className="mixer-channel-name">
                  {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
                  <span>Microphone</span>
                </div>
                <button
                  onClick={() => setMicEnabled(v => !v)}
                  disabled={isRecording}
                  className={`mute-btn ${!micEnabled ? 'muted' : ''}`}
                >
                  {micEnabled ? 'ON' : 'MUTE'}
                </button>
              </div>
              <div className="meter-shell">
                <div
                  ref={micMeterRef}
                  className={`meter-fill ${!micEnabled ? 'meter-off' : ''}`}
                  style={{ width: '0%' }}
                />
                <div className="meter-segments"></div>
              </div>
              <div className="meter-scale">
                <span>-∞</span>
                <span>-12</span>
                <span>-6</span>
                <span>-3</span>
                <span>0 dB</span>
              </div>
              <select
                className="device-select"
                value={selectedMicId}
                onChange={(e) => setSelectedMicId(e.target.value)}
                disabled={!micEnabled || isRecording}
              >
                <option value="default">System default</option>
                {micDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))}
              </select>
              {micDevices.every(d => !d.label) && (
                <div className="channel-info">
                  Device names appear after granting mic permission.
                </div>
              )}
            </div>

            {/* System audio channel */}
            <div className="mixer-channel">
              <div className="mixer-channel-head">
                <div className="mixer-channel-name">
                  {systemAudioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span>System Audio</span>
                </div>
                <button
                  onClick={() => setSystemAudioEnabled(v => !v)}
                  disabled={isRecording}
                  className={`mute-btn ${!systemAudioEnabled ? 'muted' : ''}`}
                >
                  {systemAudioEnabled ? 'ON' : 'MUTE'}
                </button>
              </div>
              <div className="meter-shell">
                <div
                  ref={sysMeterRef}
                  className={`meter-fill ${!(systemAudioEnabled && systemAudioAvailable) ? 'meter-off' : ''}`}
                  style={{ width: '0%' }}
                />
                <div className="meter-segments"></div>
              </div>
              <div className="meter-scale">
                <span>-∞</span>
                <span>-12</span>
                <span>-6</span>
                <span>-3</span>
                <span>0 dB</span>
              </div>
              {!sourceActive && (
                <div className="channel-info">
                  No source connected. System audio routes from the captured tab/window.
                </div>
              )}
              {sourceActive && !systemAudioAvailable && (
                <div className="channel-info warn">
                  <AlertCircle size={11} />
                  Source has no audio track. Re-share with "Share tab audio" enabled.
                </div>
              )}
              {sourceActive && systemAudioAvailable && (
                <div className="channel-info">
                  Routed from <strong style={{ color: 'var(--text-1)' }}>{sourceLabel}</strong>
                </div>
              )}
            </div>

            {/* Master output indicator */}
            <div className="mixer-channel">
              <div className="mixer-channel-head">
                <div className="mixer-channel-name">
                  <Signal size={14} />
                  <span>Master Out</span>
                </div>
                <span className="source-state live">● 0 dB</span>
              </div>
              <div className="meter-shell">
                <div
                  ref={masterMeterRef}
                  className="meter-fill"
                  style={{ width: '0%' }}
                />
                <div className="meter-segments"></div>
              </div>
              <div className="meter-scale">
                <span>-∞</span>
                <span>-12</span>
                <span>-6</span>
                <span>-3</span>
                <span>0 dB</span>
              </div>
              <div className="channel-info">
                Mixed mono · 128 kbps · Opus
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Transport Bar ────────────────────────────────────────── */}
        <div className="transport">
          <div className="transport-section">
            <div className="label-stack">
              <span className="label-stack-key">Session</span>
              <span className={`label-stack-val ${isRecording ? 'live' : ''}`}>
                {isRecording ? formatTime(recordingTime) : '00:00'}
              </span>
            </div>
          </div>

          <div className="spacer"></div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="rec-pill">
              <div className="rec-dot"></div>
              <span>REC {formatTime(recordingTime)}</span>
            </div>
          )}

          <div className="transport-section">
            {isRecording ? (
              <button onClick={stopRecording} className="btn-action btn-stop">
                <StopSquare size={16} fill="currentColor" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={!sourceActive}
                className="btn-action btn-record"
                title={!sourceActive ? 'Add a source first' : 'Start recording'}
              >
                <div className="rec-dot"></div>
                <span>Record</span>
              </button>
            )}

            {recordedVideoUrl && !isRecording && (
              <button onClick={downloadVideo} className="btn-action btn-download">
                <Download size={16} />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Guide Modal ──────────────────────────────────────────── */}
        {showGuide && (
          <div className="modal-overlay" onClick={() => setShowGuide(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <h2 className="modal-title">
                  <HelpCircle size={18} color="var(--info)" />
                  Quick Start
                </h2>
                <button className="modal-close" onClick={() => setShowGuide(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                <div className="guide-list">
                  <div className="guide-item">
                    <div className="guide-num">1</div>
                    <div className="guide-text">
                      <strong>Choose your output profile</strong>
                      Pick 16:9, 9:16, or 1:1 from the top bar — this sets your broadcast resolution.
                    </div>
                  </div>
                  <div className="guide-item">
                    <div className="guide-num">2</div>
                    <div className="guide-text">
                      <strong>Add a display source</strong>
                      Click "Add Display Source" in the left panel and pick a tab, window, or full screen.
                      Tick "Share tab audio" if you want system audio captured.
                    </div>
                  </div>
                  <div className="guide-item">
                    <div className="guide-num">3</div>
                    <div className="guide-text">
                      <strong>Configure the audio mix</strong>
                      Toggle the Microphone and System channels in the right-side mixer.
                      Watch the meters to confirm levels are healthy before going live.
                    </div>
                  </div>
                  <div className="guide-item">
                    <div className="guide-num">4</div>
                    <div className="guide-text">
                      <strong>Record locally</strong>
                      Hit "Record" to capture a high-quality file. Click "Stop", then "Download".
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-foot">
                <button className="btn-primary" onClick={() => setShowGuide(false)}>
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Stage frame – pure-CSS aspect-ratio sizing.
// We deliberately avoid ResizeObserver / setState here: storing computed
// size in state caused a feedback loop where the frame's own size change
// re-fired the observer, producing visible jitter on every frame.
// ─────────────────────────────────────────────────────────────────────
function StageFrame({ children, isRecording, preset }) {
  const aspect = `${preset.width} / ${preset.height}`;
  return (
    <div
      className={`stage-frame ${isRecording ? 'live' : ''}`}
      style={{ aspectRatio: aspect }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Clock – isolated so its 1Hz re-render does not propagate to the
// rest of the app tree (which had been a source of visible flicker).
// ─────────────────────────────────────────────────────────────────────
function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const txt = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return <span>UTC {txt}</span>;
}