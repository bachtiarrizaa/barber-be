import { Injectable, Logger } from '@nestjs/common';
import { Xendit } from 'xendit-node';
import {
  CreateInvoiceParams,
  CreateInvoiceResult,
} from '../interfaces/xendit-invoice.interface';

@Injectable()
export class XenditService {
  private readonly logger = new Logger(XenditService.name);
  private readonly client: Xendit;

  constructor() {
    this.client = new Xendit({
      secretKey: process.env.XENDIT_SECRET_KEY ?? '',
    });
  }

  async createInvoice(
    params: CreateInvoiceParams,
  ): Promise<CreateInvoiceResult> {
    const start = Date.now();
    try {
      const invoice = await this.client.Invoice.createInvoice({
        data: {
          externalId: params.externalId,
          amount: params.amount,
          payerEmail: params.payerEmail,
          description: params.description,
          currency: 'IDR',
        },
      });

      if (!invoice.id || !invoice.invoiceUrl) {
        throw new Error('Xendit invoice response missing id or invoiceUrl');
      }

      this.logger.log(
        `Xendit invoice created: ${invoice.id}, latency: ${Date.now() - start}ms`,
      );

      return {
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoiceUrl,
      };
    } catch (error) {
      this.logger.error(
        `Xendit invoice creation failed, latency: ${Date.now() - start}ms`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  verifyWebhookSignature(callbackToken: string): boolean {
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN ?? '';
    return callbackToken === expectedToken;
  }

  async expireInvoice(invoiceId: string): Promise<void> {
    const start = Date.now();
    try {
      await this.client.Invoice.expireInvoice({ invoiceId });
      this.logger.log(
        `Xendit invoice expired: ${invoiceId}, latency: ${Date.now() - start}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Xendit invoice expire failed: ${invoiceId}, latency: ${Date.now() - start}ms`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
