# BattleMagic Implementation Plan

## Overview
BattleMagic is a browser-based Black Magic Probe debugger that provides comprehensive ARM debugging capabilities through the Web Serial API.

## Architecture Principles
- **Modular Components**: Each feature is a self-contained component
- **Reusable GDB Library**: Core GDB protocol isolated for reuse
- **Type Safety**: Full TypeScript throughout
- **Testable**: Unit tests for critical logic
- **Performance**: Efficient for large memory dumps and real-time trace

## Phase 1: Core Infrastructure (Current State ✅)
- [x] GDB RSP Protocol implementation
- [x] Serial transport layer
- [x] Basic connection management
- [x] Registers panel
- [x] Memory hex viewer
- [x] Stack view
- [x] Command terminal
- [x] Port persistence

## Phase 2: Target Information & Control (No Target Required)
### 2.1 Target Info Panel
- [ ] Display connection state
- [ ] Show target voltage
- [ ] Display scan chain info
- [ ] Monitor power consumption
- [ ] Show supported features

### 2.2 Connection Manager
- [ ] Multiple probe support
- [ ] Connection profiles
- [ ] Auto-reconnect logic
- [ ] Connection diagnostics

## Phase 3: Programming & Memory Operations
### 3.1 Flash Programming UI
- [ ] Drag & drop .elf/.bin/.hex files
- [ ] Flash progress indicator
- [ ] Verify after write
- [ ] Partial flash updates
- [ ] Flash sector erase

### 3.2 Memory Operations
- [ ] Memory region mapper
- [ ] Bulk memory dump
- [ ] Memory fill/pattern
- [ ] Memory compare
- [ ] Memory watch points

### 3.3 Firmware Extraction Tool
- [ ] Full flash dump
- [ ] Automatic size detection
- [ ] Export formats (.bin, .hex, .elf)
- [ ] Region-specific extraction
- [ ] Dump verification

## Phase 4: Debugging Features
### 4.1 Breakpoints Manager
- [ ] Visual breakpoint list
- [ ] Hardware/software breakpoints
- [ ] Conditional breakpoints
- [ ] Breakpoint import/export
- [ ] Function name breakpoints

### 4.2 Disassembly View
- [ ] ARM/Thumb decoder
- [ ] Mixed source/assembly
- [ ] Symbol resolution
- [ ] Cross-references
- [ ] Jump visualization

### 4.3 Variables & Expressions
- [ ] Watch window
- [ ] Local variables
- [ ] Expression evaluator
- [ ] Memory dereferencing
- [ ] Type casting

## Phase 5: Advanced BMP Features
### 5.1 SWO/ITM Trace Decoder
- [ ] Real-time trace display
- [ ] Printf-style output
- [ ] Timestamp display
- [ ] Channel filtering
- [ ] Trace export

### 5.2 RTT (Real-Time Transfer)
- [ ] RTT console
- [ ] Multiple channels
- [ ] Bidirectional communication
- [ ] Log to file
- [ ] Performance metrics

### 5.3 Power & Performance
- [ ] Target power control
- [ ] Current measurement
- [ ] Voltage monitoring
- [ ] Clock configuration
- [ ] Performance counters

## Phase 6: Hardware Hacking Tools
### 6.1 Chip Identification
- [ ] Auto-detect MCU type
- [ ] Read chip ID codes
- [ ] Display chip capabilities
- [ ] Security bit status
- [ ] Memory protection info

### 6.2 Security Analysis
- [ ] Readout protection check
- [ ] Flash protection status
- [ ] Option bytes viewer
- [ ] Fuse bit decoder
- [ ] Security bypass detection

### 6.3 Pattern Search
- [ ] String search in memory
- [ ] Binary pattern matching
- [ ] Regular expression search
- [ ] Cryptographic key finder
- [ ] Cross-reference generator

## Phase 7: Testing & Quality
### 7.1 Unit Tests
- [ ] GDB protocol tests
- [ ] Command parsing tests
- [ ] Memory operation tests
- [ ] Error handling tests
- [ ] Connection state tests

### 7.2 Integration Tests
- [ ] Mock serial port tests
- [ ] Full workflow tests
- [ ] Error recovery tests
- [ ] Performance tests
- [ ] Browser compatibility

### 7.3 Documentation
- [ ] User guide
- [ ] API documentation
- [ ] Protocol reference
- [ ] Troubleshooting guide
- [ ] Example projects

## Implementation Order (Recommended)

1. **Week 1-2**: Target Info Panel & Connection Manager
   - Essential for understanding probe state
   - No target hardware required

2. **Week 3-4**: Flash Programming UI
   - Critical for loading firmware
   - Enables real testing

3. **Week 5-6**: Breakpoints & Disassembly
   - Core debugging features
   - Visual debugging experience

4. **Week 7-8**: Memory Tools & Extraction
   - Hardware hacking capabilities
   - Firmware recovery

5. **Week 9-10**: SWO/RTT Implementation
   - Advanced trace features
   - Real-time debugging

6. **Week 11-12**: Testing & Polish
   - Comprehensive test suite
   - Documentation
   - Performance optimization

## Technical Considerations

### State Management
- Use Zustand for global state
- Component-local state for UI
- Persistent settings in localStorage

### Performance
- Virtual scrolling for large data
- Web Workers for heavy processing
- Streaming for trace data
- Chunked memory operations

### Error Handling
- Graceful degradation
- Automatic reconnection
- Clear error messages
- Recovery suggestions

### Browser Compatibility
- Chrome/Edge (primary)
- Firefox (Web Serial polyfill)
- Safari (not supported)

## Success Metrics
- [ ] Connect to BMP without target
- [ ] Program STM32F4 successfully
- [ ] Set and hit breakpoints
- [ ] Extract firmware from device
- [ ] Decode SWO trace output
- [ ] 90% test coverage
- [ ] <100ms UI response time

## Next Steps
1. Review and refine plan
2. Set up test environment
3. Begin Phase 2 implementation
4. Regular testing with hardware