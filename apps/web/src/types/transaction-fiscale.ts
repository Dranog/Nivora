/**
 * Types pour gestion fiscale et comptable conforme CGI/DGFiP
 * @module types/transaction-fiscale
 */

export type FiscalStatus =
  | 'auto_entrepreneur'
  | 'ei'
  | 'eirl'
  | 'eurl'
  | 'sarl'
  | 'sas'
  | 'sasu';

export type TransactionType =
  | 'subscription'
  | 'ppv'
  | 'tip'
  | 'marketplace'
  | 'withdrawal'
  | 'refund';

export type TransactionStatus =
  | 'completed'
  | 'pending'
  | 'failed'
  | 'refunded';

export type JournalCode = 'VE' | 'AC' | 'BQ';

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Creator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  fiscalStatus: FiscalStatus;
  siret?: string;
  vatNumber?: string;
  address: Address;
  country: string;
  isVATRegistered: boolean;
}

export interface Fan {
  id: string;
  name: string;
  email: string;
  country: string;
  type: 'individual' | 'business';
  vatNumber?: string;
}

export interface AccountingLine {
  account: string;
  label: string;
  amount: number;
}

export interface AccountingEntry {
  journal: JournalCode;
  pieceNumber: string;
  debit: AccountingLine[];
  credit: AccountingLine[];
}

export interface TransactionAmounts {
  gross: number;
  net: number;
  vat: number;
  vatRate: number;
  platformCommission: number;
  platformCommissionVAT: number;
  platformCommissionTotal: number;
  stripeFee: number;
  creatorNet: number;
}

export interface FiscalInfo {
  serviceCountry: string;
  vatApplicable: boolean;
  vatRule: string;
  vatExemptionReason?: string;
  b2b: boolean;
  reverseCharge: boolean;
  accountingEntry: AccountingEntry;
}

export interface PaymentInfo {
  method: 'card' | 'sepa' | 'crypto';
  gateway: 'stripe' | 'other';
  transactionId: string;
  cardLast4?: string;
  cardBrand?: string;
}

export interface Documents {
  invoiceUrl?: string;
  receiptUrl?: string;
  vatCertificateUrl?: string;
}

export interface BankReconciliation {
  reconciled: boolean;
  statementRef?: string;
  bankDate?: Date;
  bankAmount?: number;
}

export interface TransactionEvent {
  type: 'created' | 'authorized' | 'captured' | 'completed' | 'failed' | 'refunded';
  message: string;
  date: Date;
  user?: string;
}

export interface TransactionMetadata {
  userAgent?: string;
  ip?: string;
  device?: string;
}

export interface TransactionFiscale {
  id: string;
  invoiceNumber: string;
  fiscalYear: number;
  date: Date;
  type: TransactionType;
  status: TransactionStatus;
  amounts: TransactionAmounts;
  creator: Creator;
  fan: Fan;
  fiscal: FiscalInfo;
  payment: PaymentInfo;
  documents: Documents;
  bankReconciliation: BankReconciliation;
  events: TransactionEvent[];
  metadata: TransactionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface FiscalFilters {
  fiscalYear: number;
  dateFrom: string;
  dateTo: string;
  type: string;
  status: string;
  fiscalStatus: string;
  minAmount: string;
  maxAmount: string;
  search: string;
  reconciled: string;
}

export interface FiscalStats {
  totalRevenue: number;
  totalRevenueHT: number;
  totalVAT: number;
  totalCommission: number;
  totalCommissionVAT: number;
  totalCreatorNet: number;
  transactionCount: number;
  avgTransactionAmount: number;
}
