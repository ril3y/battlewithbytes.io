'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';

/**
 * Wrapper component that conditionally shows Navigation and Footer
 * based on whether the app is running in PWA standalone mode or on specific routes
 */
export default function StandaloneWrapper({ children }: { children: React.ReactNode }) {
  const [isStandalone, setIsStandalone] = useState(false);
  const pathname = usePathname();

  // Routes that should be full-screen without navigation/footer
  const fullscreenRoutes = ['/tools/ucan'];
  const isFullscreenRoute = fullscreenRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone;
    const isAndroidApp = document.referrer.includes('android-app://');

    const standalone = isDisplayStandalone || isIOSStandalone || isAndroidApp;
    setIsStandalone(standalone);
  }, []);

  // Hide navigation/footer if standalone OR on a fullscreen route
  const shouldHideNavigation = isStandalone || isFullscreenRoute;

  return (
    <>
      {!shouldHideNavigation && <Navigation />}
      <div className={shouldHideNavigation ? 'flex-grow' : 'pt-16 flex-grow'}>
        {children}
      </div>
      {!shouldHideNavigation && <Footer />}
    </>
  );
}
