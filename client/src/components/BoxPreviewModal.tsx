import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, getRarityClass, RARITY_LABELS } from "@/lib/utils";
import { Package, X } from "lucide-react";
import type { Box, Item } from "@shared/schema";

interface BoxPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: Box | null;
  onOpenBox: (boxId: number) => void;
}

export default function BoxPreviewModal({ isOpen, onClose, box: boxData, onOpenBox }: BoxPreviewModalProps) {
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ["/api/boxes", boxData?.id, "items"],
    enabled: !!boxData?.id && isOpen,
  });

  if (!boxData) return null;

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.rarity]) {
      acc[item.rarity] = [];
    }
    acc[item.rarity].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  // Calculate drop chances based on rarity tiers
  const rarityWeights = {
    common: 20,
    rare: 15, 
    epic: 10,
    legendary: 5,
    mythical: 1
  };

  const getDropChance = (rarity: string) => {
    const weight = rarityWeights[rarity as keyof typeof rarityWeights] || 1;
    return weight;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] glass-effect border border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg ${getRarityClass(boxData.rarity)} flex items-center justify-center`}>
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{boxData.name}</h2>
              <p className="text-sm text-muted-foreground">{boxData.description}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 glass-effect rounded-lg border border-white/10">
            <div className="flex items-center gap-4">
              <Badge className={`${getRarityClass(boxData.rarity)} text-white border-0`}>
                {boxData.rarity.toUpperCase()}
              </Badge>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(boxData.price)}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  onOpenBox(boxData.id);
                  onClose();
                }}
                className={`${getRarityClass(boxData.rarity, 'bg')} hover:opacity-90 text-white border-0 flex-1`}
              >
                Open Box
              </Button>
              <Button
                onClick={() => {
                  onOpenBox(boxData.id, true); // true for spinning wheel
                  onClose();
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 flex-1"
              >
                Demo Spin
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Possible Items</h3>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([rarity, rarityItems]) => (
                  <div key={rarity} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getRarityClass(rarity)} text-white border-0`}>
                        {RARITY_LABELS[rarity as keyof typeof RARITY_LABELS]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getDropChance(rarity)}% chance each
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rarityItems.map((item) => (
                        <Card key={item.id} className={`glass-effect border-white/10 ${getRarityClass(item.rarity, 'border')}`}>
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 rounded-lg ${getRarityClass(item.rarity)} flex items-center justify-center`}>
                                <i className={`${item.icon} text-white text-lg`}></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{item.name}</h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.description}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getRarityClass(item.rarity, 'text')}`}
                                  >
                                    {getDropChance(item.rarity)}%
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}