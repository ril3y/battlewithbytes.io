# GDB Client Library for Black Magic Probe

TypeScript implementation of the GDB Remote Serial Protocol (RSP) for debugging embedded systems via Black Magic Probe.

## Architecture

The library is organized into four main components:

### 1. `SerialTransport.ts`
Low-level serial communication using the Web Serial API.
- Connection management
- Data transmission/reception
- Event-driven data handling

### 2. `RspProtocol.ts`
GDB Remote Serial Protocol implementation.
- Packet encoding: `$command#checksum`
- Checksum calculation (sum of bytes mod 256)
- ACK/NAK handling
- Binary data escaping
- Packet parsing and validation

### 3. `BlackMagicCommands.ts`
Black Magic Probe specific command builders.
- Monitor commands (scan, power, version, reset)
- Memory operations
- Execution control
- Breakpoint management
- Response parsing

### 4. `GdbClient.ts`
Main orchestrator with async command queue.
- Connection state management
- Command queueing
- Event callbacks
- High-level API

## Usage Example

```typescript
import { GdbClient, ConnectionState } from '@/lib/gdb';

// Create client with callbacks
const client = new GdbClient(
  { debug: true },
  {
    onStateChange: (state) => console.log('State:', state),
    onStopped: (reply) => console.log('Stopped:', reply),
    onError: (error) => console.error('Error:', error)
  }
);

// Request port from user
const port = await client.requestPort();
if (!port) {
  console.log('No port selected');
  return;
}

// Connect
await client.connect(port);

// Scan for targets
const { targets, voltage } = await client.scanSwd();
console.log('Found targets:', targets);
console.log('Target voltage:', voltage);

// Attach to first target
if (targets.length > 0) {
  await client.attach(targets[0].id);

  // Read memory
  const memory = await client.readMemory(0x08000000, 256);
  console.log('Memory:', memory);

  // Set breakpoint
  await client.insertBreakpoint(0x08000100);

  // Continue execution
  await client.continue();

  // Halt execution
  await client.halt();

  // Read registers
  const registers = await client.readRegisters();
  console.log('Registers:', registers);
}

// Disconnect
await client.disconnect();
```

## GDB RSP Protocol Details

### Packet Format
```
$<data>#<checksum>
```
- `$` - Start delimiter
- `<data>` - Command or response data
- `#` - Checksum delimiter
- `<checksum>` - Two hex digits (sum of data bytes mod 256)

### Acknowledgments
- `+` - ACK (packet received correctly)
- `-` - NAK (packet corrupted, retransmit)

### Special Commands
- `\x03` - Ctrl+C interrupt (halt execution)
- `qRcmd,<hex>` - Monitor command (hex-encoded)

### Common Responses
- `OK` - Command successful
- `Enn` - Error with error code nn (hex)
- `Snn` - Signal nn (stop reply)
- `Tnn...` - Extended stop reply with signal nn
- `O<hex>` - Console output (hex-encoded)

### Memory Operations
- `m<addr>,<length>` - Read memory
- `M<addr>,<length>:<hex-data>` - Write memory

### Execution Control
- `c` - Continue execution
- `s` - Single step
- `g` - Read all registers
- `p<n>` - Read register n
- `P<n>=<value>` - Write register n

### Breakpoints
- `Z0,<addr>,<kind>` - Insert software breakpoint
- `Z1,<addr>,<kind>` - Insert hardware breakpoint
- `z0,<addr>,<kind>` - Remove software breakpoint
- `z1,<addr>,<kind>` - Remove hardware breakpoint

## Black Magic Probe Monitor Commands

Commands sent via `qRcmd,<hex-encoded-command>`:

- `swdp_scan` - Scan for SWD targets
- `jtag_scan` - Scan for JTAG targets
- `tpwr enable` - Enable target power
- `tpwr disable` - Disable target power
- `version` - Get firmware version
- `reset` - Reset target
- `hard_reset` - Hard reset target

## Type Definitions

All types are defined in `types.ts`:

- `GdbPacket` - Parsed GDB packet structure
- `GdbResponse` - Command response types
- `Target` - Target information from scan
- `BmpVersion` - Firmware version info
- `StopReply` - Stop reason and info
- `ConnectionState` - Connection state enum
- `MemoryData` - Memory read result
- `Breakpoint` - Breakpoint descriptor

## Error Handling

The library uses async/await patterns. All methods that communicate with the probe can throw errors:

```typescript
try {
  await client.connect(port);
  const targets = await client.scanSwd();
} catch (error) {
  console.error('Failed:', error.message);
}
```

Error callbacks are also available:
```typescript
const client = new GdbClient({}, {
  onError: (error) => {
    // Handle error
  }
});
```

## Browser Compatibility

Requires Web Serial API support:
- Chrome/Edge 89+
- Opera 75+

Not supported in Firefox or Safari.

Check support:
```typescript
if (GdbClient.isSupported()) {
  // Use GDB client
} else {
  console.log('Web Serial API not supported');
}
```

## References

- [GDB Remote Serial Protocol Documentation](https://sourceware.org/gdb/current/onlinedocs/gdb/Remote-Protocol.html)
- [Black Magic Probe Documentation](https://black-magic.org/)
- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Serial)
