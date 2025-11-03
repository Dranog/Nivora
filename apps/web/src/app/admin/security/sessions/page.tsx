'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  Monitor,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Clock,
  Activity,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SessionLog {
  id: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string | null;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  action: string;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    suspicious: 0,
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/security/sessions?limit=100');
      if (!response.ok) throw new Error('Failed to fetch sessions');

      const data = await response.json();
      const sessionData = Array.isArray(data) ? data : [];
      setSessions(sessionData);

      // Calculate stats
      const successful = sessionData.filter((s: SessionLog) => s.success).length;
      const failed = sessionData.filter((s: SessionLog) => !s.success).length;

      // Detect suspicious: multiple failed logins from different IPs
      const failedLogins = sessionData.filter((s: SessionLog) =>
        s.action === 'LOGIN' && !s.success
      );
      const uniqueIPs = new Set(failedLogins.map((s: SessionLog) => s.ipAddress));
      const suspicious = uniqueIPs.size >= 3 ? failedLogins.length : 0;

      setStats({
        total: sessionData.length,
        successful,
        failed,
        suspicious,
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: string, success: boolean) => {
    const actionColors: Record<string, string> = {
      'LOGIN': 'bg-blue-100 text-blue-700',
      'LOGOUT': 'bg-gray-100 text-gray-700',
      '2FA_VERIFY': 'bg-purple-100 text-purple-700',
      'IP_BLOCKED': 'bg-red-100 text-red-700',
      '2FA_FAILED': 'bg-amber-100 text-amber-700',
      'SESSION_TERMINATED_BY_ADMIN': 'bg-orange-100 text-orange-700',
    };

    const colorClass = actionColors[action] || 'bg-gray-100 text-gray-700';

    return (
      <Badge variant="outline" className={colorClass}>
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const detectAnomaly = (session: SessionLog): boolean => {
    // Simple anomaly detection: failed login
    return session.action === 'LOGIN' && !session.success;
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="w-4 h-4" />;

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <span className="text-lg">📱</span>;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <span className="text-lg">📱</span>;
    }
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions & Logs de Connexion</h1>
          <p className="text-gray-500 mt-1">Surveillance de l'activité de sécurité</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <CardTitle className="text-sm font-medium text-gray-500">Total Activités</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Dernières 100 entrées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <CardTitle className="text-sm font-medium text-gray-500">Réussies</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.successful}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <CardTitle className="text-sm font-medium text-gray-500">Échecs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className={stats.suspicious > 0 ? 'border-amber-200 bg-amber-50' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${stats.suspicious > 0 ? 'text-amber-600' : 'text-gray-500'}`} />
              <CardTitle className={`text-sm font-medium ${stats.suspicious > 0 ? 'text-amber-900' : 'text-gray-500'}`}>
                Activité Suspecte
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.suspicious > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {stats.suspicious}
            </div>
            <p className={`text-xs mt-1 ${stats.suspicious > 0 ? 'text-amber-700' : 'text-gray-500'}`}>
              {stats.suspicious > 0 ? 'Tentatives multiples détectées' : 'Aucune anomalie'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-500" />
                <CardTitle>Journal des Sessions</CardTitle>
              </div>
              <CardDescription>
                Historique complet des connexions et actions de sécurité
              </CardDescription>
            </div>
            <Button
              onClick={fetchSessions}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Actualiser'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : (sessions ?? []).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucune session enregistrée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Appareil</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sessions ?? []).map((session) => (
                  <TableRow key={session.id} className={detectAnomaly(session) ? 'bg-amber-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.success)}
                        {detectAnomaly(session) && (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(session.action, session.success)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.userAgent)}
                        <span className="text-xs text-gray-500 max-w-[150px] truncate">
                          {session.deviceType || session.userAgent?.substring(0, 30) || 'Inconnu'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                    <TableCell>
                      {session.country || session.city ? (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">
                            {[session.city, session.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        {format(new Date(session.createdAt), 'dd MMM yyyy HH:mm:ss', { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!session.success && session.failureReason ? (
                        <span className="text-xs text-red-600">{session.failureReason}</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Detection Info */}
      {stats.suspicious > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-amber-900">Détection d'Anomalies</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              Activité suspecte détectée dans les logs récents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-amber-800">
            <p>
              • {stats.failed} tentative{stats.failed > 1 ? 's' : ''} de connexion échouée{stats.failed > 1 ? 's' : ''}
            </p>
            <p>
              • Plusieurs échecs depuis différentes adresses IP
            </p>
            <p className="font-medium mt-2">
              Recommandation: Vérifiez les tentatives de connexion et envisagez d'activer la 2FA
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
