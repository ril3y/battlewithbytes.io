/**
 * Tests for Arduino Preprocessor
 */

import { ArduinoPreprocessor } from "../ArduinoPreprocessor";

describe("ArduinoPreprocessor", () => {
  let preprocessor: ArduinoPreprocessor;

  beforeEach(() => {
    preprocessor = new ArduinoPreprocessor();
  });

  describe("Simple blink sketch preprocessing", () => {
    it("should preprocess a basic blink sketch", () => {
      const inoContent = `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`;

      const result = preprocessor.preprocess(inoContent);

      // Should include Arduino.h
      expect(result.code).toContain("#include <Arduino.h>");

      // Should contain the original code
      expect(result.code).toContain("void setup()");
      expect(result.code).toContain("void loop()");

      // Should not generate prototypes for setup/loop
      expect(result.code).not.toContain("void setup();");
      expect(result.code).not.toContain("void loop();");

      // Should generate main.cpp
      expect(result.mainFile).toContain("int main(void)");
      expect(result.mainFile).toContain("init()");
      expect(result.mainFile).toContain("setup()");
      expect(result.mainFile).toContain("loop()");

      // Should have no warnings
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe("Function prototype generation", () => {
    it("should generate prototypes for user-defined functions", () => {
      const inoContent = `void myHelper(int x) {
  Serial.println(x);
}

int calculate(int a, int b) {
  return a + b;
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  myHelper(calculate(5, 3));
}`;

      const result = preprocessor.preprocess(inoContent);

      // Should generate prototypes for myHelper and calculate
      expect(result.code).toContain("void myHelper(int x);");
      expect(result.code).toContain("int calculate(int a, int b);");

      // Prototypes should come before the function definitions
      const myHelperProtoIndex = result.code.indexOf("void myHelper(int x);");
      const myHelperDefIndex = result.code.indexOf("void myHelper(int x) {");
      expect(myHelperProtoIndex).toBeLessThan(myHelperDefIndex);
    });

    it("should handle functions with no parameters", () => {
      const inoContent = `int getValue() {
  return 42;
}

void setup() {}
void loop() {}`;

      const result = preprocessor.preprocess(inoContent);

      expect(result.code).toContain("int getValue();");
    });

    it("should handle functions with complex return types", () => {
      const inoContent = `unsigned long* getPointer() {
  static unsigned long value = 0;
  return &value;
}

const char& getReference() {
  static char c = 'A';
  return c;
}

void setup() {}
void loop() {}`;

      const result = preprocessor.preprocess(inoContent);

      expect(result.code).toContain("unsigned long* getPointer();");
      expect(result.code).toContain("const char& getReference();");
    });

    it("should skip functions in comments", () => {
      const inoContent = `// void commentedFunction() {
//   return;
// }

/*
void multilineCommentFunction() {
  return;
}
*/

void realFunction() {
  return;
}

void setup() {}
void loop() {}`;

      const result = preprocessor.preprocess(inoContent);

      // Should only have prototype for realFunction
      expect(result.code).toContain("void realFunction();");
      expect(result.code).not.toContain("void commentedFunction();");
      expect(result.code).not.toContain("void multilineCommentFunction();");
    });
  });

  describe("Multiple function detection", () => {
    it("should detect multiple functions correctly", () => {
      const inoContent = `void func1() {}
int func2(int x) { return x; }
float func3(float a, float b) { return a + b; }
void func4(char* str, int len) {}

void setup() {}
void loop() {}`;

      const result = preprocessor.preprocess(inoContent);

      expect(result.code).toContain("void func1();");
      expect(result.code).toContain("int func2(int x);");
      expect(result.code).toContain("float func3(float a, float b);");
      expect(result.code).toContain("void func4(char* str, int len);");
    });

    it("should handle static and inline functions", () => {
      const inoContent = `static void staticFunc() {}
inline int inlineFunc() { return 0; }

void setup() {}
void loop() {}`;

      const result = preprocessor.preprocess(inoContent);

      expect(result.code).toContain("void staticFunc();");
      expect(result.code).toContain("int inlineFunc();");
    });
  });

  describe("main() generation", () => {
    it("should generate proper Arduino main() function", () => {
      const mainFile = preprocessor.generateMain();

      // Should include Arduino.h
      expect(mainFile).toContain("#include <Arduino.h>");

      // Should declare setup and loop as extern C
      expect(mainFile).toContain('extern "C" void setup()');
      expect(mainFile).toContain('extern "C" void loop()');

      // Should have main function
      expect(mainFile).toContain("int main(void)");

      // Should call init(), setup(), and loop()
      expect(mainFile).toContain("init()");
      expect(mainFile).toContain("setup()");
      expect(mainFile).toContain("loop()");

      // Should have infinite loop
      expect(mainFile).toContain("for (;;)");

      // Should handle serial events
      expect(mainFile).toContain("serialEventRun");

      // Should return 0
      expect(mainFile).toContain("return 0");
    });
  });

  describe("Multi-file sketch combination", () => {
    it("should combine multiple .ino files alphabetically", () => {
      const files = new Map<string, string>();
      files.set("Sketch.ino", "void setup() {}\nvoid loop() {}");
      files.set("Helpers.ino", "void helper() {}");
      files.set("Utils.ino", "int util() { return 0; }");

      const combined = preprocessor.combineSketchFiles(files);

      // Should include all files
      expect(combined).toContain("void setup()");
      expect(combined).toContain("void helper()");
      expect(combined).toContain("int util()");

      // Should have file markers
      expect(combined).toContain("// ===== Helpers.ino =====");
      expect(combined).toContain("// ===== Sketch.ino =====");
      expect(combined).toContain("// ===== Utils.ino =====");

      // Check alphabetical order (Helpers, Sketch, Utils)
      const helpersIndex = combined.indexOf("Helpers.ino");
      const sketchIndex = combined.indexOf("Sketch.ino");
      const utilsIndex = combined.indexOf("Utils.ino");

      expect(helpersIndex).toBeLessThan(sketchIndex);
      expect(sketchIndex).toBeLessThan(utilsIndex);
    });

    it("should handle single file", () => {
      const files = new Map<string, string>();
      files.set("Single.ino", "void setup() {}\nvoid loop() {}");

      const combined = preprocessor.combineSketchFiles(files);

      expect(combined).toContain("void setup()");
      expect(combined).toContain("// ===== Single.ino =====");
    });

    it("should handle empty files map", () => {
      const files = new Map<string, string>();
      const combined = preprocessor.combineSketchFiles(files);

      expect(combined).toBe("");
    });

    it("should preserve code structure when combining", () => {
      const files = new Map<string, string>();
      files.set("A.ino", "int globalA = 1;");
      files.set("B.ino", "int globalB = 2;");

      const combined = preprocessor.combineSketchFiles(files);

      // Should have both globals
      expect(combined).toContain("int globalA = 1;");
      expect(combined).toContain("int globalB = 2;");

      // Should be separated
      expect(combined).toMatch(
        /A\.ino[\s\S]*globalA[\s\S]*B\.ino[\s\S]*globalB/,
      );
    });
  });

  describe("Integration tests", () => {
    it("should handle a complete Arduino sketch with preprocessing", () => {
      const inoContent = `// Complete Arduino sketch
int ledPin = 13;

void blinkLed(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(ledPin, HIGH);
    delay(200);
    digitalWrite(ledPin, LOW);
    delay(200);
  }
}

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  blinkLed(3);
  delay(1000);
}`;

      const result = preprocessor.preprocess(inoContent);

      // Should have Arduino.h
      expect(result.code).toContain("#include <Arduino.h>");

      // Should have function prototype
      expect(result.code).toContain("void blinkLed(int times);");

      // Should preserve all code
      expect(result.code).toContain("int ledPin = 13;");
      expect(result.code).toContain("void setup()");
      expect(result.code).toContain("void loop()");

      // Should have valid main file
      expect(result.mainFile).toContain("int main(void)");
    });

    it("should handle sketch with no user functions", () => {
      const inoContent = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`;

      const result = preprocessor.preprocess(inoContent);

      // Should still include Arduino.h
      expect(result.code).toContain("#include <Arduino.h>");

      // Should not have function prototypes section
      expect(result.code).not.toContain("// Function prototypes");

      // Should still work
      expect(result.code).toContain("void setup()");
      expect(result.code).toContain("void loop()");
    });
  });
});
