import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import CaseCard from "@/components/CaseCard";
import CaseOpeningModal from "@/components/CaseOpeningModal";
import ItemRevealModal from "@/components/ItemRevealModal";
import CasePreviewModal from "@/components/CasePreviewModal";
import RecentOpenings from "@/components/RecentOpenings";
import InventoryGrid from "@/components/InventoryGrid";
import { UserDashboard } from "@/components/UserDashboard";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Trophy, Crown, Clock, ArrowRight } from "lucide-react";
import type { Box, User, UserItemWithItem, BoxOpeningResult } from "@shared/schema";

export default function Home() {
  const [isOpeningCase, setIsOpeningCase] = useState(false);
  const [showItemReveal, setShowItemReveal] = useState(false);
  const [showCasePreview, setShowCasePreview] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Box | null>(null);
  const [previewCase, setPreviewCase] = useState<Box | null>(null);
  const [revealedItem, setRevealedItem] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: featuredBoxes = [], isLoading: loadingFeatured } = useQuery<Box[]>({
    queryKey: ["/api/boxes/featured"],
  });

  const { data: boxes = [], isLoading: loadingCases } = useQuery<Box[]>({
    queryKey: ["/api/boxes"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: inventory = [] } = useQuery<UserItemWithItem[]>({
    queryKey: ["/api/user/inventory"],
  });

  const { data: recentOpenings = [] } = useQuery<any[]>({
    queryKey: ["/api/recent-openings"],
    refetchInterval: 30000,
  });

  const openCaseMutation = useMutation({
    mutationFn: async (caseId: number) => {
      const response = await apiRequest("POST", `/api/boxes/open`, { boxId: caseId });
      return response.json() as Promise<BoxOpeningResult>;
    },
    onSuccess: (result) => {
      if (result.success) {
        setRevealedItem(result.item);
        setIsOpeningCase(false);
        setShowItemReveal(true);
        // Invalidate queries to refresh user balance and inventory
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/inventory"] });
        queryClient.invalidateQueries({ queryKey: ["/api/recent-openings"] });
      }
    },
    onError: (error: any) => {
      setIsOpeningCase(false);
      toast({
        title: "Error",
        description: error.message || "Failed to open case",
        variant: "destructive",
      });
    },
  });

  const handleOpenCase = (caseId: number) => {
    const caseData = boxes.find(c => c.id === caseId);
    if (!caseData || !user) return;

    // Check if user has enough USD balance
    const casePrice = parseFloat(caseData.price);
    const userBalance = parseFloat(user.usdBalance);
    if (userBalance < casePrice) {
      toast({
        title: "Insufficient USD Balance",
        description: `You need $${casePrice.toFixed(2)} USD to open this case.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedCase(caseData);
    setIsOpeningCase(true);
    openCaseMutation.mutate(caseId);
  };

  const handleOpenAnother = () => {
    setShowItemReveal(false);
    if (selectedCase) {
      handleOpenCase(selectedCase.id);
    }
  };

  const handlePreviewCase = (caseData: Box) => {
    setPreviewCase(caseData);
    setShowCasePreview(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">




        {/* User Dashboard Section */}
        {user && (
          <UserDashboard 
            user={user}
            nextMission={{
              id: 1,
              title: "Deposit $5 or more with Card",
              description: "Make your first deposit using a credit card to unlock rewards",
              type: "deposit",
              target: "5.00",
              reward: "2.50",
              isActive: true,
              createdAt: new Date(),
              progress: parseFloat(user.usdBalance) || 0
            }}
            totalMissionsLeft={35}
          />
        )}

        {/* Featured Boxes Section */}
        {featuredBoxes.length > 0 && (
          <section id="featured-section" className="mb-12">
            <motion.h2 
              className="text-3xl font-bold gradient-text mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Featured Boxes
            </motion.h2>
            
            {loadingFeatured ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="glass-effect rounded-xl p-4 border border-border/50 animate-shimmer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className="bg-muted/30 h-24 rounded-lg mb-3 animate-pulse"></div>
                    <div className="bg-muted/30 h-4 rounded mb-2 animate-pulse"></div>
                    <div className="bg-muted/30 h-3 rounded mb-3 animate-pulse"></div>
                    <div className="flex justify-between items-center">
                      <div className="bg-muted/30 h-4 w-12 rounded animate-pulse"></div>
                      <div className="bg-muted/30 h-8 w-16 rounded animate-pulse"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {featuredBoxes.slice(0, 5).map((caseData, index) => (
                  <motion.div
                    key={caseData.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <CaseCard
                      case={caseData}
                      onOpen={handleOpenCase}
                      onPreview={handlePreviewCase}
                      disabled={openCaseMutation.isPending}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        )}

        {/* All Cases Section - Limited to 1 row (4 boxes) */}
        <section id="cases-section" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <motion.h2 
              className="text-3xl font-bold gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              All Cases
            </motion.h2>
            <Link href="/boxes">
              <Button 
                variant="outline" 
                className="text-primary border-primary/30 hover:bg-primary/10 flex items-center gap-2"
              >
                View All Cases
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {loadingCases ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  className="glass-effect rounded-xl p-4 border border-border/50 animate-shimmer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="bg-muted/30 h-24 rounded-lg mb-3 animate-pulse"></div>
                  <div className="bg-muted/30 h-4 rounded mb-2 animate-pulse"></div>
                  <div className="bg-muted/30 h-3 rounded mb-3 animate-pulse"></div>
                  <div className="flex justify-between items-center">
                    <div className="bg-muted/30 h-4 w-12 rounded animate-pulse"></div>
                    <div className="bg-muted/30 h-8 w-16 rounded animate-pulse"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {boxes.slice(0, 5).map((caseData, index) => (
                <motion.div
                  key={caseData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <CaseCard
                    case={caseData}
                    onOpen={handleOpenCase}
                    onPreview={handlePreviewCase}
                    disabled={openCaseMutation.isPending}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {user && (
          <motion.section 
            className="mb-12 grid grid-cols-1 xl:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Big Winners Ticker */}
            <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-yellow-500/20 p-4 overflow-hidden ticker-container h-80">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-bold text-yellow-500">Big Winners</h3>
              </div>
              
              <div className="relative overflow-hidden" style={{ height: 'calc(100% - 3rem)' }}>
                <motion.div 
                  className="flex gap-4 mb-4"
                  animate={{ x: [-100, -2000] }}
                  transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {[
                    { username: "Player_Elite", item: "Dragon Sword", value: 2500, rarity: "legendary" },
                    { username: "CryptoKing", item: "Legendary Armor", value: 1890, rarity: "epic" },
                    { username: "GamerPro", item: "Mythical Shield", value: 1250, rarity: "rare" },
                    { username: "WinnerMax", item: "Golden Helmet", value: 980, rarity: "epic" },
                    { username: "LuckyPlayer", item: "Ancient Bow", value: 1750, rarity: "legendary" },
                    { username: "ProGamer99", item: "Fire Sword", value: 650, rarity: "rare" },
                    { username: "BigWinner", item: "Diamond Ring", value: 3200, rarity: "mythical" },
                    { username: "TopPlayer", item: "Magic Wand", value: 1100, rarity: "epic" },
                    { username: "Player_Elite", item: "Dragon Sword", value: 2500, rarity: "legendary" },
                    { username: "CryptoKing", item: "Legendary Armor", value: 1890, rarity: "epic" },
                    { username: "GamerPro", item: "Mythical Shield", value: 1250, rarity: "rare" },
                    { username: "WinnerMax", item: "Golden Helmet", value: 980, rarity: "epic" }
                  ].map((winner, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4 w-56 h-56 hover:border-yellow-500/50 transition-colors duration-300 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                          {winner.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{winner.username}</span>
                            <Crown className="w-4 h-4 text-yellow-500" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center my-4">
                        <div className="text-2xl font-bold text-yellow-500 mb-1">${winner.value.toLocaleString()}</div>
                        <p className="text-sm text-gray-300 mb-2">won {winner.item}</p>
                        <div className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${
                          winner.rarity === 'mythical' ? 'bg-red-500/20 text-red-400' :
                          winner.rarity === 'legendary' ? 'bg-orange-500/20 text-orange-400' :
                          winner.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {winner.rarity.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Trophy className="w-6 h-6 text-yellow-500 mx-auto" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Recent Openings Ticker */}
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
                  {(recentOpenings.length > 0 ? [...recentOpenings, ...recentOpenings, ...recentOpenings] : [
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
          </motion.section>
        )}

        {/* User Inventory Preview */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold gradient-text">Your Inventory</h2>
            <Link href="/inventory">
              <Button variant="ghost" className="text-primary hover:text-primary/80 hover:scale-105 transition-transform duration-200">
                View All <i className="fas fa-arrow-right ml-1"></i>
              </Button>
            </Link>
          </div>
          
          <div className="glass-effect p-6 rounded-xl border border-white/10">
            <InventoryGrid 
              items={inventory} 
              maxItems={6}
              showQuantity={true}
            />
          </div>
        </motion.section>
      </main>

      {/* Modals */}
      <CaseOpeningModal
        isOpen={isOpeningCase}
        caseName={selectedCase?.name || ""}
        onComplete={() => {
          // Modal will be closed by the mutation success handler
        }}
      />

      <ItemRevealModal
        isOpen={showItemReveal}
        item={revealedItem}
        onClose={() => {
          setShowItemReveal(false);
          toast({
            title: "Item Added!",
            description: "The item has been added to your inventory.",
          });
        }}
        onOpenAnother={handleOpenAnother}
      />

      <CasePreviewModal
        isOpen={showCasePreview}
        onClose={() => setShowCasePreview(false)}
        case={previewCase}
        onOpenCase={handleOpenCase}
      />
    </div>
  );
}
