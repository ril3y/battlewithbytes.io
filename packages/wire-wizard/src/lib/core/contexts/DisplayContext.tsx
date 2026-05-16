import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * DisplayContext - Manages display settings for the wiring diagram
 *
 * Eliminates prop drilling for:
 * - showConnectionLabels
 * - showNetNames
 * - showBusNames
 * - sidebarOpen
 */

interface DisplaySettings {
  showConnectionLabels: boolean;
  showNetNames: boolean;
  showBusNames: boolean;
  sidebarOpen: boolean;
}

interface DisplayContextValue extends DisplaySettings {
  setShowConnectionLabels: (value: boolean) => void;
  setShowNetNames: (value: boolean) => void;
  setShowBusNames: (value: boolean) => void;
  setSidebarOpen: (value: boolean) => void;
  toggleSidebar: () => void;
}

const DisplayContext = createContext<DisplayContextValue | null>(null);

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showConnectionLabels: true,
  showNetNames: true,
  showBusNames: true,
  sidebarOpen: false,
};

interface DisplayProviderProps {
  children: ReactNode;
  initialSettings?: Partial<DisplaySettings>;
}

export function DisplayProvider({ children, initialSettings }: DisplayProviderProps) {
  const [showConnectionLabels, setShowConnectionLabels] = useState(
    initialSettings?.showConnectionLabels ?? DEFAULT_DISPLAY_SETTINGS.showConnectionLabels
  );
  const [showNetNames, setShowNetNames] = useState(
    initialSettings?.showNetNames ?? DEFAULT_DISPLAY_SETTINGS.showNetNames
  );
  const [showBusNames, setShowBusNames] = useState(
    initialSettings?.showBusNames ?? DEFAULT_DISPLAY_SETTINGS.showBusNames
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    initialSettings?.sidebarOpen ?? DEFAULT_DISPLAY_SETTINGS.sidebarOpen
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const value: DisplayContextValue = {
    showConnectionLabels,
    showNetNames,
    showBusNames,
    sidebarOpen,
    setShowConnectionLabels,
    setShowNetNames,
    setShowBusNames,
    setSidebarOpen,
    toggleSidebar,
  };

  return (
    <DisplayContext.Provider value={value}>
      {children}
    </DisplayContext.Provider>
  );
}

export function useDisplay(): DisplayContextValue {
  const context = useContext(DisplayContext);
  if (!context) {
    throw new Error('useDisplay must be used within a DisplayProvider');
  }
  return context;
}

// Convenience hook for just reading display settings (no setters)
export function useDisplaySettings(): DisplaySettings {
  const { showConnectionLabels, showNetNames, showBusNames, sidebarOpen } = useDisplay();
  return { showConnectionLabels, showNetNames, showBusNames, sidebarOpen };
}
