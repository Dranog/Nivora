// path: apps/web/src/app/admin/kyc/[id]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type KycStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";
type KycLevel = "NONE" | "BASIC" | "INTERMEDIATE" | "FULL" | "ENHANCED";
type KycProvider = "YOTI" | "JUMIO" | "STRIPE_IDENTITY" | "VERIFF" | "ONFIDO" | "OTHER";

type KycVerification = {
  id: string;
  userId: string;
  provider: KycProvider;
  externalId: string | null;
  status: KycStatus;
  level: KycLevel;
  documents: Record<string, unknown>;
  documentKeys: Record<string, unknown>;
  personalData: Record<string, unknown>;
  piiEncrypted: boolean;
  aiScores: Record<string, unknown>;
  riskScore: number | null;
  selfieMatchScore: number | null;
  livenessResult: string | null;
  country: string | null;
  dateOfBirth: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  expiresAt: string;
  recheckAt: string | null;
  webhookEvents: unknown[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
    kycStatus: KycStatus;
    kycLevel: KycLevel;
  };
};

const updateSchema = z.object({
  level: z.enum(["NONE", "BASIC", "INTERMEDIATE", "FULL", "ENHANCED"]),
  note: z.string().max(500).optional(),
});
type UpdatePayload = z.infer<typeof updateSchema>;

const decisionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().min(3).max(500).optional(),
});
type DecisionPayload = z.infer<typeof decisionSchema>;

async function getKyc(id: string): Promise<KycVerification> {
  const res = await fetch(`/api/admin/kyc/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur chargement KYC (${res.status})`);
  return (await res.json()) as KycVerification;
}

async function patchKycLevel(id: string, body: UpdatePayload): Promise<KycVerification> {
  const res = await fetch(`/api/admin/kyc/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Erreur mise à jour (${res.status})`);
  return (await res.json()) as KycVerification;
}

async function postDecision(id: string, body: DecisionPayload): Promise<KycVerification> {
  const res = await fetch(`/api/admin/kyc/${id}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Erreur décision (${res.status})`);
  return (await res.json()) as KycVerification;
}

