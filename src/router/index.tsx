import { HashRouter, Route, Routes } from 'react-router-dom';
import Splash from '@/pages/Splash';
import Home from '@/pages/Home';
import Selection from '@/pages/Selection';
import WheelPage from '@/pages/Wheel';
import HistoryPage from '@/pages/History';
import StatisticsPage from '@/pages/Statistics';
import SettingsPage from '@/pages/Settings';
import SharePage from '@/pages/Share';

/**
 * PRD 2.2 – App Structure: flat Home Hub navigation, no bottom nav / hamburger.
 * HashRouter is used so routing keeps working when the built app is loaded
 * from a file:// / capacitor:// origin (Android/iOS/PWA), not just an HTTP server.
 */
export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/select/:category" element={<Selection />} />
        <Route path="/wheel/:category" element={<WheelPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/share" element={<SharePage />} />
      </Routes>
    </HashRouter>
  );
}
