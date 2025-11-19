# BattleMagic Analyzer Examples

This directory contains example programs demonstrating the BattleMagic analyzer's capabilities.

## Examples Overview

### 1. `analyze_full_firmware.rs` - Complete Firmware Analysis

**Purpose**: Comprehensive demonstration of all analyzer features using real firmware dumps.

**Features Demonstrated**:
- ARM Cortex-M vector table extraction
- Function detection with calling convention analysis
- Control Flow Graph (CFG) analysis
- Loop detection and classification
- Cross-reference tracking (calls, branches, data accesses)
- Performance metrics and memory usage reporting
- JSON export for programmatic processing

**Usage**:

```bash
# Build the example
cargo build --example analyze_full_firmware --release

# Run with human-readable output
cargo run --example analyze_full_firmware --release -- path/to/firmware.bin

# Export as JSON for further processing
cargo run --example analyze_full_firmware --release -- path/to/firmware.bin --json > results.json
```

**Example with Actual Firmware**:

```bash
# Analyze the included firmware dump
cargo run --example analyze_full_firmware --release -- ../../firmware_Unknown_1763317348910.bin
```

**Output Format**:

The detailed output includes:

1. **Vector Table Analysis**
   - ARM Cortex-M interrupt vector table
   - Initial stack pointer validation
   - Valid handler addresses
   - Standard ARM handler names (Reset, NMI, HardFault, etc.)

2. **Function Detection**
   - Function entry points
   - Function boundaries (start/end addresses)
   - Caller/callee relationships
   - Stack frame sizes
   - Calling convention argument annotations

3. **Cross-Reference Analysis**
   - Total XREFs found
   - Breakdown by type (Call, Branch, Conditional, Data Read/Write)
   - Most frequently referenced addresses
   - Call graphs

4. **Loop Detection**
   - Loop headers and back-edges
   - Loop body sizes
   - Loop types (while, do-while, for, infinite)
   - Nesting depth analysis

5. **Performance Metrics**
   - Analysis time
   - Throughput (instructions/sec, bytes/sec)
   - Memory usage by component

**Sample Output**:

```
======================================================================
           FIRMWARE ANALYSIS REPORT
======================================================================
Firmware: firmware_Unknown_1763317348910.bin
Size: 262144 bytes (256.0 KB)
Base Address: 0x08000000 (STM32 Flash)

======================================================================
           VECTOR TABLE
======================================================================
Vector     Handler Name         Address      Status
----------------------------------------------------------------------
0          Initial_SP           0x20000400   VALID
1          Reset_Handler        0x08000101   VALID
2          NMI_Handler          0x08000234   VALID

Total Valid Vectors: 45 / 256

======================================================================
           FUNCTIONS DETECTED
======================================================================
Total Functions: 2048

Address      End          Callers  Calls    Stack      Args
----------------------------------------------------------------------
0x08015554 Unknown      1        0        6896 bytes 2887 annot
    -> 0x080155D0 with args: r0=0x0, r1=0xd
    -> 0x080155F8 with args: r0=r13
    -> 0x08015652 with args: r0=[mem], r1=0xd

======================================================================
           CROSS-REFERENCES
======================================================================
Total XREFs: 19655
Unique Targets: 11309

By Type:
  Call:              5141
  Unconditional:     4563
  Conditional:       5525
  Data Read:         4426
  Data Write:           0

Most Referenced Addresses:
----------------------------------------------------------------------
Address      Refs       Types
0x08010A5C      101     Call
0x08021AF8       84     Call

======================================================================
           LOOPS DETECTED
======================================================================
Total Loops: 194

Header       BackEdge     Body     Type       Nesting
----------------------------------------------------------------------
0x08002586 0x08002586   1        infinite   1

Loop Statistics:
  While loops:    0
  Do-While loops: 2
  For loops:      0
  Infinite loops: 192
  Max nesting:    1
  Avg body size:  1.0 instructions

======================================================================
           PERFORMANCE METRICS
======================================================================
Total Instructions: 99272
Analysis Time:      65355.52 ms
Throughput:         1,518 instructions/sec
                    4,011 bytes/sec (3.9 KB/sec)
```

**JSON Export Format**:

When using `--json` flag, the output is structured JSON:

```json
{
  "firmware": {
    "path": "firmware.bin",
    "size": 262144,
    "base_address": 134217728
  },
  "analysis": {
    "total_instructions": 99272,
    "analysis_time_ms": 60378,
    "start_address": 134217728,
    "end_address": 134479870
  },
  "vector_table": [
    {
      "vector_number": 0,
      "handler_name": "Initial_SP",
      "handler_address": "0x20000400",
      "is_valid": true
    }
  ],
  "xrefs": {
    "total": 19655,
    "unique_targets": 11309,
    "by_type": {
      "call": 5141,
      "branch": 4563,
      "conditional": 5525,
      "data_read": 4426,
      "data_write": 0
    }
  },
  "functions": {
    "total": 2048,
    "entries": [...]
  },
  "loops": {
    "total": 194,
    "statistics": {...},
    "entries": [...]
  }
}
```

