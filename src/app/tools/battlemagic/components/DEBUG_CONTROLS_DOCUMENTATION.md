# GDB Debug Control Toolbar - Documentation

## Overview

The Debug Control Toolbar provides intuitive, keyboard-accessible controls for GDB debugging operations. It integrates seamlessly with the GdbPanel and supports standard debugger conventions (Visual Studio/GDB style).

## Components

### 1. DebugControlToolbar.tsx
**Location:** `X:\battlewithbytes.io\src\app\tools\battlemagic\components\DebugControlToolbar.tsx`

Main component that provides all debug control buttons and keyboard shortcuts.

#### Props

```typescript
interface DebugControlToolbarProps {
  gdbClient: GdbClient | null;          // GDB client instance
  executionState: ExecutionState;        // Current execution state
  onStateChange?: (state: ExecutionState) => void;  // State change callback
  onCommandExecuted?: (command: string) => void;    // Command execution callback
  isAttached: boolean;                   // Whether target is attached
}
```

#### Execution States

```typescript
enum ExecutionState {
  STOPPED = 'stopped',        // Target execution halted
  RUNNING = 'running',        // Target actively executing
  STEPPING = 'stepping',      // Single-stepping
  UNKNOWN = 'unknown'         // Unknown state
}
```

### 2. GdbPanel.tsx (Enhanced)
**Location:** `X:\battlewithbytes.io\src\app\tools\battlemagic\components\GdbPanel.tsx`

Updated to include the DebugControlToolbar and track execution state.

#### State Tracking

- **executionState**: Tracked from output messages and button actions
- **currentPC**: Program Counter extracted from stop replies (hex format)
- **isAttached**: Determines if target is ready for debug commands

#### New Features

1. **Toolbar Integration**: Shows when GDB is connected
2. **PC Display**: Shows current program counter when paused
3. **State Detection**: Automatically detects execution state from GDB output
4. **Attachment Status**: Displays "Attached" indicator in header

## Debug Control Buttons

### Button Layout
| Icon | Label | Keyboard Shortcut | Function |
|------|-------|-------------------|----------|
| ▶ | Continue | F5 | Resume execution |
| ⏸ | Pause | F6 | Halt execution (Ctrl+C) |
| ⏩ | Step Over | F10 | Step over function calls |
| ⬇ | Step Into | F11 | Step into functions |
| ⬆ | Step Out | Shift+F11 | Step out of current function |
| ↺ | Restart | Ctrl+Shift+F5 | Restart execution (GDB 'run') |
| 🔄 | Reset | — | Reset target (GDB 'monitor reset') |

### Button Behavior

#### Continue/Run (▶)
- **GDB Command:** `c` (continue)
- **State Effect:** Sets execution state to RUNNING
- **Enabled When:** Target is paused/stopped
- **Color:** Green (success variant)

#### Pause/Break (⏸)
- **GDB Command:** Ctrl+C (interrupt signal)
- **State Effect:** Sets execution state to STOPPED
- **Enabled When:** Target is running
- **Color:** Yellow (warning variant)

#### Step Over (⏩)
- **GDB Command:** `n` (next instruction)
- **State Effect:** Sets execution state to STEPPING
- **Enabled When:** Target is paused
- **Color:** Default gray

#### Step Into (⬇)
- **GDB Command:** `s` (step instruction)
- **State Effect:** Sets execution state to STEPPING
- **Enabled When:** Target is paused
- **Color:** Default gray

#### Step Out (⬆)
- **GDB Command:** `finish` (step out)
- **State Effect:** Sets execution state to STEPPING
- **Enabled When:** Target is paused
- **Color:** Default gray

#### Restart (↺)
- **GDB Command:** `run` (restart execution)
- **State Effect:** Sets execution state to RUNNING
- **Enabled When:** Always enabled (except if not attached)
- **Color:** Default gray

#### Reset (🔄)
- **GDB Command:** `monitor reset` (target reset)
- **State Effect:** N/A (target resets)
- **Enabled When:** Always enabled (except if not attached)
- **Color:** Yellow (warning variant)

## Keyboard Shortcuts

### Standard Debugger Shortcuts
- **F5**: Continue/Run execution
- **F6**: Pause/Break execution
- **F10**: Step Over (next instruction)
- **F11**: Step Into function
- **Shift+F11**: Step Out of function
- **Ctrl+Shift+F5**: Restart execution

### Keyboard Shortcut Implementation

Shortcuts are implemented via global `keydown` event listener that:
1. Checks if GDB is connected
2. Checks if target is attached
3. Prevents default browser behavior
4. Executes corresponding button action

