export interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail?: string;
  description: string;
}

export interface CreateInvoiceResult {
  invoiceId: string;
  invoiceUrl: string;
}
