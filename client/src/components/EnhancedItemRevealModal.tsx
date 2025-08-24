import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw, Share2 } from "lucide-react";
import { particleEffects } from "@/lib/particleEffects";
import { hapticManager } from "@/lib/hapticManager";
import { formatCurrency, getRarityClass } from "@/lib/utils";
import type { Item } from "@shared/schema";

interface EnhancedItemRevealModalProps {
  isOpen: boolean;
  item: Item | null;
  onClose: () => void;
  onOpenAnother: () => void;
  isPaidOpening?: boolean;
  onQuickSell?: (itemId: number) => void;
}

export default function EnhancedItemRevealModal({ 
  isOpen, 
  item, 
  onClose, 
  onOpenAnother,
  isPaidOpening = false,
  onQuickSell
}: EnhancedItemRevealModalProps) {
  const [showItem, setShowItem] = useState(false);
  const [glowAnimation, setGlowAnimation] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !item) {
      setShowItem(false);
      setGlowAnimation(0);
      return;
    }

    // Dramatic reveal sequence
    const revealTimeout = setTimeout(() => {
      setShowItem(true);
      hapticManager.rarityFeedback(item.rarity);
      
      if (itemRef.current) {
        // Create particle explosion based on rarity
        particleEffects.createRarityExplosion(item.rarity, itemRef.current);
        
        if (item.rarity === 'legendary') {
          particleEffects.createLegendaryEffect(itemRef.current);
        } else if (item.rarity === 'mythical') {
          particleEffects.createMythicalEffect(itemRef.current);
          particleEffects.screenShake(1.5, 600);
        }
      }

      // Start floating particles around the item
      if (containerRef.current && (item.rarity === 'legendary' || item.rarity === 'mythical')) {
        particleEffects.createFloatingParticles(containerRef.current, item.rarity);
      }
    }, 500);

    // Glow animation
    const glowInterval = setInterval(() => {
      setGlowAnimation(prev => Math.sin(Date.now() * 0.005) * 0.5 + 0.5);
    }, 16);

    return () => {
      clearTimeout(revealTimeout);
      clearInterval(glowInterval);
    };
  }, [isOpen, item]);

  if (!item) return null;

  const getRarityGlow = (intensity: number) => {
    const colors = {
      common: `0 0 ${20 * intensity}px rgba(107, 114, 128, ${intensity * 0.8})`,
      rare: `0 0 ${30 * intensity}px rgba(16, 185, 129, ${intensity * 0.8})`,
      epic: `0 0 ${40 * intensity}px rgba(139, 92, 246, ${intensity * 0.8})`,
      legendary: `0 0 ${50 * intensity}px rgba(251, 191, 36, ${intensity * 0.8})`,
      mythical: `0 0 ${60 * intensity}px rgba(239, 68, 68, ${intensity * 0.8})`
    };
    return colors[item.rarity as keyof typeof colors] || colors.common;
  };

  const getRarityBackground = () => {
    const gradients = {
      common: 'from-gray-800 via-gray-900 to-black',
      rare: 'from-green-800 via-gray-900 to-black',
      epic: 'from-purple-800 via-gray-900 to-black',
      legendary: 'from-orange-800 via-gray-900 to-black',
      mythical: 'from-red-800 via-gray-900 to-black'
    };
    return gradients[item.rarity as keyof typeof gradients] || gradients.common;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-black/95 border-gray-800 overflow-hidden p-0 [&>button]:text-white [&>button]:hover:bg-white/20">
        <DialogTitle className="sr-only">Item Revealed</DialogTitle>
        <DialogDescription className="sr-only">
          You won {item.name}, a {item.rarity} rarity item
        </DialogDescription>
        <div 
          ref={containerRef}
          className={`relative w-full h-full bg-gradient-to-br ${getRarityBackground()}`}
        >
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Header */}
          <div className="relative z-20 p-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-white">Item Revealed!</h2>
              <p className="text-gray-400">You won an amazing item</p>
            </motion.div>
          </div>

          {/* Main item display */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-8">
            <AnimatePresence>
              {showItem && (
                <motion.div
                  ref={itemRef}
                  className="text-center"
                  initial={{ 
                    scale: 0, 
                    rotateY: -180, 
                    opacity: 0 
                  }}
                  animate={{ 
                    scale: 1, 
                    rotateY: 0, 
                    opacity: 1 
                  }}
                  transition={{ 
                    duration: 1.2, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  style={{ perspective: 1000 }}
                >
                  {/* Item card with 3D effect */}
                  <motion.div
                    className="relative mb-8"
                    animate={{
                      rotateY: [0, 5, -5, 0],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        boxShadow: getRarityGlow(glowAnimation),
                        filter: `blur(${glowAnimation * 15}px)`
                      }}
                    />

                    {/* Main item card */}
                    <div 
                      className={`relative w-80 h-80 rounded-3xl overflow-hidden border-4 ${getRarityClass(item.rarity, 'border')}`}
                      style={{
                        boxShadow: getRarityGlow(glowAnimation * 0.5)
                      }}
                    >
                      <img
                        src={item.icon || "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop";
                        }}
                      />
                      
                      {/* Holographic overlay */}
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(45deg, 
                            transparent 30%, 
                            rgba(255,255,255,0.1) 40%, 
                            rgba(255,255,255,0.2) 50%, 
                            rgba(255,255,255,0.1) 60%, 
                            transparent 70%)`
                        }}
                        animate={{
                          x: ['-100%', '100%']
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />

                      {/* Rarity badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getRarityClass(item.rarity, 'gradient')} text-white font-bold px-3 py-1 text-sm border-0`}>
                          {item.rarity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Floating energy rings for legendary/mythical */}
                    {(item.rarity === 'legendary' || item.rarity === 'mythical') && (
                      <>
                        {[...Array(2)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 border-2 rounded-3xl pointer-events-none"
                            style={{
                              borderColor: item.rarity === 'mythical' 
                                ? 'rgba(239, 68, 68, 0.4)' 
                                : 'rgba(251, 191, 36, 0.4)'
                            }}
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.6, 0.2, 0.6]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: i * 1.5,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </>
                    )}
                  </motion.div>

                  {/* Item details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="space-y-4"
                  >
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {item.name}
                    </h3>
                    
                    <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-center gap-4 text-lg">
                      <span className="text-gray-400">Rarity:</span>
                      <span className={`text-2xl font-bold ${getRarityClass(item.rarity, 'text')}`}>
                        {item.rarity.toUpperCase()}
                      </span>
                    </div>

                    {/* Drop rate display */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <span>Drop Rate:</span>
                      <span className={getRarityClass(item.rarity, 'text')}>
                        {item.dropChance}%
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <motion.div
            className="relative z-20 p-6 flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showItem ? 1 : 0, y: showItem ? 0 : 20 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <Button
              onClick={onOpenAnother}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 font-semibold"
              onMouseEnter={() => hapticManager.light()}
              onMouseDown={() => hapticManager.medium()}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Open Another
            </Button>

            {/* Quick Sell button - only shown for paid openings */}
            {isPaidOpening && onQuickSell && item && (
              <Button
                onClick={() => onQuickSell(item.id)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 font-semibold"
                onMouseEnter={() => hapticManager.light()}
                onMouseDown={() => hapticManager.medium()}
              >
                Quick Sell
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 font-semibold"
              onMouseEnter={() => hapticManager.light()}
            >
              Close
            </Button>

            <Button
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/20 px-8 py-3 font-semibold"
              onMouseEnter={() => hapticManager.light()}
              onMouseDown={() => hapticManager.medium()}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Win
            </Button>
          </motion.div>

          {/* Floating particles background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {showItem && [...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 10,
                  scale: 0
                }}
                animate={{
                  y: -10,
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  delay: Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}