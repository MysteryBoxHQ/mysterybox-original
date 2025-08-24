import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { particleEffects } from "@/lib/particleEffects";
import { soundManager } from "@/lib/soundManager";
import { hapticManager } from "@/lib/hapticManager";
import type { Item } from "@shared/schema";

interface SpinningWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  possibleItems: Item[];
  wonItem: Item | null;
  onSpin: () => void;
  isSpinning: boolean;
}

export default function SpinningWheelModal({
  isOpen,
  onClose,
  possibleItems,
  wonItem,
  onSpin,
  isSpinning
}: SpinningWheelModalProps) {
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const segmentAngle = 360 / possibleItems.length;

  useEffect(() => {
    if (isSpinning && wonItem && !hasSpun) {
      setHasSpun(true);
      
      // Play spinning sound
      soundManager.playSpinSound();
      hapticManager.medium();
      
      // Calculate target rotation to land on won item
      const wonItemIndex = possibleItems.findIndex(item => item.id === wonItem.id);
      const targetAngle = (wonItemIndex * segmentAngle) + (segmentAngle / 2);
      const spins = 5; // Number of full rotations
      const finalRotation = (spins * 360) + (360 - targetAngle);
      
      setRotation(finalRotation);
      
      // Play celebration effects after spin completes
      setTimeout(() => {
        soundManager.playWinSound(wonItem.rarity);
        hapticManager.rarityFeedback(wonItem.rarity);
        
        if (wheelRef.current) {
          particleEffects.createRarityExplosion(wonItem.rarity, wheelRef.current);
          if (wonItem.rarity === 'legendary' || wonItem.rarity === 'mythical') {
            particleEffects.createConfettiExplosion(wheelRef.current);
          }
        }
      }, 3000);
    }
  }, [isSpinning, wonItem, hasSpun, possibleItems, segmentAngle]);

  useEffect(() => {
    if (!isOpen) {
      setRotation(0);
      setHasSpun(false);
    }
  }, [isOpen]);

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#6B7280',
      rare: '#10B981',
      epic: '#8B5CF6',
      legendary: '#FBBF24',
      mythical: '#EF4444'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityGlow = (rarity: string) => {
    const colors = {
      common: 'rgba(107, 114, 128, 0.3)',
      rare: 'rgba(16, 185, 129, 0.4)',
      epic: 'rgba(139, 92, 246, 0.5)',
      legendary: 'rgba(251, 191, 36, 0.6)',
      mythical: 'rgba(239, 68, 68, 0.7)'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] bg-black/95 border-gray-800 overflow-hidden p-0">
        <div 
          ref={containerRef}
          className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900"
        >
          {/* Background effects */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{
                x: ['-100%', '100%'],
                opacity: isSpinning ? [0, 0.1, 0] : 0
              }}
              transition={{
                duration: 2,
                repeat: isSpinning ? Infinity : 0,
                ease: "linear"
              }}
            />
          </div>

          {/* Title */}
          <motion.h2 
            className="text-3xl font-bold text-white mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Spin the Wheel of Fortune
          </motion.h2>

          {/* Spinning Wheel */}
          <div className="relative">
            {/* Wheel container */}
            <motion.div
              ref={wheelRef}
              className="relative w-80 h-80 md:w-96 md:h-96 rounded-full border-4 border-gray-600 overflow-hidden"
              style={{
                transformOrigin: 'center',
              }}
              animate={{
                rotate: rotation,
                scale: isSpinning ? [1, 1.05, 1] : 1
              }}
              transition={{
                rotate: {
                  duration: isSpinning ? 3 : 0,
                  ease: "easeOut"
                },
                scale: {
                  duration: 0.5,
                  repeat: isSpinning ? Infinity : 0
                }
              }}
            >
              {/* Wheel segments */}
              {possibleItems.map((item, index) => {
                const startAngle = index * segmentAngle;
                
                return (
                  <div
                    key={item.id}
                    className="absolute inset-0"
                    style={{
                      clipPath: `polygon(50% 50%, ${
                        50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)
                      }% ${
                        50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)
                      }%, ${
                        50 + 50 * Math.cos((startAngle + segmentAngle - 90) * Math.PI / 180)
                      }% ${
                        50 + 50 * Math.sin((startAngle + segmentAngle - 90) * Math.PI / 180)
                      }%)`
                    }}
                  >
                    <div 
                      className="w-full h-full flex items-center justify-center relative"
                      style={{
                        backgroundColor: getRarityColor(item.rarity),
                        boxShadow: `inset 0 0 20px ${getRarityGlow(item.rarity)}`
                      }}
                    >
                      {/* Item image */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          transform: `rotate(${startAngle + segmentAngle / 2}deg)`
                        }}
                      >
                        <div className="text-center" style={{ transform: 'rotate(-90deg)' }}>
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-1 rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop";
                            }}
                          />
                          <p className="text-white text-xs font-semibold truncate max-w-16">
                            {item.name}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
              
              {/* Center hub */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full border-4 border-gray-600 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                </div>
              </div>
            </motion.div>

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
              <motion.div 
                className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"
                animate={{
                  scale: isSpinning ? [1, 1.2, 1] : 1,
                  filter: isSpinning ? `drop-shadow(0 0 10px rgba(251, 191, 36, 0.8))` : 'none'
                }}
                transition={{
                  duration: 0.5,
                  repeat: isSpinning ? Infinity : 0
                }}
              />
            </div>

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: isSpinning 
                  ? ['0 0 20px rgba(251, 191, 36, 0.3)', '0 0 40px rgba(251, 191, 36, 0.6)', '0 0 20px rgba(251, 191, 36, 0.3)']
                  : '0 0 20px rgba(251, 191, 36, 0.3)'
              }}
              transition={{
                duration: 1,
                repeat: isSpinning ? Infinity : 0
              }}
            />
          </div>

          {/* Spin Button or Result */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              {!hasSpun ? (
                <motion.div
                  key="spin-button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Button
                    onClick={onSpin}
                    disabled={isSpinning}
                    className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                  >
                    {isSpinning ? "Spinning..." : "SPIN!"}
                  </Button>
                </motion.div>
              ) : wonItem && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-4">You Won!</h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={wonItem.icon}
                        alt={wonItem.name}
                        className="w-16 h-16 rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop";
                        }}
                      />
                      <div className="text-left">
                        <p className="text-xl font-semibold text-white">{wonItem.name}</p>
                        <p 
                          className="text-sm font-medium capitalize"
                          style={{ color: getRarityColor(wonItem.rarity) }}
                        >
                          {wonItem.rarity}
                        </p>
                        <p className="text-lg font-bold text-green-400">Value: Rare Item</p>
                      </div>
                    </div>
                    <Button
                      onClick={onClose}
                      className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700"
                    >
                      Collect Item
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress indicator */}
          {isSpinning && (
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}