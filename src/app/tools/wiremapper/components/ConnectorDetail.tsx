'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Connector, ConnectorGender } from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { debounce } from 'lodash';

interface ConnectorDetailProps {
  connector: Connector;
  onEdit: () => void; // Callback when the 'Edit in Builder' button is clicked
}

interface LocalConnectorData extends Partial<Connector> {
  // We can add more specific local state if needed, but Partial<Connector> is a good start
}

export const ConnectorDetail: React.FC<ConnectorDetailProps> = ({ connector, onEdit }) => {
  const { updateConnector } = useWireMapperStore();
  const [localData, setLocalData] = useState<LocalConnectorData | null>(null);
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);

  useEffect(() => {
    if (!connector) {
      setLocalData(null);
      setIsLayoutLocked(false);
      return;
    }

    const hasConnections = connector.pins.some(pin => pin.connectedWireIds && pin.connectedWireIds.length > 0);
    setIsLayoutLocked(hasConnections);

    if (!localData || localData.id !== connector.id) {
      // Different connector selected or initial load for this connector
      setLocalData({
        ...connector,
        config: connector.config ? { ...JSON.parse(JSON.stringify(connector.config)) } : {},
      });
    } else {
      // Same connector, but its data might have updated in the store. Merge carefully.
      const activeElement = document.activeElement as HTMLElement;
      const focusedInputName = (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) 
                              ? (activeElement as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).name 
                              : null;

      let newLocalData = { ...localData };
      let needsUpdate = false;

      // Sync top-level editable properties
      const fieldsToSync: (keyof Connector)[] = ['name', 'type', 'gender', 'rows', 'cols'];
      fieldsToSync.forEach(field => {
        if (field === 'config' || field === 'pins' || field === 'id' || field === 'x' || field === 'y') return; // these are handled differently or not directly editable here
        
        const storeValue = connector[field as keyof Connector];
        const localValue = localData[field as keyof Connector];
        
        // Normalize undefined/null to empty string for comparison for some fields, or handle types appropriately
        const normalizedStoreValue = storeValue === undefined || storeValue === null ? "" : storeValue;
        const normalizedLocalValue = localValue === undefined || localValue === null ? "" : localValue;

        if (String(normalizedStoreValue) !== String(normalizedLocalValue)) { // Compare as strings for simplicity here, refine if type issues arise
          if (focusedInputName !== field) { 
            // @ts-ignore
            newLocalData[field] = connector[field];
            needsUpdate = true;
          }
        }
      });

      // Sync config properties (example: centerPinsHorizontal)
      if (connector.config && localData.config) {
        const configKeysToSync = ['centerPinsHorizontal']; // Add other editable config keys here
        configKeysToSync.forEach(configKey => {
          const storeConfigValue = connector.config![configKey];
          const localConfigValue = localData.config![configKey];
          if (storeConfigValue !== localConfigValue) {
            if (focusedInputName !== configKey) {
              newLocalData.config = { ...newLocalData.config, [configKey]: storeConfigValue };
              needsUpdate = true;
            }
          }
        });
      }

      if (needsUpdate) {
        setLocalData(newLocalData);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector]); // localData is intentionally omitted to prevent cycles, logic handles merging.

  const debouncedUpdateConnector = useCallback(
    debounce((id: string, updates: Partial<Connector>) => {
      updateConnector(id, updates);
    }, 500),
    [updateConnector]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!localData || !connector) return;
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    if (type === 'number') {
      parsedValue = parseFloat(value); // Use parseFloat for potentially decimal values
      if (isNaN(parsedValue as number)) {
        // Handle non-numeric input for number fields, e.g., revert or set to a default valid value
        // For now, we'll let it be NaN and expect validation/handling before store update if necessary
        // or rely on min/max attributes of the input field.
        // If the field should not be NaN, you might set it to localData[keys[0]] to revert, or 0, or null.
        // For controlled components, usually you'd prevent invalid chars or show validation message.
      } 
    }
    if (e.target.type === 'checkbox') {
        parsedValue = (e.target as HTMLInputElement).checked;
    }

    const keys = name.split('.');
    let updatedData = { ...localData };

    if (keys.length > 1 && keys[0] === 'config' && updatedData.config) {
      updatedData.config = { ...updatedData.config, [keys[1]]: parsedValue };
    } else {
      updatedData = { ...updatedData, [keys[0]]: parsedValue };
    }
    
    setLocalData(updatedData);
    debouncedUpdateConnector(connector.id, { [keys[0]]: parsedValue });
  };
  
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!localData || !connector || !localData.config) return;
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;

    if (type === 'number') {
        parsedValue = parseInt(value, 10); // Config values like rows/cols are likely integers
        if (isNaN(parsedValue as number)) { 
            // Similar handling for NaN as in handleChange
        }
    }
    if (type === 'checkbox') {
        parsedValue = (e.target as HTMLInputElement).checked;
    }

    const updatedConfig = { ...localData.config, [name]: parsedValue };
    setLocalData({ ...localData, config: updatedConfig });
    debouncedUpdateConnector(connector.id, { config: updatedConfig });
  };


  if (!localData || !connector) {
    return <p className="text-gray-500">No connector selected or data loaded.</p>;
  }

  const inputClass = "w-full p-2 bg-gray-800 border border-gray-700 rounded text-gray-300 focus:ring-1 focus:ring-green-500 focus:border-green-500";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1";
  const disabledInputClass = `${inputClass} bg-gray-700 cursor-not-allowed opacity-70`;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="connectorName" className={labelClass}>Name</label>
        <input
          type="text"
          id="connectorName"
          name="name"
          value={localData.name || ''}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="connectorType" className={labelClass}>Type (e.g., DB9, JST-XH)</label>
        <input
          type="text"
          id="connectorType"
          name="type"
          value={localData.type || ''}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="connectorGender" className={labelClass}>Gender</label>
        <select 
          id="connectorGender" 
          name="gender" 
          value={localData.gender || 'Unknown'}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-md font-semibold text-green-500 mb-2">Layout Configuration</h4>
        {isLayoutLocked && (
            <p className="text-xs text-yellow-400 bg-yellow-900/50 p-2 rounded mb-3">
                Layout properties (rows, columns, etc.) are locked because this connector has active wire connections. To modify layout, please remove all wires first or use the 'Edit in Builder' option which may re-generate pins.
            </p>
        )}
        <div>
          <label htmlFor="connectorRows" className={labelClass}>Rows</label>
          <input
            type="number"
            id="connectorRows"
            name="rows"
            value={localData.rows || ''}
            onChange={handleChange}
            className={isLayoutLocked ? disabledInputClass : inputClass}
            disabled={isLayoutLocked}
            min="1"
          />
        </div>
        <div>
          <label htmlFor="connectorCols" className={labelClass}>Columns</label>
          <input
            type="number"
            id="connectorCols"
            name="cols"
            value={localData.cols || ''}
            onChange={handleChange}
            className={isLayoutLocked ? disabledInputClass : inputClass}
            disabled={isLayoutLocked}
            min="1"
          />
        </div>
         {/* Example for a boolean config option */}
        {localData.config && typeof localData.config.centerPinsHorizontal === 'boolean' && (
            <div>
            <label htmlFor="centerPinsHorizontal" className={`${labelClass} mt-2 flex items-center`}>
                <input
                type="checkbox"
                id="centerPinsHorizontal"
                name="centerPinsHorizontal" // This name is for the config object
                checked={localData.config.centerPinsHorizontal ?? false}
                onChange={handleConfigChange} // Use handleConfigChange for config properties
                className={`mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500 ${isLayoutLocked ? 'cursor-not-allowed' : ''}`}
                disabled={isLayoutLocked}
                />
                Center Pins Horizontally
            </label>
            </div>
        )}
      </div>

      {/* Add more fields for other ConnectorConfig properties as needed */}
      {/* For dynamic config from a schema, we would iterate and generate fields here */}

      <div className="mt-6 border-t border-gray-700 pt-4">
        <button 
          onClick={onEdit} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Edit in Builder (Advanced)
        </button>
      </div>
    </div>
  );
};
