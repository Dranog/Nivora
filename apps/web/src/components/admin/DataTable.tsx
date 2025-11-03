/**
 * DataTable - Generic Admin Table Component (F12)
 *
 * Features:
 * - Client-side sorting & pagination
 * - Configurable columns
 * - Row selection with checkboxes
 * - Loading, error, empty states
 * - Accessible (aria-sort, aria-describedby)
 * - Responsive (mobile cards <768px)
 */

'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  mobileLabel?: string; // Label for mobile card view
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  pageSize?: number;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  renderMobileCard?: (row: T) => React.ReactNode;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  error = null,
  emptyMessage = 'No data available',
  pageSize = 20,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  renderMobileCard,
  className,
  'aria-label': ariaLabel = 'Data table',
  'aria-describedby': ariaDescribedBy,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    const column = columns.find(col => col.id === sortColumn);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      // Convert to string for comparison
      const aStr = String(aValue ?? '');
      const bStr = String(bValue ?? '');

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, undefined, { numeric: true });
      } else {
        return bStr.localeCompare(aStr, undefined, { numeric: true });
      }
    });
  }, [data, sortColumn, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Selection
  const allPageIds = useMemo(() => paginatedData.map(keyExtractor), [paginatedData, keyExtractor]);
  const isAllSelected = allPageIds.length > 0 && allPageIds.every(id => selectedIds.includes(id));
  const isSomeSelected = allPageIds.some(id => selectedIds.includes(id)) && !isAllSelected;

  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;

    if (sortColumn === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const newSelected = [...new Set([...selectedIds, ...allPageIds])];
      onSelectionChange(newSelected);
    } else {
      const newSelected = selectedIds.filter(id => !allPageIds.includes(id));
      onSelectionChange(newSelected);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }
    return <ChevronDown className="ml-2 h-4 w-4" />;
  };

  const getAriaSort = (columnId: string): 'ascending' | 'descending' | 'none' | undefined => {
    if (sortColumn !== columnId) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('rounded-md border', className)} aria-busy="true" aria-live="polite">
        <div className="p-8 text-center text-muted-foreground">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('rounded-md border border-destructive', className)} role="alert" aria-live="assertive">
        <div className="p-8 text-center text-destructive">
          <p className="font-semibold">Error loading data</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('rounded-md border', className)} aria-live="polite">
        <div className="p-8 text-center text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block rounded-md border">
        <div className="overflow-x-auto">
          <table
            className="w-full"
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
          >
            <thead className="bg-muted/50">
              <tr>
                {selectable && (
                  <th className="w-12 p-4">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map(column => (
                  <th
                    key={column.id}
                    className="p-4 text-left font-medium"
                    aria-sort={column.sortable ? getAriaSort(column.id) : undefined}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.id)}
                        className="flex items-center hover:text-foreground transition-colors"
                        aria-label={`Sort by ${column.header}`}
                      >
                        {column.header}
                        {getSortIcon(column.id)}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(row => {
                const rowId = keyExtractor(row);
                const isSelected = selectedIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'border-t transition-colors hover:bg-muted/50',
                      isSelected && 'bg-muted'
                    )}
                  >
                    {selectable && (
                      <td className="p-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(rowId, checked as boolean)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}
                    {columns.map(column => (
                      <td key={column.id} className="p-4">
                        {column.accessor(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="md:hidden space-y-4">
        {paginatedData.map(row => {
          const rowId = keyExtractor(row);
          const isSelected = selectedIds.includes(rowId);

          return (
            <div
              key={rowId}
              className={cn(
                'rounded-lg border p-4',
                isSelected && 'border-primary bg-muted'
              )}
            >
              {selectable && (
                <div className="mb-3 flex items-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectRow(rowId, checked as boolean)}
                    aria-label={`Select ${rowId}`}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>
              )}
              {renderMobileCard ? (
                renderMobileCard(row)
              ) : (
                <div className="space-y-2">
                  {columns.map(column => (
                    <div key={column.id} className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground">
                        {column.mobileLabel || column.header}
                      </span>
                      <div className="mt-1">{column.accessor(row)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
