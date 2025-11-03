"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";

export function AiTab() {
  return (
    <div className="space-y-8">
      <Card className="oliver-card hover:shadow-md transition-shadow duration-200 ease-out">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">AI Features</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Coming soon — AI-powered content generation, audience insights, and automated engagement tools.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
