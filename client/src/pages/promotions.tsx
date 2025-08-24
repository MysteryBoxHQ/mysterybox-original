import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Users, Tag, Calendar, Clock, Star, Coins, Gem, Copy, Check, Trophy, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import type { User } from "@shared/schema";

interface DailyReward {
  day: number;
  coins: number;
  gems: number;
  bonus?: string;
  claimed: boolean;
  available: boolean;
}

interface LoginStreak {
  currentStreak: number;
  longestStreak: number;
  lastLogin: Date;
  nextRewardDay: number;
}

interface ReferralData {
  referralCode: string;
  referralsCount: number;
  totalEarnings: number;
  referralHistory: ReferralHistory[];
}

interface ReferralHistory {
  id: number;
  referredUsername: string;
  joinedAt: Date;
  reward: number;
  status: 'pending' | 'completed';
}

interface PromoCode {
  code: string;
  type: 'coins' | 'gems' | 'discount' | 'bonus_multiplier';
  value: number;
  description: string;
  expiresAt: Date;
  usageLimit: number;
  usesRemaining: number;
}

interface ActivePromotion {
  id: number;
  title: string;
  description: string;
  type: 'limited_time' | 'special_event' | 'seasonal';
  reward: {
    coins?: number;
    gems?: number;
    discount?: number;
    multiplier?: number;
  };
  requirements: string[];
  progress: number;
  maxProgress: number;
  startDate: Date;
  endDate: Date;
  claimed: boolean;
}

