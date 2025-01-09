import { blake3 } from "@noble/hashes/blake3";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { words as WORD_LIST } from "./words";

const WORD_COUNT = 24; // 256-bit security
const BITS_PER_WORD = 11; // 2048 = 2^11

export class MnemonicGenerator {
  /**
   * Converts a master seed to a 24-word mnemonic phrase
   */
  static seedToMnemonic(masterSeed: bigint): string {
    // Convert the master seed to bytes
    const seedHex = masterSeed.toString(16).padStart(64, "0");
    const seedBytes = new Uint8Array(32); // 256 bits
    for (let i = 0; i < 32; i++) {
      seedBytes[i] = parseInt(seedHex.slice(i * 2, (i + 1) * 2), 16);
    }

    // Calculate checksum using first byte of blake3(seed)
    const checksumByte = blake3(seedBytes)[0];

    // Combine seed bytes and checksum into binary string
    let binaryStr = "";
    for (const byte of seedBytes) {
      binaryStr += byte.toString(2).padStart(8, "0");
    }
    binaryStr += checksumByte.toString(2).padStart(8, "0");

    // Split into 11-bit chunks and convert to words
    const words: string[] = [];
    for (let i = 0; i < WORD_COUNT; i++) {
      const start = i * BITS_PER_WORD;
      const chunk = binaryStr.slice(start, start + BITS_PER_WORD);
      const index = parseInt(chunk, 2);
      words.push(WORD_LIST[index]);
    }

    return words.join(" ");
  }

  /**
   * Converts a mnemonic phrase back to a master seed
   * Throws error if mnemonic is invalid
   */
  static mnemonicToSeed(mnemonic: string): bigint {
    const words = mnemonic.toLowerCase().trim().split(/\s+/);

    // Validate word count
    if (words.length !== WORD_COUNT) {
      throw new Error(
        `Invalid mnemonic length: expected ${WORD_COUNT} words, got ${words.length}`
      );
    }

    // Convert words to binary string
    let binaryStr = "";
    for (const word of words) {
      const index = WORD_LIST.indexOf(word);
      if (index === -1) {
        throw new Error(`Invalid word in mnemonic: ${word}`);
      }
      binaryStr += index.toString(2).padStart(BITS_PER_WORD, "0");
    }

    // Separate seed data and checksum
    const seedBinary = binaryStr.slice(0, 256);
    const checksumBinary = binaryStr.slice(256);

    // Convert binary seed to bytes
    const seedBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      const byte = seedBinary.slice(i * 8, (i + 1) * 8);
      seedBytes[i] = parseInt(byte, 2);
    }

    // Verify checksum
    const calculatedChecksum = blake3(seedBytes)[0];
    const providedChecksum = parseInt(checksumBinary, 2);

    if (calculatedChecksum !== providedChecksum) {
      throw new Error("Invalid mnemonic checksum");
    }

    // Convert to BigInt
    return BigInt("0x" + bytesToHex(seedBytes));
  }

  /**
   * Generates a new random mnemonic phrase
   */
  static generateMnemonic(): string {
    const entropy = randomBytes(32); // 256 bits of entropy
    const seed = BigInt("0x" + bytesToHex(entropy));
    return this.seedToMnemonic(seed);
  }

  /**
   * Validates a mnemonic phrase without converting it
   */
  static validateMnemonic(mnemonic: string): boolean {
    try {
      this.mnemonicToSeed(mnemonic);
      return true;
    } catch {
      return false;
    }
  }
}
