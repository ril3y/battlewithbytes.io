// Constants for styling and layout

export const PIN_SIZE = 24; // Diameter of the pin visual
export const PIN_MARGIN = 4; // Margin around the pin visual
export const PIN_AREA_SIZE = PIN_SIZE + PIN_MARGIN * 2; // Total area including margin

export const CONNECTOR_PADDING = 5; // Internal padding of the connector node
export const CONNECTOR_BORDER_WIDTH = 2;

// Define and export default values for connector rendering
export const CONNECTOR_DEFAULTS = {
    MIN_SIZE: 20, // Minimum width/height
    width: 100, // Default width if not specified
    height: 50, // Default height if not specified
    PADDING: 10,
    PIN_SIZE: 6,
    PIN_SPACING: 4, // Spacing between pins in grid layout
    FILL_COLOR: 'rgba(50, 50, 60, 0.8)',
    BORDER_COLOR: '#60a5fa', // blue-400
    HOVER_BORDER_COLOR: '#2563eb', // blue-600 
    SELECTED_BORDER_COLOR: '#34d399', // emerald-400
    BORDER_WIDTH: 1,
    SELECTED_BORDER_WIDTH: 2,
    PIN_FILL_COLOR: '#d1d5db', // gray-300
    PIN_BORDER_COLOR: '#4b5563', // gray-600
    PIN_BORDER_WIDTH: 0.5,
    TEXT_COLOR: '#e5e7eb', // gray-200
    FONT_SIZE: 10,
    FONT_FAMILY: 'monospace',
};

export const CANVAS_DEFAULTS = {
    BACKGROUND_COLOR: '#111827', // gray-900
    GRID_COLOR: '#374151', // gray-700
    GRID_SIZE: 20,
};

export const WIRE_DEFAULTS = {
    COLOR: '#f59e0b', // amber-500
    HOVER_COLOR: '#fbbf24', // amber-400
    SELECTED_COLOR: '#ec4899', // pink-500
    WIDTH: 1.5,
    HOVER_WIDTH: 2,
    SELECTED_WIDTH: 2.5,
};
