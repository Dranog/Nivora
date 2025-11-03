'use client';

import { Globe } from 'lucide-react';
import type { CountryData } from './types';

interface GeographyListProps {
  countries: CountryData[];
}

export function GeographyList({ countries }: GeographyListProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-gray-700" aria-hidden={true} />
        <h3 className="text-base font-semibold text-gray-900">Géographie</h3>
      </div>

      <div className="space-y-4">
        {countries.map((country) => (
          <div key={country.code}>
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
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${country.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
