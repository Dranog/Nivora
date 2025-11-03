'use client';

interface BalanceCardProps {
  available: number;
  pending: number;
}

export function BalanceCard({ available, pending }: BalanceCardProps) {
  const formattedAvailable = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(available);

  const formattedPending = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(pending);

  return (
    <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl p-8 text-white shadow-lg h-[200px] flex flex-col justify-between transition-all hover:shadow-xl">
      <div>
        <p className="text-sm opacity-90">Balance Disponible</p>
        <h2 className="text-4xl font-bold mt-2">{formattedAvailable}</h2>
        <p className="text-xs opacity-80 mt-1">
          Disponible pour retrait • {formattedPending} en attente
        </p>
      </div>
      <button
        className="self-start bg-white text-cyan-600 px-6 py-2 rounded-lg font-semibold hover:shadow-md transition-all"
        aria-label="Retirer les fonds"
      >
        Retirer les fonds
      </button>
    </div>
  );
}
