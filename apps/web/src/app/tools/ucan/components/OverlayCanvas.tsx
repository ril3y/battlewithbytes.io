'use client';

/**
 * OverlayCanvas - Grid Layout Renderer for Overlay Widgets
 *
 * Renders widgets in a CSS grid layout based on layout definition.
 * Dynamically displays decoded CAN data through appropriate widget components.
 */

import React from 'react';
import type { Layout, WidgetBinding, DecodedMessage } from '../overlays/types';
import { LEDWidget } from '../overlays/widgets/LEDWidget';
import { SwitchWidget } from '../overlays/widgets/SwitchWidget';
import { GaugeWidget } from '../overlays/widgets/GaugeWidget';
import { BarWidget } from '../overlays/widgets/BarWidget';
import { NumberWidget } from '../overlays/widgets/NumberWidget';
import { TextWidget } from '../overlays/widgets/TextWidget';
import { VoltageWidget } from '../overlays/widgets/VoltageWidget';
import { TemperatureWidget } from '../overlays/widgets/TemperatureWidget';
import { AnalogWidget } from '../overlays/widgets/AnalogWidget';
import { GraphWidget } from '../overlays/widgets/GraphWidget';
import { BitfieldWidget } from '../overlays/widgets/BitfieldWidget';

interface OverlayCanvasProps {
  layout: Layout;
  widgets: WidgetBinding[];
  decodedMessages: Map<string, DecodedMessage>;
  selectedMessageId?: string;
  isFullScreen?: boolean; // Optional flag for full-screen mode styling
}

const OverlayCanvasComponent: React.FC<OverlayCanvasProps> = ({
  layout,
  widgets,
  decodedMessages,
  selectedMessageId,
  isFullScreen = false,
}) => {
  // Create widget lookup map - memoize to avoid recreation
  const widgetMap = React.useMemo(() =>
    new Map(widgets.map((w) => [w.id, w])),
    [widgets]
  );

  // Grid style - adjust padding and gap for full-screen mode
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${layout.gridColumns || 12}, 1fr)`,
    gridTemplateRows: `repeat(${layout.gridRows || 12}, 1fr)`,
    gap: isFullScreen ? '12px' : '8px',
    padding: isFullScreen ? '24px' : '16px',
    height: '100%',
    width: '100%',
    backgroundColor: layout.backgroundColor || '#0a0a0a',
  };

  /**
   * Render a widget based on its type and current data
   * Memoized to avoid re-rendering unchanged widgets
   */
  const renderWidget = React.useCallback((widgetId: string) => {
    const widget = widgetMap.get(widgetId);
    if (!widget) {
      return (
        <div className="flex items-center justify-center text-red-400 text-xs">
          Widget {widgetId} not found
        </div>
      );
    }

    // Get decoded message for this widget
    const decodedMsg = decodedMessages.get(widget.messageId);
    if (!decodedMsg) {
      // Show more helpful waiting message with CAN ID and message name
      const messageName = widget.config.label || widget.fieldName;
      return (
        <div className="flex flex-col items-center justify-center text-gray-500 text-xs p-2 text-center">
          <div className="font-semibold">{messageName}</div>
          <div className="text-gray-600 mt-1">Waiting for {widget.messageId}</div>
        </div>
      );
    }

    // Get field value
    const field = decodedMsg.fields[widget.fieldName];
    if (!field) {
      return (
        <div className="flex flex-col items-center justify-center text-yellow-400 text-xs p-2 text-center">
          <div className="font-semibold">{widget.config.label || widget.fieldName}</div>
          <div className="text-yellow-500 mt-1">Field &quot;{widget.fieldName}&quot; not found in {widget.messageId}</div>
        </div>
      );
    }

    // Render appropriate widget based on type
    const { config } = widget;

    try {
      switch (config.type) {
        case 'led':
          return (
            <LEDWidget
              config={config}
              value={field.value as boolean}
              valid={field.valid}
            />
          );

        case 'switch':
          return (
            <SwitchWidget
              config={config}
              value={field.value as boolean}
              valid={field.valid}
            />
          );

        case 'gauge':
          return (
            <GaugeWidget
              config={config}
              value={field.value as number}
              unit={field.unit}
              valid={field.valid}
            />
          );

        case 'bar':
          return (
            <BarWidget
              config={config}
              value={field.value as number}
              unit={field.unit}
              valid={field.valid}
            />
          );

        case 'number':
          return (
            <NumberWidget
              config={config}
              value={field.value as number}
              unit={field.unit}
              valid={field.valid}
            />
          );

        case 'text':
          return (
            <TextWidget
              config={config}
              value={String(field.value)}
              valid={field.valid}
            />
          );

        case 'voltage':
          return (
            <VoltageWidget
              config={config}
              value={field.value as number}
              valid={field.valid}
            />
          );

        case 'temperature':
          return (
            <TemperatureWidget
              config={config}
              value={field.value as number}
              valid={field.valid}
            />
          );

        case 'analog':
          return (
            <AnalogWidget
              config={config}
              value={field.value as number}
              unit={field.unit}
              valid={field.valid}
            />
          );

        case 'graph':
          return (
            <GraphWidget
              config={config}
              value={field.value as number}
              valid={field.valid}
            />
          );

        case 'bitfield':
          return (
            <BitfieldWidget
              config={config}
              value={field.value as number}
              valid={field.valid}
            />
          );

        default:
          return (
            <div className="flex items-center justify-center text-gray-500 text-xs">
              Unknown widget type: {(config as { type: string }).type}
            </div>
          );
      }
    } catch (error) {
      return (
        <div className="flex items-center justify-center text-red-400 text-xs">
          Error: {error instanceof Error ? error.message : String(error)}
        </div>
      );
    }
  }, [widgetMap, decodedMessages]);

  return (
    <div style={gridStyle}>
      {layout.widgets.map((layoutWidget) => {
        const { widgetId, position } = layoutWidget;

        // Check if this widget is associated with the selected message
        const widget = widgetMap.get(widgetId);
        const isHighlighted = selectedMessageId && widget?.messageId === selectedMessageId;

        const cellStyle: React.CSSProperties = {
          gridColumn: `${position.x + 1} / span ${position.width || 1}`,
          gridRow: `${position.y + 1} / span ${position.height || 1}`,
          minHeight: '0',
          minWidth: '0',
          position: 'relative',
        };

        return (
          <div key={widgetId} style={cellStyle}>
            {isHighlighted && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  border: '3px solid #fbbf24',
                  borderRadius: '8px',
                  boxShadow: '0 0 20px rgba(251, 191, 36, 0.6), inset 0 0 20px rgba(251, 191, 36, 0.2)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            )}
            {renderWidget(widgetId)}
          </div>
        );
      })}
    </div>
  );
};

// Memoize and export with display name
OverlayCanvasComponent.displayName = 'OverlayCanvas';
export const OverlayCanvas = React.memo(OverlayCanvasComponent);
