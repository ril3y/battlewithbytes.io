import React, { useState, useEffect } from 'react';
import type { ComponentDefinition } from '../../lib/component-library';
import { generateComponent } from '../../lib/component-library';
import { ConfigFormField, type ConfigFieldValue } from './ConfigFormField';
import type { ConnectionPoint } from '../../lib/core/types';

interface ComponentConfigModalProps {
  component: ComponentDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    config: Record<string, unknown>,
    generatedPoints?: ConnectionPoint[],
    dimensions?: { width: number; height: number },
    svgContent?: string,
    blockName?: string,
  ) => void;
  initialConfig?: Record<string, unknown>;
  initialName?: string;
  existingConnectionPoints?: ConnectionPoint[];
}

/**
 * ComponentConfigModal
 *
 * Modal that appears when the user picks a configurable component.
 * Drives form fields off the component's config schema, and renders a live
 * preview by calling the library generator on each config change.
 */
export const ComponentConfigModal: React.FC<ComponentConfigModalProps> = ({
  component,
  isOpen,
  onClose,
  onConfirm,
  initialConfig,
  initialName,
  existingConnectionPoints,
}) => {
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [name, setName] = useState<string>('');
  const [previewSVG, setPreviewSVG] = useState<string>('');
  const [generatedPoints, setGeneratedPoints] = useState<ConnectionPoint[]>([]);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Initialize config with default values or existing config when component changes
  useEffect(() => {
    if (!component) return;
    if (initialConfig) {
      setConfig(initialConfig);
    } else {
      const defaults: Record<string, unknown> = {};
      Object.entries(component.metadata.config).forEach(([fieldName, fieldSchema]) => {
        defaults[fieldName] = fieldSchema.default;
      });
      setConfig(defaults);
    }
    // Initialize the block-name field — existing block label when editing,
    // otherwise the component's catalog name as a sensible default.
    setName(initialName ?? component.metadata.name);
  }, [component, initialConfig, initialName]);

  // Regenerate preview SVG, dimensions, and connection points when config changes
  useEffect(() => {
    if (!component) return;
    try {
      const result = generateComponent(component.metadata.id, config);
      setPreviewSVG(result.svg);
      setDimensions(result.dimensions);

      // Map library connection points to internal ConnectionPoint, preserving
      // existing IDs by label so wires don't get orphaned when editing.
      const points: ConnectionPoint[] = result.connectionPoints.map((cp) => {
        const existingMatch = existingConnectionPoints?.find((ep) => ep.label === cp.label);
        return {
          id: existingMatch?.id ?? cp.id,
          x: cp.x,
          y: cp.y,
          label: cp.label,
          color: cp.color ?? '#9aa0a6',
          shape: cp.shape,
          radius: cp.radius,
          voltage: cp.voltage,
          currentRating: cp.currentRating,
          description: cp.description,
          labelOffsetX: cp.labelOffsetX,
          labelOffsetY: cp.labelOffsetY,
          isGenerated: true,
        };
      });
      setGeneratedPoints(points);
    } catch (err) {
      console.error(`Error generating ${component.metadata.id}:`, err);
      setPreviewSVG('');
      setGeneratedPoints([]);
      setDimensions(null);
    }
  }, [component, config, existingConnectionPoints]);

  // Validate config
  useEffect(() => {
    if (!component) {
      setIsValid(false);
      return;
    }
    let valid = true;
    Object.entries(component.metadata.config).forEach(([fieldName, fieldSchema]) => {
      const value = config[fieldName];
      if (value === undefined || value === null || value === '') {
        valid = false;
        return;
      }
      if (fieldSchema.type === 'number') {
        const numValue = parseFloat(String(value));
        if (isNaN(numValue)) { valid = false; return; }
        if (fieldSchema.min !== undefined && numValue < fieldSchema.min) { valid = false; return; }
        if (fieldSchema.max !== undefined && numValue > fieldSchema.max) { valid = false; return; }
      }
    });
    setIsValid(valid);
  }, [component, config]);

  if (!isOpen || !component) return null;

  const handleFieldChange = (fieldName: string, value: ConfigFieldValue) => {
    setConfig({ ...config, [fieldName]: value });
  };

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(config, generatedPoints, dimensions ?? undefined, previewSVG, name);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
      }}
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: '#0a0a0a',
          border: '2px solid #00ffa0',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 10px 50px rgba(0, 255, 160, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #333', background: '#111' }}>
          <h2 style={{ margin: 0, color: '#00ffa0', fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            Configure: {component.metadata.name}
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#888', fontSize: '13px', lineHeight: '1.5' }}>
            {component.metadata.description}
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', borderRight: '1px solid #333' }}>
            {/* Block name — visible label on the canvas. Lives on the block, not in componentConfig. */}
            <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #2a2a2a' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#00ffa0',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}
              />
              <div style={{ marginTop: '6px', color: '#888', fontSize: '11px', lineHeight: '1.4' }}>
                The label rendered on the canvas (also editable inline by double-clicking it).
              </div>
            </div>

            {Object.keys(component.metadata.config).length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                No configuration required
              </div>
            ) : (
              Object.entries(component.metadata.config).map(([fieldName, fieldSchema]) => {
                let syncValue: number | undefined = undefined;
                if (fieldSchema.syncWithField && config[fieldSchema.syncWithField] !== undefined) {
                  syncValue = Number(config[fieldSchema.syncWithField]);
                }
                return (
                  <ConfigFormField
                    key={fieldName}
                    fieldName={fieldName}
                    fieldSchema={fieldSchema}
                    value={config[fieldName] as ConfigFieldValue}
                    onChange={(value) => handleFieldChange(fieldName, value)}
                    syncValue={syncValue}
                  />
                );
              })
            )}
          </div>

          <div style={{ width: '400px', padding: '24px', display: 'flex', flexDirection: 'column', background: '#0f0f0f' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#00ffa0', fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold' }}>
              PREVIEW
            </h3>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1a1a1a',
                borderRadius: '8px',
                border: '1px solid #333',
                padding: '20px',
              }}
            >
              <div
                style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                dangerouslySetInnerHTML={{ __html: previewSVG }}
              />
            </div>
            {generatedPoints.length > 0 && (
              <div style={{ marginTop: '16px', color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>
                Connection Points: <span style={{ color: '#00ffa0' }}>{generatedPoints.length}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#111' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            style={{
              padding: '10px 24px',
              background: isValid ? '#00ffa0' : '#2a4d3a',
              color: isValid ? '#000' : '#666',
              border: 'none',
              borderRadius: '5px',
              cursor: isValid ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            {initialConfig ? 'Update Component' : 'Add to Canvas'}
          </button>
        </div>
      </div>
    </div>
  );
};
