import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Gem, Award } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { LeaderboardEntry } from "@shared/schema";

export default function Leaderboards() {
  const [location] = useLocation();
  const isWhitelabelContext = location.startsWith('/rollingdrop');
  const whitelabelId = isWhitelabelContext ? 'rollingdrop' : null;
  const { data: casesLeaderboard = [], isLoading: casesLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/cases"],
  });

  const { data: spendingLeaderboard = [], isLoading: spendingLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/spending"],
  });

  const { data: rareItemsLeaderboard = [], isLoading: rareLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/rare_items"],
  });

  const renderLeaderboard = (data: LeaderboardEntry[], isLoading: boolean, type: 'cases' | 'spending' | 'rare_items') => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-slate-700 rounded w-12"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Data Yet</h3>
          <p className="text-slate-400">Be the first to appear on the leaderboard!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.map((entry) => (
          <Card key={entry.rank} className={`border-slate-700 transition-all duration-300 hover:scale-105 ${
            entry.rank === 1 
              ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-yellow-600/50' 
              : entry.rank === 2 
              ? 'bg-gradient-to-r from-gray-700/30 to-gray-600/30 border-gray-500/50'
              : entry.rank === 3
              ? 'bg-gradient-to-r from-orange-900/30 to-orange-800/30 border-orange-600/50'
              : 'bg-slate-800/50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  entry.rank === 1 
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' 
                    : entry.rank === 2 
                    ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900'
                    : entry.rank === 3
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900'
                    : 'bg-slate-700 text-white'
                }`}>
                  {entry.rank <= 3 ? (
                    <Trophy className="w-5 h-5" />
                  ) : (
                    entry.rank
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg">{entry.username}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    {entry.totalCasesOpened !== undefined && (
                      <span>Cases: {entry.totalCasesOpened}</span>
                    )}
                    {entry.totalSpent !== undefined && (
                      <span>Spent: {formatCurrency(entry.totalSpent)}</span>
                    )}
                    {entry.rareItemsFound !== undefined && (
                      <span>Rare Items: {entry.rareItemsFound}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant="outline" className={`text-lg px-3 py-1 ${
                    entry.rank === 1 
                      ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' 
                      : entry.rank === 2 
                      ? 'border-gray-400 text-gray-300 bg-gray-400/10'
                      : entry.rank === 3
                      ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                      : 'border-slate-500 text-slate-300 bg-slate-500/10'
                  }`}>
                    {type === 'spending' ? formatCurrency((entry.value / 100).toFixed(2)) : entry.value}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Leaderboards</h1>
          <p className="text-slate-300 text-lg">
            See how you rank against other players
          </p>
        </div>

        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
            <TabsTrigger 
              value="cases" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Cases Opened
            </TabsTrigger>
            <TabsTrigger 
              value="spending" 
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Gem className="w-4 h-4" />
              Total Spent
            </TabsTrigger>
            <TabsTrigger 
              value="rare_items" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Rare Items
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Most Cases Opened
                </CardTitle>
                <CardDescription>
                  Players who have opened the most cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderLeaderboard(casesLeaderboard, casesLoading, 'cases')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spending" className="mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gem className="w-5 h-5 text-green-400" />
                  Biggest Spenders
                </CardTitle>
                <CardDescription>
                  Players who have spent the most currency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderLeaderboard(spendingLeaderboard, spendingLoading, 'spending')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rare_items" className="mt-6">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Rare Item Hunters
                </CardTitle>
                <CardDescription>
                  Players who have found the most rare items
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderLeaderboard(rareItemsLeaderboard, rareLoading, 'rare_items')}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}