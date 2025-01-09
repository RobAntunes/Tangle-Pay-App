// utils/memzero.ts

/**
 * Overwrites the contents of the provided Uint8Array with zeros.
 * @param buffer - The Uint8Array to be zeroed out.
 */
export const memzero = (buffer: Uint8Array): void => {
    if (!buffer || !(buffer instanceof Uint8Array)) {
      console.warn("memzero: Provided buffer is not a Uint8Array.");
      return;
    }
  
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = 0;
    }
  };