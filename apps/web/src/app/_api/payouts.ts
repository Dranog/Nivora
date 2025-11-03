// apps/web/src/app/_api/payouts.ts
// Shim frontal minimal pour le panneau Revenus/Wallet.
// S'aligne sur les imports: `import * as payouts from "@/lib/api/payouts"`

export type WalletInfo = {
  available: number;       // en cents
  pendingClear: number;    // en cents
  inReserve: number;       // en cents
};

export type NextRelease = { date: string; amount: number }; // amount en cents

export type PayoutsResponse = {
  wallet: WalletInfo;
  nextReleases: NextRelease[];
  eligibleModes: ("STANDARD" | "EXPRESS_FIAT" | "EXPRESS_CRYPTO")[];
};

// Mock simple (aucun backend touché)
export async function me(): Promise<PayoutsResponse> {
  return {
    wallet: {
      available: 113400,      // €1,134.00
      pendingClear: 89000,    // €890.00
      inReserve: 24500,       // €245.00
    },
    nextReleases: [
      { date: "2025-10-17", amount: 89000 },
      { date: "2025-10-30", amount: 24500 },
    ],
    eligibleModes: ["STANDARD", "EXPRESS_FIAT", "EXPRESS_CRYPTO"],
  };
}

// Placeholders si plus tard tu ajoutes des actions UI
export async function requestStandard(): Promise<{ ok: true }> { return { ok: true }; }
export async function requestExpressFiat(): Promise<{ ok: true }> { return { ok: true }; }
export async function withdrawCrypto(): Promise<{ ok: true }> { return { ok: true }; }
