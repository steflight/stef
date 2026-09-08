import { randomUUID } from "node:crypto";
import type { EncryptedEnvelope, Message, Role } from "@kladrichat/contracts";

export class DomainError extends Error {
  readonly code: "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INVALID";
  constructor(code: "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INVALID", message: string) {
    super(message);
    this.code = code;
  }
}

export interface Identity { id: string; email: string; displayName: string }
export interface Membership { organizationId: string; identityId: string; role: Role; active: boolean }
export interface Organization { id: string; name: string }
export interface Invitation { id: string; organizationId: string; email: string; role: Exclude<Role, "owner">; token: string; acceptedAt?: string }
export interface Conversation { id: string; organizationId: string; participantIds: [string, string] }

export class InMemoryKladrichat {
  readonly identities = new Map<string, Identity>();
  readonly organizations = new Map<string, Organization>();
  readonly memberships: Membership[] = [];
  readonly invitations = new Map<string, Invitation>();
  readonly conversations = new Map<string, Conversation>();
  readonly messages: Message[] = [];
  private cursor = 0;

  createIdentity(email: string, displayName: string): Identity {
    const normalized = email.trim().toLowerCase();
    const existing = [...this.identities.values()].find((item) => item.email === normalized);
    if (existing) return existing;
    const identity = { id: randomUUID(), email: normalized, displayName: displayName.trim() };
    this.identities.set(identity.id, identity);
    return identity;
  }

  createOrganization(actorId: string, name: string): Organization {
    this.identity(actorId);
    const organization = { id: randomUUID(), name: name.trim() };
    this.organizations.set(organization.id, organization);
    this.memberships.push({ organizationId: organization.id, identityId: actorId, role: "owner", active: true });
    return organization;
  }

  invite(actorId: string, organizationId: string, email: string, role: "admin" | "member" = "member"): Invitation {
    const actor = this.membership(actorId, organizationId);
    if (actor.role === "member") throw new DomainError("FORBIDDEN", "Seuls les propriétaires et administrateurs invitent des membres");
    const invitation = { id: randomUUID(), organizationId, email: email.trim().toLowerCase(), role, token: randomUUID() };
    this.invitations.set(invitation.token, invitation);
    return invitation;
  }

  acceptInvitation(actorId: string, token: string): Membership {
    const identity = this.identity(actorId);
    const invitation = this.invitations.get(token);
    if (!invitation) throw new DomainError("NOT_FOUND", "Invitation inconnue");
    if (invitation.acceptedAt) throw new DomainError("CONFLICT", "Invitation déjà utilisée");
    if (identity.email !== invitation.email) throw new DomainError("FORBIDDEN", "Cette invitation appartient à une autre identité");
    invitation.acceptedAt = new Date().toISOString();
    const membership = { organizationId: invitation.organizationId, identityId: actorId, role: invitation.role, active: true };
    this.memberships.push(membership);
    return membership;
  }

  directory(actorId: string, organizationId: string): Identity[] {
    this.membership(actorId, organizationId);
    const allowed = new Set(this.memberships.filter((m) => m.organizationId === organizationId && m.active).map((m) => m.identityId));
    return [...allowed].map((id) => this.identity(id));
  }

  createPrivateConversation(actorId: string, organizationId: string, otherId: string): Conversation {
    this.membership(actorId, organizationId);
    this.membership(otherId, organizationId);
    if (actorId === otherId) throw new DomainError("INVALID", "Un dialogue exige deux personnes distinctes");
    const participants = [actorId, otherId].sort() as [string, string];
    const existing = [...this.conversations.values()].find((c) => c.organizationId === organizationId && c.participantIds.join() === participants.join());
    if (existing) return existing;
    const conversation = { id: randomUUID(), organizationId, participantIds: participants };
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  sendMessage(actorId: string, conversationId: string, clientMessageId: string, envelope: EncryptedEnvelope): { message: Message; created: boolean } {
    const conversation = this.conversationFor(actorId, conversationId);
    const duplicate = this.messages.find((m) => m.conversationId === conversationId && m.senderId === actorId && m.clientMessageId === clientMessageId);
    if (duplicate) return { message: duplicate, created: false };
    const message: Message = { id: randomUUID(), clientMessageId, conversationId, senderId: actorId, cursor: ++this.cursor, sentAt: new Date().toISOString(), envelope };
    this.messages.push(message);
    return { message, created: true };
  }

  listMessages(actorId: string, conversationId: string, after = 0): Message[] {
    this.conversationFor(actorId, conversationId);
    return this.messages.filter((m) => m.conversationId === conversationId && m.cursor > after);
  }

  private conversationFor(actorId: string, conversationId: string): Conversation {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) throw new DomainError("NOT_FOUND", "Conversation inconnue");
    this.membership(actorId, conversation.organizationId);
    if (!conversation.participantIds.includes(actorId)) throw new DomainError("FORBIDDEN", "Conversation privée inaccessible");
    return conversation;
  }

  private identity(id: string): Identity {
    const identity = this.identities.get(id);
    if (!identity) throw new DomainError("NOT_FOUND", "Identité inconnue");
    return identity;
  }

  private membership(identityId: string, organizationId: string): Membership {
    const membership = this.memberships.find((m) => m.identityId === identityId && m.organizationId === organizationId && m.active);
    if (!membership) throw new DomainError("FORBIDDEN", "Appartenance active requise");
    return membership;
  }
}
