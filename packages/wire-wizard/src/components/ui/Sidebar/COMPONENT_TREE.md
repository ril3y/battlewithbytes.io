# Sidebar Component Tree

## Visual Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (index.tsx)                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Selection Info Badges                               │ │
│ │ (Selected Block / Selected Wire)                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Auto-save Notice                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ DisplayOptions.tsx                                  │ │
│ │ ├─ Show Connection Labels [✓]                       │ │
│ │ ├─ Show Net Names [✓]                               │ │
│ │ └─ Show Bus Names [✓]                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ AddBlockPanel.tsx                                   │ │
│ │ ├─ Shape Selector (dropdown)                        │ │
│ │ └─ [Click Canvas to Add] button                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ BlockEditor.tsx                                     │ │
│ │ ├─ Block Properties                                 │ │
│ │ │  ├─ Label (text input)                            │ │
│ │ │  ├─ Color (color picker + hex)                    │ │
│ │ │  ├─ Shape (dropdown)                              │ │
│ │ │  ├─ Width (slider)                                │ │
│ │ │  ├─ Height (slider)                               │ │
│ │ │  └─ [Delete Block] button                         │ │
│ │ │                                                     │ │
│ │ ├─ Connection Points List                           │ │
│ │ │  ├─ Point 1 [×]                                   │ │
│ │ │  ├─ Point 2 [×]                                   │ │
│ │ │  └─ [+ Add] button                                │ │
│ │ │                                                     │ │
│ │ └─ Edit Point Panel (when point selected)          │ │
│ │    ├─ Label (text input)                            │ │
│ │    ├─ X, Y (number inputs)                          │ │
│ │    └─ Color (color picker)                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ WiresList.tsx                                       │ │
│ │ ├─ Header                                            │ │
│ │ │  ├─ "Wires (N)"                                   │ │
│ │ │  └─ [Group Bus] / [Cancel] button                │ │
│ │ │                                                     │ │
│ │ ├─ Bus Group Mode Banner (conditional)              │ │
│ │ │  └─ [Create Bus (N wires)] button                │ │
│ │ │                                                     │ │
│ │ └─ WireListItem.tsx (for each wire)                │ │
│ │    ├─ Wire Info Header                              │ │
│ │    │  ├─ 🔗 (if in bus)                             │ │
│ │    │  ├─ "Wire (N bends)"                           │ │
│ │    │  └─ [×] delete button                          │ │
│ │    │                                                  │ │
│ │    └─ Expanded Controls (when selected)            │ │
│ │       ├─ [+ Bend Point] [Ungroup Bus] buttons      │ │
│ │       ├─ Net Name (text input)                      │ │
│ │       ├─ Wire Color (color picker)                  │ │
│ │       ├─ Bus Assignment (dropdown)                  │ │
│ │       ├─ [✓] Show Colored Stripes (if in bus)      │ │
│ │       │                                              │ │
│ │       ├─ BusWiresList.tsx (if in bus)              │ │
│ │       │  ├─ Bus: [Name Input] [N wires]            │ │
│ │       │  │                                           │ │
│ │       │  └─ BusWireItem.tsx (for each wire in bus) │ │
│ │       │     ├─ ▶ [Wire Name] [Color]               │ │
│ │       │     │                                        │ │
│ │       │     └─ Expanded Details (when clicked)     │ │
│ │       │        ├─ Wire Name (text input)            │ │
│ │       │        ├─ Wire Color (color picker)         │ │
│ │       │        ├─ [Remove from Bus] button          │ │
│ │       │        └─ [Delete Wire] button              │ │
│ │       │                                              │ │
│ │       └─ Bend Point Buttons                         │ │
│ │          ├─ [- Bend 1]                              │ │
│ │          ├─ [- Bend 2]                              │ │
│ │          └─ ...                                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
Parent Component (interactive-wiring-demo.tsx)
│
├─ State Management
│  ├─ blocks, wires
│  ├─ selectedBlockId, selectedWireId, selectedWireIds
│  ├─ selectedPointId, editingPoint
│  ├─ displayOptions (showConnectionLabels, etc.)
│  ├─ addBlockMode, newBlockShape
│  ├─ busGroups, expandedBusWires, isBusGroupMode
│  └─ ... (all state)
│
└─ Event Handlers
   ├─ updateBlock(), removeBlock()
   ├─ addConnectionPoint(), removeConnectionPoint()
   ├─ updateConnectionPoint()
   ├─ setWires(), setBlocks()
   ├─ removeWire(), addBendPointToWire()
   ├─ createBusGroup(), ungroupBus()
   ├─ toggleWireSelection()
   └─ updateWireAndConnectionColors()

   ↓ (props passed down)

Sidebar Component
│
├─ Receives all state as props
├─ Receives all handlers as props
└─ Delegates to child components

   ↓ (props passed to children)

Child Components (DisplayOptions, AddBlockPanel, etc.)
│
├─ Receive only necessary props
├─ Call parent handlers for state changes
└─ Render specific UI sections
```

## Props Flow Example

```typescript
// Parent
<Sidebar
  blocks={blocks}                          // State
  selectedBlockId={selectedBlockId}        // State
  updateBlock={updateBlock}                // Handler
  // ... more props
/>

// Sidebar passes down to BlockEditor
<BlockEditor
  selectedBlock={selectedBlock}            // Derived from blocks + selectedBlockId
  updateBlock={updateBlock}                // Handler
  // ... only BlockEditor-specific props
/>

// BlockEditor calls handler
<input
  value={selectedBlock.label}
  onChange={(e) => updateBlock(selectedBlock.id, { label: e.target.value })}
/>
```

## Component Communication

```
User Action
    ↓
Child Component Event Handler
    ↓
Calls Parent Handler (via props)
    ↓
Parent Updates State
    ↓
New Props Flow Down
    ↓
Components Re-render
    ↓
UI Updates
```

## Key Design Decisions

1. **Unidirectional Data Flow**: All state lives in parent, flows down via props
2. **Single Responsibility**: Each component handles one UI concern
3. **Pure Components**: No internal state, fully controlled by props
4. **Type Safety**: Complete TypeScript interfaces for all props
5. **Composability**: Components can be reused or reorganized easily
