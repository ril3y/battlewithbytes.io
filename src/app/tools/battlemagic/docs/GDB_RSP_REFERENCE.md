# GDB Remote Serial Protocol Reference for Black Magic Probe

## Complete RSP Command Reference

### 1. Target Information Commands

#### Scanning for Targets

**SWD Scan:**
```
Command: qRcmd,73776470735f7363616e  // "swdp_scan" hex-encoded
Response: O546172676574...            // Hex-encoded output

Decoded response example:
Target voltage: 3.3V
Available Targets:
No. Att Driver
 1      STM32F407VG
```

**JTAG Scan:**
```
Command: qRcmd,6a7461675f7363616e     // "jtag_scan" hex-encoded
Response: Similar format with JTAG chain information
```

**Parsing Logic:**
```javascript
// Extract voltage
/Target voltage:\s*([\d.]+)\s*V/i

// Extract targets
/^\s*(\d+)\s+(.+)$/  // $1 = ID, $2 = Description
```

#### Version Information

```
Command: qRcmd,76657273696f6e         // "version" hex-encoded
Response: O426c61636b204d6167696...   // Hex-encoded version string

Decoded: "Black Magic Probe (Firmware v1.7.1) (Hardware Version 3)"
```

#### Supported Features Query

```
Command: qSupported:multiprocess+;swbreak+;hwbreak+;qRelocInsn+
Response: PacketSize=400;qXfer:memory-map:read+;qXfer:features:read+;...
```

### 2. Memory Information Commands

#### Memory Map (XML)

```
Command: qXfer:memory-map:read::0,1000
Response: m<memory-map>
  <memory type="flash" start="0x08000000" length="0x100000"/>
  <memory type="ram" start="0x20000000" length="0x20000"/>
</memory-map>
```

#### Direct Memory Map Query

```
Command: qRcmd,6d656d6f72795f6d6170   // "memory_map" hex-encoded
Response: Flash: 0x08000000 - 0x08100000 (1024K)
         RAM: 0x20000000 - 0x20020000 (128K)
```

### 3. Chip ID Reading

#### STM32 DBGMCU_IDCODE Register
```
Address: 0xE0042000
Command: mE0042000,4
Response: 10164413               // Little-endian hex bytes

Parsing:
- Bits [11:0]: Device ID (0x413 = STM32F405/407)
- Bits [31:16]: Revision ID
```

#### ARM Cortex-M CPUID Register
```
Address: 0xE000ED00
Command: mE000ED00,4
Response: 10FC24410               // Little-endian hex bytes

Parsing:
- Bits [3:0]: Revision
- Bits [15:4]: Part Number (0xC24 = Cortex-M4)
- Bits [19:16]: Architecture (0xF = ARMv7-M)
- Bits [23:20]: Variant
- Bits [31:24]: Implementer (0x41 = ARM)
```

### 4. Connection State Management

#### States and Transitions

```
DISCONNECTED → CONNECTING → CONNECTED → ATTACHED
     ↑             ↓           ↓           ↓
     └─────────────────────────────────────┘
```

**Commands for state transitions:**
```
Connect: (Serial port open)
Scan: qRcmd,73776470735f7363616e
Attach: vAttach;1                  // Attach to target 1
Detach: D
```

### 5. Power Control

```
Enable:  qRcmd,74707772_656e61626c65    // "tpwr enable"
Disable: qRcmd,74707772_64697361626c65  // "tpwr disable"
```

### 6. Special Monitor Commands

```
help:        qRcmd,68656c70
reset:       qRcmd,7265736574
hard_reset:  qRcmd,686172645f7265736574
```

### 7. Error Responses

```
OK          - Command successful
E01         - General error
E02         - Bad address
E03         - Bad length
(empty)     - Command not supported
```

## Packet Structure Details

### Standard Packet Format
```
$<data>#<checksum>

Example: $qSupported#37
```

### Checksum Calculation
```javascript
function calculateChecksum(data) {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data.charCodeAt(i);
  }
  return (sum & 0xFF).toString(16).padStart(2, '0');
}
```

### ACK/NAK Protocol
```
→ $command#cs
← +              // ACK
← $response#cs
→ +              // ACK
```

## Common Target Descriptions

### STM32 Family
```
STM32F0xx - Cortex-M0 - Flash @ 0x08000000
STM32F1xx - Cortex-M3 - Flash @ 0x08000000
STM32F2xx - Cortex-M3 - Flash @ 0x08000000
STM32F3xx - Cortex-M4 - Flash @ 0x08000000
STM32F4xx - Cortex-M4 - Flash @ 0x08000000
STM32F7xx - Cortex-M7 - Flash @ 0x08000000
STM32H7xx - Cortex-M7 - Flash @ 0x08000000
STM32L0xx - Cortex-M0+ - Flash @ 0x08000000
STM32L1xx - Cortex-M3 - Flash @ 0x08000000
STM32L4xx - Cortex-M4 - Flash @ 0x08000000
STM32G0xx - Cortex-M0+ - Flash @ 0x08000000
STM32G4xx - Cortex-M4 - Flash @ 0x08000000
```

### Nordic nRF Series
```
nRF51xxx - Cortex-M0 - Flash @ 0x00000000
nRF52xxx - Cortex-M4 - Flash @ 0x00000000
```

### Microchip SAM Series
```
SAMD21 - Cortex-M0+ - Flash @ 0x00000000
SAMD51 - Cortex-M4 - Flash @ 0x00000000
SAME5x - Cortex-M4 - Flash @ 0x00000000
```

## Implementation Notes

### When No Target is Connected

If only the probe is connected (no target):
1. Version command will work
2. Scan commands return empty target list with 0V or no voltage
3. Memory/register commands will fail with E01
4. Attach commands will fail

### Voltage Detection

- Voltage > 1.8V: Target likely powered
- Voltage < 1.8V: Target unpowered or brown-out
- Voltage = 0V: No target connected

### Feature Detection Strategy

1. Try `qSupported` for standard features
2. Try `monitor help` for BMP-specific features
3. Probe individual monitor commands
4. Cache results for performance

## Example Communication Flow

```
// 1. Connect and query features
→ $qSupported#37
← +$PacketSize=400;qXfer:memory-map:read+#cs

// 2. Get version
→ $qRcmd,76657273696f6e#cs
← +$O426c61636b204d61676963...#cs

// 3. Scan for targets
→ $qRcmd,73776470735f7363616e#cs
← +$O5461726765742076...#cs

// 4. Attach to target
→ $vAttach;1#cs
← +$T05#cs

// 5. Read chip ID
→ $mE0042000,4#cs
← +$10164413#cs
```

## Troubleshooting

### Common Issues

1. **No response to scan**
   - Check target voltage
   - Verify debug interface (SWD vs JTAG)
   - Check connection polarity

2. **Attach fails**
   - Target may be in sleep/reset
   - Try `monitor reset` first
   - Check for held reset line

3. **Memory read fails**
   - Not attached to target
   - Invalid memory region
   - Target in fault state

### Debug Tips

1. Enable debug logging in GdbClient
2. Monitor raw packet exchange
3. Check voltage before operations
4. Try both SWD and JTAG scans
5. Use `monitor help` to verify commands