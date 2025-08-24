import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, DollarSign, Search, Filter, TrendingUp, Star, Package, Tag, Clock, Store } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import type { User, Item } from "@shared/schema";

interface MarketItem {
  id: number;
  itemId: number;
  sellerId: number;
  sellerName: string;
  price: number;
  item: Item;
  listedAt: Date;
}

interface UserListing {
  id: number;
  itemId: number;
  price: number;
  item: Item;
  listedAt: Date;
  status: 'active' | 'sold' | 'cancelled';
}

export default function Market() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [activeFilter, setActiveFilter] = useState('all');

  // Handle URL parameters from dropdown navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const filter = urlParams.get('filter');
    
    if (tab === 'selling') {
      setActiveTab('selling');
    } else if (tab === 'purchased') {
      setActiveTab('purchased');
    } else {
      setActiveTab('browse');
    }
    
    if (filter === 'trending') {
      setActiveFilter('trending');
      setSortBy('popular');
    } else if (filter === 'recent') {
      setActiveFilter('recent');
      setSortBy('newest');
    } else {
      setActiveFilter('all');
    }
  }, []);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: !!authUser,
  });

  const { data: marketItems = [] } = useQuery<MarketItem[]>({
    queryKey: ["/api/market/items", searchQuery, rarityFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (rarityFilter !== 'all') params.append('rarity', rarityFilter);
      params.append('sort', sortBy);
      
      const response = await apiRequest("GET", `/api/market/items?${params}`);
      return response.json();
    },
  });

  const { data: userInventory = [] } = useQuery({
    queryKey: ["/api/user/inventory"],
    enabled: !!authUser,
  });

  const { data: userListings = [] } = useQuery<UserListing[]>({
    queryKey: ["/api/market/my-listings"],
    enabled: !!authUser,
  });

  const buyItemMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await apiRequest("POST", `/api/market/buy/${listingId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/market/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/market/my-listings"] });
      toast({
        title: "Purchase Successful",
        description: "Item has been added to your inventory",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase item",
        variant: "destructive",
      });
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async ({ itemId, price }: { itemId: number, price: number }) => {
      const response = await apiRequest("POST", "/api/market/list", { itemId, price });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/market/my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/inventory"] });
      setShowCreateListing(false);
      setSelectedItem(null);
      setListingPrice('');
      toast({
        title: "Item Listed",
        description: "Your item is now available for sale",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Listing Failed",
        description: error.message || "Failed to list item",
        variant: "destructive",
      });
    },
  });

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 border-gray-500',
      uncommon: 'text-green-400 border-green-500',
      rare: 'text-blue-400 border-blue-500',
      epic: 'text-purple-400 border-purple-500',
      legendary: 'text-orange-400 border-orange-500',
      mythical: 'text-red-400 border-red-500'
    };
    return colors[rarity.toLowerCase() as keyof typeof colors] || colors.common;
  };

  const getSuggestedPrice = (item: Item) => {
    const basePrice = {
      common: 1,
      uncommon: 5,
      rare: 15,
      epic: 50,
      legendary: 150,
      mythical: 500
    };
    return basePrice[item.rarity?.toLowerCase() as keyof typeof basePrice] || 1;
  };

  const handleBuyItem = (listingId: number) => {
    buyItemMutation.mutate(listingId);
  };

  const handleCreateListing = () => {
    if (!selectedItem || !listingPrice) return;
    
    const price = parseFloat(listingPrice);
    if (price < 0.01) {
      toast({
        title: "Invalid Price",
        description: "Minimum price is $0.01",
        variant: "destructive",
      });
      return;
    }

    createListingMutation.mutate({ itemId: selectedItem.id, price });
  };

  const filteredMarketItems = marketItems.filter(item => {
    if (searchQuery && !item.item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-400">Loading market...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text mb-2">Marketplace</h1>
          <p className="text-gray-400">Buy and sell items with other players</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cases-input pl-10"
              />
            </div>
            
            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="cases-input w-40">
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="mythical">Mythical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="cases-input w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rarity">Rarity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setShowCreateListing(true)}
            className="cases-button"
          >
            <Package className="w-4 h-4 mr-2" />
            Sell Item
          </Button>
        </div>

        {/* Market Items Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMarketItems.map((listing) => (
            <Card key={listing.id} className="cases-card hover:border-orange-500/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${getRarityColor(listing.item.rarity || 'common')} bg-transparent`}>
                    {listing.item.rarity}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Price</div>
                    <div className="font-bold text-green-400">{formatCurrency(listing.price)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                  {listing.item.icon ? (
                    <img 
                      src={listing.item.icon} 
                      alt={listing.item.name}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-500" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">{listing.item.name}</h3>
                  <p className="text-sm text-gray-400">Seller: {listing.sellerName}</p>
                  <p className="text-xs text-gray-500">
                    Listed {new Date(listing.listedAt).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  onClick={() => handleBuyItem(listing.id)}
                  disabled={buyItemMutation.isPending || listing.sellerId === user.id}
                  className="w-full cases-button"
                >
                  {listing.sellerId === user.id ? 'Your Item' : 
                   buyItemMutation.isPending ? 'Buying...' : 'Buy Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMarketItems.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Items Found</h3>
            <p className="text-gray-400">Try adjusting your search filters</p>
          </div>
        )}

        {/* Create Listing Modal */}
        {showCreateListing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="cases-card w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white">Sell Item</CardTitle>
                <CardDescription>List an item from your inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Select Item
                  </label>
                  <Select 
                    value={selectedItem?.id.toString() || ''} 
                    onValueChange={(value) => {
                      const item = userInventory.find((inv: any) => inv.item.id.toString() === value)?.item;
                      setSelectedItem(item || null);
                      if (item) {
                        setListingPrice(getSuggestedPrice(item).toString());
                      }
                    }}
                  >
                    <SelectTrigger className="cases-input">
                      <SelectValue placeholder="Choose an item to sell" />
                    </SelectTrigger>
                    <SelectContent>
                      {userInventory.map((inv: any) => (
                        <SelectItem key={inv.item.id} value={inv.item.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getRarityColor(inv.item.rarity || 'common')} bg-transparent text-xs`}>
                              {inv.item.rarity}
                            </Badge>
                            {inv.item.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedItem && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Price (USD)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter price..."
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      className="cases-input"
                      min="0.01"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Suggested: {formatCurrency(getSuggestedPrice(selectedItem))}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateListing}
                    disabled={createListingMutation.isPending || !selectedItem || !listingPrice}
                    className="cases-button flex-1"
                  >
                    {createListingMutation.isPending ? 'Listing...' : 'List Item'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreateListing(false);
                      setSelectedItem(null);
                      setListingPrice('');
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}