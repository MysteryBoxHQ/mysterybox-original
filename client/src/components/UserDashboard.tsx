import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Target, ArrowRight, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { User, UserMission, Mission } from "@shared/schema";

interface UserDashboardProps {
  user: User;
  nextMission?: Mission & { progress: number };
  totalMissionsLeft: number;
}

export function UserDashboard({ user, nextMission, totalMissionsLeft }: UserDashboardProps) {
  const getProgressPercentage = () => {
    if (!nextMission) return 0;
    return Math.min((nextMission.progress / parseFloat(nextMission.target)) * 100, 100);
  };

  const formatAmount = (amount: string | number | undefined | null) => {
    if (amount === undefined || amount === null) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 text-sm">Welcome Back</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-lg">{user.username}</span>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {user.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span>${formatAmount(user.usdBalance)} played</span>
                  <span>
                    ${nextMission ? formatAmount(nextMission.target) : "0.00"} needed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Available Rewards Section */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">
                {parseFloat(user.totalEarned || '0') > 0 ? "Total earned" : "0 Total earned"}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-3">
              ${formatAmount(user.totalEarned)}
            </div>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={parseFloat(user.totalEarned || '0') === 0}
            >
              Go to rewards
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Next Mission Section */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="text-gray-400 text-sm">Next mission</span>
            </div>
            <div className="text-white font-semibold mb-1">
              {nextMission ? nextMission.title : "No active missions"}
            </div>
            <div className="text-sm text-gray-400 mb-3">
              {totalMissionsLeft} more missions left
            </div>
            {nextMission && (
              <div className="mb-3">
                <Progress 
                  value={getProgressPercentage()} 
                  className="h-2 bg-slate-700"
                />
                <div className="text-xs text-gray-400 mt-1">
                  ${formatAmount(nextMission.progress)} / ${formatAmount(nextMission.target)}
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full text-gray-300 border-slate-600 hover:bg-slate-700"
              disabled={!nextMission}
            >
              View next mission
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}