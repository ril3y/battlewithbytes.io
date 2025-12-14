# Debug Control Toolbar - Usage Examples

## Quick Start

The Debug Control Toolbar is automatically integrated into the GdbPanel. No additional configuration needed.

### Basic Connection Flow

```typescript
// In BattleMagicMonitor component:
<GdbPanel
  gdbClient={gdbClient}
  output={gdbOutput}
  targets={targets}
  onAttachTarget={handleAttachTarget}
/>

// Toolbar automatically appears when:
// 1. GDB connected (buttons disabled)
// 2. Target attached (buttons enabled)
```

## Debugging Scenarios

### Scenario 1: Running to Breakpoint

1. **Setup**: Target is attached and halted

   ```
   Header: GDB | Connected | Attached | PC: 0x08001000
   Toolbar: ▶ Continue [enabled] ⏸ Pause [disabled] ...
   ```

2. **Action**: Press F5 or click Continue button

   ```
   Toolbar: ▶ Continue [disabled] ⏸ Pause [enabled] ...
   State: RUNNING (pulsing green indicator)
   ```

3. **Result**: Target runs until breakpoint
   ```
   Output: [Target stopped] Signal: 5
   Header: PC: 0x08001a2c
   Toolbar: ▶ Continue [enabled] ⏸ Pause [disabled] ...
   State: STOPPED
   ```

### Scenario 2: Single Stepping

1. **Setup**: Target paused at breakpoint
2. **Action**: Press F10 three times to step over instructions
   ```
   Step 1: Press F10
   Output: [stepping]
   Step 2: Press F10
   Header: PC: 0x08001004
   Step 3: Press F10
   Header: PC: 0x08001008
   ```
3. **Result**: Progressed through code one instruction at a time

### Scenario 3: Stepping Into Function

1. **Setup**: Target paused before function call
2. **Keyboard**:
   - F10 = Step Over (skips function)
   - F11 = Step Into (enters function)
3. **Workflow**:
   ```
   [Function call address]
   Press F11 → Enter function
   Header: PC: 0x08002000 (inside function)
   Press Shift+F11 → Exit function
   Header: PC: 0x08001010 (after function call)
   ```

### Scenario 4: Executing Custom Commands

While toolbar provides standard controls, you can still type GDB commands:

```
GDB Panel input: (gdb) info registers
Sends raw command to GDB
Displays in output

[Then use toolbar for standard operations]
```

## Keyboard Shortcuts Reference

### Primary Shortcuts

```
F5              → Continue/Run
F6              → Pause/Break
F10             → Step Over (next instruction)
F11             → Step Into (enter functions)
Shift+F11       → Step Out (exit function)
Ctrl+Shift+F5   → Restart execution
```

### Using Shortcuts

```typescript
// Example 1: Quick debugging session
1. F5          (start execution)
2. F6          (hit breakpoint or press to pause)
3. F10, F10    (step over two instructions)
4. F11         (step into function)
5. Shift+F11   (step out)
6. Ctrl+Shift+F5 (restart)
```

## UI States and Colors

### Connection States

**Disconnected**

```
GDB Panel appears but toolbar is hidden
Buttons would appear gray if visible
```

**Connected (not attached)**

```
GDB | Connected
Toolbar visible but buttons disabled
All buttons appear grayed out (opacity-50)
```

**Connected and Attached**

```
GDB | Connected | Attached
Toolbar fully functional
Buttons enabled/disabled based on execution state
```

### Execution States

**STOPPED (Gray border, disabled Continue)**

```
▶ Continue [enabled - green border]
⏸ Pause [disabled - gray, opacity-50]
⏩ Step Over [enabled]
⬇ Step Into [enabled]
⬆ Step Out [enabled]
State indicator: "STOPPED"
```

**RUNNING (Green border, disabled Step buttons)**

```
▶ Continue [disabled - opacity-50]
⏸ Pause [enabled - yellow border]
⏩ Step Over [disabled - opacity-50]
⬇ Step Into [disabled - opacity-50]
⬆ Step Out [disabled - opacity-50]
State indicator: "RUNNING" (pulsing animation)
```

## Button Tooltip Examples

### Continue Button Hover

```
┌─────────────────────────┐
│ Resume execution (F5)   │
│ F5                      │
└─────────────────────────┘
```

### Step Over Button Hover

```
┌──────────────────────────────────┐
│ Step over function calls (F10)   │
│ F10                              │
└──────────────────────────────────┘
```

## Practical Debugging Example

### Debugging a Firmware Issue

