'use client';

import React from 'react';

export type GradientType = 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'red';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  gradient: GradientType;
}

const gradientClasses: Record<GradientType, string> = {
  cyan: 'from-brand-start to-brand-end',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  red: 'from-red-500 to-red-600'
};

const iconBgClasses: Record<GradientType, string> = {
  cyan: 'bg-gradient-to-br from-brand-start/10 to-brand-end/10',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100',
  purple: 'bg-gradient-to-br from-purple-50 to-purple-100',
  green: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
  orange: 'bg-gradient-to-br from-orange-50 to-orange-100',
  pink: 'bg-gradient-to-br from-pink-50 to-pink-100',
  red: 'bg-gradient-to-br from-red-50 to-red-100'
};

const iconColorClasses: Record<GradientType, string> = {
  cyan: 'text-brand-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  green: 'text-emerald-600',
  orange: 'text-orange-600',
  pink: 'text-pink-600',
  red: 'text-red-600'
};

export function StatCard({ title, value, change, icon: Icon, gradient }: StatCardProps) {
  const isPositive = !change.startsWith('-');

  return (
    <div
      className="group relative bg-white rounded-xl shadow-card hover:shadow-lg border border-gray-100/50 transition-all duration-300 hover:-translate-y-0.5 p-6"
      role="article"
      aria-label={`${title} statistics`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgClasses[gradient]} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`w-6 h-6 ${iconColorClasses[gradient]}`} aria-hidden={true} />
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
              : 'bg-red-50 text-red-700 ring-1 ring-red-100'
          }`}
          aria-label={`Change: ${change}`}
        >
          {change}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        <p className={`text-3xl font-bold bg-gradient-to-r ${gradientClasses[gradient]} bg-clip-text text-transparent`}>
          {value}
        </p>
      </div>
    </div>
  );
}
