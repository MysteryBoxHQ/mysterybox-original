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
import { Globe, Palette, Type, Settings, Smartphone, Eye, Rocket, Trash2, Edit, Package, Sword, Upload, Save, Plus, Star, Users, Shield, Zap } from "lucide-react";

interface WhitelabelSite {
  id: number;
  whitelabelId: string;
  name: string;
  displayName: string;
  slug: string;
  primaryDomain?: string;
  subdomain?: string;
  status: string;
  deploymentStatus: string;
  brandingConfig: any;
  themeConfig: any;
  contentConfig: any;
  seoConfig: any;
  featureConfig: any;
  paymentConfig: any;
  deploymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function WhitelabelManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWhitelabel, setSelectedWhitelabel] = useState<WhitelabelSite | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    displayName: "",
    slug: "",
    subdomain: "",
    primaryDomain: ""
  });

  // Fetch all whitelabel sites
  const { data: whitelabels, isLoading } = useQuery({
    queryKey: ["/api/admin/whitelabel-sites"],
    retry: false,
  });

  // Create whitelabel mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/whitelabel-sites", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelabel-sites"] });
      setIsCreateDialogOpen(false);
      setCreateForm({ name: "", displayName: "", slug: "", subdomain: "", primaryDomain: "" });
      toast({
        title: "Success",
        description: "Whitelabel site created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create whitelabel site",
        variant: "destructive",
      });
    },
  });

  // Update whitelabel configuration mutation
  const updateMutation = useMutation({
    mutationFn: async ({ whitelabelId, config }: { whitelabelId: string; config: any }) => {
      return await apiRequest("PUT", `/api/admin/whitelabel-sites/${whitelabelId}`, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelabel-sites"] });
      toast({
        title: "Success",
        description: "Configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  // Delete whitelabel mutation
  const deleteMutation = useMutation({
    mutationFn: async (whitelabelId: number) => {
      return await apiRequest("DELETE", `/api/admin/whitelabel-sites/${whitelabelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelabel-sites"] });
      toast({
        title: "Success", 
        description: "Whitelabel site deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete whitelabel site",
        variant: "destructive",
      });
    },
  });

  // Deploy whitelabel mutation
  const deployMutation = useMutation({
    mutationFn: async ({ whitelabelId, deployData }: { whitelabelId: string; deployData: any }) => {
      return await apiRequest("POST", `/api/admin/whitelabels/${whitelabelId}/deploy`, deployData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelabels"] });
      toast({
        title: "Success",
        description: "Deployment started successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start deployment",
        variant: "destructive",
      });
    },
  });

  const handleCreateWhitelabel = () => {
    if (!createForm.name || !createForm.displayName || !createForm.slug) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(createForm);
  };

  const handleUpdateConfig = (whitelabelId: string, configType: string, config: any) => {
    updateMutation.mutate({
      whitelabelId,
      config: { [configType]: config }
    });
  };

  const handleDeploy = (whitelabelId: string, domain?: string, subdomain?: string) => {
    deployMutation.mutate({
      whitelabelId,
      deployData: {
        domain,
        subdomain,
        environmentType: "production"
      }
    });
  };

  const handleEdit = (site: WhitelabelSite) => {
    setCreateForm({
      name: site.name,
      displayName: site.displayName,
      slug: site.slug,
      subdomain: site.subdomain || "",
      primaryDomain: site.primaryDomain || ""
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (whitelabelId: number) => {
    if (confirm("Are you sure you want to delete this whitelabel site? This action cannot be undone.")) {
      deleteMutation.mutate(whitelabelId);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      suspended: "destructive",
      maintenance: "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getDeploymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      deployed: "default",
      deploying: "secondary",
      failed: "destructive",
      not_deployed: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
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
          <h1 className="text-3xl font-bold">Whitelabel Management</h1>
          <p className="text-muted-foreground">Manage and configure whitelabel instances with complete branding control</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Rocket className="w-4 h-4 mr-2" />
              Create Whitelabel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Whitelabel</DialogTitle>
              <DialogDescription>
                Set up a new whitelabel instance with custom branding and domain
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Internal Name *</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="internal-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                  placeholder="Brand Display Name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  value={createForm.subdomain}
                  onChange={(e) => setCreateForm({ ...createForm, subdomain: e.target.value })}
                  placeholder="subdomain"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="primaryDomain">Custom Domain</Label>
                <Input
                  id="primaryDomain"
                  value={createForm.primaryDomain}
                  onChange={(e) => setCreateForm({ ...createForm, primaryDomain: e.target.value })}
                  placeholder="example.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWhitelabel} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {/* Whitelabel Sites List */}
        <Card>
          <CardHeader>
            <CardTitle>Whitelabel Sites</CardTitle>
            <CardDescription>
              Manage all your whitelabel instances and their configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {whitelabels?.map((site: WhitelabelSite) => (
                <div key={site.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{site.displayName}</h3>
                      {getStatusBadge(site.status)}
                      {getDeploymentStatusBadge(site.deploymentStatus)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ID: {site.whitelabelId} | Slug: {site.slug}
                    </p>
                    {site.deploymentUrl && (
                      <p className="text-sm text-blue-600">
                        <Globe className="w-3 h-3 inline mr-1" />
                        {site.deploymentUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWhitelabel(site)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(site)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(site.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Panel */}
        {selectedWhitelabel && (
          <WhitelabelConfigurationPanel
            whitelabel={selectedWhitelabel}
            onUpdateConfig={handleUpdateConfig}
            onClose={() => setSelectedWhitelabel(null)}
          />
        )}
      </div>
    </div>
  );
}

interface ConfigurationPanelProps {
  whitelabel: WhitelabelSite;
  onUpdateConfig: (whitelabelId: string, configType: string, config: any) => void;
  onClose: () => void;
}

function WhitelabelConfigurationPanel({ whitelabel, onUpdateConfig, onClose }: ConfigurationPanelProps) {
  const [brandingConfig, setBrandingConfig] = useState(whitelabel.brandingConfig || {});
  const [contentConfig, setContentConfig] = useState(whitelabel.contentConfig || {});
  const [seoConfig, setSeoConfig] = useState(whitelabel.seoConfig || {});
  const [featureConfig, setFeatureConfig] = useState(whitelabel.featureConfig || {});
  const [themeConfig, setThemeConfig] = useState(whitelabel.themeConfig || {});

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Configure: {whitelabel.displayName}</CardTitle>
            <CardDescription>
              Complete control over branding, content, SEO, and features
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="branding">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="content">
              <Type className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="boxes">
              <Package className="w-4 h-4 mr-2" />
              Mystery Boxes
            </TabsTrigger>
            <TabsTrigger value="battles">
              <Sword className="w-4 h-4 mr-2" />
              Battles
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Eye className="w-4 h-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="features">
              <Settings className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Globe className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* Branding Configuration */}
          <TabsContent value="branding" className="space-y-6">
            <BrandingConfiguration
              config={brandingConfig}
              onChange={setBrandingConfig}
              onSave={(config) => onUpdateConfig(whitelabel.whitelabelId, "brandingConfig", config)}
            />
          </TabsContent>

          {/* Content Configuration */}
          <TabsContent value="content" className="space-y-6">
            <ContentConfiguration
              config={contentConfig}
              onChange={setContentConfig}
              onSave={(config) => onUpdateConfig(whitelabel.whitelabelId, "contentConfig", config)}
            />
          </TabsContent>

          {/* Mystery Boxes Management */}
          <TabsContent value="boxes" className="space-y-6">
            <MysteryBoxesManagement
              whitelabelId={whitelabel.whitelabelId}
              onSave={(config) => onUpdateConfig(whitelabel.whitelabelId, "boxesConfig", config)}
            />
          </TabsContent>

          {/* Battles Management */}
          <TabsContent value="battles" className="space-y-6">
            <BattlesManagement
              whitelabelId={whitelabel.whitelabelId}
              onSave={(config) => onUpdateConfig(whitelabel.whitelabelId, "battlesConfig", config)}
            />
          </TabsContent>

          {/* Theme Configuration */}
          <TabsContent value="theme" className="space-y-6">
            <ThemeConfiguration
              config={themeConfig}
              onChange={setThemeConfig}
              onSave={(config) => onUpdateConfig(whitelabel.whitelabelId, "themeConfig", config)}
            />
          </TabsContent>

          {/* Features Configuration */}
          <TabsContent value="features" className="space-y-6">
            <FeaturesConfiguration
              config={featureConfig}
              onChange={setFeatureConfig}
              onSave={(config) => onUpdateConfig(whitelabel.whitelabelId, "featureConfig", config)}
            />
          </TabsContent>

          {/* SEO Configuration */}
          <TabsContent value="seo" className="space-y-6">
            <SEOConfiguration
              config={seoConfig}
              onChange={setSeoConfig}
              onSave={(config) => onUpdateConfig(whitelabel.whitelabelId, "seoConfig", config)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Branding Configuration Component
function BrandingConfiguration({ config, onChange, onSave }: any) {
  const logo = config.logo || {};
  const colors = config.colors || {};
  const typography = config.typography || {};

  const updateLogo = (field: string, value: string) => {
    const updatedConfig = {
      ...config,
      logo: { ...logo, [field]: value }
    };
    onChange(updatedConfig);
  };

  const updateColors = (field: string, value: string) => {
    const updatedConfig = {
      ...config,
      colors: { ...colors, [field]: value }
    };
    onChange(updatedConfig);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Logo Configuration</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Primary Logo URL</Label>
            <Input
              value={logo.primaryUrl || ""}
              onChange={(e) => updateLogo("primaryUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="grid gap-2">
            <Label>Secondary Logo URL</Label>
            <Input
              value={logo.secondaryUrl || ""}
              onChange={(e) => updateLogo("secondaryUrl", e.target.value)}
              placeholder="https://example.com/logo-dark.png"
            />
          </div>
          <div className="grid gap-2">
            <Label>Favicon URL</Label>
            <Input
              value={logo.faviconUrl || ""}
              onChange={(e) => updateLogo("faviconUrl", e.target.value)}
              placeholder="https://example.com/favicon.ico"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Color Scheme</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="grid gap-2">
              <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={value as string || "#000000"}
                  onChange={(e) => updateColors(key, e.target.value)}
                  className="w-16 p-1 h-10"
                />
                <Input
                  value={value as string || ""}
                  onChange={(e) => updateColors(key, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          Save Branding Configuration
        </Button>
      </div>
    </div>
  );
}

// Content Configuration Component
function ContentConfiguration({ config, onChange, onSave }: any) {
  const updateField = (field: string, value: string) => {
    onChange({ ...config, [field]: value });
  };

  const updateCustomText = (field: string, value: string) => {
    onChange({
      ...config,
      customTexts: { ...config.customTexts, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Site Content</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Site Title</Label>
            <Input
              value={config.siteTitle || ""}
              onChange={(e) => updateField("siteTitle", e.target.value)}
              placeholder="Mystery Box Platform"
            />
          </div>
          <div className="grid gap-2">
            <Label>Tagline</Label>
            <Input
              value={config.tagline || ""}
              onChange={(e) => updateField("tagline", e.target.value)}
              placeholder="Discover Amazing Items"
            />
          </div>
          <div className="grid gap-2">
            <Label>Welcome Message</Label>
            <Textarea
              value={config.welcomeMessage || ""}
              onChange={(e) => updateField("welcomeMessage", e.target.value)}
              placeholder="Welcome to our mystery box platform"
            />
          </div>
          <div className="grid gap-2">
            <Label>Footer Text</Label>
            <Input
              value={config.footerText || ""}
              onChange={(e) => updateField("footerText", e.target.value)}
              placeholder="© 2024 Platform. All rights reserved."
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Custom Button Text</h3>
        <div className="grid gap-4">
          {config.customTexts && Object.entries(config.customTexts).map(([key, value]) => (
            <div key={key} className="grid gap-2">
              <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
              <Input
                value={value as string || ""}
                onChange={(e) => updateCustomText(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          Save Content Configuration
        </Button>
      </div>
    </div>
  );
}

// SEO Configuration Component
function SEOConfiguration({ config, onChange, onSave }: any) {
  const meta = config.meta || {};
  const openGraph = config.openGraph || {};
  const twitter = config.twitter || {};

  const updateMeta = (field: string, value: string) => {
    onChange({
      ...config,
      meta: { ...meta, [field]: value }
    });
  };

  const updateOpenGraph = (field: string, value: string) => {
    onChange({
      ...config,
      openGraph: { ...openGraph, [field]: value }
    });
  };

  const updateTwitter = (field: string, value: string) => {
    onChange({
      ...config,
      twitter: { ...twitter, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Meta Tags</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Page Title</Label>
            <Input
              value={meta.title || ""}
              onChange={(e) => updateMeta("title", e.target.value)}
              placeholder="Mystery Box Platform - Discover Amazing Items"
            />
          </div>
          <div className="grid gap-2">
            <Label>Meta Description</Label>
            <Textarea
              value={meta.description || ""}
              onChange={(e) => updateMeta("description", e.target.value)}
              placeholder="Open mystery boxes and discover rare and valuable items..."
            />
          </div>
          <div className="grid gap-2">
            <Label>Keywords</Label>
            <Input
              value={meta.keywords || ""}
              onChange={(e) => updateMeta("keywords", e.target.value)}
              placeholder="mystery boxes, gaming, collectibles, rare items"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Open Graph (Facebook/LinkedIn)</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>OG Title</Label>
            <Input
              value={openGraph.title || ""}
              onChange={(e) => updateOpenGraph("title", e.target.value)}
              placeholder="Mystery Box Platform - Discover Amazing Items"
            />
          </div>
          <div className="grid gap-2">
            <Label>OG Description</Label>
            <Textarea
              value={openGraph.description || ""}
              onChange={(e) => updateOpenGraph("description", e.target.value)}
              placeholder="Open mystery boxes and discover rare and valuable items..."
            />
          </div>
          <div className="grid gap-2">
            <Label>OG Image URL</Label>
            <Input
              value={openGraph.image || ""}
              onChange={(e) => updateOpenGraph("image", e.target.value)}
              placeholder="https://example.com/og-image.jpg"
            />
          </div>
          <div className="grid gap-2">
            <Label>Site Name</Label>
            <Input
              value={openGraph.siteName || ""}
              onChange={(e) => updateOpenGraph("siteName", e.target.value)}
              placeholder="Mystery Box Platform"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Twitter Cards</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Twitter Title</Label>
            <Input
              value={twitter.title || ""}
              onChange={(e) => updateTwitter("title", e.target.value)}
              placeholder="Mystery Box Platform - Discover Amazing Items"
            />
          </div>
          <div className="grid gap-2">
            <Label>Twitter Description</Label>
            <Textarea
              value={twitter.description || ""}
              onChange={(e) => updateTwitter("description", e.target.value)}
              placeholder="Open mystery boxes and discover rare and valuable items."
            />
          </div>
          <div className="grid gap-2">
            <Label>Twitter Image</Label>
            <Input
              value={twitter.image || ""}
              onChange={(e) => updateTwitter("image", e.target.value)}
              placeholder="https://example.com/twitter-image.jpg"
            />
          </div>
          <div className="grid gap-2">
            <Label>Twitter Site Handle</Label>
            <Input
              value={twitter.site || ""}
              onChange={(e) => updateTwitter("site", e.target.value)}
              placeholder="@mysteryboxes"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          Save SEO Configuration
        </Button>
      </div>
    </div>
  );
}

// Features Configuration Component
function FeaturesConfiguration({ config, onChange, onSave }: any) {
  const features = config.features || {
    mysteryBoxes: true,
    battles: true,
    leaderboards: true,
    achievements: true,
    inventory: true,
    marketplace: true,
    dailyRewards: true,
    referralProgram: true,
    liveChat: true,
    promotions: true,
    statistics: true,
    multiCurrency: true,
    mobileApp: true,
    socialLogin: true,
    twoFactorAuth: false,
    withdrawals: true,
    deposits: true,
    vipProgram: false,
    customizations: true
  };
  const limits = config.limits || {
    maxBoxOpeningsPerDay: 50,
    maxBattlesPerDay: 10,
    maxWithdrawalAmount: 1000,
    maxDepositAmount: 5000,
    maxInventorySize: 1000
  };
  const paymentMethods = config.paymentMethods || {
    creditCard: true,
    paypal: true,
    crypto: false,
    bankTransfer: false,
    applePay: true,
    googlePay: true
  };

  const updateFeature = (feature: string, enabled: boolean) => {
    onChange({
      ...config,
      features: { ...features, [feature]: enabled }
    });
  };

  const updateLimit = (limit: string, value: number) => {
    onChange({
      ...config,
      limits: { ...limits, [limit]: value }
    });
  };

  const updatePaymentMethod = (method: string, enabled: boolean) => {
    onChange({
      ...config,
      paymentMethods: { ...paymentMethods, [method]: enabled }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Core Platform Features</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                {feature === 'mysteryBoxes' && <Package className="w-4 h-4 text-blue-500" />}
                {feature === 'battles' && <Sword className="w-4 h-4 text-red-500" />}
                {feature === 'leaderboards' && <Users className="w-4 h-4 text-green-500" />}
                {feature === 'achievements' && <Star className="w-4 h-4 text-yellow-500" />}
                {feature === 'twoFactorAuth' && <Shield className="w-4 h-4 text-purple-500" />}
                {feature === 'vipProgram' && <Zap className="w-4 h-4 text-orange-500" />}
                <Label className="capitalize font-medium">{feature.replace(/([A-Z])/g, ' $1')}</Label>
              </div>
              <Switch
                checked={enabled as boolean}
                onCheckedChange={(checked) => updateFeature(feature, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">User Limits</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(limits).map(([limit, value]) => (
            <div key={limit} className="grid gap-2">
              <Label className="capitalize">{limit.replace(/([A-Z])/g, ' $1')}</Label>
              <Input
                type="number"
                value={value as number || 0}
                onChange={(e) => updateLimit(limit, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(paymentMethods).map(([method, enabled]) => (
            <div key={method} className="flex items-center justify-between p-3 border rounded-lg">
              <Label className="capitalize font-medium">{method.replace(/([A-Z])/g, ' $1')}</Label>
              <Switch
                checked={enabled as boolean}
                onCheckedChange={(checked) => updatePaymentMethod(method, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          <Save className="w-4 h-4 mr-2" />
          Save Features Configuration
        </Button>
      </div>
    </div>
  );
}

// Theme Configuration Component
function ThemeConfiguration({ config, onChange, onSave }: any) {
  const updateField = (field: string, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Theme Mode</Label>
            <Select value={config.mode || "light"} onValueChange={(value) => updateField("mode", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Custom CSS</Label>
            <Textarea
              value={config.customCss || ""}
              onChange={(e) => updateField("customCss", e.target.value)}
              placeholder="/* Custom CSS styles */"
              rows={10}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          Save Theme Configuration
        </Button>
      </div>
    </div>
  );
}

// Mystery Boxes Management Component
function MysteryBoxesManagement({ whitelabelId, onSave }: { whitelabelId: string; onSave: (config: any) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBox, setNewBox] = useState({
    name: "",
    description: "",
    price: "",
    rarity: "",
    imageUrl: "",
    backgroundUrl: "",
    featured: false
  });
  
  // Fetch boxes for this whitelabel
  const { data: boxes, isLoading } = useQuery({
    queryKey: [`/api/admin/whitelabel-sites/${whitelabelId}/boxes`],
    retry: false,
  });

  // Create box mutation
  const createBoxMutation = useMutation({
    mutationFn: async (boxData: any) => {
      return await apiRequest("POST", `/api/admin/whitelabel-sites/${whitelabelId}/boxes`, boxData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/whitelabel-sites/${whitelabelId}/boxes`] });
      setIsCreateDialogOpen(false);
      setNewBox({ name: "", description: "", price: "", rarity: "", imageUrl: "", backgroundUrl: "", featured: false });
      toast({ title: "Success", description: "Mystery box created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create mystery box", variant: "destructive" });
    },
  });

  // Delete box mutation
  const deleteBoxMutation = useMutation({
    mutationFn: async (boxId: number) => {
      return await apiRequest("DELETE", `/api/admin/whitelabel-sites/${whitelabelId}/boxes/${boxId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/whitelabel-sites/${whitelabelId}/boxes`] });
      toast({ title: "Success", description: "Mystery box deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete mystery box", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Mystery Boxes Management</h3>
          <p className="text-sm text-muted-foreground">Configure mystery boxes available on this whitelabel instance</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Mystery Box
        </Button>
      </div>

      {/* Boxes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {boxes?.map((box: any) => (
          <Card key={box.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{box.name}</CardTitle>
                  <CardDescription className="text-sm">${box.price}</CardDescription>
                </div>
                {box.featured && <Badge variant="secondary">Featured</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{box.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Rarity: {box.rarity}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteBoxMutation.mutate(box.id)}
                    disabled={deleteBoxMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Box Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Mystery Box</DialogTitle>
            <DialogDescription>
              Add a new mystery box to this whitelabel instance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Box Name</Label>
              <Input
                value={newBox.name}
                onChange={(e) => setNewBox({ ...newBox, name: e.target.value })}
                placeholder="Cosmic Mystery Box"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={newBox.description}
                onChange={(e) => setNewBox({ ...newBox, description: e.target.value })}
                placeholder="Discover rare cosmic items..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                value={newBox.price}
                onChange={(e) => setNewBox({ ...newBox, price: e.target.value })}
                placeholder="9.99"
              />
            </div>
            <div className="grid gap-2">
              <Label>Rarity</Label>
              <Select onValueChange={(value) => setNewBox({ ...newBox, rarity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Image URL</Label>
              <Input
                value={newBox.imageUrl}
                onChange={(e) => setNewBox({ ...newBox, imageUrl: e.target.value })}
                placeholder="https://example.com/box.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newBox.featured}
                onCheckedChange={(checked) => setNewBox({ ...newBox, featured: checked })}
              />
              <Label>Featured Box</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createBoxMutation.mutate(newBox)}
              disabled={createBoxMutation.isPending || !newBox.name || !newBox.price}
            >
              {createBoxMutation.isPending ? "Creating..." : "Create Box"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button onClick={() => onSave({ boxes: boxes || [] })}>
          <Save className="w-4 h-4 mr-2" />
          Save Boxes Configuration
        </Button>
      </div>
    </div>
  );
}

// Battles Management Component
function BattlesManagement({ whitelabelId, onSave }: { whitelabelId: string; onSave: (config: any) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBattle, setNewBattle] = useState({
    name: "",
    boxId: "",
    maxPlayers: 2,
    entryFee: "",
    timeLimit: 300
  });
  
  // Fetch battles for this whitelabel
  const { data: battles, isLoading } = useQuery({
    queryKey: [`/api/admin/whitelabel-sites/${whitelabelId}/battles`],
    retry: false,
  });

  // Fetch available boxes
  const { data: boxes } = useQuery({
    queryKey: [`/api/admin/whitelabel-sites/${whitelabelId}/boxes`],
    retry: false,
  });

  // Create battle mutation
  const createBattleMutation = useMutation({
    mutationFn: async (battleData: any) => {
      return await apiRequest("POST", `/api/admin/whitelabel-sites/${whitelabelId}/battles`, battleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/whitelabel-sites/${whitelabelId}/battles`] });
      setIsCreateDialogOpen(false);
      setNewBattle({ name: "", boxId: "", maxPlayers: 2, entryFee: "", timeLimit: 300 });
      toast({ title: "Success", description: "Battle created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create battle", variant: "destructive" });
    },
  });

  // Delete battle mutation
  const deleteBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      return await apiRequest("DELETE", `/api/admin/whitelabel-sites/${whitelabelId}/battles/${battleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/whitelabel-sites/${whitelabelId}/battles`] });
      toast({ title: "Success", description: "Battle deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete battle", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Battles Management</h3>
          <p className="text-sm text-muted-foreground">Configure box battles available on this whitelabel instance</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Battle
        </Button>
      </div>

      {/* Battles Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {battles?.map((battle: any) => (
          <Card key={battle.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{battle.name}</CardTitle>
                  <CardDescription>Entry Fee: ${battle.entryFee}</CardDescription>
                </div>
                <Badge variant={battle.status === 'active' ? 'default' : 'secondary'}>
                  {battle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Players:</span>
                  <span>{battle.maxPlayers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time Limit:</span>
                  <span>{battle.timeLimit}s</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">Players: {battle.currentPlayers}/{battle.maxPlayers}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteBattleMutation.mutate(battle.id)}
                    disabled={deleteBattleMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Battle Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Battle</DialogTitle>
            <DialogDescription>
              Set up a new box battle for this whitelabel instance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Battle Name</Label>
              <Input
                value={newBattle.name}
                onChange={(e) => setNewBattle({ ...newBattle, name: e.target.value })}
                placeholder="Epic Cosmic Battle"
              />
            </div>
            <div className="grid gap-2">
              <Label>Mystery Box</Label>
              <Select onValueChange={(value) => setNewBattle({ ...newBattle, boxId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mystery box" />
                </SelectTrigger>
                <SelectContent>
                  {boxes?.map((box: any) => (
                    <SelectItem key={box.id} value={box.id.toString()}>
                      {box.name} - ${box.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Max Players</Label>
              <Select onValueChange={(value) => setNewBattle({ ...newBattle, maxPlayers: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select max players" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Players</SelectItem>
                  <SelectItem value="4">4 Players</SelectItem>
                  <SelectItem value="6">6 Players</SelectItem>
                  <SelectItem value="8">8 Players</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Entry Fee ($)</Label>
              <Input
                type="number"
                value={newBattle.entryFee}
                onChange={(e) => setNewBattle({ ...newBattle, entryFee: e.target.value })}
                placeholder="5.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>Time Limit (seconds)</Label>
              <Input
                type="number"
                value={newBattle.timeLimit}
                onChange={(e) => setNewBattle({ ...newBattle, timeLimit: parseInt(e.target.value) })}
                placeholder="300"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createBattleMutation.mutate(newBattle)}
              disabled={createBattleMutation.isPending || !newBattle.name || !newBattle.boxId}
            >
              {createBattleMutation.isPending ? "Creating..." : "Create Battle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button onClick={() => onSave({ battles: battles || [] })}>
          <Save className="w-4 h-4 mr-2" />
          Save Battles Configuration
        </Button>
      </div>
    </div>
  );
}