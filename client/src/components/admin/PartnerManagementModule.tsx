import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Settings, Eye, Key, Activity, TrendingUp } from "lucide-react";

interface Partner {
  id: number;
  name: string;
  slug: string;
  email: string;
  website?: string;
  description?: string;
  status: string;
  type: string;
  apiKey: string;
  apiSecret: string;
  commissionRate: string;
  revenueShare: string;
  maxApiCalls: number;
  webhookUrl?: string;
  createdAt: string;
  lastUsed?: string;
}

interface PartnerStats {
  totalRevenue: string;
  transactionCount: number;
  apiCalls: number;
  avgResponseTime: number;
}

export default function PartnerManagementModule() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["/api/admin/partners"],
  });

  const { data: partnerStats } = useQuery({
    queryKey: ["/api/admin/partners/stats", selectedPartner?.id],
    enabled: !!selectedPartner,
  });

  const createPartnerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/partners", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Partner Created",
        description: "New partner has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create partner",
        variant: "destructive",
      });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/admin/partners/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      setIsEditDialogOpen(false);
      setSelectedPartner(null);
      toast({
        title: "Partner Updated",
        description: "Partner information has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update partner",
        variant: "destructive",
      });
    },
  });

  const togglePartnerStatusMutation = useMutation({
    mutationFn: (partnerId: number) => 
      apiRequest("POST", `/api/admin/partners/${partnerId}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({
        title: "Status Updated",
        description: "Partner status has been changed.",
      });
    },
  });

  const regenerateApiKeyMutation = useMutation({
    mutationFn: (partnerId: number) => 
      apiRequest("POST", `/api/admin/partners/${partnerId}/regenerate-api-key`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({
        title: "API Key Regenerated",
        description: "New API key has been generated for the partner.",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'inactive': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'whitelabel': return 'default';
      case 'api_partner': return 'secondary';
      case 'casino': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Partner Management</h2>
          <p className="text-muted-foreground">
            Manage B2B partnerships, API integrations, and whitelabel configurations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Partner</DialogTitle>
              <DialogDescription>
                Add a new B2B partner for API integration or whitelabel service
              </DialogDescription>
            </DialogHeader>
            <PartnerForm
              onSubmit={(data) => createPartnerMutation.mutate(data)}
              isLoading={createPartnerMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="partners">All Partners</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partners.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active integrations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,543</div>
                <p className="text-xs text-muted-foreground">
                  +15% from yesterday
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partner Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$8,452</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Webhooks</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {partners.filter((p: Partner) => p.webhookUrl).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Configured endpoints
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partner Directory</CardTitle>
              <CardDescription>
                Manage all B2B partners and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>API Calls</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner: Partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{partner.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {partner.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(partner.type)}>
                            {partner.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(partner.status)}>
                            {partner.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{partner.commissionRate}%</TableCell>
                        <TableCell>{partner.maxApiCalls}/hour</TableCell>
                        <TableCell>
                          {partner.lastUsed 
                            ? new Date(partner.lastUsed).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPartner(partner)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPartner(partner);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePartnerStatusMutation.mutate(partner.id)}
                            >
                              {partner.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partner Analytics</CardTitle>
              <CardDescription>
                Performance metrics and revenue tracking for all partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Select a partner from the Partners tab to view detailed analytics
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Partner Details Dialog */}
      {selectedPartner && (
        <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPartner.name} - Partner Details</DialogTitle>
              <DialogDescription>
                Comprehensive partner information and statistics
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>API Key</Label>
                  <div className="flex space-x-2">
                    <Input value={selectedPartner.apiKey} readOnly />
                    <Button
                      variant="outline"
                      onClick={() => regenerateApiKeyMutation.mutate(selectedPartner.id)}
                    >
                      Regenerate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Secret Key</Label>
                  <Input value="••••••••••••••••" readOnly />
                </div>
              </div>
              
              {partnerStats && (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">${partnerStats.totalRevenue}</div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{partnerStats.transactionCount}</div>
                      <p className="text-sm text-muted-foreground">Transactions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{partnerStats.apiCalls}</div>
                      <p className="text-sm text-muted-foreground">API Calls</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{partnerStats.avgResponseTime}ms</div>
                      <p className="text-sm text-muted-foreground">Avg Response</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Partner Dialog */}
      {selectedPartner && isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Partner</DialogTitle>
              <DialogDescription>
                Update partner configuration and settings
              </DialogDescription>
            </DialogHeader>
            <PartnerForm
              partner={selectedPartner}
              onSubmit={(data) => updatePartnerMutation.mutate({ 
                id: selectedPartner.id, 
                data 
              })}
              isLoading={updatePartnerMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function PartnerForm({ 
  partner, 
  onSubmit, 
  isLoading 
}: { 
  partner?: Partner; 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: partner?.name || '',
    slug: partner?.slug || '',
    email: partner?.email || '',
    website: partner?.website || '',
    description: partner?.description || '',
    type: partner?.type || 'api_partner',
    commissionRate: partner?.commissionRate || '5',
    revenueShare: partner?.revenueShare || '50',
    maxApiCalls: partner?.maxApiCalls || 1000,
    webhookUrl: partner?.webhookUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Partner Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="type">Partner Type</Label>
          <Select value={formData.type} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, type: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whitelabel">Whitelabel</SelectItem>
              <SelectItem value="api_partner">API Partner</SelectItem>
              <SelectItem value="casino">Casino Integration</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="commissionRate">Commission Rate (%)</Label>
          <Input
            id="commissionRate"
            type="number"
            value={formData.commissionRate}
            onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: e.target.value }))}
            min="0"
            max="100"
          />
        </div>
        <div>
          <Label htmlFor="maxApiCalls">Max API Calls/Hour</Label>
          <Input
            id="maxApiCalls"
            type="number"
            value={formData.maxApiCalls}
            onChange={(e) => setFormData(prev => ({ ...prev, maxApiCalls: parseInt(e.target.value) }))}
            min="100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="webhookUrl">Webhook URL</Label>
        <Input
          id="webhookUrl"
          value={formData.webhookUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
          placeholder="https://partner.example.com/webhook"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : partner ? "Update Partner" : "Create Partner"}
        </Button>
      </div>
    </form>
  );
}