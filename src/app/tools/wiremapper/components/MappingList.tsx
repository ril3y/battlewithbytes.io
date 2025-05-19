'use client';

import React from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';

interface MappingListProps {
  filterConnectorId?: string | null; // Optional ID to filter by
}

export const MappingList: React.FC<MappingListProps> = ({ filterConnectorId }) => {
  const { connectors, mappings, updateMapping, removeMapping, focusedWireId, setFocusedWireId } = useWireMapperStore();

  const filteredMappings = filterConnectorId
    ? mappings.filter(m => m.source.connectorId === filterConnectorId || m.target.connectorId === filterConnectorId)
    : mappings; // Show all if no filter ID is provided

  // Utility function to get pin name by connector ID and pin position
  const getPinLabel = (connectorId: string, pinPos: number): string => {
    // Check if pinPos is valid
    if (typeof pinPos !== 'number' || isNaN(pinPos)) {
      return 'Invalid Pin Pos';
    }
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) {
      // Shorten connectorId for display if not found
      const shortId = connectorId?.substring(0, 6) ?? 'N/A';
      return `Conn ${shortId}? Pin ${pinPos}`;
    }

    const pin = connector.pins.find(p => p.pos === pinPos);
    if (!pin) {
      // Pin position not found within this connector
      return `Pin ${pinPos} (Not Found)`;
    }

    // Pin found, return its name or default label
    return pin.name || `Pin ${pinPos}`;
  };

  // Utility function to get connector name by ID
  const getConnectorName = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    return connector ? connector.name : 'Unknown';
  };

  if (filteredMappings.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        {filterConnectorId ? 'No connections for this connector' : 'No wire connections yet'}
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-[300px]">
      <table className="w-full text-sm text-left text-gray-300">
        <caption className="sr-only">Wire Mappings - Click a row to highlight that connection</caption>
        <thead className="text-xs uppercase bg-gray-800">
          <tr>
            <th className="px-3 py-2">From</th>
            <th className="px-3 py-2">To</th>
            <th className="px-3 py-2">Net Name</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMappings.map((mapping) => (
            <tr 
              key={mapping.id} 
              className={`border-b border-gray-800 cursor-pointer ${mapping.wireId === focusedWireId ? 'bg-gray-700' : ''}`}
              onClick={() => {
                // Toggle focus: if already focused, clear focus; otherwise set focus
                if (mapping.wireId === focusedWireId) {
                  setFocusedWireId(null);
                } else {
                  setFocusedWireId(mapping.wireId);
                }
              }}
            >
              <td className="px-3 py-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: mapping.color || 'transparent' }} // Ensure color has a fallback
                  />
                  <div>
                    <div className="font-mono text-xs">{getConnectorName(mapping.source.connectorId)}</div>
                    <div className="text-gray-500 text-xs">{getPinLabel(mapping.source.connectorId, mapping.source.pinPos)}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2">
                <div>
                  <div className="font-mono text-xs">{getConnectorName(mapping.target.connectorId)}</div>
                  <div className="text-gray-500 text-xs">{getPinLabel(mapping.target.connectorId, mapping.target.pinPos)}</div>
                </div>
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={mapping.netName || ''} // Ensure value is not undefined
                  onChange={(e) => updateMapping(mapping.id, { netName: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                />
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  {mapping.wireId === focusedWireId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        setFocusedWireId(null);
                      }}
                      className="text-green-400 hover:text-green-300 text-xs"
                    >
                      Show All
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      removeMapping(mapping.id);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
