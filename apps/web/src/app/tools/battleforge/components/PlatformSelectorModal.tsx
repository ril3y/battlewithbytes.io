'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlatformRegistry, PlatformEntry, PlatformFamily, DeviceEntry, SelectedPlatform, FrameworkSupport } from '../lib/platform/types';

interface PlatformSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selection: SelectedPlatform) => void;
  currentSelection?: SelectedPlatform | null;
}

export function PlatformSelectorModal({
  isOpen,
  onClose,
  onSelect,
  currentSelection
}: PlatformSelectorModalProps) {
  const [registry, setRegistry] = useState<PlatformRegistry | null>(null);
  const [families, setFamilies] = useState<Map<string, PlatformFamily>>(new Map());

  // Current selections
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformEntry | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<PlatformFamily | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceEntry | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<FrameworkSupport | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load registry on mount
  useEffect(() => {
    if (isOpen && !registry) {
      loadRegistry();
    }
  }, [isOpen, registry]);

  // Pre-populate from current selection when modal opens
  useEffect(() => {
    if (isOpen && registry && currentSelection) {
      const platform = registry.platforms.find(p => p.id === currentSelection.platformId);
      if (platform) {
        setSelectedPlatform(platform);
        // Load families for this platform
        loadFamiliesForPlatform(platform).then(() => {
          setSelectedFamily(currentSelection.family);
          setSelectedDevice(currentSelection.device);
          // Set framework from current selection
          if (currentSelection.frameworkId && currentSelection.family.frameworks) {
            const fw = currentSelection.family.frameworks.find(f => f.frameworkId === currentSelection.frameworkId);
            setSelectedFramework(fw || null);
          } else if (currentSelection.family.frameworks?.length) {
            // Default to native
            const native = currentSelection.family.frameworks.find(f => f.frameworkId === 'native');
            setSelectedFramework(native || currentSelection.family.frameworks[0]);
          }
        });
      }
    } else if (isOpen && !currentSelection) {
      // Reset to defaults
      setSelectedPlatform(null);
      setSelectedFamily(null);
      setSelectedDevice(null);
      setSelectedFramework(null);
    }
  }, [isOpen, currentSelection, registry]);

  const loadRegistry = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/platforms/registry.json');
      if (!response.ok) throw new Error('Failed to load platform registry');
      const data = await response.json();
      setRegistry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadFamiliesForPlatform = async (platform: PlatformEntry) => {
    setLoading(true);
    for (const familyId of platform.families) {
      const cacheKey = `${platform.id}/${familyId}`;
      if (!families.has(cacheKey)) {
        try {
          const response = await fetch(`/platforms/${platform.id}/${familyId}/family.json`);
          if (response.ok) {
            const data = await response.json();
            setFamilies(prev => new Map(prev).set(cacheKey, data));
          }
        } catch (err) {
          console.error('Failed to load family:', err);
        }
      }
    }
    setLoading(false);
  };

  const handlePlatformSelect = useCallback(async (platform: PlatformEntry) => {
    if (!platform.supported) return;

    setSelectedPlatform(platform);
    setSelectedFamily(null);
    setSelectedDevice(null);
    setSelectedFramework(null);

    await loadFamiliesForPlatform(platform);
  }, [families]);

  const handleFamilySelect = useCallback((family: PlatformFamily) => {
    setSelectedFamily(family);
    setSelectedDevice(null);
    // Auto-select native framework if available
    if (family.frameworks?.length) {
      const native = family.frameworks.find(f => f.frameworkId === 'native');
      setSelectedFramework(native || family.frameworks[0]);
    } else {
      setSelectedFramework(null);
    }
  }, []);

  const handleDeviceSelect = useCallback((device: DeviceEntry) => {
    setSelectedDevice(device);
  }, []);

  const handleFrameworkSelect = useCallback((framework: FrameworkSupport) => {
    setSelectedFramework(framework);
  }, []);

  const handleApply = useCallback(() => {
    if (!selectedPlatform || !selectedFamily || !selectedDevice) return;

    const archConfigs: Record<string, { target: string; cpu: string; fpu?: string; float?: string; libPath: string }> = {
      'cortex-m0': { target: 'thumbv6m-none-eabi', cpu: 'cortex-m0', libPath: 'cortex-m0' },
      'cortex-m0+': { target: 'thumbv6m-none-eabi', cpu: 'cortex-m0plus', libPath: 'cortex-m0' },
      'cortex-m3': { target: 'thumbv7m-none-eabi', cpu: 'cortex-m3', libPath: 'cortex-m3' },
      'cortex-m4': { target: 'thumbv7em-none-eabi', cpu: 'cortex-m4', libPath: 'cortex-m4' },
      'cortex-m4f': { target: 'thumbv7em-none-eabihf', cpu: 'cortex-m4', fpu: 'fpv4-sp-d16', float: 'hard', libPath: 'cortex-m4f' },
      'cortex-m7': { target: 'thumbv7em-none-eabi', cpu: 'cortex-m7', libPath: 'cortex-m7' },
      'cortex-m7f': { target: 'thumbv7em-none-eabihf', cpu: 'cortex-m7', fpu: 'fpv5-d16', float: 'hard', libPath: 'cortex-m7f' },
    };

    const archConfig = archConfigs[selectedFamily.architecture] || archConfigs['cortex-m3'];

    onSelect({
      platformId: selectedPlatform.id,
      familyId: selectedFamily.id,
      deviceId: selectedDevice.id,
      family: selectedFamily,
      device: selectedDevice,
      archConfig,
      frameworkId: selectedFramework?.frameworkId || 'native',
    });
    onClose();
  }, [selectedPlatform, selectedFamily, selectedDevice, selectedFramework, onSelect, onClose]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canApply = selectedPlatform && selectedFamily && selectedDevice;

  // Get available families for selected platform
  const availableFamilies = selectedPlatform
    ? selectedPlatform.families
        .map(fid => families.get(`${selectedPlatform.id}/${fid}`))
        .filter((f): f is PlatformFamily => f !== undefined)
    : [];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Configure Target Platform</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && !registry && (
            <div className="loading">
              <div className="spinner" />
              <span>Loading platforms...</span>
            </div>
          )}

          {error && (
            <div className="error-box">
              <span>{error}</span>
              <button onClick={loadRegistry}>Retry</button>
            </div>
          )}

          {registry && (
            <>
              {/* Platform Selection */}
              <div className="section">
                <label className="section-label">Platform</label>
                <div className="platform-row">
                  {registry.platforms.map(platform => (
                    <button
                      key={platform.id}
                      className={`platform-btn ${selectedPlatform?.id === platform.id ? 'selected' : ''} ${!platform.supported ? 'disabled' : ''}`}
                      onClick={() => handlePlatformSelect(platform)}
                      disabled={!platform.supported}
                    >
                      <div className="platform-icon">
                        {platform.id === 'stm32' && (
                          <img src="/platforms/icons/st.ico" alt="STMicroelectronics" />
                        )}
                        {platform.id === 'esp32' && (
                          <img src="/platforms/icons/espressif.png" alt="Espressif" />
                        )}
                        {platform.id === 'nrf' && (
                          <img src="/platforms/icons/nordic.png" alt="Nordic Semiconductor" />
                        )}
                        {platform.id === 'rp2040' && (
                          <img src="/platforms/icons/raspberrypi.png" alt="Raspberry Pi" />
                        )}
                      </div>
                      <span className="platform-name">{platform.name}</span>
                      {platform.comingSoon && <span className="coming-soon-badge">Soon</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Selection */}
              {selectedPlatform && (
                <div className="section">
                  <label className="section-label">Family</label>
                  {loading ? (
                    <div className="inline-loading">Loading families...</div>
                  ) : availableFamilies.length > 0 ? (
                    <div className="family-row">
                      {availableFamilies.map(family => (
                        <button
                          key={family.id}
                          className={`family-btn ${selectedFamily?.id === family.id ? 'selected' : ''}`}
                          onClick={() => handleFamilySelect(family)}
                        >
                          <span className="family-name">{family.name}</span>
                          <span className="family-arch">{family.architecture}</span>
                          <span className="family-devices">{family.devices.length} devices</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data">No families available</div>
                  )}
                </div>
              )}

              {/* Device Selection */}
              {selectedFamily && (
                <div className="section">
                  <label className="section-label">Device</label>
                  <div className="device-grid">
                    {selectedFamily.devices.map(device => (
                      <button
                        key={device.id}
                        className={`device-btn ${selectedDevice?.id === device.id ? 'selected' : ''}`}
                        onClick={() => handleDeviceSelect(device)}
                      >
                        <span className="device-name">{device.name}</span>
                        <span className="device-desc">{device.description}</span>
                        <div className="device-specs">
                          <span className="spec">{formatBytes(device.flash)} Flash</span>
                          <span className="spec">{formatBytes(device.ram)} RAM</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Framework Selection */}
              {selectedDevice && selectedFamily?.frameworks && selectedFamily.frameworks.length > 0 && (
                <div className="section">
                  <label className="section-label">Framework</label>
                  <div className="framework-row">
                    {selectedFamily.frameworks.filter(f => f.enabled).map(fw => (
                      <button
                        key={fw.frameworkId}
                        className={`framework-btn ${selectedFramework?.frameworkId === fw.frameworkId ? 'selected' : ''}`}
                        onClick={() => handleFrameworkSelect(fw)}
                      >
                        <div className="framework-header">
                          <span className="framework-icon">
                            {fw.frameworkId === 'native' && '⚡'}
                            {fw.frameworkId === 'arduino' && '🔵'}
                            {fw.frameworkId === 'mbed' && '🟠'}
                            {fw.frameworkId === 'zephyr' && '🟣'}
                          </span>
                          <span className="framework-name">{fw.framework.name}</span>
                        </div>
                        <span className="framework-desc">{fw.framework.description}</span>
                        <span className="framework-version">v{fw.version}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection Summary */}
              {canApply && (
                <div className="summary-bar">
                  <div className="summary-path">
                    <span>{selectedPlatform!.name}</span>
                    <span className="sep">→</span>
                    <span>{selectedFamily!.name}</span>
                    <span className="sep">→</span>
                    <span className="highlight">{selectedDevice!.name}</span>
                    {selectedFramework && (
                      <>
                        <span className="sep">→</span>
                        <span className={`framework-badge ${selectedFramework.frameworkId}`}>
                          {selectedFramework.framework.name}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="summary-stats">
                    <span>{formatBytes(selectedDevice!.flash)} Flash</span>
                    <span>{formatBytes(selectedDevice!.ram)} RAM</span>
                    <span>{selectedFamily!.architecture}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="apply-btn"
            onClick={handleApply}
            disabled={!canApply}
          >
            Apply
          </button>
        </div>

        <style jsx global>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }

          .modal-content {
            background: #0d0d0d;
            border: 1px solid #333;
            border-radius: 12px;
            width: 90%;
            max-width: 700px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 24px;
            border-bottom: 1px solid #1a1a1a;
            background: linear-gradient(180deg, #151515 0%, #0d0d0d 100%);
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.15rem;
            font-weight: 600;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .modal-header h2::before {
            content: '';
            display: block;
            width: 3px;
            height: 18px;
            background: #00ff9d;
            border-radius: 2px;
          }

          .close-btn {
            background: transparent;
            border: 1px solid transparent;
            color: #555;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.15s;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: #333;
            color: #fff;
          }

          .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          }

          .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            gap: 12px;
            color: #666;
          }

          .spinner {
            width: 24px;
            height: 24px;
            border: 2px solid #333;
            border-top-color: #00ff9d;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .inline-loading {
            padding: 12px;
            color: #666;
            font-size: 0.85rem;
          }

          .error-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #ef4444;
          }

          .error-box button {
            background: #ef4444;
            color: #fff;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
          }

          .section {
            margin-bottom: 24px;
          }

          .section-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #00ff9d;
            margin-bottom: 12px;
          }

          .section-label::after {
            content: '';
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, rgba(0, 255, 157, 0.3), transparent);
          }

          /* Platform Row */
          .platform-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .platform-btn {
            flex: 1;
            min-width: 130px;
            max-width: 160px;
            background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
            border: 2px solid #2a2a2a;
            border-radius: 10px;
            padding: 16px 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            position: relative;
          }

          .platform-btn:hover:not(.disabled) {
            border-color: #00ff9d;
            background: linear-gradient(180deg, #1f1f1f 0%, #151515 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0, 255, 157, 0.15);
          }

          .platform-btn.selected {
            border-color: #00ff9d;
            background: linear-gradient(180deg, rgba(0, 255, 157, 0.15) 0%, rgba(0, 255, 157, 0.05) 100%);
            box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
          }

          .platform-btn.disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }

          .platform-btn.disabled:hover {
            transform: none;
            box-shadow: none;
          }

          .platform-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.05);
            transition: all 0.2s;
          }

          .platform-btn:hover:not(.disabled) .platform-icon {
            background: rgba(0, 255, 157, 0.1);
            box-shadow: 0 0 10px rgba(0, 255, 157, 0.2);
          }

          .platform-btn.selected .platform-icon {
            background: rgba(0, 255, 157, 0.15);
            box-shadow: 0 0 15px rgba(0, 255, 157, 0.3);
          }

          .platform-icon img {
            width: 32px;
            height: 32px;
            object-fit: contain;
          }

          .platform-btn.disabled .platform-icon {
            filter: grayscale(100%);
            opacity: 0.5;
          }

          .platform-name {
            font-size: 0.85rem;
            font-weight: 500;
            color: #888;
            transition: color 0.2s;
          }

          .platform-btn:hover:not(.disabled) .platform-name {
            color: #fff;
          }

          .platform-btn.selected .platform-name {
            color: #fff;
          }

          .coming-soon-badge {
            position: absolute;
            top: 6px;
            right: 6px;
            font-size: 0.6rem;
            font-weight: 600;
            padding: 3px 6px;
            background: rgba(255, 136, 0, 0.15);
            color: #ff8800;
            border-radius: 4px;
            border: 1px solid rgba(255, 136, 0, 0.3);
          }

          /* Family Row */
          .family-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .family-btn {
            flex: 1;
            min-width: 200px;
            background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
            border: 2px solid #2a2a2a;
            border-radius: 10px;
            padding: 14px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            text-align: left;
          }

          .family-btn:hover {
            border-color: #00ff9d;
            background: linear-gradient(180deg, #1f1f1f 0%, #151515 100%);
            transform: translateY(-1px);
          }

          .family-btn.selected {
            border-color: #00ff9d;
            background: linear-gradient(180deg, rgba(0, 255, 157, 0.12) 0%, rgba(0, 255, 157, 0.04) 100%);
            box-shadow: 0 0 15px rgba(0, 255, 157, 0.15);
          }

          .family-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: #e0e0e0;
          }

          .family-btn.selected .family-name {
            color: #fff;
          }

          .family-arch {
            font-size: 0.7rem;
            font-weight: 600;
            color: #00ff9d;
            padding: 3px 8px;
            background: rgba(0, 255, 157, 0.12);
            border: 1px solid rgba(0, 255, 157, 0.25);
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .family-devices {
            font-size: 0.75rem;
            color: #555;
          }

          /* Device Grid */
          .device-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 12px;
          }

          .device-btn {
            background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
            border: 2px solid #2a2a2a;
            border-radius: 10px;
            padding: 14px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            text-align: left;
          }

          .device-btn:hover {
            border-color: #00ff9d;
            background: linear-gradient(180deg, #1f1f1f 0%, #151515 100%);
            transform: translateY(-1px);
          }

          .device-btn.selected {
            border-color: #00ff9d;
            background: linear-gradient(180deg, rgba(0, 255, 157, 0.12) 0%, rgba(0, 255, 157, 0.04) 100%);
            box-shadow: 0 0 15px rgba(0, 255, 157, 0.15);
          }

          .device-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: #e0e0e0;
          }

          .device-btn.selected .device-name {
            color: #fff;
          }

          .device-desc {
            font-size: 0.75rem;
            color: #666;
            line-height: 1.4;
          }

          .device-specs {
            display: flex;
            gap: 8px;
            margin-top: 4px;
          }

          .device-specs .spec {
            font-size: 0.7rem;
            font-weight: 500;
            color: #00ff9d;
            padding: 3px 8px;
            background: rgba(0, 255, 157, 0.1);
            border: 1px solid rgba(0, 255, 157, 0.2);
            border-radius: 4px;
          }

          /* Framework Row */
          .framework-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .framework-btn {
            flex: 1;
            min-width: 200px;
            max-width: 300px;
            background: linear-gradient(180deg, #1a1a1a 0%, #111 100%);
            border: 2px solid #2a2a2a;
            border-radius: 10px;
            padding: 14px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            text-align: left;
          }

          .framework-btn:hover {
            border-color: #00ff9d;
            background: linear-gradient(180deg, #1f1f1f 0%, #151515 100%);
            transform: translateY(-1px);
          }

          .framework-btn.selected {
            border-color: #00ff9d;
            background: linear-gradient(180deg, rgba(0, 255, 157, 0.12) 0%, rgba(0, 255, 157, 0.04) 100%);
            box-shadow: 0 0 15px rgba(0, 255, 157, 0.15);
          }

          .framework-header {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .framework-icon {
            font-size: 1.2rem;
          }

          .framework-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: #e0e0e0;
          }

          .framework-btn.selected .framework-name {
            color: #fff;
          }

          .framework-desc {
            font-size: 0.75rem;
            color: #666;
            line-height: 1.4;
          }

          .framework-version {
            font-size: 0.65rem;
            font-weight: 500;
            color: #555;
            padding: 2px 6px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }

          /* Framework badges in summary */
          .framework-badge {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 4px;
          }

          .framework-badge.native {
            background: rgba(255, 200, 0, 0.15);
            color: #ffc800;
            border: 1px solid rgba(255, 200, 0, 0.3);
          }

          .framework-badge.arduino {
            background: rgba(0, 150, 255, 0.15);
            color: #0096ff;
            border: 1px solid rgba(0, 150, 255, 0.3);
          }

          .framework-badge.mbed {
            background: rgba(255, 136, 0, 0.15);
            color: #ff8800;
            border: 1px solid rgba(255, 136, 0, 0.3);
          }

          .framework-badge.zephyr {
            background: rgba(150, 0, 255, 0.15);
            color: #9600ff;
            border: 1px solid rgba(150, 0, 255, 0.3);
          }

          /* Summary Bar */
          .summary-bar {
            background: linear-gradient(180deg, rgba(0, 255, 157, 0.08) 0%, rgba(0, 255, 157, 0.03) 100%);
            border: 1px solid rgba(0, 255, 157, 0.25);
            border-radius: 10px;
            padding: 14px 18px;
            margin-top: 12px;
          }

          .summary-path {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.85rem;
            color: #888;
            margin-bottom: 10px;
          }

          .summary-path .sep {
            color: #00ff9d;
            opacity: 0.5;
          }

          .summary-path .highlight {
            color: #00ff9d;
            font-weight: 600;
          }

          .summary-stats {
            display: flex;
            gap: 16px;
            font-size: 0.75rem;
            color: #666;
          }

          .summary-stats span {
            padding: 2px 0;
          }

          .no-data {
            padding: 20px;
            text-align: center;
            color: #555;
            font-size: 0.85rem;
          }

          /* Footer */
          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 18px 24px;
            border-top: 1px solid #1a1a1a;
            background: linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%);
          }

          .cancel-btn, .apply-btn {
            padding: 11px 24px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .cancel-btn {
            background: transparent;
            border: 1px solid #333;
            color: #888;
          }

          .cancel-btn:hover {
            border-color: #555;
            color: #fff;
            background: rgba(255, 255, 255, 0.03);
          }

          .apply-btn {
            background: linear-gradient(135deg, #00ff9d 0%, #00cc7d 100%);
            border: none;
            color: #000;
            box-shadow: 0 4px 15px rgba(0, 255, 157, 0.3);
          }

          .apply-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0, 255, 157, 0.4);
          }

          .apply-btn:disabled {
            background: #222;
            color: #555;
            cursor: not-allowed;
            box-shadow: none;
          }
        `}</style>
      </div>
    </div>
  );
}
