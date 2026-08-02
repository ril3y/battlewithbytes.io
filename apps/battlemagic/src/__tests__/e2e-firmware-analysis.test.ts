/**
 * End-to-End Firmware Analysis Test
 *
 * Tests the complete workflow from firmware load to database persistence:
 * 1. Load firmware bytes
 * 2. Run WASM analysis
 * 3. Verify vector table populated
 * 4. Verify functions detected with arg annotations
 * 5. Add comments of different types
 * 6. Rename vector handler
 * 7. Save to database
 * 8. Clear and reload
 * 9. Verify all data persisted
 */

import { createAnalyzer } from '../lib/wasmAnalyzer';
import { generateTestFirmware, EXPECTED_ANALYSIS } from './fixtures/test_firmware.bin';
import { getAnalysisDatabase } from '../lib/db/AnalysisDatabase';
import type { CommentType } from '../lib/db/AnalysisDatabase';

// jsdom's Blob lacks text(); importFromMdb relies on it (jest.polyfills.js
// already covers arrayBuffer() the same way)
if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
  Blob.prototype.text = function () {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}

describe('E2E Firmware Analysis Workflow', () => {
  let db: ReturnType<typeof getAnalysisDatabase>;

  beforeAll(async () => {
    db = getAnalysisDatabase();
    await db.init();
  });

  beforeEach(async () => {
    // Clear database before each test
    await db.clear();
  });

  afterAll(() => {
    db.close();
  });

  it('should complete full firmware analysis workflow', async () => {
    // =========================================================================
    // STEP 1: Load Firmware Bytes
    // =========================================================================
    const firmware = generateTestFirmware();
    expect(firmware).toBeDefined();
    expect(firmware.length).toBeGreaterThan(0);
    console.log(`[E2E] Loaded firmware: ${firmware.length} bytes`);

    // =========================================================================
    // STEP 2: Run WASM Analysis
    // =========================================================================
    const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
    const results = analyzer.analyze_from_bytes(firmware);

    expect(results).toBeDefined();
    expect(results.xrefs.length).toBeGreaterThan(0);
    expect(results.functions.length).toBeGreaterThan(0);
    console.log(`[E2E] Analysis complete:`);
    console.log(`  - ${results.total_instructions} instructions`);
    console.log(`  - ${results.xrefs.length} xrefs`);
    console.log(`  - ${results.functions.length} functions`);
    console.log(`  - ${results.analysis_time_ms}ms`);

    // =========================================================================
    // STEP 3: Verify Vector Table Populated
    // =========================================================================
    expect(results.vector_table).toBeDefined();
    expect(results.vector_table!.length).toBeGreaterThanOrEqual(16);

    const resetHandler = results.vector_table!.find((v) => v.vector_number === 1);
    expect(resetHandler).toBeDefined();
    expect(resetHandler!.handler_address).toBe(0x08000101);
    expect(resetHandler!.is_valid).toBe(true);
    console.log(`[E2E] Vector table detected: ${results.vector_table!.length} entries`);

    const initialSP = results.vector_table!.find((v) => v.vector_number === 0);
    expect(initialSP).toBeDefined();
    expect(initialSP!.handler_address).toBe(0x20001000);
    console.log(`[E2E] Initial SP: 0x${initialSP!.handler_address.toString(16)}`);

    // =========================================================================
    // STEP 4: Verify Functions Detected with Argument Annotations
    // =========================================================================
    const functionsWithArgs = results.functions.filter(
      (f) => f.arg_annotations && f.arg_annotations.length > 0
    );

    expect(functionsWithArgs.length).toBeGreaterThan(0);
    console.log(`[E2E] Functions with arg annotations: ${functionsWithArgs.length}`);

    // Verify argument annotation structure
    const funcWithArgs = functionsWithArgs[0];
    const annotation = funcWithArgs.arg_annotations[0];
    expect(annotation).toHaveProperty('call_address');
    expect(annotation).toHaveProperty('function_target');
    expect(annotation).toHaveProperty('args');
    expect(annotation.args.length).toBeGreaterThan(0);

    console.log(`[E2E] Sample argument annotation:`);
    console.log(`  - Call at: 0x${annotation.call_address.toString(16)}`);
    console.log(`  - Target: 0x${annotation.function_target.toString(16)}`);
    console.log(`  - Args: ${annotation.args.length}`);

    // =========================================================================
    // STEP 5: Simulate Adding Comments of Different Types
    // =========================================================================
    const testAddress = results.functions[0].start_address;
    // DbComment requires the composite primary key `${address}_${comment_type}`
    const comments = [
      {
        id: `${testAddress}_standard`,
        address: testAddress,
        text: 'This is a standard comment',
        comment_type: 'standard' as CommentType,
        timestamp: Date.now(),
      },
      {
        id: `${testAddress}_repeatable`,
        address: testAddress,
        text: 'This is a repeatable comment',
        comment_type: 'repeatable' as CommentType,
        timestamp: Date.now(),
      },
      {
        id: `${testAddress + 0x100}_anterior`,
        address: testAddress + 0x100,
        text: 'This is an anterior comment',
        comment_type: 'anterior' as CommentType,
        timestamp: Date.now(),
      },
      {
        id: `${testAddress + 0x200}_block`,
        address: testAddress + 0x200,
        text: 'This is a block comment',
        comment_type: 'block' as CommentType,
        timestamp: Date.now(),
      },
    ];

    await db.saveComments(comments);
    console.log(`[E2E] Added ${comments.length} comments`);

    // Verify comments saved
    const savedComments = await db.getAllComments();
    expect(savedComments.length).toBe(4);

    // =========================================================================
    // STEP 6: Simulate Renaming Vector Handler
    // =========================================================================
    // In real implementation, this would update the vector_table in results
    // For testing, we'll save a renamed vector table entry
    const renamedResetHandler = {
      vector_number: 1,
      handler_address: 0x08000101,
      handler_name: 'CustomResetHandler',
      is_valid: true,
    };

    await db.saveVectorTable([renamedResetHandler]);
    console.log(`[E2E] Renamed vector handler: ${renamedResetHandler.handler_name}`);

    // =========================================================================
    // STEP 7: Save Analysis Results to Database
    // =========================================================================
    // Convert functions to database format
    const dbFunctions = results.functions.map((func) => ({
      address: func.start_address,
      name: func.name || `sub_${func.start_address.toString(16).toUpperCase()}`,
      callers: func.callers,
      callees: func.callees,
      xref_count: func.callers.length,
    }));

    // Convert xrefs to database format
    const dbXrefs = results.xrefs.map((xref) => ({
      id: `${xref.from_addr}_${xref.to_addr}_${xref.xref_type}`,
      from_addr: xref.from_addr,
      to_addr: xref.to_addr,
      xref_type: xref.xref_type,
      instruction: xref.instruction,
      operands: xref.operands,
    }));

    await Promise.all([
      db.saveFunctions(dbFunctions),
      db.saveXrefs(dbXrefs),
      db.setMetadata('baseAddress', EXPECTED_ANALYSIS.baseAddress),
      db.setMetadata('firmwareSize', firmware.length),
      db.setMetadata('totalInstructions', results.total_instructions),
      db.setMetadata('analysisTime', results.analysis_time_ms),
      db.setMetadata('lastModified', Date.now()),
    ]);

    console.log(`[E2E] Saved to database:`);
    console.log(`  - ${dbFunctions.length} functions`);
    console.log(`  - ${dbXrefs.length} xrefs`);
    console.log(`  - ${comments.length} comments`);

    // =========================================================================
    // STEP 8: Verify Database Statistics
    // =========================================================================
    const stats = await db.getStats();
    expect(stats.functions).toBe(dbFunctions.length);
    expect(stats.xrefs).toBe(dbXrefs.length);
    expect(stats.comments).toBe(4);
    expect(stats.lastModified).toBeGreaterThan(0);
    console.log(`[E2E] Database stats:`, stats);

    // =========================================================================
    // STEP 9: Clear Memory and Reload from Database
    // =========================================================================
    analyzer.reset();
    expect(analyzer.is_analyzed()).toBe(false);
    console.log(`[E2E] Analyzer reset`);

    // Load data back from database
    const [loadedFunctions, loadedComments, loadedXrefs, baseAddress, firmwareSize] =
      await Promise.all([
        db.getAllFunctions(),
        db.getAllComments(),
        db.getAllXrefs(),
        db.getMetadata<number>('baseAddress'),
        db.getMetadata<number>('firmwareSize'),
      ]);

    console.log(`[E2E] Loaded from database:`);
    console.log(`  - ${loadedFunctions.length} functions`);
    console.log(`  - ${loadedXrefs.length} xrefs`);
    console.log(`  - ${loadedComments.length} comments`);

    // =========================================================================
    // STEP 10: Verify All Data Persisted Correctly
    // =========================================================================

    // Verify functions
    expect(loadedFunctions.length).toBe(dbFunctions.length);
    expect(loadedFunctions[0]).toHaveProperty('address');
    expect(loadedFunctions[0]).toHaveProperty('name');
    expect(loadedFunctions[0]).toHaveProperty('callers');
    expect(loadedFunctions[0]).toHaveProperty('callees');

    // Verify xrefs
    expect(loadedXrefs.length).toBe(dbXrefs.length);
    expect(loadedXrefs[0]).toHaveProperty('from_addr');
    expect(loadedXrefs[0]).toHaveProperty('to_addr');
    expect(loadedXrefs[0]).toHaveProperty('xref_type');

    // Verify comments - all 4 types
    expect(loadedComments.length).toBe(4);
    const commentTypes = loadedComments.map((c) => c.comment_type);
    expect(commentTypes).toContain('standard');
    expect(commentTypes).toContain('repeatable');
    expect(commentTypes).toContain('anterior');
    expect(commentTypes).toContain('block');

    // Verify metadata
    expect(baseAddress).toBe(EXPECTED_ANALYSIS.baseAddress);
    expect(firmwareSize).toBe(firmware.length);

    // Verify vector table rename persisted
    const loadedVectorEntry = await db.getVectorTableEntry(1);
    expect(loadedVectorEntry).toBeDefined();
    expect(loadedVectorEntry!.handler_name).toBe('CustomResetHandler');

    console.log(`[E2E] ✓ All data verified successfully!`);

    // Cleanup
    analyzer.free();
  });

  it('should handle database export and import', async () => {
    // =========================================================================
    // Setup: Create and save analysis data
    // =========================================================================
    const firmware = generateTestFirmware();
    const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
    const results = analyzer.analyze_from_bytes(firmware);

    const dbFunctions = results.functions.slice(0, 5).map((func) => ({
      address: func.start_address,
      name: func.name || `sub_${func.start_address.toString(16)}`,
      callers: func.callers,
      callees: func.callees,
      xref_count: func.callers.length,
    }));

    const dbComments = [
      {
        id: `${0x08000100}_standard`,
        address: 0x08000100,
        text: 'Test comment',
        comment_type: 'standard' as CommentType,
        timestamp: Date.now(),
      },
    ];

    await Promise.all([db.saveFunctions(dbFunctions), db.saveComments(dbComments)]);

    console.log(`[E2E Export/Import] Initial save complete`);

    // =========================================================================
    // Export database to blob
    // =========================================================================
    const exportBlob = await db.exportToMdb();
    expect(exportBlob).toBeDefined();
    expect(exportBlob.type).toBe('application/json');
    console.log(`[E2E Export/Import] Exported: ${exportBlob.size} bytes`);

    // =========================================================================
    // Clear database
    // =========================================================================
    await db.clear();
    const statsAfterClear = await db.getStats();
    expect(statsAfterClear.functions).toBe(0);
    expect(statsAfterClear.comments).toBe(0);
    console.log(`[E2E Export/Import] Database cleared`);

    // =========================================================================
    // Import database from blob
    // =========================================================================
    await db.importFromMdb(exportBlob);
    console.log(`[E2E Export/Import] Imported from blob`);

    // =========================================================================
    // Verify imported data matches original
    // =========================================================================
    const statsAfterImport = await db.getStats();
    expect(statsAfterImport.functions).toBe(dbFunctions.length);
    expect(statsAfterImport.comments).toBe(dbComments.length);

    const importedFunctions = await db.getAllFunctions();
    expect(importedFunctions.length).toBe(dbFunctions.length);
    expect(importedFunctions[0].address).toBe(dbFunctions[0].address);

    const importedComments = await db.getAllComments();
    expect(importedComments.length).toBe(dbComments.length);
    expect(importedComments[0].text).toBe(dbComments[0].text);

    console.log(`[E2E Export/Import] ✓ Export/Import verified successfully!`);

    // Cleanup
    analyzer.free();
  });

  it('should handle incremental updates', async () => {
    // =========================================================================
    // Initial analysis
    // =========================================================================
    const firmware = generateTestFirmware();
    const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
    const results = analyzer.analyze_from_bytes(firmware);

    const initialFunctions = results.functions.slice(0, 3).map((func) => ({
      address: func.start_address,
      name: func.name || `sub_${func.start_address.toString(16)}`,
      callers: func.callers,
      callees: func.callees,
      xref_count: func.callers.length,
    }));

    await db.saveFunctions(initialFunctions);
    console.log(`[E2E Incremental] Initial save: ${initialFunctions.length} functions`);

    // =========================================================================
    // Add more functions (simulating user renaming/adding)
    // =========================================================================
    const additionalFunctions = results.functions.slice(3, 6).map((func) => ({
      address: func.start_address,
      name: `UserRenamed_${func.start_address.toString(16)}`,
      callers: func.callers,
      callees: func.callees,
      xref_count: func.callers.length,
    }));

    await db.saveFunctions(additionalFunctions);
    console.log(`[E2E Incremental] Added: ${additionalFunctions.length} more functions`);

    // =========================================================================
    // Verify total count
    // =========================================================================
    const allFunctions = await db.getAllFunctions();
    expect(allFunctions.length).toBe(
      initialFunctions.length + additionalFunctions.length
    );

    // Verify renamed function persisted
    const renamedFunc = allFunctions.find((f) => f.name.startsWith('UserRenamed_'));
    expect(renamedFunc).toBeDefined();

    console.log(`[E2E Incremental] ✓ Incremental updates verified!`);

    // Cleanup
    analyzer.free();
  });

  it('should maintain data integrity across multiple save/load cycles', async () => {
    const firmware = generateTestFirmware();
    const analyzer = await createAnalyzer(EXPECTED_ANALYSIS.baseAddress);
    // Analyze firmware to ensure WASM is initialized
    analyzer.analyze_from_bytes(firmware);

    const testComment = {
      id: `${0x08000100}_repeatable`,
      address: 0x08000100,
      text: 'Persistent comment',
      comment_type: 'repeatable' as CommentType,
      timestamp: Date.now(),
    };

    // =========================================================================
    // Cycle 1: Save
    // =========================================================================
    await db.saveComments([testComment]);
    let comments = await db.getAllComments();
    expect(comments[0].text).toBe('Persistent comment');
    console.log(`[E2E Integrity] Cycle 1: Saved comment`);

    // =========================================================================
    // Cycle 2: Update
    // =========================================================================
    testComment.text = 'Updated comment';
    await db.saveComments([testComment]);
    comments = await db.getAllComments();
    expect(comments[0].text).toBe('Updated comment');
    console.log(`[E2E Integrity] Cycle 2: Updated comment`);

    // =========================================================================
    // Cycle 3: Export and reimport
    // =========================================================================
    const exportBlob = await db.exportToMdb();
    await db.clear();
    await db.importFromMdb(exportBlob);
    comments = await db.getAllComments();
    expect(comments[0].text).toBe('Updated comment');
    console.log(`[E2E Integrity] Cycle 3: Exported and reimported`);

    // =========================================================================
    // Verify integrity after all cycles
    // =========================================================================
    expect(comments.length).toBe(1);
    expect(comments[0].address).toBe(testComment.address);
    expect(comments[0].comment_type).toBe(testComment.comment_type);

    console.log(`[E2E Integrity] ✓ Data integrity maintained!`);

    // Cleanup
    analyzer.free();
  });
});
