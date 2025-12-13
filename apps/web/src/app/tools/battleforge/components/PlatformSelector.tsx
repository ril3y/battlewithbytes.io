'use client';

import { useState, useEffect } from 'react';
import { getPlatformManager } from '../lib/platform/PlatformManager';
import type {
  PlatformEntry,
  PlatformFamily,
  DeviceEntry,
  SelectedPlatform,
  LoadingProgress
} from '../lib/platform/types';

interface PlatformSelectorProps {
  onPlatformSelect?: (platform: SelectedPlatform | null) => void;
  onLoadPlatform?: () => void;
  disabled?: boolean;
}

export function PlatformSelector({
  onPlatformSelect,
  onLoadPlatform,
  disabled = false
}: PlatformSelectorProps) {
  const [platforms, setPlatforms] = useState<PlatformEntry[]>([]);
  const [families, setFamilies] = useState<string[]>([]);
  const [devices, setDevices] = useState<DeviceEntry[]>([]);
  const [currentFamily, setCurrentFamily] = useState<PlatformFamily | null>(null);

  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load platforms on mount
  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    setLoading(true);
    setError(null);
    try {
      const manager = getPlatformManager();
      const platformList = await manager.getPlatforms();
      setPlatforms(platformList);

      // Auto-select first platform if available
      if (platformList.length > 0) {
        handlePlatformChange(platformList[0].id);
      }
    } catch (err) {
      setError(`Failed to load platforms: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformChange = async (platformId: string) => {
    setSelectedPlatformId(platformId);
    setSelectedFamilyId('');
    setSelectedDeviceId('');
    setFamilies([]);
    setDevices([]);
    setCurrentFamily(null);
    onPlatformSelect?.(null);

    if (!platformId) return;

    setLoading(true);
    try {
      const manager = getPlatformManager();
      const familyList = await manager.getFamilies(platformId);
      setFamilies(familyList);

      // Auto-select first family if available
      if (familyList.length > 0) {
        handleFamilyChange(platformId, familyList[0]);
      }
    } catch (err) {
      setError(`Failed to load families: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFamilyChange = async (platformId: string, familyId: string) => {
    setSelectedFamilyId(familyId);
    setSelectedDeviceId('');
    setDevices([]);
    setCurrentFamily(null);
    onPlatformSelect?.(null);

    if (!familyId) return;

    setLoading(true);
    try {
      const manager = getPlatformManager();
      const family = await manager.loadFamily(platformId, familyId);
      setCurrentFamily(family);
      setDevices(family.devices);

      // Auto-select first device if available
      if (family.devices.length > 0) {
        handleDeviceChange(platformId, familyId, family.devices[0].id);
      }
    } catch (err) {
      setError(`Failed to load family: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = async (platformId: string, familyId: string, deviceId: string) => {
    setSelectedDeviceId(deviceId);

    if (!deviceId) {
      onPlatformSelect?.(null);
      return;
    }

    try {
      const manager = getPlatformManager();
      const selected = await manager.selectPlatform(platformId, familyId, deviceId);
      onPlatformSelect?.(selected);
    } catch (err) {
      setError(`Failed to select device: ${err}`);
    }
  };

  const selectedPlatform = platforms.find(p => p.id === selectedPlatformId);
  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="platform-selector">
      <div className="platform-selector-header">
        <span className="platform-selector-title">Target Platform</span>
        {loading && <span className="platform-selector-loading">Loading...</span>}
      </div>

      {error && (
        <div className="platform-selector-error">
          {error}
          <button onClick={loadPlatforms}>Retry</button>
        </div>
      )}

      <div className="platform-selector-dropdowns">
        {/* Platform dropdown */}
        <div className="platform-dropdown-group">
          <label>Platform</label>
          <select
            value={selectedPlatformId}
            onChange={(e) => handlePlatformChange(e.target.value)}
            disabled={disabled || loading || platforms.length === 0}
          >
            <option value="">Select Platform</option>
            {platforms.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Family dropdown */}
        <div className="platform-dropdown-group">
          <label>Family</label>
          <select
            value={selectedFamilyId}
            onChange={(e) => handleFamilyChange(selectedPlatformId, e.target.value)}
            disabled={disabled || loading || families.length === 0}
          >
            <option value="">Select Family</option>
            {families.map(f => (
              <option key={f} value={f}>{f.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Device dropdown */}
        <div className="platform-dropdown-group">
          <label>Device</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => handleDeviceChange(selectedPlatformId, selectedFamilyId, e.target.value)}
            disabled={disabled || loading || devices.length === 0}
          >
            <option value="">Select Device</option>
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Device info panel */}
      {selectedDevice && currentFamily && (
        <div className="platform-device-info">
          <div className="device-info-row">
            <span className="device-info-label">Architecture:</span>
            <span className="device-info-value">{currentFamily.architecture}</span>
          </div>
          <div className="device-info-row">
            <span className="device-info-label">Flash:</span>
            <span className="device-info-value">{formatBytes(selectedDevice.flash)}</span>
          </div>
          <div className="device-info-row">
            <span className="device-info-label">RAM:</span>
            <span className="device-info-value">{formatBytes(selectedDevice.ram)}</span>
          </div>
          {selectedDevice.description && (
            <div className="device-info-description">
              {selectedDevice.description}
            </div>
          )}
        </div>
      )}

      {/* Required downloads info */}
      {currentFamily && (
        <div className="platform-requirements">
          <div className="requirements-header">Required Downloads:</div>
          <div className="requirements-list">
            <div className="requirement-item">
              <span className="requirement-name">Headers</span>
              <span className="requirement-size">~{formatBytes(currentFamily.headers.size)}</span>
            </div>
            <div className="requirement-item">
              <span className="requirement-name">Libraries</span>
              <span className="requirement-size">{currentFamily.libs.required.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .platform-selector {
          background: #111;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 12px;
        }

        .platform-selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .platform-selector-title {
          font-weight: 600;
          color: #ededed;
        }

        .platform-selector-loading {
          font-size: 0.8rem;
          color: #0088ff;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .platform-selector-error {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid #f87171;
          border-radius: 4px;
          padding: 8px;
          color: #f87171;
          font-size: 0.85rem;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .platform-selector-error button {
          background: #f87171;
          color: #fff;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .platform-selector-dropdowns {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .platform-dropdown-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .platform-dropdown-group label {
          font-size: 0.75rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .platform-dropdown-group select {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 8px;
          color: #ededed;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .platform-dropdown-group select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .platform-dropdown-group select:focus {
          outline: none;
          border-color: #0088ff;
        }

        .platform-device-info {
          background: #1a1a1a;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 12px;
        }

        .device-info-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 0.85rem;
        }

        .device-info-label {
          color: #888;
        }

        .device-info-value {
          color: #00ff9d;
          font-family: monospace;
        }

        .device-info-description {
          color: #aaa;
          font-size: 0.8rem;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #333;
        }

        .platform-requirements {
          background: rgba(0, 136, 255, 0.1);
          border: 1px solid rgba(0, 136, 255, 0.3);
          border-radius: 6px;
          padding: 10px;
        }

        .requirements-header {
          color: #0088ff;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .requirements-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .requirement-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .requirement-name {
          color: #ededed;
        }

        .requirement-size {
          color: #888;
          font-family: monospace;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
