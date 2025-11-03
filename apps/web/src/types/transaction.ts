export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: Date;
  type: 'subscription' | 'ppv' | 'tip' | 'marketplace';

  creator: {
    name: string;
    email: string;
    avatar?: string;
    fiscalStatus: 'Auto-entrepreneur' | 'SARL' | 'SAS' | 'SASU' | 'EURL' | 'EI';
    siret?: string;
    vatNumber?: string;
    address?: {
      street: string;
      postalCode: string;
      city: string;
      country: string;
    };
  };

  fan: {
    name: string;
    email?: string;
    country: string;
    type?: 'individual' | 'business';
    vatNumber?: string;
  };

  amounts: {
    net: number;        // Montant HT en centimes
    vat: number;        // Montant TVA en centimes
    vatRate: number;    // Taux TVA (0, 5.5, 10, 20)
    gross: number;      // Montant TTC en centimes
    commission: number; // Commission plateforme HT en centimes
    commissionVAT: number; // TVA sur commission en centimes
    creatorNet: number; // Net versé au créateur en centimes
  };

  status: 'completed' | 'pending' | 'failed' | 'refunded';
  reconciled: boolean;

  platform?: {
    name: string;
    siret: string;
    vatNumber: string;
    address: {
      street: string;
      postalCode: string;
      city: string;
      country: string;
    };
    email: string;
    phone: string;
    rcs?: string;
    capital?: number;
    website?: string;
  };
}
