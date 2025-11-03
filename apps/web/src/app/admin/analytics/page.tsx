'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  type PeriodType,
  type ComparisonType,
  useExportPDF,
} from '@/hooks/useAnalyticsReports';

// Tab Components
import { RevenueTab } from './_components/RevenueTab';
import { UsersTab } from './_components/UsersTab';
import { ContentTab } from './_components/ContentTab';
import { ModerationTab } from './_components/ModerationTab';

type TabType = 'revenue' | 'users' | 'content' | 'moderation';

const PERIOD_OPTIONS: Array<{ value: PeriodType; label: string }> = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: '1y', label: '1 an' },
];

const COMPARISON_OPTIONS: Array<{ value: ComparisonType; label: string }> = [
  { value: 'none', label: 'Aucune comparaison' },
  { value: 'previous', label: 'Période précédente' },
  { value: 'mom', label: 'Mois précédent (MoM)' },
  { value: 'yoy', label: 'Année précédente (YoY)' },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('revenue');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('30d');
  const [comparison, setComparison] = useState<ComparisonType>('none');
  const [refreshKey, setRefreshKey] = useState(0);

  const { mutate: exportPDF, isPending: isExporting } = useExportPDF();

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success('Actualisation', {
      description: 'Les données ont été rafraîchies.',
    });
  };

  const handleExport = () => {
    const sections: Array<'revenue' | 'users' | 'content' | 'moderation'> = [activeTab];

    exportPDF({
      period: selectedPeriod,
      sections,
      includeCharts: true,
    });
  };

  const handleExportAll = () => {
    exportPDF({
      period: selectedPeriod,
      sections: ['revenue', 'users', 'content', 'moderation'],
      includeCharts: true,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyse complète des performances de la plateforme
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            title="Actualiser les données"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="ml-2">Exporter {activeTab}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportAll}
            disabled={isExporting}
            className="bg-gradient-to-r from-brand-start to-brand-end"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="ml-2">Export complet PDF</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Période:</span>
            <Select
              value={selectedPeriod}
              onValueChange={(value) => setSelectedPeriod(value as PeriodType)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Comparaison:</span>
            <Select
              value={comparison}
              onValueChange={(value) => setComparison(value as ComparisonType)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPARISON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {comparison !== 'none' && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Période actuelle</span>
              <div className="w-2 h-2 rounded-full bg-gray-400 ml-2"></div>
              <span>Période de comparaison</span>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="revenue" className="gap-2">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            Contenu
          </TabsTrigger>
          <TabsTrigger value="moderation" className="gap-2">
            Modération
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueTab
            period={selectedPeriod}
            comparison={comparison}
            refreshKey={refreshKey}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersTab
            period={selectedPeriod}
            comparison={comparison}
            refreshKey={refreshKey}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentTab
            period={selectedPeriod}
            comparison={comparison}
            refreshKey={refreshKey}
          />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <ModerationTab
            period={selectedPeriod}
            comparison={comparison}
            refreshKey={refreshKey}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
