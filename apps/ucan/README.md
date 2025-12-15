# uCAN - Universal USB-to-CAN Monitor

A standalone browser-based CAN bus packet analyzer for USB-to-CAN hardware. Professional Wireshark-like interface for real-time CAN message capture, filtering, and analysis.

## Features

- **Real-time CAN Message Capture**: Wireshark-like interface with live packet capture
- **Advanced Filtering**: Filter by CAN ID, direction, data patterns, and more
- **Message Statistics**: Track messages per second, bus load, and per-ID statistics
- **Multiple Export Formats**: CSV, JSON, and plain text exports
- **Firmware Flashing**: Built-in UF2 firmware flasher for supported boards
- **Custom Overlays**: Decode and visualize CAN messages with custom definitions
- **Action Rules**: Create automated actions triggered by CAN messages
- **No Installation Required**: Runs entirely in your browser using Web Serial API

## Supported Hardware

- Adafruit Feather M4 CAN
- Raspberry Pi Pico (with CAN transceiver)
- ESP32 (with CAN controller)
- Any USB-to-CAN adapter with uCAN firmware

## Development

### Prerequisites

- Node.js 18+ and pnpm
- Modern browser with Web Serial API support (Chrome, Edge)

### Getting Started

```bash
# Install dependencies (from repo root)
pnpm install

# Run development server
cd apps/ucan
pnpm dev
```

The app will be available at http://localhost:5565

### Building

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
apps/ucan/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main page
│   │   └── globals.css      # Global styles
│   ├── components/          # UI components
│   ├── core/               # Core functionality
│   │   ├── canProtocol.ts  # CAN protocol parser
│   │   ├── serialBridge.ts # Web Serial API bridge
│   │   ├── messageBuffer.ts # Message buffering
│   │   └── ...
│   ├── overlays/           # Message decoder overlays
│   │   ├── decoder/        # Decoder logic
│   │   ├── definitions/    # CAN definitions (JSON)
│   │   └── widgets/        # Visualization widgets
│   ├── utils/              # Utility functions
│   ├── lib/                # Shared libraries
│   └── types.ts            # TypeScript types
├── public/
│   └── ucan-log.csv        # Demo data file
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.ts
```

## Technology Stack

- **Framework**: Next.js 15.3 (App Router)
- **UI**: React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Build Tool**: Turbo (monorepo)

## Configuration

The app runs on port **5565** by default. This can be changed in `package.json`.

## Protocol

uCAN uses a simple text-based protocol over serial:

- **CAN_RX**: `R;<CAN_ID>;<DATA>[;<TIMESTAMP>]`
- **CAN_TX**: `T;<CAN_ID>;<DATA>[;<TIMESTAMP>]`
- **STATUS**: `S;<MESSAGE>`
- **STATS**: `STATS;<RX>;<TX>;<ERR>;<LOAD>[;<TIMESTAMP>]`

See the protocol documentation for full details.

## License

This project is part of the BattleWithBytes monorepo.
