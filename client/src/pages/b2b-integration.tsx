import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Globe, Zap, Settings, Smartphone, Eye, Rocket, Copy, ExternalLink, Activity } from "lucide-react";

interface B2BPartner {
  id: number;
  name: string;
  domain: string;
  apiKey: string;
  apiSecret: string;
  status: string;
  integrationConfig: any;
  widgetConfig: any;
  webhookUrl?: string;
  allowedOrigins: string[];
  rateLimit: number;
  createdAt: string;
  lastActivity?: string;
}

interface WidgetConfig {
  theme: string;
  primaryColor: string;
  backgroundColor: string;
  borderRadius: number;
  showBranding: boolean;
  customCss?: string;
  language: string;
  currency: string;
}

export default function B2BIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPartner, setSelectedPartner] = useState<B2BPartner | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    domain: "",
    webhookUrl: "",
    allowedOrigins: ""
  });

  // Fetch all B2B partners
  const { data: partners, isLoading } = useQuery({
    queryKey: ["/api/admin/b2b-partners"],
    retry: false,
  });

  // Create partner mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/b2b-partners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/b2b-partners"] });
      setIsCreateDialogOpen(false);
      setCreateForm({ name: "", domain: "", webhookUrl: "", allowedOrigins: "" });
      toast({
        title: "Success",
        description: "B2B partner created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create B2B partner",
        variant: "destructive",
      });
    },
  });

  // Update partner configuration mutation
  const updateMutation = useMutation({
    mutationFn: async ({ partnerId, config }: { partnerId: number; config: any }) => {
      return await apiRequest("PATCH", `/api/admin/b2b-partners/${partnerId}`, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/b2b-partners"] });
      toast({
        title: "Success",
        description: "Partner configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update partner configuration",
        variant: "destructive",
      });
    },
  });

  const handleCreatePartner = () => {
    if (!createForm.name || !createForm.domain) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const origins = createForm.allowedOrigins.split(',').map(o => o.trim()).filter(o => o);
    createMutation.mutate({
      ...createForm,
      allowedOrigins: origins
    });
  };

  const handleUpdateConfig = (partnerId: number, configType: string, config: any) => {
    updateMutation.mutate({
      partnerId,
      config: { [configType]: config }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      suspended: "destructive",
      testing: "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">B2B Widget Integration</h1>
          <p className="text-muted-foreground">JavaScript widgets and APIs for embedding mystery box features into existing casino/ecommerce platforms</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Zap className="w-4 h-4 mr-2" />
              Add B2B Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New B2B Partner</DialogTitle>
              <DialogDescription>
                Set up a new partner for B2B integration with existing sites
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Partner Name *</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Casino Partner LLC"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Primary Domain *</Label>
                <Input
                  id="domain"
                  value={createForm.domain}
                  onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
                  placeholder="casino-partner.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={createForm.webhookUrl}
                  onChange={(e) => setCreateForm({ ...createForm, webhookUrl: e.target.value })}
                  placeholder="https://partner.com/webhooks/rollingdrop"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allowedOrigins">Allowed Origins (comma-separated)</Label>
                <Input
                  id="allowedOrigins"
                  value={createForm.allowedOrigins}
                  onChange={(e) => setCreateForm({ ...createForm, allowedOrigins: e.target.value })}
                  placeholder="https://partner.com, https://www.partner.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePartner} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Partner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {/* B2B Partners List */}
        <Card>
          <CardHeader>
            <CardTitle>B2B Integration Partners</CardTitle>
            <CardDescription>
              Manage partners integrating our box opening features into their existing sites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {partners?.map((partner: B2BPartner) => (
                <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{partner.name}</h3>
                      {getStatusBadge(partner.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Domain: {partner.domain}
                    </p>
                    <p className="text-sm text-blue-600">
                      <Globe className="w-3 h-3 inline mr-1" />
                      API Key: {partner.apiKey.substring(0, 8)}...
                    </p>
                    {partner.lastActivity && (
                      <p className="text-sm text-green-600">
                        <Activity className="w-3 h-3 inline mr-1" />
                        Last activity: {new Date(partner.lastActivity).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(partner.apiKey)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy API Key
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Panel */}
        {selectedPartner && (
          <B2BConfigurationPanel
            partner={selectedPartner}
            onUpdateConfig={handleUpdateConfig}
            onClose={() => setSelectedPartner(null)}
          />
        )}

        {/* Integration Documentation */}
        <IntegrationDocumentation />
      </div>
    </div>
  );
}

interface ConfigurationPanelProps {
  partner: B2BPartner;
  onUpdateConfig: (partnerId: number, configType: string, config: any) => void;
  onClose: () => void;
}

function B2BConfigurationPanel({ partner, onUpdateConfig, onClose }: ConfigurationPanelProps) {
  const [integrationConfig, setIntegrationConfig] = useState(partner.integrationConfig || {});
  const [widgetConfig, setWidgetConfig] = useState(partner.widgetConfig || {});

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Configure: {partner.name}</CardTitle>
            <CardDescription>
              B2B integration settings for {partner.domain}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="integration" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integration">
              <Zap className="w-4 h-4 mr-2" />
              Integration
            </TabsTrigger>
            <TabsTrigger value="widgets">
              <Code className="w-4 h-4 mr-2" />
              Widgets
            </TabsTrigger>
            <TabsTrigger value="api">
              <Globe className="w-4 h-4 mr-2" />
              API Settings
            </TabsTrigger>
          </TabsList>

          {/* Integration Configuration */}
          <TabsContent value="integration" className="space-y-6">
            <IntegrationConfiguration
              config={integrationConfig}
              onChange={setIntegrationConfig}
              onSave={(config) => onUpdateConfig(partner.id, "integrationConfig", config)}
            />
          </TabsContent>

          {/* Widget Configuration */}
          <TabsContent value="widgets" className="space-y-6">
            <WidgetConfiguration
              config={widgetConfig}
              onChange={setWidgetConfig}
              onSave={(config) => onUpdateConfig(partner.id, "widgetConfig", config)}
            />
          </TabsContent>

          {/* API Configuration */}
          <TabsContent value="api" className="space-y-6">
            <APIConfiguration
              partner={partner}
              onSave={(config) => onUpdateConfig(partner.id, "apiConfig", config)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Integration Configuration Component
function IntegrationConfiguration({ config, onChange, onSave }: any) {
  const updateField = (field: string, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Integration Settings</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label>Enable Box Opening Widget</Label>
            <Switch
              checked={config.enableBoxWidget || false}
              onCheckedChange={(checked) => updateField("enableBoxWidget", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enable Inventory Widget</Label>
            <Switch
              checked={config.enableInventoryWidget || false}
              onCheckedChange={(checked) => updateField("enableInventoryWidget", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enable Marketplace Widget</Label>
            <Switch
              checked={config.enableMarketplaceWidget || false}
              onCheckedChange={(checked) => updateField("enableMarketplaceWidget", checked)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Revenue Share (%)</Label>
            <Input
              type="number"
              value={config.revenueShare || 0}
              onChange={(e) => updateField("revenueShare", parseFloat(e.target.value) || 0)}
              placeholder="15"
            />
          </div>
          <div className="grid gap-2">
            <Label>Custom CSS Override</Label>
            <Textarea
              value={config.customCss || ""}
              onChange={(e) => updateField("customCss", e.target.value)}
              placeholder="/* Custom CSS for widgets */"
              rows={5}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          Save Integration Settings
        </Button>
      </div>
    </div>
  );
}

// Widget Configuration Component
function WidgetConfiguration({ config, onChange, onSave }: any) {
  const updateField = (field: string, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Widget Appearance</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Theme</Label>
            <Select value={config.theme || "default"} onValueChange={(value) => updateField("theme", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Primary Color</Label>
            <div className="flex space-x-2">
              <Input
                type="color"
                value={config.primaryColor || "#3B82F6"}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="w-16 p-1 h-10"
              />
              <Input
                value={config.primaryColor || "#3B82F6"}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Background Color</Label>
            <div className="flex space-x-2">
              <Input
                type="color"
                value={config.backgroundColor || "#FFFFFF"}
                onChange={(e) => updateField("backgroundColor", e.target.value)}
                className="w-16 p-1 h-10"
              />
              <Input
                value={config.backgroundColor || "#FFFFFF"}
                onChange={(e) => updateField("backgroundColor", e.target.value)}
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Border Radius (px)</Label>
            <Input
              type="number"
              value={config.borderRadius || 8}
              onChange={(e) => updateField("borderRadius", parseInt(e.target.value) || 8)}
              placeholder="8"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show RollingDrop Branding</Label>
            <Switch
              checked={config.showBranding !== false}
              onCheckedChange={(checked) => updateField("showBranding", checked)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          Save Widget Configuration
        </Button>
      </div>
    </div>
  );
}

// API Configuration Component
function APIConfiguration({ partner, onSave }: any) {
  const { toast } = useToast();

  const regenerateApiKey = () => {
    // Logic to regenerate API key
    toast({
      title: "API Key Regenerated",
      description: "New API key has been generated. Update your integration.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">API Credentials</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>API Key</Label>
            <div className="flex space-x-2">
              <Input
                value={partner.apiKey}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(partner.apiKey)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>API Secret</Label>
            <div className="flex space-x-2">
              <Input
                value={partner.apiSecret}
                readOnly
                type="password"
                className="font-mono"
              />
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(partner.apiSecret)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Rate Limit (requests/minute)</Label>
            <Input
              type="number"
              value={partner.rateLimit || 1000}
              readOnly
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={regenerateApiKey} variant="outline">
              Regenerate API Key
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Integration Documentation Component
function IntegrationDocumentation() {
  const [selectedExample, setSelectedExample] = useState("widget");

  const widgetExample = `<!-- Box Opening Widget -->
<div id="rollingdrop-box-widget"></div>
<script>
  RollingDrop.initWidget({
    container: '#rollingdrop-box-widget',
    apiKey: 'your-api-key',
    theme: 'dark',
    primaryColor: '#3B82F6',
    showBranding: true,
    onBoxOpened: function(result) {
      console.log('Box opened:', result);
      // Handle the result in your application
    }
  });
</script>`;

  const apiExample = `// Open a box via API
fetch('https://api.rollingdrop.com/v1/boxes/123/open', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'your-user-id',
    currency: 'USD'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Box opened:', data);
  // Handle the result
});`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Documentation</CardTitle>
        <CardDescription>
          Code examples and guides for integrating with existing sites
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedExample} onValueChange={setSelectedExample}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="widget">Widget Integration</TabsTrigger>
            <TabsTrigger value="api">API Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="widget" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">JavaScript Widget</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Embed our box opening widget directly into your existing site
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{widgetExample}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => navigator.clipboard.writeText(widgetExample)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">REST API</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Integrate box opening functionality via our REST API
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{apiExample}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => navigator.clipboard.writeText(apiExample)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold mb-2">Need Help?</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Our integration team is here to help you get set up quickly.
          </p>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Contact Integration Team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}