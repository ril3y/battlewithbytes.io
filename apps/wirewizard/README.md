# Wire Mapper

A standalone Next.js application for creating visual pinout and wiring harness maps for electrical connectors.

## Features

- Create and manage electrical connectors with custom pin layouts
- Visual connector builder with different shapes (Rectangle, Circle)
- Interactive canvas for positioning and connecting connectors
- Pin-to-pin wire mapping with color coding
- Net naming and signal type tracking
- Export capabilities for documentation
- Multiple view modes (Canvas, Diagram, Table)

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server on port 5563
pnpm dev
```

Open [http://localhost:5563](http://localhost:5563) in your browser.

### Build

```bash
# Build for production (static export)
pnpm build
```

The static files will be generated in the `out` directory.

## Technology Stack

- **Next.js 15.3** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **ReactFlow** - Interactive canvas and node-based UI
- **Zustand** - State management
- **Immer** - Immutable state updates

## Project Structure

```
apps/wirewizard/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   └── components/
│       └── WireMapper/   # WireMapper component and utilities
│           ├── components/     # React components
│           ├── connectors/     # Connector renderers
│           ├── store/          # Zustand store
│           ├── types/          # TypeScript types
│           ├── utils/          # Utility functions
│           └── constants.ts    # Constants
├── public/               # Static assets
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.ts
```

## Usage

1. **Create Connectors**: Use the "Add Connector" button to create new electrical connectors
2. **Configure Pins**: Define pin layouts, names, and properties
3. **Map Connections**: Click and drag between pins to create wire connections
4. **Organize**: Arrange connectors on the canvas
5. **Export**: Use the print/export features to generate documentation

## Configuration

The app runs on port **5563** by default. To change this, modify the `dev` script in `package.json`.

## License

Private - Battle With Bytes
