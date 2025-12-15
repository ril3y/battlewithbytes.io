# ARM Cortex-M Reset Debugging with GDB and Black Magic Probe

Complete guide for catching an ARM Cortex-M microcontroller at its earliest execution point using GDB and Black Magic Probe (BMP).

---

## Table of Contents

1. [ARM Cortex-M Reset Sequence](#arm-cortex-m-reset-sequence)
2. [Vector Table Fundamentals](#vector-table-fundamentals)
3. [Setup and Connection](#setup-and-connection)
4. [Breaking at Reset Handler](#breaking-at-reset-handler)
5. [Advanced Techniques](#advanced-techniques)
6. [Troubleshooting](#troubleshooting)
7. [Example Workflow](#example-workflow)

---

## ARM Cortex-M Reset Sequence

Understanding how the processor initializes is critical for early debugging.

### The Reset Process

When an ARM Cortex-M microcontroller exits reset:

1. **Vector Table Read** (address 0x00000000 in Flash)
   - CPU reads 32-bit value at offset 0x00 → Initial Stack Pointer (SP)
   - CPU reads 32-bit value at offset 0x04 → Reset Handler address

2. **SP Initialization**
   - Stack pointer (r13/sp) is loaded from vector table entry 0
   - Typically points to end of SRAM (e.g., 0x20010000 for STM32L152)

3. **PC Jump to Reset Handler**
   - Program counter jumps to address stored at vector table offset 0x04
   - CPU begins executing reset handler code
   - Still in Thread Mode with privileged access

4. **Execution Begins**
   - Reset handler typically calls system initialization
   - Then calls main() function
   - Interrupts not yet enabled

### Key Points

- **No bootloader can run before reset handler** (by definition)
- **Reset handler is your earliest executable breakpoint**
- All hardware is in default state at this point
- External clock source may not be active yet

---

## Vector Table Fundamentals

The vector table is an array of 32-bit handler addresses starting at address 0x00000000.

### Standard ARM Cortex-M Vector Layout

```
Offset  Size  Name                    Vector #
──────────────────────────────────────────────
0x00    4     Initial_SP              (N/A)
0x04    4     Reset_Handler           1
0x08    4     NMI_Handler             2
0x0C    4     HardFault_Handler       3
0x10    4     MemManage_Handler       4
0x14    4     BusFault_Handler        5
0x18    4     UsageFault_Handler      6
0x1C-34 (7)   Reserved
0x38    4     SVC_Handler             11
0x3C    4     DebugMon_Handler        12
0x40    (1)   Reserved
0x44    4     PendSV_Handler          14
0x48    4     SysTick_Handler         15
0x4C+   4*n   External IRQ handlers   16+
```

### Important Notes

- All handler addresses must have **Thumb-mode bit set** (LSB = 1)
  - Example: `0x08001205` not `0x08001204`
- Invalid entries typically point to NULL or loop-to-self handlers
- BattleMagic analyzes the vector table to identify valid handlers

### Detecting the Reset Handler Address

The reset handler address is always at vector table offset 0x04:

```c
// In firmware binary at load address (e.g., 0x08000000):
uint32_t reset_handler_addr = *(uint32_t *)(flash_base + 0x04);
// For STM32: reset_handler_addr is at flash_base + 0x04
```

---

## Setup and Connection

### Hardware Requirements

- **Black Magic Probe** (BMP) or compatible JTAG/SWD debugger
- **Target ARM Cortex-M MCU** with JTAG/SWD interface
- **USB cable** from host to Black Magic Probe
- **SWD/JTAG cable** from BMP to target (typically 4-10 pins)

### SWD Pinout (Most Common)

Standard SWD uses 4 pins minimum:

```
Pin Name    Signal         BMP Pin
──────────────────────────────────
1           VREF (3.3V)    Power reference
2           SWDIO          TMS equivalent
3           SWDCLK         TCO equivalent
4           GND            Ground
```

Some targets also expose:

- RESET pin (for hardware reset)
- NRST pin (active-low reset)

### Software Requirements

- **GDB** (GNU Debugger) - arm-none-eabi-gdb recommended
- **GDB scripts** for Black Magic Probe integration
- **BattleMagic** (this tool) for vector table analysis
- **Firmware binary** in ELF or BIN format

### Installation Example (Ubuntu/Debian)

```bash
# Install arm toolchain
sudo apt-get install gcc-arm-none-eabi gdb-arm-none-eabi

# Verify installation
arm-none-eabi-gdb --version

# Identify Black Magic Probe device
ls -la /dev/ttyBMP*
# or
dmesg | grep "Black Magic"
```

### macOS Installation

```bash
# Install via Homebrew
brew tap ArmMbed/homebrew-formulae
brew install arm-none-eabi-gcc

# Use gdb
gdb-arm-none-eabi
```

---

## Breaking at Reset Handler

### Method 1: Manual Reset Handler Breakpoint (Recommended)

This is the most reliable method for catching execution at reset.

#### Step 1: Identify Reset Handler Address

Using BattleMagic UI:

1. Load firmware binary into BattleMagic
2. Navigate to **Vector Table** panel
3. Find **Vector #1 (Reset_Handler)**
4. Note the handler address (e.g., `0x08001234`)

Or extract from binary:

```bash
# Extract first 8 bytes (vector table entries 0-1)
xxd -l 8 firmware.bin

# Output example:
# 00000000: 2010 0120 3512 0008 .  .  5...
# SP = 0x20001020, Reset = 0x08001235 (note Thumb bit)

hexdump -C -N 8 firmware.bin

# Output example:
# 00000000  20 10 00 20 35 12 00 08  | .... 5...|
```

#### Step 2: Connect to Target

```bash
# Start GDB
arm-none-eabi-gdb

# In GDB console
target remote /dev/ttyBMP0
# or for network
target extended-remote localhost:2331
```

Expected output:

```
Remote debugging using /dev/ttyBMP0
(response depends on probe type)
```

#### Step 3: Set Breakpoint at Reset Handler

```gdb
# Set breakpoint at reset handler address
# Replace 0xADDRESS with actual reset handler address from vector table
break *0x08001234

# Verify breakpoint is set
info break
# Output:
# Num Type           Disp Enb Address    What
# 1   breakpoint     keep y   0x08001234 <Reset_Handler>
```

#### Step 4: Reset and Run to Breakpoint

```gdb
# Option A: Hardware reset via Black Magic Probe
monitor reset
continue
# or simply
monitor reset halt
```

Expected behavior:

- Processor resets
- Stops at reset handler breakpoint
- You can now examine registers and memory

### Examining Registers at Reset

```gdb
# Show all registers
info registers

# Expected output at reset:
# r0             0x0                 0
# r1             0x0                 0
# ...
# sp             0x20001020          0x20001020  (from vector table[0])
# lr             0xffffffff          -1
# pc             0x08001234          0x08001234  (reset handler address)
# cpsr           0x61000013          1627389971
#  ...M Mode PSR...
```

### Stepping Through Reset Handler

```gdb
# Step one instruction
stepi
# or
si

# Step to next line of C code
step
# or
s

# Continue to next breakpoint
continue
# or
c

# Run to address
advance *0x08002000

# Show source code (if ELF debug symbols available)
list
```

---

## Method 2: Using GDB Init Script

Create a `.gdbinit` file to automate the process:

```gdb
# .gdbinit - Black Magic Probe + Reset debugging

# Serial port for Black Magic Probe
set serial timeout 30

# Connect to BMP
target extended-remote /dev/ttyBMP0

# Load firmware (optional)
# file firmware.elf
# load

# Set reset handler breakpoint
# IMPORTANT: Replace with your actual reset handler address
break *0x08001234

# Optional: Set other strategic breakpoints
# break main
# break SystemInit

# Display registers
define hook-stop
  info registers
  x/i $pc
end

# Convenience commands
define reset-and-debug
  monitor reset
  continue
end

define soft-reset
  monitor reset
end

define show-vector-table
  x/8x 0x08000000
  printf "SP    = 0x%08x\n", *(uint32_t*)0x08000000
  printf "Reset = 0x%08x\n", *(uint32_t*)0x08000004
  printf "NMI   = 0x%08x\n", *(uint32_t*)0x08000008
  printf "HFault= 0x%08x\n", *(uint32_t*)0x0800000c
end

# Command: Reset and halt at reset handler
reset-and-debug
```

Then run:

```bash
arm-none-eabi-gdb -x .gdbinit firmware.elf
```

---

## Method 3: Using Catch Signal for Hardware Reset

This catches the reset signal in some GDB implementations:

```gdb
# Note: Not all Black Magic Probe configurations support this

# Catch exceptions
catch signal SIGRESET

# This may not work with all BMP firmware versions
# Use manual breakpoint method instead
```

---

## Advanced Techniques

### Conditional Breakpoints at Reset

Break only on specific conditions:

```gdb
# Break if r0 has specific value
break *0x08001234 if $r0 == 0x12345678

# Break if PC reaches certain address from specific caller
# (requires more complex conditional expressions)
```

### Using Watchpoints with Reset

Monitor memory changes during reset initialization:

```gdb
# Set watchpoint on stack pointer initialization
watch $sp
# Will break when sp is modified

# Set watchpoint on specific SRAM location
watch *(uint32_t*)0x20000000
# Break when this address is written

# Conditional watchpoint
watch *(uint32_t*)0x20000000 if *(uint32_t*)0x20000000 > 0x1000
```

### Breakpoint at First C Code Execution

If firmware has debug symbols (ELF):

```gdb
# Find main function
info functions main

# Set breakpoint at main (if symbols available)
break main

# Step to reset handler manually, then continue
continue
```

### Multicore MCUs

For MCUs with multiple cores (e.g., STM32H7, ESP32):

```gdb
# List all threads/cores
info threads

# Select specific core
thread 1
# or
thread 2

# Set breakpoint on specific core
break -p 1 *0x08001234
# Breakpoint on processor 1 only
```

### Non-Invasive Tracing (Advanced)

Use Serial Wire Output (SWO) for real-time execution tracing:

```gdb
# Enable SWO tracing (requires STM32CubeProgrammer or similar)
monitor swo 168000000 0

# View trace output
monitor traces

# Stop tracing
monitor notrace
```

---

## Troubleshooting

### Problem: Cannot Connect to Target

**Symptoms:**

```
Remote communication error.  Target disconnected.: No error.
```

**Solutions:**

1. Verify USB connection: `lsusb | grep -i "Black Magic"`
2. Check device permissions: `ls -la /dev/ttyBMP*`
3. Grant permissions: `sudo chmod 666 /dev/ttyBMP0`
4. Try different USB port
5. Restart GDB and probe

### Problem: Breakpoint Not Set or Not Hit

**Symptoms:**

```
Breakpoint 1 at 0x08001234
(but continue runs to end without stopping)
```

**Solutions:**

1. Verify reset handler address is correct
2. Check if address has Thumb bit set (LSB = 1)
3. Use `monitor reset halt` instead of just `monitor reset`
4. Verify flash memory contains expected code
5. Try setting breakpoint at next instruction: `break *0x08001238`

### Problem: Cannot Read Vector Table

**Symptoms:**

```
Cannot access memory at address 0x0
```

**Solutions:**

1. Verify target is connected: `monitor version`
2. Try reading different address: `x/1x 0x08000000`
3. Target may not have SWD/JTAG properly configured
4. Check SWD pinout matches target datasheet

### Problem: GDB Shows Garbage Values at Reset

**Symptoms:**

```
pc             0xffffffff          -1
sp             0xffffffff          -1
```

**Explanation:**

- May indicate breakpoint hit before CPU fully initialized
- Try stepping forward: `stepi`
- Or continue: `continue`

### Problem: "monitor reset" Not Recognized

**Symptoms:**

```
Undefined monitor command: "reset"
```

**Solutions:**

1. Verify Black Magic Probe is fully connected
2. Update BMP firmware
3. Try: `monitor hard_reset`
4. Check BMP documentation for supported commands
5. Some probes use different reset syntax

### Problem: Multiple Breakpoints Interfering

**If reset handler itself has internal jumps:**

```gdb
# Disable unnecessary breakpoints
disable 2
# or
delete 2

# List breakpoints
info break

# Enable/disable specific breakpoints
enable 1
disable 1
```

### Problem: Cannot Access Source Code at Reset

**If firmware doesn't have debug symbols:**

1. Recompile with `-g` flag:

   ```bash
   arm-none-eabi-gcc -g -o firmware.elf *.c
   ```

2. Or use disassembly instead:
   ```gdb
   disassemble 0x08001234
   x/20i 0x08001234
   ```

### Problem: SWD/JTAG Pin Configuration Mismatch

**Symptoms:**

- Cannot detect target
- Sporadic connection drops
- Read errors on memory access

**Check target pinout:**

```bash
# Examine datasheet for SWD pinout
# Common pattern:
# Pin 1 (SWDIO)  -> Target SWD_DIO
# Pin 2 (SWDCLK) -> Target SWD_CLK
# Pin 3 (GND)    -> Target GND
# Pin 4 (VREF)   -> Target VREF or 3.3V
```

---

## Example Workflow

### Complete Reset Debugging Session

```bash
# Step 1: Analyze firmware with BattleMagic
# (Use UI to load firmware and find reset handler address)
# Result: Reset handler at 0x08001235

# Step 2: Create GDB init script
cat > .gdbinit << 'EOF'
set serial timeout 30
target extended-remote /dev/ttyBMP0
break *0x08001235
define reset-and-debug
  monitor reset
  continue
end
EOF

# Step 3: Start GDB session
arm-none-eabi-gdb firmware.elf

# Step 4: In GDB
# (gdb) reset-and-debug
# Breakpoint 1, 0x08001235 in Reset_Handler ()

# Step 5: Examine state
# (gdb) info registers
# r0             0x0                 0
# r1             0x0                 0
# ...
# sp             0x20001020          0x20001020
# pc             0x08001235          0x08001235

# Step 6: Examine memory
# (gdb) x/8x 0x08000000
# 0x08000000: 0x20001020  0x08001235  0xffffffe9  0xffffffff

# Step 7: Step through reset handler
# (gdb) stepi
# (gdb) stepi
# (gdb) stepi

# Step 8: Read registers after steps
# (gdb) info registers r0 r1 r2
# r0             0x0                 0
# r1             0x0                 0
# r2             0x0                 0

# Step 9: Continue to main or next breakpoint
# (gdb) continue

# Step 10: Exit GDB
# (gdb) quit
```

### BattleMagic Integration

1. **Load Firmware**:
   - Drag firmware into BattleMagic
   - Wait for analysis to complete

2. **Check Vector Table**:
   - Click "Vector Table" panel
   - Note Reset_Handler address (Vector #1)
   - Verify it's not 0x00000000 or 0xFFFFFFFF

3. **Use in GDB**:
   - Copy address from BattleMagic
   - Paste into GDB breakpoint command
   - Execute reset and debug

4. **Cross-Reference Analysis**:
   - Use BattleMagic to understand reset handler code
   - Set secondary breakpoints at function calls
   - Navigate call graph to understand initialization

---

## Reference: Common ARM Cortex-M MCUs

### STM32 Devices

**Flash address**: 0x08000000
**SRAM address**: 0x20000000

```gdb
# STM32L152 reset sequence
break *0x08001234    # Reset handler address (from vector table)
monitor reset halt
continue
```

### NRF52 (Nordic Semiconductor)

**Flash address**: 0x00000000
**SRAM address**: 0x20000000

```gdb
# Reset handler typically at 0x00000XXX
x/1x 0x00000004     # Read reset handler address
```

### SAMD21 (Atmel/Microchip)

**Flash address**: 0x00000000
**SRAM address**: 0x20000000

### LPC Devices (NXP)

**Flash address**: 0x00000000
**SRAM address**: 0x10000000

### MIMXRT1062 (NXP i.MX RT)

**Flash address**: 0x60000000
**SRAM address**: 0x20000000

---

## Best Practices

1. **Always verify reset handler address** - Use BattleMagic or hex dump
2. **Check Thumb-mode bit** - Address LSB must be 1 for Thumb mode
3. **Use hardware reset when possible** - More reliable than soft reset
4. **Enable debug output** - Set breakpoints before resetting
5. **Keep .gdbinit files** - Reuse across debugging sessions
6. **Verify SWD/JTAG connections** - Loose cables are common issues
7. **Check power supply** - Ensure target has stable 3.3V
8. **Use Black Magic Probe firmware updates** - Fixes many compatibility issues

---

## See Also

- **GDB Documentation**: https://sourceware.org/gdb/documentation/
- **Black Magic Probe Wiki**: https://black-magic.org/
- **ARM Cortex-M Specification**: ARM Cortex-M4 TRM
- **BattleMagic API**: [API.md](./API.md)
- **BattleMagic Developer Guide**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
