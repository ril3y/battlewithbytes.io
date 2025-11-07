# @battlewithbytes/battleterm

A web-based serial terminal component for real-time device communication and debugging. BattleTerm provides a modern, feature-rich interface for interacting with serial devices directly from your browser using the Web Serial API.

## Features

- **Web Serial API Integration** - Direct browser-based communication with serial devices
- **ANSI Color Support** - Full ANSI escape sequence rendering for colored terminal output
- **PWA Capabilities** - Progressive Web App support for offline functionality
- **Configurable Baud Rates** - Support for multiple baud rate configurations
- **Hex/ASCII View Modes** - Toggle between hexadecimal and ASCII data representation
- **Command History** - Built-in command history navigation for improved workflow

## Installation

Install the package using your preferred package manager:

### pnpm

```bash
pnpm add @battlewithbytes/battleterm
```

### npm

```bash
npm install @battlewithbytes/battleterm
```

## Basic Usage

Import the BattleTerm component in your application:

```typescript
import { BattleTerm } from '@battlewithbytes/battleterm';

// Use the component in your application
export default function App() {
  return (
    <div>
      <BattleTerm />
    </div>
  );
}
```

## Version

Current version: **1.2.2**
