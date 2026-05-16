import React from 'react';
import type { ComponentDefinition } from '../../../lib/component-library';
import { ComponentCard } from './ComponentCard';

interface ComponentGridProps {
    components: ComponentDefinition[];
    searchQuery: string;
    onSelect: (component: ComponentDefinition) => void;
    onConfigure: (component: ComponentDefinition) => void;
    onPreview: (component: ComponentDefinition) => void;
    previewComponentId: string | null;
}

export const ComponentGrid: React.FC<ComponentGridProps> = ({
    components,
    searchQuery,
    onSelect,
    onConfigure,
    onPreview,
    previewComponentId
}) => {
    if (components.length === 0) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    color: '#666',
                    padding: '40px',
                    fontSize: '14px',
                    fontFamily: 'Roboto Mono, monospace',
                }}
            >
                {searchQuery
                    ? `No components found for "${searchQuery}"`
                    : 'No components in this category'}
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px',
            }}
        >
            {components.map((component) => (
                <ComponentCard
                    key={component.metadata.id}
                    component={component}
                    onSelect={onSelect}
                    onConfigure={onConfigure}
                    onPreview={onPreview}
                    isPreviewOpen={previewComponentId === component.metadata.id}
                />
            ))}
        </div>
    );
};
