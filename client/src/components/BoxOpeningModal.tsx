import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Package, Gift, Star, Zap } from "lucide-react";

interface BoxOpeningModalProps {
  isOpen: boolean;
  boxName: string;
  onComplete: () => void;
}

export default function BoxOpeningModal({ isOpen, boxName, onComplete }: BoxOpeningModalProps) {
  const [stage, setStage] = useState<'anticipation' | 'opening' | 'revealing' | 'explosion' | 'complete'>('anticipation');
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);

  useEffect(() => {
    if (!isOpen) {
      setStage('anticipation');
      setProgress(0);
      setParticles([]);
      return;
    }

    // Stage progression with enhanced timing
    const stageTimer = setTimeout(() => {
      setStage('opening');
      
      // Progress animation
      const progressTimer = setTimeout(() => {
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setTimeout(() => setStage('revealing'), 300);
              return 100;
            }
            return prev + Math.random() * 4 + 1; // Variable speed for excitement
          });
        }, 80);
        
        return () => clearInterval(interval);
      }, 800);
      
      return () => clearTimeout(progressTimer);
    }, 1500); // Longer anticipation

    return () => clearTimeout(stageTimer);
  }, [isOpen]);

  useEffect(() => {
    if (stage === 'revealing') {
      const timer = setTimeout(() => {
        setStage('explosion');
        // Generate explosion particles
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
          id: i,
          x: Math.random() * 400 - 200,
          y: Math.random() * 400 - 200,
          color: ['#FFD700', '#FF6B35', '#F7931E', '#FF1744', '#E91E63'][Math.floor(Math.random() * 5)]
        }));
        setParticles(newParticles);
      }, 2500);
      return () => clearTimeout(timer);
    }
    
    if (stage === 'explosion') {
      const timer = setTimeout(() => {
        setStage('complete');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl glass-effect border border-white/20 bg-black/90 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 space-y-8 relative">
          {/* Particle explosion effects */}
          {stage === 'explosion' && particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ 
                x: particle.x, 
                y: particle.y, 
                opacity: 0, 
                scale: 0,
                rotate: Math.random() * 360
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          ))}

          <AnimatePresence mode="wait">
            {stage === 'anticipation' && (
              <motion.div
                key="anticipation"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-center space-y-8"
              >
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotateY: [0, 360]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mx-auto w-32 h-32 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <Package className="w-16 h-16 text-white" />
                </motion.div>
                
                <div className="space-y-4">
                  <motion.h2 
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  >
                    Preparing to open {boxName}...
                  </motion.h2>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mx-auto w-8 h-8"
                  >
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {stage === 'opening' && (
              <motion.div
                key="opening"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-center space-y-8"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      "0 0 20px rgba(255, 107, 53, 0.5)",
                      "0 0 40px rgba(255, 107, 53, 0.8)",
                      "0 0 20px rgba(255, 107, 53, 0.5)"
                    ]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mx-auto w-36 h-36 bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 rounded-3xl flex items-center justify-center relative"
                >
                  <Package className="w-18 h-18 text-white" />
                  
                  {/* Rotating energy rings */}
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-yellow-400 rounded-3xl opacity-50"
                  />
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border border-white rounded-3xl opacity-30"
                  />
                </motion.div>
                
                <div className="space-y-6">
                  <motion.h2 
                    animate={{ 
                      textShadow: [
                        "0 0 10px rgba(255, 107, 53, 0.5)",
                        "0 0 20px rgba(255, 107, 53, 0.8)",
                        "0 0 10px rgba(255, 107, 53, 0.5)"
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-3xl font-bold text-orange-400"
                  >
                    Opening {boxName}
                  </motion.h2>
                  <div className="w-96 mx-auto space-y-3">
                    <Progress value={progress} className="h-4 bg-gray-800" />
                    <motion.p 
                      key={Math.floor(progress)}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-white"
                    >
                      {Math.floor(progress)}%
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}

            {stage === 'revealing' && (
              <motion.div
                key="revealing"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                className="text-center space-y-8"
              >
                <motion.div
                  initial={{ scale: 0, rotateY: 0 }}
                  animate={{ 
                    scale: [0, 1.3, 1],
                    rotateY: [0, 180, 360],
                    boxShadow: [
                      "0 0 30px rgba(255, 215, 0, 0.5)",
                      "0 0 60px rgba(255, 215, 0, 1)",
                      "0 0 30px rgba(255, 215, 0, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="mx-auto relative"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="w-44 h-44 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 rounded-full flex items-center justify-center relative overflow-hidden"
                    >
                      <Gift className="w-20 h-20 text-white z-10" />
                      
                      {/* Inner glow effect */}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-transparent rounded-full"
                      />
                    </motion.div>
                    
                    {/* Enhanced sparkle effects */}
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                          x: [0, Math.cos(i * 30 * Math.PI / 180) * 80],
                          y: [0, Math.sin(i * 30 * Math.PI / 180) * 80],
                          rotate: [0, 360]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.15
                        }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <Star className="w-6 h-6 text-yellow-300" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    textShadow: [
                      "0 0 20px rgba(255, 215, 0, 0.8)",
                      "0 0 40px rgba(255, 215, 0, 1)",
                      "0 0 20px rgba(255, 215, 0, 0.8)"
                    ]
                  }}
                  transition={{ delay: 0.8, duration: 1.5, repeat: Infinity }}
                  className="text-4xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent"
                >
                  Revealing Treasure...
                </motion.h2>
              </motion.div>
            )}

            {stage === 'explosion' && (
              <motion.div
                key="explosion"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-center space-y-8"
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: [1, 1.5, 1.2],
                    boxShadow: [
                      "0 0 50px rgba(255, 20, 147, 0.8)",
                      "0 0 100px rgba(255, 20, 147, 1)",
                      "0 0 50px rgba(255, 20, 147, 0.8)"
                    ]
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="mx-auto w-48 h-48 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center relative"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <Gift className="w-24 h-24 text-white" />
                  </motion.div>
                  
                  {/* Explosion waves */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ 
                        scale: [0, 2, 3],
                        opacity: [0.8, 0.3, 0]
                      }}
                      transition={{ 
                        duration: 1.5,
                        delay: i * 0.2,
                        ease: "easeOut"
                      }}
                      className="absolute inset-0 border-4 border-white rounded-full"
                    />
                  ))}
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    textShadow: "0 0 30px rgba(255, 20, 147, 1)"
                  }}
                  className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent"
                >
                  JACKPOT!
                </motion.h2>
              </motion.div>
            )}

            {stage === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                >
                  <div className="w-40 h-40 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <Gift className="w-20 h-20 text-white" />
                  </div>
                </motion.div>
                
                <div className="space-y-6">
                  <motion.h2 
                    animate={{ 
                      textShadow: [
                        "0 0 20px rgba(34, 197, 94, 0.8)",
                        "0 0 30px rgba(34, 197, 94, 1)",
                        "0 0 20px rgba(34, 197, 94, 0.8)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl font-bold text-green-400"
                  >
                    Box Opened Successfully!
                  </motion.h2>
                  <p className="text-xl text-gray-300">Check your inventory to see your new item!</p>
                  
                  <Button
                    onClick={onComplete}
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0 text-lg px-8 py-3 rounded-xl shadow-lg"
                  >
                    View Reward
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}