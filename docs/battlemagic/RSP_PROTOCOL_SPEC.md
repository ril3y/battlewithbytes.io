# GDB Remote Serial Protocol (RSP) - Complete Specification & Implementation Guide

This document provides a comprehensive reference for the GDB Remote Serial Protocol as implemented in BattleMagic, with specific focus on ARM Cortex-M targets and Black Magic Probe.

## Table of Contents

1. [Protocol Overview](#protocol-overview)
2. [Packet Format](#packet-format)
3. [Response Types](#response-types)
4. [Register Operations](#register-operations)
5. [Memory Operations](#memory-operations)
6. [Execution Control](#execution-control)
7. [Breakpoints & Watchpoints](#breakpoints--watchpoints)
8. [Stop Replies](#stop-replies)
9. [Monitor Commands](#monitor-commands)
10. [Error Codes](#error-codes)
11. [ARM Cortex-M Specifics](#arm-cortex-m-specifics)
12. [Black Magic Probe Extensions](#black-magic-probe-extensions)

---

## Protocol Overview

### Communication Model

GDB RSP is a request-response protocol over a serial connection:

```
Client (GDB/Browser)  <-->  Server (Debug Probe/BMP)
      Send command              Process command
      Wait for response         Send response
```

### Protocol Modes

1. **ACK Mode** (default):
   - Each packet is acknowledged with '+' or '-'
   - Reliable but slower
   - Used during connection establishment

2. **NoACK Mode** (optional):
   - No acknowledgments sent
   - Faster but requires reliable transport (USB is reliable)
   - Negotiated with `QStartNoAckMode`

### Character Encoding

- All data is ASCII
- Binary data is hex-encoded (2 ASCII chars per byte)
- Little-endian encoding for multi-byte values

---

## Packet Format

### Basic Packet Structure

```
$<packet-data>#<checksum>
│     │         │    │
│     │         │    └─ 2 hex digits (sum of packet-data bytes mod 256)
│     │         └────── Checksum delimiter
│     └──────────────── Command/response data
└────────────────────── Start delimiter
```

### Examples

**Command packet:**

```
$g#67
│││ ││
│││ │└─ Checksum digit 2: '7'
│││ └── Checksum digit 1: '6'
││└──── Checksum delimiter
│└───── Command: 'g' (read registers)
└────── Start delimiter

Checksum calculation: ord('g') = 0x67 = 103
103 % 256 = 103 = 0x67 -> "67"
```

**Response packet:**

```
$00000000010000000200000003000000...#b8
│                                   │ ││
│                                   │ └┴─ Checksum
│                                   └──── Delimiter
└────────────────────────────────────── Register data (hex)
```

### Special Characters

| Character | Meaning                      | ASCII Code |
| --------- | ---------------------------- | ---------- |
| `$`       | Packet start                 | 0x24       |
| `#`       | Checksum delimiter           | 0x23       |
| `+`       | ACK (packet received OK)     | 0x2B       |
| `-`       | NAK (request retransmission) | 0x2D       |
| `\x03`    | Interrupt (Ctrl+C)           | 0x03       |
| `}`       | Escape character             | 0x7D       |
| `*`       | Run-length encoding          | 0x2A       |

### Escape Sequences

Characters in packet data that conflict with protocol delimiters must be escaped:

```
Escaped chars: $ # } *

Encoding: } followed by (char XOR 0x20)

Example: '$' (0x24) -> '}' + (0x24 XOR 0x20) -> '}' + 0x04 -> "}^D"
         '#' (0x23) -> '}' + (0x23 XOR 0x20) -> '}' + 0x03 -> "}^C"
```

### Run-Length Encoding (RLE)

Repeated characters can be compressed:

```
Format: <char>*<count>

Count = ASCII(' ') + (repeat_count - 4)
       = 0x20 + (repeat_count - 4)

Example: "00000000" -> "0*,"
         (',' = 0x2C = 0x20 + 12 - 4 = 0x20 + 8)
         Actually means 8 + 4 = 12 repetitions? No, count is encoded value - 29 + 4

Note: RLE rarely used in practice due to complexity
```

---

## Response Types

All responses fall into these categories:

### 1. OK Response

```
Format: OK
Meaning: Command succeeded
Used for: Write operations, configuration changes
```

### 2. Error Response

```
Format: Enn
Where: nn = two hex digit error code

Examples:
E01 - Generic error
E02 - Invalid memory address
E03 - Invalid register number
```

### 3. Data Response

```
Format: <hex-data>
Meaning: Requested data in hex encoding
Used for: Memory reads, register reads

Example: 48656c6c6f (ASCII "Hello")
```

### 4. Signal/Stop Response

```
Format: Snn  (simple)
        Tnn[key:value;]...  (detailed)
Where: nn = two hex digit signal number

Signal numbers:
02 = SIGINT (Ctrl+C)
05 = SIGTRAP (breakpoint)
0B = SIGSEGV (memory fault)
```

### 5. Empty Response

```
Format: (empty string)
Meaning: Command not supported or no data
```

### 6. Console Output

```
Format: O<hex-encoded-text>
Meaning: Console output from target/monitor
Example: O48656c6c6f ("Hello")
```

---

## Register Operations

### Read All Registers (g command)

**Command:**

```
$g#67
```

**Response:**

```
$<reg0><reg1><reg2>...<regN>#checksum

Each register:
- 32-bit (ARM): 8 hex digits, little-endian
- 64-bit: 16 hex digits, little-endian
```

**ARM Cortex-M Register Order:**

```
Offset | Register | Size | Description
-------|----------|------|-------------
0      | r0       | 32   | General purpose register 0
8      | r1       | 32   | General purpose register 1
16     | r2       | 32   | General purpose register 2
24     | r3       | 32   | General purpose register 3
32     | r4       | 32   | General purpose register 4
40     | r5       | 32   | General purpose register 5
48     | r6       | 32   | General purpose register 6
56     | r7       | 32   | General purpose register 7
64     | r8       | 32   | General purpose register 8
72     | r9       | 32   | General purpose register 9
80     | r10      | 32   | General purpose register 10
88     | r11      | 32   | General purpose register 11 (FP)
96     | r12      | 32   | General purpose register 12
104    | sp (r13) | 32   | Stack pointer
112    | lr (r14) | 32   | Link register
120    | pc (r15) | 32   | Program counter
128    | xpsr     | 32   | Program status register (optional)
136    | msp      | 32   | Main stack pointer (optional)
144    | psp      | 32   | Process stack pointer (optional)
152    | primask  | 32   | Priority mask (optional)
160    | basepri  | 32   | Base priority (optional)
168    | faultmask| 32   | Fault mask (optional)
176    | control  | 32   | Control register (optional)
```

**Example Response:**

```
PC = 0x08008000
Encoded as little-endian: 00 80 00 08 -> "00800008"

Full response for PC at offset 120:
"00000000010000000200000003000000...00800008...#checksum"
 \_r0___/ \_r1___/ \_r2___/ \_r3___/   \__pc__/
```

### Read Single Register (p command)

**Command:**

```
$p<n>#checksum
Where: n = hex register number
```

**Examples:**

```
$p0#70     - Read r0
$pf#7f     - Read pc (r15)
$pd#7d     - Read sp (r13)
```

**Response:**

```
$<hex-value>#checksum

Little-endian encoding:
Value 0x08008000 -> "00800008"
```

### Write Single Register (P command)

**Command:**

```
$P<n>=<value>#checksum
Where: n = hex register number
       value = hex value (little-endian)
```

**Example:**

```
Set PC to 0x08008000:
$Pf=00800008#checksum
```

**Response:**

```
$OK#checksum  (success)
$E01#checksum (error)
```

### Write All Registers (G command)

**Command:**

```
$G<reg0><reg1>...<regN>#checksum
```

**Response:**

```
$OK#checksum
```

---

## Memory Operations

### Read Memory (m command)

**Command:**

```
$m<addr>,<length>#checksum
Where: addr = hex address
       length = hex byte count
```

**Examples:**

```
$m20000000,100#checksum  - Read 0x100 bytes from 0x20000000
$m08000000,4#checksum    - Read 4 bytes from 0x08000000
```

**Response:**

```
$<hex-data>#checksum

Data encoding: Raw memory bytes as hex (NOT little-endian)
Each byte: 2 hex digits

Example: Memory [0x20000000] = {0x48, 0x65, 0x6c, 0x6c, 0x6f}
Response: "48656c6c6f" (ASCII "Hello")
```

**Important:** Memory data is NOT little-endian encoded. Bytes are in memory order.

To read a 32-bit word:

```
Memory at 0x20000000: 0x12 0x34 0x56 0x78 (little-endian 0x78563412)
Response: "12345678"
Interpretation: Read bytes, reverse for word value
```

### Write Memory (M command)

**Command:**

```
$M<addr>,<length>:<hex-data>#checksum
```

**Example:**

```
Write "Hello" to 0x20000000:
$M20000000,5:48656c6c6f#checksum
```

**Response:**

```
$OK#checksum  (success)
$E01#checksum (error - invalid address)
$E02#checksum (error - write protected)
```

### Binary Memory Write (X command)

**Command:**

```
$X<addr>,<length>:<binary-data>#checksum

binary-data may contain escaped characters
```

**Response:**

```
$OK#checksum
```

**Note:** X command allows binary data with escape sequences, more efficient than M for large writes.

---

## Execution Control

### Continue (c command)

**Command:**

```
$c#63
$c<addr>#checksum  (continue from address)
```

**Response:**

```
No immediate response - target is running

When target stops:
$T05#checksum  (stopped with signal 5)
```

### Single Step (s command)

**Command:**

```
$s#73
$s<addr>#checksum  (step from address)
```

**Response:**

```
$T05#checksum  (stopped after one instruction)
```

### Halt (Ctrl+C)

**Command:**

```
\x03  (not a packet, just 0x03 byte)
```

**Response:**

```
$T02#checksum  (stopped with SIGINT)
```

### Detach (D command)

**Command:**

```
$D#44
```

**Response:**

```
$OK#checksum
```

Target continues running after detach.

### Kill (k command)

**Command:**

```
$k#6b
```

**Response:**

```
No response (connection terminates)
```

---

## Breakpoints & Watchpoints

### Insert Breakpoint (Z command)

**Command:**

```
$Z<type>,<addr>,<kind>#checksum

type:
  0 = software breakpoint
  1 = hardware breakpoint
  2 = write watchpoint
  3 = read watchpoint
  4 = access watchpoint

addr: hex address
kind: implementation-specific (usually instruction size)
      For ARM Thumb: 2 (16-bit)
      For ARM: 4 (32-bit)
```

**Examples:**

```
$Z0,08000000,2#checksum  - Software breakpoint at 0x08000000
$Z1,08001000,2#checksum  - Hardware breakpoint at 0x08001000
$Z2,20000100,4#checksum  - Write watchpoint on 4 bytes at 0x20000100
```

**Response:**

```
$OK#checksum       (success)
$#checksum         (empty - not supported)
$E01#checksum      (error)
```

### Remove Breakpoint (z command)

**Command:**

```
$z<type>,<addr>,<kind>#checksum
(Same format as Z)
```

**Response:**

```
$OK#checksum
$E01#checksum
```

### ARM Cortex-M Breakpoint Limits

- **Hardware breakpoints:** Typically 4-6 (FPB - Flash Patch and Breakpoint)
- **Software breakpoints:** Unlimited (uses BKPT instruction)
- **Watchpoints:** Typically 1-4 (DWT - Data Watchpoint and Trace)

---

## Stop Replies

### Simple Stop Reply (S packet)

**Format:**

```
$Snn#checksum
Where: nn = signal number (2 hex digits)
```

**Example:**

```
$S05#checksum  (SIGTRAP - breakpoint hit)
```

### Detailed Stop Reply (T packet)

**Format:**

```
$Tnn[key:value;]...#checksum

nn = signal number
key:value pairs provide additional info
```

**Common Keys:**

| Key       | Value Format | Meaning                                       |
| --------- | ------------ | --------------------------------------------- |
| `thread`  | hex          | Thread ID that stopped                        |
| `core`    | hex          | Core number (multi-core)                      |
| `swbreak` | (empty)      | Software breakpoint hit                       |
| `hwbreak` | (empty)      | Hardware breakpoint hit                       |
| `watch`   | hex addr     | Write watchpoint hit                          |
| `rwatch`  | hex addr     | Read watchpoint hit                           |
| `awatch`  | hex addr     | Access watchpoint hit                         |
| `NN`      | hex value    | Register NN value (NN is hex register number) |

**Examples:**

```
Basic breakpoint:
$T05#checksum

Breakpoint with thread:
$T05thread:01;#checksum

Software breakpoint with PC:
$T05swbreak:;0f:00800008;#checksum
                \_reg 15_/ \__value__/

Watchpoint:
$T05watch:20000100;0f:00800008;#checksum
         \_address/ \_PC value__/
```

### Signal Numbers

| Signal  | Number | Meaning               |
| ------- | ------ | --------------------- |
| SIGINT  | 0x02   | Interrupt (Ctrl+C)    |
| SIGILL  | 0x04   | Illegal instruction   |
| SIGTRAP | 0x05   | Trace/breakpoint trap |
| SIGBUS  | 0x0A   | Bus error             |
| SIGSEGV | 0x0B   | Segmentation fault    |
| SIGTERM | 0x0F   | Termination request   |

---

## Monitor Commands

Monitor commands are sent to the debug probe, not the target CPU.

### Command Format (qRcmd)

**Command:**

```
$qRcmd,<hex-encoded-command>#checksum
```

**Example:**

```
Send "version":
"version" -> hex: 76657273696f6e
$qRcmd,76657273696f6e#checksum
```

**Response:**

```
$O<hex-encoded-output>#checksum  (console output)
$OK#checksum                     (command completed)
$E01#checksum                    (error)

Multiple O packets may be sent for long output:
$O48656c6c6f#checksum  ("Hello")
$O20576f726c64#checksum (" World")
$OK#checksum
```

### Black Magic Probe Monitor Commands

See [Black Magic Probe Extensions](#black-magic-probe-extensions) section.

---

## Error Codes

| Code | Hex  | Meaning                             |
| ---- | ---- | ----------------------------------- |
| E00  | 0x00 | No error (shouldn't occur)          |
| E01  | 0x01 | Generic error                       |
| E02  | 0x02 | Invalid memory address              |
| E03  | 0x03 | Invalid register number             |
| E04  | 0x04 | Target not stopped                  |
| E05  | 0x05 | Target not running                  |
| E06  | 0x06 | Invalid parameter                   |
| E07  | 0x07 | Permission denied / Write protected |
| E08  | 0x08 | Operation not supported             |
| E09  | 0x09 | Resource not available              |
| E0A  | 0x0A | Invalid thread ID                   |
| E0B  | 0x0B | Invalid target ID                   |

**Note:** Error codes are implementation-specific. Always check the error message.

---

## ARM Cortex-M Specifics

### Memory Map

Typical ARM Cortex-M memory layout:

```
0x00000000 - 0x1FFFFFFF : Code (Flash, ROM)
  0x08000000 - 0x080FFFFF : STM32 Flash (typical)

0x20000000 - 0x3FFFFFFF : SRAM
  0x20000000 - 0x2001FFFF : STM32 SRAM (typical)

0x40000000 - 0x5FFFFFFF : Peripherals

0xE0000000 - 0xE00FFFFF : Private Peripheral Bus
  0xE000E000 - 0xE000EFFF : System Control Space
    0xE000ED00 : CPUID
    0xE000ED04 : ICSR
    0xE000ED08 : VTOR (Vector Table Offset)
```

### Special Registers

**XPSR (Program Status Register):**

```
Bit 31: N (Negative)
Bit 30: Z (Zero)
Bit 29: C (Carry)
Bit 28: V (Overflow)
Bits 27-24: Reserved
Bit 24: T (Thumb state, always 1)
Bits 8-0: Exception number (0 = Thread mode)
```

**CONTROL Register:**

```
Bit 0: nPRIV (0=privileged, 1=unprivileged)
Bit 1: SPSEL (0=MSP, 1=PSP)
Bit 2: FPCA (FP context active)
```

### Vector Table

Located at address in VTOR (default 0x00000000 or 0x08000000):

```
Offset | Vector
-------|--------
0x00   | Initial SP value
0x04   | Reset handler
0x08   | NMI handler
0x0C   | HardFault handler
0x10   | MemManage handler
0x14   | BusFault handler
0x18   | UsageFault handler
...    | ...
```

### Thumb Mode

ARM Cortex-M always executes in Thumb mode:

- PC bit 0 is always 0 (aligned)
- Function addresses have bit 0 set to indicate Thumb
- When setting PC, clear bit 0

---

## Black Magic Probe Extensions

### Scan Commands

**SWD Scan:**

```
Command: qRcmd,737764705f7363616e  ("swdp_scan")

Response:
O54617267657420766f6c746167653a20332e33330a  ("Target voltage: 3.33\n")
O417661696c61626c6520546172676574733a0a    ("Available Targets:\n")
O4e6f2e20417474204472697665720a            ("No. Att Driver\n")
O203120202020202053544d333246347878...       (" 1      STM32F4xx...")
OK
```

**JTAG Scan:**

```
Command: qRcmd,6a7461675f7363616e  ("jtag_scan")
```

### Attach Command (vAttach)

**Command:**

```
$vAttach;<hex-target-id>#checksum
```

**Example:**

```
Attach to target 1:
$vAttach;1#checksum
```

**Response:**

```
$T05#checksum  (stopped at attach point)
```

### Power Control

**Enable target power:**

```
Command: qRcmd,7470777220656e61626c65  ("tpwr enable")
Response: OK
```

**Disable target power:**

```
Command: qRcmd,747077722064697361626c65  ("tpwr disable")
Response: OK
```

### Version Query

**Command:**

```
qRcmd,76657273696f6e  ("version")
```

**Response:**

```
O426c61636b204d61676963205072...  ("Black Magic Probe...")
OK
```

### SWO (Serial Wire Output) Trace

**Enable SWO:**

```
Command: qRcmd,74726163657377...  ("traceswo <baudrate>")
Example: traceswo 2000000

Response: OK
```

SWO data appears as console output (O packets).

### Flash Operations

Black Magic Probe handles flash programming transparently:

- Regular memory writes to flash addresses trigger flash operations
- No special commands needed (probe handles erase/program automatically)

### Additional Monitor Commands

| Command              | Hex Encoding         | Description                  |
| -------------------- | -------------------- | ---------------------------- |
| `help`               | 68656c70             | Show help                    |
| `reset`              | 7265736574           | Reset target                 |
| `hard_reset`         | 686172645f7265736574 | Hard reset                   |
| `frequency`          | 667265717...         | Set/get SWD frequency        |
| `targets`            | 7461726765...        | List targets                 |
| `mass_erase`         | 6d6173735f...        | Mass erase flash             |
| `vector_catch`       | 766563746f...        | Configure exception catching |
| `semihosting enable` | 73656d69686f...      | Enable ARM semihosting       |

---

## Implementation Notes

### Checksum Calculation

```python
def calculate_checksum(data: str) -> str:
    sum = 0
    for char in data:
        sum += ord(char)
    checksum = sum % 256
    return f"{checksum:02x}"
```

### Little-Endian Conversion

```python
def to_little_endian(value: int, bytes: int = 4) -> str:
    hex_str = f"{value:0{bytes*2}x}"
    pairs = [hex_str[i:i+2] for i in range(0, len(hex_str), 2)]
    return ''.join(reversed(pairs))

# Example: 0x08008000 -> "00800008"
```

### Parsing Stop Replies

```python
def parse_stop_reply(packet: str) -> dict:
    if not packet.startswith('T'):
        return {'signal': int(packet[1:3], 16)}

    signal = int(packet[1:3], 16)
    info = {}

    pairs = packet[3:].split(';')
    for pair in pairs:
        if ':' in pair:
            key, value = pair.split(':', 1)
            info[key] = value

    return {'signal': signal, 'info': info}
```

---

## Protocol State Machine

```
┌─────────────┐
│ Disconnected│
└──────┬──────┘
       │ connect()
       ▼
┌─────────────┐
│ Connecting  │
└──────┬──────┘
       │ qSupported
       │ QStartNoAckMode (optional)
       ▼
┌─────────────┐
│  Connected  │◄──────┐
└──────┬──────┘       │
       │ vAttach      │ D (detach)
       ▼              │
┌─────────────┐       │
│  Attached   │───────┘
└──────┬──────┘
       │ k (kill) or disconnect()
       ▼
┌─────────────┐
│ Disconnected│
└─────────────┘
```

---

## Performance Optimization

### NoACK Mode

Enable for ~30% speed improvement:

```
$QStartNoAckMode#checksum
Response: $OK#checksum

After this, no more +/- acknowledgments
```

### Binary Memory Operations

Use X command instead of M for large writes:

- M command: 2x overhead (hex encoding)
- X command: Binary data with escape sequences

### Register Caching

Cache register values to avoid repeated reads:

- Invalidate cache on execution (c, s commands)
- Update cache from T packet register values

---

## Troubleshooting

### Common Issues

**1. Checksum Errors**

- Verify checksum calculation includes only packet data
- Check for off-by-one errors in string slicing

**2. Little-Endian Confusion**

- Registers: Little-endian
- Memory: Raw byte order (NOT little-endian encoded)
- Multi-byte values from memory: Little-endian on ARM

**3. Breakpoint Not Hitting**

- Verify address is aligned (even for Thumb)
- Check if code is in RAM vs Flash (Flash needs hardware BP)
- Verify target is actually executing that code

**4. Memory Read Fails**

- Check if address is in valid memory range
- Some regions (peripheral, reserved) may not be readable
- Flash might require target to be halted

### Debug Logging

Enable packet logging to trace protocol:

```typescript
console.log("TX:", packet);
console.log("RX:", response);
```

Look for:

- Malformed packets (missing $ or #)
- Incorrect checksums
- Unexpected response types

---

## References

- [GDB Remote Protocol Documentation](https://sourceware.org/gdb/onlinedocs/gdb/Remote-Protocol.html)
- [ARM Cortex-M Architecture Reference Manual](https://developer.arm.com/documentation/ddi0403/)
- [Black Magic Probe Firmware](https://github.com/blackmagic-debug/blackmagic)
- [GDB RSP Implementation Examples](https://github.com/blackmagic-debug/blackmagic/tree/main/src)

---

**Document Version:** 1.0
**Last Updated:** 2025-01
**BattleMagic Implementation:** X:\battlewithbytes.io\src\app\tools\battlemagic\lib\gdb\
