import { useState, useMemo } from 'react';
import {
    getComponentsByCategory,
    searchComponents,
    type ComponentDefinition
} from '../../../lib/component-library';

export interface UseComponentSearchProps {
    initialCategory?: string;
}

export function useComponentSearch({ initialCategory = 'distribution' }: UseComponentSearchProps = {}) {
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');

    const catalog = useMemo(() => getComponentsByCategory(), []);

    const filteredComponents: ComponentDefinition[] = useMemo(() => {
        if (searchQuery.trim()) {
            return searchComponents(searchQuery);
        }
        return catalog[selectedCategory] || [];
    }, [searchQuery, selectedCategory, catalog]);

    return {
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filteredComponents
    };
}
