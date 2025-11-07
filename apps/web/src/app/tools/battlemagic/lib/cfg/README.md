# Control Flow Graph Library

A modular, extensible library for analyzing and visualizing control flow graphs from disassembled code.

## 📂 Architecture

```
lib/cfg/
├── types.ts                    # Core type definitions
├── BasicBlockAnalyzer.ts       # Identifies basic blocks
├── ControlFlowAnalyzer.ts      # Builds CFG with analysis
├── CFGLayoutEngine.ts          # Computes visual layout
└── index.ts                    # Public API exports
```

## 🎯 Features

### Core Capabilities

- **Basic Block Identification** - Splits disassembly into basic blocks
- **Control Flow Analysis** - Builds complete CFG with edges
- **Loop Detection** - Identifies loops and nesting depth
- **Cyclomatic Complexity** - Measures code complexity
- **Unreachable Code Detection** - Finds dead code
- **Hierarchical Layout** - IDA Pro-style visualization layout
- **Edge Routing** - Smart bezier curve routing for edges

### Extensibility

- **Architecture-agnostic types** - Easy to extend to RISC-V, MIPS, x86
- **Pluggable layout algorithms** - Can add force-directed, circular, etc.
- **Custom block types** - Extensible block classification
- **Optional analysis** - Dominator tree, post-dominators, etc.

## 🚀 Quick Start

### Basic Usage

```typescript
import { ArmDisassembler } from '../arm/ArmDisassembler';
import {
  BasicBlockAnalyzer,
  ControlFlowAnalyzer,
  CFGLayoutEngine
} from './cfg';

// 1. Disassemble code
const disassembler = new ArmDisassembler();
const instructions = disassembler.disassemble(binaryData, startAddress, true);

// 2. Identify basic blocks
const blockAnalyzer = new BasicBlockAnalyzer({
  architecture: 'ARM',
  startAddress,
  detectLoops: true,
  detectUnreachable: true
});
const blocks = blockAnalyzer.identifyBasicBlocks(instructions);

// 3. Build CFG
const cfgAnalyzer = new ControlFlowAnalyzer({
  architecture: 'ARM',
  startAddress,
  detectLoops: true,
  detectUnreachable: true
});
const result = cfgAnalyzer.buildCFG(blocks);

// 4. Compute layout
const layoutEngine = new CFGLayoutEngine({
  algorithm: 'hierarchical',
  blockWidth: 200,
  blockHeight: 80,
  horizontalSpacing: 50,
  verticalSpacing: 40
});
const layout = layoutEngine.computeLayout(result.cfg);

console.log(`Created CFG with ${result.cfg.blocks.size} blocks`);
console.log(`Cyclomatic Complexity: ${result.cfg.metadata.cyclomaticComplexity}`);
console.log(`Max Loop Depth: ${result.cfg.metadata.maxLoopDepth}`);
```

## 📋 API Reference

### BasicBlockAnalyzer

Identifies basic blocks from disassembled instructions.

**Constructor Options:**
```typescript
interface BlockAnalysisOptions {
  architecture: Architecture;
  startAddress: number;
  maxInstructions?: number;
  detectLoops?: boolean;
  detectUnreachable?: boolean;
}
```

**Methods:**
- `identifyBasicBlocks(instructions: DisassembledInstruction[]): BasicBlock[]`

**Example:**
```typescript
const analyzer = new BasicBlockAnalyzer({
  architecture: 'ARM',
  startAddress: 0x08000000,
  detectLoops: true
});
const blocks = analyzer.identifyBasicBlocks(instructions);
```

### ControlFlowAnalyzer

Builds complete control flow graphs with analysis.

**Constructor Options:** Same as BasicBlockAnalyzer

**Methods:**
- `buildCFG(blocks: BasicBlock[]): CFGAnalysisResult`
- `buildDominatorTree(cfg: ControlFlowGraph): Map<string, string[]>`

**Result Structure:**
```typescript
interface CFGAnalysisResult {
  cfg: ControlFlowGraph;
  warnings: string[];
  errors: string[];
  statistics: {
    analysisTimeMs: number;
    blocksCreated: number;
    edgesCreated: number;
  };
}
```

**Example:**
```typescript
const analyzer = new ControlFlowAnalyzer({
  architecture: 'ARM',
  startAddress: 0x08000000
});
const { cfg, warnings, statistics } = analyzer.buildCFG(blocks);

console.log(`Analysis took ${statistics.analysisTimeMs}ms`);
warnings.forEach(w => console.warn(w));
```

