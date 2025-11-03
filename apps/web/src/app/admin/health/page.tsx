'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Activity, Database, Server, HardDrive, Cpu, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface HealthCheck {
  id: string;
  service: string;
  type: 'Database' | 'API' | 'Storage' | 'Cache' | 'Queue' | 'External';
  status: 'Healthy' | 'Degraded' | 'Down';
  uptime: string;
  lastCheck: string;
  responseTime: number;
  errorRate?: string;
  description: string;
}

const DEMO_HEALTH_CHECKS: HealthCheck[] = [
  {
    id: '1',
    service: 'PostgreSQL Database',
    type: 'Database',
    status: 'Healthy',
    uptime: '99.99%',
    lastCheck: '2024-01-22 14:30:00',
    responseTime: 12,
    errorRate: '0.01%',
    description: 'Primary database cluster',
  },
  {
    id: '2',
    service: 'Redis Cache',
    type: 'Cache',
    status: 'Healthy',
    uptime: '99.98%',
    lastCheck: '2024-01-22 14:30:00',
    responseTime: 3,
    errorRate: '0.02%',
    description: 'Session and data caching',
  },
  {
    id: '3',
    service: 'MinIO Storage',
    type: 'Storage',
    status: 'Healthy',
    uptime: '99.95%',
    lastCheck: '2024-01-22 14:30:00',
    responseTime: 45,
    errorRate: '0.05%',
    description: 'Media storage S3-compatible',
  },
  {
    id: '4',
    service: 'BullMQ Queue',
    type: 'Queue',
    status: 'Degraded',
    uptime: '98.50%',
    lastCheck: '2024-01-22 14:29:55',
    responseTime: 156,
    errorRate: '1.5%',
    description: 'Background job processing',
  },
  {
    id: '5',
    service: 'Main API',
    type: 'API',
    status: 'Healthy',
    uptime: '99.97%',
    lastCheck: '2024-01-22 14:30:00',
    responseTime: 89,
    errorRate: '0.03%',
    description: 'Core application API',
  },
  {
    id: '6',
    service: 'Stripe Payment Gateway',
    type: 'External',
    status: 'Healthy',
    uptime: '99.99%',
    lastCheck: '2024-01-22 14:30:00',
    responseTime: 234,
    errorRate: '0.01%',
    description: 'Payment processing service',
  },
  {
    id: '7',
    service: 'SendGrid Email',
    type: 'External',
    status: 'Healthy',
    uptime: '99.96%',
    lastCheck: '2024-01-22 14:30:00',
    responseTime: 178,
    errorRate: '0.04%',
    description: 'Transactional email delivery',
  },
  {
    id: '8',
    service: 'AI Moderation Service',
    type: 'External',
    status: 'Down',
    uptime: '87.32%',
    lastCheck: '2024-01-22 14:28:12',
    responseTime: 0,
    errorRate: '12.68%',
    description: 'Content moderation AI',
  },
];

type TabType = 'all' | 'healthy' | 'degraded' | 'down';

