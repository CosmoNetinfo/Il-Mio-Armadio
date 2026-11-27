import { createRequire } from 'node:module';
const { JSDOM } = createRequire(import.meta.url)('jsdom');
// Node 25 exposes its own localStorage; use actual DOM storage in browser tests.
const storageWindow = new JSDOM('', { url: 'https://armadio.test' }).window;
Object.defineProperty(window, 'localStorage', { configurable: true, value: storageWindow.localStorage });
Object.defineProperty(globalThis, 'Storage', { configurable: true, value: storageWindow.Storage });
