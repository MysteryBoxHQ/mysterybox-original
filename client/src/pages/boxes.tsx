import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Flame, Trophy, Gift, Package, ArrowRight, SortAsc, Filter, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, getRarityClass, RARITY_LABELS } from "@/lib/utils";
import type { Box, BoxWithItems, BoxOpeningResult, RecentOpening, User, Item } from "@shared/schema";
import BoxPreviewModal from "@/components/BoxPreviewModal";
import EnhancedBoxOpeningModal from "@/components/EnhancedBoxOpeningModal";
import EnhancedItemRevealModal from "@/components/EnhancedItemRevealModal";
import SpinningWheelModal from "@/components/SpinningWheelModal";
import LiveChat from "@/components/LiveChat";
import CaseCard from "@/components/CaseCard";
import { particleEffects } from "@/lib/particleEffects";
import { hapticManager } from "@/lib/hapticManager";

export default function Boxes() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [isItemRevealOpen, setIsItemRevealOpen] = useState(false);
  const [isSpinningWheelOpen, setIsSpinningWheelOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [revealedItem, setRevealedItem] = useState<Item | null>(null);
  const [boxItems, setBoxItems] = useState<Item[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("price-low");
  const [filterRarity, setFilterRarity] = useState<string>("all");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: !!authUser,
  });

  const { data: boxes = [] } = useQuery<Box[]>({
    queryKey: ["/api/boxes"],
  });

  const { data: recentOpenings = [] } = useQuery<RecentOpening[]>({
    queryKey: ["/api/recent-openings"],
    refetchInterval: 5000,
  });

  const openBoxMutation = useMutation({
    mutationFn: async (boxId: number) => {
      const response = await apiRequest("POST", "/api/boxes/open", { boxId });
      return response.json() as Promise<BoxOpeningResult>;
    },
    onSuccess: (result) => {
      setRevealedItem(result.item);
      setIsOpeningModalOpen(false);
      setIsItemRevealOpen(true);
      
      // Announce opening in chat
      if (selectedBox && user && (window as any).announceOpening) {
        (window as any).announceOpening(result.item.name, result.item.rarity, selectedBox.name);
      }
      
      // Trigger haptic feedback based on rarity
      const rarity = result.item.rarity?.toLowerCase();
      if (rarity === 'mythical') {
        hapticManager.mythical();
      } else if (rarity === 'legendary') {
        hapticManager.legendary();
      } else if (rarity === 'epic') {
        hapticManager.epic();
      } else {
        hapticManager.medium();
      }
      
      // Trigger particle effects
      particleEffects.celebrate(rarity);
      
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-openings"] });
      toast({
        title: "Box Opened!",
        description: `You received: ${result.item.name}`,
      });
    },
    onError: (error: any) => {
      setIsOpeningModalOpen(false);
      toast({
        title: "Error",
        description: error.message || "Failed to open box",
        variant: "destructive",
      });
    },
  });

  const handlePreviewBox = (box: Box) => {
    setSelectedBox(box);
    setIsPreviewOpen(true);
  };

  const handleOpenBox = (boxId: number, useSpinningWheel = false) => {
    setIsPreviewOpen(false);
    
    if (useSpinningWheel) {
      // Fetch box items for spinning wheel
      apiRequest("GET", `/api/boxes/${boxId}/items`)
        .then(response => response.json())
        .then((items: Item[]) => {
          setBoxItems(items);
          setIsSpinningWheelOpen(true);
        })
        .catch(error => {
          toast({
            title: "Error",
            description: "Failed to load box items",
            variant: "destructive",
          });
        });
    } else {
      // Use traditional enhanced box opening
      setIsOpeningModalOpen(true);
      setTimeout(() => {
        openBoxMutation.mutate(boxId);
      }, 4000); // Allow time for opening animation
    }
  };

  const handleSpinWheel = () => {
    if (!selectedBox || boxItems.length === 0) return;
    
    setIsSpinning(true);
    // Trigger actual box opening
    openBoxMutation.mutate(selectedBox.id);
  };

  const handleSpinComplete = () => {
    setIsSpinning(false);
    setIsSpinningWheelOpen(false);
    if (revealedItem) {
      setIsItemRevealOpen(true);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'border-gray-500 shadow-gray-500/20';
      case 'rare': return 'border-green-500 shadow-green-500/20';
      case 'epic': return 'border-purple-500 shadow-purple-500/20';
      case 'legendary': return 'border-orange-500 shadow-orange-500/20';
      case 'mythical': return 'border-red-500 shadow-red-500/20';
      default: return 'border-gray-500 shadow-gray-500/20';
    }
  };

  // Sorting and filtering logic
  const sortBoxes = (boxList: Box[]) => {
    let sorted = [...boxList];
    
    // Apply rarity filter
    if (filterRarity !== "all") {
      sorted = sorted.filter(box => box.rarity === filterRarity);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rarity":
        const rarityOrder = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4, 'mythical': 5 };
        sorted.sort((a, b) => (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0));
        break;
      default:
        break;
    }
    
    return sorted;
  };

  const sortedBoxes = sortBoxes(boxes);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="py-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-white mb-2">
              Mystery Boxes
            </h1>
            <p className="text-gray-400 mb-8">
              Open cases and discover luxury items from premium brands
            </p>
          </div>
        </div>

        {/* All Cases */}
        <section id="all-cases" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-white">All Cases</h2>
            </div>
            <div className="flex items-center gap-4">
              {/* Sorting Controls */}
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-card/50 border-border/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rarity">Rarity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterRarity} onValueChange={setFilterRarity}>
                  <SelectTrigger className="w-32 bg-card/50 border-border/50">
                    <SelectValue placeholder="Filter" />
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

              <Button
                variant="outline"
                className="text-primary border-primary/30 hover:bg-primary/10 flex items-center gap-2"
                onClick={() => {
                  setSortBy("price-low");
                  setFilterRarity("all");
                  document.getElementById("all-cases")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Reset Filters
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedBoxes.map((box) => (
              <CaseCard
                key={box.id}
                case={box}
                onOpen={(boxId) => handleOpenBox(boxId)}
                onPreview={handlePreviewBox}
                disabled={openBoxMutation.isPending}
              />
            ))}
          </div>
        </section>

        {/* Recent Openings Ticker */}
        <section className="mb-12">
          <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-primary/20 p-4 overflow-hidden ticker-container h-80">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-primary">Recent Openings</h3>
            </div>
            
            <div className="relative overflow-hidden" style={{ height: 'calc(100% - 3rem)' }}>
              <motion.div 
                className="flex gap-4 mb-4"
                animate={{ x: [0, -2000] }}
                transition={{
                  duration: 45,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {(recentOpenings && recentOpenings.length > 0 ? [...recentOpenings, ...recentOpenings, ...recentOpenings] : [
                  { id: 1, username: "TestPlayer", itemName: "Galaxy Crystal Orb", itemRarity: "legendary", itemIcon: "fas fa-gem", timeAgo: "5 min ago" },
                  { id: 2, username: "LuckyWinner", itemName: "Samsung Galaxy S23", itemRarity: "epic", itemIcon: "fas fa-mobile", timeAgo: "10 min ago" },
                  { id: 3, username: "GamerPro", itemName: "AirPods 3rd Gen", itemRarity: "rare", itemIcon: "fas fa-headphones", timeAgo: "15 min ago" },
                  { id: 4, username: "NewPlayer", itemName: "RGB Gaming Keyboard", itemRarity: "epic", itemIcon: "fas fa-keyboard", timeAgo: "20 min ago" },
                  { id: 5, username: "ProGamer", itemName: "Wireless Mouse", itemRarity: "rare", itemIcon: "fas fa-mouse", timeAgo: "25 min ago" },
                  { id: 6, username: "TestPlayer", itemName: "Galaxy Crystal Orb", itemRarity: "legendary", itemIcon: "fas fa-gem", timeAgo: "5 min ago" },
                  { id: 7, username: "LuckyWinner", itemName: "Samsung Galaxy S23", itemRarity: "epic", itemIcon: "fas fa-mobile", timeAgo: "10 min ago" }
                ]).map((opening, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/30 rounded-lg p-4 w-56 h-56 hover:border-primary/50 transition-colors duration-300 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg ${
                        opening.itemRarity === 'mythical' ? 'bg-red-500' :
                        opening.itemRarity === 'legendary' ? 'bg-orange-500' :
                        opening.itemRarity === 'epic' ? 'bg-purple-500' :
                        opening.itemRarity === 'rare' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}>
                        <i className={`${opening.itemIcon} text-white`}></i>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-white text-sm">{opening.username}</span>
                      </div>
                    </div>
                    
                    <div className="text-center my-4">
                      <div className="font-bold text-white text-lg mb-2">{opening.itemName}</div>
                      <div className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${
                        opening.itemRarity === 'mythical' ? 'bg-red-500/20 text-red-400' :
                        opening.itemRarity === 'legendary' ? 'bg-orange-500/20 text-orange-400' :
                        opening.itemRarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                        opening.itemRarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {opening.itemRarity?.toUpperCase() || 'COMMON'}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-400">{opening.timeAgo}</div>
                      <Clock className="w-4 h-4 text-primary mx-auto mt-1" />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <BoxPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        box={selectedBox}
        onOpenBox={handleOpenBox}
      />

      <EnhancedBoxOpeningModal
        isOpen={isOpeningModalOpen}
        boxName={selectedBox?.name || "Box"}
        boxImage={selectedBox?.imageUrl}
        rarity={selectedBox?.rarity}
        onComplete={() => setIsOpeningModalOpen(false)}
      />

      <EnhancedItemRevealModal
        isOpen={isItemRevealOpen}
        item={revealedItem}
        onClose={() => setIsItemRevealOpen(false)}
        onOpenAnother={() => {
          setIsItemRevealOpen(false);
          if (selectedBox) {
            handlePreviewBox(selectedBox);
          }
        }}
      />

      <SpinningWheelModal
        isOpen={isSpinningWheelOpen}
        onClose={handleSpinComplete}
        possibleItems={boxItems}
        wonItem={revealedItem}
        onSpin={handleSpinWheel}
        isSpinning={isSpinning}
      />

      <LiveChat
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}