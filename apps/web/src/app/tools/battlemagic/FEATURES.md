# BattleMagic - Black Magic Probe Feature Support Matrix

## Overview
BattleMagic is a comprehensive web-based interface for the Black Magic Probe (BMP) debugger, providing full support for all BMP features through a modern browser interface using the Web Serial API.

## Version Requirements
- **Minimum BMP Firmware:** v1.7.1
- **Recommended:** v1.9.3 or later
- **Latest Stable:** v1.9.3 (as of January 2025)

## Feature Support Status

### ✅ Core Debug Features (100% Support)

| Feature | BMP Command | Status | Description |
|---------|------------|--------|-------------|
| **SWD Interface** | `monitor swdp_scan` | ✅ Supported | Serial Wire Debug protocol scanning and connection |
| **JTAG Interface** | `monitor jtag_scan` | ✅ Supported | JTAG chain scanning and device detection |
| **Auto Scan** | `monitor auto_scan` | ✅ Supported | Automatic detection of debug interface type |
| **Target List** | `monitor targets` | ✅ Supported | Display available targets after scan |
| **Version Query** | `monitor version` | ✅ Supported | Get BMP firmware and hardware version |
| **Help System** | `monitor help` | ✅ Supported | Display available monitor commands |

### ✅ Target Control (100% Support)

| Feature | BMP Command | Status | Description |
|---------|------------|--------|-------------|
| **Halt/Break** | Ctrl+C | ✅ Supported | Stop target execution |
| **Continue/Run** | `c` | ✅ Supported | Resume target execution |
| **Single Step** | `s` | ✅ Supported | Execute single instruction |
| **Reset** | `monitor reset` | ✅ Supported | Pulse nRST line |
| **Hard Reset** | `monitor hard_srst` | ✅ Supported | Perform hard system reset |
| **Connect Under Reset** | `monitor connect_srst` | ✅ Supported | Connect while holding reset |
| **TDI Low Reset** | `monitor tdi_low_reset` | ✅ Supported | Special reset for LPC82x targets |

### ✅ Memory Operations (100% Support)

| Feature | GDB Command | Status | Description |
|---------|-------------|--------|-------------|
| **Memory Read** | `m` packet | ✅ Supported | Read target memory |
| **Memory Write** | `M` packet | ✅ Supported | Write target memory |
| **Memory Map** | `monitor memory_map` | ✅ Supported | Get target memory regions |
| **Flash Programming** | vFlash packets | ✅ Supported | Program target flash memory |
| **Mass Erase** | `monitor mass_erase` | ✅ Supported | Erase entire flash (target specific) |
| **Heap Info** | `monitor heapinfo` | ✅ Supported | Set stack/heap information |

### ✅ Register Operations (100% Support)

| Feature | GDB Command | Status | Description |
|---------|-------------|--------|-------------|
| **Read All Registers** | `g` packet | ✅ Supported | Read all CPU registers |
| **Read Single Register** | `p` packet | ✅ Supported | Read specific register |
| **Write Register** | `P` packet | ✅ Supported | Modify register value |
| **Register Display** | UI Panel | ✅ Supported | Real-time register visualization |

### ✅ Breakpoint Management (100% Support)

| Feature | GDB Command | Status | Description |
|---------|-------------|--------|-------------|
| **Software Breakpoints** | `Z0` packet | ✅ Supported | Up to unlimited software breakpoints |
| **Hardware Breakpoints** | `Z1` packet | ✅ Supported | Up to 6 hardware breakpoints |
| **Remove Breakpoints** | `z0/z1` packets | ✅ Supported | Clear breakpoints |
| **Breakpoint Manager** | UI Panel | ✅ Supported | Visual breakpoint management |

### ✅ Advanced Debug Features

| Feature | BMP Command | Status | Description |
|---------|------------|--------|-------------|
| **Frequency Control** | `monitor frequency` | ✅ Supported | Set debug clock frequency |
| **Halt Timeout** | `monitor halt_timeout` | ✅ Supported | Configure halt wait timeout |
| **Morse Code** | `monitor morse` | ✅ Supported | Display morse error messages |
| **Vector Catch** | `monitor vector_catch` | ✅ Supported | Catch exception vectors |
| **Power Control** | `monitor tpwr` | ✅ Supported | Control target power (BMP v2+) |

### ✅ Trace & Communication Features

| Feature | BMP Command | Status | Description |
|---------|------------|--------|-------------|
| **SWO Trace** | `monitor traceswo` | ✅ Supported | Serial Wire Output trace capture |
| **RTT** | `monitor rtt` | ✅ Supported | SEGGER Real-Time Transfer |
| **Semihosting** | `monitor semihosting` | ✅ Supported | ARM semihosting for I/O |
| **UART Pass-through** | Serial Port 2 | ✅ Supported | Target UART communication |

### ✅ UI Features (BattleMagic Exclusive)

| Feature | Description | Status |
|---------|-------------|--------|
| **Split Panel Interface** | Resizable GDB and UART panels | ✅ Supported |
| **Quick Connect** | Remember and auto-connect to last used ports | ✅ Supported |
| **Version Detection** | Automatic BMP version check with compatibility warnings | ✅ Supported |
| **Feature Indicators** | Visual indicators for available features based on version | ✅ Supported |
| **Firmware Extraction** | Extract firmware from connected target | ✅ Supported |
| **Disassembly View** | ARM Thumb/Thumb2 instruction disassembly | ✅ Supported |
| **Memory Inspector** | Hex/ASCII memory viewer with edit capability | ✅ Supported |
| **Stack Trace** | Visual stack frame display | ✅ Supported |
| **Target Info Panel** | Display target identification and memory map | ✅ Supported |

