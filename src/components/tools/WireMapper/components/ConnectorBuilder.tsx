'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';

// Basic form components with proper TypeScript types

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
  children, 
  className = '',
  ...props 
}) => (
  <button 
    className={`px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

import { 
  Connector, 
  ConnectorConfig, 
  ConnectorGender, 
  ConnectorShape, 
  DynamicConfigSchema, 
  Pin 
} from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { ConnectorPreview } from '.';
import { DynamicConfigInput } from './DynamicConfigInput';
import { getAvailableShapes, getDefaultRenderer, getRenderer } from '../connectors/connectorRegistry';
import { CONNECTOR_DEFAULTS } from '../constants';

interface ConnectorBuilderProps {
  connectorToEdit: Connector | null;
  onComplete: () => void;
}

const GENDER_OPTIONS: ConnectorGender[] = ['Male', 'Female', 'Unknown'];

const getDefaultConfigFromSchema = (schema: DynamicConfigSchema): ConnectorConfig => {
  const defaultConfig: ConnectorConfig = {};
  for (const key in schema) {
    if (schema[key].defaultValue !== undefined) {
      defaultConfig[key] = schema[key].defaultValue;
    }
  }
  if (!('rows' in defaultConfig)) defaultConfig.rows = CONNECTOR_DEFAULTS.rows;
  if (!('columns' in defaultConfig)) defaultConfig.columns = CONNECTOR_DEFAULTS.cols;
  if (!('numPins' in defaultConfig)) defaultConfig.numPins = CONNECTOR_DEFAULTS.numPins;
  return defaultConfig;
};

export const ConnectorBuilder: React.FC<ConnectorBuilderProps> = ({ connectorToEdit, onComplete }) => {
  const isEditing = !!connectorToEdit;
  const defaultShape = useMemo(() => getDefaultRenderer().shape, []);
  const { addConnector, updateConnector } = useWireMapperStore();

  const [connectorState, setConnectorState] = useState<Omit<Connector, 'id' | 'pins'> & { id?: string; pins?: Pin[] }>(() => {
    if (isEditing && connectorToEdit) {
      const config = connectorToEdit.config || {};
      if (!('rows' in config)) config.rows = CONNECTOR_DEFAULTS.rows;
      if (!('columns' in config)) config.columns = CONNECTOR_DEFAULTS.cols;
      if (!('numPins' in config)) config.numPins = CONNECTOR_DEFAULTS.numPins;
      return { ...connectorToEdit, config };
    }
    const initialShape = defaultShape;
    const initialRenderer = getRenderer(initialShape);
    const initialSchema = initialRenderer?.getConfigurationSchema() ?? {};
    const initialConfig = getDefaultConfigFromSchema(initialSchema);
    return {
      id: nanoid(),
      name: '',
      type: '',
      gender: 'Unknown',
      shape: initialShape,
      width: CONNECTOR_DEFAULTS.width,
      height: CONNECTOR_DEFAULTS.height,
      x: CONNECTOR_DEFAULTS.x,
      y: CONNECTOR_DEFAULTS.y,
      config: initialConfig,
    };
  });

  const [pins, setPins] = useState<Pin[]>(connectorToEdit?.pins ?? []);
  const [configSchema, setConfigSchema] = useState<DynamicConfigSchema>(() => {
    const initialRenderer = getRenderer(connectorState.shape ?? defaultShape);
    return initialRenderer?.getConfigurationSchema() ?? {};
  });

  // Helper to safely update connector state with proper typing
  const updateConnectorState = useCallback(<K extends keyof Connector>(
    updates: Pick<Connector, K> | ((prev: Omit<Connector, 'id' | 'pins'> & { id?: string; pins?: Pin[] }) => Pick<Connector, K>)
  ) => {
    setConnectorState(prev => ({
      ...prev,
      ...(typeof updates === 'function' ? updates(prev) : updates)
    } as Omit<Connector, 'id' | 'pins'> & { id?: string; pins?: Pin[] }));
  }, []);

  useEffect(() => {
    const shape = connectorState.shape;
    if (!shape) return;

    const renderer = getRenderer(shape);
    if (!renderer) {
      console.error(`No renderer found for shape: ${shape}`);
      setConfigSchema({});
      setConnectorState(prev => ({ ...prev, config: {} }));
      return;
    }

    const newSchema = renderer.getConfigurationSchema();
    const newDefaultConfig = getDefaultConfigFromSchema(newSchema);

    setConfigSchema(newSchema);

    setConnectorState(prev => {
      const currentConfig = prev.config || {};
      const updatedConfig = { ...newDefaultConfig };

      for (const key in newSchema) {
        if (key in currentConfig) {
          updatedConfig[key] = currentConfig[key];
        }
      }
      if (newSchema.rows && !('rows' in updatedConfig)) updatedConfig.rows = newDefaultConfig.rows;
      if (newSchema.columns && !('columns' in updatedConfig)) updatedConfig.columns = newDefaultConfig.columns;
      if (newSchema.numPins && !('numPins' in updatedConfig)) updatedConfig.numPins = newDefaultConfig.numPins;

      return { ...prev, config: updatedConfig };
    });

  }, [connectorState.shape]);

  useEffect(() => {
    const shape = connectorState.shape;
    const config = connectorState.config;
    const width = connectorState.width ?? CONNECTOR_DEFAULTS.width;
    const height = connectorState.height ?? CONNECTOR_DEFAULTS.height;

    if (!shape || !config) return;

    const renderer = getRenderer(shape);
    if (!renderer) {
      setPins([]);
      return;
    }

    const dimensions = { width, height };

    try {
      const newPins = renderer.generatePins(config, dimensions);
      setPins(currentPins => {
        const currentPinMapByIndex = new Map(currentPins.map(p => [p.index, p]));
        return newPins.map(newPin => {
          const existingPin = currentPinMapByIndex.get(newPin.index);
          return {
            ...newPin,
            id: existingPin?.id ?? newPin.id,
            active: existingPin?.active ?? newPin.active
          };
        });
      });
    } catch (error) {
      console.error("Error generating pins:", error);
      setPins([]);
    }
  }, [connectorState.config, connectorState.shape, connectorState.width, connectorState.height]);

  const handleStateChange = useCallback(<K extends keyof Connector>(
    key: K, 
    value: Connector[K]
  ) => {
    updateConnectorState({
      [key]: value
    } as Pick<Connector, K>);
  }, [updateConnectorState]);

  const handleConfigChange = useCallback(<K extends keyof ConnectorConfig>(
    key: K,
    value: ConnectorConfig[K]
  ) => {
    updateConnectorState(prev => ({
      config: {
        ...(prev.config || {}),
        [key]: value
      }
    } as Pick<Connector, 'config'>));
  }, [updateConnectorState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!connectorState.name?.trim()) {
      alert('Connector Name is required.');
      return;
    }
    if (!connectorState.shape) {
      alert('Connector Shape is required.');
      return;
    }

    const rows = (connectorState.config?.rows as number) ?? 1;
    const cols = (connectorState.config?.cols as number) ?? 1;

    const finalConnector: Omit<Connector, 'id'> & { id?: string } = {
      name: connectorState.name || 'Unnamed Connector',
      type: connectorState.type || '',
      gender: connectorState.gender || 'Unknown',
      shape: connectorState.shape,
      rows: rows,
      cols: cols,
      config: connectorState.config || {},
      pins: pins,
      width: connectorState.width || CONNECTOR_DEFAULTS.width,
      height: connectorState.height || CONNECTOR_DEFAULTS.height,
      x: connectorState.x ?? CONNECTOR_DEFAULTS.x,
      y: connectorState.y ?? CONNECTOR_DEFAULTS.y,
    };

    console.log('Final Connector:', finalConnector);

    try {
      if (isEditing && connectorToEdit?.id) {
        updateConnector(connectorToEdit.id, finalConnector as Partial<Connector>);
      } else {
        addConnector(finalConnector as Omit<Connector, 'id'>);
      }
      onComplete();
    } catch (error) {
      console.error("Error saving connector:", error);
      alert(`Failed to save connector: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // --- Derived State for Preview ---
  // Ensure required fields for preview are present before rendering
  const previewConnector = useMemo(() => {
    if (!connectorState.shape || !connectorState.config) {
      return null; // Indicate preview is not ready
    }
    return {
      // Provide defaults for potentially missing non-essential preview fields
      id: connectorState.id || 'preview-id',
      name: connectorState.name || 'Preview',
      type: connectorState.type,
      gender: connectorState.gender || 'Unknown',
      width: connectorState.width,
      height: connectorState.height,
      // Assert required fields are present based on the check above
      shape: connectorState.shape!,
      config: connectorState.config!,
      pins: pins,
    };
  }, [connectorState, pins]);

  // --- Render ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-auto">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">{isEditing ? 'Edit Connector' : 'Create New Connector'}</h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="connectorName" className="block text-sm font-medium text-gray-400 mb-1">Connector Name</label>
          <input
            id="connectorName"
            type="text"
            value={connectorState.name || ''}
            onChange={(e) => handleStateChange('name', e.target.value)}
            placeholder="e.g., JST-XH Header"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="connectorType" className="block text-sm font-medium text-gray-400 mb-1">Connector Type (Optional)</label>
          <input
            id="connectorType"
            type="text"
            value={connectorState.type || ''}
            onChange={(e) => handleStateChange('type', e.target.value)}
            placeholder="e.g., Power Connector"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="connectorGender" className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
          <select
            id="connectorGender"
            value={connectorState.gender || 'Unknown'}
            onChange={(e) => handleStateChange('gender', e.target.value as ConnectorGender)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="connectorShape" className="block text-sm font-medium text-gray-400 mb-1">Shape</label>
          <select
            id="connectorShape"
            value={connectorState.shape || ''}
            onChange={(e) => handleStateChange('shape', e.target.value as ConnectorShape)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="" disabled>-- Select Shape --</option>
            {getAvailableShapes().map(shapeInfo => (
              <option key={shapeInfo.shape} value={shapeInfo.shape}>
                {shapeInfo.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Configuration & Preview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* Configuration Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2">Configuration</h3>
          {configSchema && Object.keys(configSchema).length > 0 ? (
            Object.entries(configSchema).map(([key, option]) => {
              // Hide rows and columns inputs when pin pattern has a value
              if ((key === 'rows' || key === 'cols') &&
                connectorState.config?.pinPattern &&
                String(connectorState.config.pinPattern).trim() !== '') {
                return null;
              }

              return option ? (
                <DynamicConfigInput
                  key={key}
                  option={option} // Pass the individual option object
                  value={connectorState.config?.[key] as string | number | boolean | undefined}
                  onChange={handleConfigChange}
                />
              ) : null; // Handle case where an option might be undefined, though schema should be well-formed
            })
          ) : (
            <p className="text-gray-500 italic">Select a shape to see configuration options.</p>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6 md:col-span-3 flex flex-col items-center">
          <h3 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2">Preview</h3>
          {/* Pass scale prop to make preview larger */}
          <ConnectorPreview
            connector={{
              ...(connectorState as Partial<Connector>),
              pins: pins, // Ensure pins are passed
              shape: connectorState.shape!, // Ensure shape is non-null
              config: connectorState.config!, // Ensure config is non-null
            }}
            scale={2.5} // Increase scale factor
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={!previewConnector} // Disable save if preview isn't ready (shape/config missing)
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? 'Save Changes' : 'Create Connector'}
        </Button>
      </div>
    </form>
  );
};