/**
 * Test the new YoWaspCompiler wrapper
 */

import { getYoWaspCompiler } from '../apps/web/src/app/tools/stm32-ide/lib/compiler/YoWaspCompiler.ts';

async function testYoWaspCompiler() {
  console.log('=== YoWaspCompiler Integration Test ===\n');

  const compiler = getYoWaspCompiler();

  // Test 1: Initialize
  console.log('1. Initializing compiler...');
  await compiler.initialize((progress) => {
    console.log(`   [${progress.stage}] ${progress.progress}%: ${progress.message}`);
  });
  console.log('   ✓ Initialized\n');

  // Test 2: Get version
  console.log('2. Getting version...');
  const version = await compiler.getVersion();
  console.log(`   Version: ${version}\n`);

  // Test 3: Compile simple program
  console.log('3. Compiling simple program...');
  const sourceCode = `
#include <stdint.h>

int main(void) {
  uint32_t result = 42;
  return result;
}
`;

  const result = await compiler.compile(sourceCode, {
    target: 'wasm32',  // Use wasm32 for now since ARM backend not added yet
    optimizationLevel: '-O2',
    outputType: 'object'
  }, (progress) => {
    console.log(`   [${progress.stage}] ${progress.progress}%: ${progress.message}`);
  });

  console.log('   Success:', result.success);
  console.log('   Output size:', result.output?.length || 0, 'bytes');
  console.log('   stdout:', result.stdout || '(empty)');
  console.log('   stderr:', result.stderr || '(empty)');

  console.log('\n=== Test Complete ===');
}

testYoWaspCompiler().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
