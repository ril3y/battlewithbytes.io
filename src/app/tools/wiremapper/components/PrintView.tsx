'use client';

import React from 'react';
import { useWireMapperStore } from '../store/useWireMapperStore';
import { Connector, Mapping } from '../types';

// Connector layout constants - matching those in WiringDiagramPreview but adjusted for print
const CONNECTOR_WIDTH = 120;
const CONNECTOR_HEADER_HEIGHT = 30;
const CONNECTOR_TYPE_HEADER_HEIGHT = 20;
const PIN_ROW_HEIGHT = 28;
const HORIZONTAL_GAP = 100;
const VERTICAL_GAP = 50;

export const PrintView: React.FC = () => {
  const { connectors, mappings } = useWireMapperStore();

  // Helper function to get connector name
  const getConnectorName = (connectorId: string) => {
    const connector = connectors.find(c => c.id === connectorId);
    return connector ? connector.name : 'Unknown Connector';
  };

  // Helper function to get pin label with position
  const getPinLabel = (connectorId: string, pinPos: number): string => {
    if (typeof pinPos !== 'number' || isNaN(pinPos)) {
      return 'Invalid Pin';
    }
    const connector = connectors.find(c => c.id === connectorId);
    if (!connector) {
      return `Pin ${pinPos}`;
    }
    const pin = connector.pins.find(p => p.pos === pinPos);
    if (!pin) {
      return `Pin ${pinPos}`;
    }
    if (pin.name) {
      return `${pin.name} (Pos: ${pinPos})`;
    }
    return `Pin ${pinPos}`;
  };

  // Calculate overall dimensions for the print layout
  const calculatePrintLayout = () => {
    let maxWidth = 0;
    let totalHeight = 0;
    
    // Calculate space needed for connectors
    const connectorRows: Connector[][] = [];
    let currentRow: Connector[] = [];
    let currentRowWidth = 0;
    
    // First arrange connectors in rows
    connectors.forEach(connector => {
      const connectorHeight = CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + 
                            (connector.pins.length * PIN_ROW_HEIGHT);
      
      if (currentRowWidth + CONNECTOR_WIDTH > 800) {
        // Start a new row if this one would be too wide
        connectorRows.push([...currentRow]);
        currentRow = [connector];
        currentRowWidth = CONNECTOR_WIDTH;
      } else {
        // Add to current row
        currentRow.push(connector);
        currentRowWidth += CONNECTOR_WIDTH + HORIZONTAL_GAP;
      }
      
      maxWidth = Math.max(maxWidth, currentRowWidth);
    });
    
    // Add last row if not empty
    if (currentRow.length > 0) {
      connectorRows.push(currentRow);
    }
    
    // Calculate height based on rows
    connectorRows.forEach(row => {
      const maxRowHeight = Math.max(...row.map(connector => 
        CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + (connector.pins.length * PIN_ROW_HEIGHT)
      ));
      totalHeight += maxRowHeight + VERTICAL_GAP;
    });

    // Add space for connection tables (rough estimate)
    totalHeight += connectors.length * 200; // ~200px per connector table
    
    return {
      width: Math.max(maxWidth, 900), // Minimum 900px width
      height: totalHeight,
      connectorRows
    };
  };

  const { width, height, connectorRows } = calculatePrintLayout();

  // Render the connector visual with pins
  const renderConnector = (connector: Connector, x: number, y: number) => {
    const connectorHeight = CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + 
                          (connector.pins.length * PIN_ROW_HEIGHT);
    
    return (
      <g key={connector.id} transform={`translate(${x}, ${y})`}>
        {/* Connector outline */}
        <rect 
          x="0" 
          y="0" 
          width={CONNECTOR_WIDTH} 
          height={connectorHeight}
          stroke="#333"
          strokeWidth="1"
          fill="white"
          rx="4"
          ry="4"
        />
        
        {/* Connector name */}
        <text 
          x={CONNECTOR_WIDTH / 2} 
          y={CONNECTOR_HEADER_HEIGHT / 2}
          textAnchor="middle" 
          dominantBaseline="central"
          fontWeight="bold"
          fontSize="14px"
          fill="#333"
        >
          {connector.name}
        </text>
        
        {/* Connector type/info */}
        <text 
          x={CONNECTOR_WIDTH / 2} 
          y={CONNECTOR_HEADER_HEIGHT + (CONNECTOR_TYPE_HEADER_HEIGHT / 2)}
          textAnchor="middle" 
          dominantBaseline="central"
          fontSize="12px"
          fill="#555"
        >
          {connector.type || `${connector.pins.length}-pin`}
        </text>
        
        {/* Pin Rows */}
        {connector.pins.map((pin, index) => {
          const pinY = CONNECTOR_HEADER_HEIGHT + CONNECTOR_TYPE_HEADER_HEIGHT + (index * PIN_ROW_HEIGHT);
          const pinColor = pin.config?.color || '#888';
          
          return (
            <g key={`pin-${pin.pos}`}>
              {/* Pin circle */}
              <circle 
                cx="15" 
                cy={pinY + (PIN_ROW_HEIGHT / 2)}
                r="10"
                fill={pinColor}
                stroke="#333"
                strokeWidth="1"
              />
              
              {/* Pin position */}
              <text 
                x="15" 
                y={pinY + (PIN_ROW_HEIGHT / 2)}
                textAnchor="middle" 
                dominantBaseline="central"
                fontSize="10px"
                fontWeight="bold"
                fill="white"
              >
                {pin.pos}
              </text>
              
              {/* Pin name/label */}
              <text 
                x="35" 
                y={pinY + (PIN_ROW_HEIGHT / 2)}
                dominantBaseline="central"
                fontSize="12px"
                fill="#333"
              >
                {pin.name || `Pin ${pin.pos}`}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  // Render connection tables
  const renderConnectionTables = () => {
    return connectors.map((connector, index) => {
      const relevantMappings = mappings.filter(
        m => m.source.connectorId === connector.id || m.target.connectorId === connector.id
      );

      if (relevantMappings.length === 0) return null;

      return (
        <div key={`table-${connector.id}`} className="print-connection-table">
          <h3 className="print-table-header">{connector.name} Connections</h3>
          <table className="print-table">
            <thead>
              <tr>
                <th>Own Pin</th>
                <th>Connected To (Connector)</th>
                <th>Connected To (Pin)</th>
                <th>Net Name</th>
              </tr>
            </thead>
            <tbody>
              {relevantMappings.map(mapping => {
                const isSourceLocal = mapping.source.connectorId === connector.id;
                const localPinPos = isSourceLocal ? mapping.source.pinPos : mapping.target.pinPos;
                const remoteConnectorId = isSourceLocal ? mapping.target.connectorId : mapping.source.connectorId;
                const remotePinPos = isSourceLocal ? mapping.target.pinPos : mapping.source.pinPos;
                
                // Get the pin for color indicator
                const localPin = connector.pins.find(p => p.pos === localPinPos);
                const pinColor = localPin?.config?.color || '#888';

                return (
                  <tr key={mapping.id}>
                    <td>
                      <div className="print-pin-cell">
                        <div className="print-pin-color" style={{ backgroundColor: pinColor }}></div>
                        <span>{getPinLabel(connector.id, localPinPos)}</span>
                      </div>
                    </td>
                    <td>{getConnectorName(remoteConnectorId)}</td>
                    <td>{getPinLabel(remoteConnectorId, remotePinPos)}</td>
                    <td>{mapping.netName || '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    });
  };

  // No connectors case
  if (connectors.length === 0) {
    return (
      <div className="print-view">
        <h1 className="print-title">Wire Harness Documentation</h1>
        <p className="print-message">No connectors available to print.</p>
      </div>
    );
  }

  return (
    <div className="print-view">
      <h1 className="print-title">Wire Harness Documentation</h1>
      
      {/* SVG for connector visuals */}
      <div className="print-visual-section">
        <h2 className="print-section-header">Connector Diagrams</h2>
        <svg width={width} height={height * 0.4} className="print-connectors-svg">
          {connectorRows.map((row, rowIndex) => {
            let currentX = 10;
            const rowY = rowIndex * (PIN_ROW_HEIGHT * 10 + VERTICAL_GAP) + 10;
            
            return row.map(connector => {
              const connectorX = currentX;
              currentX += CONNECTOR_WIDTH + HORIZONTAL_GAP;
              return renderConnector(connector, connectorX, rowY);
            });
          })}
        </svg>
      </div>
      
      {/* Tables for connections */}
      <div className="print-tables-section">
        <h2 className="print-section-header">Connection Tables</h2>
        {renderConnectionTables()}
      </div>
      
      {/* Print-specific styles */}
      <style jsx="true">{`
        /* Print view styles */
        .print-view {
          padding: 20px;
          max-width: 100%;
          font-family: Arial, sans-serif;
          color: #000;
          background-color: white;
        }
        
        .print-title {
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
          color: #333;
        }
        
        .print-section-header {
          font-size: 18px;
          margin: 25px 0 15px;
          color: #333;
          border-bottom: 1px solid #ccc;
          padding-bottom: 8px;
        }
        
        .print-visual-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .print-connectors-svg {
          max-width: 100%;
          border: 1px solid #eee;
        }
        
        .print-tables-section {
          page-break-before: auto;
        }
        
        .print-connection-table {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .print-table-header {
          font-size: 16px;
          margin: 15px 0 10px;
          color: #444;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .print-table th, .print-table td {
          border: 1px solid #ccc;
          padding: 8px 12px;
          text-align: left;
        }
        
        .print-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .print-pin-cell {
          display: flex;
          align-items: center;
        }
        
        .print-pin-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          border: 1px solid #333;
        }
        
        .print-message {
          padding: 30px;
          text-align: center;
          color: #666;
        }

        /* Print-specific media query */
        @media print {
          body {
            background-color: white;
          }
          
          .print-view {
            padding: 0;
          }
          
          .print-title {
            margin-top: 0;
          }
          
          .print-connection-table {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintView;