export default function KycDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { toast } = useToast();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["kyc", id],
    queryFn: () => getKyc(id),
  });

  const [levelDraft, setLevelDraft] = useState<KycLevel>("NONE");
  const [note, setNote] = useState<string>("");

  const mUpdate = useMutation({
    mutationFn: (payload: UpdatePayload) => patchKycLevel(id, payload),
    onSuccess: (res) => {
      qc.setQueryData(["kyc", id], res);
      toast({
        title: "Niveau KYC mis à jour",
        description: `Niveau: ${res.level}`,
        variant: "success", // ✅ valid
      });
    },
    onError: (e) => {
      toast({
        title: "Échec mise à jour",
        description: (e as Error).message,
        variant: "error", // ✅ valid
      });
    },
  });

  const mDecision = useMutation({
    mutationFn: (payload: DecisionPayload) => postDecision(id, payload),
    onSuccess: (res) => {
      qc.setQueryData(["kyc", id], res);
      toast({
        title: res.status === "VERIFIED" ? "KYC approuvé" : "KYC rejeté",
        description:
          res.status === "VERIFIED" ? "Le compte est vérifié." : "Le compte a été rejeté.",
        variant: res.status === "VERIFIED" ? "success" : "warning", 
      });
    },
    onError: (e) => {
      toast({
        title: "Échec décision",
        description: (e as Error).message,
        variant: "error", 
      });
    },
  });

  const headerBadge = useMemo(() => {
    if (!data) return null;
    const color =
      data.status === "VERIFIED"
        ? "bg-emerald-600"
        : data.status === "REJECTED"
        ? "bg-rose-600"
        : data.status === "UNDER_REVIEW"
        ? "bg-amber-600"
        : "bg-slate-600";
    return (
      <Badge className={cn("text-white", color)} aria-label={`Statut ${data.status}`}>
        {data.status}
      </Badge>
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-10 w-64 rounded-xl bg-gradient-to-r from-brand-start to-brand-end text-transparent animate-pulse">
          .
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card><CardContent className="h-40 animate-pulse" /></Card>
          <Card><CardContent className="h-40 animate-pulse" /></Card>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600" role="alert">
              {(error as Error)?.message ?? "Impossible de charger la vérification KYC."}
            </p>
            <Button className="mt-3" onClick={() => router.refresh()} aria-label="Recharger">
              Recharger
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div
        className="rounded-2xl p-5 text-white bg-gradient-to-r from-brand-start to-brand-end focus-visible:outline-none"
        role="region"
        aria-label="En-tête KYC"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">KYC #{data.id.slice(0, 8)}</h1>
            <p className="text-sm opacity-90">
              Utilisateur: {data.user?.displayName ?? data.user?.username} — {data.user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">{headerBadge}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Fournisseur" value={data.provider} />
              <Detail label="Niveau" value={data.level} />
              <Detail label="Risque" value={data.riskScore !== null ? String(data.riskScore) : "—"} />
              <Detail label="Selfie Match" value={data.selfieMatchScore !== null ? String(data.selfieMatchScore) : "—"} />
              <Detail label="Pays" value={data.country ?? "—"} />
              <Detail label="Date de naissance" value={data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : "—"} />
              <Detail label="Expire le" value={new Date(data.expiresAt).toLocaleString()} />
              <Detail label="Dernière mise à jour" value={new Date(data.updatedAt).toLocaleString()} />
            </div>

            <div>
              <Label>Scores IA</Label>
              <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
                {JSON.stringify(data.aiScores, null, 2)}
              </pre>
            </div>

            <div>
              <Label>Documents</Label>
              <ScrollArea className="mt-2 h-40 rounded-lg border p-3">
                <ul className="list-disc pl-6 text-sm">
                  {Object.entries(data.documentKeys ?? {}).map(([k, v]) => (
                    <li key={k}>
                      <span className="font-medium">{k}:</span>{" "}
                      {typeof v === "string" ? v : JSON.stringify(v)}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="level">Niveau</Label>
              <Select
                value={levelDraft}
                onValueChange={(v) => setLevelDraft(v as KycLevel)}
              >
                <SelectTrigger id="level" aria-label="Sélectionner niveau KYC">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">NONE</SelectItem>
                  <SelectItem value="BASIC">BASIC</SelectItem>
                  <SelectItem value="INTERMEDIATE">INTERMEDIATE</SelectItem>
                  <SelectItem value="FULL">FULL</SelectItem>
                  <SelectItem value="ENHANCED">ENHANCED</SelectItem>
                </SelectContent>
              </Select>

              <Label htmlFor="note" className="mt-2">Note interne</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: vérif doc. adresse OK"
                aria-label="Note interne"
              />

              <Button
                className="mt-2"
                onClick={() => {
                  const payload = updateSchema.parse({
                    level: levelDraft,
                    note: note || undefined,
                  });
                  mUpdate.mutate(payload);
                }}
                disabled={mUpdate.isPending}
                aria-disabled={mUpdate.isPending}
              >
                {mUpdate.isPending ? "Mise à jour..." : "Mettre à jour le niveau"}
              </Button>
            </div>

            <hr className="my-2" />

            <div className="grid gap-2">
              <Button
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  const payload = decisionSchema.parse({ action: "APPROVE" });
                  mDecision.mutate(payload);
                }}
                disabled={mDecision.isPending || data.status === "VERIFIED"}
                aria-disabled={mDecision.isPending || data.status === "VERIFIED"}
              >
                {mDecision.isPending ? "Validation..." : "Approuver"}
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  const ok = confirm(
                    "Confirmer le rejet KYC ? Cette action est potentiellement bloquante."
                  );
                  if (!ok) return;
                  const reason =
                    prompt("Raison du rejet (optionnelle, 3–500 caractères) ?") ?? undefined;
                  const parsed = decisionSchema.safeParse({ action: "REJECT", reason });
                  if (!parsed.success) {
                    toast({
                      title: "Raison invalide",
                      description: "3–500 caractères si fournie.",
                      variant: "error",
                    });
                    return;
                  }
                  mDecision.mutate(parsed.data);
                }}
                disabled={mDecision.isPending || data.status === "REJECTED"}
                aria-disabled={mDecision.isPending || data.status === "REJECTED"}
              >
                {mDecision.isPending ? "Rejet..." : "Rejeter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail(props: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-slate-600">{props.label}</div>
      <div className="text-sm font-medium">{props.value}</div>
    </div>
  );
}
