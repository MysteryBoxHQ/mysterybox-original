import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Plus, Eye, EyeOff, Copy, Globe, Key, Activity, Settings, Users, BarChart3, ExternalLink, FileText, Package } from "lucide-react";
import ApiDocumentation from "./ApiDocumentation";

interface Partner {
  id: number;
  name: string;
  email: string;
  website?: string;
  description?: string;
  status: 'active' | 'suspended' | 'inactive';
  apiKey: string;
  secretKey: string;
  webhookUrl?: string;
  allowedDomains?: string;
  rateLimit: number;
  permissions: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
}

interface ApiUsage {
  id: number;
  partnerId: number;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  createdAt: string;
}

interface PartnerTransaction {
  id: number;
  partnerId: number;
  externalUserId: string;
  transactionType: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}

export default function IntegrationModule() {
  const [activeTab, setActiveTab] = useState("partners");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showApiKey, setShowApiKey] = useState<{ [key: number]: boolean }>({});
  const [showSecretKey, setShowSecretKey] = useState<{ [key: number]: boolean }>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch partners
  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/admin/partners"],
  });

  // Fetch API usage logs
  const { data: apiUsage = [], isLoading: usageLoading } = useQuery({
    queryKey: ["/api/admin/api-usage"],
  });

  // Fetch partner transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/partner-transactions"],
  });

  // Fetch boxes for assignment
  const { data: boxes = [] } = useQuery({
    queryKey: ["/api/boxes"],
  });

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/partners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Partner created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create partner",
        variant: "destructive",
      });
    },
  });

  // Update partner mutation
  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/admin/partners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({
        title: "Success",
        description: "Partner updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update partner",
        variant: "destructive",
      });
    },
  });

  // Delete partner mutation
  const deletePartnerMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({
        title: "Success",
        description: "Partner deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete partner",
        variant: "destructive",
      });
    },
  });

  // Box assignment mutation
  const assignBoxesMutation = useMutation({
    mutationFn: async (data: { partnerId: number; boxIds?: number[]; hasAllBoxes: boolean }) => {
      return apiRequest("POST", "/api/admin/partner-box-assignments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      toast({
        title: "Success",
        description: "Box assignments updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update box assignments",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      active: "default",
      suspended: "secondary",
      inactive: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integration Management</h2>
          <p className="text-muted-foreground">
            Manage third-party integrations, API access, and white label partnerships
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Partner</DialogTitle>
              <DialogDescription>
                Add a new integration partner with API access
              </DialogDescription>
            </DialogHeader>
            <CreatePartnerForm onSubmit={createPartnerMutation.mutate} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Partners
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            API Usage
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <div className="grid gap-4">
            {partnersLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : partners.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Partners Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first integration partner to start managing API access
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Partner
                  </Button>
                </CardContent>
              </Card>
            ) : (
              partners.map((partner: Partner) => (
                <Card key={partner.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {partner.name}
                          {getStatusBadge(partner.status)}
                        </CardTitle>
                        <CardDescription>{partner.email}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {partner.website && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={partner.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPartner(partner)}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Edit Partner</DialogTitle>
                              <DialogDescription>
                                Update partner information and API settings
                              </DialogDescription>
                            </DialogHeader>
                            {selectedPartner && (
                              <EditPartnerForm
                                partner={selectedPartner}
                                onSubmit={(data) => updatePartnerMutation.mutate({ id: selectedPartner.id, data })}
                                onDelete={() => deletePartnerMutation.mutate(selectedPartner.id)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Package className="h-4 w-4 mr-2" />
                              Assign Boxes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Assign Mystery Boxes</DialogTitle>
                              <DialogDescription>
                                Configure which mystery boxes {partner.name} can access through the API
                              </DialogDescription>
                            </DialogHeader>
                            <BoxAssignmentForm 
                              partner={partner} 
                              boxes={boxes} 
                              onSubmit={(data) => assignBoxesMutation.mutate(data)} 
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {partner.description && (
                      <p className="text-sm text-muted-foreground">{partner.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type={showApiKey[partner.id] ? "text" : "password"}
                            value={partner.apiKey}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKey(prev => ({ ...prev, [partner.id]: !prev[partner.id] }))}
                          >
                            {showApiKey[partner.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(partner.apiKey, "API Key")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Secret Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type={showSecretKey[partner.id] ? "text" : "password"}
                            value={partner.secretKey}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSecretKey(prev => ({ ...prev, [partner.id]: !prev[partner.id] }))}
                          >
                            {showSecretKey[partner.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(partner.secretKey, "Secret Key")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Rate Limit:</span>
                        <p className="text-muted-foreground">{partner.rateLimit}/hour</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p className="text-muted-foreground">{formatDate(partner.createdAt)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Last Used:</span>
                        <p className="text-muted-foreground">
                          {partner.lastUsed ? formatDate(partner.lastUsed) : "Never"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Permissions:</span>
                        <p className="text-muted-foreground">{partner.permissions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partners.length}</div>
                <p className="text-xs text-muted-foreground">
                  {partners.filter((p: Partner) => p.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Requests (24h)</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiUsage.length}</div>
                <p className="text-xs text-muted-foreground">
                  {apiUsage.filter((u: ApiUsage) => u.statusCode < 400).length} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
                <p className="text-xs text-muted-foreground">
                  ${transactions.reduce((sum: number, t: PartnerTransaction) => sum + parseFloat(t.amount), 0).toFixed(2)} total
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Logs</CardTitle>
              <CardDescription>Recent API requests from integration partners</CardDescription>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiUsage.map((usage: ApiUsage) => {
                      const partner = partners.find((p: Partner) => p.id === usage.partnerId);
                      return (
                        <TableRow key={usage.id}>
                          <TableCell>{partner?.name || 'Unknown'}</TableCell>
                          <TableCell className="font-mono text-xs">{usage.endpoint}</TableCell>
                          <TableCell>
                            <Badge variant={usage.method === 'GET' ? 'secondary' : 'default'}>
                              {usage.method}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={usage.statusCode < 400 ? 'default' : 'destructive'}>
                              {usage.statusCode}
                            </Badge>
                          </TableCell>
                          <TableCell>{usage.responseTime}ms</TableCell>
                          <TableCell>{formatDate(usage.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partner Transactions</CardTitle>
              <CardDescription>Box openings and financial transactions via API</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>External User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: PartnerTransaction) => {
                      const partner = partners.find((p: Partner) => p.id === transaction.partnerId);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{partner?.name || 'Unknown'}</TableCell>
                          <TableCell className="font-mono text-xs">{transaction.externalUserId}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{transaction.transactionType}</Badge>
                          </TableCell>
                          <TableCell>{transaction.currency} {transaction.amount}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <ApiDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreatePartnerForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    description: '',
    webhookUrl: '',
    allowedDomains: '',
    rateLimit: 1000,
    permissions: 'read,write',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Partner Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhookUrl">Webhook URL</Label>
        <Input
          id="webhookUrl"
          type="url"
          value={formData.webhookUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
          <Input
            id="rateLimit"
            type="number"
            value={formData.rateLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
            min={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="permissions">Permissions</Label>
          <Select
            value={formData.permissions}
            onValueChange={(value) => setFormData(prev => ({ ...prev, permissions: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="read">Read Only</SelectItem>
              <SelectItem value="read,write">Read & Write</SelectItem>
              <SelectItem value="read,write,admin">Full Access</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Partner</Button>
      </div>
    </form>
  );
}

function EditPartnerForm({ partner, onSubmit, onDelete }: { 
  partner: Partner; 
  onSubmit: (data: any) => void; 
  onDelete: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: partner.name,
    email: partner.email,
    website: partner.website || '',
    description: partner.description || '',
    webhookUrl: partner.webhookUrl || '',
    allowedDomains: partner.allowedDomains || '',
    rateLimit: partner.rateLimit,
    permissions: partner.permissions,
    status: partner.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Partner Name *</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email">Email *</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-website">Website</Label>
        <Input
          id="edit-website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-webhookUrl">Webhook URL</Label>
        <Input
          id="edit-webhookUrl"
          type="url"
          value={formData.webhookUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-rateLimit">Rate Limit (requests/hour)</Label>
          <Input
            id="edit-rateLimit"
            type="number"
            value={formData.rateLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
            min={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-permissions">Permissions</Label>
        <Select
          value={formData.permissions}
          onValueChange={(value) => setFormData(prev => ({ ...prev, permissions: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="read">Read Only</SelectItem>
            <SelectItem value="read,write">Read & Write</SelectItem>
            <SelectItem value="read,write,admin">Full Access</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
        >
          Delete Partner
        </Button>
        <div className="flex gap-2">
          <Button type="submit">Update Partner</Button>
        </div>
      </div>
    </form>
  );
}

function BoxAssignmentForm({ partner, boxes, onSubmit }: { 
  partner: Partner; 
  boxes: any[];
  onSubmit: (data: { partnerId: number; boxIds?: number[]; hasAllBoxes: boolean }) => void;
}) {
  const [hasAllBoxes, setHasAllBoxes] = useState(false);
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      partnerId: partner.id,
      hasAllBoxes,
      boxIds: hasAllBoxes ? undefined : selectedBoxes
    });
  };

  const toggleBoxSelection = (boxId: number) => {
    setSelectedBoxes(prev => 
      prev.includes(boxId) 
        ? prev.filter(id => id !== boxId)
        : [...prev, boxId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allBoxes"
            checked={hasAllBoxes}
            onCheckedChange={(checked) => {
              setHasAllBoxes(checked as boolean);
              if (checked) {
                setSelectedBoxes([]);
              }
            }}
          />
          <Label htmlFor="allBoxes" className="text-sm font-medium">
            Grant access to all mystery boxes
          </Label>
        </div>

        {!hasAllBoxes && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select specific boxes:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {boxes.map((box: any) => (
                <div key={box.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id={`box-${box.id}`}
                    checked={selectedBoxes.includes(box.id)}
                    onCheckedChange={() => toggleBoxSelection(box.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`box-${box.id}`} className="text-sm font-medium cursor-pointer">
                      {box.name}
                    </Label>
                    {box.description && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {box.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Price: ${box.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasAllBoxes && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{partner.name}</strong> will have access to all current and future mystery boxes.
            </p>
          </div>
        )}

        {!hasAllBoxes && selectedBoxes.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>{selectedBoxes.length}</strong> box(es) selected for <strong>{partner.name}</strong>.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!hasAllBoxes && selectedBoxes.length === 0}>
          Update Box Assignments
        </Button>
      </div>
    </form>
  );
}