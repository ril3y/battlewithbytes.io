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
} from 'reactflow';
// Import ReactFlow styles first, then our custom styles will override them
import 'reactflow/dist/style.css';

import { useWireMapperStore } from '../store/useWireMapperStore';
import ContextMenu from './ContextMenu'; // Use default import
// Import our WireMapper CSS explicitly (even though it may be imported elsewhere)
import '../wiremapper.css';
import { Connector as ConnectorType, Pin, Mapping, WireMapperSettings } from '../types';
import type { PinIdentifier } from '../types';
import ConnectorNode from './ConnectorNode';

// Define the shape of context menu options for clarity (Restored)
interface ContextMenuOption {
  label: string;
  action: () => void;
  danger?: boolean;
}

// Define the node types for React Flow
const nodeTypes = { connectorNode: ConnectorNode };

const ConnectorCanvas: React.FC = () => {
  const {
    connectors,
    mappings,
    addMapping,
    updateConnectorPosition,
    rotateConnector, // Add rotateConnector here
    settings,
    setSelectedConnectorId,
    setSelectedPin,
    removeConnector,
    selectedConnectorId, // Add selectedConnectorId here
  } = useWireMapperStore();

  // Ref for the flow container
  const flowContainerRef = useRef<HTMLDivElement>(null);

  // Ref for the ContextMenu component
  const menuRef = useRef<HTMLDivElement>(null);

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<ConnectorType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State for context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; options: ContextMenuOption[]; nodeId?: string } | null>(null);

  // Effect to handle clicks outside the context menu
  useEffect(() => {
    // Only add listener if menu is open
    if (!contextMenu) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      // If the menu exists and the click is outside the menu element
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    };

    // Add listener on mount
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup listener on unmount or when menu closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]); // Re-run effect when contextMenu state changes

  // Effect for 'R' key to rotate selected node
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const targetElement = event.target as HTMLElement;
      // Ignore if typing in an input, textarea, or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetElement.tagName)) {
        return;
      }

      if ((event.key === 'r' || event.key === 'R') && selectedConnectorId) {
        event.preventDefault(); // Prevent default browser action if any
        rotateConnector(selectedConnectorId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [rotateConnector, selectedConnectorId]); // Add dependencies

  // Effect to transform store connectors into React Flow nodes
  useEffect(() => {
    const rfNodes: ReactFlowNode<ConnectorType>[] = connectors.map((connector) => ({
      id: connector.id,
      type: 'connectorNode',
      position: { x: connector.x || 0, y: connector.y || 0 },
      data: connector,
      dragHandle: '.connector-drag-handle',
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
      console.log('[Canvas] Node clicked:', node.id);
      setSelectedConnectorId(node.id);
      setSelectedPin(null, null);
    },
    [setSelectedConnectorId, setSelectedPin]
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: ReactFlowNode<ConnectorType>) => {
      event.preventDefault(); // Ensure this is first
      event.stopPropagation();
      setSelectedConnectorId(node.id); // Select the node on right-click

      const options: ContextMenuOption[] = [
        {
          label: 'Properties',
          action: () => {
            console.log('Properties for:', node.data.name);
            // TODO: Implement properties panel or modal
            closeContextMenu();
          },
        },
        {
          label: 'Rotate [R]',
          action: () => {
            rotateConnector(node.id);
            closeContextMenu();
          },
        },
        {
          label: 'Delete',
          action: () => {
            removeConnector(node.id);
            closeContextMenu();
          },
          danger: true,
        },
      ];

      // Calculate menu position
      if (!flowContainerRef.current) return;
      const containerRect = flowContainerRef.current.getBoundingClientRect();
      const menuX = event.clientX - containerRect.left;
      const menuY = event.clientY - containerRect.top;

      console.log('[Canvas] Node context menu for:', node.id, menuX, menuY);
      setContextMenu({
        x: menuX,
        y: menuY,
        nodeId: node.id,
        options,
      });
    },
    [removeConnector, rotateConnector]
  );

  const handlePaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault(); // Ensure this is first
    console.log('[Canvas] handlePaneContextMenu Fired! Attempting to prevent default.'); // Adjusted log
  }, []); // Empty dependencies for now

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const visibleEdges = settings.showWires ? edges : [];

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
        onNodeContextMenu={handleNodeContextMenu} // Still needed for node-specific menu
        onPaneContextMenu={handlePaneContextMenu} // Kept, to see if React Flow calls it
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={{
          stroke: 'var(--accent-primary)',
          strokeWidth: 2,
          opacity: 0.7,
        }}
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
      {contextMenu && (
        <ContextMenu
          ref={menuRef} // Attach the ref here
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextMenu.options}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

export default ConnectorCanvas;
