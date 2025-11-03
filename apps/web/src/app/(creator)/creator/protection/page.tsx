/**
 * Creator Protection Settings Page - F5 Anti-Leak
 * Configure watermark and token protection settings
 */

'use client';
// Désactiver le pré-rendering statique pour cette page
// car elle utilise des composants (Slider) qui nécessitent le navigateur
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Slider from '@/components/ui/Slider.client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import dynamicImport from 'next/dynamic';
const WatermarkOverlay = dynamicImport(() => import('@/components/media/WatermarkOverlay').then(mod => mod.WatermarkOverlay), { ssr: false });
import type { WatermarkConfig, TokenConfig } from '@/types/protection';
import { watermarkConfigSchema, tokenConfigSchema } from '@/types/protection';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, Clock } from 'lucide-react';

export default function ProtectionSettingsPage() {
  const { toast } = useToast();

  // Watermark config state
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    enabled: true,
    opacity: 30,
    interval: '30',
  });

  // Token config state
  const [tokenConfig, setTokenConfig] = useState<TokenConfig>({
    ttl: '15',
  });

  /**
   * Handle watermark enabled toggle
   */
  const handleEnabledChange = (checked: boolean) => {
    setWatermarkConfig((prev) => ({ ...prev, enabled: checked }));
  };

  /**
   * Handle opacity slider change
   */
  const handleOpacityChange = (value: number[]) => {
    setWatermarkConfig((prev) => ({ ...prev, opacity: value[0] }));
  };

  /**
   * Handle interval select change
   */
  const handleIntervalChange = (value: string) => {
    setWatermarkConfig((prev) => ({ ...prev, interval: value as '15' | '30' | '60' }));
  };

  /**
   * Handle TTL select change
   */
  const handleTtlChange = (value: string) => {
    setTokenConfig({ ttl: value as '5' | '15' | '30' | '60' });
  };

  /**
   * Save settings (mock implementation)
   */
  const handleSave = async () => {
    try {
      // Validate with Zod
      const validWatermark = watermarkConfigSchema.parse(watermarkConfig);
      const validToken = tokenConfigSchema.parse(tokenConfig);

      // In production, this would be an API call:
      // await fetch('/api/creator/protection', {
      //   method: 'PUT',
      //   body: JSON.stringify({ watermark: validWatermark, token: validToken }),
      // });

      toast({
        title: 'Settings Saved',
        description: 'Your protection settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Validation Error',
        description: error instanceof Error ? error.message : 'Invalid settings',
        variant: 'destructive',
      });
    }
  };

  /**
   * Reset to defaults
   */
  const handleReset = () => {
    setWatermarkConfig({
      enabled: true,
      opacity: 30,
      interval: '30',
    });
    setTokenConfig({
      ttl: '15',
    });

    toast({
      title: 'Settings Reset',
      description: 'Protection settings have been reset to defaults.',
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Content Protection</h1>
        </div>
        <p className="text-muted-foreground">
          Configure watermark and token settings to protect your premium content from leaks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Watermark Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle>Watermark Settings</CardTitle>
              </div>
              <CardDescription>
                Configure the dynamic fingerprint overlay that appears on your protected content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="watermark-enabled" className="flex flex-col gap-1">
                  <span>Enable Watermark</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Show user fingerprint on protected media
                  </span>
                </Label>
                <Checkbox
                  id="watermark-enabled"
                  checked={watermarkConfig.enabled}
                  onCheckedChange={handleEnabledChange}
                />
              </div>

              {/* Opacity Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="watermark-opacity">
                    Opacity
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {watermarkConfig.opacity}%
                  </span>
                </div>
                <Slider
                  id="watermark-opacity"
                  min={0}
                  max={100}
                  step={5}
                  value={[watermarkConfig.opacity]}
                  onValueChange={handleOpacityChange}
                  disabled={!watermarkConfig.enabled}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher opacity makes the watermark more visible but may distract viewers.
                </p>
              </div>

              {/* Interval Select */}
              <div className="space-y-2">
                <Label htmlFor="watermark-interval">
                  Position Change Interval
                </Label>
                <Select
                  value={watermarkConfig.interval}
                  onValueChange={handleIntervalChange}
                  disabled={!watermarkConfig.enabled}
                >
                  <SelectTrigger id="watermark-interval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Every 15 seconds</SelectItem>
                    <SelectItem value="30">Every 30 seconds</SelectItem>
                    <SelectItem value="60">Every 60 seconds</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How often the watermark moves to a new random position.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Token Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Token Settings</CardTitle>
              </div>
              <CardDescription>
                Configure playback token expiration time (Time To Live).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TTL Select */}
              <div className="space-y-2">
                <Label htmlFor="token-ttl">
                  Token Expiration (TTL)
                </Label>
                <Select
                  value={tokenConfig.ttl}
                  onValueChange={handleTtlChange}
                >
                  <SelectTrigger id="token-ttl">
                    <SelectValue placeholder="Select TTL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tokens auto-refresh 60 seconds before expiry. Shorter TTL = more secure.
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">How tokens work:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Each playback session gets a unique single-use token</li>
                  <li>Tokens automatically refresh before expiration</li>
                  <li>Expired tokens block playback until refreshed</li>
                  <li>Prevents unauthorized sharing of media URLs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how the watermark will appear on your protected content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Preview Container */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-lg overflow-hidden border border-border">
                {/* Mock Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-primary/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">Your protected content</p>
                  </div>
                </div>

                {/* Watermark Overlay */}
                {watermarkConfig.enabled && (
                  <WatermarkOverlay
                    userId="user123"
                    username="creator"
                    config={watermarkConfig}
                  />
                )}
              </div>

              {/* Preview Info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Format:</p>
                    <code className="text-xs text-muted-foreground">
                      @{'{username}'} · #{'{userId}'} · {'{HH:MM:SS}'}
                    </code>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Eye className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Behavior:</p>
                    <p className="text-xs text-muted-foreground">
                      The watermark moves to a random position every {watermarkConfig.interval} seconds
                      and displays the current time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Dynamic Watermark</p>
                    <p className="text-xs text-muted-foreground">
                      Unique user identifier with timestamp, moves periodically
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Single-Use Tokens</p>
                    <p className="text-xs text-muted-foreground">
                      Each token can only be used once, preventing URL sharing
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Auto-Refresh</p>
                    <p className="text-xs text-muted-foreground">
                      Tokens refresh 60s before expiry for seamless playback
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Anti-Copy Protection</p>
                    <p className="text-xs text-muted-foreground">
                      Right-click disabled, drag prevention, download blocking
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
