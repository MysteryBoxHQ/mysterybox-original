import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { apiRequest } from "@/lib/queryClient";
import { getRarityClass, RARITY_LABELS } from "@/lib/utils";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Palette, Type, Settings, Smartphone, Eye, Rocket, Trash2, Edit, Package, Sword, Upload, Save, Plus, Star, Users, Shield, Zap, X, BarChart3, GripVertical, TrendingUp, Award } from "lucide-react";

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

export function WhitelabelManagement() {
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Whitelabel Sites</h2>
          <p className="text-muted-foreground">
            Manage branded mystery box platforms for spawning complete frontend instances
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Whitelabel Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Whitelabel Site</DialogTitle>
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

// Whitelabel Configuration Panel Component
function WhitelabelConfigurationPanel({ whitelabel, onUpdateConfig, onClose }: any) {
  const [activeTab, setActiveTab] = useState("branding");

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Configure: {whitelabel.displayName}</CardTitle>
            <CardDescription>
              Manage branding, content, features, and deployment settings
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="branding">
              <Palette className="w-4 h-4 mr-1" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="content">
              <Type className="w-4 h-4 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="boxes">
              <Package className="w-4 h-4 mr-1" />
              Mystery Boxes
            </TabsTrigger>
            <TabsTrigger value="battles">
              <Sword className="w-4 h-4 mr-1" />
              Battles
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Eye className="w-4 h-4 mr-1" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="features">
              <Settings className="w-4 h-4 mr-1" />
              Features
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Smartphone className="w-4 h-4 mr-1" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-4">
            <BrandingConfiguration
              config={whitelabel.brandingConfig || {}}
              onChange={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "brandingConfig", config)}
              onSave={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "brandingConfig", config)}
            />
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <ContentConfiguration
              config={whitelabel.contentConfig || {}}
              onChange={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "contentConfig", config)}
              onSave={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "contentConfig", config)}
            />
          </TabsContent>

          <TabsContent value="boxes" className="space-y-4">
            <BoxesConfiguration
              whitelabelId={whitelabel.whitelabelId}
              config={whitelabel.boxConfig || {}}
              onChange={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "boxConfig", config)}
              onSave={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "boxConfig", config)}
            />
          </TabsContent>

          <TabsContent value="battles" className="space-y-4">
            <BattlesConfiguration
              whitelabelId={whitelabel.whitelabelId}
              config={whitelabel.battleConfig || {}}
              onChange={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "battleConfig", config)}
              onSave={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "battleConfig", config)}
            />
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <ThemeConfiguration
              config={whitelabel.themeConfig || {}}
              onChange={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "themeConfig", config)}
              onSave={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "themeConfig", config)}
            />
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <FeaturesConfiguration
              config={whitelabel.featureConfig || {}}
              onChange={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "featureConfig", config)}
              onSave={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "featureConfig", config)}
            />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <SEOConfiguration
              config={whitelabel.seoConfig || {}}
              onChange={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "seoConfig", config)}
              onSave={(config: any) => onUpdateConfig(whitelabel.whitelabelId, "seoConfig", config)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Branding Configuration Component
function BrandingConfiguration({ config, onChange, onSave }: any) {
  const updateField = (field: string, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Brand Identity</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Brand Name</Label>
            <Input
              value={config.brandName || ""}
              onChange={(e) => updateField("brandName", e.target.value)}
              placeholder="Your Brand Name"
            />
          </div>
          <div className="grid gap-2">
            <Label>Logo URL</Label>
            <Input
              value={config.logoUrl || ""}
              onChange={(e) => updateField("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="grid gap-2">
            <Label>Favicon URL</Label>
            <Input
              value={config.faviconUrl || ""}
              onChange={(e) => updateField("faviconUrl", e.target.value)}
              placeholder="https://example.com/favicon.ico"
            />
          </div>
          <div className="grid gap-2">
            <Label>Primary Color</Label>
            <Input
              type="color"
              value={config.primaryColor || "#3B82F6"}
              onChange={(e) => updateField("primaryColor", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Secondary Color</Label>
            <Input
              type="color"
              value={config.secondaryColor || "#10B981"}
              onChange={(e) => updateField("secondaryColor", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Accent Color</Label>
            <Input
              type="color"
              value={config.accentColor || "#F59E0B"}
              onChange={(e) => updateField("accentColor", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Typography</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Primary Font</Label>
            <Select value={config.primaryFont || "inter"} onValueChange={(value) => updateField("primaryFont", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="opensans">Open Sans</SelectItem>
                <SelectItem value="montserrat">Montserrat</SelectItem>
                <SelectItem value="poppins">Poppins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Secondary Font</Label>
            <Select value={config.secondaryFont || "roboto"} onValueChange={(value) => updateField("secondaryFont", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="opensans">Open Sans</SelectItem>
                <SelectItem value="montserrat">Montserrat</SelectItem>
                <SelectItem value="poppins">Poppins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          <Save className="w-4 h-4 mr-2" />
          Save Branding
        </Button>
      </div>
    </div>
  );
}

// Content Configuration Component
function ContentConfiguration({ config, onChange, onSave }: any) {
  const updateField = (field: string, value: any) => {
    onChange({ ...config, [field]: value });
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
              placeholder="Your Mystery Box Platform"
            />
          </div>
          <div className="grid gap-2">
            <Label>Site Description</Label>
            <Textarea
              value={config.siteDescription || ""}
              onChange={(e) => updateField("siteDescription", e.target.value)}
              placeholder="Exciting mystery boxes with amazing prizes..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Hero Title</Label>
            <Input
              value={config.heroTitle || ""}
              onChange={(e) => updateField("heroTitle", e.target.value)}
              placeholder="Discover Amazing Prizes"
            />
          </div>
          <div className="grid gap-2">
            <Label>Hero Subtitle</Label>
            <Textarea
              value={config.heroSubtitle || ""}
              onChange={(e) => updateField("heroSubtitle", e.target.value)}
              placeholder="Open mystery boxes and win incredible prizes..."
              rows={2}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Social Links</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Twitter URL</Label>
            <Input
              value={config.twitterUrl || ""}
              onChange={(e) => updateField("twitterUrl", e.target.value)}
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
          <div className="grid gap-2">
            <Label>Discord URL</Label>
            <Input
              value={config.discordUrl || ""}
              onChange={(e) => updateField("discordUrl", e.target.value)}
              placeholder="https://discord.gg/yourinvite"
            />
          </div>
          <div className="grid gap-2">
            <Label>Instagram URL</Label>
            <Input
              value={config.instagramUrl || ""}
              onChange={(e) => updateField("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
          <div className="grid gap-2">
            <Label>YouTube URL</Label>
            <Input
              value={config.youtubeUrl || ""}
              onChange={(e) => updateField("youtubeUrl", e.target.value)}
              placeholder="https://youtube.com/c/yourchannel"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          <Save className="w-4 h-4 mr-2" />
          Save Content
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

// Draggable Box Item Component
function DraggableBoxItem({ box, index, moveBox, onUpdate, onRemove }: any) {
  const [{ isDragging }, drag] = useDrag({
    type: 'box',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'box',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveBox(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center justify-between p-4 border rounded-lg transition-opacity cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center space-x-3">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
        {box.imageUrl ? (
          <img 
            src={box.imageUrl} 
            alt={box.name}
            className="w-8 h-8 rounded object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <Package className={`w-8 h-8 text-blue-500 ${box.imageUrl ? 'hidden' : ''}`} />
        <div>
          <h4 className="font-medium">{box.name}</h4>
          <p className="text-sm text-muted-foreground">{box.description}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge className={`${getRarityClass(box.rarity, 'gradient')} text-white font-bold border-0`}>
              {RARITY_LABELS[box.rarity?.toLowerCase() as keyof typeof RARITY_LABELS] || box.rarity?.toUpperCase()}
            </Badge>
            {box.whitelabelBox?.featured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge>${box.price}</Badge>
        <div className="flex items-center space-x-1">
          <Label className="text-xs">Featured</Label>
          <Switch
            checked={box.whitelabelBox?.featured || false}
            onCheckedChange={(checked) => {
              onUpdate(box.id, { featured: checked });
            }}
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(box.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Boxes Configuration Component
function BoxesConfiguration({ whitelabelId, config, onChange, onSave }: any) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddBox, setShowAddBox] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState<string>('');
  const [boxes, setBoxes] = useState<any[]>([]);

  const { data: whitelabelBoxes = [], refetch: refetchBoxes } = useQuery({
    queryKey: [`/api/admin/whitelabel-sites/${whitelabelId}/boxes`],
  });

  const { data: allBoxes = [] } = useQuery({
    queryKey: ['/api/admin/boxes'],
  });

  // Update local state when data changes
  useEffect(() => {
    if (Array.isArray(whitelabelBoxes)) {
      setBoxes([...whitelabelBoxes].sort((a, b) => (a.whitelabelBox?.displayOrder || 0) - (b.whitelabelBox?.displayOrder || 0)));
    }
  }, [whitelabelBoxes]);

  // Calculate stats
  const stats = {
    total: boxes.length,
    featured: boxes.filter(box => box.whitelabelBox?.featured).length,
    byRarity: boxes.reduce((acc: any, box) => {
      const rarity = box.rarity?.toLowerCase() || 'common';
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {})
  };

  // Move box function for drag and drop
  const moveBox = (fromIndex: number, toIndex: number) => {
    const updatedBoxes = [...boxes];
    const [movedBox] = updatedBoxes.splice(fromIndex, 1);
    updatedBoxes.splice(toIndex, 0, movedBox);
    setBoxes(updatedBoxes);

    // Update display order on server
    updateOrderMutation.mutate(
      updatedBoxes.map((box, index) => ({
        boxId: box.id,
        displayOrder: index
      }))
    );
  };

  const updateOrderMutation = useMutation({
    mutationFn: async (updates: Array<{ boxId: number; displayOrder: number }>) => {
      // Update each box's display order
      for (const update of updates) {
        await apiRequest('PUT', `/api/admin/whitelabel-sites/${whitelabelId}/boxes/${update.boxId}`, {
          displayOrder: update.displayOrder
        });
      }
    },
    onSuccess: () => {
      refetchBoxes();
      toast({
        title: "Success",
        description: "Box order updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update box order",
        variant: "destructive",
      });
    }
  });

  const updateBoxMutation = useMutation({
    mutationFn: async ({ boxId, updates }: { boxId: number; updates: any }) => {
      return await apiRequest('PUT', `/api/admin/whitelabel-sites/${whitelabelId}/boxes/${boxId}`, updates);
    },
    onSuccess: () => {
      refetchBoxes();
      toast({
        title: "Success",
        description: "Box updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update box",
        variant: "destructive",
      });
    }
  });

  const removeBoxMutation = useMutation({
    mutationFn: async (boxId: number) => {
      return await apiRequest('DELETE', `/api/admin/whitelabel-sites/${whitelabelId}/boxes/${boxId}`);
    },
    onSuccess: () => {
      refetchBoxes();
      toast({
        title: "Success",
        description: "Box removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove box",
        variant: "destructive",
      });
    }
  });

  const addBoxMutation = useMutation({
    mutationFn: async (boxId: string) => {
      return await apiRequest('POST', `/api/admin/whitelabel-sites/${whitelabelId}/boxes`, { boxId });
    },
    onSuccess: () => {
      refetchBoxes();
      setShowAddBox(false);
      setSelectedBoxId('');
      toast({
        title: "Success",
        description: "Box added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add box",
        variant: "destructive",
      });
    }
  });

  // Filter out boxes that are already associated with this whitelabel
  const availableBoxes = Array.isArray(allBoxes) ? allBoxes.filter((box: any) => 
    !Array.isArray(whitelabelBoxes) || !whitelabelBoxes.some((wlBox: any) => wlBox.id === box.id)
  ) : [];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Boxes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Boxes</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.featured}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legendary Items</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byRarity.legendary || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Epic Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byRarity.epic || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Mystery Boxes Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Manage mystery boxes available on this whitelabel instance. Drag to reorder.
              </p>
            </div>
            <Button onClick={() => setShowAddBox(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Box
            </Button>
          </div>

          {/* Draggable Boxes List */}
          <div className="space-y-3">
            {boxes.map((box, index) => (
              <DraggableBoxItem
                key={box.id}
                box={box}
                index={index}
                moveBox={moveBox}
                onUpdate={(boxId: number, updates: any) => 
                  updateBoxMutation.mutate({ boxId, updates })
                }
                onRemove={(boxId: number) => 
                  removeBoxMutation.mutate(boxId)
                }
              />
            ))}

            {boxes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No boxes configured for this whitelabel site</p>
                <p className="text-sm">Add boxes to get started</p>
              </div>
            )}
          </div>

          {/* Add Box Dialog */}
          <Dialog open={showAddBox} onOpenChange={setShowAddBox}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Box to Whitelabel Site</DialogTitle>
                <DialogDescription>
                  Select an existing box to associate with this whitelabel site
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="box-select">Select Box</Label>
                  <Select value={selectedBoxId} onValueChange={setSelectedBoxId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a box..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBoxes.map((box: any) => (
                        <SelectItem key={box.id} value={box.id.toString()}>
                          <div className="flex items-center space-x-2">
                            {box.imageUrl ? (
                              <img 
                                src={box.imageUrl} 
                                alt={box.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-blue-500" />
                            )}
                            <span>{box.name}</span>
                            <Badge className={`${getRarityClass(box.rarity, 'gradient')} text-white font-bold border-0 ml-2`}>
                              {RARITY_LABELS[box.rarity?.toLowerCase() as keyof typeof RARITY_LABELS] || box.rarity?.toUpperCase()}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {availableBoxes.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>All available boxes are already associated with this whitelabel site</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddBox(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedBoxId && addBoxMutation.mutate(selectedBoxId)}
                  disabled={!selectedBoxId || addBoxMutation.isPending}
                >
                  {addBoxMutation.isPending ? "Adding..." : "Add Box"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DndProvider>
  );
}

// Battles Configuration Component  
function BattlesConfiguration({ whitelabelId, config, onChange, onSave }: any) {
  const { data: battles = [] } = useQuery({
    queryKey: [`/api/admin/whitelabel-sites/${whitelabelId}/battles`],
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Battle Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure battle settings for this whitelabel instance
        </p>
        <div className="grid gap-4">
          {battles?.map((battle: any) => (
            <div key={battle.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Sword className="w-8 h-8 text-red-500" />
                <div>
                  <h4 className="font-medium">{battle.name}</h4>
                  <p className="text-sm text-muted-foreground">Entry Fee: {battle.entryFee}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>{battle.status}</Badge>
                <Switch
                  checked={battle.enabled}
                  onCheckedChange={(checked) => {
                    // Handle battle enable/disable
                  }}
                />
              </div>
            </div>
          ))}
          
          {battles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Sword className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No battles configured for this whitelabel site</p>
              <p className="text-sm">Battles will be automatically synchronized from the main platform</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          <Save className="w-4 h-4 mr-2" />
          Save Battle Configuration
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Dark Mode</Label>
            <Switch
              checked={config.darkMode || false}
              onCheckedChange={(checked) => updateField("darkMode", checked)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Layout Style</Label>
            <Select value={config.layoutStyle || "modern"} onValueChange={(value) => updateField("layoutStyle", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Background Image URL</Label>
            <Input
              value={config.backgroundImageUrl || ""}
              onChange={(e) => updateField("backgroundImageUrl", e.target.value)}
              placeholder="https://example.com/background.jpg"
            />
          </div>
          <div className="grid gap-2">
            <Label>Custom CSS</Label>
            <Textarea
              value={config.customCss || ""}
              onChange={(e) => updateField("customCss", e.target.value)}
              placeholder="/* Custom CSS styles */"
              rows={4}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          <Save className="w-4 h-4 mr-2" />
          Save Theme Configuration
        </Button>
      </div>
    </div>
  );
}

// SEO Configuration Component
function SEOConfiguration({ config, onChange, onSave }: any) {
  const updateField = (field: string, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Meta Title</Label>
            <Input
              value={config.metaTitle || ""}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              placeholder="Amazing Mystery Boxes | Your Brand"
            />
          </div>
          <div className="grid gap-2">
            <Label>Meta Description</Label>
            <Textarea
              value={config.metaDescription || ""}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              placeholder="Discover exciting mystery boxes with amazing prizes..."
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Meta Keywords</Label>
            <Input
              value={config.metaKeywords || ""}
              onChange={(e) => updateField("metaKeywords", e.target.value)}
              placeholder="mystery boxes, prizes, gaming, loot"
            />
          </div>
          <div className="grid gap-2">
            <Label>OG Image URL</Label>
            <Input
              value={config.ogImageUrl || ""}
              onChange={(e) => updateField("ogImageUrl", e.target.value)}
              placeholder="https://example.com/og-image.jpg"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Google Analytics ID</Label>
            <Input
              value={config.googleAnalyticsId || ""}
              onChange={(e) => updateField("googleAnalyticsId", e.target.value)}
              placeholder="GA_MEASUREMENT_ID"
            />
          </div>
          <div className="grid gap-2">
            <Label>Facebook Pixel ID</Label>
            <Input
              value={config.facebookPixelId || ""}
              onChange={(e) => updateField("facebookPixelId", e.target.value)}
              placeholder="FACEBOOK_PIXEL_ID"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onSave(config)}>
          <Save className="w-4 h-4 mr-2" />
          Save SEO Configuration
        </Button>
      </div>
    </div>
  );
}