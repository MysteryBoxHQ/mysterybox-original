import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Package, 
  Trophy, 
  DollarSign, 
  Users, 
  Target,
  BarChart3,
  Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PlatformStats {
  totalUsers: number;
  totalBoxesOpened: number;
  totalRevenue: string;
  totalItemsDropped: number;
  averageBoxValue: string;
  popularBoxes: Array<{
    id: number;
    name: string;
    openCount: number;
    revenue: string;
  }>;
  rarityDistribution: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
    mythical: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    value?: string;
  }>;
}

interface UserStats {
  totalSpent: string;
  totalBoxesOpened: number;
  itemsCollected: number;
  favoriteRarity: string;
  luckiestDrop: {
    itemName: string;
    rarity: string;
    value: string;
  };
  spendingTrend: Array<{
    date: string;
    amount: number;
  }>;
}

export default function Statistics() {
  const { data: platformStats, isLoading: platformLoading } = useQuery<PlatformStats>({
    queryKey: ["/api/stats/platform"],
  });

  const { data: userStats, isLoading: userLoading } = useQuery<UserStats>({
    queryKey: ["/api/stats/user"],
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      case 'mythical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      case 'mythical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (platformLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Statistics</h1>
            <p className="text-gray-400">Platform and user analytics</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-slate-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Statistics</h1>
          <p className="text-gray-400">Comprehensive platform and user analytics</p>
        </div>

        <Tabs defaultValue="platform" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="platform">Platform Stats</TabsTrigger>
            <TabsTrigger value="personal">Personal Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-white">
                        {platformStats?.totalUsers?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Boxes Opened</p>
                      <p className="text-2xl font-bold text-white">
                        {platformStats?.totalBoxesOpened?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        ${formatCurrency(parseFloat(platformStats?.totalRevenue || '0'))}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Items Dropped</p>
                      <p className="text-2xl font-bold text-white">
                        {platformStats?.totalItemsDropped?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rarity Distribution */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Item Rarity Distribution
                </CardTitle>
                <CardDescription>Distribution of dropped items by rarity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformStats?.rarityDistribution && Object.entries(platformStats.rarityDistribution).map(([rarity, count]) => {
                    const total = Object.values(platformStats.rarityDistribution).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                      <div key={rarity} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getRarityColor(rarity)}`}></div>
                            <span className={`font-medium capitalize ${getRarityTextColor(rarity)}`}>
                              {rarity}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Popular Boxes */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Most Popular Boxes
                </CardTitle>
                <CardDescription>Top performing mystery boxes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformStats?.popularBoxes?.map((box, index) => (
                    <div key={box.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-white">{box.name}</p>
                          <p className="text-sm text-gray-400">{box.openCount} opens</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-400">${formatCurrency(parseFloat(box.revenue))}</p>
                        <p className="text-xs text-gray-400">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            {/* Personal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Spent</p>
                      <p className="text-2xl font-bold text-white">
                        ${formatCurrency(parseFloat(userStats?.totalSpent || '0'))}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Boxes Opened</p>
                      <p className="text-2xl font-bold text-white">
                        {userStats?.totalBoxesOpened || 0}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Items Collected</p>
                      <p className="text-2xl font-bold text-white">
                        {userStats?.itemsCollected || 0}
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Luckiest Drop */}
            {userStats?.luckiestDrop && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Luckiest Drop
                  </CardTitle>
                  <CardDescription>Your most valuable item received</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
                    <div>
                      <p className="font-medium text-white">{userStats.luckiestDrop.itemName}</p>
                      <Badge className={getRarityColor(userStats.luckiestDrop.rarity)}>
                        {userStats.luckiestDrop.rarity}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-400">
                        ${formatCurrency(parseFloat(userStats.luckiestDrop.value))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}