// apps/web/app/(admin)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings, useResetApiKey } from '@/hooks/admin/useSettings';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw, Save, Shield, Bell, Users, Settings as SettingsIcon, Trash2, Plus } from 'lucide-react';

interface SettingsFormData {
  platformName: string;
  contactEmail: string;
  supportEmail: string;
  darkMode: boolean;
  autoBackup: boolean;
  showTooltips: boolean;
  maintenanceMode: boolean;
  passwordLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  require2FA: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  allowedIPs: string[];
  emailNotifications: boolean;
  slackNotifications: boolean;
  notifyOnNewUser: boolean;
  notifyOnKYC: boolean;
  notifyOnReport: boolean;
  notifyOnTransaction: boolean;
  slackWebhookUrl: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const resetApiKeyMutation = useResetApiKey();

  const [formData, setFormData] = useState<SettingsFormData>({
    platformName: 'OLIVER',
    contactEmail: 'contact@oliver.com',
    supportEmail: 'support@oliver.com',
    darkMode: false,
    autoBackup: true,
    showTooltips: true,
    maintenanceMode: false,
    passwordLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    require2FA: false,
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    allowedIPs: [],
    emailNotifications: true,
    slackNotifications: false,
    notifyOnNewUser: true,
    notifyOnKYC: true,
    notifyOnReport: true,
    notifyOnTransaction: false,
    slackWebhookUrl: '',
  });

  const [newIP, setNewIP] = useState('');
  const [roles, setRoles] = useState([
    { id: '1', name: 'ADMIN', permissions: ['all'], color: 'bg-red-100 text-red-800' },
    { id: '2', name: 'MODERATOR', permissions: ['users.read', 'reports.moderate', 'kyc.approve'], color: 'bg-blue-100 text-blue-800' },
    { id: '3', name: 'SENIOR_MODERATOR', permissions: ['users.read', 'reports.moderate', 'kyc.approve', 'users.suspend'], color: 'bg-purple-100 text-purple-800' },
  ]);

