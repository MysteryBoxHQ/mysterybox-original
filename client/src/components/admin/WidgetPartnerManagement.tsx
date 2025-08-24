import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Package, 
  Users, 
  Code, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Partner {
  id: number;
  name: string;
  slug: string;
  apiKey: string;
  apiSecret: string;
  status: 'active' | 'suspended' | 'inactive';
  type: 'widget' | 'api_integration' | 'whitelabel' | 'hybrid';
  domain?: string;
  subdomain?: string;
  brandingConfig?: string;
  widgetEnabled: boolean;
  widgetConfig?: string;
  commissionRate: string;
  revenueShare: string;
  maxApiCalls: number;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface WidgetConfig {
  theme: 'light' | 'dark';
  compact: boolean;
  enabledWidgets: string[];
  customColors?: {
    primary: string;
    secondary: string;
    background: string;
  };
  branding?: {
    logo?: string;
    name?: string;
  };
}

export default function WidgetPartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const { toast } = useToast();

  const [newPartner, setNewPartner] = useState({
    name: '',
    slug: '',
    type: 'widget' as const,
    domain: '',
    subdomain: '',
    commissionRate: '0.1000',
    revenueShare: '0.0000',
    maxApiCalls: 10000,
    webhookUrl: '',
    widgetEnabled: true
  });

  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    theme: 'light',
    compact: false,
    enabledWidgets: ['box-opening', 'inventory', 'marketplace', 'battles', 'stats'],
    customColors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff'
    },
    branding: {
      name: ''
    }
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/admin/partners');
      const data = await response.json();
      setPartners(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch partners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPartner = async () => {
    try {
      const partnerData = {
        ...newPartner,
        widgetConfig: JSON.stringify(widgetConfig)
      };
      
      await apiRequest('POST', '/api/admin/partners', partnerData);
      
      toast({
        title: "Success",
        description: "Partner created successfully",
      });
      
      setShowCreateModal(false);
      resetNewPartner();
      fetchPartners();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create partner",
        variant: "destructive",
      });
    }
  };

  const updatePartnerStatus = async (partnerId: number, status: string) => {
    try {
      await apiRequest('PUT', `/api/admin/partners/${partnerId}`, { status });
      
      toast({
        title: "Success",
        description: "Partner status updated",
      });
      
      fetchPartners();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update partner status",
        variant: "destructive",
      });
    }
  };

  const updateWidgetConfig = async (partnerId: number) => {
    try {
      await apiRequest('PUT', `/api/admin/partners/${partnerId}`, {
        widgetConfig: JSON.stringify(widgetConfig),
        widgetEnabled: true
      });
      
      toast({
        title: "Success",
        description: "Widget configuration updated",
      });
      
      setShowWidgetConfig(false);
      fetchPartners();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update widget configuration",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const resetNewPartner = () => {
    setNewPartner({
      name: '',
      slug: '',
      type: 'widget',
      domain: '',
      subdomain: '',
      commissionRate: '0.1000',
      revenueShare: '0.0000',
      maxApiCalls: 10000,
      webhookUrl: '',
      widgetEnabled: true
    });
    setWidgetConfig({
      theme: 'light',
      compact: false,
      enabledWidgets: ['box-opening', 'inventory', 'marketplace', 'battles', 'stats'],
      customColors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        background: '#ffffff'
      },
      branding: {
        name: ''
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'suspended': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'widget': return <Package className="h-4 w-4" />;
      case 'api_integration': return <Code className="h-4 w-4" />;
      case 'whitelabel': return <Users className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const generateEmbedCode = (partner: Partner) => {
    const config = partner.widgetConfig ? JSON.parse(partner.widgetConfig) : widgetConfig;
    return `<!-- RollingDrop Widget Integration -->
<script src="https://widgets.rollingdrop.com/latest/rollingdrop-widgets.js"></script>

<!-- Widget containers -->
<div id="box-opening-widget"></div>
<div id="inventory-widget"></div>
<div id="marketplace-widget"></div>

<script>
// Initialize RollingDrop Widgets
const widgets = new RollingDropWidgets({
  apiKey: '${partner.apiKey}',
  partnerId: '${partner.slug}',
  theme: '${config.theme || 'light'}',
  baseUrl: 'https://api.rollingdrop.com'
});

// Create widgets
widgets.createBoxOpeningWidget('box-opening-widget', { 
  compact: ${config.compact || false},
  maxBoxes: 6 
});

widgets.createInventoryWidget('inventory-widget', { 
  compact: ${config.compact || false},
  showActions: true 
});

widgets.createMarketplaceWidget('marketplace-widget', { 
  compact: ${config.compact || false},
  showSearch: true 
});

// Event listeners for widget interactions
window.addEventListener('rollingdrop:boxOpened', (event) => {
  console.log('Box opened:', event.detail);
  // Handle box opening result
});

window.addEventListener('rollingdrop:purchase', (event) => {
  console.log('Item purchased:', event.detail);
  // Handle marketplace purchase
});
</script>`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Widget Partner Management</h2>
          <p className="text-gray-600">Manage B2B partners and widget integrations</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Widget Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Widget Partner</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="widget">Widget Config</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Partner Name</Label>
                    <Input
                      id="name"
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      placeholder="e.g., Casino Partner"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (URL-friendly)</Label>
                    <Input
                      id="slug"
                      value={newPartner.slug}
                      onChange={(e) => setNewPartner({ ...newPartner, slug: e.target.value })}
                      placeholder="e.g., casino-partner"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="domain">Domain (optional)</Label>
                    <Input
                      id="domain"
                      value={newPartner.domain}
                      onChange={(e) => setNewPartner({ ...newPartner, domain: e.target.value })}
                      placeholder="e.g., partner.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subdomain">Subdomain (optional)</Label>
                    <Input
                      id="subdomain"
                      value={newPartner.subdomain}
                      onChange={(e) => setNewPartner({ ...newPartner, subdomain: e.target.value })}
                      placeholder="e.g., games"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commission">Commission Rate</Label>
                    <Input
                      id="commission"
                      value={newPartner.commissionRate}
                      onChange={(e) => setNewPartner({ ...newPartner, commissionRate: e.target.value })}
                      placeholder="0.1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxCalls">Max API Calls/Month</Label>
                    <Input
                      id="maxCalls"
                      type="number"
                      value={newPartner.maxApiCalls}
                      onChange={(e) => setNewPartner({ ...newPartner, maxApiCalls: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="widget" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Theme</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={widgetConfig.theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setWidgetConfig({ ...widgetConfig, theme: 'light' })}
                      >
                        Light
                      </Button>
                      <Button
                        variant={widgetConfig.theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setWidgetConfig({ ...widgetConfig, theme: 'dark' })}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Compact Mode</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        checked={widgetConfig.compact}
                        onCheckedChange={(checked) => setWidgetConfig({ ...widgetConfig, compact: checked })}
                      />
                      <span className="text-sm">Enable compact widgets</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Enabled Widgets</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['box-opening', 'inventory', 'marketplace', 'battles', 'stats'].map(widget => (
                      <div key={widget} className="flex items-center gap-2">
                        <Switch
                          checked={widgetConfig.enabledWidgets.includes(widget)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setWidgetConfig({
                                ...widgetConfig,
                                enabledWidgets: [...widgetConfig.enabledWidgets, widget]
                              });
                            } else {
                              setWidgetConfig({
                                ...widgetConfig,
                                enabledWidgets: widgetConfig.enabledWidgets.filter(w => w !== widget)
                              });
                            }
                          }}
                        />
                        <span className="text-sm capitalize">{widget.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="brandingName">Branding Name</Label>
                  <Input
                    id="brandingName"
                    value={widgetConfig.branding?.name || ''}
                    onChange={(e) => setWidgetConfig({
                      ...widgetConfig,
                      branding: { ...widgetConfig.branding, name: e.target.value }
                    })}
                    placeholder="Partner's branding name"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createPartner}>
                Create Partner
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Partners Grid */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-8">Loading partners...</div>
        ) : partners.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No widget partners found</p>
          </div>
        ) : (
          partners.map(partner => (
            <Card key={partner.id} className="border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(partner.type)}
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(partner.status)} text-white`}>
                      {partner.status}
                    </Badge>
                    {partner.widgetEnabled && (
                      <Badge variant="outline">Widget Enabled</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Embed Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Widget Embed Code - {partner.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Integration Code</Label>
                            <div className="relative mt-2">
                              <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                                {generateEmbedCode(partner)}
                              </pre>
                              <Button
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(generateEmbedCode(partner))}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPartner(partner);
                        if (partner.widgetConfig) {
                          setWidgetConfig(JSON.parse(partner.widgetConfig));
                        }
                        setShowWidgetConfig(true);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">API Key:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {partner.apiKey.substring(0, 8)}...
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(partner.apiKey)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Type:</span>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {partner.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Commission:</span>
                    <div className="mt-1">{(parseFloat(partner.commissionRate) * 100).toFixed(2)}%</div>
                  </div>
                  
                  <div>
                    <span className="font-medium">API Calls:</span>
                    <div className="mt-1">{partner.maxApiCalls?.toLocaleString()}/month</div>
                  </div>
                </div>

                {partner.domain && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <span className="font-medium">Domain:</span>
                      <a 
                        href={`https://${partner.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {partner.domain}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Widget Configuration Modal */}
      <Dialog open={showWidgetConfig} onOpenChange={setShowWidgetConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Widgets - {selectedPartner?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Theme</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={widgetConfig.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWidgetConfig({ ...widgetConfig, theme: 'light' })}
                  >
                    Light
                  </Button>
                  <Button
                    variant={widgetConfig.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWidgetConfig({ ...widgetConfig, theme: 'dark' })}
                  >
                    Dark
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Compact Mode</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={widgetConfig.compact}
                    onCheckedChange={(checked) => setWidgetConfig({ ...widgetConfig, compact: checked })}
                  />
                  <span className="text-sm">Enable compact widgets</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Enabled Widgets</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['box-opening', 'inventory', 'marketplace', 'battles', 'stats'].map(widget => (
                  <div key={widget} className="flex items-center gap-2">
                    <Switch
                      checked={widgetConfig.enabledWidgets.includes(widget)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setWidgetConfig({
                            ...widgetConfig,
                            enabledWidgets: [...widgetConfig.enabledWidgets, widget]
                          });
                        } else {
                          setWidgetConfig({
                            ...widgetConfig,
                            enabledWidgets: widgetConfig.enabledWidgets.filter(w => w !== widget)
                          });
                        }
                      }}
                    />
                    <span className="text-sm capitalize">{widget.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowWidgetConfig(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedPartner && updateWidgetConfig(selectedPartner.id)}>
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}