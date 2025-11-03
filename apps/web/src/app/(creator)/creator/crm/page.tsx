/**
 * CRM Fans List Page (F8)
 */

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FanFilters } from '@/components/crm/FanFilters';
import { FanTable } from '@/components/crm/FanTable';
import { useFans, useTags, useExportFans } from '@/hooks/useFanCRM';
import type { FanFilters as FanFiltersType } from '@/types/crm';

export default function CRMPage() {
  const [filters, setFilters] = useState<FanFiltersType>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading, isError } = useFans(filters);
  const { data: tagsData } = useTags();
  const exportMutation = useExportFans();

  const handleFiltersChange = (newFilters: FanFiltersType) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  const fans = data?.fans || [];
  const total = data?.total || 0;
  const page = data?.page || 1;
  const limit = data?.limit || 20;
  const hasMore = data?.hasMore || false;
  const availableTags = tagsData || [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fan CRM</h1>
          <p className="text-muted-foreground">Manage your fan relationships and interactions</p>
        </div>
        {/* Future: Add Fan button */}
        {/* <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Fan
        </Button> */}
      </div>

      <FanFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        availableTags={availableTags}
        isExporting={exportMutation.isPending}
      />

      <FanTable
        fans={fans}
        isLoading={isLoading}
        isError={isError}
        page={page}
        limit={limit}
        total={total}
        hasMore={hasMore}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
