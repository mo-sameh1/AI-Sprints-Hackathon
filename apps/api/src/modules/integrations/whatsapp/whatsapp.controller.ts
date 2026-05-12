import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { WhatsappProvider, WhatsappWebhookPayload } from './whatsapp.provider';

@Controller('integrations/whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappProvider: WhatsappProvider) {}

  @Post('webhook')
  receiveMessage(
    @Body() payload: WhatsappWebhookPayload,
    @Headers('x-twilio-signature') signature?: string
  ) {
    const webhookUrl = process.env.TWILIO_WEBHOOK_URL;
    const shouldValidate = process.env.TWILIO_VALIDATE_WEBHOOKS !== 'false';

    if (shouldValidate && webhookUrl) {
      const valid = this.whatsappProvider.validateWebhookSignature(
        webhookUrl,
        payload as Record<string, unknown>,
        signature
      );
      if (!valid) {
        throw new UnauthorizedException('Invalid Twilio webhook signature');
      }
    }

    return this.whatsappProvider.parseIncoming(payload);
  }
}
