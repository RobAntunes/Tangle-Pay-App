import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { Stream } from 'stream-browserify';
import process from 'process';
import * as _sodium from 'libsodium-wrappers';

if (typeof __dirname === 'undefined') global.__dirname = '/';
if (typeof __filename === 'undefined') global.__filename = '';
if (typeof process === 'undefined') {
global.process = process;
global.process.browser = true;
}

if (typeof Buffer === 'undefined') global.Buffer = Buffer;
if (typeof Stream === 'undefined') global.Stream = Stream;

// Initialize libsodium
(async () => {
await _sodium.ready;
global._sodium = _sodium;
})();

// Polyfill for crypto
if (typeof crypto === 'undefined') {
const getRandomValues = require('react-native-get-random-values').default;
global.crypto = {
    getRandomValues,
};
}

const crypto = require('crypto');
global.crypto = {
...global.crypto,
...crypto,
};
