// path: apps/web/src/components/creator/panels/panel-settings.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  CreditCard,
  Shield,
  Bell,
  Lock,
  Check,
  AlertTriangle,
  Trash2,
  ChevronRight,
} from "lucide-react";

export function SettingsPanel() {
  const { toast } = useToast();

  const [username, setUsername] = useState("@sarahlopez");
  const [email, setEmail] = useState("sarah@example.com");
  const [iban, setIban] = useState("");
  const [usdc, setUsdc] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [invitedStatus, setInvitedStatus] = useState(true);
  const [showOnExplore, setShowOnExplore] = useState(true);
  const [consentManage, setConsentManage] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);

  const save = async (): Promise<void> => {
    try {
      // TODO: users.update({ username, email })
      toast({ title: "Settings saved successfully", variant: "success" });
    } catch (err) {
      toast({
        title: "Error saving settings",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const startKyc = async (): Promise<void> => {
    try {
      // TODO: payouts.startKyc()
      toast({
        title: "KYC verification started",
        description: "We’ve sent you an email with the next steps.",
        variant: "info",
      });
    } catch (err) {
      toast({
        title: "Failed to start KYC",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const deleteAccount = async (): Promise<void> => {
    const ok = confirm("⚠️ Are you sure you want to permanently delete your account?");
    if (!ok) return;
    try {
      // TODO: users.delete()
      toast({
        title: "Account deleted",
        description: "Your account has been permanently removed.",
        variant: "warning",
      });
    } catch (err) {
      toast({
        title: "Deletion failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="oliver-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Public Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24 rounded-2xl">
                      <AvatarImage src="" alt={username} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold rounded-2xl">
                        SL
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Change Photo
                    </Button>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label htmlFor="username">Username</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="oliver-input h-10"
                        />
                        <Badge className="oliver-badge-success">
                          <Check className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="display-name">Display name</Label>
                      <Input id="display-name" defaultValue="Sarah Lopez" className="oliver-input h-10" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" placeholder="Tell fans about yourself..." className="oliver-input h-10" />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-xs text-muted-foreground">Show as Invited</p>
                    </div>
                    <Switch checked={invitedStatus} onCheckedChange={setInvitedStatus} />
                  </div>
                </CardContent>
              </Card>

              <Card className="oliver-card">
                <CardHeader className="pb-3">
                  <CardTitle>Account Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary/5">
                    <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                    <span className="font-medium text-sm">Creator</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    <span className="text-sm text-muted-foreground">Fan</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="oliver-card">
                <CardHeader className="pb-3">
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <p className="text-sm">Show on Explore</p>
                    <Switch checked={showOnExplore} onCheckedChange={setShowOnExplore} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <p className="text-sm">Accept custom requests</p>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card className="oliver-card">
                <CardHeader className="pb-3">
                  <CardTitle>Blocked Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Michael Smith</p>
                    <Button variant="ghost" size="sm" className="text-xs text-primary h-auto p-0">
                      Unblock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="oliver-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="oliver-input h-10"
                  />
                </div>
                <Button onClick={save} className="w-full oliver-btn-primary h-10 shadow-sm">
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="oliver-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  KYC Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20">
                  <span className="text-sm font-medium">Terms of Service</span>
                  <Check className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20">
                  <span className="text-sm font-medium">Privacy Policy</span>
                  <Check className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-sm font-medium">Cookie Policy</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button onClick={startKyc} variant="outline" className="w-full rounded-xl h-10">
                  Verify Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="oliver-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  placeholder="FR76…"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="oliver-input h-10"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="usdc">USDC Address</Label>
                <Input
                  id="usdc"
                  placeholder="0x…"
                  value={usdc}
                  onChange={(e) => setUsdc(e.target.value)}
                  className="oliver-input h-10"
                />
              </div>
              <Button className="w-full oliver-btn-primary h-10 shadow-sm">
                Save Payment Methods
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal */}
        <TabsContent value="legal" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="oliver-card">
              <CardHeader className="pb-3">
                <CardTitle>Legal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Terms of Service", "Privacy Policy", "Cookie Policy", "DMCA Policy", "Community Guidelines"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-sm font-medium">{item}</span>
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            <Card className="oliver-card">
              <CardHeader className="pb-3">
                <CardTitle>Privacy & Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm font-medium">Consent manage</span>
                  <Switch checked={consentManage} onCheckedChange={setConsentManage} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm font-medium">Data sharing with partners</span>
                  <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
                </div>
                <Button variant="outline" className="w-full rounded-xl h-9 text-xs mt-2">
                  Rectify Data
                </Button>
                <Button variant="destructive" className="w-full rounded-xl h-9 text-xs" onClick={deleteAccount}>
                  Erase My Data (Right to be Forgotten)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs */}
        <TabsContent value="privacy" className="space-y-6 text-center text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-3" />
          <p>Privacy settings will be available here</p>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3" />
          <p>Notification preferences will be available here</p>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="oliver-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-3" />
              <p>Security settings will be available here</p>
            </CardContent>
          </Card>

          <Card className="oliver-card border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full rounded-xl h-10" onClick={deleteAccount}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
