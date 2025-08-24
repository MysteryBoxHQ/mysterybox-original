import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, getRarityClass } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Gift, Crown, Target, Zap } from "lucide-react";
import React from "react";
import type { AchievementProgress } from "@shared/schema";

export default function Achievements() {
  const { toast } = useToast();

  const { data: achievements = [], isLoading } = useQuery<AchievementProgress[]>({
    queryKey: ["/api/user/achievements"],
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (achievementId: number) => {
      const response = await apiRequest(`/api/achievements/${achievementId}/claim`, "POST");
      return response.json();
    },
    onSuccess: (data, achievementId) => {
      toast({
        title: "Reward Claimed!",
        description: `You received ${formatCurrency(data.coins)} and ${data.gems} gems`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/achievements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      });
    },
  });

  const handleClaimReward = (achievementId: number) => {
    claimRewardMutation.mutate(achievementId);
  };

  const getProgressPercentage = (progress: number, requirement: number) => {
    return Math.min((progress / requirement) * 100, 100);
  };

  const renderAchievementIcon = (icon: string, rarity: string, completed: boolean = false) => {
    const iconComponent = icon === '🏆' ? Trophy : 
                         icon === '⭐' ? Star : 
                         icon === '🎁' ? Gift : 
                         icon === '👑' ? Crown : 
                         icon === '🎯' ? Target : 
                         Zap;

    return (
      <motion.div 
        className={`w-16 h-16 rounded-full ${getRarityClass(rarity)} flex items-center justify-center relative overflow-hidden`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          animate={completed ? { 
            boxShadow: [
              "0 0 20px rgba(255, 215, 0, 0.5)",
              "0 0 40px rgba(255, 215, 0, 0.8)",
              "0 0 20px rgba(255, 215, 0, 0.5)"
            ]
          } : {}}
          transition={{ duration: 2, repeat: completed ? Infinity : 0 }}
          className={iconComponent.name}
        >
          {iconComponent === Trophy ? <Trophy className="w-8 h-8 text-white" /> :
           iconComponent === Star ? <Star className="w-8 h-8 text-white" /> :
           iconComponent === Gift ? <Gift className="w-8 h-8 text-white" /> :
           iconComponent === Crown ? <Crown className="w-8 h-8 text-white" /> :
           iconComponent === Target ? <Target className="w-8 h-8 text-white" /> :
           <Zap className="w-8 h-8 text-white" />}
        </motion.div>
        
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <Star className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Achievements</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                <CardHeader>
                  <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-slate-700 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-2 bg-slate-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedAchievements = achievements.filter((a) => a.completed);
  const inProgressAchievements = achievements.filter((a) => !a.completed);

  return (
    <div className="min-h-screen cases-background p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 bg-clip-text text-transparent"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(255, 107, 53, 0.5)",
                "0 0 40px rgba(255, 107, 53, 0.8)",
                "0 0 20px rgba(255, 107, 53, 0.5)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Achievements
          </motion.h1>
          <p className="text-slate-300 text-xl mb-6">
            Track your progress and earn rewards for your accomplishments
          </p>
          <motion.div 
            className="flex justify-center gap-8 mt-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div 
              className="text-center cases-card p-4 rounded-xl border border-green-500/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(34, 197, 94, 0.3)" }}
            >
              <div className="text-3xl font-bold text-green-400">{completedAchievements.length}</div>
              <div className="text-slate-400 text-sm">Completed</div>
            </motion.div>
            <motion.div 
              className="text-center cases-card p-4 rounded-xl border border-blue-500/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59, 130, 246, 0.3)" }}
            >
              <div className="text-3xl font-bold text-blue-400">{inProgressAchievements.length}</div>
              <div className="text-slate-400 text-sm">In Progress</div>
            </motion.div>
            <motion.div 
              className="text-center cases-card p-4 rounded-xl border border-purple-500/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(147, 51, 234, 0.3)" }}
            >
              <div className="text-3xl font-bold text-purple-400">{achievements.length}</div>
              <div className="text-slate-400 text-sm">Total</div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* In Progress Achievements */}
        {inProgressAchievements.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <motion.h2 
              className="text-3xl font-bold text-white mb-6 flex items-center gap-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Target className="w-8 h-8 text-blue-400" />
              In Progress
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="cases-card border-slate-600 hover:border-blue-500/50 transition-all duration-300 h-full">
                    <CardHeader className="text-center">
                      {renderAchievementIcon(achievement.icon, achievement.rarity, false)}
                      <CardTitle className="text-white text-lg mt-3">{achievement.name}</CardTitle>
                      <CardDescription className="text-slate-300 text-sm">
                        {achievement.description}
                      </CardDescription>
                      <Badge variant="outline" className={`${getRarityClass(achievement.rarity)} text-white border-0 mt-2`}>
                        {achievement.rarity.toUpperCase()}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white font-medium">
                            {achievement.progress} / {achievement.requirement}
                          </span>
                        </div>
                        <motion.div>
                          <Progress 
                            value={getProgressPercentage(achievement.progress, achievement.requirement)}
                            className="h-3 cases-progress"
                          />
                          <div className="text-center text-xs text-slate-500 mt-1">
                            {Math.floor(getProgressPercentage(achievement.progress, achievement.requirement))}% complete
                          </div>
                        </motion.div>
                        {(achievement.rewardCoins > 0 || achievement.rewardGems > 0) && (
                          <motion.div 
                            className="text-center p-2 cases-card-inner rounded-lg border border-yellow-500/20"
                            whileHover={{ borderColor: "rgba(234, 179, 8, 0.4)" }}
                          >
                            <div className="text-xs text-slate-400 mb-1">Reward</div>
                            <div className="text-sm font-medium text-yellow-400">
                              {achievement.rewardCoins > 0 && `$${achievement.rewardCoins}`}
                              {achievement.rewardCoins > 0 && achievement.rewardGems > 0 && " + "}
                              {achievement.rewardGems > 0 && `${achievement.rewardGems} gems`}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Completed Achievements */}
        {completedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.h2 
              className="text-3xl font-bold text-white mb-6 flex items-center gap-3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <Trophy className="w-8 h-8 text-green-400" />
              Completed
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1.0 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/50 hover:border-green-400/70 transition-all duration-300 h-full relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent"
                      animate={{ 
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.05, 1] 
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <CardHeader className="text-center relative z-10">
                      <div className="relative">
                        {renderAchievementIcon(achievement.icon, achievement.rarity, true)}
                      </div>
                      <CardTitle className="text-white text-lg mt-3">{achievement.name}</CardTitle>
                      <CardDescription className="text-slate-300 text-sm">
                        {achievement.description}
                      </CardDescription>
                      <Badge variant="outline" className={`${getRarityClass(achievement.rarity)} text-white border-0 mt-2`}>
                        {achievement.rarity.toUpperCase()}
                      </Badge>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="space-y-4">
                        <motion.div 
                          className="text-center"
                          animate={{ 
                            boxShadow: [
                              "0 0 10px rgba(34, 197, 94, 0.3)",
                              "0 0 20px rgba(34, 197, 94, 0.5)",
                              "0 0 10px rgba(34, 197, 94, 0.3)"
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/20 px-4 py-2">
                            ✨ COMPLETED ✨
                          </Badge>
                        </motion.div>
                        {(achievement.rewardCoins > 0 || achievement.rewardGems > 0) && (
                          <>
                            <motion.div 
                              className="text-center p-3 cases-card-inner rounded-lg border border-yellow-500/30"
                              whileHover={{ borderColor: "rgba(234, 179, 8, 0.5)" }}
                            >
                              <div className="text-xs text-slate-400 mb-1">Reward</div>
                              <div className="text-sm font-medium text-yellow-400">
                                {achievement.rewardCoins > 0 && `$${achievement.rewardCoins}`}
                                {achievement.rewardCoins > 0 && achievement.rewardGems > 0 && " + "}
                                {achievement.rewardGems > 0 && `${achievement.rewardGems} gems`}
                              </div>
                            </motion.div>
                            {!achievement.rewardClaimed && (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  onClick={() => handleClaimReward(achievement.id)}
                                  disabled={claimRewardMutation.isPending}
                                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-semibold shadow-lg"
                                >
                                  {claimRewardMutation.isPending ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                      <Gift className="w-4 h-4" />
                                    </motion.div>
                                  ) : (
                                    <>
                                      <Gift className="w-4 h-4 mr-2" />
                                      Claim Reward
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            )}
                            {achievement.rewardClaimed && (
                              <Badge variant="outline" className="w-full justify-center border-gray-500 text-gray-400 bg-gray-500/10">
                                REWARD CLAIMED
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Achievements Yet</h3>
            <p className="text-slate-400">Start opening cases to unlock achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
}