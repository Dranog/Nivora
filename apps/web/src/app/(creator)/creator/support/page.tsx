/**
 * Support Tickets Page (F8)
 */

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketList } from '@/components/support/TicketList';
import { NewTicketModal } from '@/components/support/NewTicketModal';
import { useTickets, useCreateTicket } from '@/hooks/useTickets';
import type { TicketFilters, CreateTicketRequest } from '@/types/support';

export default function SupportPage() {
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 20,
  });
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  const { data, isLoading, isError } = useTickets(filters);
  const createTicketMutation = useCreateTicket();

  const handleFiltersChange = (newFilters: TicketFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleCreateTicket = (data: CreateTicketRequest) => {
    createTicketMutation.mutate(data, {
      onSuccess: () => {
        setShowNewTicketModal(false);
      },
    });
  };

  const tickets = data?.tickets || [];
  const total = data?.total || 0;
  const page = data?.page || 1;
  const limit = data?.limit || 20;
  const hasMore = data?.hasMore || false;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
        <Button onClick={() => setShowNewTicketModal(true)} data-testid="new-ticket-btn">
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <TicketList
        tickets={tickets}
        isLoading={isLoading}
        isError={isError}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        page={page}
        limit={limit}
        total={total}
        hasMore={hasMore}
        onPageChange={handlePageChange}
      />

      <NewTicketModal
        open={showNewTicketModal}
        onOpenChange={setShowNewTicketModal}
        onSubmit={handleCreateTicket}
        isSubmitting={createTicketMutation.isPending}
      />
    </div>
  );
}