  useEffect(() => {
    if (settings) {
      setFormData({
        platformName: settings.platformName || 'OLIVER',
        contactEmail: settings.contactEmail || 'contact@oliver.com',
        supportEmail: settings.supportEmail || 'support@oliver.com',
        darkMode: settings.darkMode || false,
        autoBackup: settings.autoBackup !== undefined ? settings.autoBackup : true,
        showTooltips: settings.showTooltips !== undefined ? settings.showTooltips : true,
        maintenanceMode: settings.maintenanceMode || false,
        passwordLength: settings.passwordLength || 8,
        passwordRequireUppercase: settings.passwordRequireUppercase !== undefined ? settings.passwordRequireUppercase : true,
        passwordRequireLowercase: settings.passwordRequireLowercase !== undefined ? settings.passwordRequireLowercase : true,
        passwordRequireNumbers: settings.passwordRequireNumbers !== undefined ? settings.passwordRequireNumbers : true,
        passwordRequireSymbols: settings.passwordRequireSymbols || false,
        require2FA: settings.require2FA || false,
        sessionTimeout: settings.sessionTimeout || 3600,
        maxLoginAttempts: settings.maxLoginAttempts || 5,
        allowedIPs: settings.allowedIPs || [],
        emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
        slackNotifications: settings.slackNotifications || false,
        notifyOnNewUser: settings.notifyOnNewUser !== undefined ? settings.notifyOnNewUser : true,
        notifyOnKYC: settings.notifyOnKYC !== undefined ? settings.notifyOnKYC : true,
        notifyOnReport: settings.notifyOnReport !== undefined ? settings.notifyOnReport : true,
        notifyOnTransaction: settings.notifyOnTransaction || false,
        slackWebhookUrl: settings.slackWebhookUrl || '',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    }
  };

  const handleResetApiKey = async () => {
    if (!confirm('Are you sure? This will invalidate the current API key and break any integrations using it.')) return;

    try {
      const result = await resetApiKeyMutation.mutateAsync();
      toast({
        title: 'API Key Reset',
        description: 'New API key has been generated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset API key.',
        variant: 'destructive',
      });
    }
  };

  const handleAddIP = () => {
    if (!newIP.trim()) return;
    
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIP)) {
      toast({
        title: 'Invalid IP',
        description: 'Please enter a valid IP address',
        variant: 'destructive',
      });
      return;
    }

    if (formData.allowedIPs.includes(newIP)) {
      toast({
        title: 'Duplicate IP',
        description: 'This IP address is already in the list',
        variant: 'destructive',
      });
      return;
    }

    setFormData({
      ...formData,
      allowedIPs: [...formData.allowedIPs, newIP],
    });
    setNewIP('');
  };

  const handleRemoveIP = (ip: string) => {
    setFormData({
      ...formData,
      allowedIPs: formData.allowedIPs.filter(i => i !== ip),
    });
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(settings?.apiKey || '');
    toast({ 
      title: 'Copied!', 
      description: 'API key copied to clipboard' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B8A9]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your platform configuration and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-[#00B8A9] hover:bg-[#00A395]"
          disabled={updateMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Configuration</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Platform Name
                  </label>
                  <Input
                    value={formData.platformName}
                    onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                    placeholder="e.g., OLIVER"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@oliver.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Support Email
                </label>
                <Input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  placeholder="support@oliver.com"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Dark Mode</p>
                      <p className="text-sm text-gray-600">Enable dark theme for admin panel</p>
                    </div>
                    <Switch
                      checked={formData.darkMode}
                      onCheckedChange={(checked) => setFormData({ ...formData, darkMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Auto Backup</p>
                      <p className="text-sm text-gray-600">Automatically backup database daily at 3 AM</p>
                    </div>
                    <Switch
                      checked={formData.autoBackup}
                      onCheckedChange={(checked) => setFormData({ ...formData, autoBackup: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Show Tooltips</p>
                      <p className="text-sm text-gray-600">Display helpful tooltips throughout the admin panel</p>
                    </div>
                    <Switch
                      checked={formData.showTooltips}
                      onCheckedChange={(checked) => setFormData({ ...formData, showTooltips: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Disable platform access for all users except admins</p>
                    </div>
                    <Switch
                      checked={formData.maintenanceMode}
                      onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">API Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  API Key
                </label>
                <div className="flex gap-2">
                  <Input
                    value={settings?.apiKey || ''}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyApiKey}
                    title="Copy API Key"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleResetApiKey}
                    title="Reset API Key"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Use this key for API authentication. Keep it secret and never share it publicly!
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* SECURITY SETTINGS */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Password Requirements</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Minimum Password Length
                </label>
                <Input
                  type="number"
                  min="8"
                  max="32"
                  value={formData.passwordLength}
                  onChange={(e) => setFormData({ ...formData, passwordLength: parseInt(e.target.value) })}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Current: {formData.passwordLength} characters minimum
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Require Uppercase Letters</p>
                    <p className="text-sm text-gray-600">At least one uppercase letter (A-Z)</p>
                  </div>
                  <Switch
                    checked={formData.passwordRequireUppercase}
                    onCheckedChange={(checked) => setFormData({ ...formData, passwordRequireUppercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Require Lowercase Letters</p>
                    <p className="text-sm text-gray-600">At least one lowercase letter (a-z)</p>
                  </div>
                  <Switch
                    checked={formData.passwordRequireLowercase}
                    onCheckedChange={(checked) => setFormData({ ...formData, passwordRequireLowercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Require Numbers</p>
                    <p className="text-sm text-gray-600">At least one number (0-9)</p>
                  </div>
                  <Switch
                    checked={formData.passwordRequireNumbers}
                    onCheckedChange={(checked) => setFormData({ ...formData, passwordRequireNumbers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Require Symbols</p>
                    <p className="text-sm text-gray-600">At least one special character (!@#$%^&*)</p>
                  </div>
                  <Switch
                    checked={formData.passwordRequireSymbols}
                    onCheckedChange={(checked) => setFormData({ ...formData, passwordRequireSymbols: checked })}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Authentication Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Require 2FA for Admins</p>
                  <p className="text-sm text-gray-600">Force all admin users to enable two-factor authentication</p>
                </div>
                <Switch
                  checked={formData.require2FA}
                  onCheckedChange={(checked) => setFormData({ ...formData, require2FA: checked })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Session Timeout (seconds)
                  </label>
                  <Input
                    type="number"
                    min="300"
                    max="86400"
                    value={formData.sessionTimeout}
                    onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    {Math.floor(formData.sessionTimeout / 60)} minutes
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Max Login Attempts
                  </label>
                  <Input
                    type="number"
                    min="3"
                    max="10"
                    value={formData.maxLoginAttempts}
                    onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Before account lockout
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">IP Restrictions</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Allowed IP Addresses
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Restrict admin access to specific IP addresses. Leave empty to allow all IPs.
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="192.168.1.1"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddIP()}
                  />
                  <Button onClick={handleAddIP} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add IP
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.allowedIPs.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No IP restrictions - all IPs allowed</p>
                  ) : (
                    formData.allowedIPs.map((ip) => (
                      <div key={ip} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="font-mono text-sm">{ip}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveIP(ip)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS SETTINGS */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Email Notifications</p>
                  <p className="text-sm text-gray-600">Send email alerts for important events</p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                />
              </div>

              {formData.emailNotifications && (
                <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">New User Registrations</p>
                      <p className="text-sm text-gray-600">Alert when new users sign up</p>
                    </div>
                    <Switch
                      checked={formData.notifyOnNewUser}
                      onCheckedChange={(checked) => setFormData({ ...formData, notifyOnNewUser: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">KYC Submissions</p>
                      <p className="text-sm text-gray-600">Alert when KYC documents are submitted</p>
                    </div>
                    <Switch
                      checked={formData.notifyOnKYC}
                      onCheckedChange={(checked) => setFormData({ ...formData, notifyOnKYC: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Content Reports</p>
                      <p className="text-sm text-gray-600">Alert when content is reported</p>
                    </div>
                    <Switch
                      checked={formData.notifyOnReport}
                      onCheckedChange={(checked) => setFormData({ ...formData, notifyOnReport: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Large Transactions</p>
                      <p className="text-sm text-gray-600">Alert for transactions over €1000</p>
                    </div>
                    <Switch
                      checked={formData.notifyOnTransaction}
                      onCheckedChange={(checked) => setFormData({ ...formData, notifyOnTransaction: checked })}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Slack Integration</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Slack Notifications</p>
                  <p className="text-sm text-gray-600">Send alerts to Slack channel</p>
                </div>
                <Switch
                  checked={formData.slackNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, slackNotifications: checked })}
                />
              </div>

              {formData.slackNotifications && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Slack Webhook URL
                  </label>
                  <Input
                    type="url"
                    value={formData.slackWebhookUrl}
                    onChange={(e) => setFormData({ ...formData, slackWebhookUrl: e.target.value })}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Get your webhook URL from Slack's Incoming Webhooks app
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ROLES & PERMISSIONS */}
        <TabsContent value="roles" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Roles</h2>
                <p className="text-sm text-gray-600 mt-1">Manage access levels and permissions</p>
              </div>
              <Button variant="outline" disabled>
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={role.color}>
                        {role.name}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {role.permissions.length} {role.permissions.length === 1 ? 'permission' : 'permissions'}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" disabled>
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Permissions</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Users</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">• users.read - View users</p>
                  <p className="text-gray-600">• users.write - Edit users</p>
                  <p className="text-gray-600">• users.suspend - Suspend users</p>
                  <p className="text-gray-600">• users.delete - Delete users</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">KYC</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">• kyc.view - View KYC submissions</p>
                  <p className="text-gray-600">• kyc.approve - Approve/Reject KYC</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Reports</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">• reports.view - View reports</p>
                  <p className="text-gray-600">• reports.moderate - Moderate content</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Settings</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">• settings.read - View settings</p>
                  <p className="text-gray-600">• settings.write - Edit settings</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}