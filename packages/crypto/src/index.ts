const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
function bytes(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

export async function createConversationKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function encryptText(key: CryptoKey, plaintext: string) {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, encoder.encode(plaintext));
  return { algorithm: "AES-256-GCM.v1" as const, ciphertext: base64(new Uint8Array(ciphertext)), nonce: base64(nonce) };
}

export async function decryptText(key: CryptoKey, envelope: { algorithm: "AES-256-GCM.v1"; ciphertext: string; nonce: string }): Promise<string> {
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(envelope.nonce) }, key, bytes(envelope.ciphertext));
  return decoder.decode(plaintext);
}
