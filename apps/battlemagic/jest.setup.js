import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// Polyfill TextEncoder/TextDecoder for jsdom (not provided by jest-environment-jsdom@29)
const { TextEncoder, TextDecoder } = require('util')
if (!global.TextEncoder) global.TextEncoder = TextEncoder
if (!global.TextDecoder) global.TextDecoder = TextDecoder

// Polyfill structuredClone for jsdom (required by fake-indexeddb@6)
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))
}

// Polyfill File.arrayBuffer for jsdom (not implemented in older jsdom)
if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = function () {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsArrayBuffer(this)
    })
  }
}
