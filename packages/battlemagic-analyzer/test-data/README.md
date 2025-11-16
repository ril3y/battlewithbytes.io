# Test Data for BattleMagic Analyzer

This directory contains sample ARM assembly code in text format for testing the analyzer.

## File Format

Each file contains disassembled ARM instructions in the following format:

```
<address> <mnemonic> <operands>
```

Example:
```
0x8000 bl #0x9000
0x8004 b.eq #0x8010
0x8008 ldr r0, [pc, #0x20]
```

Lines starting with `#` are comments and will be ignored by the parser.

## Test Files

### simple.txt
Basic function with:
- Function calls (bl)
- Conditional branches (b.eq)
- Simple control flow

**Expected Results:**
- 2 cross-references total
- 1 call
- 1 conditional branch

### complex.txt
Realistic program with:
- Multiple functions (5 functions)
- Function calls between different functions
- Conditional branches
- PC-relative data loads
- Error handling paths

**Expected Results:**
- Multiple cross-references
- Various xref types (calls, branches, data refs)
- Complex call graph

### data-refs.txt
Focused on PC-relative data references:
- Literal pool loads (ldr with PC-relative addressing)
- Data writes (str with PC-relative addressing)
- Positive and negative offsets
- Decimal and hexadecimal offsets

**Expected Results:**
- High ratio of DataRead/DataWrite xrefs
- Correct PC-relative address calculations

### loop.txt
Loop pattern detection:
- Simple for loop
- Nested loops
- Do-while loop
- Backward branches

**Expected Results:**
- Backward branches (from_addr > to_addr)
- Multiple branches to loop start
- Loop exit branches

### switch.txt
Switch statement implementation:
- Jump table pattern
- Multiple cases
- Default case
- Common exit point

**Expected Results:**
- Multiple branches to same target (exit point)
- Function calls from different cases
- Conditional branches for range checking

### recursive.txt
Recursive function patterns:
- Simple recursion (factorial)
- Multiple recursion (fibonacci)
- Mutual recursion (A calls B, B calls A)

**Expected Results:**
- Self-referencing calls (from_addr in same function as to_addr)
- Multiple recursive call sites

## Usage with Test Tools

### Standalone Binary
```bash
cargo run --bin test_analyzer -- test-data/simple.txt
cargo run --bin test_analyzer -- test-data/complex.txt --verbose
cargo run --bin test_analyzer -- test-data/data-refs.txt --json
```

### Node.js Tests
The Node.js test suite (`test-node.js`) uses inline test data but can be modified to load these files.

### Browser Tests
Load these files via the browser test HTML interface to verify browser-based WASM execution.

## Creating New Test Files

To create additional test files:

1. Use the format: `<address> <mnemonic> <operands>`
2. Use hexadecimal addresses (0x prefix)
3. Add comments with `#` to document test cases
4. Group related instructions together
5. Include expected results in comments

Example:
```
# Test case: Simple function call
# Expected: 1 Call xref from 0x1000 to 0x2000
0x1000 bl #0x2000
```
