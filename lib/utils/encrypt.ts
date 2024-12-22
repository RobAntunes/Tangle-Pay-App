import _sodium from "libsodium-wrappers";

export const encryptStringWithXChaCha20Poly1305 = async (data: string) => {
  return await (async () => {
    await _sodium.ready;
    const sodium = _sodium;
    const key = sodium.crypto_secretstream_xchacha20poly1305_keygen();
    const res = sodium.crypto_secretstream_xchacha20poly1305_init_push(key);
    const state = res.state;
    const header = res.header;

    const ciphertext = sodium.crypto_secretstream_xchacha20poly1305_push(
      state,
      sodium.from_string(data),
      null,
      sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
    );

    return { header, key, ciphertext };
  })();
};

export const decryptStringFromXChaCha20Poly1305 = async (
  header: Uint8Array,
  key: Uint8Array,
  ciphertext: Uint8Array
): Promise<string> => {
  let result: string;
  return await (async () => {
    await _sodium.ready;
    const sodium = _sodium;

    const state = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
      header,
      key
    );
    const res = sodium.crypto_secretstream_xchacha20poly1305_pull(
      state,
      ciphertext
    );
    result = sodium.to_string(res.message);
    return result;
  })();
};
