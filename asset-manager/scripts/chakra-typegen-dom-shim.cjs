const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>');
if (typeof globalThis.window === 'undefined') {
  globalThis.window = dom.window;
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = dom.window.document;
}
if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = dom.window.navigator;
}
