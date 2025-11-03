'use client';

import type { Country } from './types';

interface GeographyCardProps {
  countries: Country[];
}

export function GeographyCard({ countries }: GeographyCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Géographie Top 5</h3>

      <div className="space-y-4">
        {countries.map((country) => (
          <div key={country.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl" role="img" aria-label={country.name}>
                  {country.flag}
                </span>
                <span className="text-sm font-medium text-gray-900">{country.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(country.amount)}
                </p>
                <p className="text-xs text-gray-600">{country.percentage}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${country.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
