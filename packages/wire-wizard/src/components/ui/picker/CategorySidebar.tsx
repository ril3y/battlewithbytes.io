import React from 'react';
import { COMPONENT_CATEGORIES } from '../../../lib/component-library';

interface CategorySidebarProps {
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
    isVisible: boolean; // Hidden during search
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
    selectedCategory,
    onSelectCategory,
    isVisible
}) => {
    if (!isVisible) return null;

    return (
        <div
            style={{
                width: '200px',
                background: '#1a1a1a',
                borderRight: '1px solid #333',
                overflowY: 'auto',
            }}
        >
            {COMPONENT_CATEGORIES.map((category) => (
                <div
                    key={category.id}
                    onClick={() => onSelectCategory(category.id)}
                    style={{
                        padding: '15px 20px',
                        cursor: 'pointer',
                        background:
                            selectedCategory === category.id ? '#00ffa0' : 'transparent',
                        color: selectedCategory === category.id ? '#000' : '#aaa',
                        fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                        borderBottom: '1px solid #333',
                        borderLeft: selectedCategory === category.id ? '3px solid #00ffa0' : '3px solid transparent',
                        transition: 'all 0.2s',
                        fontFamily: 'Roboto Mono, monospace',
                        fontSize: '13px',
                    }}
                    onMouseEnter={(e) => {
                        if (selectedCategory !== category.id) {
                            e.currentTarget.style.background = '#222';
                            e.currentTarget.style.color = '#00ffa0';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (selectedCategory !== category.id) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#aaa';
                        }
                    }}
                >
                    <span style={{ marginRight: '8px' }}>{category.icon}</span>
                    {category.label}
                </div>
            ))}
        </div>
    );
};
