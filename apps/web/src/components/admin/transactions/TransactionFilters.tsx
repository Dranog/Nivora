"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  type TransactionsQuery,
} from "@/types/transactions";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

interface TransactionFiltersProps {
  filters: TransactionsQuery;
  onFiltersChange: (filters: TransactionsQuery) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  onReset,
  disabled = false,
}: TransactionFiltersProps) {
  const { toast } = useToast();

  const handleChange = (key: keyof TransactionsQuery, value: unknown) => {
    const next: TransactionsQuery = { ...filters, page: 1, [key]: value ?? undefined };

    // Validations
    if (key === "dateFrom" || key === "dateTo") {
      const from = key === "dateFrom" ? (value as string | undefined) : next.dateFrom;
      const to = key === "dateTo" ? (value as string | undefined) : next.dateTo;
      if (from && to && new Date(from) > new Date(to)) {
        toast({
          title: "Plage de dates invalide",
          description: "La date de début doit être antérieure ou égale à la date de fin.",
          variant: "destructive",
        });
        return;
      }
    }

    if (key === "minAmount" || key === "maxAmount") {
      const min = key === "minAmount" ? (value as number | undefined) : next.minAmount;
      const max = key === "maxAmount" ? (value as number | undefined) : next.maxAmount;
      if (min != null && max != null && Number(min) > Number(max)) {
        toast({
          title: "Montants incohérents",
          description: "Le montant minimum doit être inférieur ou égal au montant maximum.",
          variant: "destructive",
        });
        return;
      }
      if (min != null && Number(min) < 0) {
        toast({ title: "Montant minimum négatif", description: "La valeur doit être ≥ 0.", variant: "destructive" });
        return;
      }
      if (max != null && Number(max) < 0) {
        toast({ title: "Montant maximum négatif", description: "La valeur doit être ≥ 0.", variant: "destructive" });
        return;
      }
    }

    onFiltersChange(next);
  };

  const activeCount = [
    filters.search,
    filters.type,
    filters.status,
    filters.paymentMethod,
    filters.dateFrom,
    filters.dateTo,
    filters.minAmount,
    filters.maxAmount,
  ].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Filtres appliqués" });
  };

  const handleReset = () => {
    if (!confirm("Réinitialiser tous les filtres ?")) return;
    onReset();
    toast({ title: "Filtres réinitialisés" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          aria-label="Recherche transactions"
          placeholder="Rechercher par ID, email, nom…"
          value={filters.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select
            value={filters.type || "all"}
            onValueChange={(v) => handleChange("type", v === "all" ? undefined : v)}
            disabled={disabled}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value={TransactionType.PURCHASE}>Purchase</SelectItem>
              <SelectItem value={TransactionType.SUBSCRIPTION}>Subscription</SelectItem>
              <SelectItem value={TransactionType.TIP}>Tip</SelectItem>
              <SelectItem value={TransactionType.PAYOUT}>Payout</SelectItem>
              <SelectItem value={TransactionType.REFUND}>Refund</SelectItem>
              <SelectItem value={TransactionType.CHARGEBACK}>Chargeback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Statut</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(v) => handleChange("status", v === "all" ? undefined : v)}
            disabled={disabled}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value={TransactionStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={TransactionStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={TransactionStatus.FAILED}>Failed</SelectItem>
              <SelectItem value={TransactionStatus.REFUNDED}>Refunded</SelectItem>
              <SelectItem value={TransactionStatus.DISPUTED}>Disputed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Méthode</Label>
          <Select
            value={filters.paymentMethod || "all"}
            onValueChange={(v) => handleChange("paymentMethod", v === "all" ? undefined : v)}
            disabled={disabled}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les méthodes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
              <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
              <SelectItem value={PaymentMethod.WALLET}>Wallet</SelectItem>
              <SelectItem value={PaymentMethod.CRYPTO}>Crypto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="dateFrom" className="text-xs">Du</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => handleChange("dateFrom", e.target.value || undefined)}
            className="w-[160px]"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="dateTo" className="text-xs">Au</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => handleChange("dateTo", e.target.value || undefined)}
            className="w-[160px]"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="minAmount" className="text-xs">Montant min (€)</Label>
          <Input
            id="minAmount"
            type="number"
            value={filters.minAmount ?? ""}
            onChange={(e) => handleChange("minAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-[140px]"
            step="0.01"
            min="0"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="maxAmount" className="text-xs">Montant max (€)</Label>
          <Input
            id="maxAmount"
            type="number"
            value={filters.maxAmount ?? ""}
            onChange={(e) => handleChange("maxAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-[140px]"
            step="0.01"
            min="0"
            disabled={disabled}
          />
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" disabled={disabled}>
            <Search className="h-4 w-4 mr-2" />
            Appliquer
          </Button>

          {activeCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={disabled}>
              <X className="mr-2 h-4 w-4" />
              Effacer ({activeCount})
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
