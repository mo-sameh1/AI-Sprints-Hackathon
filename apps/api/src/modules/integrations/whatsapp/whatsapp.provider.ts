import { Injectable } from '@nestjs/common';

export interface WhatsappOutboundMessage {
  to: string;
  body: string;
  farmId?: string;
  operatorId?: string;
  correlationId?: string;
}

export interface WhatsappSendResult {
  provider: 'mock-whatsapp';
  messageId: string;
  to: string;
  status: 'queued' | 'sent' | 'failed';
  queuedAt: string;
  correlationId?: string;
}

export interface WhatsappWebhookPayload {
  from: string;
  body: string;
  providerMessageId?: string;
  receivedAt?: string;
}

export interface WhatsappInboundMessage {
  provider: 'mock-whatsapp';
  messageId: string;
  from: string;
  body: string;
  receivedAt: string;
}

@Injectable()
export class WhatsappProvider {
  sendMessage(message: WhatsappOutboundMessage): WhatsappSendResult {
    return {
      provider: 'mock-whatsapp',
      messageId: `mock-wa-${Date.now()}`,
      to: message.to,
      status: 'queued',
      queuedAt: new Date().toISOString(),
      correlationId: message.correlationId,
    };
  }

  parseIncoming(payload: WhatsappWebhookPayload): WhatsappInboundMessage {
    return {
      provider: 'mock-whatsapp',
      messageId: payload.providerMessageId ?? `mock-inbound-${Date.now()}`,
      from: payload.from,
      body: payload.body,
      receivedAt: payload.receivedAt ?? new Date().toISOString(),
    };
  }
}
