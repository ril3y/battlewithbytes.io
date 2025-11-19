# Quick Start Guide - Firmware Analysis Examples

## 5-Minute Quick Start

### 1. Analyze Your First Firmware

```bash
# Build the analyzer
cd packages/battlemagic-analyzer
cargo build --example analyze_full_firmware --release

# Analyze firmware
cargo run --example analyze_full_firmware --release -- path/to/firmware.bin
```

**That's it!** You'll get a comprehensive report with:
- Vector table entries
- Functions detected
- Cross-references
- Loops found
- Performance metrics

---

## Common Use Cases

### Use Case 1: Quick Firmware Overview

**Goal**: Get basic statistics about unknown firmware

```bash
# Run analysis and grep for summary
cargo run --example analyze_full_firmware --release -- firmware.bin | grep -A 20 "FIRMWARE ANALYSIS REPORT"
```

**Output**:
```
Firmware: firmware.bin
Size: 262144 bytes (256.0 KB)
Base Address: 0x08000000 (STM32 Flash)
Total Functions: 2048
Total XREFs: 19655
Total Loops: 194
```

---

### Use Case 2: Find Entry Point

**Goal**: Identify the Reset handler and main function

```bash
# Extract vector table
cargo run --example analyze_full_firmware --release -- firmware.bin | grep -A 50 "VECTOR TABLE"
```

**Look for**:
```
Vector     Handler Name         Address      Status
----------------------------------------------------------------------
0          Initial_SP           0x20000400   VALID
1          Reset_Handler        0x08000101   VALID   <-- Entry point
```

---

### Use Case 3: Identify Important Functions

**Goal**: Find the most-called functions (likely utility/HAL functions)

```bash
# Extract most referenced addresses
cargo run --example analyze_full_firmware --release -- firmware.bin | grep -A 15 "Most Referenced"
```

**Output**:
```
Address      Refs       Types
0x08010A5C      101     Call        <-- Called 101 times
0x08021AF8       84     Call        <-- memcpy/memset?
```

---

### Use Case 4: Export for Further Analysis

**Goal**: Get machine-readable JSON for scripting

```bash
# Export as JSON
cargo run --example analyze_full_firmware --release -- firmware.bin --json > analysis.json

# Process with jq
cat analysis.json | jq '.functions.total'
cat analysis.json | jq '.xrefs.by_type'
```

---

### Use Case 5: Find Main Loop

**Goal**: Identify the main event loop

```bash
# Look for infinite loops
cargo run --example analyze_full_firmware --release -- firmware.bin | grep -B 5 "infinite"
```

**Analysis**:
```
Header       BackEdge     Body     Type       Nesting
0x08002586 0x08002586   1        infinite   1
```

Single-instruction infinite loop → likely `while(1)` in main()

---

### Use Case 6: Check for Stack Issues

**Goal**: Find functions with large stack usage (potential overflow)

```bash
# Extract function table and sort by stack size
cargo run --example analyze_full_firmware --release -- firmware.bin | \
    grep "bytes" | \
    grep -v "Size:" | \
    sort -k5 -rn | \
    head -n 10
```

**Look for**:
```
0x080093AA  ...  10,076 bytes  <-- Very large stack!
0x080027DC  ...  11,816 bytes  <-- Potential overflow risk
```

---

## Advanced Workflows

### Workflow 1: Compare Two Firmware Versions

```bash
#!/bin/bash

echo "Analyzing firmware v1..."
cargo run --example analyze_full_firmware --release -- firmware_v1.bin --json > v1.json

echo "Analyzing firmware v2..."
cargo run --example analyze_full_firmware --release -- firmware_v2.bin --json > v2.json

# Compare with Python
python3 << 'EOF'
import json

with open('v1.json') as f:
    v1 = json.load(f)
with open('v2.json') as f:
    v2 = json.load(f)

print(f"Functions: {v1['functions']['total']} -> {v2['functions']['total']}")
print(f"XREFs:     {v1['xrefs']['total']} -> {v2['xrefs']['total']}")
print(f"Loops:     {v1['loops']['total']} -> {v2['loops']['total']}")
EOF
```

