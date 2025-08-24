import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  Code, 
  Globe, 
  Settings, 
  Palette, 
  CreditCard, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Copy,
  Shield,
  Zap,
  Users,
  TrendingUp,
  DollarSign,
  Package,
  Database,
  Gem,
  Star,
  Target
} from "lucide-react";
import type { Partner, WhitelabelSite } from "@shared/schema";
import { BoxManagement } from "./BoxManagement";
import { WidgetConfiguration } from "./WidgetConfiguration";

interface PartnerWithSites extends Partner {
  whitelabelSites?: WhitelabelSite[];
}

export function BusinessModelManagement() {
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithSites | null>(null);
  const [isCreatePartnerDialogOpen, setIsCreatePartnerDialogOpen] = useState(false);
  const [isEditPartnerDialogOpen, setIsEditPartnerDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only fetch B2B partners (widget integrations) - NOT whitelabel sites
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["/api/admin/b2b-partners"],
    select: (data: any) => data?.filter((partner: any) => partner.type === 'widget' && partner.status === 'active') || []
  });

  const { data: partnerStats = {} } = useQuery({
    queryKey: ["/api/admin/partner-stats"],
  });

  // Fetch all available boxes for assignment
  const { data: allBoxes = [] } = useQuery({
    queryKey: ["/api/admin/boxes"],
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/partners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      setIsCreatePartnerDialogOpen(false);
      toast({ title: "Partner created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating partner", description: error.message, variant: "destructive" });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/admin/partners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      setIsEditPartnerDialogOpen(false);
      setSelectedPartner(null);
      toast({ title: "Partner updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating partner", description: error.message, variant: "destructive" });
    },
  });

  const generateApiKeyMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      return apiRequest("POST", `/api/admin/partners/${partnerId}/regenerate-api-key`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({ title: "API key regenerated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error regenerating API key", description: error.message, variant: "destructive" });
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "widget": return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "whitelabel": return "bg-purple-500/10 text-purple-700 border-purple-200";
      case "api_integration": return "bg-green-500/10 text-green-700 border-green-200";
      case "hybrid": return "bg-orange-500/10 text-orange-700 border-orange-200";
      default: return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-700 border-green-200";
      case "suspended": return "bg-red-500/10 text-red-700 border-red-200";
      case "inactive": return "bg-gray-500/10 text-gray-700 border-gray-200";
      default: return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "widget": return <Code className="w-4 h-4" />;
      case "whitelabel": return <Globe className="w-4 h-4" />;
      case "api_integration": return <Zap className="w-4 h-4" />;
      case "hybrid": return <Building2 className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const CreatePartnerDialog = () => {
    const [formData, setFormData] = useState({
      name: "",
      slug: "",
      type: "widget",
      domain: "",
      subdomain: "",
      widgetEnabled: true,
      commissionRate: "0.1000",
      revenueShare: "0.0000",
      brandingConfig: "{}",
      widgetConfig: "{}"
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createPartnerMutation.mutate({
        ...formData,
        commissionRate: parseFloat(formData.commissionRate),
        revenueShare: parseFloat(formData.revenueShare),
      });
    };

    return (
      <Dialog open={isCreatePartnerDialogOpen} onOpenChange={setIsCreatePartnerDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Partner</DialogTitle>
            <DialogDescription>
              Set up a new business partner with B2B widget integration or whitelabel capabilities
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Partner Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Casino Partner Inc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="casino-partner"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Business Model</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="widget">
                    <div className="flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      B2B Widget Integration
                    </div>
                  </SelectItem>

                  <SelectItem value="api_integration">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      API Integration
                    </div>
                  </SelectItem>

                </SelectContent>
              </Select>
            </div>

            {(formData.type === "whitelabel" || formData.type === "hybrid") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="domain">Custom Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="boxes.partner.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                    placeholder="partner"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  placeholder="0.1000"
                />
              </div>
              <div>
                <Label htmlFor="revenueShare">Revenue Share (%)</Label>
                <Input
                  id="revenueShare"
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  value={formData.revenueShare}
                  onChange={(e) => setFormData({ ...formData, revenueShare: e.target.value })}
                  placeholder="0.0000"
                />
              </div>
            </div>

            {(formData.type === "widget" || formData.type === "hybrid") && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="widgetEnabled"
                  checked={formData.widgetEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, widgetEnabled: checked })}
                />
                <Label htmlFor="widgetEnabled">Enable Widget Integration</Label>
              </div>
            )}

            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="widget">Widget Config</TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="space-y-2">
                <Label htmlFor="brandingConfig">Branding Configuration (JSON)</Label>
                <Textarea
                  id="brandingConfig"
                  value={formData.brandingConfig}
                  onChange={(e) => setFormData({ ...formData, brandingConfig: e.target.value })}
                  placeholder='{"primaryColor": "#3b82f6", "logo": "https://...", "companyName": "Partner Inc."}'
                  rows={3}
                />
              </TabsContent>

              <TabsContent value="widget" className="space-y-2">
                <Label htmlFor="widgetConfig">Widget Configuration (JSON)</Label>
                <Textarea
                  id="widgetConfig"
                  value={formData.widgetConfig}
                  onChange={(e) => setFormData({ ...formData, widgetConfig: e.target.value })}
                  placeholder='{"theme": "dark", "allowedDomains": ["partner.com"], "features": ["boxes", "inventory"]}'
                  rows={3}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreatePartnerDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPartnerMutation.isPending}>
                {createPartnerMutation.isPending ? "Creating..." : "Create Partner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">B2B Partner Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">B2B Widget Partners</h2>
          <p className="text-muted-foreground">Manage JavaScript widget integrations for existing casino and ecommerce sites</p>
        </div>
        <CreatePartnerDialog />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Partners</p>
                <p className="text-2xl font-bold">{partners.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Widget Partners</p>
                <p className="text-2xl font-bold">
                  {partners.filter((p: Partner) => p.type === "widget" || p.type === "hybrid").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">API Integrations</p>
                <p className="text-2xl font-bold">
                  {partners.filter((p: Partner) => p.type === "api_integration").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Partners</p>
                <p className="text-2xl font-bold">
                  {partners.filter((p: Partner) => p.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        // Clear selected partner when navigating away from partner-specific tabs
        if (value !== "boxes" && value !== "config" && selectedPartner) {
          setSelectedPartner(null);
        }
        setActiveTab(value);
      }}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="widget">Widget Partners</TabsTrigger>
          <TabsTrigger value="api">API Partners</TabsTrigger>
          {selectedPartner && (
            <TabsTrigger value="config">
              {selectedPartner.name} - Configuration
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner: PartnerWithSites) => (
              <Card key={partner.id} className={`group hover:shadow-lg transition-all duration-200 ${
                selectedPartner?.id === partner.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center">
                        {getTypeIcon(partner.type || "widget")}
                        <span className="ml-2">{partner.name}</span>
                      </CardTitle>
                      <CardDescription>/{partner.slug}</CardDescription>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge className={getTypeColor(partner.type || "widget")}>
                        {partner.type || "widget"}
                      </Badge>
                      <Badge className={getStatusColor(partner.status || "active")}>
                        {partner.status || "active"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Commission</Label>
                      <div>{(parseFloat(partner.commissionRate || "0") * 100).toFixed(2)}%</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Revenue Share</Label>
                      <div>{(parseFloat(partner.revenueShare || "0") * 100).toFixed(2)}%</div>
                    </div>
                    {partner.domain && (
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Domain</Label>
                        <div className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {partner.domain}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">API Key</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(partner.apiKey || "");
                          toast({ title: "API key copied to clipboard" });
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <code className="block text-xs bg-muted p-2 rounded font-mono">
                      {partner.apiKey?.substring(0, 20)}...
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPartner(partner);
                        setIsEditPartnerDialogOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedPartner?.id === partner.id ? "secondary" : "default"}
                      onClick={() => {
                        setSelectedPartner(partner);
                        setActiveTab("config");
                      }}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      {selectedPartner?.id === partner.id ? "Currently Selected" : "Configure Widget"}
                    </Button>
                    {partner.domain && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://${partner.domain}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateApiKeyMutation.mutate(partner.id)}
                      disabled={generateApiKeyMutation.isPending}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="widget">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners
              .filter((partner: Partner) => partner.type === "widget" || partner.type === "hybrid")
              .map((partner: PartnerWithSites) => (
                <Card key={partner.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center">
                          <Code className="w-4 h-4" />
                          <span className="ml-2">{partner.name}</span>
                        </CardTitle>
                        <CardDescription>Widget Integration</CardDescription>
                      </div>
                      <Badge className={partner.widgetEnabled ? "bg-green-500/10 text-green-700" : "bg-gray-500/10 text-gray-700"}>
                        {partner.widgetEnabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <Label className="text-xs text-muted-foreground">Widget Configuration</Label>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(JSON.parse(partner.widgetConfig || "{}"), null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>



        <TabsContent value="api">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners
              .filter((partner: Partner) => partner.type === "api_integration" || partner.type === "hybrid")
              .map((partner: PartnerWithSites) => (
                <Card key={partner.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center">
                          <Zap className="w-4 h-4" />
                          <span className="ml-2">{partner.name}</span>
                        </CardTitle>
                        <CardDescription>API Integration</CardDescription>
                      </div>
                      <Badge className="bg-green-500/10 text-green-700">
                        API
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">API Endpoint</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(`/api/partner/v1`);
                            toast({ title: "API endpoint copied to clipboard" });
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <code className="block text-xs bg-muted p-2 rounded font-mono">
                        /api/partner/v1/*
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="boxes" className="space-y-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Box Assignment Management</h3>
            <p className="text-sm text-muted-foreground">
              Assign mystery boxes to B2B partners for their widget integrations. Changes sync immediately with the widget API.
            </p>
          </div>
          
          {selectedPartner ? (
            <BoxManagement 
              partner={selectedPartner} 
              onConfigUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/widget/data"] });
                toast({ title: "Box configuration updated", description: "Widget data refreshed" });
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Select a Partner</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a B2B partner from the list above to manage their box assignments.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partners.map((partner: any) => (
                    <Card 
                      key={partner.id} 
                      className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium">{partner.name}</h4>
                        <p className="text-sm text-muted-foreground">{partner.slug}</p>
                        <Badge className="mt-2" variant="outline">
                          {partner.type}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Widget Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure the appearance, features, and behavior of B2B partner widgets. Changes sync immediately with iframe integrations.
            </p>
          </div>
          
          {selectedPartner ? (
            <WidgetConfiguration 
              partner={selectedPartner} 
              onConfigUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/widget/data"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
                toast({ title: "Widget configuration updated", description: "Changes applied to iframe widget" });
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Select a B2B Partner</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a B2B partner from the list above to configure their widget appearance and features.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {partners.filter((p: Partner) => p.type === "widget" || p.type === "hybrid").map((partner: any) => (
                    <Card 
                      key={partner.id} 
                      className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{partner.name}</h4>
                          <Badge variant="outline">{partner.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{partner.slug}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Globe className="w-3 h-3 mr-1" />
                          {partner.domain || 'No domain set'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {partners.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No business partners</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first business partner to enable B2B widget integrations or whitelabel platforms.
            </p>
            <CreatePartnerDialog />
          </CardContent>
        </Card>
      )}

      {/* Edit Partner Dialog */}
      <Dialog open={isEditPartnerDialogOpen} onOpenChange={setIsEditPartnerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>
              Update partner configuration and business model settings
            </DialogDescription>
          </DialogHeader>
          {selectedPartner && <EditPartnerForm partner={selectedPartner} onSuccess={() => setIsEditPartnerDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditPartnerForm({ partner, onSuccess }: { partner: PartnerWithSites; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: partner.name || '',
    slug: partner.slug || '',
    domain: partner.domain || '',
    type: partner.type || 'widget',
    status: partner.status || 'active',
    commissionRate: partner.commissionRate || '0.05',
    revenueShare: partner.revenueShare || '0.1',
    maxApiCalls: partner.maxApiCalls || 1000,
    brandingConfig: partner.brandingConfig || {},
    integrationConfig: partner.integrationConfig || {}
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePartnerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/admin/partners/${partner.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({ title: "Partner updated successfully" });
      onSuccess();
    },
    onError: (error) => {
      toast({ title: "Error updating partner", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePartnerMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="business">Business Model</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-partner-name">Partner Name</Label>
              <Input
                id="edit-partner-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Partner Name"
              />
            </div>
            <div>
              <Label htmlFor="edit-partner-slug">Slug</Label>
              <Input
                id="edit-partner-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="partner-slug"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-partner-domain">Domain</Label>
            <Input
              id="edit-partner-domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-partner-type">Partner Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="widget">Widget Integration</SelectItem>
                  <SelectItem value="whitelabel">Whitelabel Platform</SelectItem>
                  <SelectItem value="api">API Partner</SelectItem>
                  <SelectItem value="hybrid">Hybrid Model</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-partner-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-commission-rate">Commission Rate</Label>
              <Input
                id="edit-commission-rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                placeholder="0.05"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(parseFloat(formData.commissionRate) * 100).toFixed(2)}% commission rate
              </p>
            </div>
            <div>
              <Label htmlFor="edit-revenue-share">Revenue Share</Label>
              <Input
                id="edit-revenue-share"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.revenueShare}
                onChange={(e) => setFormData({ ...formData, revenueShare: e.target.value })}
                placeholder="0.10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(parseFloat(formData.revenueShare) * 100).toFixed(2)}% revenue share
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="edit-max-api-calls">Max API Calls per Month</Label>
            <Input
              id="edit-max-api-calls"
              type="number"
              min="0"
              value={formData.maxApiCalls}
              onChange={(e) => setFormData({ ...formData, maxApiCalls: parseInt(e.target.value) || 0 })}
              placeholder="1000"
            />
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-partner-primary-color">Primary Color</Label>
              <Input
                id="edit-partner-primary-color"
                type="color"
                value={formData.brandingConfig?.primary_color || '#3B82F6'}
                onChange={(e) => setFormData({
                  ...formData,
                  brandingConfig: { ...formData.brandingConfig, primary_color: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="edit-partner-secondary-color">Secondary Color</Label>
              <Input
                id="edit-partner-secondary-color"
                type="color"
                value={formData.brandingConfig?.secondary_color || '#1F2937'}
                onChange={(e) => setFormData({
                  ...formData,
                  brandingConfig: { ...formData.brandingConfig, secondary_color: e.target.value }
                })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-partner-logo-url">Logo URL</Label>
            <Input
              id="edit-partner-logo-url"
              value={formData.brandingConfig?.logo_url || ''}
              onChange={(e) => setFormData({
                ...formData,
                brandingConfig: { ...formData.brandingConfig, logo_url: e.target.value }
              })}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="webhook-support"
                checked={formData.integrationConfig?.webhook_support || false}
                onChange={(e) => setFormData({
                  ...formData,
                  integrationConfig: { ...formData.integrationConfig, webhook_support: e.target.checked }
                })}
              />
              <Label htmlFor="webhook-support">Webhook Support</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="iframe-integration"
                checked={formData.integrationConfig?.iframe_integration || false}
                onChange={(e) => setFormData({
                  ...formData,
                  integrationConfig: { ...formData.integrationConfig, iframe_integration: e.target.checked }
                })}
              />
              <Label htmlFor="iframe-integration">iFrame Integration</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="api-access"
                checked={formData.integrationConfig?.api_access || false}
                onChange={(e) => setFormData({
                  ...formData,
                  integrationConfig: { ...formData.integrationConfig, api_access: e.target.checked }
                })}
              />
              <Label htmlFor="api-access">Full API Access</Label>
            </div>
          </div>

          {formData.integrationConfig?.webhook_support && (
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={formData.integrationConfig?.webhook_url || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  integrationConfig: { ...formData.integrationConfig, webhook_url: e.target.value }
                })}
                placeholder="https://example.com/webhook"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={updatePartnerMutation.isPending}>
          {updatePartnerMutation.isPending ? "Updating..." : "Update Partner"}
        </Button>
      </div>
    </form>
  );
}