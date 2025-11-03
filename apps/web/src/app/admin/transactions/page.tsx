'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KPICard } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Percent,
  Users,
  RotateCcw,
  FileText,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Euro,
  Building,
  Eye,
  MoreVertical,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Mail,
  User,
  FileDown,
  Settings,
  LineChart,
  ArrowDownCircle,
  Globe,
  TrendingDown,
  AlertTriangle,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { downloadInvoicePDF } from '@/lib/pdf/invoice-generator';
import { downloadFECExport, downloadSingleTransactionFEC } from '@/lib/exports/fec-export';
import { useTransactions, useRefundTransaction } from '@/hooks/useAdminTransactions';
import type { Transaction } from '@/types/transaction';

// Types
type SortField = 'date' | 'invoiceNumber' | 'creator' | 'fan' | 'net' | 'gross' | 'type' | 'status';
type SortDirection = 'asc' | 'desc' | null;

// Platform info - informations de la plateforme pour les factures
const platformInfo = {
  name: 'Nom Plateforme SAS',
  siret: '123 456 789 00012',
  vatNumber: 'FR12345678901',
  address: {
    street: '15 rue de la Tech',
    postalCode: '75001',
    city: 'Paris',
    country: 'France',
  },
  email: 'contact@plateforme.com',
  phone: '+33 1 23 45 67 89',
};

// Mock data - generate more transactions
const generateMockTransactions = (count: number): Transaction[] => {
  const creators = [
    { name: 'Sophie Martin', fiscalStatus: 'Auto-entrepreneur' as const, siret: '123456789', email: 'sophie.martin@example.com' },
    { name: 'Lucas Dubois', fiscalStatus: 'SASU' as const, siret: '987654321', email: 'lucas.dubois@example.com' },
    { name: 'Emma Wilson', fiscalStatus: 'SARL' as const, siret: '555444333', email: 'emma.wilson@example.com' },
  ];

  const fans = [
    { name: 'Alexandre Rousseau', country: 'FR', email: 'alex.r@example.com', type: 'individual' as const },
    { name: 'Julie Lefebvre', country: 'DE', email: 'julie.l@example.com', type: 'individual' as const },
    { name: 'Tech Corp SARL', country: 'DE', email: 'contact@techcorp.de', type: 'business' as const, vatNumber: 'DE123456789' },
    { name: 'Thomas Bernard', country: 'US', email: 'thomas.b@example.com', type: 'individual' as const },
  ];

  const types: Transaction['type'][] = ['subscription', 'ppv', 'tip', 'marketplace'];

  return Array.from({ length: count }, (_, i) => {
    const creator = creators[Math.floor(Math.random() * creators.length)];
    const fan = fans[Math.floor(Math.random() * fans.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const net = Math.floor(Math.random() * 50000) + 1000;
    const vatRate = fan.country === 'FR' ? 20 : fan.country === 'DE' && fan.name.includes('Corp') ? 0 : 20;
    const vat = Math.round(net * (vatRate / 100));
    const gross = net + vat;
    const commission = Math.round(net * 0.15);
    const commissionVAT = Math.round(commission * 0.2);
    const creatorNet = gross - commission - commissionVAT - 180;

    return {
      id: `2025-${String(i + 1).padStart(6, '0')}`,
      invoiceNumber: `2025-${String(i + 1).padStart(6, '0')}`,
      date: new Date(2025, 0, Math.floor(Math.random() * 30) + 1),
      type,
      creator: { ...creator, avatar: `/avatars/${creator.name.toLowerCase().replace(' ', '')}.jpg` },
      fan,
      amounts: { net, vat, vatRate, gross, commission, commissionVAT, creatorNet },
      status: i % 10 === 0 ? 'pending' : i % 15 === 0 ? 'failed' : 'completed',
      reconciled: Math.random() > 0.3,
      platform: platformInfo,
    };
  });
};

const mockTransactions: Transaction[] = generateMockTransactions(90);

// Generate chart data for the last 30 days
const generateChartData = (transactions: Transaction[]) => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2025, 0, i + 1);
    const dayTransactions = transactions.filter(
      (tx) => tx.date.getDate() === date.getDate() && tx.status === 'completed'
    );
    const total = dayTransactions.reduce((sum, tx) => sum + tx.amounts.gross, 0);
    return {
      date: format(date, 'dd MMM', { locale: fr }),
      total: total / 100,
      count: dayTransactions.length,
    };
  });
  return last30Days;
};

