import { useEffect, useState } from 'react';

/**
 * Detect whether to render the mobile UI.
 *
 * Trigger conditions (any one is enough):
 *  - viewport width <= breakpoint (default 768px), OR
 *  - userAgent looks like a phone/tablet AND it isn't a desktop browser with
 *    a touch screen attached.
 *
 * The hook listens for resize / orientation changes so flipping the phone
 * doesn't strand the user on the wrong layout.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => detect(breakpoint));

  useEffect(() => {
    let raf = 0;
    const onChange = () => {
      // Coalesce rapid resize events.
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIsMobile(detect(breakpoint)));
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
  }, [breakpoint]);

  return isMobile;
}

function detect(breakpoint) {
  if (typeof window === 'undefined') return false;
  const narrow = window.innerWidth <= breakpoint;
  const ua = navigator.userAgent || '';
  const uaIsMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const uaIsIpad = /iPad/i.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document);
  // We want the mobile UI on phones always, and on narrow viewports.
  // iPads default to the desktop UI unless the viewport is narrow,
  // because the desktop layout fits fine on a 1024-wide tablet.
  return narrow || (uaIsMobile && !uaIsIpad);
}

/**
 * Returns a coarse platform string useful for branching on capability:
 *  'ios'      — iPhone or iPad (no getDisplayMedia support, ever)
 *  'android'  — Android phone or tablet (tab capture works in Chrome)
 *  'desktop'  — everything else
 */
export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  // iPadOS 13+ reports as Macintosh; the touch check distinguishes it from a Mac.
  if (/iPhone|iPod/i.test(ua)) return 'ios';
  if (/iPad/i.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}
