// apps/web/src*app/(creator)/creator/page.tsx
"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Banknote,
  Users,
  Wrench,
  Settings as SettingsIcon,
} from "lucide-react";

import { CreatorShell } from "@/components/layout/CreatorShell";
import { NavItem } from "@/components/layout/SideNav";

import { DashboardTab } from "@/components/creator/tabs/DashboardTab";
import { RevenueTab } from "@/components/creator/tabs/RevenueTab";
import { CrmTab } from "@/components/creator/tabs/CrmTab";
import { ToolsTab } from "@/components/creator/tabs/ToolsTab";
import { SettingsTab } from "@/components/creator/tabs/SettingsTab";

const TABS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "revenue", label: "Revenue", icon: Banknote },
  { key: "crm", label: "CRM", icon: Users },
  { key: "tools", label: "Tools", icon: Wrench },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function CreatorPage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "revenue":
        return <RevenueTab />;
      case "crm":
        return <CrmTab />;
      case "tools":
        return <ToolsTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <CreatorShell activeTab={activeTab} onTabChange={setActiveTab} tabs={TABS}>
      {renderTab()}
    </CreatorShell>
  );
}
