# SWO/ITM Decoder for BattleMagic

## Overview

The SWO (Serial Wire Output) decoder provides real-time trace data capture and analysis for ARM Cortex-M microcontrollers. It implements the ARM CoreSight ITM (Instrumentation Trace Macrocell) protocol to decode debug output, performance data, and system events.

## Architecture

The decoder follows a modular, testable design with clear separation of concerns:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  BaseDecoder │◄────│  SwoDecoder  │     │  SwoViewer   │
│   (Abstract) │     │  (Concrete)  │     │  (React UI)  │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                     │                     │
       │              ┌──────▼──────┐             │
       │              │ IPacketObser│◄────────────┘
       │              │     ver      │
       │              └──────────────┘
       │
   Template Methods:
   - handleSyncSearch()
   - handleHeader()
   - handlePayload()
```

### Key Components

1. **BaseDecoder** (`BaseDecoder.ts`)
   - Abstract base class providing core decoder infrastructure
   - State machine implementation
   - Observer pattern for event distribution
   - Statistics collection
   - Buffer management

2. **SwoDecoder** (`SwoDecoder.ts`)
   - Concrete ITM protocol implementation
   - Packet parsing and validation
   - Synchronization detection
   - Error recovery

3. **SwoViewer** (`SwoViewer.tsx`)
   - React component for real-time visualization
   - Port filtering and color coding
   - Search and export capabilities
   - Performance statistics display

4. **Type Definitions** (`types.ts`)
   - Comprehensive TypeScript interfaces
   - Protocol constants
   - Packet structures

## Features

### Supported Packet Types

- **Instrumentation Packets**: Printf-style debug output from ITM stimulus ports 0-31
- **Hardware Source Packets**: DWT events including PC sampling and exception trace
- **Timestamp Packets**: Relative and absolute timing information
- **Synchronization Packets**: Protocol alignment markers
- **Overflow Detection**: Data loss indicators

### User Interface

- **Real-time Display**: Live trace data with automatic scrolling
- **Port Filtering**: Enable/disable individual ITM ports (0-31)
- **Color Coding**: Visual distinction between ports
- **Search**: Filter trace output by text or port
- **Export**: Save trace data to file
- **Statistics**: Packet counts, errors, and performance metrics

## Usage

### Enabling SWO on Target

#### 1. STM32 Example

```c
// Configure SWO output
void configure_swo(uint32_t baudrate) {
    // Enable TPIU and ITM clocks
    CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;

    // Configure TPIU for SWO UART mode
    TPI->ACPR = (SystemCoreClock / baudrate) - 1;  // Baud rate prescaler
    TPI->SPPR = 2;  // UART/NRZ mode
    TPI->FFCR = 0x100;  // Disable formatter

    // Configure ITM
    ITM->LAR = 0xC5ACCE55;  // Unlock ITM
    ITM->TCR = ITM_TCR_ITMENA_Msk |  // Enable ITM
               ITM_TCR_SYNCENA_Msk |  // Enable sync packets
               ITM_TCR_TSENA_Msk;     // Enable timestamps

    // Enable stimulus ports (0-31)
    ITM->TER = 0xFFFFFFFF;  // Enable all ports

    // Configure DWT for PC sampling (optional)
    DWT->CTRL = DWT_CTRL_PCSAMPLENA_Msk |  // Enable PC sampling
                DWT_CTRL_CYCTAP_Msk |       // Cycle counter tap
                DWT_CTRL_CYCCNTENA_Msk;     // Enable cycle counter
}
```

#### 2. Using ITM for Printf

```c
// Redirect printf to ITM port 0
int _write(int file, char *ptr, int len) {
    for (int i = 0; i < len; i++) {
        ITM_SendChar(ptr[i]);
    }
    return len;
}

// Or use ITM directly
void debug_print(const char *msg) {
    while (*msg) {
        // Wait for port to be ready
        while (ITM->PORT[0].u32 == 0);
        ITM->PORT[0].u8 = *msg++;
    }
}

// Using different ports for categorization
#define LOG_PORT_ERROR   1
#define LOG_PORT_WARNING 2
#define LOG_PORT_INFO    3

void log_error(const char *msg) {
    itm_send_string(LOG_PORT_ERROR, msg);
}
```

#### 3. Black Magic Probe Configuration

```gdb
# Connect to Black Magic Probe
target extended-remote /dev/ttyACM0

# Enable SWO at 2MHz
monitor traceswo 2000000

# Optional: Configure SWO pin
monitor swdp_scan

# Attach to target
attach 1

# SWO data will now be captured
```

### ITM Stimulus Port Usage

The ITM provides 32 independent stimulus ports (0-31) for different data streams:

| Port  | Common Usage               |
| ----- | -------------------------- |
| 0     | Printf output (default)    |
| 1-7   | Application logging levels |
| 8-15  | Module-specific debug      |
| 16-23 | Performance metrics        |
| 24-30 | User-defined               |
| 31    | Reserved/Special           |

### Example: Multi-Port Logging

```c
typedef enum {
    ITM_PORT_PRINTF = 0,
    ITM_PORT_ERROR = 1,
    ITM_PORT_WARNING = 2,
    ITM_PORT_INFO = 3,
    ITM_PORT_DEBUG = 4,
    ITM_PORT_PERF = 8,
    ITM_PORT_DMA = 16,
    ITM_PORT_ISR = 17
} itm_port_t;

void itm_send_string(uint8_t port, const char *str) {
    while (*str) {
        while (ITM->PORT[port].u32 == 0);
        ITM->PORT[port].u8 = *str++;
    }
}

