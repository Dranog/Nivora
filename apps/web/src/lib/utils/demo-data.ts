/**
 * Générateur de données de démonstration conformes
 * @module lib/utils/demo-data
 */

import { TransactionFiscale, FiscalStatus, TransactionType, TransactionStatus } from '@/types/transaction-fiscale';
import { generateInvoiceNumber, getVATRate, getVATRule, calculateVAT } from './fiscal';
import { generateAccountingEntry } from './accounting';

const creators = [
  {
    id: 'creator-1',
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    fiscalStatus: 'auto_entrepreneur' as FiscalStatus,
    siret: '12345678901234',
    country: 'FR',
    isVATRegistered: false,
    address: {
      street: '15 rue de la République',
      postalCode: '75001',
      city: 'Paris',
      country: 'FR',
    },
  },
  {
    id: 'creator-2',
    name: 'Lucas Dubois',
    email: 'lucas.dubois@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    fiscalStatus: 'sasu' as FiscalStatus,
    siret: '98765432109876',
    vatNumber: 'FR12987654321',
    country: 'FR',
    isVATRegistered: true,
    address: {
      street: '42 avenue des Champs',
      postalCode: '69001',
      city: 'Lyon',
      country: 'FR',
    },
  },
  {
    id: 'creator-3',
    name: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    fiscalStatus: 'sarl' as FiscalStatus,
    siret: '55544433322211',
    vatNumber: 'FR98555444333',
    country: 'FR',
    isVATRegistered: true,
    address: {
      street: '8 boulevard Victor Hugo',
      postalCode: '33000',
      city: 'Bordeaux',
      country: 'FR',
    },
  },
];

const fans = [
  {
    id: 'fan-1',
    name: 'Alexandre Rousseau',
    email: 'alex.r@example.com',
    country: 'FR',
    type: 'individual' as const,
  },
  {
    id: 'fan-2',
    name: 'Julie Lefebvre',
    email: 'julie.l@example.com',
    country: 'DE',
    type: 'individual' as const,
  },
  {
    id: 'fan-3',
    name: 'Tech Corp SARL',
    email: 'contact@techcorp.de',
    country: 'DE',
    type: 'business' as const,
    vatNumber: 'DE123456789',
  },
  {
    id: 'fan-4',
    name: 'Thomas Bernard',
    email: 'thomas.b@example.com',
    country: 'US',
    type: 'individual' as const,
  },
];

const types: TransactionType[] = ['subscription', 'ppv', 'tip', 'marketplace'];
const statuses: TransactionStatus[] = ['completed', 'pending', 'failed'];

/**
 * Génère une transaction fiscale de démonstration
 */
export function generateDemoTransaction(index: number, fiscalYear: number): TransactionFiscale {
  const creator = creators[Math.floor(Math.random() * creators.length)];
  const fan = fans[Math.floor(Math.random() * fans.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const status: TransactionStatus = index % 10 === 0 ? 'failed' : 'completed';

  // Calculs montants
  const amountHT = Math.floor(Math.random() * 50000) + 1000; // 10€ à 500€
  const isB2B = fan.type === 'business';
  const hasVATNumber = Boolean(fan.vatNumber);
  const vatRate = getVATRate('FR', fan.country, isB2B, hasVATNumber);
  const vat = calculateVAT(amountHT, vatRate);
  const gross = amountHT + vat;

  const commissionRate = 15;
  const platformCommission = Math.round(amountHT * (commissionRate / 100));
  const platformCommissionVATRate = 20;
  const platformCommissionVAT = calculateVAT(platformCommission, platformCommissionVATRate);
  const platformCommissionTotal = platformCommission + platformCommissionVAT;

  const stripeFee = Math.round(gross * 0.014) + 25; // 1.4% + 0.25€
  const creatorNet = gross - platformCommissionTotal - stripeFee;

  const date = new Date(fiscalYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

  const tx: TransactionFiscale = {
    id: `tx-${fiscalYear}-${index}`,
    invoiceNumber: generateInvoiceNumber(fiscalYear, index),
    fiscalYear,
    date,
    type,
    status,
    amounts: {
      gross,
      net: amountHT,
      vat,
      vatRate,
      platformCommission,
      platformCommissionVAT,
      platformCommissionTotal,
      stripeFee,
      creatorNet,
    },
    creator,
    fan,
    fiscal: {
      serviceCountry: 'FR',
      vatApplicable: vatRate > 0,
      vatRule: getVATRule('FR', fan.country, isB2B, hasVATNumber),
      b2b: isB2B,
      reverseCharge: isB2B && hasVATNumber && fan.country !== 'FR',
      accountingEntry: {
        journal: 'VE',
        pieceNumber: '',
        debit: [],
        credit: [],
      },
    },
    payment: {
      method: 'card',
      gateway: 'stripe',
      transactionId: `ch_${Math.random().toString(36).substring(7)}`,
      cardLast4: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      cardBrand: ['Visa', 'Mastercard', 'Amex'][Math.floor(Math.random() * 3)],
    },
    documents: {
      invoiceUrl: `/invoices/${fiscalYear}/${index}.pdf`,
      receiptUrl: `/receipts/${fiscalYear}/${index}.pdf`,
    },
    bankReconciliation: {
      reconciled: Math.random() > 0.3,
      statementRef: Math.random() > 0.5 ? `REL-${fiscalYear}-${index}` : undefined,
      bankDate: Math.random() > 0.5 ? new Date(date.getTime() + 86400000) : undefined,
      bankAmount: Math.random() > 0.5 ? gross : undefined,
    },
    events: [
      {
        type: 'created',
        message: 'Transaction créée',
        date: new Date(date.getTime() - 1000),
      },
      {
        type: 'authorized',
        message: 'Paiement autorisé',
        date: new Date(date.getTime() + 500),
      },
      {
        type: status === 'completed' ? 'completed' : 'failed',
        message: status === 'completed' ? 'Transaction complétée' : 'Paiement échoué',
        date: new Date(date.getTime() + 2000),
      },
    ],
    metadata: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      device: 'desktop',
    },
    createdAt: date,
    updatedAt: date,
  };

  // Générer les écritures comptables
  tx.fiscal.accountingEntry = generateAccountingEntry(tx);

  return tx;
}

/**
 * Génère un ensemble de transactions de démonstration
 */
export function generateDemoTransactions(count: number, fiscalYear: number): TransactionFiscale[] {
  return Array.from({ length: count }, (_, i) => generateDemoTransaction(i + 1, fiscalYear));
}
