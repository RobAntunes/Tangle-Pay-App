import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import _sodium from 'libsodium-wrappers';

export const encryptStringWithXChaCha20Poly1305 = async (data: string) => {
try {
    console.log('Starting encryption...');
    await _sodium.ready;
    const sodium = _sodium;
    console.log('Sodium ready:', sodium.ready);

    // Generate a random key
    const key = sodium.crypto_secretbox_keygen();
    console.log('Key generated');

    // Generate a random nonce
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    console.log('Nonce generated');

    // Convert the string to bytes
    const messageBytes = sodium.from_string(data);
    console.log('Message converted to bytes');

    // Encrypt
    const ciphertext = sodium.crypto_secretbox_easy(messageBytes, nonce, key);
    console.log('Encryption completed');

    // Convert to base64 for transmission
    return {
    key: sodium.to_base64(key),
    nonce: sodium.to_base64(nonce),
    ciphertext: sodium.to_base64(ciphertext)
    };
} catch (error) {
    console.error('Encryption failed:', error);
    console.error('Sodium ready state:', _sodium.ready);
    throw error;
}
};

export const decryptStringFromXChaCha20Poly1305 = async (encryptedData: {
key: string;
nonce: string;
ciphertext: string;
}): Promise<string> => {
try {
    await _sodium.ready;
    const sodium = _sodium;

    // Convert from base64
    const key = sodium.from_base64(encryptedData.key);
    const nonce = sodium.from_base64(encryptedData.nonce);
    const ciphertext = sodium.from_base64(encryptedData.ciphertext);

    // Decrypt
    const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
    return sodium.to_string(decrypted);
} catch (error) {
    console.error('Decryption failed:', error);
    throw error;
}
};
