import React, { useState } from 'react';
import type { ComponentDefinition } from '../../lib/component-library';
import { useComponentSearch } from './picker/useComponentSearch';
import { CategorySidebar } from './picker/CategorySidebar';
import { ComponentGrid } from './picker/ComponentGrid';
import { ComponentPreviewModal } from './picker/ComponentPreviewModal';

interface ComponentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (component: ComponentDefinition) => void;
  onConfigurable?: (component: ComponentDefinition) => void;
}

/**
 * ComponentPicker Modal
 *
 * Allows users to browse and select custom SVG components from the catalog.
 * Refactored to use modular sub-components.
 */
export const ComponentPicker: React.FC<ComponentPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  onConfigurable,
}) => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredComponents
  } = useComponentSearch();

  const [previewComponent, setPreviewComponent] = useState<ComponentDefinition | null>(null);

  // Add with defaults — no config modal.
  const handleAdd = (component: ComponentDefinition) => {
    onSelect(component);
    onClose();
  };

  // Open the config modal before adding.
  const handleConfigure = (component: ComponentDefinition) => {
    if (onConfigurable) {
      onConfigurable(component);
    } else {
      onSelect(component);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: '#0f0f0f',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '1000px',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(0, 255, 160, 0.2)',
          border: '1px solid #00ffa0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#1a1a1a',
          }}
        >
          <h2 style={{ margin: 0, color: '#00ffa0', fontSize: '24px', fontFamily: 'Roboto Mono, monospace', textShadow: '0 0 10px rgba(0, 255, 160, 0.5)' }}>
            Component Library
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#ff4444',
              border: '1px solid #ff4444',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Roboto Mono, monospace',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff4444';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#ff4444';
            }}
          >
            Close
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '20px', borderBottom: '1px solid #333', background: '#1a1a1a' }}>
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0f0f0f',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'Roboto Mono, monospace',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#00ffa0';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 160, 0.3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#444';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Category Sidebar */}
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isVisible={!searchQuery}
          />

          {/* Component Grid */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              background: '#0f0f0f',
            }}
          >
            <ComponentGrid
              components={filteredComponents}
              searchQuery={searchQuery}
              onSelect={handleAdd}
              onConfigure={handleConfigure}
              onPreview={setPreviewComponent}
              previewComponentId={previewComponent?.metadata.id || null}
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewComponent && (
        <ComponentPreviewModal
          component={previewComponent}
          onClose={() => setPreviewComponent(null)}
        />
      )}
    </div>
  );
};
