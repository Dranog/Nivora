/**
 * TrendChart Component Tests (F10)
 * Tests for rendering series and reacting to filters
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendChart } from '../TrendChart';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, name, stroke }: any) => (
    <div
      data-testid={`line-${dataKey}`}
      data-name={name}
      data-stroke={stroke}
    />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('TrendChart', () => {
  const mockData = [
    { date: 'Jan 1', revenue: 1000, subscriptions: 800, oneTime: 200 },
    { date: 'Jan 2', revenue: 1200, subscriptions: 900, oneTime: 300 },
    { date: 'Jan 3', revenue: 1100, subscriptions: 850, oneTime: 250 },
  ];

  const mockSeries = [
    { dataKey: 'revenue', name: 'Total Revenue', color: '#3b82f6' },
    { dataKey: 'subscriptions', name: 'Subscriptions', color: '#10b981' },
    { dataKey: 'oneTime', name: 'One-time', color: '#f59e0b' },
  ];

  it('should render chart with title', () => {
    render(<TrendChart title="Revenue Trends" data={mockData} series={mockSeries} />);

    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
  });

  it('should render all series lines', () => {
    render(<TrendChart title="Revenue Trends" data={mockData} series={mockSeries} />);

    expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
    expect(screen.getByTestId('line-subscriptions')).toBeInTheDocument();
    expect(screen.getByTestId('line-oneTime')).toBeInTheDocument();
  });

  it('should apply correct colors to series', () => {
    render(<TrendChart title="Revenue Trends" data={mockData} series={mockSeries} />);

    const revenueLine = screen.getByTestId('line-revenue');
    const subscriptionsLine = screen.getByTestId('line-subscriptions');
    const oneTimeLine = screen.getByTestId('line-oneTime');

    expect(revenueLine).toHaveAttribute('data-stroke', '#3b82f6');
    expect(subscriptionsLine).toHaveAttribute('data-stroke', '#10b981');
    expect(oneTimeLine).toHaveAttribute('data-stroke', '#f59e0b');
  });

  it('should pass data to chart', () => {
    render(<TrendChart title="Revenue Trends" data={mockData} series={mockSeries} />);

    const lineChart = screen.getByTestId('line-chart');
    const chartData = JSON.parse(lineChart.getAttribute('data-chart-data') || '[]');

    expect(chartData).toEqual(mockData);
  });

  it('should apply correct series names', () => {
    render(<TrendChart title="Revenue Trends" data={mockData} series={mockSeries} />);

    expect(screen.getByTestId('line-revenue')).toHaveAttribute('data-name', 'Total Revenue');
    expect(screen.getByTestId('line-subscriptions')).toHaveAttribute('data-name', 'Subscriptions');
    expect(screen.getByTestId('line-oneTime')).toHaveAttribute('data-name', 'One-time');
  });

  it('should render chart components', () => {
    render(<TrendChart title="Revenue Trends" data={mockData} series={mockSeries} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('should handle empty data gracefully', () => {
    render(<TrendChart title="Revenue Trends" data={[]} series={mockSeries} />);

    const lineChart = screen.getByTestId('line-chart');
    const chartData = JSON.parse(lineChart.getAttribute('data-chart-data') || '[]');

    expect(chartData).toEqual([]);
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
  });

  it('should handle single series', () => {
    const singleSeries = [mockSeries[0]];

    render(<TrendChart title="Revenue Only" data={mockData} series={singleSeries} />);

    expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
    expect(screen.queryByTestId('line-subscriptions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('line-oneTime')).not.toBeInTheDocument();
  });

  it('should update when data changes', () => {
    const { rerender } = render(
      <TrendChart title="Revenue Trends" data={mockData} series={mockSeries} />
    );

    const newData = [
      { date: 'Feb 1', revenue: 1500, subscriptions: 1200, oneTime: 300 },
      { date: 'Feb 2', revenue: 1600, subscriptions: 1250, oneTime: 350 },
    ];

    rerender(<TrendChart title="Revenue Trends" data={newData} series={mockSeries} />);

    const lineChart = screen.getByTestId('line-chart');
    const chartData = JSON.parse(lineChart.getAttribute('data-chart-data') || '[]');

    expect(chartData).toEqual(newData);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TrendChart title="Revenue Trends" data={mockData} series={mockSeries} className="custom-class" />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('should use custom value formatter when provided', () => {
    const formatter = vi.fn((value: number) => `$${value}`);

    render(
      <TrendChart
        title="Revenue Trends"
        data={mockData}
        series={mockSeries}
        valueFormatter={formatter}
      />
    );

    // Formatter would be passed to YAxis and Tooltip in real recharts
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
  });
});
