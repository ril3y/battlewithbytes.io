import React, { useEffect } from 'react';
import type { ConfigField } from '../../lib/component-library';
import type { ConfigPrimitiveValue } from './ConfigFormField';

interface ArrayConfigFieldProps {
    fieldName: string;
    fieldSchema: ConfigField;
    value: ConfigPrimitiveValue[];
    onChange: (value: ConfigPrimitiveValue[]) => void;
    syncValue?: number;
}

function fallbackItemValue(items: ConfigField | undefined): ConfigPrimitiveValue {
    if (!items) return '';
    if (items.options && items.options.length > 0) return items.options[0].value;
    return (items.default as ConfigPrimitiveValue) ?? (items.type === 'number' ? 0 : '');
}

export const ArrayConfigField: React.FC<ArrayConfigFieldProps> = ({
    fieldSchema,
    value = [],
    onChange,
    syncValue,
}) => {
    const safeValue = Array.isArray(value) ? value : [];
    const items = fieldSchema.items;
    const itemType = items?.type ?? 'string';

    // Auto-sync length if syncValue is provided
    useEffect(() => {
        if (syncValue !== undefined && safeValue.length !== syncValue) {
            const newArray = [...safeValue];
            if (newArray.length < syncValue) {
                const filler = fallbackItemValue(items);
                while (newArray.length < syncValue) newArray.push(filler);
            } else if (newArray.length > syncValue) {
                newArray.length = syncValue;
            }
            onChange(newArray);
        }
    }, [syncValue, safeValue.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleItemChange = (index: number, val: ConfigPrimitiveValue) => {
        const newValue = [...safeValue];
        newValue[index] = val;
        onChange(newValue);
    };

    const addItem = () => {
        if (fieldSchema.maxItems && safeValue.length >= fieldSchema.maxItems) return;
        onChange([...safeValue, fallbackItemValue(items)]);
    };

    const removeItem = (index: number) => {
        if (fieldSchema.minItems && safeValue.length <= fieldSchema.minItems) return;
        onChange(safeValue.filter((_, i) => i !== index));
    };

    const renderItemInput = (item: ConfigPrimitiveValue, index: number) => {
        if (itemType === 'select') {
            return (
                <select
                    value={String(item)}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    style={{ ...rowInputStyle, cursor: 'pointer' }}
                >
                    {items?.options?.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (itemType === 'number') {
            return (
                <input
                    type="number"
                    value={item as number}
                    onChange={(e) => handleItemChange(index, parseFloat(e.target.value))}
                    min={items?.min}
                    max={items?.max}
                    step={items?.step}
                    style={rowInputStyle}
                />
            );
        }

        if (itemType === 'color') {
            return (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                    <input
                        type="color"
                        value={String(item)}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        style={{
                            width: '40px',
                            height: '30px',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    />
                    <input
                        type="text"
                        value={String(item)}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        style={rowInputStyle}
                    />
                </div>
            );
        }

        return (
            <input
                type="text"
                value={String(item)}
                onChange={(e) => handleItemChange(index, e.target.value)}
                style={rowInputStyle}
            />
        );
    };

    const isValidLength = syncValue !== undefined ? safeValue.length === syncValue : true;
    const showAddRemove = syncValue === undefined;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {!isValidLength && (
                <div style={{ color: '#ff4444', fontSize: '12px' }}>
                    Error: Array length ({safeValue.length}) must match {syncValue}
                </div>
            )}

            {safeValue.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#666', fontSize: '12px', width: '20px' }}>
                        {index + 1}.
                    </span>
                    {renderItemInput(item, index)}

                    {showAddRemove && (
                        <button
                            onClick={() => removeItem(index)}
                            style={{
                                padding: '4px 8px',
                                background: '#333',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#ff4444',
                                cursor: 'pointer',
                            }}
                            title="Remove item"
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}

            {showAddRemove && (!fieldSchema.maxItems || safeValue.length < fieldSchema.maxItems) && (
                <button
                    onClick={addItem}
                    style={{
                        alignSelf: 'flex-start',
                        marginTop: '4px',
                        padding: '6px 12px',
                        background: '#222',
                        border: '1px dashed #444',
                        borderRadius: '4px',
                        color: '#888',
                        fontSize: '12px',
                        cursor: 'pointer',
                    }}
                >
                    + Add Item
                </button>
            )}
        </div>
    );
};

const rowInputStyle: React.CSSProperties = {
    flex: 1,
    padding: '6px 10px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
    fontFamily: 'monospace',
};
