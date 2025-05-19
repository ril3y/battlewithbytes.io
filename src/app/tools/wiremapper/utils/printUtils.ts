import { Connector, Mapping } from '../types';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ConnectorPreview } from '../components/ConnectorPreview';

/**
 * Opens a print-friendly view in a new window and triggers print dialog
 * @param connectors Array of connector objects
 * @param mappings Array of mapping objects
 */
/**
 * Gets a connector's name or fallback id
 */
const getConnectorName = (connector: Connector): string => {
  return connector.name || `Connector ${connector.id.substring(0, 6)}...`;
};

/**
 * Gets a pin's label with position
 */
const getPinLabel = (pin: any, pinPos: number): string => {
  if (!pin) return `Pin ${pinPos}`;
  return pin.name ? `${pin.name} (Pos: ${pinPos})` : `Pin ${pinPos}`;
};



/**
 * Creates an HTML-based print view of the wire harness
 */
export const openPrintView = (connectors: Connector[], mappings: Mapping[]) => {
  // Open a new window
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  
  if (!printWindow) {
    alert('Please allow pop-ups to use the print feature');
    return;
  }
  
  // Generate connector diagrams HTML using ConnectorPreview component
  let connectorsHTML = '';
  connectors.forEach(connector => {
    // Prepare the connector for rendering with ConnectorPreview
    // Assign pin numbers for display (pos value is used for number display)
    const sortedPins = [...connector.pins]
      .sort((a, b) => a.pos - b.pos)
      .map(pin => ({
        ...pin,
        number: pin.pos, // Ensure pin.number is set for ConnectorPreview
        x: pin.x || 0,   // Ensure x/y are set
        y: pin.y || 0
      }));
    
    // Create the preview element - scale up slightly for print
    const previewElement = React.createElement(ConnectorPreview, {
      connector: {
        ...connector,
        pins: sortedPins,
        shape: connector.shape || 'Rectangle',
        config: connector.config || {}
      },
      scale: 2.0 // Scale up for printing clarity
    });
    
    // Render the component to static HTML
    let connectorSvg = ReactDOMServer.renderToStaticMarkup(previewElement);
    
    // Extract just the SVG part (we'll handle the labels separately)
    const svgMatch = connectorSvg.match(/<svg[\s\S]*?<\/svg>/i);
    const svgContent = svgMatch ? svgMatch[0] : '';
    
    // Clean up the SVG by replacing template literals with actual values
    let processedSvg = svgContent
      .replace(/className="[^"]*"/g, '')
      .replace(/\$\{[^}]*\}/g, function(match) {
        // Replace template literals with actual colors
        if (match.includes('THEME_COLORS.accent')) return '#00ff9d';
        if (match.includes('THEME_COLORS.background')) return '#111826';
        if (match.includes('THEME_COLORS.pinFill')) return '#374151';
        if (match.includes('THEME_COLORS.textLight')) return '#E2E8F0';
        if (match.includes('THEME_COLORS.border')) return '#475569';
        return '';
      });
    
    // Direct approach: Replace the fill colors in the SVG with the actual pin colors
    // Find all circles in the SVG (these represent pins)
    const circleRegex = /<circle[^>]*?cx="(\d+)"[^>]*?cy="(\d+)"[^>]*?<\/circle>/g;
    let circles = [...processedSvg.matchAll(circleRegex)];
    
    // For each pin in the connector
    sortedPins.forEach((pin, index) => {
      if (index < circles.length) {
        // Get the pin's color from config
        const pinColor = pin.config?.color || '#374151';
        
        // Get the complete circle tag for this pin
        const circleMatch = circles[index][0];
        
        // Replace the fill color in the circle tag
        const updatedCircle = circleMatch.replace(/fill="[^"]*"/, `fill="${pinColor}"`);
        
        // Update the SVG with the modified circle tag
        processedSvg = processedSvg.replace(circleMatch, updatedCircle);
      }
    });
    
    
    // Create the connector HTML with SVG and pin legend
    connectorsHTML += `
      <div class="connector-box" style="margin: 20px; display: inline-block; vertical-align: top;">
        <div style="position: relative; border: 2px solid #00ff9d; border-radius: 8px; padding: 20px; background-color: #111826; max-width: 550px;">
          <div style="font-weight: bold; font-size: 16px; color: white; position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background-color: #111826; padding: 5px 15px; border: 2px solid #00ff9d; border-radius: 15px;">
            ${connector.name || 'Unnamed Connector'}
          </div>
          <div style="color: #666; margin-bottom: 15px; text-align: center; font-size: 12px;">
            ${connector.type || `${connector.pins.length}-pin connector`}
          </div>
          
          <div style="display: flex; justify-content: center; margin-top: 10px;">
            ${processedSvg}
          </div>
        </div>
        
        <!-- Pin Legend/List -->
        <div style="margin-top: 15px; font-size: 12px; padding-left: 0;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${sortedPins.map(pin => {
            const pinColor = pin.config?.color || '#555555';
            const pinFunction = pin.netName || pin.desc || '';
            const pinName = pin.name || '';
            const displayText = [pinName, pinFunction].filter(Boolean).join(' (') + (pinFunction ? ')' : '');
            
            return `
              <div style="display: flex; align-items: center; margin-bottom: 6px; min-width: 120px; flex: 0 0 30%;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${pinColor}; margin-right: 6px; flex-shrink: 0;"></div>
                <div style="color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  <strong>${pin.pos}:</strong> ${displayText || `Pin ${pin.pos}`}
                </div>
              </div>
            `;
          }).join('')}
          </div>
        </div>
      </div>
    `;
  });
  
  // Generate connection tables HTML
  let tablesHTML = '';
  connectors.forEach(connector => {
    const relevantMappings = mappings.filter(
      m => m.source.connectorId === connector.id || m.target.connectorId === connector.id
    );
    
    if (relevantMappings.length === 0) return;
    
    tablesHTML += `
      <div style="margin-top: 30px; margin-bottom: 20px;">
        <h3 style="font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
          ${getConnectorName(connector)} Connections
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Own Pin</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Connected To (Connector)</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Connected To (Pin)</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Net Name</th>
            </tr>
          </thead>
          <tbody>
            ${relevantMappings.map(mapping => {
              const isSourceLocal = mapping.source.connectorId === connector.id;
              const localPinPos = isSourceLocal ? mapping.source.pinPos : mapping.target.pinPos;
              const remoteConnectorId = isSourceLocal ? mapping.target.connectorId : mapping.source.connectorId;
              const remotePinPos = isSourceLocal ? mapping.target.pinPos : mapping.source.pinPos;
              
              // Get pin details
              const localPin = connector.pins.find(p => p.pos === localPinPos);
              const remoteConnector = connectors.find(c => c.id === remoteConnectorId);
              const remotePin = remoteConnector?.pins.find(p => p.pos === remotePinPos);
              
              const pinColor = localPin?.config?.color || '#888';
              
              return `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    <div style="display: flex; align-items: center;">
                      <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${pinColor}; margin-right: 8px;"></div>
                      <span>${getPinLabel(localPin, localPinPos)}</span>
                    </div>
                  </td>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    ${remoteConnector ? getConnectorName(remoteConnector) : 'Unknown Connector'}
                  </td>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    ${getPinLabel(remotePin, remotePinPos)}
                  </td>
                  <td style="border: 1px solid #ccc; padding: 8px;">
                    ${mapping.netName || '--'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  });
  
  // Set up the complete HTML structure
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Wire Harness Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: white;
            color: black;
            padding: 20px;
            line-height: 1.5;
          }
          h1, h2, h3 {
            color: #333;
          }
          .connector-box svg {
            border: none !important;
          }
          .row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
          }
          .connector-side {
            flex: 1;
            min-width: 300px;
          }
          .connection-side {
            flex: 1;
            min-width: 450px;
          }
          @media print {
            .no-print {
              display: none;
            }
            @page {
              size: landscape;
              margin: 1cm;
            }
            /* Critical: Force color printing */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Document
          </button>
        </div>
        
        <h1 style="text-align: center; margin-bottom: 30px;">Wire Harness Documentation</h1>
        
        <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Connector Diagrams</h2>
        <div style="display: flex; flex-wrap: wrap;">
          ${connectorsHTML}
        </div>
        
        <h2 style="margin-top: 40px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Connection Tables</h2>
        ${tablesHTML || '<p style="color: #666;">No connections to display.</p>'}
      </body>
    </html>
  `);

  // Add automatic print trigger after content is loaded
  printWindow.document.close();
  printWindow.addEventListener('load', () => {
    // Wait a brief moment to ensure all styles are applied
    setTimeout(() => {
      printWindow.focus();
    }, 500);
  });
};
