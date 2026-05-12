import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { IntegrationHttpError } from '../integration-http';

export interface WhatsappOutboundMessage {
  to: string;
  body: string;
  farmId?: string;
  operatorId?: string;
  correlationId?: string;
}

export interface WhatsappSendResult {
  provider: 'twilio';
  messageId: string;
  to: string;
  status: 'accepted' | 'queued' | 'sending' | 'sent' | 'delivered' | 'undelivered' | 'failed';
  queuedAt: string;
  correlationId?: string;
}

export interface WhatsappWebhookPayload {
  From?: string;
  Body?: string;
  MessageSid?: string;
  SmsMessageSid?: string;
  ProfileName?: string;
  WaId?: string;
}

export interface WhatsappInboundMessage {
  provider: 'twilio';
  messageId: string;
  from: string;
  body: string;
  receivedAt: string;
  profileName?: string;
  whatsappId?: string;
}

interface TwilioMessageResponse {
  sid: string;
  to: string;
  status: WhatsappSendResult['status'];
}

@Injectable()
export class WhatsappProvider {
  async sendMessage(message: WhatsappOutboundMessage): Promise<WhatsappSendResult> {
    const config = getTwilioConfig();
    const url = new URL(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`
    );
    const body = new URLSearchParams({
      From: normalizeWhatsappAddress(config.from),
      To: normalizeWhatsappAddress(message.to),
      Body: message.body,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString(
          'base64'
        )}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      throw new IntegrationHttpError(
        `Twilio returned HTTP ${response.status}: ${await response.text()}`,
        'twilio-whatsapp',
        url.toString(),
        response.status
      );
    }

    const data = (await response.json()) as TwilioMessageResponse;
    return {
      provider: 'twilio',
      messageId: data.sid,
      to: data.to,
      status: data.status,
      queuedAt: new Date().toISOString(),
      correlationId: message.correlationId,
    };
  }

  parseIncoming(payload: WhatsappWebhookPayload): WhatsappInboundMessage {
    return {
      provider: 'twilio',
      messageId: payload.MessageSid ?? payload.SmsMessageSid ?? `twilio-inbound-${Date.now()}`,
      from: payload.From ?? '',
      body: payload.Body ?? '',
      receivedAt: new Date().toISOString(),
      profileName: payload.ProfileName,
      whatsappId: payload.WaId,
    };
  }

  validateWebhookSignature(
    webhookUrl: string,
    payload: Record<string, unknown>,
    signature?: string
  ): boolean {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken || !signature) {
      return false;
    }

    const signedPayload = Object.keys(payload)
      .sort()
      .reduce((accumulator, key) => `${accumulator}${key}${String(payload[key])}`, webhookUrl);
    const expected = createHmac('sha1', authToken).update(signedPayload).digest('base64');
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    return (
      signatureBuffer.length === expectedBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedBuffer)
    );
  }
}

function getTwilioConfig(): { accountSid: string; authToken: string; from: string } {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error(
      'Twilio WhatsApp is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM.'
    );
  }

  return { accountSid, authToken, from };
}

function normalizeWhatsappAddress(value: string): string {
  return value.startsWith('whatsapp:') ? value : `whatsapp:${value}`;
}
