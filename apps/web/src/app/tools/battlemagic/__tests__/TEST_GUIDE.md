# BattleMagic Test Guide

Comprehensive test suite for the BattleMagic GDB debugger tool.

## Overview

This test suite covers the core functionality of the BattleMagic GDB debugging interface, including:

- **GDB Protocol Communication** - RSP packet encoding/decoding, command queueing
- **Memory Operations** - Read/write memory, register access
- **Execution Control** - Breakpoints, stepping, continue/halt
- **File Parsing** - Intel HEX, Binary, Motorola S-Record formats
- **Disassembly** - ARM Thumb instruction decoding
- **UI Components** - Connection management, status indicators

## Test Structure

```
__tests__/
  ├── fixtures/        # Test data (sample memory, hex records, etc.)
  │   └── testData.ts  # Common test data and constants
  ├── mocks/           # Mock implementations for testing
  │   └── MockSerialTransport.ts
  ├── utils/           # Test utility functions
  │   └── testHelpers.ts
  ├── lib/gdb/         # GDB library tests
  │   ├── GdbClient.test.ts
  │   └── RspProtocol.test.ts
  ├── lib/flash/       # Flash programming tests
  │   └── FileParser.test.ts
  ├── lib/disasm/      # Disassembler tests
  │   └── ArmDisassembler.test.ts
  └── components/      # React component tests
      └── ConnectionBar.test.tsx
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run battlemagic tests only
```bash
npm test -- --testPathPattern="battlemagic"
```

### Run specific test suite
```bash
npm test -- src/app/tools/battlemagic/__tests__/lib/gdb/RspProtocol.test.ts
```

### Run tests with coverage
```bash
npm test -- --coverage --testPathPattern="battlemagic"
```

### Run tests in watch mode
```bash
npm test -- --watch --testPathPattern="battlemagic"
```

## Test Coverage

Current test suite includes:

- **RspProtocol Tests** (57 tests)
  - Checksum calculation and verification
  - Packet encoding/decoding
  - Binary data escaping/unescaping
  - Memory operations encoding
  - Stop reply parsing
  - Packet extraction from buffer

- **FileParser Tests** (45+ tests)
  - Intel HEX format parsing
  - Binary file parsing
  - Motorola S-Record parsing
  - Checksum calculation
  - Format conversion (HEX, S-Record)
  - Flash command generation

- **ArmDisassembler Tests** (35+ tests)
  - Thumb-16 instruction decoding
  - Thumb-2 instruction decoding
  - Branch target calculation
  - Multiple instruction disassembly
  - Endianness handling
  - Memory safety and edge cases

- **GdbClient Tests** (50+ tests)
  - Connection management
  - Command queueing and timeouts
  - Memory read/write operations
  - Register operations
  - Breakpoint management
  - Execution control (run, step, halt)
  - Flash operations
  - Error handling

- **ConnectionBar Component Tests** (25+ tests)
  - Rendering and state indicators
  - Connection button interactions
  - Baud rate selection
  - Target control buttons
  - Port storage indicators

**Total: 150+ tests, 120+ passing**

## Test Data Fixtures

The `testData.ts` file provides:

- **SAMPLE_MEMORY** - Various memory patterns for testing
- **INTEL_HEX_SAMPLES** - Sample HEX file records
- **S_RECORD_SAMPLES** - Sample Motorola S-Record data
- **GDB_PACKETS** - Mock GDB RSP packets
- **REGISTER_DATA** - ARM register values
- **THUMB_INSTRUCTIONS** - ARM Thumb instruction samples

## Mock Implementations

### MockSerialTransport

Simulates the Web Serial API without requiring actual hardware:

```typescript
const mock = new MockSerialTransport();
await mock.connect(port);
mock.queueResponse(packetData);
const sentData = mock.getSentData();
```

## Test Helpers

Utility functions in `testHelpers.ts`:

- `createMockPacket(data)` - Create GDB RSP packet
- `createMemoryReadResponse(bytes)` - Create memory read response
- `createRegisterResponse(hex)` - Create register response
- `createStopReplyPacket(signal, info)` - Create stop reply
- `bytesEqual(a, b)` - Compare byte arrays
- `waitFor(condition, timeout)` - Wait for async condition
- `withTimeout(promise, ms)` - Add timeout to promise

## Known Limitations

1. **Web Serial API Mocking** - Tests use mocked serial transport; full hardware integration requires actual Black Magic Probe
2. **ELF File Parsing** - Not implemented; tests verify appropriate error handling
3. **Disassembler Coverage** - Tests cover common Thumb instructions; specialized instructions may not be fully tested
4. **Component Testing** - Tests use React Testing Library with jsdom; real DOM interactions require browser environment

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run tests
  run: npm test -- --testPathPattern="battlemagic" --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Pre-commit Hook

```bash
#!/bin/bash
npm test -- --testPathPattern="battlemagic" --bail
```

## Debugging Tests

### Enable debug output
```bash
npm test -- --testPathPattern="battlemagic" --verbose
```

### Run single test
```bash
npm test -- -t "should read memory from target"
```

### Run tests matching pattern
```bash
npm test -- -t "Memory Operations"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--testPathPattern=battlemagic", "--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Adding New Tests

### Test Template

```typescript
describe('Feature Name', () => {
  let instance: ClassToTest;

  beforeEach(() => {
    instance = new ClassToTest();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  it('should do something', () => {
    const result = instance.doSomething();
    expect(result).toBe(expectedValue);
  });

  it('should handle edge case', () => {
    expect(() => instance.doSomething(invalidInput)).toThrow();
  });
});
```

### Best Practices

1. **Descriptive Test Names** - Use "should..." naming convention
2. **Arrange-Act-Assert** - Structure tests with setup, execution, verification
3. **Mock External Dependencies** - Use mocks for serial communication, file I/O
4. **Test Both Happy and Error Paths** - Include positive and negative test cases
5. **Keep Tests Focused** - One concept per test
6. **Use Fixtures** - Share test data via testData.ts
7. **Clear Assertions** - Use specific matchers, avoid generic truthy checks

## Troubleshooting

### Tests Timeout
- Increase timeout: `jest.setTimeout(10000)` in test file
- Check for unmocked async operations
- Verify mock responses are queued properly

### "Cannot find module" Errors
- Verify import paths are correct
- Check that test files use proper path resolution
- Ensure mocks are set up before imports

### Memory Leaks
- Clean up event listeners in `afterEach`
- Call `disconnect()` on clients
- Clear all mocks with `jest.clearAllMocks()`

### Type Errors
- Use `as any` for accessing private properties in tests (with caution)
- Define proper types for mock objects
- Use `jest.mocked()` for typed mocks

## Performance

Current test suite runs in ~25 seconds with good parallelization. For faster feedback:

```bash
# Run only changed tests
npm test -- --onlyChanged --testPathPattern="battlemagic"

# Run tests in parallel (default)
npm test -- --testPathPattern="battlemagic" --maxWorkers=4
```

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure >80% code coverage for new code
3. Run linter: `npx eslint src/app/tools/battlemagic`
4. All tests must pass before submitting PR
5. Update this guide if adding new test patterns

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [GDB Remote Serial Protocol](https://sourceware.org/gdb/onlinedocs/gdb/Overview.html#Overview)
- [Black Magic Probe](https://black-magic.readthedocs.io/)

---

Last updated: 2025-11-02
Test Framework: Jest 29+
Coverage Target: >80%