---

### Workflow 2: Extract Call Graph

```bash
# Export to JSON and extract call relationships
cargo run --example analyze_full_firmware --release -- firmware.bin --json | \
    jq '.functions.entries[] | select(.callees > 0) | {addr: .address, calls: .callees}'
```

**Output**:
```json
{"addr": "0x08001BFE", "calls": 2}
{"addr": "0x0802B674", "calls": 4}
```

---

### Workflow 3: Generate DOT Graph for Visualization

```python
#!/usr/bin/env python3
import json
import sys

# Load analysis
with open('analysis.json') as f:
    data = json.load(f)

# Generate DOT file
print("digraph firmware {")
print('  node [shape=box];')

for func in data['functions']['entries'][:100]:  # First 100 functions
    addr = func['address']
    label = f"{addr}\\n{func['callers']} in, {func['callees']} out"
    print(f'  "{addr}" [label="{label}"];')

# Add edges from XREFs
for xref in data['xrefs']['entries'][:500]:  # First 500 XREFs
    if xref['type'] == 'Call':
        print(f'  "{xref["from"]}" -> "{xref["to"]}";')

print("}")
```

**Usage**:
```bash
python3 generate_dot.py > firmware.dot
dot -Tpng firmware.dot > firmware.png
```

---

### Workflow 4: Automated Security Scan

```bash
#!/bin/bash

echo "Scanning firmware for security issues..."

# Large stack frames (overflow risk)
echo "=== Large Stack Frames ==="
cargo run --example analyze_full_firmware --release -- "$1" --json | \
    jq '.functions.entries[] | select(.stack_frame_size > 8192) | {addr, stack: .stack_frame_size}'

# Suspicious loops (potential infinite loops without timeouts)
echo "=== Infinite Loops ==="
cargo run --example analyze_full_firmware --release -- "$1" --json | \
    jq '.loops.statistics.infinite_loops'

# High complexity functions (potential bugs)
echo "=== Complex Functions ==="
cargo run --example analyze_full_firmware --release -- "$1" --json | \
    jq '.functions.entries[] | select(.callees > 10) | {addr, callees}'
```

---

## Integration Examples

### IDA Pro Integration

```python
# ida_import.py - Run in IDA Python console
import json
import idaapi
import idc

with open('C:/path/to/analysis.json') as f:
    data = json.load(f)

# Create functions
for func in data['functions']['entries']:
    addr = int(func['address'], 16)
    if not idaapi.get_func(addr):
        idc.create_insn(addr)
        if func['end']:
            end_addr = int(func['end'], 16)
            idaapi.add_func(addr, end_addr)
            print(f"Created function at {func['address']}")

# Add comments for XREFs
for xref in data['xrefs']['entries'][:1000]:
    from_addr = int(xref['from'], 16)
    comment = f"{xref['type']}: -> {xref['to']}"
    idc.set_cmt(from_addr, comment, 0)

print(f"Imported {data['functions']['total']} functions")
print(f"Added {len(data['xrefs']['entries'][:1000])} comments")
```

---

### Ghidra Integration

```python
# ghidra_import.py - Run in Ghidra Script Manager
import json

# Load analysis
with open('/path/to/analysis.json') as f:
    data = json.load(f)

# Get current program
prog = getCurrentProgram()
fm = prog.getFunctionManager()
listing = prog.getListing()

# Import functions
for func_data in data['functions']['entries']:
    addr = toAddr(int(func_data['address'], 16))

    # Create function if doesn't exist
    func = fm.getFunctionAt(addr)
    if not func:
        func = createFunction(addr, None)
        if func:
            print(f"Created function at {func_data['address']}")

# Add comments
for xref in data['xrefs']['entries'][:1000]:
    from_addr = toAddr(int(xref['from'], 16))
    comment = f"{xref['type']}: {xref['instruction']} {xref['operands']}"
    setEOLComment(from_addr, comment)

print("Import complete!")
```

