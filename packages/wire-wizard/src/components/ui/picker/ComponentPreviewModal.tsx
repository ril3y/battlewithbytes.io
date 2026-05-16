import React, { useState, useEffect } from 'react';
import type { ComponentDefinition } from '../../../lib/component-library';
import { generateComponent } from '../../../lib/component-library';

interface ComponentPreviewModalProps {
    component: ComponentDefinition;
    onClose: () => void;
}

function defaultConfigFor(component: ComponentDefinition): Record<string, unknown> {
    const config: Record<string, unknown> = {};
    Object.entries(component.metadata.config).forEach(([key, field]) => {
        config[key] = field.default;
    });
    return config;
}

export const ComponentPreviewModal: React.FC<ComponentPreviewModalProps> = ({
    component,
    onClose,
}) => {
    const [svgContent, setSvgContent] = useState<string | null>(null);

    useEffect(() => {
        try {
            const result = generateComponent(component.metadata.id, defaultConfigFor(component));
            const scaled = result.svg
                .replace(/width="[^"]*"/, 'width="100%"')
                .replace(/height="[^"]*"/, 'height="100%"');
            setSvgContent(scaled);
        } catch (err) {
            console.error('Error generating preview:', err);
            setSvgContent('<svg viewBox="0 0 400 300"><rect width="400" height="300" fill="#2c3e50"/><text x="200" y="150" text-anchor="middle" fill="#e74c3c" font-size="12">Preview Error</text></svg>');
        }
    }, [component]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2100,
            }}
            onClick={onClose}
            onWheel={(e) => e.stopPropagation()}
        >
            <div
                style={{
                    background: '#0f0f0f',
                    borderRadius: '8px',
                    width: '80%',
                    maxWidth: '1000px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    border: '1px solid #00ffa0',
                    boxShadow: '0 0 40px rgba(0, 255, 160, 0.2)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#00ffa0', fontFamily: 'Roboto Mono, monospace', textShadow: '0 0 10px rgba(0, 255, 160, 0.5)' }}>
                        {component.metadata.name}
                    </h2>
                    <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', fontFamily: 'Roboto Mono, monospace' }}>
                        Preview Mode
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <div
                            style={{
                                background: '#1a1a1a',
                                borderRadius: '6px',
                                padding: '20px',
                                minHeight: '300px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                border: '1px solid #333',
                            }}
                        >
                            {svgContent ? (
                                <div
                                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                />
                            ) : (
                                <div style={{ color: '#666', fontFamily: 'Roboto Mono, monospace' }}>Loading preview...</div>
                            )}
                        </div>
                    </div>

                    <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #333' }}>
                            <h4 style={{ color: '#00ffa0', marginTop: 0 }}>Description</h4>
                            <p style={{ color: '#ccc', fontSize: '12px', lineHeight: 1.5 }}>
                                {component.metadata.description}
                            </p>
                        </div>

                        {component.metadata.tags && component.metadata.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {component.metadata.tags.map(tag => (
                                    <span key={tag} style={{ background: '#333', color: '#aaa', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            color: '#888',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontFamily: 'Roboto Mono, monospace',
                            fontSize: '12px',
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