---

### 2. `chip_detection.rs` - Chip Database Demonstration

**Purpose**: Demonstrates the chip detection and database API.

**Features**:
- Fuzzy chip name matching
- Architecture detection
- Manufacturer identification
- Confidence scoring

**Usage**:

```bash
cargo run --example chip_detection
```

---

### 3. `analysis_example.rs` - Analysis Module API

**Purpose**: Shows high-level analysis API usage.

**Features**:
- Function boundary detection
- Stack usage analysis
- Calling convention detection

**Usage**:

```bash
cargo run --example analysis_example
```

---

### 4. `analyze_firmware.rs` - Performance Testing

**Purpose**: Benchmarks analyzer performance on real firmware.

**Features**:
- Performance metrics
- Large binary handling
- CFG optimization validation

**Usage**:

```bash
cargo run --example analyze_firmware --release
```

---

## Working with Firmware Dumps

### Obtaining Firmware from Black Magic Probe

```bash
# Connect to Black Magic Probe
arm-none-eabi-gdb

# In GDB:
(gdb) target extended-remote /dev/ttyACM0
(gdb) monitor swdp_scan
(gdb) attach 1
(gdb) dump binary memory firmware.bin 0x08000000 0x08040000
```

### STM32 Flash Memory Layout

```
0x08000000 - Vector Table (0x100 bytes)
0x08000100 - Reset Handler / Application Code
0x080XXXXX - Application Code (varies by chip)
```

### Typical Base Addresses

- **STM32**: `0x08000000` (Flash)
- **Nordic nRF52**: `0x00000000` (Flash)
- **SAMD21**: `0x00000000` (Flash)
- **LPC**: `0x00000000` (Flash)

---

## Advanced Usage

### Batch Processing Multiple Firmware Files

```bash
#!/bin/bash
for firmware in firmware_dumps/*.bin; do
    echo "Analyzing $firmware..."
    cargo run --example analyze_full_firmware --release -- "$firmware" --json > "results/$(basename $firmware .bin).json"
done
```

### Comparing Analysis Results

```python
import json
import sys

# Load two analysis results
with open('firmware1.json') as f:
    fw1 = json.load(f)
with open('firmware2.json') as f:
    fw2 = json.load(f)

# Compare function counts
print(f"Firmware 1: {fw1['functions']['total']} functions")
print(f"Firmware 2: {fw2['functions']['total']} functions")

# Find common functions
addrs1 = {f['address'] for f in fw1['functions']['entries']}
addrs2 = {f['address'] for f in fw2['functions']['entries']}
common = addrs1 & addrs2
print(f"Common functions: {len(common)}")
```

### Integration with IDA/Ghidra

The JSON output can be imported into disassemblers:

```python
# IDA Python script
import json
import idaapi

with open('analysis.json') as f:
    data = json.load(f)

# Create functions
for func in data['functions']['entries']:
    addr = int(func['address'], 16)
    if func['end']:
        end = int(func['end'], 16)
        idaapi.add_func(addr, end)
    else:
        idaapi.add_func(addr)

# Add comments for XREFs
for xref in data['xrefs']['entries']:
    from_addr = int(xref['from'], 16)
    to_addr = int(xref['to'], 16)
    comment = f"{xref['type']}: {xref['instruction']} {xref['operands']}"
    idc.set_cmt(from_addr, comment, 0)
```

---

## Performance Considerations

### Memory Usage

The analyzer is optimized for embedded firmware analysis:

- **XREFs**: ~64 bytes per entry
- **Functions**: ~200 bytes per entry (approximate)
- **Loops**: ~80 bytes per entry

For a typical 256KB firmware:
- ~20,000 XREFs = ~1.2 MB
- ~2,000 functions = ~400 KB
- ~200 loops = ~16 KB
- **Total**: ~2 MB RAM

### Speed Optimization

For best performance:
1. Always use `--release` builds
2. Run on SSD (improves file I/O)
3. Consider increasing thread priority for real-time analysis

---

## Troubleshooting

### "No vector table detected"

This can occur when:
- Firmware is not ARM Cortex-M
- Base address is incorrect
- Firmware is encrypted/compressed
- File is not a raw binary dump

**Solution**: Try different base addresses or verify the firmware format.

### "Analysis is slow"

- Ensure you're using `--release` build
- Check if firmware is very large (>1MB)
- Consider using progress callbacks in your own code

### "Invalid function boundaries"

This happens with heavily optimized code or hand-written assembly. The analyzer uses heuristics that work best with compiler-generated code.

---

## Contributing

To add a new example:

1. Create `examples/your_example.rs`
2. Add to `Cargo.toml`:
   ```toml
   [[example]]
   name = "your_example"
   path = "examples/your_example.rs"
   ```
3. Update this README
4. Test with `cargo run --example your_example`

---

## References

- [ARM Architecture Reference Manual](https://developer.arm.com/documentation)
- [Capstone Disassembly Framework](https://www.capstone-engine.org/)
- [Black Magic Probe Documentation](https://github.com/blackmagic-debug/blackmagic)
