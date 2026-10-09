import DesktopApp from './DesktopApp.jsx';
import MobileApp from './MobileApp.jsx';
import { useIsMobile } from './useIsMobile.js';

// Top-level component: routes to either the desktop console UI or the
// mobile-friendly screen depending on viewport / user agent. Both share
// the same dependency surface (React, lucide-react) so the chunked
// bundle barely changes vs. just shipping one.
export default function App() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileApp /> : <DesktopApp />;
}
