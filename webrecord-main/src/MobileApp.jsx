import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Video,
  StopCircle,
  Download,
  RotateCcw,
  Mic,
  MicOff,
  Monitor,
  AlertTriangle,
  HelpCircle,
  X,
  Camera,
  Wifi,
} from 'lucide-react';
import { detectPlatform } from './useIsMobile.js';

// ───────────────────────────────────────────────────────────────────────────
// Styles – self-contained, dark mobile-broadcast aesthetic.
// Inlined the same way App.jsx does it so the mobile build pulls no extra CSS.
// ───────────────────────────────────────────────────────────────────────────
const STYLES = `
  .m-app {
    --bg-0: #0a0a0c;
    --bg-1: #14141a;
    --bg-2: #1d1d26;
    --bg-3: #2a2a36;
    --line: #2d2d3a;
    --line-soft: #232330;
    --text-0: #f4f4f8;
    --text-1: #b4b4c4;
    --text-2: #7a7a8c;
    --text-3: #4a4a5c;
    --accent: #ff3b3b;
    --accent-dim: #c92828;
    --accent-glow: rgba(255,59,59,0.35);
    --signal: #00d8a7;
    --warn: #f59e0b;
    --info: #4d9fff;

    min-height: 100vh;
    min-height: 100dvh;
    background: var(--bg-0);
    color: var(--text-0);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: fixed;
    inset: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .m-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--line-soft);
    background: var(--bg-1);
  }
  .m-header-title {
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .m-header-title .pulse-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--signal);
    box-shadow: 0 0 8px var(--signal);
  }
  .m-icon-btn {
    background: transparent;
    border: 1px solid var(--line);
    color: var(--text-1);
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .m-icon-btn:active { background: var(--bg-3); transform: scale(0.95); }

  /* Mode tabs */
  .m-mode-tabs {
    display: flex;
    gap: 6px;
    padding: 12px 14px 0;
  }
  .m-mode-tab {
    flex: 1;
    padding: 11px 8px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--bg-1);
    color: var(--text-1);
    font-size: 0.78rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .m-mode-tab.active {
    background: var(--bg-3);
    color: var(--text-0);
    border-color: var(--text-3);
  }
  .m-mode-tab.disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }

  /* Stage / preview */
  .m-stage {
    flex: 1;
    margin: 14px;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 14px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  .m-stage.live {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent), 0 0 24px rgba(255,59,59,0.2);
  }
  .m-preview-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000;
  }
  .m-preview-empty {
    text-align: center;
    color: var(--text-2);
    padding: 24px;
  }
  .m-preview-empty .big-icon {
    margin: 0 auto 14px;
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: var(--bg-2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-1);
  }
  .m-preview-empty h3 {
    font-size: 1rem;
    color: var(--text-0);
    margin: 0 0 6px;
    font-weight: 600;
  }
  .m-preview-empty p {
    font-size: 0.82rem;
    margin: 0;
    line-height: 1.4;
  }

  /* HUD overlays */
  .m-hud-tl, .m-hud-tr, .m-hud-bl, .m-hud-br {
    position: absolute;
    display: flex;
    gap: 6px;
    padding: 10px;
  }
  .m-hud-tl { top: 0; left: 0; }
  .m-hud-tr { top: 0; right: 0; }
  .m-hud-bl { bottom: 0; left: 0; }
  .m-hud-br { bottom: 0; right: 0; }

  .m-hud-tag {
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.12);
    color: white;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 5px 9px;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .m-hud-tag.rec { color: var(--accent); border-color: rgba(255,59,59,0.5); }
  .m-hud-tag.rec::before {
    content: '';
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent);
    animation: mdot 1.1s infinite;
  }
  @keyframes mdot { 50% { opacity: 0.25; } }

  /* iOS warning */
  .m-warning {
    margin: 14px;
    padding: 14px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.35);
    border-radius: 10px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    color: #ffd58a;
    font-size: 0.78rem;
    line-height: 1.45;
  }
  .m-warning strong { color: var(--warn); display: block; margin-bottom: 3px; font-size: 0.83rem; }

  /* Control row above the record button */
  .m-controls {
    display: flex;
    gap: 8px;
    padding: 0 14px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .m-pill {
    background: var(--bg-2);
    border: 1px solid var(--line);
    color: var(--text-1);
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .m-pill:active { transform: scale(0.96); }
  .m-pill.on { background: rgba(0,216,167,0.12); color: var(--signal); border-color: rgba(0,216,167,0.4); }
  .m-pill.off { color: var(--text-3); }
  .m-pill:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Bottom action bar */
  .m-actions {
    padding: 14px 14px calc(20px + env(safe-area-inset-bottom));
    background: var(--bg-1);
    border-top: 1px solid var(--line-soft);
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .m-rec-btn {
    flex: 1;
    height: 56px;
    border-radius: 14px;
    border: none;
    background: linear-gradient(180deg, var(--accent) 0%, var(--accent-dim) 100%);
    color: white;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    box-shadow: 0 6px 18px var(--accent-glow);
    transition: all 0.15s ease;
  }
  .m-rec-btn:active { transform: scale(0.98); }
  .m-rec-btn:disabled {
    background: var(--bg-3);
    color: var(--text-3);
    box-shadow: none;
    cursor: not-allowed;
  }
  .m-rec-btn.stopping {
    background: linear-gradient(180deg, #2a2a36 0%, #1d1d26 100%);
    color: var(--accent);
    border: 1px solid var(--accent);
  }
  .m-rec-btn .rec-glyph {
    width: 16px; height: 16px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 0 0 3px rgba(255,255,255,0.25);
  }
  .m-rec-btn.stopping .rec-glyph {
    border-radius: 3px;
    background: var(--accent);
    box-shadow: none;
  }

  .m-download-btn {
    height: 56px;
    width: 56px;
    border-radius: 14px;
    border: 1px solid var(--signal);
    background: rgba(0,216,167,0.1);
    color: var(--signal);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .m-download-btn:active { transform: scale(0.96); }

  /* Status strip */
  .m-status-strip {
    display: flex;
    gap: 8px;
    padding: 0 14px 10px;
    font-size: 0.7rem;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    color: var(--text-3);
  }
  .m-status-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .m-status-item.live { color: var(--accent); }
  .m-status-item.ok { color: var(--signal); }
  .m-status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .m-timer {
    margin-left: auto;
    color: var(--text-1);
    font-weight: 600;
  }
  .m-timer.live { color: var(--accent); animation: mdot 1.2s infinite; }

  /* Guide modal */
  .m-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .m-modal {
    background: var(--bg-1);
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    border-top: 1px solid var(--line);
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    padding: 20px 18px calc(24px + env(safe-area-inset-bottom));
    animation: slideUp 0.22s ease;
  }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  .m-modal h2 {
    margin: 0 0 14px;
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .m-modal-close {
    float: right;
    background: transparent;
    border: none;
    color: var(--text-2);
    cursor: pointer;
  }
  .m-guide-list { display: flex; flex-direction: column; gap: 12px; }
  .m-guide-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 0.83rem;
    line-height: 1.45;
    color: var(--text-1);
  }
  .m-guide-num {
    flex: none;
    width: 24px; height: 24px;
    border-radius: 50%;
    background: var(--bg-3);
    color: var(--text-0);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
  }
  .m-guide-item strong { color: var(--text-0); display: block; }

  .m-error {
    margin: 0 14px 12px;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(255,59,59,0.1);
    border: 1px solid rgba(255,59,59,0.35);
    color: #ffb4b4;
    font-size: 0.78rem;
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
`;

