# WireMapper – Visual Pinout & Wiring Mapper

## 1. Overview
**WireMapper** is a browser‑based engineering tool for visually defining, previewing, and mapping electrical connectors and their wiring harnesses. Users can quickly:

- Define generic or preconfigured connectors (pin count, layout, gender).  
- Place multiple connectors on a canvas and assign pin names, colors, and metadata.  
- Draw and label mappings between pins across connectors.  
- Hover or tap a pin to view its details in‑context.  
- Export/import harness definitions as JSON or persist them in local storage.

## 2. Goals & Objectives
- **Rapid harness prototyping**: Reduce time spent hand‑drawing connector pinouts.  
- **Accuracy**: Ensure every pin is correctly labeled, color‑coded, and mapped.  
- **Reusability**: Save connector definitions and wiring projects for future reuse.  
- **Shareability**: Export JSON schemas that can be version‑controlled or shared with team members.

## 3. Key Features

### 3.1 Connector Library & Definition
- **Prebuilt templates**: Common automotive and industrial connectors (e.g. TE 2×13, 08T‑JWPF, 08R‑JWPF, 06R‑JWPF).  
- **Generic connector builder**: Define any connector by:  
  - Pin count (total, rows, columns)  
  - Gender (male/female).  
  - Physical layout (grid, staggered).  
- **Pin metadata**: Assign each pin a `name`, `color`, `description`, and optional `voltage` or `signal type`.

### 3.2 Visual Pinout Canvas
- **Drag‑and‑drop connectors** onto the canvas, rotate or mirror if needed.  
- **Auto‑layout grid**: Pins rendered as interactive circles or squares with row/column coordinates.  
- **Hover tooltip**: Show pin metadata on hover.  
- **Selected‑pin panel**: Display full pin details below the canvas when clicked.

### 3.3 Wiring & Mapping
- **Connection mode**: Click a source pin, then a target pin to draw a link.  
- **Automatic color assignment**: Each mapping gets a distinct color, overrideable by user.  
- **Labelled wires**: Display net‑names on or near wiring lines.  
- **Routing hints**: Orthogonal line segments or Bézier curves for clarity.

### 3.4 Persistence & Export
- **LocalStorage**: Auto‑save current project in browser session.  
- **Download JSON**: Export complete project (connectors + mappings + metadata) as a JSON file.  
- **Import JSON**: Load previously saved harness definitions.

### 3.5 UI/UX Controls
- **Connector selection**: Dropdown or searchable list of prebuilt connectors.  
- **Add new connector**: Wizard to define generics (pin count, rows, columns, name).  
- **Pin editor side‑panel**: Update pin labels, colors, or delete pins.  
- **Mapping list**: Table view of all connections (source, target, net‑name, color).

## 4. User Stories
1. **As an engineer**, I want to load a TE 2×13 connector template so I don’t have to draw each pin manually.  
2. **As a technician**, I need to set pin 1–13 names quickly and assign net‑names so I can document wiring.  
3. **As a power‑system designer**, I want to define a custom 8‑pin connector (2 rows of 4) for a battery management interface.  
4. **As a project lead**, I need to export the harness JSON to include in our Git repo.  
5. **As a reviewer**, I want hover‑over tooltips on pins to inspect signal details without clutter.

## 5. Data Model (JSON Schema)
\`\`\`jsonc
{
  "projectName": "MyHarness",
  "connectors": [
    {
      "id": "C1",
      "type": "TE_6437287_8",
      "rows": 2,
      "cols": 13,
      "gender": "male",
      "pins": [
        { "pos": 1, "name": "PWR", "color": "#e91e63", "desc": "12V supply" },
        { "pos": 2, "name": "GND", "color": "#000000" }
        // ...
      ],
      "position": { "x": 100, "y": 80, "rotation": 0 }
    }
  ],
  "mappings": [
    {
      "from": { "conn": "C1", "pin": 1 },
      "to":   { "conn": "C2", "pin": 11 },
      "netName": "BAT+", "color": "#2196f3"
    }
  ]
}
\`\`\`

## 7. Non-functional Requirements
- **Performance**: Support up to 10 connectors and 100 mappings without lag.  
- **Responsiveness**: Desktop‑first, but must scale down to tablet widths.  
- **Accessibility**: Keyboard navigation for selecting pins and drawing wires.  
- **Extensibility**: Easy to add new connector templates via JSON definitions.


---
*Ready for review and prioritization.*