```
Goal: Find where hardfault is occurring
Target: STM32F4 with Black Magic Probe

Step 1: Connect
  - Select GDB port: /dev/ttyUSB0
  - Wait for "Connected" status

Step 2: Attach
  - Click "Scan SWD"
  - Select target (e.g., "0: STM32F407")
  - Status changes to "Attached"

Step 3: Load Firmware
  - (gdb) file firmware.elf
  - (gdb) load
  - Target resets and halts at entry

Step 4: Set Breakpoint (manual)
  - (gdb) break main
  - (gdb) break SystemInit

Step 5: Execute
  - Press F5 or click Continue
  - Target runs to main()
  - Header shows: PC: 0x08000100

Step 6: Step Through
  - Press F10 to step over functions
  - Press F11 to enter interesting functions
  - Watch PC update in header

Step 7: Hit Hardfault
  - Handler triggered, paused
  - Check registers: (gdb) info registers
  - Check stack: (gdb) x/16xw $sp

Step 8: Fix and Retry
  - Press Ctrl+Shift+F5 to restart
  - Target reloads firmware and restarts
  - Begin debugging again
```

## Command Output Examples

### Successful Continue

```
(gdb) c
[Continuing...]
[State] running
[Target] Program received signal SIGTRAP, Trace/breakpoint trap.
[Target stopped] Signal: 5
PC: 0x08001234
State: STOPPED
```

### Step Sequence

```
(gdb) n
[Stepping single instruction...]
PC: 0x08001004
State: STOPPED

(gdb) n
[Stepping single instruction...]
PC: 0x08001008
State: STOPPED
```

### Function Step Into

```
(gdb) s
[Stepping single source line...]
[Entering function body]
PC: 0x08002000
State: STOPPED
```

### Step Out

(gdb) finish
[Running until return...]
PC: 0x08001010
State: STOPPED

```

## Advanced Usage

### Combined with Manual Commands

```

Workflow:

1. Use Continue button (F5) to run
2. Type command manually: (gdb) print x
3. Use Step buttons (F10/F11) to advance
4. Repeat as needed

```

### With Breakpoints

```

Setup (via GDB commands):
(gdb) break main.c:50
(gdb) break my_function

Then:

- Press F5 to continue (stops at each breakpoint)
- Use F10/F11 to step within function
- Repeat with F5

```

### Monitoring Registers While Stepping

```

Workflow:

1. Configure output panel to show registers
2. Pause at breakpoint
3. Step through code (F10)
4. Watch register values change in real-time

```

## Performance Tips

### Efficient Debugging

1. **Use Continue (F5)** instead of Step
   - Let target run to breakpoints
   - Don't single-step long loops

2. **Strategic Breakpoints**
   - Set breakpoints near problem area
   - Use Continue to jump between them

3. **Batch Stepping**
   - Step Over (F10) for loops
   - Step Into (F11) only for specific functions

## Troubleshooting Examples

### Shortcuts Not Working

**Problem**: F5 doesn't work, but Continue button works
```

Solution:

1. Click on main window (not in input field)
2. Verify GDB is connected
3. Check browser console for JS errors
4. Try different browser if issue persists

```

### Button Appears Disabled When It Shouldn't

**Problem**: Continue button disabled when target paused
```

Solution:

1. Check header for "Attached" status
2. Verify "[Target stopped]" in output
3. Check execution state shows "STOPPED"
4. Try Step button instead (verifies GdbClient works)
5. Reconnect if issue persists

```

### State Not Updating

**Problem**: State shows RUNNING after pause
```

Solution:

1. Check output for "[Target stopped]" message
2. Verify GDB actually stopped (PC changed?)
3. Look for error messages
4. Try sending manual command: (gdb) info threads
5. Reconnect if deadlocked

```

## Integration with Other Features

### With Registers Panel
```

1. Pause target (F6)
2. Click "Registers" tab
3. Watch registers update as you step (F10)
4. Use Continue (F5) to run to next breakpoint

```

### With Memory Panel
```

1. Pause target (F6)
2. Set memory watch at address
3. Step through code (F10)
4. Watch memory values change

```

### With Disassembly View
```

1. Open disassembly (if available)
2. Pause target (F6)
3. Step through assembly (F10)
4. PC indicator shows current position

```

## Batch Operations

### Stepping Multiple Times

Without releasing mouse:
```

Step over 5 instructions:
F10, F10, F10, F10, F10
Keyboard auto-repeat speeds this up

```

### Continue and Pause Pattern

```

Run to breakpoint:
F5 → Target runs
[pauses at BP] → Toolbar updates
F10, F10, F10 → Step ahead
F5 → Continue to next BP

```

## Summary

The Debug Control Toolbar provides:
- **7 Essential Buttons**: All standard debug operations
- **6 Keyboard Shortcuts**: Full keyboard control
- **Visual Feedback**: State indicators and animations
- **Smart Disabling**: Buttons enable/disable appropriately
- **Integration**: Works seamlessly with manual GDB commands

Use it alongside manual GDB commands for powerful, flexible debugging!

---

**Examples Updated**: 2025-11-02
**Version**: 1.0
**Based on**: GDB Standard Commands and VS Code/Visual Studio Shortcuts
```
