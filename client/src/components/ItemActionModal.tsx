import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Truck, MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getRarityClass } from "@/lib/utils";
import type { UserItemWithItem } from "@shared/schema";

interface ItemActionModalProps {
  item: UserItemWithItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemActionModal({ item, isOpen, onClose }: ItemActionModalProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch shipping addresses
  const { data: addresses } = useQuery({
    queryKey: ["/api/shipping/addresses"],
    enabled: isOpen,
  });

  // Quick sell mutation
  const quickSellMutation = useMutation({
    mutationFn: async () => {
      if (!item) throw new Error("No item selected");
      return await apiRequest("POST", "/api/market/quick-sell", {
        userItemId: item.id,
        quantity: 1
      });
    },
    onSuccess: () => {
      toast({
        title: "Item Listed",
        description: "Your item has been listed on the marketplace at 80% market value",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/market/listings"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to list item on marketplace",
        variant: "destructive",
      });
    },
  });

  // Ship item mutation
  const shipItemMutation = useMutation({
    mutationFn: async () => {
      if (!item || !selectedAddressId) throw new Error("Missing item or address");
      return await apiRequest("POST", "/api/shipping/orders", {
        userItemId: item.id,
        shippingAddressId: parseInt(selectedAddressId)
      });
    },
    onSuccess: () => {
      toast({
        title: "Shipping Order Created",
        description: "Your item will be shipped to your selected address",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shipping/orders"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create shipping order",
        variant: "destructive",
      });
    },
  });

  if (!item) return null;

  const estimatedValue = 100; // This would come from item data
  const quickSellValue = Math.floor(estimatedValue * 0.8);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Item Actions</DialogTitle>
          <DialogDescription className="text-white/70">
            Choose what to do with your item
          </DialogDescription>
        </DialogHeader>

        {/* Item Display */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRarityClass(item.item.rarity, 'bg')}`}>
            <i className={`${item.item.icon} text-white text-xl`}></i>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{item.item.name}</h3>
            <Badge 
              variant="outline" 
              className={`${getRarityClass(item.item.rarity, 'border')} ${getRarityClass(item.item.rarity, 'text')} text-xs`}
            >
              {item.item.rarity.toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70">Quantity</p>
            <p className="font-semibold text-white">{item.quantity}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Quick Sell Option */}
          <Card className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">Quick Sell - Marketplace</h4>
                  <p className="text-sm text-white/70">List on marketplace at 80% market value</p>
                  <p className="text-green-400 font-semibold">${quickSellValue}</p>
                </div>
                <Button
                  onClick={() => quickSellMutation.mutate()}
                  disabled={quickSellMutation.isPending}
                  className="button-gradient"
                >
                  {quickSellMutation.isPending ? "Listing..." : "Quick Sell"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Physical Shipping Option */}
          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Physical Shipping</h4>
                    <p className="text-sm text-white/70">Get the physical item shipped to you</p>
                    <p className="text-blue-400 font-semibold">$15.99 shipping</p>
                  </div>
                </div>

                {addresses && addresses.length > 0 ? (
                  <div className="space-y-2">
                    <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <SelectTrigger className="bg-black/20 border-white/20 text-white">
                        <SelectValue placeholder="Select shipping address" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((address: any) => (
                          <SelectItem key={address.id} value={address.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{address.name}</span>
                              {address.isDefault && (
                                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => shipItemMutation.mutate()}
                      disabled={shipItemMutation.isPending || !selectedAddressId}
                      className="w-full button-gradient"
                    >
                      {shipItemMutation.isPending ? "Creating Order..." : "Ship Item"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-400">No shipping addresses</p>
                      <p className="text-xs text-yellow-400/70">Add an address in the shipping section first</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        window.location.href = "/shipping";
                      }}
                      className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Add Address
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}