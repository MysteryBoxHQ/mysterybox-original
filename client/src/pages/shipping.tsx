import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Package, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: z.string().optional(),
  isDefault: z.boolean().default(false)
});

type AddressFormData = z.infer<typeof addressSchema>;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'processing': return 'bg-blue-500';
    case 'shipped': return 'bg-green-500';
    case 'delivered': return 'bg-emerald-500';
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

export default function Shipping() {
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phoneNumber: "",
      isDefault: false
    }
  });

  // Fetch shipping addresses
  const { data: addresses, isLoading: loadingAddresses } = useQuery({
    queryKey: ["/api/shipping/addresses"],
  });

  // Fetch shipment orders
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["/api/shipping/orders"],
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      return await apiRequest("POST", "/api/shipping/addresses", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shipping address added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shipping/addresses"] });
      setIsAddressDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add shipping address",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddressFormData) => {
    createAddressMutation.mutate(data);
  };

  if (loadingAddresses || loadingOrders) {
    return (
      <div className="min-h-screen cases-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen cases-bg p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Physical Shipping</h1>
          <p className="text-white/70">Manage your shipping addresses and track your physical item deliveries</p>
        </div>

        {/* Shipping Addresses Section */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Addresses
                </CardTitle>
                <CardDescription className="text-white/70">
                  Manage your delivery addresses for physical items
                </CardDescription>
              </div>
              <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="button-gradient">
                    Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-effect border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Add Shipping Address</DialogTitle>
                    <DialogDescription className="text-white/70">
                      Add a new shipping address for physical item deliveries
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-black/20 border-white/20 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-black/20 border-white/20 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-black/20 border-white/20 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-black/20 border-white/20 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-black/20 border-white/20 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-black/20 border-white/20 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="United States">United States</SelectItem>
                                  <SelectItem value="Canada">Canada</SelectItem>
                                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                  <SelectItem value="Australia">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-black/20 border-white/20 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddressDialogOpen(false)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createAddressMutation.isPending}
                          className="button-gradient"
                        >
                          {createAddressMutation.isPending ? "Adding..." : "Add Address"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {addresses && addresses.length > 0 ? (
              <div className="grid gap-4">
                {addresses.map((address: any) => (
                  <div key={address.id} className="p-4 rounded-lg bg-black/20 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">{address.name}</h3>
                          {address.isDefault && (
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-white/70 text-sm mt-1">
                          {address.address}<br />
                          {address.city}, {address.state} {address.zipCode}<br />
                          {address.country}
                          {address.phoneNumber && <><br />{address.phoneNumber}</>}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/70">No shipping addresses added yet</p>
                <p className="text-white/50 text-sm">Add an address to start shipping physical items</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipment Orders Section */}
        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Shipment Orders
            </CardTitle>
            <CardDescription className="text-white/70">
              Track your physical item deliveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="grid gap-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="p-4 rounded-lg bg-black/20 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Order #{order.id}</h3>
                          <p className="text-white/70 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(order.status)} text-white`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    {order.trackingNumber && (
                      <div className="mt-2 p-2 bg-black/20 rounded">
                        <p className="text-white/70 text-sm">
                          <strong>Tracking:</strong> {order.trackingNumber}
                          {order.carrier && <span> ({order.carrier})</span>}
                        </p>
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <p className="text-white/70 text-sm mt-2">
                        <strong>Est. Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/70">No shipment orders yet</p>
                <p className="text-white/50 text-sm">Physical item orders will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}