export default function Promotions() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('daily');
  const [promoCode, setPromoCode] = useState('');
  const [referralCodeCopied, setReferralCodeCopied] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: !!authUser,
  });

  const { data: dailyRewards, isLoading: dailyLoading } = useQuery<DailyReward[]>({
    queryKey: ["/api/promotions/daily-rewards"],
    enabled: !!authUser,
  });

  const { data: loginStreak, isLoading: streakLoading } = useQuery<LoginStreak>({
    queryKey: ["/api/promotions/login-streak"],
    enabled: !!authUser,
  });

  const { data: referralData, isLoading: referralLoading } = useQuery<ReferralData>({
    queryKey: ["/api/promotions/referrals"],
    enabled: !!authUser,
  });

  const { data: activePromotions, isLoading: promotionsLoading } = useQuery<ActivePromotion[]>({
    queryKey: ["/api/promotions/active"],
    enabled: !!authUser,
  });

  const claimDailyRewardMutation = useMutation({
    mutationFn: async (day: number) => {
      return apiRequest("POST", "/api/promotions/claim-daily", { day });
    },
    onSuccess: (data) => {
      toast({
        title: "Reward Claimed!",
        description: `You received ${data.coins} coins${data.gems ? ` and ${data.gems} gems` : ''}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions/daily-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const redeemPromoCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/promotions/redeem-code", { code });
    },
    onSuccess: (data) => {
      toast({
        title: "Code Redeemed!",
        description: data.message,
      });
      setPromoCode('');
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Invalid Code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const claimPromotionMutation = useMutation({
    mutationFn: async (promotionId: number) => {
      return apiRequest("POST", "/api/promotions/claim", { promotionId });
    },
    onSuccess: (data) => {
      toast({
        title: "Promotion Claimed!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyReferralCode = async () => {
    if (referralData?.referralCode) {
      await navigator.clipboard.writeText(referralData.referralCode);
      setReferralCodeCopied(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setReferralCodeCopied(false), 2000);
    }
  };

  const handleClaimDailyReward = (day: number) => {
    claimDailyRewardMutation.mutate(day);
  };

  const handleRedeemPromoCode = () => {
    if (promoCode.trim()) {
      redeemPromoCodeMutation.mutate(promoCode.trim());
    }
  };

  const handleClaimPromotion = (promotionId: number) => {
    claimPromotionMutation.mutate(promotionId);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Promotions</h1>
          <p className="text-gray-400">Please log in to view promotional offers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Promotions & Rewards</h1>
        <p className="text-gray-400 mt-2">Claim daily rewards, invite friends, and redeem special codes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="daily">Daily Rewards</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="codes">Promo Codes</TabsTrigger>
          <TabsTrigger value="events">Special Events</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          {/* Login Streak */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Login Streak
              </CardTitle>
              <CardDescription>
                Keep your streak going to unlock better rewards!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {streakLoading ? (
                <div className="text-center text-gray-400">Loading streak...</div>
              ) : loginStreak ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{loginStreak.currentStreak}</div>
                      <div className="text-sm text-gray-400">Current Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{loginStreak.longestStreak}</div>
                      <div className="text-sm text-gray-400">Best Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{loginStreak.nextRewardDay}</div>
                      <div className="text-sm text-gray-400">Next Reward</div>
                    </div>
                  </div>
                  <Progress value={(loginStreak.currentStreak % 7) * (100 / 7)} className="h-2" />
                </div>
              ) : (
                <div className="text-center text-gray-400">No streak data available</div>
              )}
            </CardContent>
          </Card>

          {/* Daily Rewards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {dailyLoading ? (
              <div className="col-span-full text-center text-gray-400">Loading daily rewards...</div>
            ) : dailyRewards && dailyRewards.length > 0 ? (
              dailyRewards.map((reward) => (
                <Card 
                  key={reward.day} 
                  className={`bg-gray-800 border-gray-700 transition-all cursor-pointer ${
                    reward.available && !reward.claimed 
                      ? 'border-orange-400 shadow-lg shadow-orange-400/20' 
                      : reward.claimed 
                      ? 'opacity-60' 
                      : 'opacity-40'
                  }`}
                  onClick={() => reward.available && !reward.claimed && handleClaimDailyReward(reward.day)}
                >
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm text-white">Day {reward.day}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">{reward.coins}</span>
                    </div>
                    {reward.gems > 0 && (
                      <div className="flex items-center justify-center space-x-2">
                        <Gem className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-medium">{reward.gems}</span>
                      </div>
                    )}
                    {reward.bonus && (
                      <Badge className="text-xs bg-purple-500/20 text-purple-400">
                        {reward.bonus}
                      </Badge>
                    )}
                    {reward.claimed && (
                      <Badge className="text-xs bg-green-500/20 text-green-400">
                        Claimed
                      </Badge>
                    )}
                    {reward.available && !reward.claimed && (
                      <Badge className="text-xs bg-orange-500/20 text-orange-400">
                        Available
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400">No daily rewards available</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Referral Program
              </CardTitle>
              <CardDescription>
                Invite friends and earn rewards when they join and play!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referralLoading ? (
                <div className="text-center text-gray-400">Loading referral data...</div>
              ) : referralData ? (
                <div className="space-y-6">
                  {/* Referral Code */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Your Referral Code</h3>
                        <p className="text-gray-400 text-sm">Share this code with friends to earn rewards</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-600 px-3 py-2 rounded text-white font-mono">
                          {referralData.referralCode}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyReferralCode}
                          className="border-gray-600"
                        >
                          {referralCodeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Referral Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{referralData.referralsCount}</div>
                      <div className="text-sm text-gray-400">Friends Referred</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {formatCurrency(referralData.totalEarnings)}
                      </div>
                      <div className="text-sm text-gray-400">Total Earnings</div>
                    </div>
                  </div>

                  {/* Referral History */}
                  {referralData.referralHistory.length > 0 && (
                    <div>
                      <h3 className="text-white font-medium mb-3">Recent Referrals</h3>
                      <div className="space-y-2">
                        {referralData.referralHistory.slice(0, 5).map((referral) => (
                          <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded">
                            <div>
                              <span className="text-white">{referral.referredUsername}</span>
                              <span className="text-gray-400 text-sm ml-2">
                                {new Date(referral.joinedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400 font-medium">
                                +{formatCurrency(referral.reward)}
                              </span>
                              <Badge 
                                className={`text-xs ${
                                  referral.status === 'completed' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}
                              >
                                {referral.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400">No referral data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-400" />
                Promotional Codes
              </CardTitle>
              <CardDescription>
                Redeem special codes for exclusive rewards and bonuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter promotional code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button 
                    onClick={handleRedeemPromoCode}
                    disabled={!promoCode.trim() || redeemPromoCodeMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {redeemPromoCodeMutation.isPending ? "Redeeming..." : "Redeem"}
                  </Button>
                </div>
                
                {/* Sample Promo Codes Info */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">How to get promo codes:</h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Follow our social media for exclusive codes</li>
                    <li>• Join special events and tournaments</li>
                    <li>• Check your email for promotional offers</li>
                    <li>• Participate in community activities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {promotionsLoading ? (
            <div className="text-center text-gray-400">Loading special events...</div>
          ) : activePromotions && activePromotions.length > 0 ? (
            <div className="space-y-4">
              {activePromotions.map((promotion) => (
                <Card key={promotion.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        {promotion.title}
                      </CardTitle>
                      <Badge 
                        className={`${
                          promotion.type === 'limited_time' 
                            ? 'bg-red-500/20 text-red-400'
                            : promotion.type === 'special_event'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {promotion.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{promotion.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Rewards */}
                    <div className="flex items-center space-x-4">
                      {promotion.reward.coins && (
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-medium">{promotion.reward.coins}</span>
                        </div>
                      )}
                      {promotion.reward.gems && (
                        <div className="flex items-center space-x-1">
                          <Gem className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 font-medium">{promotion.reward.gems}</span>
                        </div>
                      )}
                      {promotion.reward.discount && (
                        <Badge className="bg-green-500/20 text-green-400">
                          {promotion.reward.discount}% Discount
                        </Badge>
                      )}
                      {promotion.reward.multiplier && (
                        <Badge className="bg-orange-500/20 text-orange-400">
                          {promotion.reward.multiplier}x Multiplier
                        </Badge>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Progress</span>
                        <span className="text-white text-sm">
                          {promotion.progress}/{promotion.maxProgress}
                        </span>
                      </div>
                      <Progress 
                        value={(promotion.progress / promotion.maxProgress) * 100} 
                        className="h-2" 
                      />
                    </div>

                    {/* Requirements */}
                    <div>
                      <h4 className="text-white text-sm font-medium mb-2">Requirements:</h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        {promotion.requirements.map((req, index) => (
                          <li key={index}>• {req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Time Remaining */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>
                          Ends {new Date(promotion.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleClaimPromotion(promotion.id)}
                        disabled={promotion.progress < promotion.maxProgress || promotion.claimed}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        {promotion.claimed ? "Claimed" : promotion.progress >= promotion.maxProgress ? "Claim" : "Locked"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-8">
                <Gift className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-white font-medium mb-2">No Active Events</h3>
                <p className="text-gray-400">Check back soon for new special events and promotions!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}