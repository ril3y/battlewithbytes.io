const fs = require('fs');
const zlib = require('zlib');

const compressed = fs.readFileSync('./public/wasm/clang.wasm.gz');
const wasmBuffer = zlib.gunzipSync(compressed);

console.log('WASM size:', (wasmBuffer.length / 1024 / 1024).toFixed(2), 'MB');

// Quick check for _start export
let offset = 8;
while (offset < wasmBuffer.length) {
    const sectionId = wasmBuffer[offset++];
    let size = 0, shift = 0, byte;
    do {
        byte = wasmBuffer[offset++];
        size |= (byte & 0x7f) << shift;
        shift += 7;
    } while (byte & 0x80);

    if (sectionId === 7) {
        const sectionEnd = offset + size;
        let count = 0;
        shift = 0;
        do {
            byte = wasmBuffer[offset++];
            count |= (byte & 0x7f) << shift;
            shift += 7;
        } while (byte & 0x80);

        console.log('Total exports:', count);
        const foundExports = [];

        for (let i = 0; i < count && offset < sectionEnd; i++) {
            let nameLen = 0;
            shift = 0;
            do {
                byte = wasmBuffer[offset++];
                nameLen |= (byte & 0x7f) << shift;
                shift += 7;
            } while (byte & 0x80);

            const name = wasmBuffer.toString('utf8', offset, offset + nameLen);
            offset += nameLen + 1; // Skip kind

            let index = 0;
            shift = 0;
            do {
                byte = wasmBuffer[offset++];
                index |= (byte & 0x7f) << shift;
                shift += 7;
            } while (byte & 0x80);

            foundExports.push(name);
        }

        console.log('Exports:', foundExports.join(', '));
        console.log('\n_start found:', foundExports.includes('_start') ? '✓ YES' : '✗ NO');
        break;
    } else {
        offset += size;
    }
}