// Usage
itm_send_string(ITM_PORT_ERROR, "Fatal error occurred\n");
itm_send_string(ITM_PORT_PERF, "Task completed in 150us\n");
```

## Protocol Details

### ITM Packet Format

Each ITM packet consists of a header byte followed by 0-4 payload bytes:

```
Header Byte Format:
┌─┬─┬─┬─┬─┬─┬─┬─┐
│7│6│5│4│3│2│1│0│
└─┴─┴─┴─┴─┴─┴─┴─┘
  │ │ │ │ │ │ └─┴── Packet Type
  │ │ │ │ │ └────── Size (instrumentation)
  │ │ └─┴─┴──────── Port/Source ID
  └─┴────────────── Extension/Control
```

### Packet Types

1. **Instrumentation (0bSSSSSS01)**
   - S: Stimulus port number (0-31)
   - Payload: 1, 2, or 4 bytes

2. **Hardware Source (0bAAAAA1S0)**
   - A: Source address
   - S: Size bit
   - Used for DWT events

3. **Timestamp (0bCDDD0TS0)**
   - C: Continuation
   - D: Data bits
   - T: TC bit
   - S: TS bit

4. **Synchronization**
   - Pattern: `00 00 00 00 00 80`
   - Used for protocol alignment

## Limitations

### Black Magic Probe

The Black Magic Probe has limited SWO support:

- **Bandwidth**: Maximum 2MHz SWO frequency
- **Buffer Size**: Limited internal buffering
- **Features**: Basic ITM support, limited DWT features
- **Configuration**: Manual setup via monitor commands

### Browser Environment

- **Data Source**: Requires integration with serial port or WebSocket
- **Performance**: JavaScript decoding may limit throughput
- **Storage**: Limited buffer size for trace history

## Performance Considerations

### Target Configuration

1. **SWO Frequency**: Match target CPU frequency

   ```
   SWO_freq = CPU_freq / (PRESCALER + 1)
   ```

2. **Port Filtering**: Disable unused ports to reduce bandwidth

   ```c
   ITM->TER = 0x0000000F;  // Enable only ports 0-3
   ```

3. **Timestamp Prescaler**: Reduce timestamp frequency
   ```c
   ITM->TCR |= (3 << 8);  // Prescale by 64
   ```

### Decoder Optimization

- **Port Filtering**: Filter at decoder level to reduce processing
- **Buffer Management**: Circular buffers with size limits
- **Batch Processing**: Process multiple packets per update cycle

## Troubleshooting

### No SWO Output

1. Verify SWO pin connection
2. Check clock configuration
3. Ensure ITM is enabled
4. Verify port is unlocked (`ITM->LAR = 0xC5ACCE55`)

### Corrupted Data

1. Check baudrate match
2. Verify signal integrity
3. Look for overflow indicators
4. Check synchronization status

### Missing Packets

1. Monitor overflow events
2. Check buffer sizes
3. Verify port enables
4. Review filter settings

## API Reference

### SwoDecoder

```typescript
class SwoDecoder extends BaseDecoder {
  constructor(options: DecoderOptions);
  decode(data: Uint8Array): void;
  addObserver(observer: IPacketObserver): void;
  removeObserver(observer: IPacketObserver): void;
  getStatistics(): SwoStatistics;
  reset(): void;
}
```

### DecoderOptions

```typescript
interface DecoderOptions {
  encoding: SwoEncoding; // UART_NRZ or MANCHESTER
  autoSync?: boolean; // Auto-detect sync (default: true)
  portFilter?: PortFilter; // Port filtering configuration
  maxBufferSize?: number; // Buffer limit (default: 4096)
  collectStats?: boolean; // Enable statistics (default: true)
}
```

### IPacketObserver

```typescript
interface IPacketObserver {
  onPacket(event: PacketEvent): void;
  onError?(error: DecoderError): void;
}
```

## Testing

### Unit Testing

The modular architecture enables comprehensive unit testing:

```typescript
// Test packet decoding
describe("SwoDecoder", () => {
  it("should decode instrumentation packets", () => {
    const decoder = new SwoDecoder({ encoding: SwoEncoding.UART_NRZ });
    const observer = createMockObserver();
    decoder.addObserver(observer);

    // Send ITM packet for port 0, 1 byte payload
    decoder.decode(new Uint8Array([0x01, 0x48])); // 'H'

    expect(observer.onPacket).toHaveBeenCalledWith(
      expect.objectContaining({
        packet: expect.objectContaining({
          type: PacketType.INSTRUMENTATION,
          port: 0,
          text: "H",
        }),
      }),
    );
  });
});
```

### Integration Testing

```typescript
// Test with simulated SWO stream
const testStream = new Uint8Array([
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x80, // Sync
  0x01,
  0x48,
  0x65,
  0x6c,
  0x6c,
  0x6f, // "Hello" on port 0
  0x70, // Overflow
]);
```

## Contributing

When contributing to the SWO decoder:

1. **Maintain Modularity**: Keep components loosely coupled
2. **Add Tests**: Include unit tests for new features
3. **Document Protocol**: Reference ARM documentation
4. **Consider Performance**: Profile decoder with large datasets
5. **Handle Errors**: Graceful degradation for malformed packets

## References

- [ARM CoreSight Architecture Specification](https://developer.arm.com/documentation/ihi0029/latest)
- [ITM and DWT Programming Guide](https://developer.arm.com/documentation/ddi0337/latest)
- [Black Magic Probe Documentation](https://github.com/blackmagic-debug/blackmagic/wiki)
- [STM32 Programming Manual](https://www.st.com/resource/en/programming_manual/pm0056-stm32f10xxx20xxx21xxxl1xxxx-cortexm3-programming-manual-stmicroelectronics.pdf)
