// path: apps/web/src/components/admin/kyc/KycAIConfidence.tsx
"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

type ScoresRecord = Record<string, number | string | boolean | null>;

type Props = {
  riskScore: number | null;
  selfieMatchScore: number | null;
  livenessResult: string | null;
  aiScores: ScoresRecord;
};

export function KycAIConfidence(props: Props): React.ReactElement {
  const risk = clamp01(props.riskScore ?? 0);
  const selfie = clamp01(props.selfieMatchScore ?? 0);

  const riskLevel = useMemo(() => {
    if (risk >= 0.8) return { label: "Élevé", className: "bg-rose-600 text-white" };
    if (risk >= 0.5) return { label: "Moyen", className: "bg-amber-600 text-white" };
    return { label: "Faible", className: "bg-emerald-600 text-white" };
  }, [risk]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confiance IA & signaux</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            title="Risque"
            value={`${Math.round(risk * 100)}%`}
            badge={<Badge className={riskLevel.className}>{riskLevel.label}</Badge>}
          />
          <Metric title="Selfie Match" value={`${Math.round(selfie * 100)}%`} />
          <Metric title="Liveness" value={props.livenessResult ?? "—"} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Bar title="Risque (0→100)" value={risk * 100} />
          <Bar title="Selfie Match (0→100)" value={selfie * 100} />
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium">Détails bruts</h4>
          <ScrollArea className="max-h-48 rounded-lg border p-3">
            <pre className="whitespace-pre-wrap break-words text-xs">
              {JSON.stringify(props.aiScores, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric(props: { title: string; value: string; badge?: React.ReactElement }): React.ReactElement {
  return (
    <div className="rounded-lg border p-3" role="group" aria-label={props.title}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-600">{props.title}</div>
        {props.badge ?? null}
      </div>
      <div className="mt-1 text-lg font-semibold">{props.value}</div>
    </div>
  );
}

function Bar(props: { title: string; value: number }): React.ReactElement {
  const v = Math.max(0, Math.min(100, Math.round(props.value)));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-slate-600">{props.title}</span>
        <span className="text-xs font-medium">{v}%</span>
      </div>
      <Progress value={v} aria-label={props.title} />
    </div>
  );
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
