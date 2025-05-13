'use client';

import React from 'react';
import { Connector } from '../types';
import { useWireMapperStore } from '../store/useWireMapperStore';

interface ConnectorDetailProps {
  connector: Connector;
  onEdit: () => void; // Prop for edit action
}

export const ConnectorDetail: React.FC<ConnectorDetailProps> = ({ connector, onEdit }) => {
  const { removeConnector, setSelectedConnector } = useWireMapperStore();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete connector "${connector.name}"? This cannot be undone and will remove associated mappings.`)) {
      removeConnector(connector.id);
      setSelectedConnector(null); // Deselect after deleting
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-green-400">{connector.name}</h3>
          <p className="text-sm text-gray-400">Type: {connector.type || 'N/A'}</p>
          <p className="text-sm text-gray-400">Gender: {connector.gender || 'N/A'}</p>
          <p className="text-sm text-gray-400">Pins: {connector.pins.length} ({connector.layout === 'custom' ? 'Custom Layout' : `${connector.rows || '?'}x${connector.cols || '?'}`})</p>
        </div>
        <div className="flex space-x-2 flex-shrink-0"> {/* Prevent buttons wrapping */}
           {/* Edit Button */}
           <button
             onClick={onEdit} // Call the passed function
             className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
             title="Edit Connector Details" // Add tooltip
           >
             Edit
           </button>
           {/* Delete Button */}
           <button
             onClick={handleDelete}
             className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
             title="Delete Connector"
           >
             Delete
           </button>
        </div>
      </div>
      {/* Add more details or a simplified pin list/preview if needed */}
    </div>
  );
};
