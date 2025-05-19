'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { WireMapperProject, Connector } from '../types';

// Import components directly - these will be properly resolved
// since they're co-located in the same directory
import ConnectorCanvas from './ConnectorCanvas';
import { ConnectorBuilder } from './ConnectorBuilder';
import { ConnectorDetail } from './ConnectorDetail';
import { MappingList } from './MappingList';
import { ProjectControls } from './ProjectControls';
import { PinDetail } from './PinDetail';
import { Modal } from './Modal';

export const WireMapper: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null); // State for connector being edited

  const { 
    projectName, 
    connectors, 
    mappings, 
    selectedPin,
    selectedConnectorId,
    settings,
    loadProject,
    clearProject,
    updateSettings,
    setMode, // Add setMode action
  } = useWireMapperStore();

  const selectedConnector = useMemo(() => 
    connectors.find(c => c.id === selectedConnectorId), 
    [connectors, selectedConnectorId]
  );

  // Log state values on re-render
  console.log('[WireMapper] Rendering. selectedConnectorId:', selectedConnectorId);
  console.log('[WireMapper] Rendering. selectedPin (object):', JSON.stringify(selectedPin));
  console.log('[WireMapper] Rendering. derived selectedConnector (object):', selectedConnector ? selectedConnector.id : null, selectedConnector);

  // Load from localStorage on mount if available
  useEffect(() => {
    try {
      // Load project data
      const savedProject = localStorage.getItem('wireMapperProject');
      if (savedProject) {
        loadProject(JSON.parse(savedProject));
      }
      
      // Load settings data
      const savedSettings = localStorage.getItem('wireMapperSettings');
      if (savedSettings) {
        updateSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }, [loadProject, updateSettings]);

  // Auto-save to localStorage when state changes
  useEffect(() => {
    try {
      // Always save, even with empty connectors
      const project: WireMapperProject = {
        projectName,
        connectors,
        mappings
      };
      localStorage.setItem('wireMapperProject', JSON.stringify(project));
    } catch (error) {
      console.error('Failed to save project to localStorage:', error);
    }
  }, [projectName, connectors, mappings]);
  
  // Save settings separately
  useEffect(() => {
    try {
      localStorage.setItem('wireMapperSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  // Callback for ProjectControls to open builder for NEW connector
  const handleNewConnector = () => {
    setEditingConnector(null); // Ensure we are in create mode
    setShowBuilder(true);
  };

  // Callback for Edit button to open builder for EXISTING connector
  const handleEditConnector = (connector: Connector) => {
    setEditingConnector(connector); // Set the connector to edit
    setShowBuilder(true);
  };

  // Callback for modal close
  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingConnector(null); // Reset editing state on close
  };

  return (
    <div className="flex flex-col gap-6 text-gray-200">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <h2 className="text-xl font-mono text-green-400">
          {projectName || 'New Harness'}
        </h2>
        <ProjectControls 
          onNewConnector={handleNewConnector} // Use updated handler
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Canvas area - Main workspace */}
        <div className="md:col-span-2 bg-gray-950 border border-gray-800 rounded-lg p-4 h-[850px] overflow-hidden">
          {/* Control toolbar */}
          {connectors.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 border-b border-gray-800 pb-3">
              {/* Wire Visibility Toggle */}
              <button
                onClick={() => updateSettings({ showWires: !settings.showWires })}
                className={`px-3 py-1 rounded text-sm transition-colors ${settings.showWires ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                title="Toggle wire visibility"
              >
                {settings.showWires ? 'Hide Wires' : 'Show Wires'}
              </button>
              
              {/* Grid Toggle */}
              <button
                onClick={() => updateSettings({ showGrid: !settings.showGrid })}
                className={`px-3 py-1 rounded text-sm transition-colors ${settings.showGrid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                title="Toggle grid visibility"
              >
                {settings.showGrid ? 'Hide Grid' : 'Show Grid'}
              </button>
              
              {/* Snap to Grid Toggle */}
              <button
                onClick={() => updateSettings({ snapToGrid: !settings.snapToGrid })}
                className={`px-3 py-1 rounded text-sm transition-colors ${settings.snapToGrid ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                title="Toggle snap to grid"
              >
                {settings.snapToGrid ? 'Snap: On' : 'Snap: Off'}
              </button>
              
              {/* Simplify Connections Toggle */}
              <button
                onClick={() => updateSettings({ simplifyConnections: !settings.simplifyConnections })}
                className={`px-3 py-1 rounded text-sm transition-colors ${settings.simplifyConnections ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                title="Toggle animated connections"
              >
                {settings.simplifyConnections ? 'Simple Wires' : 'Animated Wires'}
              </button>
            </div>
          )}
          {connectors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 mb-4">No connectors added yet</p>
              <button
                onClick={() => setShowBuilder(true)}
                className="bg-gray-800 text-green-400 px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Add Connector
              </button>
            </div>
          ) : (
            <ReactFlowProvider>
              <ConnectorCanvas />
            </ReactFlowProvider>
          )}
        </div>

        {/* Details panel */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 h-[700px] overflow-auto">
          {selectedPin ? (
            // Show Pin Detail if a pin is selected
            <div className="mb-6">
              <h3 className="text-green-400 font-mono text-lg mb-2">
                Pin Detail
              </h3>
              <PinDetail />
            </div>
          ) : selectedConnector ? (
            // Show Connector Detail if a connector is selected (and no pin is)
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-green-400 font-mono text-lg">
                  Connector Detail
                </h3>
                <button
                  onClick={() => handleEditConnector(selectedConnector)} // Call edit handler
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
                >
                  Edit
                </button>
              </div>
              <ConnectorDetail 
                connector={selectedConnector} 
                onEdit={() => handleEditConnector(selectedConnector)} 
              />
            </div>
          ) : (
            // Show placeholder if nothing is selected
             <div className="mb-6">
               <h3 className="text-green-400 font-mono text-lg mb-2">
                 Details
               </h3>
               <p className="text-gray-500">
                 Select a connector or pin to view details
               </p>
             </div>
          )}

          {/* Mappings list - always show if mappings exist */} 
          {mappings.length > 0 && (
            <div>
              <h3 className="text-green-400 font-mono text-lg mb-2">Wire Mappings</h3>
              <MappingList filterConnectorId={selectedConnectorId} />
            </div>
          )}
        </div>
      </div>

      {/* Modal for Connector Builder - Render conditionally */}
      {showBuilder && (
        <Modal 
          onClose={handleCloseBuilder} // Use updated close handler
          title={editingConnector ? 'Edit Connector' : 'Connector Builder'} // Dynamic title
        >
          <ConnectorBuilder 
            connectorToEdit={editingConnector} // Pass connector data for editing
            onComplete={handleCloseBuilder} // Use updated close handler
          />
        </Modal>
      )}

    </div>
  );
};
