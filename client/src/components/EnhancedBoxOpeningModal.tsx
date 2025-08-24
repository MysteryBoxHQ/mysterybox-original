import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { particleEffects } from "@/lib/particleEffects";
import { hapticManager } from "@/lib/hapticManager";

interface EnhancedBoxOpeningModalProps {
  isOpen: boolean;
  boxName: string;
  boxImage?: string;
  rarity?: string;
  onComplete: () => void;
}

export default function EnhancedBoxOpeningModal({ 
  isOpen, 
  boxName, 
  boxImage, 
  rarity = 'common',
  onComplete 
}: EnhancedBoxOpeningModalProps) {
  const [stage, setStage] = useState<'anticipation' | 'opening' | 'revealing' | 'explosion' | 'complete'>('anticipation');
  const [glowIntensity, setGlowIntensity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setStage('anticipation');
      setGlowIntensity(0);
      return;
    }

    // Stage progression with enhanced timing
    const timeline = [
      { stage: 'anticipation', delay: 0, duration: 1500 },
      { stage: 'opening', delay: 1500, duration: 2000 },
      { stage: 'revealing', delay: 3500, duration: 1500 },
      { stage: 'explosion', delay: 5000, duration: 2000 },
      { stage: 'complete', delay: 7000, duration: 0 }
    ] as const;

    const timeouts: NodeJS.Timeout[] = [];

    timeline.forEach(({ stage: nextStage, delay }) => {
      const timeout = setTimeout(() => {
        setStage(nextStage);
        
        // Haptic feedback for each stage
        switch (nextStage) {
          case 'anticipation':
            hapticManager.light();
            break;
          case 'opening':
            hapticManager.medium();
            if (containerRef.current) {
              particleEffects.createAmbientSparkles(containerRef.current, 3000);
            }
            break;
          case 'revealing':
            hapticManager.strong();
            break;
          case 'explosion':
            hapticManager.rarityFeedback(rarity);
            if (boxRef.current) {
              particleEffects.createRarityExplosion(rarity, boxRef.current);
              if (rarity === 'legendary') {
                particleEffects.createLegendaryEffect(boxRef.current);
              } else if (rarity === 'mythical') {
                particleEffects.createMythicalEffect(boxRef.current);
                particleEffects.screenShake(2, 800);
              }
            }
            break;
          case 'complete':
            setTimeout(onComplete, 1000);
            break;
        }
      }, delay);
      
      timeouts.push(timeout);
    });

    // Glow intensity animation
    const glowInterval = setInterval(() => {
      setGlowIntensity(prev => {
        if (stage === 'anticipation') return Math.sin(Date.now() * 0.003) * 0.5 + 0.5;
        if (stage === 'opening') return Math.sin(Date.now() * 0.008) * 0.8 + 0.2;
        if (stage === 'revealing') return 1;
        return 0;
      });
    }, 16);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(glowInterval);
    };
  }, [isOpen, rarity, onComplete]);

  const getRarityGlow = (intensity: number) => {
    const colors = {
      common: `0 0 ${20 * intensity}px rgba(107, 114, 128, ${intensity})`,
      rare: `0 0 ${30 * intensity}px rgba(16, 185, 129, ${intensity})`,
      epic: `0 0 ${40 * intensity}px rgba(139, 92, 246, ${intensity})`,
      legendary: `0 0 ${50 * intensity}px rgba(251, 191, 36, ${intensity})`,
      mythical: `0 0 ${60 * intensity}px rgba(239, 68, 68, ${intensity})`
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getStageVariants = () => {
    switch (stage) {
      case 'anticipation':
        return {
          scale: [1, 1.05, 1],
          rotateY: [0, 5, -5, 0],
          transition: { duration: 2, repeat: Infinity }
        };
      case 'opening':
        return {
          scale: [1, 1.2, 1.1],
          rotateY: [0, 10, -10, 0],
          rotateX: [0, 5, -5, 0],
          transition: { duration: 1.5, repeat: Infinity }
        };
      case 'revealing':
        return {
          scale: 1.3,
          rotateY: 360,
          transition: { duration: 1.5, ease: "easeOut" }
        };
      case 'explosion':
        return {
          scale: [1.3, 1.8, 0.9],
          rotateY: [360, 720],
          opacity: [1, 0.8, 1],
          transition: { duration: 1.5, ease: "easeInOut" }
        };
      case 'complete':
        return {
          scale: 0,
          opacity: 0,
          transition: { duration: 0.5 }
        };
      default:
        return {};
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-4xl h-[80vh] bg-black/95 border-gray-800 overflow-hidden p-0"
      >
        <div 
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900"
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{
                x: ['-100%', '100%'],
                opacity: stage === 'opening' ? [0, 0.1, 0] : 0
              }}
              transition={{
                duration: 2,
                repeat: stage === 'opening' ? Infinity : 0,
                ease: "linear"
              }}
            />
          </div>

          {/* Main box container */}
          <motion.div
            ref={boxRef}
            className="relative z-10"
            animate={getStageVariants()}
            style={{
              perspective: 1000,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Box shadow/glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                boxShadow: getRarityGlow(glowIntensity),
                filter: `blur(${glowIntensity * 10}px)`
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: glowIntensity
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Main box */}
            <motion.div
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-4"
              style={{
                borderColor: `rgba(${rarity === 'mythical' ? '239, 68, 68' : 
                  rarity === 'legendary' ? '251, 191, 36' :
                  rarity === 'epic' ? '139, 92, 246' :
                  rarity === 'rare' ? '16, 185, 129' : '107, 114, 128'}, ${glowIntensity})`,
                boxShadow: getRarityGlow(glowIntensity * 0.5)
              }}
            >
              {/* Box image */}
              <motion.img
                src={boxImage || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"}
                alt={boxName}
                className="w-full h-full object-cover"
                animate={{
                  filter: `brightness(${1 + glowIntensity * 0.5}) saturate(${1 + glowIntensity * 0.3})`
                }}
              />

              {/* Overlay effects */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                animate={{
                  opacity: stage === 'revealing' ? 0 : 1
                }}
              />

              {/* Crack effect for opening stage */}
              <AnimatePresence>
                {stage === 'opening' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 1.5 }}
                    style={{
                      background: `linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)`
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Energy pulse rings */}
              <AnimatePresence>
                {(stage === 'opening' || stage === 'revealing') && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 border-2 rounded-2xl"
                        style={{
                          borderColor: `rgba(${rarity === 'mythical' ? '239, 68, 68' : 
                            rarity === 'legendary' ? '251, 191, 36' :
                            rarity === 'epic' ? '139, 92, 246' :
                            rarity === 'rare' ? '16, 185, 129' : '107, 114, 128'}, 0.6)`
                        }}
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ 
                          scale: [1, 1.5, 2],
                          opacity: [0.8, 0.4, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.6,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Stage indicator text */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{
              opacity: [0.7, 1, 0.7],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                {boxName}
              </h3>
              <p className="text-gray-400 text-sm md:text-base">
                {stage === 'anticipation' && 'Preparing to open...'}
                {stage === 'opening' && 'Opening case...'}
                {stage === 'revealing' && 'Revealing item...'}
                {stage === 'explosion' && 'Congratulations!'}
                {stage === 'complete' && 'Opening complete!'}
              </p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-64">
            <div className="w-full bg-gray-800 rounded-full h-1">
              <motion.div
                className="h-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                initial={{ width: '0%' }}
                animate={{ 
                  width: stage === 'anticipation' ? '20%' :
                         stage === 'opening' ? '50%' :
                         stage === 'revealing' ? '80%' :
                         stage === 'explosion' ? '100%' : '100%'
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}