All shortcuts are context-aware and respect:
- Connection state
- Attachment state
- Execution state (some only work when paused)

## Visual Design

### Color Scheme
```
Enabled States:
- Default (Gray): bg-gray-700, text-gray-200
- Success (Green): bg-green-600/30, text-green-300 (Continue button)
- Warning (Yellow): bg-yellow-600/30, text-yellow-300 (Pause/Reset)

Disabled States:
- All buttons: opacity-50, cursor-not-allowed
- Only shown when not attached or connection lost

Hover States:
- Enhanced brightness: hover:bg-[color]/50
- Enhanced border: hover:border-[color]/400
- Shadow effect: hover:shadow-lg
```

### Layout
```
┌─────────────────────────────────────────────────┐
│ State: STOPPED │ ▶ ⏸ ⏩ ⬇ ⬆ ↺ 🔄    [Executing] │
└─────────────────────────────────────────────────┘
```

### Tooltips
- Position: Above button (bottom-full)
- Show on hover: Displays in 250ms
- Content: Button description + keyboard shortcut
- Styling: green-500 border, semi-transparent background

## State Management

### Execution State Detection

The GdbPanel tracks execution state by monitoring output messages:

```typescript
// Stops execution
if (lastLine.includes('[target stopped]') ||
    lastLine.includes('signal')) {
  setExecutionState(ExecutionState.STOPPED);
}

// Resumes execution
if (lastLine.includes('[state] running') ||
    lastLine.includes('continuing')) {
  setExecutionState(ExecutionState.RUNNING);
}
```

### Program Counter Extraction

When target stops, the PC is extracted and displayed:

```typescript
const pcMatch = lastLine.match(/pc[:\s]+0x([0-9a-f]+)/i);
if (pcMatch) {
  setCurrentPC(parseInt(pcMatch[1], 16));
}
```

Displayed in header as: `PC: 0x08001234`

## GdbClient Methods Used

All button actions use existing GdbClient methods:

| Button | Method | Type |
|--------|--------|------|
| Continue | `gdbClient.continue()` | Instance Method |
| Pause | `gdbClient.halt()` | Instance Method |
| Step Over | `gdbClient.step()` | Instance Method |
| Step Into | `gdbClient.step()` | Instance Method |
| Step Out | `gdbClient.sendCommand('finish')` | Raw Command |
| Restart | `gdbClient.sendCommand('run')` | Raw Command |
| Reset | `gdbClient.reset()` | Instance Method |

### Method Signatures

```typescript
// Pause/Interrupt
async halt(): Promise<void>
  // Sends Ctrl+C signal via RspProtocol.INTERRUPT

// Continue
async continue(): Promise<StopReply>
  // Builds and sends GDB 'c' command
  // Returns when target stops

// Single Step
async step(): Promise<StopReply>
  // Builds and sends GDB 's' command
  // Executes one instruction

// Reset Target
async reset(): Promise<void>
  // Sends monitor reset command
  // Uses BlackMagicCommands.buildReset()

// Raw Commands
async sendCommand(command: string): Promise<GdbResponse>
  // For 'finish' and 'run' commands
```

## Implementation Features

### Responsive Design
- Icon always visible (smaller screens)
- Label hidden on small screens (sm: breakpoint)
- Touch-friendly button sizes (px-3 py-2)
- Stack responsively on narrow screens

### Error Handling
- Errors logged to console (not shown to user)
- Non-blocking: execution continues even if command fails
- Timeout handled by underlying GdbClient (5-15 seconds)

### Visual Feedback
- **Executing Indicator**: Pulsing dot appears during command execution
- **Button States**: Disabled buttons clearly indicated
- **Hover Effects**: Bright borders and shadows on hover
- **State Indicator**: Real-time execution state display

### Accessibility
- All buttons have descriptive titles (hover tooltips)
- Keyboard shortcuts listed in tooltips
- Clear visual state indicators
- Proper ARIA labels (via title attribute)

## Usage Example

### In BattleMagicMonitor

```typescript
<GdbPanel
  gdbClient={gdbClient}
  output={gdbOutput}
  targets={targets}
  onAttachTarget={handleAttachTarget}
  onStateChange={handleGdbStateChange}
/>
```

### Accessing Current PC

The current PC is available in the output and displayed in the header:
```
GDB | Connected | Attached | PC: 0x08001a2c
```

## Integration with BattleMagicMonitor

The GdbPanel is already integrated with BattleMagicMonitor, which:

