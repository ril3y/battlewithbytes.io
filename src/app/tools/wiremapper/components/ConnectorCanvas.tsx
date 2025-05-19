import React, { useEffect, useCallback, useState, useRef } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node as ReactFlowNode,
  Position,
  NodeChange,
  applyNodeChanges,
  Background,
  Controls,
  Handle,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow, // Added useReactFlow import
} from 'reactflow';
// Import ReactFlow styles first, then our custom styles will override them
import 'reactflow/dist/style.css';

import { useWireMapperStore } from '../store/useWireMapperStore';
import { ContextMenu } from './ContextMenu'; // Added import for new ContextMenu
import '../wiremapper.css';
import { Connector as ConnectorType, Pin, Mapping, WireMapperSettings, ContextMenuOption } from '../types'; // Added ContextMenuOption import
import type { PinIdentifier } from '../types';
import ConnectorNode from './ConnectorNode';

// Define the node types for React Flow
const nodeTypes = { connectorNode: ConnectorNode };

const ConnectorCanvas: React.FC = () => {
  const { 
    connectors, 
    mappings, 
    wires,
    settings, 
    focusedWireId,
    // connectingNodeId, // Removed: Not from store
    // connectionPreview, // Removed: Not from store
    removeConnector, // For context menu
    duplicateConnector, // For context menu
    addMapping, 
    updateMapping, 
    updateConnectorPosition, 
    setSelectedConnectorId, 
    setSelectedPin,
    setFocusedWireId,
  } = useWireMapperStore();

  // Ref for the flow container
  const flowContainerRef = useRef<HTMLDivElement>(null);

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<ConnectorType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { getEdges, screenToFlowPosition, getIntersectingNodes, project } = useReactFlow(); // Added getEdges

  // State for context menu
  const [contextMenuState, setContextMenuState] = useState<{ x: number; y: number; options: ContextMenuOption[]; nodeId: string } | null>(null);

  // Effect to transform store connectors into React Flow nodes
  useEffect(() => {
    const rfNodes: ReactFlowNode<ConnectorType>[] = connectors.map((connector) => ({
      id: connector.id,
      type: 'connectorNode',
      position: { x: connector.x || 0, y: connector.y || 0 },
      data: connector,
    }));
    setNodes(rfNodes);
  }, [connectors, setNodes]);

  // Effect to transform store mappings into React Flow edges
  useEffect(() => {
    const rfEdges: Edge[] = mappings.map((mapping) => ({
      id: mapping.id,
      source: mapping.source.connectorId,
      sourceHandle: `${mapping.source.pinPos}-handle`,
      target: mapping.target.connectorId,
      targetHandle: `${mapping.target.pinPos}-handle`,
      animated: settings.simplifyConnections ? false : true,
      style: mapping.color ? { stroke: mapping.color } : undefined,
      className: settings.simplifyConnections ? '' : 'animated',
      zIndex: 10,
    }));
    console.log('[Canvas] Mappings changed, attempting to set edges:', rfEdges);
    setEdges(rfEdges);
  }, [mappings, settings.simplifyConnections, setEdges]);

  // Callback to check if a connection is valid
  const isValidConnectionCheck = useCallback((connection: Connection) => {
    if (!connection.source || !connection.sourceHandle || !connection.target || !connection.targetHandle) {
      console.warn('[Canvas] isValidConnection: Incomplete connection data.', connection);
      return false;
    }

    const sourcePin = parseInt(connection.sourceHandle.split('-')[0], 10);
    const targetPin = parseInt(connection.targetHandle.split('-')[0], 10);

    if (connection.source === connection.target && sourcePin === targetPin) {
      console.log('[Canvas] isValidConnection: Self-connection attempt blocked for', connection);
      return false;
    }

    return true;
  }, []);

  // Callback when a new connection is made in React Flow
  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('[Canvas] onConnect triggered:', connection);
      const sourcePin = connection.sourceHandle ? parseInt(connection.sourceHandle.split('-')[0], 10) : null;
      const targetPin = connection.targetHandle ? parseInt(connection.targetHandle.split('-')[0], 10) : null;

      if (connection.source && connection.target && sourcePin !== null && targetPin !== null) {
        const newMapping: Omit<Mapping, 'id' | 'wireId'> = {
          source: {
            connectorId: connection.source,
            pinPos: sourcePin,
          },
          target: {
            connectorId: connection.target,
            pinPos: targetPin,
          },
        };
        console.log('[Canvas] Calling addMapping with structured object:', newMapping);
        addMapping(newMapping);
      } else {
        console.error('[Canvas] onConnect failed: Invalid connection data received after isValidConnection check.', connection);
      }
    },
    [addMapping]
  );

  // Callback when a node stops dragging
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode<ConnectorType>) => {
      updateConnectorPosition(node.id, node.position.x, node.position.y);
    },
    [updateConnectorPosition]
  );

  // Callback when a node is clicked
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: ReactFlowNode<ConnectorType>) => {
      console.log('!!!!!! [Canvas] Node clicked EVENT FIRED:', node.id);
      setSelectedConnectorId(node.id);
      setSelectedPin(null, null);
    },
    [setSelectedConnectorId, setSelectedPin]
  );

  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    console.log('!!!!!! [Canvas] PANE CLICKED EVENT FIRED', event);
    // Clear selections when clicking on the background
    setSelectedConnectorId(null);
    setSelectedPin(null, null);
    setFocusedWireId(null); // Clear focused wire to show all wires
    
    // Also clear copied net when clicking on empty area to exit paste mode
    const state = useWireMapperStore.getState();
    if (state.copiedNet) {
      state.setCopiedNet(null);
    }
    
    closeContextMenu(); // Close context menu if open
  }, [setSelectedConnectorId, setSelectedPin, setFocusedWireId]);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: ReactFlowNode<ConnectorType>) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Since we're using createPortal to render to document.body, use client coordinates
      const menuX = event.clientX;
      const menuY = event.clientY;

      console.log(`[Canvas] Node context menu for: ${node.id} at (${menuX}, ${menuY})`);

      const options: ContextMenuOption[] = [
        {
          label: `Duplicate '${node.data.name || node.id}'`,
          action: () => {
            duplicateConnector(node.id);
            closeContextMenu();
          },
        },
        {
          label: `Delete '${node.data.name || node.id}'`,
          action: () => {
            // removeConnector in the store already handles removing associated mappings and wires
            removeConnector(node.id);
            closeContextMenu();
          },
          danger: true,
        },
        // TODO: Add 'Properties' option later if needed
        // { label: 'Properties', action: () => { console.log(`Properties for node: ${node.id}`); closeContextMenu(); } },
      ];

      setContextMenuState({
        x: menuX,
        y: menuY,
        nodeId: node.id,
        options,
      });
    },
    [duplicateConnector, removeConnector, getEdges] // Removed storeRemoveEdges, added getEdges
  );

  const closeContextMenu = () => {
    setContextMenuState(null);
  };

  // Filter edges based on focused wire ID
  const visibleEdges = (() => {
    if (!settings.showWires) return []; // Don't show any wires if showWires is false
    
    if (focusedWireId) {
      // Debug log to see what's happening with the filtering
      console.log(`Filtering edges for wireId: ${focusedWireId}`);
      console.log('Available edges:', edges.map(e => ({ id: e.id, wireId: e.data?.wireId })));
      
      // If a wire is focused, only show edges with that wireId
      const filtered = edges.filter(edge => edge.data?.wireId === focusedWireId);
      console.log('Filtered edges:', filtered.length);
      
      // If no edges match the wireId, it might be stored differently
      // Try using the mapping ID instead (as a fallback)
      if (filtered.length === 0) {
        console.log('No edges found with wireId, trying to match by mapping ID');
        return edges.filter(edge => {
          // Try to match by id which might be the mapping id
          return edge.id.includes(focusedWireId) || 
                (edge.data && edge.data.id === focusedWireId);
        });
      }
      
      return filtered;
    }
    
    // Otherwise show all edges
    return edges;
  })();

  // Add CSS to make edges non-interactive and handle global right-click events
  useEffect(() => {
    // Add a style element to the document head
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .react-flow__edge {
        pointer-events: none !important;
      }
      .react-flow__edge-path {
        pointer-events: none !important;
      }
      .react-flow__connection-path {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    // We've removed the global right-click handler since it was causing duplicate context menus
    // The original context menu in ConnectorNode.tsx will handle pin right-clicks
    
    // Cleanup function to remove the style element when component unmounts
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div 
      ref={flowContainerRef} // Attach ref here
      className="relative w-full h-full bg-gray-800 overflow-hidden cursor-default rounded-md wire-mapper-flow-container"
      onContextMenuCapture={(event) => event.preventDefault()} // Use capturing phase on the container
    >
      <ReactFlow
        nodes={nodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnectionCheck}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onNodeContextMenu={handleNodeContextMenu} // Assign the new handler
        onPaneClick={handlePaneClick} // Added for testing pane clicks
        nodeTypes={nodeTypes}
        elementsSelectable={true} // Explicitly set
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={{
          stroke: 'var(--accent-primary)',
          strokeWidth: 2,
          opacity: 0.7,
        }}
        edgesFocusable={false} // Make edges not focusable
        edgesUpdatable={false} // Make edges not updatable
        fitView
        snapToGrid={settings.snapToGrid}
        snapGrid={[settings.gridSize || 20, settings.gridSize || 20]}
        proOptions={{ hideAttribution: true }}
        className="bg-gray-800 wire-mapper-flow"
      >
        <Controls
          position="bottom-left"
          showZoom={true}
          showFitView={true}
        />
        
        {/* Focused Wire Indicator */}
        {focusedWireId && (
          <div className="absolute top-2 right-2 bg-gray-900 text-white px-3 py-1 rounded-md flex items-center gap-2 text-sm">
            <span>Showing only selected connection</span>
            <button 
              onClick={() => setFocusedWireId(null)}
              className="text-green-400 hover:text-green-300 text-xs bg-gray-800 px-2 py-1 rounded"
            >
              Show All
            </button>
          </div>
        )}
        
        <Controls
          showInteractive={false}
          className="minimal-controls"
        />
        {settings.showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={settings.gridSize || 20}
            size={1.5}
            color="#627287"
          />
        )}
      </ReactFlow>
      {contextMenuState && (
        <ContextMenu
          x={contextMenuState.x}
          y={contextMenuState.y}
          options={contextMenuState.options}
          onClose={closeContextMenu}
          containerRef={flowContainerRef} // Pass the container ref
        />
      )}
    </div>
  );
};

export default ConnectorCanvas;