## Protocol Support

### Supported GDB RSP Commands
- `?` - Status query
- `g` - Read registers
- `G` - Write registers
- `m` - Read memory
- `M` - Write memory
- `c` - Continue
- `s` - Step
- `k` - Kill/detach
- `D` - Detach
- `Z0-4` - Insert breakpoint/watchpoint
- `z0-4` - Remove breakpoint/watchpoint
- `qSupported` - Query features
- `qRcmd` - Monitor commands
- `vAttach` - Attach to target
- `vFlashErase` - Erase flash
- `vFlashWrite` - Write flash
- `vFlashDone` - Complete flash operation
- `qfThreadInfo` - Thread info
- `qC` - Current thread

### Supported Target Architectures
- **ARM Cortex-M Series:**
  - Cortex-M0/M0+
  - Cortex-M3
  - Cortex-M4/M4F
  - Cortex-M7
  - Cortex-M23
  - Cortex-M33
- **STM32 Family** (all variants)
- **NXP LPC Family**
- **Nordic nRF5x Series**
- **Atmel SAM Family**
- **GigaDevice GD32 Family**
- **And many more ARM-based MCUs**

## Version Compatibility Matrix

| Feature | v1.6.x | v1.7.x | v1.8.x | v1.9.x |
|---------|--------|--------|--------|--------|
| Basic Debug | ✅ | ✅ | ✅ | ✅ |
| SWD/JTAG | ✅ | ✅ | ✅ | ✅ |
| Auto Scan | ❌ | ✅ | ✅ | ✅ |
| Power Control | ✅ | ✅ | ✅ | ✅ |
| Frequency Control | ❌ | ✅ | ✅ | ✅ |
| Connect Under Reset | ❌ | ✅ | ✅ | ✅ |
| SWO Trace | ❌ | ✅ | ✅ | ✅ |
| RTT | ❌ | ❌ | ✅ | ✅ |
| Vector Catch | ❌ | ✅ | ✅ | ✅ |
| Enhanced Flash | ❌ | ✅ | ✅ | ✅ |

## Installation & Setup

### Prerequisites
1. **Browser Requirements:**
   - Chrome/Edge 89+ (Web Serial API support)
   - Secure context (HTTPS or localhost)

2. **Black Magic Probe:**
   - Firmware v1.7.1 minimum
   - USB connection to host computer

### Quick Start
1. Connect Black Magic Probe to USB
2. Open BattleMagic in supported browser
3. Click "Connect" for GDB port
4. Select Black Magic Probe from serial port list
5. Click "Scan Targets" to detect connected device
6. Select target and begin debugging

### Port Identification
- **GDB Port:** Usually first BMP serial port (e.g., COM3 or /dev/ttyACM0)
- **UART Port:** Usually second BMP serial port (e.g., COM4 or /dev/ttyACM1)

## Advantages Over Other Tools

### vs OpenOCD
- ✅ No installation required
- ✅ No configuration files needed
- ✅ Automatic target detection
- ✅ Built-in GDB server
- ✅ Web-based interface

### vs GDB CLI
- ✅ Visual interface for all operations
- ✅ Real-time register and memory display
- ✅ Integrated UART terminal
- ✅ Built-in firmware extraction
- ✅ No command memorization needed

### vs Proprietary Debuggers
- ✅ Completely free and open source
- ✅ No license restrictions
- ✅ Cross-platform (runs in browser)
- ✅ No vendor lock-in
- ✅ Supports wide range of targets

## Troubleshooting

### Common Issues

1. **"Version not detected"**
   - Ensure GDB connection is established
   - Click "Check" button to manually query version
   - Verify BMP firmware is v1.7.1 or newer

2. **"Feature not supported"**
   - Update BMP firmware to latest version
   - Check feature compatibility matrix above
   - Some features are target-specific

3. **Connection Failed**
   - Ensure browser supports Web Serial API
   - Check USB cable and connections
   - Try different USB port
   - Clear saved ports and reconnect

4. **Target Not Found**
   - Verify target power and connections
   - Check SWD/JTAG wiring
   - Try both `swdp_scan` and `jtag_scan`
   - Ensure target is not in sleep/low-power mode

## Contributing

BattleMagic is open source and welcomes contributions. Areas for improvement:
- Additional target-specific features
- Enhanced trace decoding
- Performance profiling tools
- Multi-target debugging support
- Custom scripting interface

## License

BattleMagic is released under the MIT License. The Black Magic Probe firmware is licensed under GPLv3+.

## Resources

- [Black Magic Probe Official Site](https://black-magic.org)
- [BMP GitHub Repository](https://github.com/blackmagic-debug/blackmagic)
- [BattleMagic Repository](https://github.com/battlewithbytes/battlemagic)
- [GDB Remote Serial Protocol](https://sourceware.org/gdb/onlinedocs/gdb/Remote-Protocol.html)

---

*Last Updated: January 2025*
*BattleMagic Version: 1.0.0*
*Compatible with BMP Firmware: v1.7.1 - v1.9.3+*