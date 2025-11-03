/**
 * KpiCard Component Tests (F10)
 * Tests for ARPU, conversion, churn rate calculations
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  KpiCard,
  calculateARPU,
  calculateConversionRate,
  calculateChurnRate,
  calculateMRR,
  calculateLTV,
} from '../KpiCard';
import type { AnalyticsKpi } from '@/types/analytics';

describe('KpiCard', () => {
  it('should render KPI with currency format', () => {
    const kpi: AnalyticsKpi = {
      label: 'Total Revenue',
      value: 50000,
      change: 12.5,
      trend: 'up',
      format: 'currency',
    };

    render(<KpiCard kpi={kpi} />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
  });

  it('should render KPI with percentage format', () => {
    const kpi: AnalyticsKpi = {
      label: 'Conversion Rate',
      value: 3.5,
      change: -0.5,
      trend: 'down',
      format: 'percentage',
    };

    render(<KpiCard kpi={kpi} />);

    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('3.5%')).toBeInTheDocument();
    expect(screen.getByText('0.5%')).toBeInTheDocument(); // abs value
  });

  it('should render KPI with number format', () => {
    const kpi: AnalyticsKpi = {
      label: 'Subscribers',
      value: 1250,
      change: 8.3,
      trend: 'up',
      format: 'number',
    };

    render(<KpiCard kpi={kpi} />);

    expect(screen.getByText('Subscribers')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('8.3%')).toBeInTheDocument();
  });

  it('should display correct trend indicator for upward trend', () => {
    const kpi: AnalyticsKpi = {
      label: 'Revenue',
      value: 1000,
      change: 10,
      trend: 'up',
      format: 'currency',
    };

    const { container } = render(<KpiCard kpi={kpi} />);

    const trendElement = container.querySelector('.text-green-600');
    expect(trendElement).toBeInTheDocument();
  });

  it('should display correct trend indicator for downward trend', () => {
    const kpi: AnalyticsKpi = {
      label: 'Churn Rate',
      value: 2.5,
      change: 0.3,
      trend: 'down',
      format: 'percentage',
    };

    const { container } = render(<KpiCard kpi={kpi} />);

    const trendElement = container.querySelector('.text-red-600');
    expect(trendElement).toBeInTheDocument();
  });

  it('should display stable trend indicator', () => {
    const kpi: AnalyticsKpi = {
      label: 'Active Users',
      value: 500,
      change: 0.1,
      trend: 'stable',
      format: 'number',
    };

    const { container } = render(<KpiCard kpi={kpi} />);

    const trendElement = container.querySelector('.text-muted-foreground');
    expect(trendElement).toBeInTheDocument();
  });

  it('should include aria-describedby for accessibility', () => {
    const kpi: AnalyticsKpi = {
      label: 'MRR',
      value: 45000,
      change: 10.2,
      trend: 'up',
      format: 'currency',
    };

    const { container } = render(<KpiCard kpi={kpi} />);

    const descriptionElement = container.querySelector('#MRR-trend-description');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement).toHaveClass('sr-only');
  });
});

describe('KPI Calculations', () => {
  describe('calculateARPU', () => {
    it('should calculate ARPU correctly', () => {
      const arpu = calculateARPU(50000, 1250);
      expect(arpu).toBe(40);
    });

    it('should return 0 when no users', () => {
      const arpu = calculateARPU(50000, 0);
      expect(arpu).toBe(0);
    });

    it('should handle decimal revenue', () => {
      const arpu = calculateARPU(12345.67, 100);
      expect(arpu).toBeCloseTo(123.46, 2);
    });
  });

  describe('calculateConversionRate', () => {
    it('should calculate conversion rate correctly', () => {
      const rate = calculateConversionRate(150, 5000);
      expect(rate).toBe(3);
    });

    it('should return 0 when no visitors', () => {
      const rate = calculateConversionRate(150, 0);
      expect(rate).toBe(0);
    });

    it('should handle partial conversions', () => {
      const rate = calculateConversionRate(17, 500);
      expect(rate).toBeCloseTo(3.4, 1);
    });
  });

  describe('calculateChurnRate', () => {
    it('should calculate churn rate correctly', () => {
      const rate = calculateChurnRate(25, 1000);
      expect(rate).toBe(2.5);
    });

    it('should return 0 when no users', () => {
      const rate = calculateChurnRate(25, 0);
      expect(rate).toBe(0);
    });

    it('should handle high churn', () => {
      const rate = calculateChurnRate(100, 200);
      expect(rate).toBe(50);
    });
  });

  describe('calculateMRR', () => {
    it('should calculate MRR from active subscriptions', () => {
      const subscriptions = [
        { price: 9.99 },
        { price: 19.99 },
        { price: 49.99 },
      ];

      const mrr = calculateMRR(subscriptions);
      expect(mrr).toBeCloseTo(79.97, 2);
    });

    it('should return 0 for empty subscriptions', () => {
      const mrr = calculateMRR([]);
      expect(mrr).toBe(0);
    });

    it('should handle large number of subscriptions', () => {
      const subscriptions = Array(1000).fill({ price: 10 });
      const mrr = calculateMRR(subscriptions);
      expect(mrr).toBe(10000);
    });
  });

  describe('calculateLTV', () => {
    it('should calculate LTV correctly', () => {
      const ltv = calculateLTV(40, 12, 2.1);
      expect(ltv).toBeCloseTo(1904.76, 2);
    });

    it('should use average lifetime when churn is 0', () => {
      const ltv = calculateLTV(40, 12, 0);
      expect(ltv).toBe(480);
    });

    it('should handle high churn rates', () => {
      const ltv = calculateLTV(50, 6, 10);
      expect(ltv).toBe(500);
    });
  });
});
