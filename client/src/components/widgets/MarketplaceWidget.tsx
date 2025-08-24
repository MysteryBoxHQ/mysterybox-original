import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShoppingCart, Search, TrendingUp, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MarketplaceWidgetProps {
  apiKey?: string;
  theme?: 'light' | 'dark';
  compact?: boolean;
  showSearch?: boolean;
  onPurchase?: (item: any, price: number) => void;
  onError?: (error: string) => void;
}

interface MarketItem {
  id: number;
  itemId: number;
  sellerId: number;
  price: number;
  quantity: number;
  createdAt: string;
  item: {
    id: number;
    name: string;
    description: string;
    rarity: string;
    imageUrl: string;
    category: string;
  };
  seller: {
    username: string;
  };
}

export function MarketplaceWidget({ 
  apiKey,
  theme = 'light', 
  compact = false,
  showSearch = true,
  onPurchase,
  onError 
}: MarketplaceWidgetProps) {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'newest' | 'rarity'>('newest');
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    fetchMarketItems();
  }, [apiKey, sortBy]);

  const fetchMarketItems = async () => {
    setLoading(true);
    try {
      const headers = apiKey ? { 'X-API-Key': apiKey } : {};
      const response = await fetch('/api/marketplace/items', { headers });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      onError?.('Failed to load marketplace items');
      console.error('Failed to fetch marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: MarketItem) => {
    setPurchasing(item.id);
    try {
      const headers = apiKey ? { 'X-API-Key': apiKey } : {};
      await apiRequest('POST', `/api/marketplace/items/${item.id}/purchase`, {}, headers);
      onPurchase?.(item, item.price);
      await fetchMarketItems(); // Refresh the list
    } catch (error) {
      onError?.('Failed to purchase item');
      console.error('Failed to purchase item:', error);
    } finally {
      setPurchasing(null);
    }
  };

  const filteredItems = items.filter(item =>
    item.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = filteredItems.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rarity':
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
        return (rarityOrder[b.item.rarity.toLowerCase()] || 0) - (rarityOrder[a.item.rarity.toLowerCase()] || 0);
      default:
        return 0;
    }
  });

  const displayItems = compact ? sortedItems.slice(0, 6) : sortedItems;

  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-200';

  const cardTheme = theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-gray-50 border-gray-200';

  if (loading) {
    return (
      <Card className={`${themeClasses} max-w-md mx-auto`}>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading marketplace...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${themeClasses} ${compact ? 'max-w-md' : 'max-w-4xl'} mx-auto`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Marketplace
        </CardTitle>
        
        {showSearch && !compact && (
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <TabsList>
                <TabsTrigger value="newest">Newest</TabsTrigger>
                <TabsTrigger value="price">Price</TabsTrigger>
                <TabsTrigger value="rarity">Rarity</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {displayItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm opacity-75">
              {searchTerm ? 'Try adjusting your search' : 'No items available for sale'}
            </p>
          </div>
        ) : (
          <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3`}>
            {displayItems.map((marketItem) => (
              <Card key={marketItem.id} className={`${cardTheme} relative`}>
                <CardContent className="p-3">
                  {marketItem.quantity > 1 && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs">
                      {marketItem.quantity}
                    </Badge>
                  )}
                  <img 
                    src={marketItem.item.imageUrl} 
                    alt={marketItem.item.name}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <h4 className="font-semibold text-sm truncate">{marketItem.item.name}</h4>
                  <p className="text-xs opacity-75 mb-2">by {marketItem.seller.username}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {marketItem.item.rarity}
                    </Badge>
                    <span className="text-sm font-bold text-green-600">
                      ${marketItem.price}
                    </span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={purchasing === marketItem.id}
                    onClick={() => handlePurchase(marketItem)}
                  >
                    {purchasing === marketItem.id ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Buying...
                      </>
                    ) : (
                      `Buy $${marketItem.price}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {compact && filteredItems.length > 6 && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              View All {filteredItems.length} Items
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}