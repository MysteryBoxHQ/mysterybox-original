import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Package, Truck, CheckCircle, Clock, AlertCircle, Edit, Eye } from "lucide-react";

interface ShippingOrder {
  id: number;
  userId: number;
  userItemId: number;
  shippingAddressId: number;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  shippingCost: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
    email?: string;
  };
  item?: {
    name: string;
    value: string;
  };
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'processing': return 'bg-blue-500';
    case 'shipped': return 'bg-purple-500';
    case 'delivered': return 'bg-green-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'processing': return <Package className="w-4 h-4" />;
    case 'shipped': return <Truck className="w-4 h-4" />;
    case 'delivered': return <CheckCircle className="w-4 h-4" />;
    case 'cancelled': return <AlertCircle className="w-4 h-4" />;
    default: return <Package className="w-4 h-4" />;
  }
};

function UpdateOrderDialog({ order, onClose }: { order: ShippingOrder; onClose: () => void }) {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [carrier, setCarrier] = useState(order.carrier || "");
  const [notes, setNotes] = useState(order.notes || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", `/api/admin/shipping/orders/${order.id}`, {
        status,
        trackingNumber: trackingNumber || null,
        carrier: carrier || null,
        notes: notes || null
      });
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Shipping order has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping/orders"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update shipping order",
        variant: "destructive",
      });
    },
  });

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Update Order #{order.id}</DialogTitle>
        <DialogDescription>
          Update shipping status and tracking information
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="carrier">Carrier</Label>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger>
              <SelectValue placeholder="Select carrier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No carrier</SelectItem>
              <SelectItem value="UPS">UPS</SelectItem>
              <SelectItem value="FedEx">FedEx</SelectItem>
              <SelectItem value="DHL">DHL</SelectItem>
              <SelectItem value="USPS">USPS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="tracking">Tracking Number</Label>
          <Input
            id="tracking"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
          />
        </div>
        
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this shipment..."
            rows={3}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="flex-1"
          >
            {updateMutation.isPending ? "Updating..." : "Update Order"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function OrderDetailsDialog({ order }: { order: ShippingOrder }) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Order #{order.id} Details</DialogTitle>
        <DialogDescription>
          Complete shipping order information
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Order Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Order ID:</strong> #{order.id}</p>
              <p><strong>Status:</strong> 
                <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </p>
              <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>
              <p><strong>Shipping Cost:</strong> ${order.shippingCost}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Customer</h4>
            <div className="space-y-1 text-sm">
              <p><strong>User ID:</strong> {order.userId}</p>
              {order.user && (
                <>
                  <p><strong>Username:</strong> {order.user.username}</p>
                  {order.user.email && <p><strong>Email:</strong> {order.user.email}</p>}
                </>
              )}
            </div>
          </div>
        </div>
        
        {order.shippingAddress && (
          <div>
            <h4 className="font-semibold mb-2">Shipping Address</h4>
            <div className="p-3 bg-gray-50 rounded text-sm">
              <p>{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        )}
        
        {order.item && (
          <div>
            <h4 className="font-semibold mb-2">Item Details</h4>
            <div className="p-3 bg-gray-50 rounded text-sm">
              <p><strong>Item:</strong> {order.item.name}</p>
              <p><strong>Value:</strong> ${order.item.value}</p>
            </div>
          </div>
        )}
        
        {(order.trackingNumber || order.carrier) && (
          <div>
            <h4 className="font-semibold mb-2">Tracking Information</h4>
            <div className="space-y-1 text-sm">
              {order.carrier && <p><strong>Carrier:</strong> {order.carrier}</p>}
              {order.trackingNumber && <p><strong>Tracking:</strong> {order.trackingNumber}</p>}
              {order.shippedAt && <p><strong>Shipped:</strong> {new Date(order.shippedAt).toLocaleString()}</p>}
              {order.deliveredAt && <p><strong>Delivered:</strong> {new Date(order.deliveredAt).toLocaleString()}</p>}
            </div>
          </div>
        )}
        
        {order.notes && (
          <div>
            <h4 className="font-semibold mb-2">Notes</h4>
            <div className="p-3 bg-gray-50 rounded text-sm">
              {order.notes}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export default function ShippingOrdersModule() {
  const [selectedOrder, setSelectedOrder] = useState<ShippingOrder | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch shipping orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/admin/shipping/orders"],
  });

  const filteredOrders = orders?.filter((order: ShippingOrder) => 
    statusFilter === "all" || order.status === statusFilter
  ) || [];

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter((o: ShippingOrder) => o.status === 'pending').length || 0,
    processing: orders?.filter((o: ShippingOrder) => o.status === 'processing').length || 0,
    shipped: orders?.filter((o: ShippingOrder) => o.status === 'shipped').length || 0,
    delivered: orders?.filter((o: ShippingOrder) => o.status === 'delivered').length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Shipping Orders</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{orderStats.total}</div>
              <div className="text-sm text-white/70">Total Orders</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{orderStats.pending}</div>
              <div className="text-sm text-white/70">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{orderStats.processing}</div>
              <div className="text-sm text-white/70">Processing</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{orderStats.shipped}</div>
              <div className="text-sm text-white/70">Shipped</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{orderStats.delivered}</div>
              <div className="text-sm text-white/70">Delivered</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Label className="text-white">Filter by status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Orders ({filteredOrders.length})</CardTitle>
          <CardDescription className="text-white/70">
            Manage shipping orders and update tracking information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order: ShippingOrder) => (
                <div key={order.id} className="p-4 border border-white/10 rounded-lg bg-black/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Order #{order.id}</h3>
                        <p className="text-white/70 text-sm">
                          User ID: {order.userId} • Created: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-white/70 text-sm">
                            {order.carrier}: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Dialog open={detailsDialogOpen && selectedOrder?.id === order.id} onOpenChange={setDetailsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <OrderDetailsDialog order={order} />
                      </Dialog>
                      <Dialog open={updateDialogOpen && selectedOrder?.id === order.id} onOpenChange={setUpdateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <UpdateOrderDialog 
                          order={order} 
                          onClose={() => {
                            setUpdateDialogOpen(false);
                            setSelectedOrder(null);
                          }} 
                        />
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/70">No shipping orders found</p>
              <p className="text-white/50 text-sm">Orders will appear here when users request physical shipping</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}