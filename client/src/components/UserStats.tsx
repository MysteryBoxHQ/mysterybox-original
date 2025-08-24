import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Package, Trophy, Target } from "lucide-react";
import type { UserStats } from "@shared/schema";

export default function UserStats() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  if (isLoading || !stats) {
    return null;
  }

  const statCards = [
    {
      title: "Cases Opened",
      value: stats.totalCasesOpened,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Rare Items",
      value: stats.rareItemsFound,
      icon: Trophy,
      color: "text-yellow-500",
    },
    {
      title: "Login Streak",
      value: `${stats.loginStreak} days`,
      icon: Target,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="glass-effect border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}