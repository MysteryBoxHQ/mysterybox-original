import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Gift, Zap, Crown, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  experienceGained: number;
  totalExperience: number;
  rewards: {
    coins: number;
    gems: number;
    bonuses?: string[];
  };
}

interface LevelUpSystemProps {
  isVisible: boolean;
  levelUpData: LevelUpData;
  onClose: () => void;
}

// Experience requirements for each level (exponential scaling)
const EXPERIENCE_REQUIREMENTS = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  return Math.floor(100 * Math.pow(1.5, level - 1));
});

// Level rewards and bonuses
const LEVEL_REWARDS = {
  coins: (level: number) => level * 100,
  gems: (level: number) => level >= 10 ? Math.floor(level / 10) * 5 : 0,
  bonuses: (level: number) => {
    const bonuses = [];
    if (level % 5 === 0) bonuses.push("5% Box Opening Bonus");
    if (level % 10 === 0) bonuses.push("Special Mission Unlocked");
    if (level % 25 === 0) bonuses.push("VIP Status Upgrade");
    return bonuses;
  }
};

export function LevelUpSystem({ isVisible, levelUpData, onClose }: LevelUpSystemProps) {
  const { toast } = useToast();
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Animation sequence
      const sequence = [
        { delay: 0, phase: 1 },     // Show level up
        { delay: 1000, phase: 2 },  // Show experience gain
        { delay: 2000, phase: 3 },  // Show rewards
        { delay: 3000, phase: 4 },  // Show bonuses
      ];

      sequence.forEach(({ delay, phase }) => {
        setTimeout(() => setAnimationPhase(phase), delay);
      });
    } else {
      setAnimationPhase(0);
    }
  }, [isVisible]);

  const getExperienceForLevel = (level: number) => {
    return EXPERIENCE_REQUIREMENTS[level - 1] || 0;
  };

  const getProgressToNextLevel = (experience: number, level: number) => {
    const currentLevelExp = getExperienceForLevel(level);
    const nextLevelExp = getExperienceForLevel(level + 1);
    const progressExp = experience - currentLevelExp;
    const requiredExp = nextLevelExp - currentLevelExp;
    return Math.min((progressExp / requiredExp) * 100, 100);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-purple-500/50 backdrop-blur-sm max-w-md w-full">
              <CardContent className="p-8 text-center space-y-6">
                {/* Level Up Header */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={animationPhase >= 1 ? { y: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-purple-500 to-yellow-400 rounded-full p-1 opacity-75"
                    />
                    <div className="relative bg-slate-900 rounded-full p-4">
                      <Crown className="w-12 h-12 text-yellow-400 mx-auto" />
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-white mt-4">
                    LEVEL UP!
                  </h1>
                  
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <Badge variant="outline" className="text-purple-300 border-purple-400">
                      Level {levelUpData.oldLevel}
                    </Badge>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={animationPhase >= 1 ? { scale: 1 } : {}}
                      transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                    >
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                    <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      Level {levelUpData.newLevel}
                    </Badge>
                  </div>
                </motion.div>

                {/* Experience Gained */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={animationPhase >= 2 ? { y: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <p className="text-blue-300">
                    +{levelUpData.experienceGained} Experience
                  </p>
                  <div className="bg-slate-800 rounded-full p-1">
                    <Progress 
                      value={getProgressToNextLevel(levelUpData.totalExperience, levelUpData.newLevel)}
                      className="h-3"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {levelUpData.totalExperience} / {getExperienceForLevel(levelUpData.newLevel + 1)} XP
                  </p>
                </motion.div>

                {/* Rewards */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={animationPhase >= 3 ? { y: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <h3 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5 text-yellow-400" />
                    Rewards Earned
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {levelUpData.rewards.coins > 0 && (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                        <div className="text-yellow-400 font-bold">
                          +{levelUpData.rewards.coins}
                        </div>
                        <div className="text-xs text-yellow-300">Coins</div>
                      </div>
                    )}
                    
                    {levelUpData.rewards.gems > 0 && (
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                        <div className="text-purple-400 font-bold">
                          +{levelUpData.rewards.gems}
                        </div>
                        <div className="text-xs text-purple-300">Gems</div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Special Bonuses */}
                {levelUpData.rewards.bonuses && levelUpData.rewards.bonuses.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={animationPhase >= 4 ? { y: 0, opacity: 1 } : {}}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <h3 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Special Bonuses
                    </h3>
                    
                    <div className="space-y-2">
                      {levelUpData.rewards.bonuses.map((bonus, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-2"
                        >
                          <div className="text-sm text-green-300 flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            {bonus}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Close Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={animationPhase >= 4 ? { opacity: 1 } : {}}
                  transition={{ delay: 1 }}
                >
                  <Button 
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Continue
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing level-up system
export function useLevelSystem() {
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const { toast } = useToast();

  const calculateLevel = (experience: number) => {
    let level = 1;
    for (let i = 0; i < EXPERIENCE_REQUIREMENTS.length; i++) {
      if (experience >= EXPERIENCE_REQUIREMENTS[i]) {
        level = i + 2;
      } else {
        break;
      }
    }
    return level;
  };

  const checkForLevelUp = (oldExperience: number, newExperience: number) => {
    const oldLevel = calculateLevel(oldExperience);
    const newLevel = calculateLevel(newExperience);
    
    if (newLevel > oldLevel) {
      const rewards = {
        coins: LEVEL_REWARDS.coins(newLevel),
        gems: LEVEL_REWARDS.gems(newLevel),
        bonuses: LEVEL_REWARDS.bonuses(newLevel)
      };

      setLevelUpData({
        oldLevel,
        newLevel,
        experienceGained: newExperience - oldExperience,
        totalExperience: newExperience,
        rewards
      });
      setShowLevelUp(true);
      return true;
    }
    return false;
  };

  const addExperience = (amount: number, currentExperience: number) => {
    const newExperience = currentExperience + amount;
    const leveledUp = checkForLevelUp(currentExperience, newExperience);
    
    if (!leveledUp) {
      toast({
        title: `+${amount} Experience`,
        description: "Keep playing to level up!",
      });
    }
    
    return newExperience;
  };

  const closeLevelUp = () => {
    setShowLevelUp(false);
    setLevelUpData(null);
  };

  return {
    levelUpData,
    showLevelUp,
    addExperience,
    checkForLevelUp,
    calculateLevel,
    closeLevelUp,
    EXPERIENCE_REQUIREMENTS,
    LEVEL_REWARDS
  };
}