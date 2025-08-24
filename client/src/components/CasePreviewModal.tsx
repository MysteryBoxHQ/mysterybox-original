import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, getRarityClass } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Package, Eye } from "lucide-react";
import type { Case, Item } from "@shared/schema";

interface CasePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  case: Case | null;
  onOpenCase: (caseId: number) => void;
}

export default function CasePreviewModal({ isOpen, onClose, case: caseData, onOpenCase }: CasePreviewModalProps) {
  const { data: items = [] } = useQuery<Item[]>({
    queryKey: [`/api/cases/${caseData?.id}/items`],
    enabled: !!caseData?.id && isOpen,
  });

  if (!caseData) return null;

  // Rarity-based drop chance system
  const rarityWeights = {
    common: 20,
    rare: 15,
    epic: 10,
    legendary: 5,
    mythical: 1
  };

  // Group items by rarity and calculate percentages
  const itemsByRarity = items.reduce((groups, item) => {
    const rarity = item.rarity;
    if (!groups[rarity]) groups[rarity] = [];
    groups[rarity].push(item);
    return groups;
  }, {} as Record<string, typeof items>);

  // Calculate total weight based on available rarities
  const availableRarities = Object.keys(itemsByRarity);
  const totalWeight = availableRarities.reduce((sum, rarity) => 
    sum + (rarityWeights[rarity as keyof typeof rarityWeights] || 0), 0
  );

  // Calculate percentage for each item based on rarity tier
  const getItemDropPercentage = (item: any) => {
    const rarityWeight = rarityWeights[item.rarity as keyof typeof rarityWeights] || 0;
    const rarityPercentage = (rarityWeight / totalWeight) * 100;
    const itemsInRarity = itemsByRarity[item.rarity]?.length || 1;
    return (rarityPercentage / itemsInRarity).toFixed(1);
  };

  // Sort items by rarity and alphabetically within same rarity
  const sortedItems = [...items].sort((a, b) => {
    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythical: 5 };
    const aRarity = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
    const bRarity = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
    
    if (aRarity !== bRarity) return bRarity - aRarity; // Higher rarity first
    return a.name.localeCompare(b.name); // Alphabetical within same rarity
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto glass-effect border border-white/20">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
              <img
                src={caseData.imageUrl}
                alt={caseData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
                <Eye className="w-6 h-6" />
                {caseData.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preview all possible items and their drop rates in this case
              </DialogDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getRarityClass(caseData.rarity, 'bg')} ${getRarityClass(caseData.rarity, 'text')}`}>
                  {caseData.rarity.toUpperCase()}
                </Badge>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(caseData.price)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground">{caseData.description}</p>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Possible Items ({items.length})</h3>
            
            <div className="grid gap-3">
              {sortedItems.map((item) => {
                const dropPercentage = getItemDropPercentage(item);
                const rarityBg = getRarityClass(item.rarity, 'bg');
                const rarityBorder = getRarityClass(item.rarity, 'border');
                const rarityText = getRarityClass(item.rarity, 'text');
                
                return (
                  <div
                    key={item.id}
                    className={`glass-effect p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 rarity-glow-${item.rarity}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${getRarityClass(item.rarity, 'bg')} border-2 ${getRarityClass(item.rarity, 'border')}`}>
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = `fallback-icon w-full h-full flex items-center justify-center text-2xl ${getRarityClass(item.rarity, 'text')}`;
                              fallbackDiv.innerHTML = 
                                item.name.includes('Ferrari') ? '🏎️' :
                                item.name.includes('Lamborghini') ? '🚗' :
                                item.name.includes('Louis Vuitton') || item.name.includes('Dior') || item.name.includes('Chanel') ? '👜' :
                                item.name.includes('Supreme') ? '👕' :
                                item.rarity === 'mythical' ? '💎' :
                                item.rarity === 'legendary' ? '⭐' :
                                item.rarity === 'epic' ? '🔮' :
                                item.rarity === 'rare' ? '💍' : '⚙️';
                              parent.appendChild(fallbackDiv);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-card-foreground truncate">{item.name}</h4>
                          <Badge variant="outline" className={`${rarityBg} ${rarityText} border-current`}>
                            {item.rarity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Drop Chance</span>
                            <span className="font-medium">{dropPercentage}%</span>
                          </div>
                          <Progress 
                            value={parseFloat(dropPercentage)} 
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Total items: {items.length} • Best drop: {sortedItems[0] ? `${getItemDropPercentage(sortedItems[0])}%` : 'N/A'}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close Preview
              </Button>
              <Button 
                className="button-gradient text-white font-semibold"
                onClick={() => {
                  onOpenCase(caseData.id);
                  onClose();
                }}
              >
                <Package className="w-4 h-4 mr-2" />
                Open Case - {formatCurrency(caseData.price)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}