### CFGLayoutEngine

Computes visual layout using hierarchical algorithm.

**Constructor Options:**
```typescript
interface LayoutOptions {
  algorithm: 'hierarchical' | 'force-directed';
  blockWidth: number;
  blockHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  edgePadding?: number;
  compactLayout?: boolean;
}
```

**Methods:**
- `computeLayout(cfg: ControlFlowGraph): CFGLayout`

**Example:**
```typescript
const engine = new CFGLayoutEngine({
  algorithm: 'hierarchical',
  blockWidth: 200,
  blockHeight: 100,
  horizontalSpacing: 60,
  verticalSpacing: 50,
  compactLayout: false
});
const layout = engine.computeLayout(cfg);
```

## 🧱 Core Types

### BasicBlock

Represents a single basic block with no internal branches.

```typescript
interface BasicBlock {
  id: string;                     // Hex address
  startAddress: number;
  endAddress: number;
  instructions: DisassembledInstruction[];
  type: BlockType;                // entry, normal, conditional, call, return, etc.

  // Graph connectivity
  predecessors: string[];         // Incoming edges
  successors: string[];           // Outgoing edges
  edges: CFGEdge[];              // Edge metadata
}
```

### ControlFlowGraph

Complete CFG with all blocks and metadata.

```typescript
interface ControlFlowGraph {
  blocks: Map<string, BasicBlock>;
  entryBlock: string;
  exitBlocks: string[];

  functionStart: number;
  functionEnd: number;

  metadata: {
    architecture: Architecture;
    totalInstructions: number;
    totalBlocks: number;
    cyclomaticComplexity: number;
    maxLoopDepth: number;
  };

  loops?: Loop[];
  dominatorTree?: Map<string, string[]>;
}
```

### CFGLayout

Visual layout information for rendering.

```typescript
interface CFGLayout {
  blocks: Map<string, BlockLayout>;  // Block positions
  edges: EdgeLayout[];               // Edge routes
  bounds: {
    width: number;
    height: number;
  };
}

interface BlockLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;  // Hierarchical layer
}

interface EdgeLayout {
  from: string;
  to: string;
  type: EdgeType;
  points: Point[];  // Bezier control points
  color: string;
  isBackEdge?: boolean;
}
```

## 🎨 Block Types

```typescript
enum BlockType {
  ENTRY = 'entry',               // Function entry
  NORMAL = 'normal',             // Sequential code
  CONDITIONAL = 'conditional',   // Conditional branch
  CALL = 'call',                 // Function call
  RETURN = 'return',             // Return instruction
  EXIT = 'exit',                 // Dead end
  UNREACHABLE = 'unreachable'    // Unreachable code
}
```

## 🔗 Edge Types

```typescript
enum EdgeType {
  UNCONDITIONAL = 'unconditional',
  CONDITIONAL_TRUE = 'true',       // Branch taken
  CONDITIONAL_FALSE = 'false',     // Fall-through
  CALL = 'call',
  RETURN = 'return'
}
```

## 🔍 Advanced Features

### Loop Detection

Automatically detects loops and calculates nesting depth:

```typescript
const analyzer = new ControlFlowAnalyzer({
  architecture: 'ARM',
  startAddress: 0x08000000,
  detectLoops: true
});
const { cfg } = analyzer.buildCFG(blocks);

cfg.loops?.forEach(loop => {
  console.log(`Loop at ${loop.header}, depth ${loop.depth}`);
  console.log(`Blocks: ${Array.from(loop.blocks).join(', ')}`);
});
```

### Dominator Analysis

Build dominator tree for advanced analysis:

```typescript
const analyzer = new ControlFlowAnalyzer({
  architecture: 'ARM',
  startAddress: 0x08000000
});
const { cfg } = analyzer.buildCFG(blocks);
const dominatorTree = analyzer.buildDominatorTree(cfg);

for (const [blockId, dominators] of dominatorTree) {
  console.log(`${blockId} dominated by: ${dominators.join(', ')}`);
}
```

### Cyclomatic Complexity

Automatically calculated using formula: **M = E - N + 2P**

- E = number of edges
- N = number of nodes
- P = number of connected components

```typescript
console.log(`Complexity: ${cfg.metadata.cyclomaticComplexity}`);

// Interpretation:
// 1-10: Simple, low risk
// 11-20: Moderate complexity
// 21-50: Complex, high risk
// 50+: Very complex, testing difficult
```

## 🧪 Testing

### Unit Test Example

