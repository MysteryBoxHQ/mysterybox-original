import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Palette, 
  Shield, 
  Globe, 
  Code, 
  Eye,
  Save,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Package,
  Gem,
  Star,
  Target,
  CheckCircle
} from "lucide-react";

interface WidgetConfigurationProps {
  partner: any;
  onConfigUpdate?: () => void;
}

export function WidgetConfiguration({ partner, onConfigUpdate }: WidgetConfigurationProps) {
  const [widgetConfig, setWidgetConfig] = useState<{
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderRadius: string;
    fontFamily: string;
    logoUrl: string;
    allowedDomains: string[];
    newDomain: string;
    enabledFeatures: {
      boxes: boolean;
      inventory: boolean;
      leaderboard: boolean;
      battles: boolean;
      marketplace: boolean;
      profile: boolean;
    };
    layout: {
      showHeader: boolean;
      showFooter: boolean;
      compactMode: boolean;
      showPrices: boolean;
      showRarity: boolean;
      animationsEnabled: boolean;
    };
    integration: {
      autoResize: boolean;
      enablePostMessage: boolean;
      sandboxMode: boolean;
      cssOverrides: string;
      customJS: string;
    };
  }>({
    theme: 'dark',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#f59e0b',
    borderRadius: '8',
    fontFamily: 'Inter',
    logoUrl: '',
    allowedDomains: [],
    newDomain: '',
    enabledFeatures: {
      boxes: true,
      inventory: true,
      leaderboard: true,
      battles: false,
      marketplace: false,
      profile: true
    },
    layout: {
      showHeader: true,
      showFooter: false,
      compactMode: false,
      showPrices: true,
      showRarity: true,
      animationsEnabled: true
    },
    integration: {
      autoResize: true,
      enablePostMessage: true,
      sandboxMode: false,
      cssOverrides: '',
      customJS: ''
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load existing widget config for the specific partner
  const { data: partnerConfig, refetch: refetchConfig } = useQuery({
    queryKey: [`/api/admin/partners/${partner?.id}/widget-config`],
    enabled: !!partner?.id,
    retry: false,
  });

  // Fetch all available boxes
  const { data: allBoxes = [] } = useQuery({
    queryKey: ["/api/admin/boxes"],
  });

  // Fetch partner's assigned boxes
  const { data: partnerBoxes = [] } = useQuery({
    queryKey: [`/api/admin/partners/${partner?.id}/boxes`],
    enabled: !!partner?.id
  });

  // Box assignment mutation
  const assignBoxesMutation = useMutation({
    mutationFn: async (boxIds: number[]) => {
      return apiRequest("POST", `/api/admin/partners/${partner.id}/assign-boxes`, { boxIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/partners/${partner.id}/boxes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/widget/data"] });
      onConfigUpdate?.();
      toast({
        title: "Box assignments updated",
        description: "Widget box selection has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update box assignments",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Featured box mutation
  const updateFeaturedMutation = useMutation({
    mutationFn: async ({ boxId, isFeatured }: { boxId: number; isFeatured: boolean }) => {
      return apiRequest("PUT", `/api/admin/partners/${partner.id}/boxes/${boxId}/featured`, { isFeatured });
    },
    onMutate: async ({ boxId, isFeatured }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`/api/admin/partners/${partner.id}/boxes`] });
      
      // Snapshot the previous value
      const previousBoxes = queryClient.getQueryData([`/api/admin/partners/${partner.id}/boxes`]);
      
      // Optimistically update to the new value
      queryClient.setQueryData([`/api/admin/partners/${partner.id}/boxes`], (old: any) => {
        if (!old) return old;
        return old.map((box: any) => 
          box.boxId === boxId ? { ...box, isFeatured } : box
        );
      });
      
      // Return a context object with the snapshotted value
      return { previousBoxes };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBoxes) {
        queryClient.setQueryData([`/api/admin/partners/${partner.id}/boxes`], context.previousBoxes);
      }
      toast({
        title: "Failed to update featured status",
        description: err.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [`/api/admin/partners/${partner.id}/boxes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/widget/data"] });
      onConfigUpdate?.();
    },
  });

  useEffect(() => {
    if (partnerConfig?.widgetConfig) {
      try {
        const config = typeof partnerConfig.widgetConfig === 'string' 
          ? JSON.parse(partnerConfig.widgetConfig) 
          : partnerConfig.widgetConfig;
        setWidgetConfig(prev => ({ ...prev, ...config }));
      } catch (error) {
        console.error('Error parsing partner widget config:', error);
      }
    } else {
      // Reset to defaults when switching partners
      setWidgetConfig({
        theme: 'dark',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        backgroundColor: '#0f172a',
        textColor: '#ffffff',
        accentColor: '#f59e0b',
        borderRadius: '8',
        fontFamily: 'Inter',
        logoUrl: '',
        allowedDomains: [],
        newDomain: '',
        enabledFeatures: {
          boxes: true,
          inventory: true,
          leaderboard: true,
          battles: false,
          marketplace: false,
          profile: true
        },
        layout: {
          showHeader: true,
          showFooter: false,
          compactMode: false,
          showPrices: true,
          showRarity: true,
          animationsEnabled: true
        },
        integration: {
          autoResize: true,
          enablePostMessage: true,
          sandboxMode: false,
          cssOverrides: '',
          customJS: ''
        }
      });
    }
  }, [partnerConfig, partner?.id]);

  // Helper functions for box management
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      case 'mythical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const isBoxAssigned = (boxId: number) => {
    return (partnerBoxes as any[]).some((box: any) => box.id === boxId);
  };

  const handleBoxToggle = (boxId: number) => {
    const currentAssigned = (partnerBoxes as any[]).map((box: any) => box.id);
    const newAssigned = currentAssigned.includes(boxId)
      ? currentAssigned.filter(id => id !== boxId)
      : [...currentAssigned, boxId];
    
    assignBoxesMutation.mutate(newAssigned);
  };

  const handleFeaturedToggle = (boxId: number, isFeatured: boolean) => {
    updateFeaturedMutation.mutate({ boxId, isFeatured });
  };

  const updateConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      if (!partner?.id) throw new Error('No partner selected');
      return apiRequest("PUT", `/api/admin/partners/${partner.id}/widget-config`, { widgetConfig: config });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/partners/${partner?.id}/widget-config`] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/partners/${partner?.id}/boxes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/widget/data"] });
      refetchConfig(); // Refresh the partner-specific config
      onConfigUpdate?.();
      toast({
        title: "Widget configuration updated",
        description: "Changes will be reflected in the iframe widget immediately",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    updateConfigMutation.mutate(widgetConfig);
  };

  const addDomain = () => {
    if (widgetConfig.newDomain && !widgetConfig.allowedDomains.includes(widgetConfig.newDomain)) {
      setWidgetConfig(prev => ({
        ...prev,
        allowedDomains: [...prev.allowedDomains, prev.newDomain],
        newDomain: ''
      }));
    }
  };

  const removeDomain = (domain: string) => {
    setWidgetConfig(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter(d => d !== domain)
    }));
  };

  const previewUrl = `${window.location.origin}/widget/preview?partner=${partner?.slug}&config=${encodeURIComponent(JSON.stringify(widgetConfig))}`;

  if (!partner) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Select a partner to configure their widget</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{partner.name} - Widget Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure iframe widget appearance, features, and behavior for this partner
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => window.open(previewUrl, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSaveConfig}
            disabled={updateConfigMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="boxes">Boxes</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Theme & Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={widgetConfig.theme} 
                    onValueChange={(value) => setWidgetConfig(prev => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select 
                    value={widgetConfig.fontFamily} 
                    onValueChange={(value) => setWidgetConfig(prev => ({ ...prev, fontFamily: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="system-ui">System UI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={widgetConfig.primaryColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={widgetConfig.primaryColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={widgetConfig.secondaryColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={widgetConfig.secondaryColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#1e40af"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={widgetConfig.accentColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={widgetConfig.accentColor}
                      onChange={(e) => setWidgetConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="borderRadius">Border Radius (px)</Label>
                  <Input
                    type="number"
                    value={widgetConfig.borderRadius}
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, borderRadius: e.target.value }))}
                    placeholder="8"
                  />
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    value={widgetConfig.logoUrl}
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable specific features in the widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(widgetConfig.enabledFeatures).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {getFeatureDescription(feature)}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      setWidgetConfig(prev => ({
                        ...prev,
                        enabledFeatures: { ...prev.enabledFeatures, [feature]: checked }
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Configuration</CardTitle>
              <CardDescription>Customize the widget layout and display options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(widgetConfig.layout).map(([setting, value]) => (
                <div key={setting} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {getLayoutDescription(setting)}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setWidgetConfig(prev => ({
                        ...prev,
                        layout: { ...prev.layout, [setting]: checked }
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Domain Security
              </CardTitle>
              <CardDescription>Control which domains can embed this widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={widgetConfig.newDomain}
                  onChange={(e) => setWidgetConfig(prev => ({ ...prev, newDomain: e.target.value }))}
                  placeholder="example.com"
                />
                <Button onClick={addDomain} variant="outline">
                  Add Domain
                </Button>
              </div>
              
              <div className="space-y-2">
                {widgetConfig.allowedDomains.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{domain}</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeDomain(domain)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              {widgetConfig.allowedDomains.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No domain restrictions. Widget can be embedded on any domain.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Integration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(widgetConfig.integration).filter(([key]) => key !== 'cssOverrides' && key !== 'customJS').map(([setting, value]) => (
                <div key={setting} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {getIntegrationDescription(setting)}
                    </p>
                  </div>
                  <Switch
                    checked={value as boolean}
                    onCheckedChange={(checked) => 
                      setWidgetConfig(prev => ({
                        ...prev,
                        integration: { ...prev.integration, [setting]: checked }
                      }))
                    }
                  />
                </div>
              ))}
              
              <div className="space-y-2">
                <Label htmlFor="cssOverrides">Custom CSS</Label>
                <Textarea
                  id="cssOverrides"
                  value={widgetConfig.integration.cssOverrides}
                  onChange={(e) => setWidgetConfig(prev => ({
                    ...prev,
                    integration: { ...prev.integration, cssOverrides: e.target.value }
                  }))}
                  placeholder=".widget-container { border: 1px solid #ccc; }"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customJS">Custom JavaScript</Label>
                <Textarea
                  id="customJS"
                  value={widgetConfig.integration.customJS}
                  onChange={(e) => setWidgetConfig(prev => ({
                    ...prev,
                    integration: { ...prev.integration, customJS: e.target.value }
                  }))}
                  placeholder="// Custom widget initialization code"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boxes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Box Assignments
              </CardTitle>
              <CardDescription>
                Select which mystery boxes are available in this partner's widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-sm">
                    {(partnerBoxes as any[]).length} of {(allBoxes as any[]).length} boxes assigned
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    {(partnerBoxes as any[]).filter((pb: any) => pb.isFeatured).length} featured
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(allBoxes as any[]).map((box: any) => {
                  const isAssigned = isBoxAssigned(box.id);
                  const partnerBox = (partnerBoxes as any[]).find((pb: any) => pb.id === box.id);
                  const isFeatured = partnerBox?.isFeatured || false;
                  
                  return (
                    <Card key={box.id} className={`cursor-pointer transition-all hover:shadow-md ${
                      isAssigned ? 'ring-2 ring-primary' : ''
                    } ${isFeatured ? 'ring-2 ring-yellow-400' : ''}`}>
                      <CardContent className="p-4">
                        {/* Box Image Preview - Smaller Thumbnail */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative flex-shrink-0">
                            {box.imageUrl ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <img 
                                  src={box.imageUrl} 
                                  alt={box.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden flex-col items-center justify-center text-xs text-muted-foreground">
                                  <Package className="w-4 h-4 mb-1 opacity-50" />
                                  <span className="text-[10px]">No image</span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-xs text-muted-foreground">
                                <Package className="w-4 h-4 mb-1 opacity-50" />
                                <span className="text-[10px]">No image</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">{box.name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {box.description}
                                </p>
                              </div>
                              <Checkbox
                                checked={isAssigned}
                                onCheckedChange={() => handleBoxToggle(box.id)}
                                className="ml-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs mb-3">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getRarityColor(box.rarity)}`}></div>
                            <span className="capitalize">{box.rarity || 'common'}</span>
                          </div>
                          <span className="font-medium">${box.price}</span>
                        </div>
                        
                        {/* Status and Controls */}
                        <div className="space-y-2">
                          {/* Active Status */}
                          {isAssigned && (
                            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-fit">
                              <CheckCircle className="w-3 h-3" />
                              Active in Widget
                            </div>
                          )}
                          
                          {/* Featured Checkbox - Only show if box is assigned */}
                          {isAssigned && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <Star className={`w-4 h-4 ${isFeatured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium">Featured Box</span>
                                {isFeatured && (
                                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                                  isFeatured 
                                    ? 'bg-yellow-500 border-yellow-500 text-white' 
                                    : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400'
                                }`}
                                onClick={() => handleFeaturedToggle(box.id, !isFeatured)}
                                >
                                  {isFeatured && <CheckCircle className="w-3 h-3" />}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {(allBoxes as any[]).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No mystery boxes available</p>
                  <p className="text-sm">Create boxes in the admin panel first</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>
                Advanced widget settings and performance options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Cache Optimization</Label>
                    <p className="text-xs text-muted-foreground">Improve widget loading performance</p>
                  </div>
                  <Switch
                    checked={widgetConfig.integration?.cacheOptimization || false}
                    onCheckedChange={(checked) => 
                      setWidgetConfig(prev => ({
                        ...prev,
                        integration: { ...prev.integration, cacheOptimization: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Lazy Loading</Label>
                    <p className="text-xs text-muted-foreground">Load widget content on demand</p>
                  </div>
                  <Switch
                    checked={widgetConfig.integration?.lazyLoading || false}
                    onCheckedChange={(checked) => 
                      setWidgetConfig(prev => ({
                        ...prev,
                        integration: { ...prev.integration, lazyLoading: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Analytics Tracking</Label>
                    <p className="text-xs text-muted-foreground">Enable detailed usage analytics</p>
                  </div>
                  <Switch
                    checked={widgetConfig.integration?.analytics || false}
                    onCheckedChange={(checked) => 
                      setWidgetConfig(prev => ({
                        ...prev,
                        integration: { ...prev.integration, analytics: checked }
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxConcurrentUsers">Max Concurrent Users</Label>
                  <Input
                    id="maxConcurrentUsers"
                    type="number"
                    value={widgetConfig.integration?.maxConcurrentUsers || 1000}
                    onChange={(e) => setWidgetConfig(prev => ({
                      ...prev,
                      integration: { ...prev.integration, maxConcurrentUsers: parseInt(e.target.value) || 1000 }
                    }))}
                    min="1"
                    max="10000"
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of concurrent widget users</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={widgetConfig.integration?.apiRateLimit || 60}
                    onChange={(e) => setWidgetConfig(prev => ({
                      ...prev,
                      integration: { ...prev.integration, apiRateLimit: parseInt(e.target.value) || 60 }
                    }))}
                    min="1"
                    max="1000"
                  />
                  <p className="text-xs text-muted-foreground">Limit API requests to prevent abuse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getFeatureDescription(feature: string): string {
  const descriptions = {
    boxes: "Enable mystery box opening functionality",
    inventory: "Show user inventory and item management",
    leaderboard: "Display leaderboards and rankings",
    battles: "Enable case battle competitions",
    marketplace: "Allow item trading and marketplace",
    profile: "Show user profile and statistics"
  };
  return descriptions[feature as keyof typeof descriptions] || "Feature toggle";
}

function getLayoutDescription(setting: string): string {
  const descriptions = {
    showHeader: "Display widget header with logo and navigation",
    showFooter: "Show footer with links and information",
    compactMode: "Use compact layout for smaller spaces",
    showPrices: "Display item prices and values",
    showRarity: "Show rarity indicators on items",
    animationsEnabled: "Enable animations and transitions"
  };
  return descriptions[setting as keyof typeof descriptions] || "Layout setting";
}

function getIntegrationDescription(setting: string): string {
  const descriptions = {
    autoResize: "Automatically resize iframe to content",
    enablePostMessage: "Enable cross-frame communication",
    sandboxMode: "Run widget in sandbox environment"
  };
  return descriptions[setting as keyof typeof descriptions] || "Integration setting";
}