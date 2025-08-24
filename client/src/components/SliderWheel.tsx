import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { getRarityClass } from "@/lib/utils";
import type { Item } from "@shared/schema";
import { useEffect, useState } from "react";

interface SliderWheelProps {
  items: Item[];
  isSpinning: boolean;
  wonItem?: Item | null;
}

export default function SliderWheel({ items, isSpinning, wonItem }: SliderWheelProps) {
  const [shuffledItems, setShuffledItems] = useState<Item[]>([]);
  
  // Shuffle items randomly on mount
  useEffect(() => {
    const shuffleArray = (array: Item[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    if (items.length > 0) {
      setShuffledItems(shuffleArray(items));
    }
  }, [items]);

  // Create extended item list for smooth infinite scroll effect
  const numCopies = shuffledItems.length > 0 ? Math.max(5, Math.ceil(50 / shuffledItems.length)) : 5;
  const extendedItems = shuffledItems.length > 0 ? Array(numCopies).fill(shuffledItems).flat() : [];

  // Calculate animation distance based on won item position
  const getAnimationDistance = () => {
    if (!wonItem || shuffledItems.length === 0) return 0;
    
    // Calculate the distance needed to center the won item
    const itemWidth = 144; // 36 * 4 (w-36 in Tailwind)
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const centerOffset = containerWidth / 2 - itemWidth / 2;
    
    // Find the won item in the shuffled array and calculate distance
    const wonItemIndex = shuffledItems.findIndex(item => item.id === wonItem.id);
    if (wonItemIndex === -1) return -2000;
    
    // Add extra spins for dramatic effect (3-5 full rotations)
    const extraSpins = 3 + Math.random() * 2;
    const totalItems = shuffledItems.length;
    const baseDistance = extraSpins * totalItems * itemWidth;
    
    // Final position to center the won item
    const finalPosition = wonItemIndex * itemWidth;
    
    return -(baseDistance + finalPosition - centerOffset);
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-600 to-gray-700',
      rare: 'from-blue-500 to-blue-600',
      epic: 'from-purple-500 to-purple-600',
      legendary: 'from-orange-500 to-orange-600',
      mythical: 'from-red-500 to-red-600'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getWinnerBannerColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-orange-400 to-orange-600',
      mythical: 'from-red-400 to-red-600'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Wheel container */}
      <div className="relative h-64 bg-black/20 rounded-2xl border border-white/20 overflow-hidden">
        {/* Just fade effects, no selection frame */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black/80 to-transparent" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/80 to-transparent" />
        </div>
        
        {/* Sliding items */}
        <motion.div
          className="flex h-full items-center"
          animate={{
            x: isSpinning ? [0, -500, -1000, -1500] : (wonItem ? getAnimationDistance() : 0)
          }}
          transition={{
            duration: isSpinning ? 3.5 : (wonItem ? 4.5 : 0),
            ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : "easeOut",
            times: isSpinning ? [0, 0.3, 0.6, 1] : undefined
          }}
        >
          {extendedItems.map((item, index) => {
            // Check if this specific item instance is in the winning position
            const isInWinningPosition = !isSpinning && wonItem && item.id === wonItem.id;
            const isWonItem = isInWinningPosition;
            
            return (
              <div
                key={`${item.id}-${index}`}
                className={`flex-shrink-0 w-36 h-full p-3 flex flex-col items-center justify-center transition-all duration-700 ${
                  isWonItem ? 'z-50 scale-125' : 'z-10'
                }`}
              >
                <div className={`
                  w-full h-full rounded-xl border-4 p-4 flex flex-col items-center justify-center
                  transition-all duration-700 relative overflow-hidden
                  ${isWonItem 
                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-300/40 to-yellow-500/40 shadow-2xl shadow-yellow-300/90 animate-bounce' 
                    : 'border-white/20 bg-gradient-to-br ' + getRarityColor(item.rarity)
                  }
                `}>
                  {/* Rarity glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-60`} />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center text-white">
                    {/* Rarity label */}
                    <div className="text-xs font-bold uppercase mb-2 tracking-wide">
                      {item.rarity}
                    </div>
                    
                    {/* Item image */}
                    <div className="w-16 h-16 mb-3 relative">
                      {item.icon ? (
                        <img 
                          src={item.icon} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700/50 rounded-lg border-2 border-white/30 flex items-center justify-center">
                          <Package className="w-8 h-8 text-white" />
                        </div>
                      )}
                      
                      {/* Shine effect for won item */}
                      {isWonItem && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse rounded-lg" />
                          <div className="absolute inset-0 animate-ping bg-yellow-400/20 rounded-lg" />
                          {/* Golden rays */}
                          <div className="absolute inset-0 overflow-hidden rounded-lg">
                            <div className="absolute -inset-2 bg-gradient-conic from-yellow-400 via-transparent to-yellow-400 animate-spin opacity-30" />
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Item name */}
                    <div className="text-sm font-semibold mb-1 leading-tight">
                      {item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name}
                    </div>
                    
                    {/* Item value */}
                    <div className="text-xs font-bold text-green-400">
                      ${(Math.random() * 1000 + 50).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Won item pulse effect */}
                  {isWonItem && (
                    <div className="absolute inset-0 border-2 border-yellow-400 rounded-xl animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
      
      {/* Spinning indicator */}
      {isSpinning && (
        <div className="absolute top-4 right-4 z-30">
          <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-bold">
            SPINNING...
          </div>
        </div>
      )}
      
      {/* Winner announcement */}
      {wonItem && !isSpinning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
          <div className={`bg-gradient-to-r ${getWinnerBannerColor(wonItem.rarity)} text-white px-6 py-3 rounded-xl shadow-2xl border-2 border-white/50 animate-bounce`}>
            <div className="text-center">
              <div className="text-lg font-black">🎉 YOU WON! 🎉</div>
              <div className="text-sm font-bold">{wonItem.name}</div>
              <div className="text-xs font-semibold uppercase opacity-90">{wonItem.rarity}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}