1. Manages GdbClient instance
2. Handles connection state changes
3. Manages output buffer (passed as prop)
4. Handles target attachment

No additional changes needed in BattleMagicMonitor for basic functionality.

## Testing Strategies

### Unit Testing

Test DebugControlToolbar with:
```typescript
// Mock GdbClient
const mockGdbClient = {
  isConnected: () => true,
  continue: jest.fn(),
  halt: jest.fn(),
  step: jest.fn(),
  reset: jest.fn(),
  sendCommand: jest.fn(),
  getState: () => ConnectionState.ATTACHED
};

// Test button enables/disables
// Test keyboard shortcuts
// Test state changes
```

### Integration Testing

Test in BattleMagicMonitor context:
1. Connect to real/mock GDB
2. Attach to target
3. Execute debug commands
4. Verify state changes reflect in UI

### Manual Testing

1. **Connection Flow**:
   - Connect GDB, buttons should appear disabled
   - Attach to target, buttons should enable
   - Disconnect, buttons should disable

2. **Execution Control**:
   - Press F5 to continue
   - Press F6 to pause
   - Watch state indicator change

3. **Keyboard Shortcuts**:
   - F10, F11, Shift+F11 for stepping
   - Ctrl+Shift+F5 for restart

4. **Visual Feedback**:
   - Hover over buttons to see tooltips
   - Check for executing indicator during commands
   - Verify PC displays correctly when paused

## Performance Considerations

### Re-render Optimization

- ExecutionState changes only trigger re-render of toolbar
- Output changes trigger state detection (debounced via useEffect)
- Keyboard event listener removed on component unmount
- Button handlers wrapped in useCallback to prevent unnecessary re-renders

### Memory Usage

- ExecutionState is primitive (string enum)
- PC is single number or undefined
- Toolbar lifecycle tied to GdbPanel lifecycle
- No memory leaks from event listeners (properly cleaned up)

## Future Enhancements

### Potential Features

1. **Run to Cursor**: Execute until reaching specific address
2. **Conditional Breakpoints**: Break on conditions
3. **Thread Control**: For multi-threaded targets
4. **Stack Navigation**: Step through call stack
5. **Register Inspection**: During pause

### Command History

The GdbPanel already supports command history with ↑/↓ navigation.

### Advanced Debugging

Future versions could add:
- Memory watch windows
- Disassembly view with PC indicator
- Stack unwinding
- Thread/task switching

## Troubleshooting

### Buttons Don't Enable

1. Check GDB connection status (green indicator in header)
2. Verify target is attached (should show "Attached")
3. Check execution state matches button requirements
4. Look at console for errors from GdbClient

### Shortcuts Don't Work

1. Verify focus is on page (not in input field)
2. Check that GDB is connected
3. Verify target is attached
4. Try clicking button directly to test functionality

### State Doesn't Update

1. Check that GDB output contains stop/running indicators
2. Verify BattleMagicMonitor is properly updating output
3. Look for "[Target stopped]" or "[State]" messages
4. Check PC parsing regex matches output format

## Related Files

- **GdbClient.ts**: Core GDB communication
- **BattleMagicMonitor.tsx**: Main application component
- **GdbPanel.tsx**: Parent component containing toolbar
- **ConnectionBar.tsx**: GDB connection management
- **BlackMagicCommands.ts**: GDB command builders
- **types.ts**: Type definitions (ExecutionState enum)

## Technical Stack

- **React 18+**: Hooks (useState, useEffect, useCallback, useRef)
- **TypeScript**: Strict type safety
- **Tailwind CSS**: Utility-first styling
- **Next.js**: React framework
- **Web Serial API**: Target communication via GdbClient

## Notes for Maintainers

1. **Button Ordering**: Currently ordered as standard debugger (Continue, Pause, Step Over, Step Into, Step Out, Restart, Reset)

2. **Color Scheme**: Uses existing Tailwind color scheme (green/yellow/gray)

3. **Icon Characters**: Using Unicode symbols for cross-platform compatibility

4. **Keyboard Shortcuts**: Follow VS Code/Visual Studio conventions

5. **State Persistence**: No state saved between sessions (stateless UI)

6. **Error Messages**: Minimal user-visible errors, rely on GDB output

## References

- GDB Command Reference: https://sourceware.org/gdb/onlinedocs/gdb/
- Black Magic Probe: https://github.com/blacksphere/blackmagic
- Web Serial API: https://wicg.github.io/serial/
- React Hooks: https://react.dev/reference/react/hooks

---

**Last Updated:** 2025-11-02
**Component Version:** 1.0
**Author:** ril3y (Claude Code)
