require('@testing-library/jest-dom')

// Mock MessagePort and MessageChannel for Web Worker tests
class MockMessagePort {
  constructor() {
    this.onmessage = null;
    this.onmessageerror = null;
  }
  postMessage() {}
  start() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
}

class MockMessageChannel {
  constructor() {
    this.port1 = new MockMessagePort();
    this.port2 = new MockMessagePort();
  }
}

global.MessagePort = global.MessagePort || MockMessagePort;
global.MessageChannel = global.MessageChannel || MockMessageChannel;

// Mock TextEncoder/TextDecoder for jsdom (must be before undici)
global.TextEncoder = global.TextEncoder || require('util').TextEncoder
global.TextDecoder = global.TextDecoder || require('util').TextDecoder

// Add web streams API for undici (jsdom doesn't provide these)
const { ReadableStream, WritableStream, TransformStream } = require('stream/web')
global.ReadableStream = global.ReadableStream || ReadableStream
global.WritableStream = global.WritableStream || WritableStream
global.TransformStream = global.TransformStream || TransformStream

// Enable native fetch for Node 18+ (needed for network tests)
// Note: Node 18+ has native fetch, but jsdom environment doesn't expose it
if (!global.fetch) {
  const { fetch, Headers, Request, Response } = require('undici')
  global.fetch = fetch
  global.Headers = Headers
  global.Request = Request
  global.Response = Response
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock WebAssembly
global.WebAssembly = {
  ...global.WebAssembly,
  compile: jest.fn(),
  instantiate: jest.fn(),
}

// Suppress console errors during tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
