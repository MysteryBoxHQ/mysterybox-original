import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Gift, Calendar, Star } from "lucide-react";
import type { DailyReward } from "@shared/schema";

export default function DailyRewards() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards = [], isLoading } = useQuery<DailyReward[]>({
    queryKey: ["/api/daily-rewards"],
    enabled: isOpen,
  });

  const { data: loginStreak = 0 } = useQuery<number>({
    queryKey: ["/api/user/login-streak"],
    enabled: isOpen,
  });

  const claimRewardMutation = useMutation({
    mutationFn: (day: number) => 
      apiRequest("POST", `/api/daily-rewards/claim`, { day }).then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: "Reward Claimed!",
        description: `You received ${formatCurrency(data.coins)}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim reward",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="glass-effect border-white/20 hover:border-white/30"
        variant="outline"
      >
        <Gift className="w-4 h-4 mr-2" />
        Daily Rewards
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl glass-effect border border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Daily Rewards
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Current Streak: {loginStreak} days
              </span>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-7 gap-3 mt-4">
            {rewards.map((reward) => (
              <Card
                key={reward.day}
                className={`glass-effect transition-all duration-200 ${
                  reward.claimed
                    ? "border-green-500/50 bg-green-500/10"
                    : reward.day <= loginStreak
                    ? "border-primary/50 hover:border-primary cursor-pointer"
                    : "border-white/10 opacity-50"
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      Day {reward.day}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(reward.coins)}
                    </div>
                    {reward.gems > 0 && (
                      <div className="text-sm text-purple-400">
                        {reward.gems} Gems
                      </div>
                    )}
                  </div>

                  {reward.claimed ? (
                    <Badge className="mt-2 bg-green-500">Claimed</Badge>
                  ) : reward.day <= loginStreak ? (
                    <Button
                      size="sm"
                      onClick={() => claimRewardMutation.mutate(reward.day)}
                      disabled={claimRewardMutation.isPending}
                      className="mt-2 w-full"
                    >
                      Claim
                    </Button>
                  ) : (
                    <Badge variant="outline" className="mt-2">
                      Locked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              Log in daily to maintain your streak and unlock bigger rewards!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}