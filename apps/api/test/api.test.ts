import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../src/app.ts";

test("parcours API invitation, dialogue chiffré et reprise idempotente", async () => {
  const { app } = buildApp();
  const session = async (email: string) => (await app.inject({ method: "POST", url: "/dev/sessions", payload: { email, displayName: email } })).json();
  const owner = await session("owner@example.com");
  const member = await session("member@example.com");
  const auth = (token: string) => ({ authorization: `Bearer ${token}` });
  const organization = (await app.inject({ method: "POST", url: "/organizations", headers: auth(owner.accessToken), payload: { name: "Kladriva" } })).json().organization;
  const invitation = (await app.inject({ method: "POST", url: `/organizations/${organization.id}/invitations`, headers: auth(owner.accessToken), payload: { email: "member@example.com" } })).json().invitation;
  assert.equal((await app.inject({ method: "POST", url: `/invitations/${invitation.token}/accept`, headers: auth(member.accessToken) })).statusCode, 200);
  const conversation = (await app.inject({ method: "POST", url: `/organizations/${organization.id}/private-conversations`, headers: auth(owner.accessToken), payload: { otherIdentityId: member.identity.id } })).json().conversation;
  const payload = { clientMessageId: "69818865-18d7-49c4-97fe-45288a7d38c6", envelope: { algorithm: "AES-256-GCM.v1", ciphertext: "opaque", nonce: "nonce" } };
  const first = await app.inject({ method: "POST", url: `/conversations/${conversation.id}/messages`, headers: auth(owner.accessToken), payload });
  const retry = await app.inject({ method: "POST", url: `/conversations/${conversation.id}/messages`, headers: auth(owner.accessToken), payload });
  assert.equal(first.statusCode, 200);
  assert.equal(retry.json().duplicated, true);
  const received = (await app.inject({ method: "GET", url: `/conversations/${conversation.id}/messages?after=0`, headers: auth(member.accessToken) })).json().messages;
  assert.equal(received.length, 1);
  assert.equal(received[0].envelope.ciphertext, "opaque");
  await app.close();
});

test("refuse l’accès d’une autre organisation", async () => {
  const { app, service } = buildApp();
  const alice = service.createIdentity("alice@example.com", "Alice");
  const bob = service.createIdentity("bob@example.com", "Bob");
  const org = service.createOrganization(alice.id, "A");
  service.createOrganization(bob.id, "B");
  const response = await app.inject({ method: "GET", url: `/organizations/${org.id}/directory`, headers: { authorization: `Bearer ${bob.id}` } });
  assert.equal(response.statusCode, 403);
  await app.close();
});
