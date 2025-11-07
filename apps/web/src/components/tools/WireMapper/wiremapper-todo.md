# Wire Mapper Tool - Development Todo

## Phase 1: Core Structure (MVP) - COMPLETED
- [x] Create project structure and files
- [x] Define TypeScript interfaces for connector and pin data models
- [x] Create basic connector component with pins
- [x] Implement canvas for placing connectors
- [x] Add connector creation wizard
- [x] Implement JSON import/export functionality
- [x] Add basic localStorage persistence

## Phase 2: Mapping UI - COMPLETED
- [x] Implement wire connection functionality
- [x] Add pin selection and highlighting
- [x] Create wire visualization with proper routing
- [x] Implement color coding for connections
- [x] Add connection list/table view

## Phase 3: Advanced Features - IN PROGRESS
- [x] Add connector right-click context menu
- [x] Implement connector editing and duplication
- [x] Add connector positioning and rotation
- [x] Implement custom pin layouts and visibility (Grid layout implemented, pins render)
- [x] Create color-based connection mode
- [x] Add simplified view for wire bundles
- [x] Enhance localStorage with settings persistence
- [x] Make canvas zoomable and pan-able
- [x] Add row-based pin configuration with centering options
- [x] Fix pin numbering with removable pins
- [x] Improve right-click functionality on connectors
- [x] Center pins in connector boxes
- [x] Make connector selection show details in the detail pane
- [x] Differentiate Male/Female pin rendering (Initial styling applied)
- [x] Connector styling to match site theme (Initial styling applied)
- [ ] **Fix connection drawing/creation logic** (High Priority)
  - [ ] Verify `Handle` types and `onConnect` in `ConnectorCanvas.tsx`
  - [ ] Ensure `addMapping` store action is correctly called and updates state
  - [ ] Visual feedback for starting pin and during connection drag
- [ ] Implement connection rendering (wires on canvas after connection is made)
- [ ] Implement dynamic configuration and interactive pin preview in `ConnectorBuilder`
  - [x] Refactor builder UI for dynamic options based on renderer schema (`DynamicConfigInput`).
  - [x] Add pin `active` state and toggle handler (`handlePinToggle` in `ConnectorBuilder`).
  - [x] Add click handler and visual feedback to pins in `ConnectorPreview`.
  - [ ] **Debug: Pins not rendering in `ConnectorPreview`**
    - [ ] Verify pin data is passed correctly from `ConnectorBuilder` (Check console logs).
    - [ ] Verify `renderer.getPinPosition()` returns valid coordinates.
    - [ ] Verify SVG rendering logic in `ConnectorPreview`.

## Phase 4: Additional Features - PLANNED
- [ ] Dynamic pin color on connection (If pin has no color, connected pins share a new, mutual color)
- [ ] Create library of pre-defined connector templates
- [ ] Implement connector template selection UI
- [ ] Enhance localStorage with versioning and multiple projects
- [ ] Support for multi-selection of pins
- [ ] Custom naming convention for pins
- [ ] Row-based pin configuration with dynamic sizing

## Phase 5: Polish & Documentation
- [ ] Implement keyboard shortcuts for accessibility
- [ ] Add tooltips and help text
- [ ] Create user documentation
- [ ] Add undo/redo functionality
- [ ] Implement responsive design for tablet view
- [ ] Performance optimization for large connector sets
