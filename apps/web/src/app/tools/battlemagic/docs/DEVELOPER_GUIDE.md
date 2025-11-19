# BattleMagic Developer Guide

Complete guide for developers working on BattleMagic firmware analysis features.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Adding New Analysis Passes](#adding-new-analysis-passes)
5. [Extending the UI](#extending-the-ui)
6. [Testing Guidelines](#testing-guidelines)
7. [Code Style](#code-style)
8. [Performance Optimization](#performance-optimization)
9. [Debugging Tips](#debugging-tips)

---

## Architecture Overview

BattleMagic uses a multi-layered architecture with Rust WASM for performance-critical analysis and TypeScript/React for the UI.

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Web Browser                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │          React UI Layer                         │   │
│  │  - DisassemblyView                              │   │
│  │  - VectorTablePanel                             │   │
│  │  - ControlFlowGraphView                         │   │
│  │  - ArgumentAnnotation                           │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────▼──────────────────────────────┐   │
│  │      AnalysisContext (React Context)            │   │
│  │  - Centralized state management                 │   │
│  │  - Fast indexed lookups (Map/Set)               │   │
│  │  - Auto-save to IndexedDB                       │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│  ┌──────────────────▼──────────────────────────────┐   │
│  │       WASM Analyzer (Rust → WASM)               │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  ArmAnalyzer (Public API)                │  │   │
│  │  │  - analyze_from_bytes()                  │  │   │
│  │  │  - get_vector_table()                    │  │   │
│  │  │  - export_database()                     │  │   │
│  │  └──────────────┬───────────────────────────┘  │   │
│  │                 │                                │   │
│  │  ┌──────────────▼───────────────────────────┐  │   │
│  │  │  BinaryAnalyzer Core                     │  │   │
│  │  │  - ARM Thumb-2 Decoder                   │  │   │
│  │  │  - Xref Builder                          │  │   │
│  │  │  - CFG Analyzer                          │  │   │
│  │  └──────────────┬───────────────────────────┘  │   │
│  │                 │                                │   │
│  │  ┌──────────────▼───────────────────────────┐  │   │
│  │  │  Analysis Modules                        │  │   │
│  │  │  - FunctionAnalyzer                      │  │   │
│  │  │  - CallingConventionAnalyzer             │  │   │
│  │  │  - VectorTableDetector                   │  │   │
│  │  │  - LoopDetector                          │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │       IndexedDB (Persistence)                   │   │
│  │  - functions, comments, xrefs                   │   │
│  │  - vector_table, metadata                       │   │
│  │  - Schema versioning + migrations               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User loads firmware
         ↓
2. Firmware bytes → ArmAnalyzer.analyze_from_bytes()
         ↓
3. Rust WASM performs:
   - Instruction decoding (ARM Thumb-2)
   - Xref database building
   - Function detection
   - Argument analysis
   - Vector table parsing
   - CFG + loop analysis
         ↓
4. Returns AnalysisResults to JavaScript
         ↓
5. AnalysisContext builds indexes:
   - xrefsTo: Map<address, xrefs[]>
   - xrefsFrom: Map<address, xrefs[]>
   - functions: Map<address, FunctionInfo>
   - comments: Map<address, Map<type, Comment>>
         ↓
6. UI components query AnalysisContext:
   - getXrefsTo(address)
   - getFunctionAt(address)
   - getArgAnnotation(callAddress)
         ↓
7. User interactions saved to IndexedDB
         ↓
8. Auto-save after 2s of inactivity
```

---

## Project Structure

```
battlewithbytes.io/
├── packages/
│   └── battlemagic-analyzer/          # Rust WASM analyzer
│       ├── src/
│       │   ├── lib.rs                 # WASM API exports
│       │   ├── analyzer.rs            # Core analyzer
│       │   ├── analysis/              # Analysis modules
│       │   │   ├── functions.rs       # Function detection
│       │   │   ├── calling_convention.rs  # Argument analysis
│       │   │   ├── vector_table.rs    # Vector table detection
│       │   │   └── mod.rs
│       │   ├── arch/                  # Architecture-specific code
│       │   │   └── arm/
│       │   │       ├── decoder.rs     # Thumb-2 decoder
│       │   │       ├── xref.rs        # ARM xref extraction
│       │   │       └── mod.rs
│       │   ├── cfg/                   # Control flow graph
│       │   │   ├── basic_blocks.rs
│       │   │   ├── dominators.rs
│       │   │   ├── loops.rs
│       │   │   └── mod.rs
│       │   ├── database.rs            # Persistence schema
│       │   ├── types.rs               # Core types
│       │   └── xref.rs                # Xref database
│       ├── Cargo.toml
│       └── README.md
│
└── apps/
    └── web/
        └── src/app/tools/battlemagic/
            ├── components/            # UI components
            │   ├── VectorTablePanel.tsx
            │   ├── ArgumentAnnotation.tsx
            │   ├── CommentEditor.tsx
            │   └── DisassemblyView/
            │       ├── DisassemblyView.tsx
            │       ├── components/
            │       │   ├── LinearView.tsx
            │       │   ├── CommentModal.tsx
            │       │   └── DisassemblyHeader.tsx
            │       ├── hooks/
            │       │   ├── useDisassemblyState.ts
            │       │   ├── useEnrichedDisassembly.ts
            │       │   └── useKeyboardShortcuts.ts
            │       └── utils/
            │           ├── loopRenderer.tsx
            │           └── formatters.ts
            ├── lib/
            │   ├── context/
            │   │   └── AnalysisContext.tsx  # Global state
            │   ├── db/
            │   │   └── AnalysisDatabase.ts  # IndexedDB wrapper
            │   ├── wasmAnalyzer.ts          # WASM types
            │   └── loadWasmAnalyzer.ts      # WASM loader
            └── docs/                         # Documentation
                ├── NEW_FEATURES.md
                ├── API.md
                ├── MIGRATION.md
                └── DEVELOPER_GUIDE.md
```

---

## Development Setup

### Prerequisites

- **Rust**: 1.70+ with `wasm32-unknown-unknown` target
- **wasm-pack**: Latest version
- **Node.js**: 18+ with npm/pnpm
- **IDE**: VS Code with rust-analyzer extension

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/ril3y/battlewithbytes.io.git
cd battlewithbytes.io

# 2. Install Rust tools
rustup target add wasm32-unknown-unknown
cargo install wasm-pack

# 3. Build WASM module
cd packages/battlemagic-analyzer
wasm-pack build --dev --target web

# 4. Install web dependencies
cd ../../apps/web
npm install

# 5. Start dev server
npm run dev
```

### Development Workflow

```bash
# Terminal 1: Watch WASM changes
cd packages/battlemagic-analyzer
wasm-pack build --dev --target web --watch

# Terminal 2: Web dev server
cd apps/web
npm run dev

# Terminal 3: Run tests
cargo test --lib
npm test
```

---

## Adding New Analysis Passes

### Step 1: Create Analysis Module (Rust)

Create `packages/battlemagic-analyzer/src/analysis/my_analysis.rs`:

```rust
//! My custom analysis pass
//!
//! Brief description of what this analysis does.

use crate::types::Instruction;
use crate::analysis::FunctionInfo;

/// My analyzer struct
pub struct MyAnalyzer {
    // Configuration fields
    threshold: u32,
}

impl MyAnalyzer {
    /// Create new analyzer
    pub fn new(threshold: u32) -> Self {
        Self { threshold }
    }

    /// Run analysis on a function
    pub fn analyze(&self, function: &FunctionInfo, instructions: &[Instruction]) -> MyResults {
        let mut results = MyResults::default();

        // Perform analysis
        for instr in instructions {
            // Check conditions
            if self.should_process(instr) {
                // Extract data
                results.add_result(instr.address);
            }
        }

        results
    }

    /// Helper method
    fn should_process(&self, instr: &Instruction) -> bool {
        // Your logic here
        instr.address > self.threshold
    }
}

/// Results struct
#[derive(Debug, Default)]
pub struct MyResults {
    pub items: Vec<u32>,
}

impl MyResults {
    fn add_result(&mut self, address: u32) {
        self.items.push(address);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_analysis() {
        let analyzer = MyAnalyzer::new(0x1000);
        // Add test cases
    }
}
```

### Step 2: Integrate into Analyzer

Update `packages/battlemagic-analyzer/src/analyzer.rs`:

```rust
use crate::analysis::my_analysis::{MyAnalyzer, MyResults};

pub struct BinaryAnalyzer<A: Architecture> {
    // ... existing fields
    my_analyzer: MyAnalyzer,
}

impl<A: Architecture> BinaryAnalyzer<A> {
    pub fn new(arch: A, base_address: u32) -> Self {
        Self {
            // ... existing initialization
            my_analyzer: MyAnalyzer::new(0x8000),
        }
    }

    pub fn analyze_from_bytes(&mut self, bytes: &[u8]) -> AnalysisResults {
        // ... existing analysis

        // Run new analysis
        let my_results = self.my_analyzer.analyze(&function_info, &instructions);

        // Add to results
        results.my_results = Some(my_results);

        results
    }
}
```

### Step 3: Export to WASM (if needed)

Update `packages/battlemagic-analyzer/src/lib.rs`:

```rust
#[wasm_bindgen]
impl ArmAnalyzer {
    /// Get results from my analysis
    #[wasm_bindgen]
    pub fn get_my_results(&self) -> Result<JsValue, JsValue> {
        if !self.inner.is_analyzed() {
            return Err(JsValue::from_str("Binary not analyzed"));
        }

        // Get results from analyzer
        let results = self.inner.get_my_results();

        // Serialize to JavaScript
        serde_wasm_bindgen::to_value(&results)
            .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))
    }
}
```

### Step 4: Add TypeScript Types

Update `apps/web/src/app/tools/battlemagic/lib/wasmAnalyzer.ts`:

```typescript
export interface MyResults {
    items: number[];
}

export interface AnalysisResults {
    // ... existing fields
    my_results?: MyResults;
}
```

### Step 5: Use in UI

Update `AnalysisContext.tsx` or create new hook:

```typescript
export function useMyAnalysis() {
    const { results } = useAnalysis();

    const myResults = useMemo(() => {
        return results?.my_results || null;
    }, [results]);

    return { myResults };
}
```

Create component in `components/MyAnalysisPanel.tsx`:

```typescript
export function MyAnalysisPanel() {
    const { myResults } = useMyAnalysis();

    if (!myResults) {
        return <div>No results</div>;
    }

    return (
        <div>
            <h2>My Analysis Results</h2>
            {myResults.items.map(addr => (
                <div key={addr}>0x{addr.toString(16)}</div>
            ))}
        </div>
    );
}
```

---

## Extending the UI

### Adding a New Panel

**Step 1: Create Component**

`components/MyPanel.tsx`:

```typescript
'use client';

import React from 'react';
import { useAnalysis } from '../lib/context/AnalysisContext';

export interface MyPanelProps {
    onNavigate?: (address: number) => void;
}

export default function MyPanel({ onNavigate }: MyPanelProps) {
    const { results, isAnalyzed } = useAnalysis();

    if (!isAnalyzed()) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                No analysis data available
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-950 text-white">
            {/* Header */}
            <div className="p-3 border-b border-gray-700">
                <h2 className="text-sm font-bold text-cyan-400">MY PANEL</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-3">
                {/* Your content here */}
            </div>

            {/* Status bar */}
            <div className="px-3 py-2 border-t border-gray-700 bg-gray-900 text-xs text-gray-400">
                Status info
            </div>
        </div>
    );
}
```

**Step 2: Add to Layout**

```typescript
import MyPanel from './components/MyPanel';

function MainLayout() {
    return (
        <div className="grid grid-cols-12 gap-2">
            <div className="col-span-8">
                <DisassemblyView />
            </div>
            <div className="col-span-4 space-y-2">
                <VectorTablePanel />
                <MyPanel />  {/* Add here */}
            </div>
        </div>
    );
}
```

### Adding Keyboard Shortcuts

`hooks/useKeyboardShortcuts.ts`:

```typescript
export function useKeyboardShortcuts() {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Ctrl+M: Open My Panel
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                openMyPanel();
            }

            // F5: Refresh analysis
            if (e.key === 'F5') {
                e.preventDefault();
                refreshAnalysis();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}
```

### Adding Context Menu Items

```typescript
function DisassemblyLine({ instruction }: { instruction: Instruction }) {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    return (
        <>
            <div onContextMenu={handleContextMenu}>
                {/* Instruction rendering */}
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={[
                        { label: 'My Action', onClick: () => doMyAction(instruction) },
                        { label: 'Another Action', onClick: () => doAnother(instruction) },
                    ]}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </>
    );
}
```

---

## Testing Guidelines

### Rust Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // Helper to create test instruction
    fn make_instr(addr: u32, mnemonic: &str, operands: &str) -> Instruction {
        Instruction::new(
            addr,
            vec![0u8; 4],
            mnemonic.to_string(),
            operands.to_string(),
        )
    }

    #[test]
    fn test_my_analyzer_basic() {
        let analyzer = MyAnalyzer::new(0x1000);
        let instrs = vec![
            make_instr(0x1000, "mov", "r0, #10"),
            make_instr(0x1004, "bl", "#0x2000"),
        ];

        let results = analyzer.analyze(&instrs);
        assert_eq!(results.items.len(), 2);
    }

    #[test]
    fn test_my_analyzer_edge_cases() {
        let analyzer = MyAnalyzer::new(0x1000);

        // Empty input
        let results = analyzer.analyze(&[]);
        assert_eq!(results.items.len(), 0);

        // Invalid data
        let results = analyzer.analyze(&[make_instr(0, "", "")]);
        assert!(results.items.is_empty());
    }
}
```

### TypeScript Unit Tests

`__tests__/myFeature.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import { myFunction } from '../myFeature';

describe('myFunction', () => {
    it('should handle basic case', () => {
        const result = myFunction(0x08000100);
        expect(result).toBe(expected);
    });

    it('should handle edge cases', () => {
        expect(myFunction(0)).toBeNull();
        expect(myFunction(0xFFFFFFFF)).toBeNull();
    });
});
```

### Integration Tests

```bash
# Run Rust tests
cd packages/battlemagic-analyzer
cargo test

# Run TypeScript tests
cd apps/web
npm test

# Run E2E tests (if applicable)
npm run test:e2e
```

---

## Code Style

### Rust

Follow standard Rust conventions:

```rust
// Good
pub struct MyAnalyzer {
    threshold: u32,
}

impl MyAnalyzer {
    pub fn new(threshold: u32) -> Self {
        Self { threshold }
    }

    pub fn analyze(&self, data: &[u8]) -> Result<MyResults, Error> {
        // Implementation
    }
}

// Add documentation
/// Analyzes binary data for specific patterns
///
/// # Arguments
/// * `data` - Raw binary data
///
/// # Returns
/// Analysis results or error
///
/// # Example
/// ```
/// let analyzer = MyAnalyzer::new(0x1000);
/// let results = analyzer.analyze(&data)?;
/// ```
```

### TypeScript/React

Follow project conventions:

```typescript
// Good component structure
export interface MyComponentProps {
    data: number[];
    onSelect?: (item: number) => void;
}

export function MyComponent({ data, onSelect }: MyComponentProps) {
    const [selected, setSelected] = useState<number | null>(null);

    const handleClick = useCallback((item: number) => {
        setSelected(item);
        onSelect?.(item);
    }, [onSelect]);

    return (
        <div>
            {data.map(item => (
                <div key={item} onClick={() => handleClick(item)}>
                    {item}
                </div>
            ))}
        </div>
    );
}
```

### Naming Conventions

- **Rust**: `snake_case` for functions/variables, `PascalCase` for types
- **TypeScript**: `camelCase` for functions/variables, `PascalCase` for types/components
- **Files**: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Constants**: `SCREAMING_SNAKE_CASE`

---

## Performance Optimization

### Rust Optimizations

```rust
// Use iterators instead of loops
let results: Vec<_> = items.iter()
    .filter(|x| x.is_valid())
    .map(|x| x.process())
    .collect();

// Pre-allocate with capacity
let mut vec = Vec::with_capacity(estimated_size);

// Use references to avoid clones
fn process(data: &[u8]) -> Result<(), Error> {
    // Process without copying
}

// Cache expensive computations
struct Analyzer {
    cache: HashMap<u32, Result>,
}

impl Analyzer {
    fn get_result(&mut self, addr: u32) -> &Result {
        self.cache.entry(addr).or_insert_with(|| {
            // Expensive computation
            compute_result(addr)
        })
    }
}
```

### TypeScript Optimizations

```typescript
// Use useMemo for expensive computations
const sortedData = useMemo(() => {
    return data.sort((a, b) => a - b);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback((id: number) => {
    // Handle click
}, [dependencies]);

// Virtualize long lists
import { FixedSizeList } from 'react-window';

function LongList({ items }: { items: number[] }) {
    return (
        <FixedSizeList
            height={600}
            itemCount={items.length}
            itemSize={30}
            width="100%"
        >
            {({ index, style }) => (
                <div style={style}>{items[index]}</div>
            )}
        </FixedSizeList>
    );
}
```

### Profiling

```bash
# Profile Rust code
cargo build --release
cargo flamegraph --bin test_analyzer

# Profile TypeScript with Chrome DevTools
# 1. Open Chrome DevTools
# 2. Go to Performance tab
# 3. Record and analyze
```

---

## Debugging Tips

### Rust Debugging

```rust
// Enable console logging in WASM
#[cfg(feature = "console_log")]
web_sys::console::log_1(&format!("Debug: {}", value).into());

// Use debug assertions
debug_assert!(condition, "Condition failed");

// Print to stderr (visible in terminal during tests)
eprintln!("Debug value: {:?}", value);

// Use the dbg! macro
let result = dbg!(expensive_computation());
```

### TypeScript Debugging

```typescript
// Console logging with context
console.log('[MyComponent] State:', state);
console.table(arrayData);
console.time('operation');
// ... operation
console.timeEnd('operation');

// React DevTools
// Install React DevTools browser extension
// Inspect component props and state

// Performance monitoring
const start = performance.now();
// ... operation
const end = performance.now();
console.log(`Operation took ${end - start}ms`);
```

### WASM Debugging

```bash
# Enable debug symbols
wasm-pack build --dev --target web -- --features console_log

# View WASM in browser
# Chrome DevTools → Sources → WASM modules

# Add breakpoints in Rust code
# Set breakpoints in .rs files in Chrome DevTools
```

---

## Common Patterns

### Pattern 1: Analysis Pass Template

```rust
pub trait AnalysisPass {
    type Result;

    fn analyze(&mut self, instructions: &[Instruction]) -> Self::Result;
}

pub struct MyPass {
    config: MyConfig,
}

impl AnalysisPass for MyPass {
    type Result = MyResults;

    fn analyze(&mut self, instructions: &[Instruction]) -> Self::Result {
        // Implementation
    }
}
```

### Pattern 2: UI Panel Template

```typescript
export function PanelTemplate() {
    const { results, isAnalyzed } = useAnalysis();

    if (!isAnalyzed()) {
        return <EmptyState />;
    }

    return (
        <div className="h-full flex flex-col">
            <PanelHeader />
            <PanelContent results={results} />
            <PanelFooter />
        </div>
    );
}
```

### Pattern 3: Database Integration

```typescript
// Save custom data to IndexedDB
const db = getAnalysisDatabase();

// Define schema
interface MyData {
    id: number;
    value: string;
}

// Save
await db.transaction(['my_store'], 'readwrite', tx => {
    const store = tx.objectStore('my_store');
    return store.put({ id: 1, value: 'data' });
});

// Load
const data = await db.transaction(['my_store'], 'readonly', tx => {
    const store = tx.objectStore('my_store');
    return store.get(1);
});
```

---

## Resources

- [Rust WASM Book](https://rustwasm.github.io/docs/book/)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
- [React Documentation](https://react.dev/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [ARM Architecture Reference Manual](https://developer.arm.com/documentation/)

---

## Getting Help

- **Issues**: Open GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check API.md and NEW_FEATURES.md
- **Examples**: See `__tests__/` directories for examples

Happy developing!
