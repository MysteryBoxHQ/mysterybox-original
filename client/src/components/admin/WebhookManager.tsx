import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Webhook, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Edit, 
  Plus,
  RefreshCw,
  Activity,
  Settings
} from "lucide-react";

export default function WebhookManager() {
  const { toast } = useToast();
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);

  // Fetch data
  const { data: partners = [] } = useQuery({
    queryKey: ["/api/admin/partners"],
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ["/api/admin/webhooks"],
  });

  const { data: webhookLogs = [] } = useQuery({
    queryKey: ["/api/admin/webhook-logs"],
  });

  // Mutations
  const createWebhookMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/webhooks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      setCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Webhook created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/admin/webhooks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook updated successfully",
      });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/webhooks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks"] });
      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      });
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/webhooks/${id}/test`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhook-logs"] });
      setTestDialogOpen(false);
      toast({
        title: "Test Sent",
        description: "Webhook test payload sent successfully",
      });
    },
  });

  const handleCreateWebhook = (formData: FormData) => {
    const webhookData = {
      partnerId: parseInt(formData.get("partnerId") as string),
      url: formData.get("url") as string,
      events: (formData.get("events") as string).split(",").map(e => e.trim()),
      secret: formData.get("secret") as string,
      active: formData.get("active") === "on",
    };

    createWebhookMutation.mutate(webhookData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="w-4 h-4" />;
      case "failed": return <AlertCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredWebhooks = selectedPartner 
    ? webhooks.filter((w: any) => w.partnerId === parseInt(selectedPartner))
    : webhooks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Webhook Management</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Webhook</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateWebhook(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partnerId" className="text-white">Partner</Label>
                  <Select name="partnerId" required>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select partner" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {partners.map((partner: any) => (
                        <SelectItem key={partner.id} value={partner.id.toString()}>
                          {partner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="url" className="text-white">Webhook URL</Label>
                  <Input
                    name="url"
                    type="url"
                    placeholder="https://example.com/webhook"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="events" className="text-white">Events (comma-separated)</Label>
                <Input
                  name="events"
                  placeholder="box.opened, user.registered, payment.completed"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="secret" className="text-white">Secret Key (optional)</Label>
                <Input
                  name="secret"
                  placeholder="webhook_secret_key"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  defaultChecked
                  className="rounded"
                />
                <Label htmlFor="active" className="text-white">Active</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createWebhookMutation.isPending}
                >
                  {createWebhookMutation.isPending ? "Creating..." : "Create Webhook"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Label className="text-white">Filter by Partner:</Label>
            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger className="w-64 bg-gray-700 border-gray-600">
                <SelectValue placeholder="All partners" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="">All partners</SelectItem>
                {partners.map((partner: any) => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
          <TabsTrigger value="events">Event Types</TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Active Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Partner</TableHead>
                    <TableHead className="text-gray-300">URL</TableHead>
                    <TableHead className="text-gray-300">Events</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Last Triggered</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWebhooks.map((webhook: any) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="text-white">
                        {partners.find((p: any) => p.id === webhook.partnerId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="max-w-xs truncate">{webhook.url}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events?.slice(0, 2).map((event: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.events?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${webhook.active ? 'bg-green-500' : 'bg-gray-500'} text-white`}
                        >
                          {webhook.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {webhook.lastTriggered || 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setTestDialogOpen(true);
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Webhook Delivery Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Timestamp</TableHead>
                    <TableHead className="text-gray-300">Webhook</TableHead>
                    <TableHead className="text-gray-300">Event</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Response</TableHead>
                    <TableHead className="text-gray-300">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-gray-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="max-w-xs truncate">{log.webhookUrl}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.eventType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(log.status)}`} />
                          {getStatusIcon(log.status)}
                          <span className="text-white">{log.statusCode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="max-w-xs truncate">{log.response || 'No response'}</div>
                      </TableCell>
                      <TableCell className="text-gray-300">{log.duration}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Types Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'box.opened', description: 'When a user opens a box', color: 'bg-blue-500' },
              { name: 'user.registered', description: 'When a new user registers', color: 'bg-green-500' },
              { name: 'payment.completed', description: 'When a payment is processed', color: 'bg-purple-500' },
              { name: 'item.won', description: 'When a user wins an item', color: 'bg-yellow-500' },
              { name: 'battle.completed', description: 'When a battle finishes', color: 'bg-red-500' },
              { name: 'withdrawal.requested', description: 'When a user requests withdrawal', color: 'bg-orange-500' },
            ].map((event) => (
              <Card key={event.name} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${event.color}`} />
                    <div>
                      <h3 className="text-white font-medium">{event.name}</h3>
                      <p className="text-gray-400 text-sm">{event.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Webhook Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Test Webhook</DialogTitle>
          </DialogHeader>
          {selectedWebhook && (
            <div className="space-y-4">
              <div>
                <Label className="text-white">Webhook URL:</Label>
                <div className="text-gray-300 bg-gray-700 p-2 rounded mt-1">
                  {selectedWebhook.url}
                </div>
              </div>
              <div>
                <Label className="text-white">Test Payload:</Label>
                <Textarea
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  rows={8}
                  readOnly
                  value={JSON.stringify({
                    event: "test.webhook",
                    timestamp: new Date().toISOString(),
                    data: {
                      message: "This is a test webhook payload",
                      webhookId: selectedWebhook.id
                    }
                  }, null, 2)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => testWebhookMutation.mutate(selectedWebhook.id)}
                  disabled={testWebhookMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {testWebhookMutation.isPending ? "Sending..." : "Send Test"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}