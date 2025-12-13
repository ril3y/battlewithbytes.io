'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlatformRegistry, PlatformEntry, PlatformFamily, DeviceEntry, SelectedPlatform, ARCHITECTURE_CONFIGS } from '../lib/platform/types';

interface PlatformSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selection: SelectedPlatform) => void;
  currentSelection?: SelectedPlatform | null;
}

type Step = 'platform' | 'family' | 'device' | 'summary';

export function PlatformSelectorModal({
  isOpen,
  onClose,
  onSelect,
  currentSelection
}: PlatformSelectorModalProps) {
  const [step, setStep] = useState<Step>('platform');
  const [registry, setRegistry] = useState<PlatformRegistry | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformEntry | null>(null);
  const [families, setFamilies] = useState<Map<string, PlatformFamily>>(new Map());
  const [selectedFamily, setSelectedFamily] = useState<PlatformFamily | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load registry on mount
  useEffect(() => {
    if (isOpen && !registry) {
      loadRegistry();
    }
  }, [isOpen, registry]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentSelection) {
        // Pre-populate from current selection
        const platform = registry?.platforms.find(p => p.id === currentSelection.platformId);
        if (platform) {
          setSelectedPlatform(platform);
          setSelectedFamily(currentSelection.family);
          setSelectedDevice(currentSelection.device);
          setStep('summary');
        }
      } else {
        setStep('platform');
        setSelectedPlatform(null);
        setSelectedFamily(null);
        setSelectedDevice(null);
      }
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

  const loadFamily = async (platformId: string, familyId: string): Promise<PlatformFamily | null> => {
    const cacheKey = `${platformId}/${familyId}`;
    if (families.has(cacheKey)) {
      return families.get(cacheKey)!;
    }

    try {
      const response = await fetch(`/platforms/${platformId}/${familyId}/family.json`);
      if (!response.ok) throw new Error(`Failed to load family ${familyId}`);
      const data = await response.json();
      setFamilies(prev => new Map(prev).set(cacheKey, data));
      return data;
    } catch (err) {
      console.error('Failed to load family:', err);
      return null;
    }
  };

  const handlePlatformSelect = useCallback(async (platform: PlatformEntry) => {
    if (!platform.supported) return;

    setSelectedPlatform(platform);
    setLoading(true);

    // Pre-load all families for this platform
    const loadedFamilies: PlatformFamily[] = [];
    for (const familyId of platform.families) {
      const family = await loadFamily(platform.id, familyId);
      if (family) loadedFamilies.push(family);
    }

    setLoading(false);
    setStep('family');
  }, []);

  const handleFamilySelect = useCallback((family: PlatformFamily) => {
    setSelectedFamily(family);
    setSelectedDevice(null);
    setStep('device');
  }, []);

  const handleDeviceSelect = useCallback((device: DeviceEntry) => {
    setSelectedDevice(device);
    setStep('summary');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedPlatform || !selectedFamily || !selectedDevice) return;

    // Import architecture configs - we need to access them
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
    });
    onClose();
  }, [selectedPlatform, selectedFamily, selectedDevice, onSelect, onClose]);

  const goBack = useCallback(() => {
    switch (step) {
      case 'family':
        setStep('platform');
        setSelectedFamily(null);
        break;
      case 'device':
        setStep('family');
        setSelectedDevice(null);
        break;
      case 'summary':
        setStep('device');
        break;
    }
  }, [step]);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Target Platform</h2>
          <button className="close-btn" onClick={onClose}>x</button>
        </div>

        <div className="step-indicator">
          <div className={`step ${step === 'platform' ? 'active' : selectedPlatform ? 'completed' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label">Platform</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step === 'family' ? 'active' : selectedFamily ? 'completed' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">Family</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step === 'device' ? 'active' : selectedDevice ? 'completed' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">Device</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step === 'summary' ? 'active' : ''}`}>
            <span className="step-num">4</span>
            <span className="step-label">Confirm</span>
          </div>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading">
              <div className="spinner" />
              <span>Loading...</span>
            </div>
          )}

          {error && (
            <div className="error">
              <span>{error}</span>
              <button onClick={loadRegistry}>Retry</button>
            </div>
          )}

          {/* Platform Selection */}
          {step === 'platform' && registry && !loading && (
            <div className="platform-grid">
              {registry.platforms.map(platform => (
                <div
                  key={platform.id}
                  className={`platform-card ${!platform.supported ? 'disabled' : ''} ${selectedPlatform?.id === platform.id ? 'selected' : ''}`}
                  onClick={() => handlePlatformSelect(platform)}
                  style={{ '--brand-color': platform.color || '#444' } as React.CSSProperties}
                >
                  <div className="platform-icon">
                    {platform.id === 'stm32' && <span className="icon-text">STM</span>}
                    {platform.id === 'esp32' && <span className="icon-text">ESP</span>}
                    {platform.id === 'nrf' && <span className="icon-text">nRF</span>}
                    {platform.id === 'rp2040' && <span className="icon-text">RP</span>}
                  </div>
                  <div className="platform-info">
                    <h3>{platform.name}</h3>
                    <p>{platform.description}</p>
                    {platform.tags && (
                      <div className="tags">
                        {platform.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {platform.comingSoon && (
                    <div className="coming-soon">Coming Soon</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Family Selection */}
          {step === 'family' && selectedPlatform && !loading && (
            <div className="family-list">
              <div className="breadcrumb">
                <span onClick={() => setStep('platform')}>{selectedPlatform.name}</span>
                <span className="separator">/</span>
                <span className="current">Select Family</span>
              </div>
              <div className="family-grid">
                {selectedPlatform.families.map(familyId => {
                  const family = families.get(`${selectedPlatform.id}/${familyId}`);
                  if (!family) return null;

                  return (
                    <div
                      key={familyId}
                      className={`family-card ${selectedFamily?.id === familyId ? 'selected' : ''}`}
                      onClick={() => handleFamilySelect(family)}
                    >
                      <div className="family-header">
                        <h3>{family.name}</h3>
                        <span className="arch-badge">{family.architecture}</span>
                      </div>
                      <p className="family-desc">{family.description}</p>
                      <div className="family-stats">
                        <span>{family.devices.length} device{family.devices.length !== 1 ? 's' : ''}</span>
                        <span>Headers: {formatBytes(family.headers.size)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Device Selection */}
          {step === 'device' && selectedFamily && !loading && (
            <div className="device-list">
              <div className="breadcrumb">
                <span onClick={() => setStep('platform')}>{selectedPlatform?.name}</span>
                <span className="separator">/</span>
                <span onClick={() => setStep('family')}>{selectedFamily.name}</span>
                <span className="separator">/</span>
                <span className="current">Select Device</span>
              </div>
              <div className="device-grid">
                {selectedFamily.devices.map(device => (
                  <div
                    key={device.id}
                    className={`device-card ${selectedDevice?.id === device.id ? 'selected' : ''}`}
                    onClick={() => handleDeviceSelect(device)}
                  >
                    <div className="device-header">
                      <h3>{device.name}</h3>
                    </div>
                    <p className="device-desc">{device.description}</p>
                    <div className="device-specs">
                      <div className="spec">
                        <span className="spec-label">Flash</span>
                        <span className="spec-value">{formatBytes(device.flash)}</span>
                      </div>
                      <div className="spec">
                        <span className="spec-label">RAM</span>
                        <span className="spec-value">{formatBytes(device.ram)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {step === 'summary' && selectedPlatform && selectedFamily && selectedDevice && (
            <div className="summary">
              <div className="breadcrumb">
                <span onClick={() => setStep('platform')}>{selectedPlatform.name}</span>
                <span className="separator">/</span>
                <span onClick={() => setStep('family')}>{selectedFamily.name}</span>
                <span className="separator">/</span>
                <span onClick={() => setStep('device')}>{selectedDevice.name}</span>
              </div>

              <div className="summary-card">
                <h3>Selected Configuration</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Target</span>
                    <span className="value">{selectedDevice.name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Architecture</span>
                    <span className="value">{selectedFamily.architecture}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Flash Memory</span>
                    <span className="value">{formatBytes(selectedDevice.flash)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">RAM</span>
                    <span className="value">{formatBytes(selectedDevice.ram)}</span>
                  </div>
                </div>

                <div className="downloads-section">
                  <h4>Required Downloads</h4>
                  <div className="download-item">
                    <span className="download-name">Device Headers</span>
                    <span className="download-size">{formatBytes(selectedFamily.headers.size)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step !== 'platform' && (
            <button className="back-btn" onClick={goBack}>
              Back
            </button>
          )}
          <div className="spacer" />
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          {step === 'summary' && (
            <button className="confirm-btn" onClick={handleConfirm}>
              Confirm Selection
            </button>
          )}
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }

          .modal-content {
            background: #0a0a0a;
            border: 1px solid #333;
            border-radius: 12px;
            width: 90%;
            max-width: 800px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #222;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
            color: #fff;
          }

          .close-btn {
            background: transparent;
            border: none;
            color: #666;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 4px 8px;
            line-height: 1;
          }

          .close-btn:hover {
            color: #fff;
          }

          .step-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px 24px;
            border-bottom: 1px solid #222;
            gap: 8px;
          }

          .step {
            display: flex;
            align-items: center;
            gap: 8px;
            opacity: 0.4;
          }

          .step.active {
            opacity: 1;
          }

          .step.completed {
            opacity: 0.8;
          }

          .step-num {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .step.active .step-num {
            background: var(--accent-primary, #00ff9d);
            color: #000;
          }

          .step.completed .step-num {
            background: var(--accent-secondary, #0088ff);
            color: #fff;
          }

          .step-label {
            font-size: 0.85rem;
            color: #999;
          }

          .step.active .step-label {
            color: #fff;
          }

          .step-line {
            width: 40px;
            height: 1px;
            background: #333;
          }

          .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            min-height: 300px;
          }

          .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            gap: 16px;
            color: #666;
          }

          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #333;
            border-top-color: var(--accent-primary, #00ff9d);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .error {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            color: #ff6b6b;
          }

          .error button {
            background: #ff6b6b;
            color: #000;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          }

          /* Platform Grid */
          .platform-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 16px;
          }

          .platform-card {
            background: #111;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            gap: 16px;
            position: relative;
          }

          .platform-card:hover:not(.disabled) {
            border-color: var(--brand-color);
            transform: translateY(-2px);
          }

          .platform-card.selected {
            border-color: var(--accent-primary, #00ff9d);
            background: rgba(0, 255, 157, 0.05);
          }

          .platform-card.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .platform-icon {
            width: 60px;
            height: 60px;
            background: var(--brand-color);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .icon-text {
            font-size: 1.25rem;
            font-weight: 700;
            color: #fff;
          }

          .platform-info h3 {
            margin: 0 0 8px 0;
            font-size: 1rem;
            color: #fff;
          }

          .platform-info p {
            margin: 0 0 12px 0;
            font-size: 0.85rem;
            color: #888;
            line-height: 1.4;
          }

          .tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }

          .tag {
            font-size: 0.7rem;
            padding: 2px 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            color: #999;
          }

          .coming-soon {
            position: absolute;
            top: 12px;
            right: 12px;
            font-size: 0.7rem;
            padding: 4px 8px;
            background: rgba(255, 136, 0, 0.2);
            color: #ff8800;
            border-radius: 4px;
          }

          /* Breadcrumb */
          .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 20px;
            font-size: 0.85rem;
          }

          .breadcrumb span {
            color: #666;
            cursor: pointer;
          }

          .breadcrumb span:hover:not(.separator):not(.current) {
            color: var(--accent-primary, #00ff9d);
          }

          .breadcrumb .separator {
            cursor: default;
          }

          .breadcrumb .current {
            color: #fff;
            cursor: default;
          }

          /* Family Grid */
          .family-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          }

          .family-card {
            background: #111;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .family-card:hover {
            border-color: var(--accent-secondary, #0088ff);
          }

          .family-card.selected {
            border-color: var(--accent-primary, #00ff9d);
            background: rgba(0, 255, 157, 0.05);
          }

          .family-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .family-header h3 {
            margin: 0;
            font-size: 0.95rem;
            color: #fff;
          }

          .arch-badge {
            font-size: 0.7rem;
            padding: 2px 8px;
            background: rgba(0, 136, 255, 0.2);
            color: var(--accent-secondary, #0088ff);
            border-radius: 4px;
          }

          .family-desc {
            margin: 0 0 12px 0;
            font-size: 0.8rem;
            color: #888;
            line-height: 1.4;
          }

          .family-stats {
            display: flex;
            gap: 16px;
            font-size: 0.75rem;
            color: #666;
          }

          /* Device Grid */
          .device-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
          }

          .device-card {
            background: #111;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .device-card:hover {
            border-color: var(--accent-secondary, #0088ff);
          }

          .device-card.selected {
            border-color: var(--accent-primary, #00ff9d);
            background: rgba(0, 255, 157, 0.05);
          }

          .device-header h3 {
            margin: 0 0 8px 0;
            font-size: 0.9rem;
            color: #fff;
          }

          .device-desc {
            margin: 0 0 12px 0;
            font-size: 0.8rem;
            color: #888;
          }

          .device-specs {
            display: flex;
            gap: 16px;
          }

          .spec {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .spec-label {
            font-size: 0.7rem;
            color: #666;
            text-transform: uppercase;
          }

          .spec-value {
            font-size: 0.85rem;
            color: var(--accent-primary, #00ff9d);
            font-weight: 600;
          }

          /* Summary */
          .summary-card {
            background: #111;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 24px;
          }

          .summary-card h3 {
            margin: 0 0 20px 0;
            font-size: 1rem;
            color: #fff;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }

          .summary-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .summary-item .label {
            font-size: 0.75rem;
            color: #666;
            text-transform: uppercase;
          }

          .summary-item .value {
            font-size: 0.95rem;
            color: #fff;
          }

          .downloads-section {
            border-top: 1px solid #333;
            padding-top: 16px;
          }

          .downloads-section h4 {
            margin: 0 0 12px 0;
            font-size: 0.85rem;
            color: #888;
          }

          .download-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #0a0a0a;
            border-radius: 4px;
          }

          .download-name {
            font-size: 0.85rem;
            color: #fff;
          }

          .download-size {
            font-size: 0.8rem;
            color: #666;
          }

          /* Footer */
          .modal-footer {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 24px;
            border-top: 1px solid #222;
          }

          .spacer {
            flex: 1;
          }

          .back-btn, .cancel-btn, .confirm-btn {
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .back-btn {
            background: transparent;
            border: 1px solid #444;
            color: #888;
          }

          .back-btn:hover {
            border-color: #666;
            color: #fff;
          }

          .cancel-btn {
            background: transparent;
            border: 1px solid #444;
            color: #888;
          }

          .cancel-btn:hover {
            border-color: #666;
            color: #fff;
          }

          .confirm-btn {
            background: var(--accent-primary, #00ff9d);
            border: none;
            color: #000;
            font-weight: 600;
          }

          .confirm-btn:hover {
            filter: brightness(1.1);
          }
        `}</style>
      </div>
    </div>
  );
}