// Utils
const formatEuro = (cents: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
};

const getCountryFlag = (code: string) => {
  return String.fromCodePoint(...code.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)));
};

const getTypeBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    subscription: 'bg-cyan-100 text-cyan-700',
    ppv: 'bg-blue-100 text-blue-700',
    tip: 'bg-purple-100 text-purple-700',
    marketplace: 'bg-green-100 text-green-700',
  };
  return classes[type] || 'bg-gray-100 text-gray-700';
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    subscription: 'Abonnement',
    ppv: 'PPV',
    tip: 'Pourboire',
    marketplace: 'Marketplace',
  };
  return labels[type] || type;
};

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-orange-100 text-orange-700',
    failed: 'bg-red-100 text-red-700',
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    completed: 'Complétée',
    pending: 'En attente',
    failed: 'Échouée',
  };
  return labels[status] || status;
};

export default function TransactionsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    fiscalStatus: 'all',
    country: 'all',
    amountMin: '',
    amountMax: '',
    vatRate: 'all',
    reconciled: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Fetch transactions with API
  const { data: transactionsData, isLoading } = useTransactions({
    page,
    limit: perPage,
    search: filters.search || undefined,
    type: filters.type !== 'all' ? filters.type as any : undefined,
    status: filters.status !== 'all' ? filters.status as any : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  // Refund mutation
  const refundMutation = useRefundTransaction();

  // Use API data if available, otherwise fallback to mock
  // Note: API returns basic Transaction type, but page uses fiscal Transaction type
  // TODO: Backend should return fiscal transaction format with invoiceNumber, amounts, etc.
  const transactions = (transactionsData?.items as any || mockTransactions) as Transaction[];

  // Calcul stats
  const stats = useMemo(() => {
    const completed = transactions.filter((tx) => tx.status === 'completed');
    const totalVolume = completed.reduce((sum, tx) => sum + tx.amounts.gross, 0);
    const totalRevenue = completed.reduce((sum, tx) => sum + tx.amounts.net, 0);
    const totalVAT = completed.reduce((sum, tx) => sum + tx.amounts.vat, 0);
    const totalCommission = completed.reduce((sum, tx) => sum + tx.amounts.commission, 0);
    const totalCommissionVAT = completed.reduce((sum, tx) => sum + tx.amounts.commissionVAT, 0);
    const totalCreatorNet = completed.reduce((sum, tx) => sum + tx.amounts.creatorNet, 0);
    const avgTransaction = completed.length > 0 ? totalVolume / completed.length : 0;
    const pending = transactions.filter((tx) => tx.status === 'pending').length;
    const failed = transactions.filter((tx) => tx.status === 'failed').length;
    const reconciled = transactions.filter((tx) => tx.reconciled).length;
    const notReconciled = transactions.length - reconciled;

    return {
      totalVolume,
      totalRevenue,
      totalVAT,
      totalCommission,
      totalCommissionVAT,
      totalCreatorNet,
      count: completed.length,
      avgTransaction,
      pending,
      failed,
      reconciled,
      notReconciled,
      failureRate: transactions.length > 0 ? (failed / transactions.length) * 100 : 0,
    };
  }, [transactions]);

  // Chart data
  const chartData = useMemo(() => generateChartData(transactions), [transactions]);

  // Filtrage
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.invoiceNumber.toLowerCase().includes(query) ||
          tx.creator.name.toLowerCase().includes(query) ||
          tx.fan.name.toLowerCase().includes(query) ||
          (tx.creator.siret && tx.creator.siret.includes(query))
      );
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter((tx) => tx.type === filters.type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((tx) => tx.status === filters.status);
    }

    if (filters.fiscalStatus !== 'all') {
      filtered = filtered.filter((tx) => tx.creator.fiscalStatus.toLowerCase().includes(filters.fiscalStatus));
    }

    if (filters.country !== 'all') {
      filtered = filtered.filter((tx) => tx.fan.country === filters.country);
    }

    if (filters.amountMin) {
      filtered = filtered.filter((tx) => tx.amounts.gross >= parseFloat(filters.amountMin) * 100);
    }

    if (filters.amountMax) {
      filtered = filtered.filter((tx) => tx.amounts.gross <= parseFloat(filters.amountMax) * 100);
    }

    if (filters.vatRate !== 'all') {
      filtered = filtered.filter((tx) => tx.amounts.vatRate === parseInt(filters.vatRate));
    }

    if (filters.reconciled !== 'all') {
      filtered = filtered.filter((tx) => tx.reconciled === (filters.reconciled === 'yes'));
    }

    // Sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'date':
            comparison = a.date.getTime() - b.date.getTime();
            break;
          case 'invoiceNumber':
            comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
            break;
          case 'creator':
            comparison = a.creator.name.localeCompare(b.creator.name);
            break;
          case 'fan':
            comparison = a.fan.name.localeCompare(b.fan.name);
            break;
          case 'net':
            comparison = a.amounts.net - b.amounts.net;
            break;
          case 'gross':
            comparison = a.amounts.gross - b.amounts.gross;
            break;
          case 'type':
            comparison = a.type.localeCompare(b.type);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [transactions, filters, sortField, sortDirection]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredTransactions.slice(start, start + perPage);
  }, [filteredTransactions, page, perPage]);

  const totalPages = Math.ceil(filteredTransactions.length / perPage);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    if (sortDirection === 'asc') return <ArrowUp className="ml-2 h-4 w-4" />;
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedTransactions.map((tx) => tx.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((txId) => txId !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copié dans le presse-papiers');
  };

  const handleDownloadInvoice = async (tx: Transaction) => {
    try {
      toast.info('Génération en cours...', {
        description: `Préparation de la facture ${tx.invoiceNumber}`,
      });

      // Générer et télécharger le PDF
      await downloadInvoicePDF(tx);

      toast.success('Facture téléchargée', {
        description: `Facture-${tx.invoiceNumber}.pdf`,
      });
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur', {
        description: 'Impossible de générer la facture',
      });
    }
  };

  const handleSendEmail = (tx: Transaction) => {
    toast.success('Email envoyé', {
      description: `Facture envoyée à ${tx.fan.name}`,
    });
    // TODO: Implémenter l'envoi d'email
  };

  const handleRefund = (tx: Transaction) => {
    if (confirm(`Êtes-vous sûr de vouloir rembourser la transaction ${tx.invoiceNumber} de ${formatEuro(tx.amounts.gross)} ?`)) {
      refundMutation.mutate({
        transactionId: tx.id,
        data: {
          reason: 'Remboursement demandé par l\'administrateur',
          amount: tx.amounts.gross,
          notifyUser: true,
        },
      });
    }
  };

  // Export FEC for all transactions
  const handleExportFEC = () => {
    try {
      downloadFECExport(transactions);
      toast.success('Export FEC réussi', {
        description: `${transactions.length} transactions exportées`,
      });
    } catch (error) {
      console.error('Erreur export FEC:', error);
      toast.error('Erreur', {
        description: 'Impossible de générer l\'export FEC',
      });
    }
  };

  // Export FEC for selected transactions
  const handleExportSelectedFEC = () => {
    const selectedTransactions = transactions.filter(tx => selectedIds.includes(tx.id));
    try {
      downloadFECExport(selectedTransactions);
      toast.success('Export FEC réussi', {
        description: `${selectedTransactions.length} transactions exportées`,
      });
    } catch (error) {
      console.error('Erreur export FEC:', error);
      toast.error('Erreur', {
        description: 'Impossible de générer l\'export FEC',
      });
    }
  };

  // Export FEC for single transaction
  const handleExportSingleFEC = (tx: Transaction) => {
    try {
      downloadSingleTransactionFEC(tx);
      toast.success('Export FEC réussi', {
        description: `Transaction ${tx.invoiceNumber} exportée`,
      });
    } catch (error) {
      console.error('Erreur export FEC:', error);
      toast.error('Erreur', {
        description: 'Impossible de générer l\'export FEC',
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      fiscalStatus: 'all',
      country: 'all',
      amountMin: '',
      amountMax: '',
      vatRate: 'all',
      reconciled: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.fiscalStatus !== 'all') count++;
    if (filters.country !== 'all') count++;
    if (filters.amountMin) count++;
    if (filters.amountMax) count++;
    if (filters.vatRate !== 'all') count++;
    if (filters.reconciled !== 'all') count++;
    return count;
  }, [filters]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold from-cyan-600 to-blue-600 bg-gradient-to-r bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-gray-600 mt-2">Gestion comptable et fiscale conforme CGI/DGFiP</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('Actualisation...')}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExportFEC}>
            <FileText className="mr-2 h-4 w-4" />
            Export FEC
          </Button>
          <Button onClick={() => toast.info('Export Excel en cours...')}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* KPI Cards - Ligne 1 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Chiffre d'affaires TTC"
          value={formatEuro(stats.totalVolume)}
          description={`${stats.count} transactions`}
          icon={<DollarSign className="h-6 w-6" />}
          trend={{ value: '+12.9%', isPositive: true }}
        />
        <KPICard
          title="CA Hors Taxes (HT)"
          value={formatEuro(stats.totalRevenue)}
          description="Base imposable"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KPICard
          title="TVA Collectée"
          value={formatEuro(stats.totalVAT)}
          description="À reverser au Trésor Public"
          icon={<Receipt className="h-6 w-6" />}
        />
        <KPICard
          title="Commissions HT"
          value={formatEuro(stats.totalCommission)}
          description={`+${formatEuro(stats.totalCommissionVAT)} TVA`}
          icon={<Percent className="h-6 w-6" />}
        />
      </div>

      {/* KPI Cards - Ligne 2 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Net Créateurs"
          value={formatEuro(stats.totalCreatorNet)}
          description="Après commissions et frais"
          icon={<Users className="h-6 w-6" />}
        />
        <KPICard
          title="Panier Moyen"
          value={formatEuro(stats.avgTransaction)}
          description="Montant moyen TTC"
          icon={<RotateCcw className="h-6 w-6" />}
        />
        <KPICard
          title="En Attente"
          value={stats.pending.toString()}
          description={`${stats.failed} échouées`}
          icon={<AlertTriangle className="h-6 w-6" />}
          trend={{
            value: stats.failureRate > 5 ? `-${stats.failureRate.toFixed(1)}%` : `${stats.failureRate.toFixed(1)}%`,
            isPositive: stats.failureRate <= 5,
          }}
        />
        <KPICard
          title="Rapprochées"
          value={stats.reconciled.toString()}
          description={`${stats.notReconciled} en attente`}
          icon={<CheckCircle className="h-6 w-6" />}
        />
      </div>

      {/* KPI Cards - Ligne 3 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="International"
          value="38%"
          description="Transactions hors France"
          icon={<Globe className="h-6 w-6" />}
        />
        <KPICard
          title="B2B"
          value="12%"
          description="Ventes professionnelles"
          icon={<Building className="h-6 w-6" />}
        />
        <KPICard
          title="Taux d'échec"
          value={`${stats.failureRate.toFixed(1)}%`}
          description={`${stats.failed} transactions`}
          icon={<ArrowDownCircle className="h-6 w-6" />}
          trend={
            stats.failureRate > 3
              ? { value: `-${stats.failureRate.toFixed(1)}%`, isPositive: false }
              : undefined
          }
        />
        <KPICard
          title="Croissance"
          value="+12.9%"
          description="vs mois dernier"
          icon={<LineChart className="h-6 w-6" />}
          trend={{ value: '+2.1%', isPositive: true }}
        />
      </div>

      {/* Graphique Recharts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Volume des transactions</CardTitle>
              <CardDescription>Évolution sur les {chartPeriod === '7d' ? '7' : chartPeriod === '30d' ? '30' : chartPeriod === '90d' ? '90' : '365'} derniers jours</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartPeriod === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartPeriod('7d')}
              >
                7j
              </Button>
              <Button
                variant={chartPeriod === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartPeriod('30d')}
              >
                30j
              </Button>
              <Button
                variant={chartPeriod === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartPeriod('90d')}
              >
                90j
              </Button>
              <Button
                variant={chartPeriod === '1y' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartPeriod('1y')}
              >
                1an
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}€`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)}€`, 'Montant']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Filtres</h3>
              {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount} filtre(s) actif(s)</Badge>}
            </div>
            <div className="flex gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Masquer' : 'Afficher'}
              </Button>
            </div>
          </div>

          {showFilters && (
            <>
              {/* Ligne 1 */}
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="col-span-2">
                  <Label htmlFor="search">Recherche</Label>
                  <Input
                    id="search"
                    placeholder="N° facture, SIRET, email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="subscription">Abonnement</SelectItem>
                      <SelectItem value="ppv">PPV</SelectItem>
                      <SelectItem value="tip">Tip</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous statuts</SelectItem>
                      <SelectItem value="completed">Complété</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="failed">Échoué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fiscalStatus">Statut fiscal</Label>
                  <Select
                    value={filters.fiscalStatus}
                    onValueChange={(value) => setFilters({ ...filters, fiscalStatus: value })}
                  >
                    <SelectTrigger id="fiscalStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="auto">Auto-entrepreneur</SelectItem>
                      <SelectItem value="sarl">SARL</SelectItem>
                      <SelectItem value="sas">SAS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Select value={filters.country} onValueChange={(value) => setFilters({ ...filters, country: value })}>
                    <SelectTrigger id="country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous pays</SelectItem>
                      <SelectItem value="FR">🇫🇷 France</SelectItem>
                      <SelectItem value="DE">🇩🇪 Allemagne</SelectItem>
                      <SelectItem value="US">🇺🇸 États-Unis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ligne 2 */}
              <div className="grid grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="amountMin">Montant min (€)</Label>
                  <Input
                    id="amountMin"
                    type="number"
                    placeholder="0"
                    value={filters.amountMin}
                    onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="amountMax">Montant max (€)</Label>
                  <Input
                    id="amountMax"
                    type="number"
                    placeholder="10000"
                    value={filters.amountMax}
                    onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="vatRate">Taux TVA</Label>
                  <Select value={filters.vatRate} onValueChange={(value) => setFilters({ ...filters, vatRate: value })}>
                    <SelectTrigger id="vatRate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous taux</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="5">5,5%</SelectItem>
                      <SelectItem value="0">0% (Export)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reconciled">Rapprochement</Label>
                  <Select
                    value={filters.reconciled}
                    onValueChange={(value) => setFilters({ ...filters, reconciled: value })}
                  >
                    <SelectTrigger id="reconciled">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="yes">✓ Rapproché</SelectItem>
                      <SelectItem value="no">⏳ En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Période</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        Période
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto">
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          Aujourd'hui
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          Cette semaine
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          Ce mois
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          Personnalisé...
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Actions</Label>
                  <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Table Header */}
      <Card>
        <CardContent className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={paginatedTransactions.length > 0 && selectedIds.length === paginatedTransactions.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  Affichage {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredTransactions.length)} sur{' '}
                  {filteredTransactions.length} transactions
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={paginatedTransactions.length > 0 && selectedIds.length === paginatedTransactions.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('invoiceNumber')}
                  className="h-8 px-2 font-semibold"
                >
                  N° Facture
                  {getSortIcon('invoiceNumber')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('date')} className="h-8 px-2 font-semibold">
                  Date
                  {getSortIcon('date')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('type')} className="h-8 px-2 font-semibold">
                  Type
                  {getSortIcon('type')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('creator')} className="h-8 px-2 font-semibold">
                  Créateur
                  {getSortIcon('creator')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('fan')} className="h-8 px-2 font-semibold">
                  Fan
                  {getSortIcon('fan')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort('net')} className="h-8 px-2 font-semibold">
                  Montant HT
                  {getSortIcon('net')}
                </Button>
              </TableHead>
              <TableHead className="text-right">TVA</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => handleSort('gross')} className="h-8 px-2 font-semibold">
                  Montant TTC
                  {getSortIcon('gross')}
                </Button>
              </TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Net Créateur</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')} className="h-8 px-2 font-semibold">
                  Statut
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((tx) => (
              <TableRow
                key={tx.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setSelectedTx(tx);
                  setDrawerOpen(true);
                }}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(tx.id)}
                    onCheckedChange={(checked) => handleSelectTransaction(tx.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(tx.invoiceNumber);
                      }}
                      className="text-blue-600 hover:underline font-mono text-sm"
                    >
                      {tx.invoiceNumber}
                    </button>
                    <FileText className="h-4 w-4 text-gray-400" />
                    {tx.reconciled ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {tx.date.toLocaleDateString('fr-FR')}
                    <div className="text-xs text-gray-500">
                      {tx.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeBadgeClass(tx.type)}>{getTypeLabel(tx.type)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{tx.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{tx.creator.name}</div>
                      <div className="text-xs text-gray-500">
                        {tx.creator.fiscalStatus}
                        {tx.creator.siret && ` • ${tx.creator.siret.slice(0, 9)}...`}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{tx.fan.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{tx.fan.name}</div>
                      <div className="text-xs text-gray-500">
                        {getCountryFlag(tx.fan.country)} {tx.fan.country}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{formatEuro(tx.amounts.net)}</TableCell>
                <TableCell className="text-right">
                  <div>{formatEuro(tx.amounts.vat)}</div>
                  <div className="text-xs text-gray-500">({tx.amounts.vatRate}%)</div>
                </TableCell>
                <TableCell className="text-right font-bold">{formatEuro(tx.amounts.gross)}</TableCell>
                <TableCell className="text-right">
                  <div>{formatEuro(tx.amounts.commission)}</div>
                  <div className="text-xs text-gray-500">+{formatEuro(tx.amounts.commissionVAT)} TVA</div>
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  {formatEuro(tx.amounts.creatorNet)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeClass(tx.status)}>{getStatusLabel(tx.status)}</Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setSelectedTx(tx);
                          setDrawerOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          handleDownloadInvoice(tx);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger facture
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          handleSendEmail(tx);
                        }}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer par email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          copyToClipboard(tx.invoiceNumber);
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copier N° facture
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onSelect={(e) => {
                          e.preventDefault();
                          handleRefund(tx);
                        }}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Rembourser
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <CardContent className="p-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Page {page} sur {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="shadow-lg border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedIds.length} transaction(s) sélectionnée(s)
                </span>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.info('Export en cours...')}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info('Génération factures...')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Factures PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success('Transactions rapprochées')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marquer rapprochées
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info('Préparation email...')}>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer par email
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Drawer Détails */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedTx && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl">Facture N° {selectedTx.invoiceNumber}</SheetTitle>
                  <Badge className={getStatusBadgeClass(selectedTx.status)}>{getStatusLabel(selectedTx.status)}</Badge>
                </div>
                <SheetDescription>
                  Transaction {selectedTx.id} • {selectedTx.date.toLocaleDateString('fr-FR')} à{' '}
                  {selectedTx.date.toLocaleTimeString('fr-FR')}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Synthèse Fiscale */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      Synthèse Fiscale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Montant TTC</div>
                        <div className="text-lg font-bold">{formatEuro(selectedTx.amounts.gross)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Montant HT</div>
                        <div className="text-lg font-semibold">{formatEuro(selectedTx.amounts.net)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">TVA ({selectedTx.amounts.vatRate}%)</div>
                        <div className="text-lg font-semibold text-purple-600">
                          {formatEuro(selectedTx.amounts.vat)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Commission HT</div>
                        <div className="text-lg">{formatEuro(selectedTx.amounts.commission)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">TVA commission</div>
                        <div className="text-lg">{formatEuro(selectedTx.amounts.commissionVAT)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Net créateur</div>
                        <div className="text-lg font-bold text-green-600">{formatEuro(selectedTx.amounts.creatorNet)}</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pays prestation</span>
                        <span>
                          {getCountryFlag(selectedTx.fan.country)} {selectedTx.fan.country}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Règle TVA</span>
                        <span>Standard FR {selectedTx.amounts.vatRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <Badge>B2C (Particulier)</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Créateur */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Créateur
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{selectedTx.creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2 text-sm">
                        <div>
                          <div className="font-semibold">{selectedTx.creator.name}</div>
                          <Badge variant="outline">{selectedTx.creator.fiscalStatus}</Badge>
                        </div>

                        {selectedTx.creator.siret && (
                          <>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="text-gray-500">SIRET</span>
                              <span className="font-mono">{selectedTx.creator.siret}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documents Fiscaux
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Téléchargement...')}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger facture client
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Téléchargement...')}>
                      <Receipt className="mr-2 h-4 w-4" />
                      Télécharger reçu paiement
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Téléchargement...')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Attestation TVA
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleExportSingleFEC(selectedTx)}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Export FEC (ligne)
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                  Fermer
                </Button>
                <Button variant="destructive" onClick={() => toast.error('Remboursement initié')}>
                  Rembourser
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
