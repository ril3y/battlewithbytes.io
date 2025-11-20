const fs = require('fs');
const zlib = require('zlib');

// Read and decompress the WASM file
const compressed = fs.readFileSync('./dist/clang.wasm.gz');
const wasmBuffer = zlib.gunzipSync(compressed);

console.log('WASM file size:', wasmBuffer.length, 'bytes');

// Parse WASM binary to find exports
let offset = 8; // Skip magic and version
const wasmExports = [];

while (offset < wasmBuffer.length) {
    const sectionId = wasmBuffer[offset++];

    // Read LEB128 size
    let size = 0;
    let shift = 0;
    let byte;
    const sizeStart = offset;
    do {
        byte = wasmBuffer[offset++];
        size |= (byte & 0x7f) << shift;
        shift += 7;
    } while (byte & 0x80);

    if (sectionId === 7) { // Export section
        console.log('\n=== EXPORT SECTION FOUND ===');
        console.log('Section size:', size, 'bytes');

        const sectionEnd = offset + size;

        // Read export count (LEB128)
        let count = 0;
        shift = 0;
        do {
            byte = wasmBuffer[offset++];
            count |= (byte & 0x7f) << shift;
            shift += 7;
        } while (byte & 0x80);

        console.log('Number of exports:', count);
        console.log('\nExported symbols:');

        for (let i = 0; i < count && offset < sectionEnd; i++) {
            // Read name length (LEB128)
            let nameLen = 0;
            shift = 0;
            do {
                byte = wasmBuffer[offset++];
                nameLen |= (byte & 0x7f) << shift;
                shift += 7;
            } while (byte & 0x80);

            // Read name
            const name = wasmBuffer.toString('utf8', offset, offset + nameLen);
            offset += nameLen;

            // Read kind (1 byte)
            const kind = wasmBuffer[offset++];
            const kindStr = kind === 0 ? 'func' : kind === 1 ? 'table' : kind === 2 ? 'mem' : kind === 3 ? 'global' : 'unknown';

            // Read index (LEB128)
            let index = 0;
            shift = 0;
            do {
                byte = wasmBuffer[offset++];
                index |= (byte & 0x7f) << shift;
                shift += 7;
            } while (byte & 0x80);

            console.log(`  ${i + 1}. ${name} (${kindStr} #${index})`);
            wasmExports.push({ name, kind: kindStr, index });
        }
        break;
    } else {
        // Skip this section
        offset += size;
    }

    if (offset >= wasmBuffer.length) break;
}

console.log('\n=== SUMMARY ===');
console.log('Total exports found:', wasmExports.length);
console.log('\nLooking for specific exports:');
console.log('  _start:', wasmExports.some(e => e.name === '_start') ? '✓ FOUND' : '✗ NOT FOUND');
console.log('  main:', wasmExports.some(e => e.name === 'main') ? '✓ FOUND' : '✗ NOT FOUND');
console.log('  _main:', wasmExports.some(e => e.name === '_main') ? '✓ FOUND' : '✗ NOT FOUND');
console.log('  __main_argc_argv:', wasmExports.some(e => e.name === '__main_argc_argv') ? '✓ FOUND' : '✗ NOT FOUND');

console.log('\nEmscripten-style minified exports (single char):');
const minified = wasmExports.filter(e => e.name.length <= 2);
console.log('  Count:', minified.length);
console.log('  Names:', minified.map(e => e.name).join(', '));
