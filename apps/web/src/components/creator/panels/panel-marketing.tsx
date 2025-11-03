// path: apps/web/src/components/creator/panels/panel-marketing.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tag, Package, Percent, TrendingUp, Plus, Check } from "lucide-react";

export const MarketingPanel: React.FC = () => {
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [percent, setPercent] = useState<number | "">("");
  const [bundlePosts, setBundlePosts] = useState("");
  const [bundlePrice, setBundlePrice] = useState<number | "">("");

  // Validations
  const percentNum = typeof percent === "string" ? Number(percent) : percent;
  const percentValid = Number.isFinite(percentNum) && (percentNum as number) >= 0 && (percentNum as number) <= 100;

  const bundlePriceNum = typeof bundlePrice === "string" ? Number(bundlePrice) : bundlePrice;
  const bundlePriceValid = Number.isFinite(bundlePriceNum) && (bundlePriceNum as number) >= 0;

  const onCreatePromo = async () => {
    if (!code.trim() || !percentValid) {
      toast({
        title: "Champs invalides",
        description: "Renseigne un code et un pourcentage entre 0 et 100.",
        variant: "destructive",
      });
      return;
    }
    // TODO: market.createPromo({ code, percent: percentNum })
    toast({
      title: "Code promo créé",
      description: `« ${code.toUpperCase()} » appliquera ${percentNum}%`,
      variant: "success",
    });
    setCode("");
    setPercent("");
  };

  const onCreateBundle = async () => {
    if (!bundlePosts.trim() || !bundlePriceValid) {
      toast({
        title: "Champs invalides",
        description: "Liste de posts et prix (≥ 0) requis.",
        variant: "destructive",
      });
      return;
    }
    // TODO: market.createBundle({ postIds, price: bundlePriceNum })
    toast({
      title: "Bundle créé",
      description: `Prix €${(bundlePriceNum as number).toFixed(2)} pour « ${bundlePosts} »`,
      variant: "success",
    });
    setBundlePosts("");
    setBundlePrice("");
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="oliver-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">8</p>
                <p className="text-xs text-muted-foreground">Active Promos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">12</p>
                <p className="text-xs text-muted-foreground">Bundles Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">€1,234</p>
                <p className="text-xs text-muted-foreground">Promo Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Percent className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">23%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Forms */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Promo Code */}
        <Card className="oliver-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Create Promo Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="promo-code" className="text-sm font-medium">Promo Code</Label>
              <Input
                id="promo-code"
                placeholder="OLIVER10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="oliver-input h-11"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="promo-percent" className="text-sm font-medium">Discount (%)</Label>
              <Input
                id="promo-percent"
                type="number"
                inputMode="numeric"
                placeholder="10"
                value={percent}
                onChange={(e) => setPercent(e.target.value as any)}
                className="oliver-input h-11"
              />
              {!percentValid && percent !== "" && (
                <p className="text-xs text-destructive">Entrez un pourcentage valide (0–100).</p>
              )}
            </div>
            <Button
              onClick={onCreatePromo}
              disabled={!code || !percentValid}
              className="w-full oliver-btn-primary h-11 shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Promo Code
            </Button>
          </CardContent>
        </Card>

        {/* Bundle */}
        <Card className="oliver-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Create PPV Bundle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="bundle-posts" className="text-sm font-medium">
                Post IDs (comma separated)
              </Label>
              <Input
                id="bundle-posts"
                placeholder="post_123, post_456"
                value={bundlePosts}
                onChange={(e) => setBundlePosts(e.target.value)}
                className="oliver-input h-11"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="bundle-price" className="text-sm font-medium">Bundle Price (€)</Label>
              <Input
                id="bundle-price"
                type="number"
                inputMode="decimal"
                placeholder="12.90"
                value={bundlePrice}
                onChange={(e) => setBundlePrice(e.target.value as any)}
                className="oliver-input h-11"
              />
            </div>
            <Button
              onClick={onCreateBundle}
              disabled={!bundlePosts || !bundlePriceValid}
              className="w-full oliver-btn-primary h-11 shadow-md"
              aria-disabled={!bundlePosts || !bundlePriceValid}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Bundle
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns (mock) */}
      <Card className="oliver-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold tracking-tight">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">SUMMER20</p>
                  <p className="text-xs text-muted-foreground">20% discount • 45 uses</p>
                </div>
              </div>
              <Badge className="oliver-badge-success">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Premium Bundle</p>
                  <p className="text-xs text-muted-foreground">€19.99 • 8 items • 23 sold</p>
                </div>
              </div>
              <Badge className="oliver-badge-success">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">WELCOME10</p>
                  <p className="text-xs text-muted-foreground">10% discount • 128 uses</p>
                </div>
              </div>
              <Badge className="oliver-badge-success">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ✅ export par défaut ET export nommé
export default MarketingPanel;
