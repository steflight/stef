import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryKladrichat } from "../src/index.ts";

const envelope = { algorithm: "AES-256-GCM.v1" as const, ciphertext: "opaque", nonce: "unique-nonce" };

function team() {
  const service = new InMemoryKladrichat();
  const owner = service.createIdentity("owner@kladriva.com", "Owner");
  const member = service.createIdentity("member@kladriva.com", "Member");
  const outsider = service.createIdentity("outside@example.com", "Outside");
  const organization = service.createOrganization(owner.id, "Kladriva");
  const invitation = service.invite(owner.id, organization.id, member.email);
  service.acceptInvitation(member.id, invitation.token);
  return { service, owner, member, outsider, organization };
}

test("une invitation est liée à l’identité invitée et à usage unique", () => {
  const service = new InMemoryKladrichat();
  const owner = service.createIdentity("owner@example.com", "Owner");
  const invited = service.createIdentity("invited@example.com", "Invited");
  const attacker = service.createIdentity("attacker@example.com", "Attacker");
  const organization = service.createOrganization(owner.id, "Org");
  const invitation = service.invite(owner.id, organization.id, invited.email);
  assert.throws(() => service.acceptInvitation(attacker.id, invitation.token), /autre identité/);
  service.acceptInvitation(invited.id, invitation.token);
  assert.throws(() => service.acceptInvitation(invited.id, invitation.token), /déjà utilisée/);
});

test("l’annuaire et les conversations sont cloisonnés par organisation", () => {
  const { service, owner, member, outsider, organization } = team();
  assert.deepEqual(service.directory(member.id, organization.id).map((i) => i.id).sort(), [owner.id, member.id].sort());
  assert.throws(() => service.directory(outsider.id, organization.id), /Appartenance active/);
  assert.throws(() => service.createPrivateConversation(owner.id, organization.id, outsider.id), /Appartenance active/);
});

test("un message repris est livré une seule fois et un tiers ne peut pas le lire", () => {
  const { service, owner, member, outsider, organization } = team();
  const conversation = service.createPrivateConversation(owner.id, organization.id, member.id);
  const clientMessageId = "72fe1815-8a07-48df-852f-bb42246ef862";
  const first = service.sendMessage(owner.id, conversation.id, clientMessageId, envelope);
  const retry = service.sendMessage(owner.id, conversation.id, clientMessageId, envelope);
  assert.equal(first.created, true);
  assert.equal(retry.created, false);
  assert.equal(retry.message.id, first.message.id);
  assert.equal(service.listMessages(member.id, conversation.id, 0).length, 1);
  assert.equal(service.listMessages(member.id, conversation.id, first.message.cursor).length, 0);
  assert.throws(() => service.listMessages(outsider.id, conversation.id), /Appartenance active/);
});
