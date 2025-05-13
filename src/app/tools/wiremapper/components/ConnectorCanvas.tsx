import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
  NodeChange,
  applyNodeChanges,
  Background,
  Controls,
  Handle,
  BackgroundVariant,
  ConnectionMode, // <-- Import ConnectionMode
} from 'reactflow';
// Import ReactFlow styles first, then our custom styles will override them
import 'reactflow/dist/style.css';

import { useWireMapperStore } from '../store/useWireMapperStore';
// Import our WireMapper CSS explicitly (even though it may be imported elsewhere)
import '../wiremapper.css';
import { Connector as ConnectorType, Pin, Mapping, WireMapperSettings } from '../types'; // Use Mapping
import type { PinIdentifier } from '../types';
import ConnectorNode from './ConnectorNode'; 

// Define the node types for React Flow
const nodeTypes = { connectorNode: ConnectorNode };

const ConnectorCanvas: React.FC = () => {
  const {
    connectors, 
    mappings, 
    addMapping, 
    updateConnectorPosition, 
    settings,
    setSelectedConnectorId,
    setSelectedPin
    // Remove selectors for state now handled locally or by ReactFlow 
    // e.g., selectedPin, connectingPin, setSelectedPin, setConnectingPin etc.
  } = useWireMapperStore();

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<ConnectorType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Effect to transform store connectors into React Flow nodes
  useEffect(() => {
    const rfNodes: Node<ConnectorType>[] = connectors.map((connector) => ({
      id: connector.id,
      type: 'connectorNode',
      // Use the top-level x and y properties from the Connector type
      position: { x: connector.x || 0, y: connector.y || 0 }, 
      data: connector, 
      dragHandle: '.connector-drag-handle', // Specify the drag handle
    }));
    // Directly set the nodes. React Flow's internal state and onNodesChange
    // should handle preserving drag state etc., unless the node data itself causes a full re-render.
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
      // Let CSS handle the styling - only add custom color if specified in the mapping
      // This allows dark mode styles from wiremapper.css to take effect
      style: mapping.color ? { stroke: mapping.color } : undefined,
      // Add animated class for proper animation in dark mode
      className: settings.simplifyConnections ? '' : 'animated',
      zIndex: 10 // Set zIndex for edge layering
    }));
    console.log('[Canvas] Mappings changed, attempting to set edges:', rfEdges);
    setEdges(rfEdges);
  }, [mappings, settings.simplifyConnections, setEdges]);

  // Callback to check if a connection is valid
  const isValidConnectionCheck = useCallback((connection: Connection) => {
    if (!connection.source || !connection.sourceHandle || !connection.target || !connection.targetHandle) {
      // Connection is missing basic data, should not happen with valid handles
      console.warn('[Canvas] isValidConnection: Incomplete connection data.', connection);
      return false;
    }

    // With ConnectionMode.Loose, we don't need to check handle types (source-to-target)
    // const isSourceHandleSource = connection.sourceHandle.endsWith('-source');
    // const isTargetHandleTarget = connection.targetHandle.endsWith('-target');
    //
    // if (!isSourceHandleSource || !isTargetHandleTarget) {
    //   return false;
    // }

    // Parse pin numbers
    const sourcePin = parseInt(connection.sourceHandle.split('-')[0], 10);
    const targetPin = parseInt(connection.targetHandle.split('-')[0], 10);

    // Prevent connecting a pin to itself (same connector, same pin position)
    if (connection.source === connection.target && sourcePin === targetPin) {
      console.log('[Canvas] isValidConnection: Self-connection attempt blocked for', connection);
      return false;
    }

    // Potentially add other validation rules here if needed
    // e.g., prevent connecting source to source if not in loose mode, etc.
    // For now, default to true if not a self-connection.
    return true;
  }, []);

  // Callback when a new connection is made in React Flow
  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('[Canvas] onConnect triggered:', connection);
      // Parse pin numbers using split logic again
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
          }
          // Add color or other properties if needed later
        };
        console.log('[Canvas] Calling addMapping with structured object:', newMapping);
        addMapping(newMapping); // Pass the single structured object
      } else {
        // This case should ideally not be reached if isValidConnection worked correctly
        console.error('[Canvas] onConnect failed: Invalid connection data received after isValidConnection check.', connection);
      }
    },
    [addMapping]
  );

  // Callback when a node stops dragging
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node<ConnectorType>) => {
      // Update the connector position in the main Zustand store
      updateConnectorPosition(node.id, node.position.x, node.position.y);
    },
    [updateConnectorPosition]
  );

  // Callback when a node is clicked
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<ConnectorType>) => {
      console.log('[Canvas] Node clicked:', node.id);
      setSelectedConnectorId(node.id);
      setSelectedPin(null, null); // Clear pin selection when node is clicked
    },
    [setSelectedConnectorId, setSelectedPin]
  );

  // Define connection line style for when dragging to create a connection
  const connectionLineStyle = {
    stroke: 'var(--accent-primary)',
    strokeWidth: 2,
    opacity: 0.7
  };

  // Filter edges based on showWires setting
  const visibleEdges = settings.showWires ? edges : [];

  return (
    <div className="relative w-full h-full bg-gray-800 overflow-hidden cursor-default rounded-md wire-mapper-flow-container">
       {/* Use w-full h-full to make ReactFlow fill the container */}
      <ReactFlow
        nodes={nodes}
        edges={visibleEdges} /* Only show edges when showWires is true */
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnectionCheck}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={connectionLineStyle}
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
    </div>
  );
};

export default ConnectorCanvas;
