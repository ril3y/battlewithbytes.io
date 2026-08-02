const { TextEncoder, TextDecoder } = require('util')

Object.assign(globalThis, { TextEncoder, TextDecoder })

// jest's jsdom environment hides Node's structuredClone; fake-indexeddb
// needs it and it must survive ArrayBuffers, so use a v8 round-trip
if (typeof globalThis.structuredClone !== 'function') {
    const v8 = require('node:v8')
    globalThis.structuredClone = (value) => v8.deserialize(v8.serialize(value))
}

// jsdom's File/Blob lack arrayBuffer(); the flash tooling relies on it
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function () {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = () => reject(reader.error)
            reader.readAsArrayBuffer(this)
        })
    }
}
