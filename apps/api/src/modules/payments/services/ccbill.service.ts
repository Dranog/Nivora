import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class CCBillService {
  private readonly clientAccnum = process.env.CCBILL_ACCOUNT_NUMBER;
  private readonly clientSubacc = process.env.CCBILL_SUBACCOUNT_NUMBER;
  private readonly formName = process.env.CCBILL_FORM_NAME;
  private readonly salt = process.env.CCBILL_SALT;

  /**
   * Générer URL de paiement CCBill FlexForms
   */
  generatePaymentUrl(params: {
    amount: number;
    currency: string;
    userId: string;
    type: 'tip' | 'unlock';
    metadata: Record<string, any>;
  }): string {
    const {
      amount,
      currency = 'EUR',
      userId,
      type,
      metadata,
    } = params;

    // Générer hash de sécurité CCBill
    const formDigest = this.generateFormDigest(amount, currency);

    // Construire URL
    const baseUrl = 'https://api.ccbill.com/wap-frontflex/flexforms';

    const queryParams = new URLSearchParams({
      clientAccnum: this.clientAccnum || '',
      clientSubacc: this.clientSubacc || '',
      formName: this.formName || '',
      formDigest,
      initialPrice: amount.toString(),
      initialPeriod: '2', // 2 jours (pour tips one-time)
      currencyCode: currency === 'EUR' ? '978' : '840', // EUR ou USD

      // Metadata custom
      userId,
      transactionType: type,
      ...Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [`metadata_${k}`, String(v)])
      ),
    });

    return `${baseUrl}/${this.formName}?${queryParams}`;
  }

  /**
   * Générer hash de sécurité CCBill
   */
  private generateFormDigest(amount: number, currency: string): string {
    const data = `${amount}${currency}${this.clientSubacc}${this.salt}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Vérifier postback CCBill (webhook)
   */
  verifyPostback(data: any): boolean {
    const { subscription_id, accountingAmount, salt } = data;

    const expectedHash = crypto
      .createHash('md5')
      .update(`${subscription_id}1${this.salt}`)
      .digest('hex');

    return expectedHash === data.responseDigest;
  }

  /**
   * Dynamic Pricing API (pour montants variables)
   */
  async createDynamicTransaction(params: {
    amount: number;
    currency: string;
    description: string;
    userId: string;
    metadata: Record<string, any>;
  }): Promise<{ transactionId: string; url: string }> {
    const response = await axios.post(
      'https://api.ccbill.com/transactions/payment-tokens',
      {
        clientAccnum: this.clientAccnum,
        clientSubacc: this.clientSubacc,
        initialPrice: params.amount,
        initialPeriod: 2,
        currencyCode: params.currency === 'EUR' ? 978 : 840,
        customerInfo: {
          customerFname: 'User',
          customerLname: params.userId,
        },
        customData: JSON.stringify(params.metadata),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CCBILL_API_TOKEN}`,
        },
      }
    );

    return {
      transactionId: response.data.paymentTokenId,
      url: response.data.paymentUrl,
    };
  }
}