export default function HealthPage() {
  const t = useTranslations('admin.health');  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to translate service types
  function translateType(type: string): string {
    const key = type.toLowerCase();
    if (key === 'database') return t('types.database');
    if (key === 'api') return t('types.api');
    if (key === 'storage') return t('types.storage');
    if (key === 'cache') return t('types.cache');
    if (key === 'queue') return t('types.queue');
    if (key === 'external') return t('types.external');
    return type;
  }

  // Helper function to translate statuses
  function translateStatus(status: string): string {
    const key = status.toLowerCase();
    if (key === 'healthy') return t('statuses.healthy');
    if (key === 'degraded') return t('statuses.degraded');
    if (key === 'down') return t('statuses.down');
    return status;
  }

  const stats = {
    total: DEMO_HEALTH_CHECKS.length,
    healthy: DEMO_HEALTH_CHECKS.filter((h) => h.status === 'Healthy').length,
    degraded: DEMO_HEALTH_CHECKS.filter((h) => h.status === 'Degraded').length,
    down: DEMO_HEALTH_CHECKS.filter((h) => h.status === 'Down').length,
    avgResponseTime: Math.round(
      DEMO_HEALTH_CHECKS.reduce((sum, h) => sum + h.responseTime, 0) / DEMO_HEALTH_CHECKS.length
    ),
    systemUptime: '99.84%',
  };

  const filteredHealthChecks = DEMO_HEALTH_CHECKS.filter((check) => {
    let tabMatch = true;
    if (activeTab === 'healthy') tabMatch = check.status === 'Healthy';
    if (activeTab === 'degraded') tabMatch = check.status === 'Degraded';
    if (activeTab === 'down') tabMatch = check.status === 'Down';

    const searchMatch =
      searchQuery === '' ||
      check.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      check.description.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  const handleRefreshAll = () => {
    toast.success(t('toasts.healthChecksRunning'), {
        description: t('toasts.refreshingAll'),
      });
  };

  const handleRestartService = (serviceName: string) => {
    if (confirm(t('confirmations.restart', { serviceName }))) {
      toast.success(t('toasts.serviceRestarting'), {
        description: t('toasts.serviceRestartingMessage', { serviceName
      }),
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-green-100 text-green-800';
      case 'Degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'Down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Database':
        return <Database className="w-4 h-4" />;
      case 'API':
        return <Server className="w-4 h-4" />;
      case 'Storage':
        return <HardDrive className="w-4 h-4" />;
      case 'Cache':
      case 'Queue':
        return <Cpu className="w-4 h-4" />;
      case 'External':
        return <Activity className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getResponseTimeColor = (ms: number) => {
    if (ms === 0) return 'text-red-600';
    if (ms < 100) return 'text-green-600';
    if (ms < 300) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={handleRefreshAll}>
          <Activity className="w-4 h-4 mr-2" />
          {t('refreshAll')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="text-sm text-gray-600">{t('stats.healthy')}</div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <div className="text-sm text-gray-600">{t('stats.degraded')}</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.degraded}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <div className="text-sm text-gray-600">{t('stats.down')}</div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.down}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-4 h-4 text-gray-600" />
            <div className="text-sm text-gray-600">{t('stats.totalServices')}</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.avgResponse')}</div>
          <div className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}ms</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">{t('stats.systemUptime')}</div>
          <div className="text-2xl font-bold text-gray-900">{stats.systemUptime}</div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label={t('search.ariaLabel')}
        />
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: t('tabs.all') },
          { key: 'healthy', label: t('tabs.healthy') },
          { key: 'degraded', label: t('tabs.degraded') },
          { key: 'down', label: t('tabs.down') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#00B8A9] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHealthChecks.map((check) => (
          <Card key={check.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(check.type)}
                <div>
                  <h3 className="font-semibold text-gray-900">{check.service}</h3>
                  <p className="text-xs text-gray-500">{translateType(check.type)}</p>
                </div>
              </div>
              <Badge className={getStatusColor(check.status)}>{translateStatus(check.status)}</Badge>
            </div>

            <p className="text-sm text-gray-600 mb-4">{check.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('details.uptime')}</span>
                <span className="font-medium text-gray-900">{check.uptime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('details.responseTime')}</span>
                <span className={`font-medium ${getResponseTimeColor(check.responseTime)}`}>
                  {check.responseTime === 0 ? t('details.na') : `${check.responseTime}ms`}
                </span>
              </div>
              {check.errorRate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('details.errorRate')}</span>
                  <span className="font-medium text-gray-900">{check.errorRate}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('details.lastCheck')}</span>
                <span className="font-medium text-gray-900">{check.lastCheck.split(' ')[1]}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                {t('actions.viewLogs')}
              </Button>
              {check.status !== 'Healthy' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700"
                  onClick={() => handleRestartService(check.service)}
                >
                  {t('actions.restart')}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredHealthChecks.length === 0 && (
        <div className="text-center py-12">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('emptyState')}</p>
        </div>
      )}
    </div>
  );
}