```typescript
import { BasicBlockAnalyzer } from './BasicBlockAnalyzer';

describe('BasicBlockAnalyzer', () => {
  it('should identify single basic block', () => {
    const instructions = [
      { address: 0x100, mnemonic: 'mov', operands: 'r0, #1', isBranch: false, size: 2 },
      { address: 0x102, mnemonic: 'add', operands: 'r0, r0, #1', isBranch: false, size: 2 }
    ];

    const analyzer = new BasicBlockAnalyzer({
      architecture: 'ARM',
      startAddress: 0x100
    });
    const blocks = analyzer.identifyBasicBlocks(instructions);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].instructions).toHaveLength(2);
  });

  it('should split on branch', () => {
    const instructions = [
      { address: 0x100, mnemonic: 'cmp', operands: 'r0, #0', isBranch: false, size: 2 },
      { address: 0x102, mnemonic: 'beq', operands: '0x110', isBranch: true, branchTarget: 0x110, size: 2 },
      { address: 0x104, mnemonic: 'mov', operands: 'r1, #1', isBranch: false, size: 2 },
      { address: 0x110, mnemonic: 'bx', operands: 'lr', isBranch: false, size: 2 }
    ];

    const analyzer = new BasicBlockAnalyzer({
      architecture: 'ARM',
      startAddress: 0x100
    });
    const blocks = analyzer.identifyBasicBlocks(instructions);

    expect(blocks.length).toBeGreaterThan(1);
  });
});
```

## 🎯 Design Principles

### Modularity

Each component has a single, well-defined responsibility:
- **BasicBlockAnalyzer** - Block identification only
- **ControlFlowAnalyzer** - Graph construction and analysis
- **CFGLayoutEngine** - Visual layout computation

### Extensibility

Easy to extend for new architectures:

```typescript
// Add RISC-V support
class RiscVBlockAnalyzer extends BasicBlockAnalyzer {
  protected classifyBlockType(inst: DisassembledInstruction): BlockType {
    // RISC-V specific classification
    if (inst.mnemonic === 'jalr' && inst.operands.includes('ra')) {
      return BlockType.RETURN;
    }
    return super.classifyBlockType(inst);
  }
}
```

### Performance

- Efficient algorithms (O(N) block identification, O(N log N) layout)
- Lazy evaluation (dominators computed on demand)
- Memory-conscious (streams large functions)

## 📚 Algorithm Details

### Hierarchical Layout (Sugiyama)

1. **Layer Assignment**
   - Uses longest-path BFS from entry block
   - Ensures proper flow direction

2. **Crossing Reduction**
   - Barycentric heuristic
   - Iterative improvement (max 10 iterations)
   - Minimizes visual clutter

3. **Coordinate Assignment**
   - Centers blocks within layers
   - Consistent spacing
   - Configurable dimensions

4. **Edge Routing**
   - Bezier curves for smooth paths
   - Back-edges curve to side
   - Avoid block overlap

### Loop Detection

Uses **back-edge detection** with DFS:
- Back-edge = edge where target dominates source
- Natural loops identified from back-edges
- Nesting depth calculated from containment

## 🔮 Future Enhancements

- **Force-Directed Layout** - Organic, balanced layouts
- **Circular Layout** - For cyclic graphs
- **Data Flow Analysis** - Reaching definitions, live variables
- **Path Highlighting** - Show execution paths
- **Code Coverage Overlay** - Visualize coverage data
- **Multi-Architecture** - RISC-V, MIPS, x86 support
- **Performance Optimization** - Web Worker for large graphs
- **Export Formats** - DOT, SVG, PNG export

## 📖 References

- Sugiyama et al. "Methods for Visual Understanding of Hierarchical System Structures" (1981)
- Cooper, Harvey, Kennedy. "A Simple, Fast Dominance Algorithm" (2001)
- McCabe. "A Complexity Measure" (1976) - Cyclomatic Complexity
- Allen, Cocke. "A Program Data Flow Analysis Procedure" (1976)

## 🤝 Contributing

To add support for a new architecture:

1. Extend `BasicBlockAnalyzer`:
   - Override `classifyBlockType()`
   - Override `isCallInstruction()`
   - Override `isUnconditionalExit()`
   - Add architecture-specific condition extraction

2. Add architecture to `Architecture` type in `types.ts`

3. Add tests for new architecture

4. Update this README

---

**Status:** ✅ Core algorithms implemented and tested
**Next Step:** Create React visualization component (ControlFlowGraphView)
