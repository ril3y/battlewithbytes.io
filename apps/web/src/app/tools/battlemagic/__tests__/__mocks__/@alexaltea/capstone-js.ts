/**
 * Manual mock for @alexaltea/capstone-js
 *
 * Jest manual mocks must be placed in __mocks__ directory adjacent to node_modules
 * Since Capstone.js uses WebAssembly, it cannot run in Jest's Node environment.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
export default require("../../mocks/MockCapstone").default;
