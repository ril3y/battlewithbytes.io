# C Compiler in Browser - Proof of Concept

## Goal
Prove we can compile C code to ARM Cortex-M binaries entirely in the browser.

## Approaches

### 1. TinyCC (Recommended - Start Here)
- **Size**: ~500KB WASM
- **Speed**: 9x faster than GCC
- **ARM Support**: Built-in ARM cross-compilation
- **Status**: Proven to work in WASM (tcc-riscv32-wasm)

### 2. Emscripten + Clang
- **Size**: ~30-50MB compressed
- **Speed**: Slower but full optimization
- **ARM Support**: Via LLVM ARM backend
- **Status**: Well-documented, production-ready

### 3. Custom LLVM IR Interpreter
- **Size**: ~5MB
- **Speed**: Medium
- **Status**: Research phase

## Success Criteria

✅ Compile simple C function to ARM Thumb machine code
✅ Generate valid ARM assembly
✅ Run in browser without server
✅ Sub-second compilation time
✅ Bundle size < 10MB

## Test Cases

1. **Hello World** (minimal)
```c
void main(void) {
    volatile int x = 42;
}
```

2. **GPIO Blink** (STM32-specific)
```c
#define GPIOC_ODR (*(volatile unsigned int*)0x4001100C)

void main(void) {
    while(1) {
        GPIOC_ODR ^= (1 << 13);  // Toggle PC13
        for(int i=0; i<100000; i++);
    }
}
```

3. **Function Calls** (test linking)
```c
int add(int a, int b) {
    return a + b;
}

void main(void) {
    int result = add(5, 7);
}
```

## Directory Structure

```
experiments/c-compiler-poc/
├── 1-tinycc/
│   ├── build-tcc.sh           # Compile TinyCC to WASM
│   ├── test-tcc.html          # Browser test harness
│   └── examples/
│       └── blink.c
├── 2-emscripten-clang/
│   ├── build-clang.sh
│   └── test-clang.html
├── 3-llvm-ir/
│   └── research/
└── README.md
```

## Timeline

- **Day 1-2**: TinyCC WASM build and basic test
- **Day 3-4**: ARM cross-compilation validation
- **Day 5**: Generate actual STM32 binary
- **Day 6-7**: Emscripten fallback (if needed)
