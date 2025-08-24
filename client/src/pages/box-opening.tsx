import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Package, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, getRarityClass } from "@/lib/utils";
import type { Box, BoxWithItems, BoxOpeningResult, Item, User } from "@shared/schema";
import EnhancedItemRevealModal from "@/components/EnhancedItemRevealModal";
import SliderWheel from "@/components/SliderWheel";
import { particleEffects } from "@/lib/particleEffects";
import { hapticManager } from "@/lib/hapticManager";
import { motion } from "framer-motion";


const RARITY_LABELS = {
  common: "Common",
  rare: "Rare", 
  epic: "Epic",
  legendary: "Legendary",
  mythical: "Mythical"
};

const RARITY_WEIGHTS = {
  common: 50,
  rare: 25,
  epic: 15,
  legendary: 7,
  mythical: 3
};

export default function BoxOpening() {
  const [match, params] = useRoute("/box-opening/:id");
  const boxId = parseInt(params?.id || "0");
  
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [isItemRevealOpen, setIsItemRevealOpen] = useState(false);
  const [isSpinningWheelOpen, setIsSpinningWheelOpen] = useState(false);
  const [revealedItem, setRevealedItem] = useState<Item | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [boxItems, setBoxItems] = useState<Item[]>([]);
  const [showChances, setShowChances] = useState(false);
  const [isPaidOpening, setIsPaidOpening] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch box data
  const { data: box, isLoading: loadingBox } = useQuery<BoxWithItems>({
    queryKey: [`/api/boxes/${boxId}`],
    enabled: !!boxId,
  });

  const { data: userData } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Fetch all boxes for navigation
  const { data: allBoxes } = useQuery<Box[]>({
    queryKey: ["/api/boxes"],
  });

  // Open box mutation
  const openBoxMutation = useMutation({
    mutationFn: async (boxId: number) => {
      const response = await apiRequest("POST", `/api/boxes/${boxId}/open`);
      return response.json();
    },
    onSuccess: (result: BoxOpeningResult) => {
      // Wait for spinning animation to complete before showing result
      setTimeout(() => {
        setRevealedItem(result.item);
        setIsPaidOpening(result.isPaidOpening || false);
        setIsSpinning(false);
        
        // Invalidate user data to update balance
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        // Add haptic feedback and particle effects
        hapticManager.success();
        particleEffects.celebrate();
        
        toast({
          title: "Box Opened!",
          description: `You received: ${result.item.name}`,
        });
        
        // Auto-clear the result after 8 seconds for next opening
        setTimeout(() => {
          setRevealedItem(null);
        }, 8000);
      }, 1000); // Small delay to ensure spinning completes
    },
    onError: (error: Error) => {
      setIsSpinning(false);
      toast({
        title: "Error",
        description: error.message || "Failed to open box",
        variant: "destructive",
      });
    },
  });

  // Quick sell mutation
  const quickSellMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest("POST", `/api/items/${itemId}/quick-sell`);
      return response.json();
    },
    onSuccess: (result) => {
      // Invalidate user data and marketplace data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/market/items"] });
      
      setRevealedItem(null);
      
      toast({
        title: "Item Listed!",
        description: `${result.item.name} has been listed on the marketplace for $${result.sellPrice.toFixed(2)}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sell item",
        variant: "destructive",
      });
    },
  });

  // Navigation functions
  const handleNextBox = () => {
    if (!allBoxes || allBoxes.length === 0) return;
    const currentIndex = allBoxes.findIndex(b => b.id === boxId);
    const nextIndex = (currentIndex + 1) % allBoxes.length;
    window.location.href = `/box-opening/${allBoxes[nextIndex].id}`;
  };

  const handlePreviousBox = () => {
    if (!allBoxes || allBoxes.length === 0) return;
    const currentIndex = allBoxes.findIndex(b => b.id === boxId);
    const prevIndex = currentIndex === 0 ? allBoxes.length - 1 : currentIndex - 1;
    window.location.href = `/box-opening/${allBoxes[prevIndex].id}`;
  };

  // Calculate drop chances based on rarity weights
  const calculateDropChances = () => {
    if (!box?.items || box.items.length === 0) return [];
    
    // Calculate total weight for all items in the box
    const totalWeight = box.items.reduce((sum, item) => {
      return sum + (RARITY_WEIGHTS[item.rarity as keyof typeof RARITY_WEIGHTS] || 1);
    }, 0);
    
    // Calculate percentage for each item
    return box.items.map(item => {
      const weight = RARITY_WEIGHTS[item.rarity as keyof typeof RARITY_WEIGHTS] || 1;
      const percentage = (weight / totalWeight) * 100;
      return {
        ...item,
        dropChance: percentage.toFixed(2)
      };
    }).sort((a, b) => parseFloat(b.dropChance) - parseFloat(a.dropChance));
  };

  const handleOpenBox = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to open boxes.",
        variant: "destructive",
      });
      return;
    }

    if (!safeBox) return;

    const boxPrice = parseFloat(safeBox.price);
    const userBalance = userData ? parseFloat(userData.usdBalance) : 0;

    if (userBalance < boxPrice) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${formatCurrency(boxPrice)} to open this box.`,
        variant: "destructive",
      });
      return;
    }
    
    setBoxItems(safeBox.items || []);
    setIsSpinning(true);
    setTimeout(() => {
      openBoxMutation.mutate(boxId);
    }, 3000);
  };

  if (loadingBox) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!box) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">Box Not Found</h1>
            <Link href="/boxes">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Boxes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ensure all required properties exist with fallbacks
  const safeBox = {
    ...box,
    rarity: box.rarity || 'common',
    name: box.name || 'Unknown Box',
    description: box.description || 'No description available',
    price: box.price || '0.00',
    items: box.items || []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Simple Top Navigation */}
      <div className="relative z-20 p-4">
        <Link href="/boxes">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/90 rounded-xl border border-slate-600/50 transition-all duration-200 backdrop-blur-sm text-white hover:text-blue-200">
            <ArrowLeft className="w-4 h-4" />
            Back to Boxes
          </button>
        </Link>
      </div>
      
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-10 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Navigation arrows */}
      <button
        onClick={handlePreviousBox}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-slate-800/80 hover:bg-slate-700/90 rounded-full border border-slate-600/50 transition-all duration-200 backdrop-blur-sm"
        disabled={isSpinning}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={handleNextBox}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-slate-800/80 hover:bg-slate-700/90 rounded-full border border-slate-600/50 transition-all duration-200 backdrop-blur-sm"
        disabled={isSpinning}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-4">
        {/* Box Header Section */}
        <div className="text-center mb-8 pt-6">
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Box Image */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700/80 to-slate-600/80 border-2 border-slate-400/30 shadow-2xl flex items-center justify-center backdrop-blur-sm">
                {box.imageUrl ? (
                  <img 
                    src={box.imageUrl} 
                    alt={box.name}
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                ) : (
                  <Package className="w-10 h-10 text-slate-300" />
                )}
              </div>
            </div>
            
            {/* Box Details */}
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white mb-1">{safeBox.name}</h1>
              <div className="text-emerald-400 text-lg font-bold">${safeBox.price}</div>
            </div>
          </div>
        </div>

        {/* Spinner Wheel Section */}
        <div className="w-full flex justify-center mb-8">
          <SliderWheel
            items={safeBox.items || []}
            isSpinning={isSpinning}
            wonItem={revealedItem}
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-8 w-full max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if (!isSpinning && safeBox.items && safeBox.items.length > 0) {
                  setRevealedItem(null);
                  setBoxItems(safeBox.items);
                  setIsSpinning(true);
                  
                  setTimeout(() => {
                    const randomItem = safeBox.items[Math.floor(Math.random() * safeBox.items.length)];
                    setRevealedItem(randomItem);
                    setIsSpinning(false);
                    
                    setTimeout(() => {
                      setRevealedItem(null);
                    }, 5000);
                  }, 4000);
                }
              }}
              disabled={isSpinning}
              className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed border border-blue-400/30 shadow-xl backdrop-blur-sm"
            >
              {isSpinning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  SPINNING...
                </div>
              ) : (
                'DEMO SPIN (FREE)'
              )}
            </button>

            <button
              onClick={handleOpenBox}
              disabled={isSpinning || !user || (userData && parseFloat(userData.usdBalance) < parseFloat(safeBox.price))}
              className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed border border-emerald-400/30 shadow-xl backdrop-blur-sm"
            >
              {isSpinning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  OPENING...
                </div>
              ) : (
                `PURCHASE & OPEN - $${safeBox.price}`
              )}
            </button>
          </div>
          
          {/* Info Text */}
          <div className="text-center mt-6 space-y-3">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="text-emerald-400 font-medium">
                + {Math.floor(parseFloat(safeBox.price) * 10)} Exp. Points
              </div>
              {userData && (
                <div className="text-slate-300">
                  Balance: <span className="text-white font-semibold">${userData.usdBalance}</span>
                </div>
              )}
            </div>
            {userData && parseFloat(userData.usdBalance) < parseFloat(safeBox.price) && (
              <p className="text-red-400 text-sm font-medium">Insufficient balance for purchase</p>
            )}
            
            {/* Fast Spin Option */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="fastSpin" 
                className="rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0" 
              />
              <label htmlFor="fastSpin" className="text-sm text-slate-300 cursor-pointer">Fast Spin</label>
            </div>
          </div>
        </div>





        {/* Item Won Section - Premium Design */}
        {revealedItem && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 300,
              delay: 0.2 
            }}
            className="w-full max-w-4xl mb-8 relative"
          >
            {/* Celebration particles background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute top-8 right-8 w-1 h-1 bg-pink-400 rounded-full animate-pulse" />
              <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              <div className="absolute bottom-4 right-6 w-1 h-1 bg-green-400 rounded-full animate-ping" />
            </div>

            {/* Main container */}
            <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl border border-white/20 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Animated border glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 animate-pulse rounded-3xl" />
              
              {/* Content */}
              <div className="relative p-8">
                {/* Header with celebration */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center mb-8"
                >
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-4xl"
                    >
                      🎉
                    </motion.div>
                    <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                      CONGRATULATIONS!
                    </h2>
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-4xl"
                    >
                      🎊
                    </motion.div>
                  </div>
                  <p className="text-xl text-gray-300 font-medium">You won an amazing item!</p>
                </motion.div>

                {/* Item showcase */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col md:flex-row items-center gap-8 mb-8"
                >
                  {/* Item image with fancy effects */}
                  <div className="relative">
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden">
                      {/* Animated background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        revealedItem.rarity === 'epic' ? 'from-purple-500/40 to-purple-700/40' :
                        revealedItem.rarity === 'rare' ? 'from-blue-500/40 to-blue-700/40' :
                        revealedItem.rarity === 'legendary' ? 'from-orange-500/40 to-orange-700/40' :
                        revealedItem.rarity === 'mythical' ? 'from-red-500/40 to-red-700/40' :
                        'from-gray-500/40 to-gray-700/40'
                      } animate-pulse`} />
                      
                      {/* Item image */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                        {revealedItem.icon ? (
                          <img 
                            src={revealedItem.icon} 
                            alt={revealedItem.name}
                            className="w-full h-full object-cover rounded-xl border-2 border-white/30"
                          />
                        ) : (
                          <Package className="w-24 h-24 text-white" />
                        )}
                      </div>
                      
                      {/* Shine effect */}
                      <motion.div
                        animate={{ x: [-100, 300] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                      />
                    </div>
                    
                    {/* Floating sparkles */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-2 -right-2 text-2xl"
                    >
                      ✨
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                      className="absolute -bottom-2 -left-2 text-xl"
                    >
                      ⭐
                    </motion.div>
                  </div>

                  {/* Item details */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                      {revealedItem.name}
                    </h3>
                    <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                      {revealedItem.description}
                    </p>
                    
                    {/* Rarity badge with animation */}
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold uppercase tracking-wider mb-4 ${
                        revealedItem.rarity === 'epic' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/50' :
                        revealedItem.rarity === 'rare' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50' :
                        revealedItem.rarity === 'legendary' ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/50' :
                        revealedItem.rarity === 'mythical' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/50' :
                        'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/50'
                      }`}
                    >
                      <span className="mr-2">💎</span>
                      {revealedItem.rarity}
                    </motion.div>

                    {/* Value display */}
                    <div className="text-2xl font-bold text-green-400 mb-6">
                      Estimated Value: ${(Math.random() * 1000 + 50).toFixed(2)}
                    </div>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <Button
                    onClick={handleOpenBox}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    disabled={isSpinning || !user || (userData && parseFloat(userData.usdBalance) < parseFloat(safeBox.price))}
                  >
                    🎮 Open Another
                  </Button>

                  {/* Quick Sell button - only for paid openings */}
                  {isPaidOpening && (
                    <Button
                      onClick={() => quickSellMutation.mutate(revealedItem.id)}
                      disabled={quickSellMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      {quickSellMutation.isPending ? "🔄 Listing..." : "💰 Quick Sell"}
                    </Button>
                  )}

                  <Button
                    onClick={() => setRevealedItem(null)}
                    variant="outline"
                    className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8 py-4 font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    ✕ Close
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Section - Enhanced Items Grid */}
        <div className="w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-black/60 via-gray-900/60 to-black/60 rounded-3xl border border-white/20 backdrop-blur-xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
                  What's Inside the {safeBox.name}
                </h2>
                <p className="text-gray-400 text-lg">
                  {safeBox.items?.length || 0} exclusive items waiting to be discovered
                </p>
              </div>
              <button 
                onClick={() => setShowChances(!showChances)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {showChances ? '📊 HIDE CHANCES' : '🎯 SHOW CHANCES'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {(showChances ? calculateDropChances() : (safeBox.items || [])).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-white/10 backdrop-blur-sm hover:border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                >
                  {/* Rarity glow effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl ${
                    item.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                    item.rarity === 'rare' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                    item.rarity === 'legendary' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                    item.rarity === 'mythical' ? 'bg-gradient-to-br from-red-600 to-pink-700' :
                    'bg-gradient-to-br from-gray-500 to-gray-700'
                  }`} />
                  
                  <div className="relative z-10 text-center">
                    {/* Item image container */}
                    <div className="relative mb-4">
                      <div className={`w-20 h-20 mx-auto rounded-2xl border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                        item.rarity === 'epic' ? 'border-purple-400 bg-gradient-to-br from-purple-600/30 to-purple-800/30' :
                        item.rarity === 'rare' ? 'border-emerald-400 bg-gradient-to-br from-emerald-600/30 to-emerald-800/30' :
                        item.rarity === 'legendary' ? 'border-orange-400 bg-gradient-to-br from-orange-600/30 to-red-600/30' :
                        item.rarity === 'mythical' ? 'border-red-400 bg-gradient-to-br from-red-600/30 to-pink-700/30' :
                        'border-gray-400 bg-gradient-to-br from-gray-600/30 to-gray-800/30'
                      }`}>
                        {item.icon ? (
                          <img 
                            src={item.icon} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl"
                          />
                        ) : (
                          <Package className="w-10 h-10 text-gray-300" />
                        )}
                      </div>
                      
                      {/* Floating sparkles */}
                      <div className="absolute -top-1 -right-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.rarity === 'mythical' ? '✨' : 
                         item.rarity === 'legendary' ? '💫' :
                         item.rarity === 'epic' ? '⭐' :
                         item.rarity === 'rare' ? '🌟' : '💎'}
                      </div>
                    </div>
                    
                    {/* Item name */}
                    <h3 className="font-bold mb-2 text-sm leading-tight text-white group-hover:text-purple-200 transition-colors duration-300">
                      {item.name.length > 16 ? item.name.substring(0, 16) + '...' : item.name}
                    </h3>
                    
                    {/* Rarity badge */}
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 border transition-all duration-300 ${
                      item.rarity === 'epic' ? 'bg-purple-600/80 text-purple-100 border-purple-400/50 group-hover:bg-purple-500 group-hover:shadow-lg group-hover:shadow-purple-500/50' :
                      item.rarity === 'rare' ? 'bg-emerald-600/80 text-emerald-100 border-emerald-400/50 group-hover:bg-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/50' :
                      item.rarity === 'legendary' ? 'bg-orange-600/80 text-orange-100 border-orange-400/50 group-hover:bg-orange-500 group-hover:shadow-lg group-hover:shadow-orange-500/50' :
                      item.rarity === 'mythical' ? 'bg-red-600/80 text-red-100 border-red-400/50 group-hover:bg-red-500 group-hover:shadow-lg group-hover:shadow-red-500/50' :
                      'bg-gray-600/80 text-gray-100 border-gray-400/50 group-hover:bg-gray-500 group-hover:shadow-lg group-hover:shadow-gray-500/50'
                    }`}>
                      {RARITY_LABELS[item.rarity as keyof typeof RARITY_LABELS] || item.rarity}
                    </div>
                    
                    {/* Drop chance or value */}
                    {showChances && 'dropChance' in item ? (
                      <div className="bg-gradient-to-r from-yellow-600/80 to-amber-600/80 text-yellow-100 px-3 py-2 rounded-lg font-bold text-sm border border-yellow-400/50">
                        🎯 {item.dropChance}% chance
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-green-100 px-3 py-2 rounded-lg font-bold text-sm border border-green-400/50">
                        💰 ${item.value || (Math.random() * 500 + 10).toFixed(2)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Summary stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-400/30">
                  <div className="text-2xl font-bold text-purple-300">
                    {safeBox.items?.filter(item => item.rarity === 'epic').length || 0}
                  </div>
                  <div className="text-sm text-purple-200">Epic Items</div>
                </div>
                <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl p-4 border border-orange-400/30">
                  <div className="text-2xl font-bold text-orange-300">
                    {safeBox.items?.filter(item => item.rarity === 'legendary').length || 0}
                  </div>
                  <div className="text-sm text-orange-200">Legendary Items</div>
                </div>
                <div className="bg-gradient-to-br from-red-600/20 to-pink-700/20 rounded-xl p-4 border border-red-400/30">
                  <div className="text-2xl font-bold text-red-300">
                    {safeBox.items?.filter(item => item.rarity === 'mythical').length || 0}
                  </div>
                  <div className="text-sm text-red-200">Mythical Items</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-xl p-4 border border-emerald-400/30">
                  <div className="text-2xl font-bold text-emerald-300">
                    ${safeBox.price}
                  </div>
                  <div className="text-sm text-emerald-200">Box Price</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom padding */}
        <div className="h-16"></div>
      </div>

      {/* Item Reveal Modal */}
      <EnhancedItemRevealModal
        isOpen={isItemRevealOpen}
        item={revealedItem}
        onClose={() => setIsItemRevealOpen(false)}
        onOpenAnother={() => {
          setIsItemRevealOpen(false);
          handleOpenBox();
        }}
        isPaidOpening={isPaidOpening}
        onQuickSell={(itemId) => quickSellMutation.mutate(itemId)}
      />
    </div>
  );
}