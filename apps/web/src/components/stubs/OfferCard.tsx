/**
 * OfferCard Stub Component
 * Temporary placeholder until full implementation
 */

interface OfferCardProps {
  offer: any;
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <div className="p-4 border rounded bg-gray-50 text-center">
      <p className="text-lg font-semibold">🧩 OfferCard (stub)</p>
      <p className="text-sm text-muted-foreground mt-2">
        Offer: {offer?.title || 'N/A'}
      </p>
    </div>
  );
}
