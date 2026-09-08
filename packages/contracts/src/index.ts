import { z } from "zod";

export const RoleSchema = z.enum(["owner", "admin", "member"]);
export type Role = z.infer<typeof RoleSchema>;

export const EncryptedEnvelopeSchema = z.object({
  algorithm: z.literal("AES-256-GCM.v1"),
  ciphertext: z.string().min(1).max(100_000),
  nonce: z.string().min(1).max(128),
});
export type EncryptedEnvelope = z.infer<typeof EncryptedEnvelopeSchema>;

export const SendMessageSchema = z.object({
  clientMessageId: z.string().uuid(),
  envelope: EncryptedEnvelopeSchema,
});

export interface Message {
  id: string;
  clientMessageId: string;
  conversationId: string;
  senderId: string;
  cursor: number;
  sentAt: string;
  envelope: EncryptedEnvelope;
}

export type RealtimeEvent = {
  version: 1;
  type: "message.created";
  organizationId: string;
  message: Message;
};