// Probe the best supported MIME type for MediaRecorder.
// MP4/H.264 is preferred on iOS Safari; Chromium-based browsers will fall
// through to one of the WebM variants.
function pickMimeType() {
  const candidates = [
    'video/mp4;codecs=h264,aac',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' &&
        MediaRecorder.isTypeSupported &&
        MediaRecorder.isTypeSupported(c)) {
      return c;
    }
  }
  return '';
}

function fileExtFromMime(mime) {
  if (!mime) return 'webm';
  if (mime.startsWith('video/mp4')) return 'mp4';
  return 'webm';
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

// ───────────────────────────────────────────────────────────────────────────
// Mobile App
// ───────────────────────────────────────────────────────────────────────────
export default function MobileApp() {
  const platform = useMemo(() => detectPlatform(), []);
  const tabCaptureSupported = useMemo(() => {
    // Only Android has even a partial getDisplayMedia implementation.
    // (And even there, only Chrome/Edge; Firefox Android doesn't.)
    return platform === 'android' &&
           typeof navigator !== 'undefined' &&
           typeof navigator.mediaDevices?.getDisplayMedia === 'function';
  }, [platform]);

  // 'camera' or 'tab'
  const [mode, setMode] = useState('camera');

  // Capture state
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const [sourceActive, setSourceActive] = useState(false);
  const [error, setError] = useState('');

  // Camera options
  const [facing, setFacing] = useState('user'); // 'user' or 'environment'
  const [micOn, setMicOn] = useState(true);

  // Recording state
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mimeRef = useRef('');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const recordedUrlRef = useRef(null);

  const [showGuide, setShowGuide] = useState(false);

  // Recording timer
  useEffect(() => {
    if (!isRecording) {
      setElapsed(0);
      return;
    }
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // Clean up object URL when a new one replaces it or the component unmounts.
  useEffect(() => {
    return () => {
      if (recordedUrlRef.current) {
        URL.revokeObjectURL(recordedUrlRef.current);
        recordedUrlRef.current = null;
      }
    };
  }, []);

  // Stop everything when unmounting (e.g. user rotates to landscape and the
  // viewport hook flips us back to the desktop UI mid-session).
  useEffect(() => {
    return () => {
      try { recorderRef.current?.stop(); } catch {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Auto-switch mode: if the user is on iOS and the tab is somehow selected,
  // force them back to camera.
  useEffect(() => {
    if (mode === 'tab' && !tabCaptureSupported) setMode('camera');
  }, [mode, tabCaptureSupported]);

  // ── Source acquisition ───────────────────────────────────────────────
  const stopSource = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setSourceActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError('');
    // Stop any prior stream first (e.g. when flipping the camera).
    stopSource();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: micOn,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // avoid feedback during preview
        await videoRef.current.play().catch(() => {});
      }
      stream.getVideoTracks()[0]?.addEventListener('ended', () => stopSource());
      setSourceActive(true);
    } catch (err) {
      console.warn('Camera start failed:', err);
      if (err && err.name === 'NotAllowedError') {
        setError('Camera permission was denied. Allow access in your browser settings and try again.');
      } else if (err && err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError(err?.message || 'Could not start the camera.');
      }
    }
  }, [facing, micOn, stopSource]);

  const startTabCapture = useCallback(async () => {
    setError('');
    stopSource();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true, // some Android Chrome versions support tab audio
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => {});
      }
      stream.getVideoTracks()[0]?.addEventListener('ended', () => stopSource());
      setSourceActive(true);
    } catch (err) {
      console.warn('Tab capture failed:', err);
      if (err && err.name === 'NotAllowedError') {
        setError('Tab-share permission was denied.');
      } else {
        setError(err?.message || 'Tab capture is not available on this device.');
      }
    }
  }, [stopSource]);

  const handleStartSource = () => {
    if (mode === 'camera') startCamera();
    else if (mode === 'tab') startTabCapture();
  };

  const flipCamera = useCallback(async () => {
    if (mode !== 'camera') return;
    const nextFacing = facing === 'user' ? 'environment' : 'user';
    setFacing(nextFacing);
    if (sourceActive) {
      // re-acquire with the new facing mode
      // (setFacing is async-ish; pass the value explicitly)
      try {
        stopSource();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: nextFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: micOn,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          await videoRef.current.play().catch(() => {});
        }
        stream.getVideoTracks()[0]?.addEventListener('ended', () => stopSource());
        setSourceActive(true);
      } catch (err) {
        console.warn('Camera flip failed:', err);
        setError('Could not flip camera. Your device may only have one.');
      }
    }
  }, [facing, micOn, mode, sourceActive, stopSource]);

  // ── Recording ─────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    setError('');

    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
      setRecordedUrl(null);
    }

    const mimeType = pickMimeType();
    mimeRef.current = mimeType;

    const opts = {
      videoBitsPerSecond: 4_500_000,
      audioBitsPerSecond: 128_000,
    };
    if (mimeType) opts.mimeType = mimeType;

    chunksRef.current = [];

    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, opts);
    } catch (err) {
      console.warn('MediaRecorder construct failed:', err);
      // Last-ditch: try with no mimeType hint.
      try {
        recorder = new MediaRecorder(streamRef.current);
        mimeRef.current = '';
      } catch (err2) {
        setError('This browser does not support recording the active source.');
        return;
      }
    }

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const finalMime = mimeRef.current || 'video/webm';
      const blob = new Blob(chunksRef.current, { type: finalMime });
      const url = URL.createObjectURL(blob);
      recordedUrlRef.current = url;
      setRecordedUrl(url);
      setIsRecording(false);
    };
    recorder.onerror = (e) => {
      console.warn('Recorder error:', e);
      setError('Recording stopped because of an error.');
      setIsRecording(false);
    };

    recorderRef.current = recorder;
    recorder.start(1000);
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    try {
      recorderRef.current?.stop();
    } catch (err) {
      console.warn('Stop failed:', err);
    }
  }, []);

  const downloadVideo = useCallback(() => {
    if (!recordedUrl) return;
    const ext = fileExtFromMime(mimeRef.current);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const a = document.createElement('a');
    a.href = recordedUrl;
    a.download = `eduboard-${ts}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [recordedUrl]);

  // ── Render ───────────────────────────────────────────────────────────
  const showIOSWarning = platform === 'ios' && mode === 'tab';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="m-app">
        <div className="m-header">
          <div className="m-header-title">
            <span className="pulse-dot"></span>
            Eduboard Mobile
          </div>
          <button
            className="m-icon-btn"
            onClick={() => setShowGuide(true)}
            aria-label="Open guide"
          >
            <HelpCircle size={18} />
          </button>
        </div>

        <div className="m-mode-tabs">
          <button
            className={`m-mode-tab ${mode === 'camera' ? 'active' : ''}`}
            onClick={() => {
              if (isRecording) return;
              if (mode !== 'camera') { stopSource(); setMode('camera'); }
            }}
            disabled={isRecording}
          >
            <Camera size={14} /> Camera
          </button>
          <button
            className={`m-mode-tab ${mode === 'tab' ? 'active' : ''} ${!tabCaptureSupported ? 'disabled' : ''}`}
            onClick={() => {
              if (isRecording) return;
              if (!tabCaptureSupported) return;
              if (mode !== 'tab') { stopSource(); setMode('tab'); }
            }}
            disabled={!tabCaptureSupported || isRecording}
            title={!tabCaptureSupported ? 'Tab capture is not available on this device' : ''}
          >
            <Monitor size={14} /> Tab
            {!tabCaptureSupported && platform === 'ios' && (
              <span style={{ fontSize: '0.62rem', opacity: 0.7, marginLeft: 3 }}>(iOS not supported)</span>
            )}
          </button>
        </div>

        {showIOSWarning && (
          <div className="m-warning">
            <AlertTriangle size={16} style={{ flex: 'none', marginTop: 1 }} />
            <div>
              <strong>iOS doesn't allow this</strong>
              Apple restricts screen capture to native apps. Use Camera mode here, or open Eduboard on a desktop browser for full screen recording.
            </div>
          </div>
        )}

        {error && (
          <div className="m-error">
            <AlertTriangle size={14} style={{ flex: 'none', marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        <div className={`m-stage ${isRecording ? 'live' : ''}`}>
          {sourceActive ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="m-preview-video"
                style={{
                  // mirror selfie cam for natural preview, but only the preview;
                  // recording stream keeps original orientation.
                  transform: mode === 'camera' && facing === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />
              <div className="m-hud-tl">
                {isRecording && (
                  <div className="m-hud-tag rec">REC {formatTime(elapsed)}</div>
                )}
              </div>
              <div className="m-hud-tr">
                <div className="m-hud-tag">
                  {mode === 'camera' ? (facing === 'user' ? 'FRONT' : 'BACK') : 'TAB'}
                </div>
              </div>
            </>
          ) : (
            <div className="m-preview-empty">
              <div className="big-icon">
                {mode === 'camera' ? <Camera size={26} /> : <Monitor size={26} />}
              </div>
              <h3>
                {mode === 'camera' ? 'Camera not started' : 'No tab selected'}
              </h3>
              <p>
                {mode === 'camera'
                  ? 'Tap Start to use your front or back camera.'
                  : 'Tap Start to pick which browser tab to record.'}
              </p>
            </div>
          )}
        </div>

        <div className="m-status-strip">
          <div className={`m-status-item ${sourceActive ? 'ok' : ''}`}>
            <div className="m-status-dot"></div>
            {sourceActive ? 'SOURCE READY' : 'SOURCE OFFLINE'}
          </div>
          <div className={`m-status-item ${isRecording ? 'live' : ''}`}>
            <div className="m-status-dot"></div>
            REC {isRecording ? 'ACTIVE' : 'IDLE'}
          </div>
          <div className={`m-timer ${isRecording ? 'live' : ''}`}>
            {isRecording ? formatTime(elapsed) : '00:00'}
          </div>
        </div>

        <div className="m-controls">
          {mode === 'camera' && (
            <>
              <button
                className={`m-pill ${micOn ? 'on' : 'off'}`}
                onClick={() => {
                  const next = !micOn;
                  setMicOn(next);
                  // Toggle the live audio track if a stream is already running.
                  streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
                }}
                disabled={isRecording}
              >
                {micOn ? <Mic size={13} /> : <MicOff size={13} />}
                {micOn ? 'Mic on' : 'Mic off'}
              </button>
              <button
                className="m-pill"
                onClick={flipCamera}
                disabled={isRecording}
                title="Switch front / back camera"
              >
                <RotateCcw size={13} />
                Flip
              </button>
            </>
          )}
          {mode === 'tab' && tabCaptureSupported && (
            <div className="m-pill on" style={{ pointerEvents: 'none' }}>
              <Wifi size={13} /> Android tab capture
            </div>
          )}
          {!sourceActive && (
            <button
              className="m-pill on"
              onClick={handleStartSource}
              style={{ marginLeft: 'auto' }}
            >
              <Video size={13} /> Start {mode === 'camera' ? 'camera' : 'tab capture'}
            </button>
          )}
          {sourceActive && !isRecording && (
            <button
              className="m-pill"
              onClick={stopSource}
              style={{ marginLeft: 'auto' }}
            >
              <X size={13} /> Stop source
            </button>
          )}
        </div>

        <div className="m-actions">
          {!isRecording ? (
            <button
              className="m-rec-btn"
              onClick={startRecording}
              disabled={!sourceActive}
            >
              <span className="rec-glyph"></span>
              Record
            </button>
          ) : (
            <button className="m-rec-btn stopping" onClick={stopRecording}>
              <StopCircle size={20} />
              Stop · {formatTime(elapsed)}
            </button>
          )}
          {recordedUrl && !isRecording && (
            <button
              className="m-download-btn"
              onClick={downloadVideo}
              aria-label="Download last recording"
            >
              <Download size={22} />
            </button>
          )}
        </div>

        {showGuide && (
          <div className="m-modal-overlay" onClick={() => setShowGuide(false)}>
            <div className="m-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="m-modal-close"
                onClick={() => setShowGuide(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <h2><HelpCircle size={18} color="var(--info)" /> Quick Start</h2>

              <div className="m-guide-list">
                <div className="m-guide-item">
                  <div className="m-guide-num">1</div>
                  <div>
                    <strong>Pick a mode</strong>
                    Camera works on every phone. Tab capture works on Android Chrome only — iPhones can't do this in any browser.
                  </div>
                </div>
                <div className="m-guide-item">
                  <div className="m-guide-num">2</div>
                  <div>
                    <strong>Tap "Start camera" or "Start tab capture"</strong>
                    Allow the camera or screen-share permission when prompted.
                  </div>
                </div>
                <div className="m-guide-item">
                  <div className="m-guide-num">3</div>
                  <div>
                    <strong>Tap the red Record button</strong>
                    Recording happens entirely on this device. Nothing is uploaded.
                  </div>
                </div>
                <div className="m-guide-item">
                  <div className="m-guide-num">4</div>
                  <div>
                    <strong>Tap Stop, then Download</strong>
                    You'll get an .mp4 (iOS) or .webm (Android) you can save or share from your phone's Files app.
                  </div>
                </div>
                <div className="m-guide-item">
                  <div className="m-guide-num">5</div>
                  <div>
                    <strong>Need full screen recording on iPhone?</strong>
                    Use the built-in iOS Screen Recording (Control Center) — no web app on any platform can do that.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
