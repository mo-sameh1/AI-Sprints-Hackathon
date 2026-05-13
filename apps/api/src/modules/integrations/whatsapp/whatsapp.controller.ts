import { Body, Controller, Headers, Logger, Post, UnauthorizedException } from '@nestjs/common';
import { WhatsappProvider, WhatsappWebhookPayload } from './whatsapp.provider';
import { ReportsService } from '../../reports/reports.service';

@Controller('integrations/whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly whatsappProvider: WhatsappProvider,
    private readonly reportsService: ReportsService,
  ) {}

  @Post('webhook')
  async receiveMessage(
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

    const inbound = this.whatsappProvider.parseIncoming(payload);
    this.logger.log(`Inbound WhatsApp from ${inbound.from}: ${inbound.body.slice(0, 80)}`);

    // Attempt to match sender to an operator and create a status report
    const operatorId = this.resolveOperatorId(inbound.from, inbound.whatsappId);
    if (operatorId && inbound.body.trim().length > 0) {
      try {
        const report = await this.reportsService.submitReport({
          farmId: 'unknown', // operator may specify; parsed from message in future
          operatorId,
          reportType: 'status',
          period: new Date().toISOString().slice(0, 7),
          content: {
            source: 'whatsapp',
            messageId: inbound.messageId,
            rawText: inbound.body,
          },
          notes: `WhatsApp message from ${inbound.profileName ?? inbound.from}: ${inbound.body}`,
        });
        this.logger.log(`Created report ${report.id} from WhatsApp message ${inbound.messageId}`);
      } catch (err) {
        this.logger.warn('Failed to create report from WhatsApp message', err);
      }
    }

    return {
      status: 'received',
      message: inbound,
    };
  }

  /**
   * Map a WhatsApp sender number to an operator ID.
   * In a full implementation this would query the OperatorProfile table.
   * For now, any known-format number maps to a demo operator.
   */
  private resolveOperatorId(from: string, _waId?: string): string | null {
    // Strip whatsapp: prefix
    const phone = from.replace(/^whatsapp:/, '');
    if (phone.length > 0) {
      return `wa-operator-${phone.replace(/\+/g, '')}`;
    }
    return null;
  }
}
