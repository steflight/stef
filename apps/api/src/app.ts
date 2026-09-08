import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { SendMessageSchema, type RealtimeEvent } from "@kladrichat/contracts";
import { DomainError, InMemoryKladrichat } from "@kladrichat/domain";
import Fastify from "fastify";
import { z } from "zod";

const identitySchema = z.object({ email: z.string().email(), displayName: z.string().min(1).max(80) });
const organizationSchema = z.object({ name: z.string().min(1).max(120) });
const inviteSchema = z.object({ email: z.string().email(), role: z.enum(["admin", "member"]).default("member") });
const privateConversationSchema = z.object({ otherIdentityId: z.string().uuid() });

export function buildApp(service = new InMemoryKladrichat()) {
  const app = Fastify({ logger: false });
  const sockets = new Map<string, Set<{ send(data: string): void; readyState: number }>>();
  app.register(cors, { origin: true });
  app.register(websocket);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof DomainError) {
      const status = error.code === "FORBIDDEN" ? 403 : error.code === "NOT_FOUND" ? 404 : 409;
      return reply.status(status).send({ error: error.code, message: error.message });
    }
    if (error instanceof z.ZodError) return reply.status(400).send({ error: "INVALID", issues: error.issues });
    return reply.status(500).send({ error: "INTERNAL" });
  });

  function actor(request: { headers: { authorization?: string } }): string {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token || !service.identities.has(token)) throw new DomainError("FORBIDDEN", "Session requise");
    return token;
  }

  app.get("/health", async () => ({ status: "ok", storage: "memory" }));
  // Session de développement explicite : à remplacer par OIDC/passkeys avant production.
  app.post("/dev/sessions", async (request) => {
    const input = identitySchema.parse(request.body);
    const identity = service.createIdentity(input.email, input.displayName);
    return { accessToken: identity.id, identity };
  });
  app.post("/organizations", async (request) => ({ organization: service.createOrganization(actor(request), organizationSchema.parse(request.body).name) }));
  app.post<{ Params: { organizationId: string } }>("/organizations/:organizationId/invitations", async (request) => {
    const input = inviteSchema.parse(request.body);
    return { invitation: service.invite(actor(request), request.params.organizationId, input.email, input.role) };
  });
  app.post<{ Params: { token: string } }>("/invitations/:token/accept", async (request) => ({ membership: service.acceptInvitation(actor(request), request.params.token) }));
  app.get<{ Params: { organizationId: string } }>("/organizations/:organizationId/directory", async (request) => ({ identities: service.directory(actor(request), request.params.organizationId) }));
  app.post<{ Params: { organizationId: string } }>("/organizations/:organizationId/private-conversations", async (request) => ({ conversation: service.createPrivateConversation(actor(request), request.params.organizationId, privateConversationSchema.parse(request.body).otherIdentityId) }));
  app.get<{ Params: { conversationId: string }; Querystring: { after?: string } }>("/conversations/:conversationId/messages", async (request) => ({ messages: service.listMessages(actor(request), request.params.conversationId, Number(request.query.after ?? 0)) }));
  app.post<{ Params: { conversationId: string } }>("/conversations/:conversationId/messages", async (request) => {
    const actorId = actor(request);
    const input = SendMessageSchema.parse(request.body);
    const result = service.sendMessage(actorId, request.params.conversationId, input.clientMessageId, input.envelope);
    if (result.created) {
      const conversation = service.conversations.get(request.params.conversationId)!;
      const event: RealtimeEvent = { version: 1, type: "message.created", organizationId: conversation.organizationId, message: result.message };
      for (const participant of conversation.participantIds) for (const socket of sockets.get(participant) ?? []) if (socket.readyState === 1) socket.send(JSON.stringify(event));
    }
    return { message: result.message, duplicated: !result.created };
  });
  app.get("/realtime", { websocket: true }, (socket, request) => {
    const url = new URL(request.url, "http://localhost");
    const actorId = url.searchParams.get("access_token");
    if (!actorId || !service.identities.has(actorId)) return socket.close(1008, "Session requise");
    const identitySockets = sockets.get(actorId) ?? new Set();
    identitySockets.add(socket);
    sockets.set(actorId, identitySockets);
    socket.on("close", () => identitySockets.delete(socket));
  });

  return { app, service };
}
