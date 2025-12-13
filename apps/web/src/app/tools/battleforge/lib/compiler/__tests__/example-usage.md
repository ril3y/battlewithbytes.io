# Arduino Preprocessor - Example Usage

This document demonstrates how to use the ArduinoPreprocessor to convert Arduino sketch files (.ino) to standard C++ files.

## Basic Example

```typescript
import { ArduinoPreprocessor } from '../ArduinoPreprocessor';

const preprocessor = new ArduinoPreprocessor();

// Arduino sketch code
const sketchCode = `
void blinkLed(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(13, HIGH);
    delay(200);
    digitalWrite(13, LOW);
    delay(200);
  }
}

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  blinkLed(3);
  delay(1000);
}
`;

// Preprocess the sketch
const result = preprocessor.preprocess(sketchCode);

console.log('Preprocessed C++ code:');
console.log(result.code);
// Output:
// #include <Arduino.h>
//
// // Function prototypes
// void blinkLed(int times);
//
// [original sketch code]

console.log('\nGenerated main.cpp:');
console.log(result.mainFile);
// Output contains main() function that calls init(), setup(), and loop()
```

## Multi-file Sketch Example

```typescript
const preprocessor = new ArduinoPreprocessor();

// Multiple .ino files
const files = new Map<string, string>();

files.set('MyProject.ino', `
void setup() {
  Serial.begin(9600);
  setupSensors();
}

void loop() {
  readSensors();
  delay(1000);
}
`);

files.set('Sensors.ino', `
void setupSensors() {
  pinMode(A0, INPUT);
}

void readSensors() {
  int value = analogRead(A0);
  Serial.println(value);
}
`);

// Combine files
const combined = preprocessor.combineSketchFiles(files);

// Then preprocess
const result = preprocessor.preprocess(combined);
```

## Integration with BattleForge Compiler

```typescript
import { ArduinoPreprocessor } from '../ArduinoPreprocessor';
import { executeClang } from '../EmscriptenClangLoader';

const preprocessor = new ArduinoPreprocessor();

// 1. Preprocess Arduino sketch
const preprocessResult = preprocessor.preprocess(arduinoCode);

// 2. Compile with Clang
const clangResult = await executeClang(
  [
    '-c',                          // Compile only
    '-target', 'thumbv7em-none-eabi',
    '-mcpu=cortex-m4',
    '-mthumb',
    '-o', '/sketch.o',
    '/sketch.cpp'
  ],
  {
    '/sketch.cpp': preprocessResult.code,
    '/main.cpp': preprocessResult.mainFile
  }
);

// 3. Check for compilation errors
if (!clangResult.success) {
  console.error('Compilation failed:', clangResult.stderr);
}
```

## Features

### Function Prototype Extraction

The preprocessor automatically generates forward declarations for user-defined functions:

```cpp
// Input
int calculateSum(int a, int b) {
  return a + b;
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  int result = calculateSum(5, 3);
  Serial.println(result);
}

// Output includes:
// int calculateSum(int a, int b);
```

### Arduino Runtime Main

The generated main.cpp includes the proper Arduino runtime initialization:

```cpp
int main(void) {
  init();          // Initialize Arduino hardware
  setup();         // Call user setup
  for (;;) {
    loop();        // Call user loop repeatedly
    if (serialEventRun) serialEventRun();
  }
  return 0;
}
```

### Complex Return Types

Handles pointers, references, and multi-word types:

```cpp
unsigned long* getPointer() { ... }
const char& getReference() { ... }
static void staticFunction() { ... }
```

All generate correct prototypes:

```cpp
unsigned long* getPointer();
const char& getReference();
void staticFunction();
```
