// path: apps/web/src/components/admin/kyc/KycDetailView.tsx
"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { KycDocumentViewer } from "./KycDocumentViewer";
import { KycAIConfidence } from "./KycAIConfidence";
import { cn } from "@/lib/utils";

export type KycStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";
export type KycLevel = "NONE" | "BASIC" | "INTERMEDIATE" | "FULL" | "ENHANCED";
export type KycProvider =
  | "YOTI"
  | "JUMIO"
  | "STRIPE_IDENTITY"
  | "VERIFF"
  | "ONFIDO"
  | "OTHER";

export type KycUserPreview = {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  kycStatus: KycStatus;
  kycLevel: KycLevel;
};

export type KycDocItem = {
  name: string;
  mimeType: string;
  sizeBytes?: number;
  url?: string;
};

export type KycVerification = {
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
  aiScores: Record<string, number | string | boolean | null>;
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
  user?: KycUserPreview;
};

const updateSchema = z.object({
  level: z.enum(["NONE", "BASIC", "INTERMEDIATE", "FULL", "ENHANCED"]),
  note: z.string().max(500).optional(),
});
export type UpdatePayload = z.infer<typeof updateSchema>;

const decisionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().min(3).max(500).optional(),
});
export type DecisionPayload = z.infer<typeof decisionSchema>;

type Props = {
  kyc: KycVerification;
  documents: KycDocItem[];
  onUpdateLevel: (payload: UpdatePayload) => Promise<KycVerification>;
  onDecision: (payload: DecisionPayload) => Promise<KycVerification>;
  onRefresh?: () => void;
  onResolveDocUrl?: (
    name: string
  ) => Promise<{ url: string; mimeType: string; sizeBytes?: number }>;
};

export function KycDetailView(props: Props): React.ReactElement {
  const { toast } = useToast();
  const [levelDraft, setLevelDraft] = useState<KycLevel>(props.kyc.level);
  const [note, setNote] = useState<string>("");

  const statusBadge = useMemo(() => {
    const base = "text-white";
    const color =
      props.kyc.status === "VERIFIED"
        ? "bg-emerald-600"
        : props.kyc.status === "REJECTED"
        ? "bg-rose-600"
        : props.kyc.status === "UNDER_REVIEW"
        ? "bg-amber-600"
        : "bg-slate-600";
    return (
      <Badge
        className={cn(base, color)}
        aria-label={`Statut ${props.kyc.status}`}
      >
        {props.kyc.status}
      </Badge>
    );
  }, [props.kyc.status]);

  return (
    <div className="grid gap-6">
      <header
        className="rounded-2xl p-5 text-white bg-gradient-to-r from-brand-start to-brand-end"
        role="region"
        aria-label="En-tête KYC"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              KYC #{props.kyc.id.slice(0, 8)}
            </h2>
            <p className="text-sm opacity-90">
              {props.kyc.user?.displayName ?? props.kyc.user?.username} —{" "}
              {props.kyc.user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">{statusBadge}</div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Données & documents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <KV label="Fournisseur" value={props.kyc.provider} />
              <KV label="Niveau" value={props.kyc.level} />
              <KV label="Pays" value={props.kyc.country ?? "—"} />
              <KV
                label="Naissance"
                value={
                  props.kyc.dateOfBirth
                    ? new Date(props.kyc.dateOfBirth).toLocaleDateString()
                    : "—"
                }
              />
              <KV
                label="Expire"
                value={new Date(props.kyc.expiresAt).toLocaleString()}
              />
              <KV
                label="Dernière MAJ"
                value={new Date(props.kyc.updatedAt).toLocaleString()}
              />
            </div>

            <Separator />

            <KycAIConfidence
              riskScore={props.kyc.riskScore}
              selfieMatchScore={props.kyc.selfieMatchScore}
              livenessResult={props.kyc.livenessResult}
              aiScores={props.kyc.aiScores}
            />

            <Separator />

            <KycDocumentViewer
              items={props.documents}
              onResolveUrl={props.onResolveDocUrl}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="level">Niveau KYC</Label>
              <Select
                value={levelDraft}
                onValueChange={(v) => setLevelDraft(v as KycLevel)}
              >
                <SelectTrigger id="level" aria-label="Niveau KYC">
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
              <Label htmlFor="note">Note interne</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: adresse validée"
                aria-label="Note"
              />
              <Button
                onClick={async () => {
                  const parsed = updateSchema.safeParse({
                    level: levelDraft,
                    note: note || undefined,
                  });
                  if (!parsed.success) {
                    toast({
                      title: "Entrée invalide",
                      description: "Vérifie le niveau/la note.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    const res = await props.onUpdateLevel(parsed.data);
                    toast({
                      title: "Niveau mis à jour",
                      description: `Niveau: ${res.level}`,
                      // shadcn: pas de "success", on laisse "default"
                    });
                    props.onRefresh?.();
                  } catch (err) {
                    toast({
                      title: "Échec mise à jour",
                      description: (err as Error).message,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Mettre à jour
              </Button>
            </div>

            <Separator />

            <div className="grid gap-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={async () => {
                  try {
                    const res = await props.onDecision({ action: "APPROVE" });
                    toast({
                      title: "KYC approuvé",
                      description: res.id,
                    }); // success -> default
                    props.onRefresh?.();
                  } catch (err) {
                    toast({
                      title: "Échec approbation",
                      description: (err as Error).message,
                      variant: "destructive",
                    });
                  }
                }}
                disabled={props.kyc.status === "VERIFIED"}
                aria-disabled={props.kyc.status === "VERIFIED"}
              >
                Approuver
              </Button>

              <Button
                variant="destructive"
                onClick={async () => {
                  const ok = confirm(
                    "Confirmer le rejet KYC ? Cette action est bloquante."
                  );
                  if (!ok) return;
                  const reason =
                    prompt("Raison du rejet (3–500 caractères) ?") ?? "";
                  const parsed = decisionSchema.safeParse({
                    action: "REJECT",
                    reason,
                  });
                  if (!parsed.success) {
                    toast({
                      title: "Raison invalide",
                      description: "3–500 caractères.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    const res = await props.onDecision(parsed.data);
                    toast({
                      title: "KYC rejeté",
                      description:
                        res.rejectionReason ?? "Rejet effectué.",
                    }); // warning -> default
                    props.onRefresh?.();
                  } catch (err) {
                    toast({
                      title: "Échec rejet",
                      description: (err as Error).message,
                      variant: "destructive",
                    });
                  }
                }}
                disabled={props.kyc.status === "REJECTED"}
                aria-disabled={props.kyc.status === "REJECTED"}
              >
                Rejeter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KV(props: { label: string; value: string }): React.ReactElement {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-slate-600">{props.label}</div>
      <div className="text-sm font-medium">{props.value}</div>
    </div>
  );
}
