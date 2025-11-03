// path: apps/web/src/components/admin/kyc/KycDocumentViewer.tsx
"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const itemSchema = z.object({
  name: z.string().min(1),
  mimeType: z.string().min(3),
  sizeBytes: z.number().int().positive().optional(),
  url: z.string().url().optional(),
});
export type KycDocItem = z.infer<typeof itemSchema>;

type Props = {
  items: KycDocItem[];
  onResolveUrl?: (name: string) => Promise<{ url: string; mimeType: string; sizeBytes?: number }>;
};

export function KycDocumentViewer(props: Props): React.ReactElement {
  const { toast } = useToast();
  const [preview, setPreview] = useState<{ name: string; url: string; mimeType: string } | null>(null);
  const [busyName, setBusyName] = useState<string | null>(null);

  const items = useMemo<KycDocItem[]>(() => {
    const parsed = z.array(itemSchema).parse(props.items);
    return parsed;
  }, [props.items]);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-brand-start to-brand-end rounded-t-2xl">
        <CardTitle className="text-white">Documents KYC</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[320px]">
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-left">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Taille</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.name} className="border-b">
                  <td className="px-4 py-3">
                    <div className="font-medium">{it.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{it.mimeType}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatSize(it.sizeBytes)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        disabled={busyName === it.name}
                        aria-disabled={busyName === it.name}
                        onClick={() => handlePreview(it)}
                      >
                        {busyName === it.name ? "Ouverture..." : "Prévisualiser"}
                      </Button>
                      <Button
                        onClick={() => handleDownload(it)}
                        disabled={busyName === it.name}
                        aria-disabled={busyName === it.name}
                      >
                        {busyName === it.name ? "Préparation..." : "Télécharger"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Aucun document.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>

      <DocDialog preview={preview} onClose={() => setPreview(null)} />

      <div className="sr-only" aria-live="polite" />
    </Card>
  );

  async function ensureUrl(it: KycDocItem): Promise<{ url: string; mimeType: string }> {
    if (it.url) return { url: it.url, mimeType: it.mimeType };
    if (!props.onResolveUrl) {
      throw new Error("URL manquante et aucun resolver fourni.");
    }
    const r = await props.onResolveUrl(it.name);
    const mime = r.mimeType || it.mimeType;
    return { url: r.url, mimeType: mime };
  }

  async function handlePreview(it: KycDocItem): Promise<void> {
    try {
      setBusyName(it.name);
      const { url, mimeType } = await ensureUrl(it);
      if (!isPreviewable(mimeType)) {
        toast({ title: "Non prévisualisable", description: mimeType });
        return;
      }
      setPreview({ name: it.name, url, mimeType });
    } catch (err) {
      toast({ title: "Échec prévisualisation", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusyName(null);
    }
  }

  async function handleDownload(it: KycDocItem): Promise<void> {
    try {
      setBusyName(it.name);
      const { url } = await ensureUrl(it);
      const a = document.createElement("a");
      a.href = url;
      a.download = it.name;
      a.rel = "noopener";
      a.target = "_blank";
      a.click();
      toast({ title: "Téléchargement", description: it.name });
    } catch (err) {
      toast({ title: "Échec téléchargement", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusyName(null);
    }
  }
}

function isPreviewable(mime: string): boolean {
  if (mime.startsWith("image/")) return true;
  if (mime === "application/pdf") return true;
  return false;
}

function formatSize(n?: number): string {
  if (!n) return "—";
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${Math.round(n / 102.4) / 10} Ko`;
  if (n < 1024 * 1024 * 1024) return `${Math.round(n / 104857.6) / 10} Mo`;
  return `${Math.round(n / 107374182.4) / 10} Go`;
}

function DocDialog(props: {
  preview: { name: string; url: string; mimeType: string } | null;
  onClose: () => void;
}): React.ReactElement {
  const open = Boolean(props.preview);
  const isImage = props.preview?.mimeType.startsWith("image/");
  const isPdf = props.preview?.mimeType === "application/pdf";
  return (
    <Dialog open={open} onOpenChange={(o) => !o && props.onClose()}>
      <DialogContent className="max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>{props.preview?.name}</DialogTitle>
        </DialogHeader>
        <div className="h-[70vh] w-full overflow-hidden rounded-lg border bg-white">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.preview?.url}
              alt={props.preview?.name ?? "document"}
              className="h-full w-full object-contain"
            />
          ) : null}
          {isPdf ? (
            <iframe
              title={props.preview?.name ?? "PDF"}
              src={props.preview?.url}
              className="h-full w-full"
            />
          ) : null}
          {!isImage && !isPdf ? (
            <div className="flex h-full items-center justify-center p-6 text-sm text-slate-600">
              Aperçu indisponible pour ce type.
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
