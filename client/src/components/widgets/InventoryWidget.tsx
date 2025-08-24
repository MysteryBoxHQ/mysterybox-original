import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package2, DollarSign, Gift, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface InventoryWidgetProps {
  apiKey?: string;
  userId?: string;
  theme?: 'light' | 'dark';
  compact?: boolean;
  showActions?: boolean;
  onItemAction?: (action: string, item: any) => void;
  onError?: (error: string) => void;
}

interface InventoryItem {
  id: number;
  itemId: number;
  quantity: number;
  item: {
    id: number;
    name: string;
    description: string;
    rarity: string;
    value: number;
    imageUrl: string;
    category: string;
  };
}

export function InventoryWidget({ 
  apiKey,
  userId,
  theme = 'light', 
  compact = false,
  showActions = true,
  onItemAction,
  onError 
}: InventoryWidgetProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchInventory();
  }, [apiKey, userId]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const headers = apiKey ? { 'X-API-Key': apiKey } : {};
      const endpoint = userId ? `/api/v1/users/${userId}/inventory` : '/api/user/inventory';
      const response = await apiRequest('GET', endpoint, {}, headers);
      setInventory(response);
    } catch (error) {
      onError?.('Failed to load inventory');
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemAction = (action: string, item: InventoryItem) => {
    onItemAction?.(action, item);
  };

  const filteredItems = inventory.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'valuable') return item.item.value >= 100;
    return item.item.rarity.toLowerCase() === filter;
  });

  const totalValue = inventory.reduce((sum, item) => sum + (parseFloat(item.item.value?.toString() || '0') * item.quantity), 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

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
          <p>Loading inventory...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${themeClasses} ${compact ? 'max-w-md' : 'max-w-4xl'} mx-auto`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Inventory
          </div>
          {!compact && (
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Package2 className="h-4 w-4" />
                {totalItems} items
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                ${totalValue.toFixed(2)}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {!compact && (
          <Tabs value={filter} onValueChange={setFilter} className="mb-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="common">Common</TabsTrigger>
              <TabsTrigger value="rare">Rare</TabsTrigger>
              <TabsTrigger value="epic">Epic</TabsTrigger>
              <TabsTrigger value="valuable">High Value</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Package2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm opacity-75">
              {filter === 'all' ? 'Your inventory is empty' : `No ${filter} items in inventory`}
            </p>
          </div>
        ) : (
          <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3`}>
            {filteredItems.map((inventoryItem) => (
              <Card key={inventoryItem.id} className={`${cardTheme} relative`}>
                <CardContent className="p-3">
                  {inventoryItem.quantity > 1 && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs">
                      {inventoryItem.quantity}
                    </Badge>
                  )}
                  <img 
                    src={inventoryItem.item.imageUrl} 
                    alt={inventoryItem.item.name}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <h4 className="font-semibold text-sm truncate">{inventoryItem.item.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {inventoryItem.item.rarity}
                    </Badge>
                    <span className="text-sm font-bold text-green-600">
                      ${inventoryItem.item.value}
                    </span>
                  </div>
                  
                  {showActions && (
                    <div className="flex gap-1 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => handleItemAction('sell', inventoryItem)}
                      >
                        Sell
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => handleItemAction('trade', inventoryItem)}
                      >
                        Trade
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}