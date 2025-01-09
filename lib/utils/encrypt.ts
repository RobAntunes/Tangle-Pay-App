// cryptography.ts

import "react-native-get-random-values";
import sodium from "react-native-libsodium";
import { memzero } from "../utils/memzero"; // Ensure the correct path

const deriveKeyFromPassword = async (
  password: string,
  existingSalt?: Uint8Array | null
): Promise<{ key: Uint8Array; salt: Uint8Array }> => {
  await sodium.ready;
  const libsodium = sodium;

  try {
    // Define salt length
    const SALT_LENGTH = libsodium.crypto_pwhash_SALTBYTES; // Typically 16 bytes

    // Generate a salt if not provided
    const salt =
      existingSalt && existingSalt.length === SALT_LENGTH
        ? existingSalt
        : libsodium.randombytes_buf(SALT_LENGTH);

    // Derive the key using crypto_pwhash
    const key = libsodium.crypto_pwhash(
      libsodium.crypto_secretbox_KEYBYTES, // Desired key length (usually 32 bytes)
      password, // Password
      salt, // Salt
      libsodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, // Operations limit
      libsodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, // Memory limit
      libsodium.crypto_pwhash_ALG_DEFAULT // Algorithm
    );

    return { key, salt };
  } catch (error) {
    console.error("Key derivation failed:", error);
    throw error;
  }
};

export { deriveKeyFromPassword };

export const encryptStringWithXChaCha20Poly1305 = async (
  data: Uint8Array,
  password: string,
  existingSalt?: Uint8Array
) => {
  await sodium.ready;
  const libsodium = sodium;
  let key: Uint8Array | null = null;

  try {
    console.log("Deriving key from password...");
    // Derive key from password
    const derivedKey = await deriveKeyFromPassword(password, existingSalt);
    key = derivedKey.key;
    console.log("Key derived successfully.");

    // Generate a random nonce
    const nonce = libsodium.randombytes_buf(
      libsodium.crypto_secretbox_NONCEBYTES
    );
    console.log("Generated nonce:", nonce);

    // Encrypt
    console.log("Encrypting data...");
    const ciphertext = libsodium.crypto_secretbox_easy(data, nonce, key);
    console.log("Data encrypted successfully.");

    // Convert to base64 for storage
    return {
      salt: libsodium.to_base64(
        derivedKey.salt,
        libsodium.base64_variants.URLSAFE_NO_PADDING
      ),
      nonce: libsodium.to_base64(
        nonce,
        libsodium.base64_variants.URLSAFE_NO_PADDING
      ),
      ciphertext: libsodium.to_base64(
        ciphertext,
        libsodium.base64_variants.URLSAFE_NO_PADDING
      ),
    };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  } finally {
    // Clean up sensitive data
    if (key) {
      console.log("Zeroing out the key.");
      memzero(key);
    }
  }
};

export const decryptStringFromXChaCha20Poly1305 = async (
  encryptedData: {
    salt: string;
    nonce: string;
    ciphertext: string;
  },
  password: string
): Promise<Uint8Array> => {
  await sodium.ready;
  const libsodium = sodium;
  let key: Uint8Array | null = null;

  try {
    // Convert salt from base64 and derive key
    const salt = libsodium.from_base64(
      encryptedData.salt,
      libsodium.base64_variants.URLSAFE_NO_PADDING
    );
    const derivedKey = await deriveKeyFromPassword(password, salt);
    key = derivedKey.key;

    // Convert from base64
    const nonce = libsodium.from_base64(
      encryptedData.nonce,
      libsodium.base64_variants.URLSAFE_NO_PADDING
    );
    const ciphertext = libsodium.from_base64(
      encryptedData.ciphertext,
      libsodium.base64_variants.URLSAFE_NO_PADDING
    );

    // Decrypt
    const decrypted = libsodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      key
    );
    if (!decrypted) {
      throw new Error("Decryption failed: Invalid ciphertext or key.");
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw error;
  } finally {
    if (key) {
      console.log("Zeroing out the key.");
      memzero(key);
    }
  }
};