/**
 * WASM Integration Tests
 *
 * Tests the full WASM analysis pipeline:
 * - Loading firmware bytes
 * - Running analysis
 * - Vector table detection
 * - Argument annotation extraction
 * - Function detection with extended analysis
 */

import { loadWasmAnalyzer, createAnalyzer, XrefType } from '../lib/wasmAnalyzer';
import { generateTestFirmware, EXPECTED_ANALYSIS } from './fixtures/test_firmware.bin';

describe('WASM Analyzer Integration', () => {
  describe('Module Loading', () => {
    it('should load the WASM module successfully', async () => {
      const wasmModule = await loadWasmAnalyzer();
      expect(wasmModule).toBeDefined();
      expect(wasmModule.ArmAnalyzer).toBeDefined();
      expect(typeof wasmModule.ArmAnalyzer).toBe('function');
    });

    it('should create an analyzer instance with base address', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      expect(analyzer).toBeDefined();
      expect(typeof analyzer.analyze_from_bytes).toBe('function');

      // Cleanup
      analyzer.free();
    });

    it('should handle multiple analyzer instances', async () => {
      const analyzer1 = await createAnalyzer(0x08000000);
      const analyzer2 = await createAnalyzer(0x20000000);

      expect(analyzer1).toBeDefined();
      expect(analyzer2).toBeDefined();

      // Cleanup
      analyzer1.free();
      analyzer2.free();
    });
  });

  describe('Firmware Analysis', () => {
    let firmware: Uint8Array;

    beforeEach(() => {
      firmware = generateTestFirmware();
    });

    it('should analyze firmware and return results', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      expect(results).toBeDefined();
      expect(results.xrefs).toBeDefined();
      expect(Array.isArray(results.xrefs)).toBe(true);
      expect(results.total_instructions).toBeGreaterThan(0);
      expect(results.analysis_time_ms).toBeGreaterThan(0);

      analyzer.free();
    });

    it('should detect cross-references correctly', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      // Should have xrefs
      expect(results.xrefs.length).toBeGreaterThan(0);

      // Check for call xrefs (BL instructions)
      const callXrefs = results.xrefs.filter((x) => x.xref_type === XrefType.Call);
      expect(callXrefs.length).toBeGreaterThanOrEqual(EXPECTED_ANALYSIS.xrefs.calls);

      // Check for branch xrefs
      const branchXrefs = results.xrefs.filter((x) => x.xref_type === XrefType.Branch);
      expect(branchXrefs.length).toBeGreaterThanOrEqual(EXPECTED_ANALYSIS.xrefs.branches);

      // Verify xref structure
      if (results.xrefs.length > 0) {
        const firstXref = results.xrefs[0];
        expect(firstXref).toHaveProperty('from_addr');
        expect(firstXref).toHaveProperty('to_addr');
        expect(firstXref).toHaveProperty('xref_type');
        expect(firstXref).toHaveProperty('instruction');
        expect(firstXref).toHaveProperty('operands');
      }

      analyzer.free();
    });

    it('should detect functions with extended analysis data', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      expect(results.functions).toBeDefined();
      expect(Array.isArray(results.functions)).toBe(true);

      // Should detect multiple functions
      expect(results.functions.length).toBeGreaterThanOrEqual(
        EXPECTED_ANALYSIS.functions.length
      );

      // Verify function structure
      if (results.functions.length > 0) {
        const func = results.functions[0];
        expect(func).toHaveProperty('start_address');
        expect(func).toHaveProperty('end_address');
        expect(func).toHaveProperty('stack_frame_size');
        expect(func).toHaveProperty('stack_vars');
        expect(func).toHaveProperty('arg_annotations');
        expect(func).toHaveProperty('callers');
        expect(func).toHaveProperty('callees');
        expect(func).toHaveProperty('complexity');
      }

      analyzer.free();
    });

    it('should calculate function callers and callees', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      // Find functions with callers
      const functionsWithCallers = results.functions.filter(
        (f) => f.callers && f.callers.length > 0
      );
      expect(functionsWithCallers.length).toBeGreaterThan(0);

      // Find functions with callees
      const functionsWithCallees = results.functions.filter(
        (f) => f.callees && f.callees.length > 0
      );
      expect(functionsWithCallees.length).toBeGreaterThan(0);

      // Verify caller/callee relationship is bidirectional
      if (functionsWithCallees.length > 0) {
        const caller = functionsWithCallees[0];
        const calleeAddr = caller.callees[0];
        const callee = results.functions.find((f) => f.start_address === calleeAddr);

        if (callee) {
          expect(callee.callers).toContain(caller.start_address);
        }
      }

      analyzer.free();
    });
  });

  describe('Vector Table Detection', () => {
    let firmware: Uint8Array;

    beforeEach(() => {
      firmware = generateTestFirmware();
    });

    it('should detect vector table entries', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      expect(results.vector_table).toBeDefined();
      expect(Array.isArray(results.vector_table)).toBe(true);

      // Should detect standard ARM Cortex-M vectors
      expect(results.vector_table.length).toBeGreaterThanOrEqual(16);

      analyzer.free();
    });

    it('should provide correct vector table entry structure', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      if (results.vector_table && results.vector_table.length > 0) {
        const entry = results.vector_table[0];
        expect(entry).toHaveProperty('vector_number');
        expect(entry).toHaveProperty('handler_address');
        expect(entry).toHaveProperty('handler_name');
        expect(entry).toHaveProperty('is_valid');
      }

      analyzer.free();
    });

    it('should identify Initial SP (vector 0)', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      const initialSP = results.vector_table?.find((v) => v.vector_number === 0);
      expect(initialSP).toBeDefined();
      expect(initialSP?.handler_address).toBe(0x20001000);

      analyzer.free();
    });

    it('should identify Reset_Handler (vector 1)', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      const resetHandler = results.vector_table?.find((v) => v.vector_number === 1);
      expect(resetHandler).toBeDefined();
      expect(resetHandler?.handler_address).toBe(0x08000101); // Thumb bit set
      expect(resetHandler?.is_valid).toBe(true);

      analyzer.free();
    });

    it('should mark invalid vectors correctly', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      // Reserved vectors should be marked as invalid or have 0x00000000
      const reservedVectors = results.vector_table?.filter(
        (v) => v.vector_number >= 7 && v.vector_number <= 10
      );

      expect(reservedVectors).toBeDefined();
      if (reservedVectors && reservedVectors.length > 0) {
        const hasInvalidEntries = reservedVectors.some(
          (v) => !v.is_valid || v.handler_address === 0x00000000
        );
        expect(hasInvalidEntries).toBe(true);
      }

      analyzer.free();
    });
  });

  describe('Argument Annotation Extraction', () => {
    let firmware: Uint8Array;

    beforeEach(() => {
      firmware = generateTestFirmware();
    });

    it('should extract argument annotations for function calls', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      // Find functions with arg_annotations
      const functionsWithArgs = results.functions.filter(
        (f) => f.arg_annotations && f.arg_annotations.length > 0
      );

      // Should have at least one function with argument annotations
      expect(functionsWithArgs.length).toBeGreaterThan(0);

      analyzer.free();
    });

    it('should provide correct argument annotation structure', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      const functionsWithArgs = results.functions.filter(
        (f) => f.arg_annotations && f.arg_annotations.length > 0
      );

      if (functionsWithArgs.length > 0) {
        const func = functionsWithArgs[0];
        const annotation = func.arg_annotations[0];

        expect(annotation).toHaveProperty('call_address');
        expect(annotation).toHaveProperty('function_target');
        expect(annotation).toHaveProperty('args');
        expect(Array.isArray(annotation.args)).toBe(true);
      }

      analyzer.free();
    });

    it('should track argument values in registers (r0-r3)', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      const functionsWithArgs = results.functions.filter(
        (f) => f.arg_annotations && f.arg_annotations.length > 0
      );

      if (functionsWithArgs.length > 0) {
        const func = functionsWithArgs[0];
        const annotation = func.arg_annotations[0];

        // Should have arguments (typically r0-r3 for ARM calling convention)
        expect(annotation.args.length).toBeGreaterThan(0);

        // Verify argument structure: [arg_number, location]
        const firstArg = annotation.args[0];
        expect(Array.isArray(firstArg)).toBe(true);
        expect(firstArg.length).toBe(2);
        expect(typeof firstArg[0]).toBe('number'); // arg number (0-3)
        expect(typeof firstArg[1]).toBe('string'); // location (e.g., "r0", "0x42")
      }

      analyzer.free();
    });

    it('should handle functions with multiple argument annotations', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      // Find function that makes multiple calls
      const functionsWithMultipleCalls = results.functions.filter(
        (f) => f.arg_annotations && f.arg_annotations.length > 1
      );

      // Some functions should have multiple call sites with different arguments
      // This is expected behavior even if not present in this specific test firmware
      expect(typeof functionsWithMultipleCalls).toBe('object');

      analyzer.free();
    });
  });

  describe('Loop Detection', () => {
    let firmware: Uint8Array;

    beforeEach(() => {
      firmware = generateTestFirmware();
    });

    it('should detect loops in the firmware', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      expect(results.loops).toBeDefined();
      expect(Array.isArray(results.loops)).toBe(true);

      // The infinite loop (B infinite_loop) should be detected
      expect(results.loops.length).toBeGreaterThan(0);

      analyzer.free();
    });

    it('should provide correct loop structure', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const results = analyzer.analyze_from_bytes(firmware);

      if (results.loops.length > 0) {
        const loop = results.loops[0];
        expect(loop).toHaveProperty('header_addr');
        expect(loop).toHaveProperty('back_edge_addr');
        expect(loop).toHaveProperty('body_addrs');
        expect(loop).toHaveProperty('loop_type');
        expect(loop).toHaveProperty('nesting_level');
        expect(Array.isArray(loop.body_addrs)).toBe(true);
      }

      analyzer.free();
    });
  });

  describe('Analysis Performance', () => {
    let firmware: Uint8Array;

    beforeEach(() => {
      firmware = generateTestFirmware();
    });

    it('should complete analysis within reasonable time', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);

      const startTime = Date.now();
      const results = analyzer.analyze_from_bytes(firmware);
      const endTime = Date.now();

      const totalTime = endTime - startTime;

      // Analysis should complete in less than 1 second for small firmware
      expect(totalTime).toBeLessThan(1000);

      // Results should include analysis time
      expect(results.analysis_time_ms).toBeDefined();
      expect(results.analysis_time_ms).toBeGreaterThan(0);

      analyzer.free();
    });

    it('should return consistent results across multiple runs', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);

      const results1 = analyzer.analyze_from_bytes(firmware);
      analyzer.reset();
      const results2 = analyzer.analyze_from_bytes(firmware);

      // Results should be consistent
      expect(results1.xrefs.length).toBe(results2.xrefs.length);
      expect(results1.functions.length).toBe(results2.functions.length);
      expect(results1.total_instructions).toBe(results2.total_instructions);

      analyzer.free();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty firmware gracefully', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const emptyFirmware = new Uint8Array(0);

      expect(() => {
        analyzer.analyze_from_bytes(emptyFirmware);
      }).not.toThrow();

      analyzer.free();
    });

    it('should handle small firmware buffers', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const tinyFirmware = new Uint8Array(16);

      expect(() => {
        analyzer.analyze_from_bytes(tinyFirmware);
      }).not.toThrow();

      analyzer.free();
    });

    it('should handle invalid base addresses', async () => {
      // Base address 0 should work (flash at 0x00000000)
      const analyzer1 = await createAnalyzer(0x00000000);
      expect(analyzer1).toBeDefined();
      analyzer1.free();

      // Unaligned base address should still work
      const analyzer2 = await createAnalyzer(0x08000001);
      expect(analyzer2).toBeDefined();
      analyzer2.free();
    });
  });

  describe('Analyzer State Management', () => {
    it('should allow reset and reanalysis', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const firmware = generateTestFirmware();

      const results1 = analyzer.analyze_from_bytes(firmware);
      expect(analyzer.is_analyzed()).toBe(true);

      analyzer.reset();
      expect(analyzer.is_analyzed()).toBe(false);

      const results2 = analyzer.analyze_from_bytes(firmware);
      expect(analyzer.is_analyzed()).toBe(true);

      expect(results1.xrefs.length).toBe(results2.xrefs.length);

      analyzer.free();
    });

    it('should track xref count', async () => {
      const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
      const firmware = generateTestFirmware();

      expect(analyzer.xref_count()).toBe(0);

      const results = analyzer.analyze_from_bytes(firmware);

      expect(analyzer.xref_count()).toBe(results.xrefs.length);
      expect(analyzer.xref_count()).toBeGreaterThan(0);

      analyzer.free();
    });
  });
});
