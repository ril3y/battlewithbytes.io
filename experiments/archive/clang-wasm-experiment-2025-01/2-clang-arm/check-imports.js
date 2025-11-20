const fs = require('fs');
const zlib = require('zlib');

const compressed = fs.readFileSync('./dist/clang.wasm.gz');
const wasmBuffer = zlib.gunzipSync(compressed);

console.log('Analyzing WASM imports...\n');

// Parse import section (section ID 2)
let offset = 8; // Skip magic and version

while (offset < wasmBuffer.length) {
    const sectionId = wasmBuffer[offset++];
    let size = 0, shift = 0, byte;
    do {
        byte = wasmBuffer[offset++];
        size |= (byte & 0x7f) << shift;
        shift += 7;
    } while (byte & 0x80);

    if (sectionId === 2) { // Import section
        console.log('=== IMPORT SECTION ===');
        const sectionEnd = offset + size;

        let count = 0;
        shift = 0;
        do {
            byte = wasmBuffer[offset++];
            count |= (byte & 0x7f) << shift;
            shift += 7;
        } while (byte & 0x80);

        console.log(`Total imports: ${count}\n`);

        const importsByModule = new Map();

        for (let i = 0; i < count && offset < sectionEnd; i++) {
            // Read module name
            let moduleLen = 0;
            shift = 0;
            do {
                byte = wasmBuffer[offset++];
                moduleLen |= (byte & 0x7f) << shift;
                shift += 7;
            } while (byte & 0x80);
            const moduleName = wasmBuffer.toString('utf8', offset, offset + moduleLen);
            offset += moduleLen;

            // Read field name
            let fieldLen = 0;
            shift = 0;
            do {
                byte = wasmBuffer[offset++];
                fieldLen |= (byte & 0x7f) << shift;
                shift += 7;
            } while (byte & 0x80);
            const fieldName = wasmBuffer.toString('utf8', offset, offset + fieldLen);
            offset += fieldLen;

            // Read kind
            const kind = wasmBuffer[offset++];
            const kindStr = kind === 0 ? 'func' : kind === 1 ? 'table' : kind === 2 ? 'mem' : kind === 3 ? 'global' : 'unknown';

            // Skip type index/limits based on kind
            if (kind === 0) {
                // Function - skip type index
                do { byte = wasmBuffer[offset++]; } while (byte & 0x80);
            } else if (kind === 1) {
                // Table - skip elem type and limits
                offset++; // elem type
                offset++; // flags
                do { byte = wasmBuffer[offset++]; } while (byte & 0x80); // initial
            } else if (kind === 2) {
                // Memory - skip limits
                offset++; // flags
                do { byte = wasmBuffer[offset++]; } while (byte & 0x80); // initial
            } else if (kind === 3) {
                // Global - skip value type and mutability
                offset += 2;
            }

            if (!importsByModule.has(moduleName)) {
                importsByModule.set(moduleName, []);
            }
            importsByModule.get(moduleName).push({ field: fieldName, kind: kindStr });
        }

        // Print grouped by module
        for (const [moduleName, imports] of importsByModule) {
            console.log(`Module: "${moduleName}" (${imports.length} imports)`);
            for (const imp of imports) {
                console.log(`  - ${imp.field} (${imp.kind})`);
            }
            console.log();
        }

        break;
    } else {
        offset += size;
    }
}
