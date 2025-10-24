'use client';

import { useEffect, useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

/**
 * Wrapper component that conditionally shows Navigation and Footer
 * based on whether the app is running in PWA standalone mode
 */
export default function StandaloneWrapper({ children }: { children: React.ReactNode }) {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone;
    const isAndroidApp = document.referrer.includes('android-app://');

    const standalone = isDisplayStandalone || isIOSStandalone || isAndroidApp;
    setIsStandalone(standalone);
  }, []);

  return (
    <>
      {!isStandalone && <Navigation />}
      <div className={isStandalone ? 'flex-grow' : 'pt-16 flex-grow'}>
        {children}
      </div>
      {!isStandalone && <Footer />}
    </>
  );
}
