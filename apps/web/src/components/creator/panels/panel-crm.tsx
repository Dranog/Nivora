"use client";

const MOCK = true;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Search,
  Users,
  Shield,
  Image as ImageIcon,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * CrmPanel — Fan Management / Protection / Bundles
 * TODO: brancher la data sur tes endpoints (app/_api/crm.ts, app/_api/tickets.ts)
 */
export function CrmPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"All" | "Subscribed" | "Unreached">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const exportCsv = () => {
    // TODO: récupérer la liste email et générer un CSV
    // Exemple simple (UI)
    const csv = "email\nalice@example.com\nbob@example.com\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fans.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mock fan data with badges
  const allFans = [
    { id: 1, name: "Alice Cooper", email: "alice@example.com", joinDate: "01/03/2024", status: "Subscribed", badges: ["Top fan"], avatar: "" },
    { id: 2, name: "Bob Wilson", email: "bob@example.com", joinDate: "15/02/2024", status: "Subscribed", badges: ["New"], avatar: "" },
    { id: 3, name: "Carol Jones", email: "carol@example.com", joinDate: "28/01/2024", status: "Subscribed", badges: [], avatar: "" },
    { id: 4, name: "Michael Brown", email: "michael@example.com", joinDate: "10/12/2023", status: "Unreached", badges: [], avatar: "" },
    { id: 5, name: "Sarah Davis", email: "sarah@example.com", joinDate: "20/03/2024", status: "Subscribed", badges: ["New", "Top fan"], avatar: "" },
    { id: 6, name: "John Smith", email: "john@example.com", joinDate: "05/02/2024", status: "Subscribed", badges: [], avatar: "" },
    { id: 7, name: "Emma Thompson", email: "emma@example.com", joinDate: "12/01/2024", status: "Unreached", badges: [], avatar: "" },
    { id: 8, name: "David Lee", email: "david@example.com", joinDate: "18/03/2024", status: "Subscribed", badges: ["Top fan"], avatar: "" },
    { id: 9, name: "Lisa Martin", email: "lisa@example.com", joinDate: "25/02/2024", status: "Unreached", badges: [], avatar: "" },
    { id: 10, name: "Tom Anderson", email: "tom@example.com", joinDate: "08/03/2024", status: "Subscribed", badges: ["New"], avatar: "" },
  ];

  // Filter fans based on status filter
  const filteredFans = allFans.filter((fan) => {
    if (statusFilter !== "All" && fan.status !== statusFilter) return false;
    if (searchQuery && !fan.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !fan.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Paginate fans
  const totalPages = Math.ceil(filteredFans.length / itemsPerPage);
  const paginatedFans = filteredFans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: "All" | "Subscribed" | "Unreached") => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="oliver-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">1,234</p>
                <p className="text-xs text-muted-foreground">Total Fans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">567</p>
                <p className="text-xs text-muted-foreground">Subscribed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">89</p>
                <p className="text-xs text-muted-foreground">Unreached</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="oliver-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">12</p>
                <p className="text-xs text-muted-foreground">Takedowns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fan List - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filters */}
          <Card className="oliver-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search fans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 oliver-input h-10"
                  />
                </div>
                <Button onClick={exportCsv} className="oliver-btn-primary h-10 shadow-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Filter:</span>
                <Button
                  variant={statusFilter === "All" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("All")}
                  className="h-8 px-3"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "Subscribed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("Subscribed")}
                  className="h-8 px-3"
                >
                  Subscribed
                </Button>
                <Button
                  variant={statusFilter === "Unreached" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("Unreached")}
                  className="h-8 px-3"
                >
                  Unreached
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fan Table */}
          <Card className="oliver-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Fan List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fan</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFans.map((fan) => (
                    <TableRow key={fan.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={fan.avatar} alt={fan.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {fan.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{fan.name}</p>
                              {fan.badges.map((badge) => (
                                <Badge
                                  key={badge}
                                  variant="outline"
                                  className={
                                    badge === "New"
                                      ? "text-xs px-1.5 py-0 h-5 bg-info/10 text-info border-info/30"
                                      : badge === "Top fan"
                                      ? "text-xs px-1.5 py-0 h-5 bg-warning/10 text-warning border-warning/30"
                                      : "text-xs px-1.5 py-0 h-5"
                                  }
                                >
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{fan.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{fan.joinDate}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            fan.status === "Subscribed"
                              ? "oliver-badge-success"
                              : fan.status === "Active"
                              ? "oliver-badge-primary"
                              : "oliver-badge-warning"
                          }
                        >
                          {fan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-xs">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredFans.length)} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredFans.length)} of {filteredFans.length} fans
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Protection & Tools */}
        <div className="space-y-4">
          {/* Takedown Requests */}
          <Card className="oliver-card border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Takedown Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">2 new requests</p>
                  <p className="text-xs text-muted-foreground">Requires action</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Button className="w-full oliver-btn-primary h-9 shadow-sm text-sm">
                Submit DMCA
              </Button>
            </CardContent>
          </Card>

          {/* Watermark Settings */}
          <Card className="oliver-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Watermark Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Enable Watermark</p>
                  <p className="text-xs text-muted-foreground">Protect your content</p>
                </div>
                <Switch checked={watermarkEnabled} onCheckedChange={setWatermarkEnabled} />
              </div>
              {watermarkEnabled && (
                <div className="pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                    Configure Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fingerprint Logo */}
          <Card className="oliver-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Fingerprint Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-20 rounded-xl bg-muted/30 border border-dashed border-border flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No logo uploaded</p>
              </div>
              <Button variant="outline" size="sm" className="w-full rounded-xl text-xs">
                Upload Logo
              </Button>
            </CardContent>
          </Card>

          {/* Bundles */}
          <Card className="oliver-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Bundles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Premium Pack</p>
                  <p className="text-xs text-muted-foreground">€19.99 • 8 items</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full rounded-xl text-xs mt-2">
                Manage Bundles
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="oliver-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Response rate</span>
                <span className="font-semibold">94%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. response time</span>
                <span className="font-semibold">2.3h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Satisfaction</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">4.8</span>
                  <span className="text-xs text-muted-foreground">/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
