import type { EncryptedEnvelope, Message } from "@kladrichat/contracts";

export class KladrichatClient {
  constructor(private readonly baseUrl: string, private readonly accessToken: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${this.accessToken}`, ...init?.headers } });
    if (!response.ok) throw new Error(`Kladrichat API ${response.status}: ${await response.text()}`);
    return response.json() as Promise<T>;
  }

  sendMessage(conversationId: string, clientMessageId: string, envelope: EncryptedEnvelope) {
    return this.request<{ message: Message; duplicated: boolean }>(`/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ clientMessageId, envelope }) });
  }

  listMessages(conversationId: string, after = 0) {
    return this.request<{ messages: Message[] }>(`/conversations/${conversationId}/messages?after=${after}`);
  }
}
