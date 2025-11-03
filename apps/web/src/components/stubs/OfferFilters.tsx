/**
 * OfferFilters Stub Component
 * Temporary placeholder until full implementation
 */

interface OfferFiltersProps {
  filters: any;
  onChange: (filters: any) => void;
}

export function OfferFilters({ filters, onChange }: OfferFiltersProps) {
  return (
    <div className="p-4 border rounded bg-gray-50 text-center">
      <p className="text-lg font-semibold">🧩 OfferFilters (stub)</p>
      <p className="text-sm text-muted-foreground mt-2">
        Component will be implemented in next phase
      </p>
    </div>
  );
}
