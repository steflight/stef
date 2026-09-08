import assert from "node:assert/strict";
import test from "node:test";
import { createConversationKey, decryptText, encryptText } from "../src/index.ts";

test("chiffre et authentifie une enveloppe sans exposer le texte", async () => {
  const key = await createConversationKey();
  const envelope = await encryptText(key, "Décision confidentielle");
  assert.doesNotMatch(envelope.ciphertext, /Décision/);
  assert.equal(await decryptText(key, envelope), "Décision confidentielle");
});
