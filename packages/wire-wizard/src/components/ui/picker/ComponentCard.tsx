import React, { useState, useEffect } from 'react';
import type { ComponentDefinition } from '../../../lib/component-library';
import { generateComponent } from '../../../lib/component-library';

interface ComponentCardProps {
    component: ComponentDefinition;
    onSelect: (component: ComponentDefinition) => void;
    onConfigure: (component: ComponentDefinition) => void;
    onPreview: (component: ComponentDefinition) => void;
    isPreviewOpen: boolean;
}

function defaultConfigFor(component: ComponentDefinition): Record<string, unknown> {
    const config: Record<string, unknown> = {};
    Object.entries(component.metadata.config).forEach(([key, field]) => {
        config[key] = field.default;
    });
    return config;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
    component,
    onSelect,
    onConfigure,
    onPreview,
    isPreviewOpen,
}) => {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const isConfigurable = Object.keys(component.metadata.config).length > 0;

    useEffect(() => {
        try {
            const result = generateComponent(component.metadata.id, defaultConfigFor(component));
            const scaled = result.svg
                .replace(/width="[^"]*"/, 'width="100%"')
                .replace(/height="[^"]*"/, 'height="100%"');
            setSvgContent(scaled);
        } catch (err) {
            console.error(`Error generating preview for ${component.metadata.id}:`, err);
            setSvgContent('<svg viewBox="0 0 200 100"><rect width="200" height="100" fill="#1a1a1a"/><text x="100" y="50" text-anchor="middle" fill="#ff4444" font-size="12" font-family="Roboto Mono, monospace">Generator Error</text></svg>');
        }
    }, [component]);

    return (
        <div
            style={{
                background: '#1a1a1a',
                borderRadius: '6px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: isPreviewOpen ? '1px solid #00ffa0' : '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 160, 0.2)';
                e.currentTarget.style.borderColor = '#00ffa0';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                if (!isPreviewOpen) {
                    e.currentTarget.style.borderColor = '#333';
                }
            }}
        >
            {/* Preview */}
            <div
                onClick={() => onPreview(component)}
                style={{
                    background: '#0f0f0f',
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px',
                    borderBottom: '1px solid #333',
                    overflow: 'hidden'
                }}
            >
                {svgContent ? (
                    <div
                        style={{ width: '100%', height: '100%' }}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                ) : (
                    <div style={{ color: '#666', fontSize: '12px', fontFamily: 'Roboto Mono, monospace' }}>Loading...</div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '12px', flex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#00ffa0', fontSize: '13px', fontFamily: 'Roboto Mono, monospace' }}>
                    {component.metadata.name}
                </h4>
                <p
                    style={{
                        margin: 0,
                        color: '#888',
                        fontSize: '11px',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontFamily: 'Roboto Mono, monospace',
                    }}
                >
                    {component.metadata.description}
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '0 12px 12px 12px', display: 'flex', gap: '6px' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(component);
                    }}
                    style={{ ...buttonBase, color: '#00ffa0', borderColor: '#00ffa0', flex: 1 }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#00ffa0';
                        e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#00ffa0';
                    }}
                    title="Add with default settings"
                >
                    Add
                </button>
                {isConfigurable && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onConfigure(component);
                        }}
                        style={{ ...buttonBase, color: '#a855f7', borderColor: '#a855f7', flex: 1 }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#a855f7';
                            e.currentTarget.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#a855f7';
                        }}
                        title="Customize before adding"
                    >
                        Configure...
                    </button>
                )}
            </div>
        </div>
    );
};

const buttonBase: React.CSSProperties = {
    padding: '8px',
    background: 'transparent',
    border: '1px solid',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '11px',
    fontFamily: 'Roboto Mono, monospace',
    transition: 'all 0.2s',
};
