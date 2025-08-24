import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Package, DollarSign, Trophy } from "lucide-react";

interface StatsWidgetProps {
  apiKey?: string;
  userId?: string;
  theme?: 'light' | 'dark';
  compact?: boolean;
  onError?: (error: string) => void;
}

interface UserStats {
  totalCasesOpened: number;
  totalSpent: number;
  rareItemsFound: number;
  totalValue: number;
  level: number;
  experience: number;
  loginStreak: number;
  achievements: number;
}

export function StatsWidget({ 
  apiKey,
  userId,
  theme = 'light', 
  compact = false,
  onError 
}: StatsWidgetProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [apiKey, userId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const headers = apiKey ? { 'X-API-Key': apiKey } : {};
      const endpoint = userId ? `/api/v1/users/${userId}/stats` : '/api/user/stats';
      const response = await fetch(endpoint, { headers });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      onError?.('Failed to load user statistics');
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-200';

  const statCardTheme = theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';

  if (loading) {
    return (
      <Card className={`${themeClasses} max-w-md mx-auto`}>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading statistics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={`${themeClasses} max-w-md mx-auto`}>
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No statistics available</p>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    { label: 'Cases Opened', value: stats.totalCasesOpened, icon: Package, color: 'text-blue-600' },
    { label: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Rare Items', value: stats.rareItemsFound, icon: Trophy, color: 'text-yellow-600' },
    { label: 'Total Value', value: `$${stats.totalValue.toFixed(2)}`, icon: TrendingUp, color: 'text-purple-600' },
  ];

  return (
    <Card className={`${themeClasses} ${compact ? 'max-w-md' : 'max-w-2xl'} mx-auto`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Player Statistics
          </div>
          {!compact && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Level {stats.level}
              </Badge>
              <Badge variant="outline">
                {stats.loginStreak} day streak
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-3`}>
          {statItems.map((stat, index) => (
            <Card key={index} className={statCardTheme}>
              <CardContent className="p-3 text-center">
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs opacity-75">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {!compact && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Card className={statCardTheme}>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.level}</div>
                <p className="text-sm opacity-75">Player Level</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(stats.experience % 1000) / 10}%` }}
                  ></div>
                </div>
                <p className="text-xs opacity-75 mt-1">
                  {stats.experience % 1000}/1000 XP
                </p>
              </CardContent>
            </Card>

            <Card className={statCardTheme}>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.achievements}</div>
                <p className="text-sm opacity-75">Achievements</p>
                <div className="flex justify-center mt-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}