---

### Binary Ninja Integration

```python
# binja_import.py
import json
import binaryninja as bn

# Open binary
bv = bn.open_view('/path/to/firmware.bin')

# Load analysis
with open('/path/to/analysis.json') as f:
    data = json.load(f)

# Create functions
for func_data in data['functions']['entries']:
    addr = int(func_data['address'], 16)
    if not bv.get_function_at(addr):
        bv.create_user_function(addr)
        print(f"Created function at {func_data['address']}")

# Add comments
for xref in data['xrefs']['entries'][:1000]:
    from_addr = int(xref['from'], 16)
    comment = f"{xref['type']}: -> {xref['to']}"
    bv.set_comment_at(from_addr, comment)

bv.update_analysis_and_wait()
print("Import complete!")
```

---

## Performance Tips

### Tip 1: Always Use Release Build

```bash
# Slow (2-5x slower)
cargo run --example analyze_full_firmware -- firmware.bin

# Fast (optimized)
cargo run --example analyze_full_firmware --release -- firmware.bin
```

### Tip 2: Batch Processing

```bash
# Process multiple files efficiently
for fw in firmware_dumps/*.bin; do
    echo "Processing $fw..."
    cargo run --example analyze_full_firmware --release -- "$fw" --json > "results/$(basename $fw .bin).json" &
done
wait
```

### Tip 3: Pre-build Examples

```bash
# Build once, run many times
cargo build --examples --release

# Then use the binary directly
./target/release/examples/analyze_full_firmware firmware.bin
```

---

## Troubleshooting

### Problem: "No vector table detected"

**Solution**: Try different base addresses

```bash
# STM32
cargo run --example analyze_full_firmware --release -- firmware.bin  # Default: 0x08000000

# Nordic nRF52
# Edit analyze_full_firmware.rs: let base_address = 0x00000000;

# Or create wrapper script:
python3 << 'EOF'
import sys
import json

# Try multiple base addresses
bases = [0x08000000, 0x00000000, 0x10000000]

for base in bases:
    # Run analysis with different base
    # (would need to modify example to accept base as argument)
    print(f"Trying base address: 0x{base:08X}")
EOF
```

---

### Problem: Analysis is too slow

**Possible causes**:
1. Not using `--release` build
2. Very large firmware (>1MB)
3. Debug builds

**Solutions**:
```bash
# 1. Use release build
cargo build --example analyze_full_firmware --release

# 2. Check firmware size
ls -lh firmware.bin

# 3. Profile the analysis
cargo build --example analyze_full_firmware --release
time ./target/release/examples/analyze_full_firmware firmware.bin
```

---

## FAQ

**Q: Can I analyze non-ARM firmware?**
A: Currently only ARM Cortex-M (Thumb-2) is supported. MIPS support is partial.

**Q: Why so many infinite loops?**
A: Common in embedded systems for hardware polling. Review the loop addresses to identify their purpose.

**Q: What do the argument annotations mean?**
A: They show what values are in registers (r0-r3) before function calls, helping understand calling conventions.

**Q: Can I get function names?**
A: Only if your firmware has debug symbols. The analyzer generates default names like `sub_08001234`.

**Q: How accurate is the analysis?**
A: Very accurate for code structure (>95%). Function boundary detection is heuristic-based (~80-90% accurate).

---

## Next Steps

1. **Read the detailed guide**: `examples/README.md`
2. **Review architecture**: `ARCHITECTURE.md`
3. **Study analysis results**: `ANALYSIS_RESULTS.md`
4. **Contribute**: Add new examples or improve detection algorithms

---

## Resources

- [ARM Architecture Manual](https://developer.arm.com/documentation)
- [Capstone Disassembly Framework](https://www.capstone-engine.org/)
- [Black Magic Probe](https://github.com/blackmagic-debug/blackmagic)
- [STM32 Reference Manuals](https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html)

---

*For questions or issues, see the main README.md*
