'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/audit-log';

interface ActivityDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: {
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
  } | null;
  getTypeLabel?: (type: string) => string;
  getTypeColor?: (type: string) => string;
}

export function ActivityDetailsModal({
  open,
  onOpenChange,
  activity,
  getTypeLabel,
  getTypeColor,
}: ActivityDetailsModalProps) {
  if (!activity) return null;

  const typeLabel = getTypeLabel ? getTypeLabel(activity.type) : activity.type;
  const typeColor = getTypeColor ? getTypeColor(activity.type) : 'bg-gray-50 text-gray-700 border-gray-200';

  const handleCopyJSON = async () => {
    const jsonData = JSON.stringify(
      {
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp.toISOString(),
        metadata: activity.metadata,
      },
      null,
      2
    );

    const success = await copyToClipboard(jsonData);
    if (success) {
      toast.success('JSON copié dans le presse-papiers');
    } else {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Détails de l'activité
          </DialogTitle>
          <DialogDescription>Informations complètes sur cette action utilisateur</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
              <div className="mt-1">
                <Badge className={typeColor}>{typeLabel}</Badge>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Date et heure</label>
              <p className="text-sm text-gray-900 mt-1">
                {activity.timestamp.toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                à{' '}
                {activity.timestamp.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
            <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              {activity.description}
            </p>
          </div>

          {/* Activity ID */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">ID de l'activité</label>
            <p className="text-xs text-gray-600 mt-1 font-mono p-2 bg-gray-50 border border-gray-200 rounded">
              {activity.id}
            </p>
          </div>

          {/* Metadata */}
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                Métadonnées ({Object.keys(activity.metadata).length} champs)
              </label>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs font-mono">
                  {JSON.stringify(activity.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Full Data Export */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500 uppercase">
                Données complètes (JSON)
              </label>
              <Button size="sm" variant="outline" onClick={handleCopyJSON}>
                <Copy className="w-4 h-4 mr-1" />
                Copier JSON
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
              <pre className="text-xs font-mono">
                {JSON.stringify(
                  {
                    id: activity.id,
                    type: activity.type,
                    description: activity.description,
                    timestamp: activity.timestamp.toISOString(),
                    metadata: activity.metadata,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
