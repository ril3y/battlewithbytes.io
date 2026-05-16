# Sidebar Component Structure

This directory contains the modular Sidebar component for the Wire Wizard application.

## Architecture

The sidebar has been extracted from a monolithic 1,100+ line section in `pages/interactive-wiring-demo.tsx` into a clean, modular component hierarchy.

## Component Hierarchy

```
Sidebar/
├── index.tsx              - Main Sidebar wrapper component
├── types.ts              - TypeScript interfaces and types
├── DisplayOptions.tsx    - Display settings checkboxes
├── AddBlockPanel.tsx     - Block creation controls
├── BlockEditor.tsx       - Edit selected block properties
├── WiresList.tsx         - List of wires with filtering
├── WireListItem.tsx      - Individual wire item with editing
├── BusWireItem.tsx       - Individual bus wire details
└── BusWiresList.tsx      - Expanded bus wire details
```

## Component Responsibilities

### `index.tsx` - Main Sidebar
- Orchestrates all child components
- Manages layout and visibility
- Passes props down to child components
- Handles toggle state with toggle button

### `types.ts` - Type Definitions
- `SidebarProps` - Complete props interface for the Sidebar component
- Ensures type safety across all components

### `DisplayOptions.tsx`
- Checkboxes for controlling visibility:
  - Show Connection Labels
  - Show Net Names
  - Show Bus Names

### `AddBlockPanel.tsx`
- Shape selector (Rectangle, Rounded, Circle)
- "Add Block" mode toggle button
- Visual feedback when in add mode

### `BlockEditor.tsx`
- Edit selected block properties:
  - Label (text input)
  - Color (color picker + hex input)
  - Shape (dropdown)
  - Width/Height (range sliders)
- Connection points management:
  - Add new points
  - Remove points
  - Edit point properties (label, position, color)
- Delete block button

### `WiresList.tsx`
- Header with wire count
- Filter wires by selected block
- Bus group mode toggle
- Bus creation controls
- Renders list of `WireListItem` components

### `WireListItem.tsx`
- Wire information display
- Selection handling (single and multi-select for bus grouping)
- Edit controls when selected:
  - Net name input
  - Wire color picker
  - Bus assignment dropdown
  - Add bend points
  - Remove bend points
  - Ungroup bus
- Expands to show bus wire details when in a bus

### `BusWiresList.tsx`
- Shows all wires in a bus group
- Bus name editor
- Wire count indicator
- Renders list of `BusWireItem` components

### `BusWireItem.tsx`
- Expandable wire item within bus
- Wire name editor
- Wire color picker
- Remove from bus button
- Delete wire button

## Usage

```tsx
import { Sidebar } from '@/components/wire-wizard/ui/Sidebar';

// In your component:
<Sidebar
  isOpen={sidebarOpen}
  blocks={blocks}
  wires={wires}
  selectedBlockId={selectedBlockId}
  selectedWireId={selectedWireId}
  selectedWireIds={selectedWireIds}
  selectedPointId={selectedPointId}
  editingPoint={editingPoint}
  showConnectionLabels={showConnectionLabels}
  showNetNames={showNetNames}
  showBusNames={showBusNames}
  addBlockMode={addBlockMode}
  newBlockShape={newBlockShape}
  isBusGroupMode={isBusGroupMode}
  busGroups={busGroups}
  expandedBusWires={expandedBusWires}
  setShowConnectionLabels={setShowConnectionLabels}
  setShowNetNames={setShowNetNames}
  setShowBusNames={setShowBusNames}
  setNewBlockShape={setNewBlockShape}
  setAddBlockMode={setAddBlockMode}
  updateBlock={updateBlock}
  removeBlock={removeBlock}
  addConnectionPoint={addConnectionPoint}
  removeConnectionPoint={removeConnectionPoint}
  setSelectedPointId={setSelectedPointId}
  setEditingPoint={setEditingPoint}
  updateConnectionPoint={updateConnectionPoint}
  setWires={setWires}
  setBlocks={setBlocks}
  removeWire={removeWire}
  addBendPointToWire={addBendPointToWire}
  removeBendPoint={removeBendPoint}
  saveToHistory={saveToHistory}
  setSelectedWireId={setSelectedWireId}
  setSelectedWireIds={setSelectedWireIds}
  setIsBusGroupMode={setIsBusGroupMode}
  toggleWireSelection={toggleWireSelection}
  createBusGroup={createBusGroup}
  ungroupBus={ungroupBus}
  setBusGroups={setBusGroups}
  setExpandedBusWires={setExpandedBusWires}
  updateWireAndConnectionColors={updateWireAndConnectionColors}
/>
```

## Styling

All components use inline styles matching the dark theme:
- Background: `#0a0a0a` (main panel), `#1a1a1a` (sections)
- Accent: `#00ffa0` (primary green)
- Text: `#00ffa0` (labels), `#fff` (content)
- Borders: `#333` (subtle), `#00ffa0` (active)
- Font: `monospace` at `11px`

## Testing Strategy

Each component can be tested in isolation:

```tsx
// Example test for DisplayOptions
import { DisplayOptions } from './DisplayOptions';

const mockSetters = {
  setShowConnectionLabels: jest.fn(),
  setShowNetNames: jest.fn(),
  setShowBusNames: jest.fn()
};

render(
  <DisplayOptions
    showConnectionLabels={true}
    showNetNames={true}
    showBusNames={false}
    {...mockSetters}
  />
);

// Test checkbox interactions
// Verify setter functions are called
```

## Benefits of Modular Structure

1. **Maintainability**: Each component has a single, clear responsibility
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Components can be used in other contexts
4. **Readability**: Much easier to understand and modify
5. **Performance**: Easier to optimize individual components
6. **Type Safety**: Clear prop interfaces for each component

## Migration Notes

The original sidebar section (lines 1286-2388, ~1,100 lines) in `pages/interactive-wiring-demo.tsx` has been replaced with a single `<Sidebar />` component call, reducing the main file from 3,793 lines to 2,461 lines.

All functionality remains identical - this is a pure refactoring for code organization.
