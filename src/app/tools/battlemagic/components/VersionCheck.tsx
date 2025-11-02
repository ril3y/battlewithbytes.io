/**
 * Version Check Component
 *
 * Displays Black Magic Probe version information and compatibility status
 */

import React, { useState } from 'react';
import { BmpVersion } from '../lib/gdb/types';
import { versionManager, FeatureStatus, BmpFeature } from '../lib/version/VersionManager';
import { ChevronDownIcon, ChevronRightIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface VersionCheckProps {
  version: BmpVersion | null;
  onVersionCheck?: () => void;
}

export default function VersionCheck({ version, onVersionCheck }: VersionCheckProps) {
  const [expanded, setExpanded] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  // Update version manager when version changes
  React.useEffect(() => {
    if (version) {
      versionManager.setVersion(version);
    }
  }, [version]);

  if (!version) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-400">Version not detected</span>
          </div>
          {onVersionCheck && (
            <button
              onClick={onVersionCheck}
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Check Version
            </button>
          )}
        </div>
      </div>
    );
  }

  const report = versionManager.getCompatibilityReport();
  const badgeColor = versionManager.getVersionBadgeColor();
  const displayVersion = versionManager.getDisplayVersion();

  const getBadgeClasses = () => {
    switch (badgeColor) {
      case 'green':
        return 'bg-green-600 text-white';
      case 'yellow':
        return 'bg-yellow-600 text-white';
      case 'red':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusIcon = (status: FeatureStatus) => {
    switch (status) {
      case FeatureStatus.SUPPORTED:
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case FeatureStatus.EXPERIMENTAL:
        return <ExclamationCircleIcon className="w-4 h-4 text-yellow-500" />;
      case FeatureStatus.NOT_SUPPORTED:
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case FeatureStatus.DEPRECATED:
        return <XCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: BmpFeature['category']) => {
    const icons: Record<BmpFeature['category'], string> = {
      debug: '🐛',
      power: '⚡',
      trace: '📊',
      memory: '💾',
      target: '🎯',
      config: '⚙️'
    };
    return icons[category] || '📦';
  };

  const availableFeatures = versionManager.getAvailableFeatures();
  const featuresByCategory = {
    debug: versionManager.getFeaturesByCategory('debug'),
    target: versionManager.getFeaturesByCategory('target'),
    power: versionManager.getFeaturesByCategory('power'),
    memory: versionManager.getFeaturesByCategory('memory'),
    trace: versionManager.getFeaturesByCategory('trace'),
    config: versionManager.getFeaturesByCategory('config')
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {expanded ? (
                <ChevronDownIcon className="w-5 h-5" />
              ) : (
                <ChevronRightIcon className="w-5 h-5" />
              )}
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-200">BMP Firmware</span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getBadgeClasses()}`}>
                {displayVersion}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-400">
                  {report.supportedFeatures}/{report.totalFeatures} features
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {report.isLatest ? (
              <span className="text-xs text-green-500 flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Latest
              </span>
            ) : (
              <span className="text-xs text-yellow-500 flex items-center">
                <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                Update Available
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-700">
          {/* Recommendation */}
          {report.recommendation && (
            <div className="p-4 bg-yellow-900/20 border-b border-gray-700">
              <div className="flex items-start space-x-2">
                <ExclamationCircleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-400">{report.recommendation}</p>
              </div>
            </div>
          )}

          {/* Feature Toggle */}
          <div className="p-4">
            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {showFeatures ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
              <span>Feature Details</span>
            </button>
          </div>

          {/* Features List */}
          {showFeatures && (
            <div className="px-4 pb-4 space-y-4">
              {Object.entries(featuresByCategory).map(([category, features]) => {
                if (features.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                      <span>{getCategoryIcon(category as BmpFeature['category'])}</span>
                      <span className="capitalize">{category}</span>
                      <span className="text-xs text-gray-500">({features.length})</span>
                    </div>
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      {features.map((feature) => {
                        const status = versionManager.isFeatureAvailable(feature.id);
                        return (
                          <div
                            key={feature.id}
                            className="flex items-start space-x-2 text-xs"
                            title={feature.description}
                          >
                            {getStatusIcon(status)}
                            <div className="flex-1">
                              <div className="text-gray-300">{feature.name}</div>
                              {feature.command && (
                                <code className="text-gray-500 text-xs">monitor {feature.command}</code>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Missing Features */}
              {report.missingFeatures.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                    <span>Unavailable Features</span>
                    <span className="text-xs text-gray-500">({report.missingFeatures.length})</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {report.missingFeatures.map((feature) => (
                      <div key={feature.id} className="text-xs text-gray-500">
                        <span>{feature.name}</span>
                        {feature.minVersion && (
                          <span className="ml-2 text-gray-600">
                            (requires v{feature.minVersion})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}