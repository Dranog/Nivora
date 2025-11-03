"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

/**
 * ToolsDashboard — Creator Tools & Automation
 * Clean placeholder for future AI and marketing features
 */
export function ToolsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Creator Tools & Automation</h2>
        <p className="text-muted-foreground">
          Powerful tools to help you grow your audience and automate your workflow
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Creator Assistant (beta) */}
        <Card className="oliver-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                Creator Assistant
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered assistant to help you manage your content, engage with fans, and automate
              repetitive tasks. Coming soon with intelligent chat support, content suggestions,
              and workflow automation.
            </p>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Planned features:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>AI chat assistant for fan engagement</li>
                <li>Automated content scheduling</li>
                <li>Smart response suggestions</li>
                <li>Performance insights & recommendations</li>
              </ul>
            </div>

            <Button
              disabled
              variant="outline"
              className="w-full h-10 mt-2"
            >
              Learn more
            </Button>
          </CardContent>
        </Card>

        {/* Marketing Suite (coming soon) */}
        <Card className="oliver-card shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Marketing Suite
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Coming Soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Comprehensive marketing tools to grow your audience and maximize revenue.
              Build campaigns, track performance, and engage your fanbase with data-driven strategies.
            </p>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Planned features:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Campaign builder & management</li>
                <li>Advanced analytics & reporting</li>
                <li>Promotional code generator</li>
                <li>A/B testing for content</li>
              </ul>
            </div>

            <Button
              disabled
              variant="outline"
              className="w-full h-10 mt-2"
            >
              Learn more
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
