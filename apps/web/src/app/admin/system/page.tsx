// path: src/app/admin/system/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type SysInfo = {
  version: string;
  node: string;
  time: string;
  env: string;
  sendgridConfigured: boolean;
};

export default function SystemPage() {  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<SysInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/system', { cache: 'no-store' });
        if (!res.ok) throw new Error(await res.text());
        const data: SysInfo = await res.json();
        if (mounted) setInfo(data);
      } catch (e: any) {
        toast.error('Chargement impossible', {
        description: e?.message ?? 'Erreur inconnue'
      });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement…</span>
        </div>
      </div>
    );
  }

  if (!info) {
    return <div className="p-8 text-sm text-red-600">Impossible de charger les informations système.</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">System</h1>
        <a
          href="/api/admin/settings/backup"
          className="rounded-2xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Télécharger backup settings
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900">Version</h2>
          <div className="mt-3 space-y-1 text-sm">
            <p><span className="font-medium">App:</span> {info.version}</p>
            <p><span className="font-medium">Node:</span> {info.node}</p>
            <p><span className="font-medium">Env:</span> {info.env}</p>
            <p><span className="font-medium">Time:</span> {new Date(info.time).toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900">Services</h2>
          <div className="mt-3 space-y-1 text-sm">
            <p>
              <span className="font-medium">SendGrid:</span>{' '}
              {info.sendgridConfigured ? 'configuré' : 'non configuré'}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => toast.info('Logs', {
        description: 'Voir les logs dans la console serveur / hébergeur.'
      })}
            className="mt-4 bg-gradient-to-r from-brand-start to-brand-end text-white"
          >
            Ouvrir les logs (info)
          </Button>
        </div>
      </div>
    </div>
  );
}
