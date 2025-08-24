import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import InventoryGrid from "@/components/InventoryGrid";
import ItemActionModal from "@/components/ItemActionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getRarityClass, RARITY_LABELS } from "@/lib/utils";
import { hapticManager } from "@/lib/hapticManager";
import type { UserItemWithItem } from "@shared/schema";

export default function Inventory() {
  const [selectedItem, setSelectedItem] = useState<UserItemWithItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("all");

  const { data: inventory = [], isLoading } = useQuery<UserItemWithItem[]>({
    queryKey: ["/api/user/inventory"],
  });

  // Filter inventory based on search and rarity
  const filteredInventory = inventory.filter(userItem => {
    if (!userItem?.item) return false;
    const matchesSearch = userItem.item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarityFilter === "all" || userItem.item.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  // Calculate inventory stats
  const stats = {
    totalItems: inventory.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    uniqueItems: inventory.length,
    rarest: inventory.reduce((rarest, item) => {
      if (!item?.item) return rarest;
      const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythical: 5 };
      const currentRarity = rarityOrder[item.item.rarity as keyof typeof rarityOrder] || 0;
      const rarestRarity = rarityOrder[rarest?.item?.rarity as keyof typeof rarityOrder] || 0;
      return currentRarity > rarestRarity ? item : rarest;
    }, null as UserItemWithItem | null)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Inventory</h1>
          <p className="text-muted-foreground">
            Manage and view all your collected items
          </p>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueItems}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rarest Item</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.rarest ? (
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded ${getRarityClass(stats.rarest.item.rarity)} flex items-center justify-center`}>
                    <i className={`${stats.rarest.item.icon} text-white text-sm`}></i>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{stats.rarest.item.name}</div>
                    <div className={`text-xs ${getRarityClass(stats.rarest.item.rarity, 'text')}`}>
                      {RARITY_LABELS[stats.rarest.item.rarity as keyof typeof RARITY_LABELS]}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No items</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="mythical">Mythical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Inventory Grid */}
        {filteredInventory.length > 0 ? (
          <InventoryGrid
            items={filteredInventory}
            showQuantity={true}
            onItemClick={(item) => {
              hapticManager.itemSelect();
              setSelectedItem(item);
            }}
          />
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <i className="fas fa-box-open text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {searchTerm || rarityFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Start opening cases to collect items!"
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Item Action Modal */}
        <ItemActionModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      </main>
    </div>
  );
}
