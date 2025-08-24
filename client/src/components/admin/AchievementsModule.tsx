import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Star,
  Target,
  Award,
  Coins,
  Diamond
} from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';
  requirement: number;
  rewardCoins: number;
  rewardGems: number;
  active: boolean;
  createdAt: string;
}

interface AchievementProgress {
  achievementId: number;
  userId: number;
  progress: number;
  completed: boolean;
  rewardClaimed: boolean;
  completedAt?: string;
}

export default function AchievementsModule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [newAchievement, setNewAchievement] = useState({
    name: '',
    description: '',
    icon: '',
    rarity: 'common' as const,
    requirement: 1,
    rewardCoins: 100,
    rewardGems: 0,
    active: true
  });

  // Fetch achievements
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['/api/admin/achievements'],
  });

  // Fetch achievement statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/achievement-stats'],
  });

  // Create achievement mutation
  const createAchievementMutation = useMutation({
    mutationFn: async (achievement: typeof newAchievement) => {
      await apiRequest("POST", "/api/admin/achievements", achievement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/achievement-stats'] });
      toast({ title: "Achievement created successfully" });
      setShowCreateModal(false);
      setNewAchievement({
        name: '',
        description: '',
        icon: '',
        rarity: 'common',
        requirement: 1,
        rewardCoins: 100,
        rewardGems: 0,
        active: true
      });
    },
  });

  // Update achievement mutation
  const updateAchievementMutation = useMutation({
    mutationFn: async ({ id, ...achievement }: Achievement) => {
      await apiRequest("PUT", `/api/admin/achievements/${id}`, achievement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/achievements'] });
      toast({ title: "Achievement updated successfully" });
      setEditingAchievement(null);
    },
  });

  // Delete achievement mutation
  const deleteAchievementMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/achievements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/achievement-stats'] });
      toast({ title: "Achievement deleted successfully" });
    },
  });

  // Reset progress mutation
  const resetProgressMutation = useMutation({
    mutationFn: async ({ achievementId, userId }: { achievementId: number; userId?: number }) => {
      await apiRequest("POST", "/api/admin/achievements/reset-progress", { achievementId, userId });
    },
    onSuccess: () => {
      toast({ title: "Achievement progress reset successfully" });
    },
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

  const handleCreateAchievement = () => {
    createAchievementMutation.mutate(newAchievement);
  };

  const handleUpdateAchievement = (achievement: Achievement) => {
    updateAchievementMutation.mutate(achievement);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Achievements Management</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Achievements Management</h2>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Achievement
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Achievements</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAchievements}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed Today</p>
                  <p className="text-2xl font-bold text-white">{stats.completedToday}</p>
                </div>
                <Star className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Players</p>
                  <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Achievements List */}
      <div className="grid gap-4">
        {achievements.map((achievement: Achievement) => (
          <Card key={achievement.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      {achievement.name}
                      <Badge className={`${getRarityColor(achievement.rarity)} text-white capitalize`}>
                        {achievement.rarity}
                      </Badge>
                      {!achievement.active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {achievement.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditingAchievement(achievement)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteAchievementMutation.mutate(achievement.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Requirement:
                  </span>
                  <p className="text-white font-semibold">{achievement.requirement}</p>
                </div>
                <div>
                  <span className="text-gray-400 flex items-center">
                    <Coins className="w-4 h-4 mr-1" />
                    Coins Reward:
                  </span>
                  <p className="text-yellow-400 font-semibold">{achievement.rewardCoins}</p>
                </div>
                <div>
                  <span className="text-gray-400 flex items-center">
                    <Diamond className="w-4 h-4 mr-1" />
                    Gems Reward:
                  </span>
                  <p className="text-blue-400 font-semibold">{achievement.rewardGems}</p>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <p className="text-white">{new Date(achievement.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => resetProgressMutation.mutate({ achievementId: achievement.id })}
                >
                  Reset All Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Achievement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Create New Achievement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Name</Label>
                <Input
                  value={newAchievement.name}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Achievement name"
                />
              </div>
              
              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Achievement description"
                />
              </div>
              
              <div>
                <Label className="text-white">Icon (Emoji)</Label>
                <Input
                  value={newAchievement.icon}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, icon: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="🏆"
                />
              </div>
              
              <div>
                <Label className="text-white">Rarity</Label>
                <Select 
                  value={newAchievement.rarity} 
                  onValueChange={(value) => setNewAchievement(prev => ({ ...prev, rarity: value as any }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                    <SelectItem value="mythical">Mythical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-white">Requirement</Label>
                  <Input
                    type="number"
                    value={newAchievement.requirement}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, requirement: parseInt(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Coins</Label>
                  <Input
                    type="number"
                    value={newAchievement.rewardCoins}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, rewardCoins: parseInt(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Gems</Label>
                  <Input
                    type="number"
                    value={newAchievement.rewardGems}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, rewardGems: parseInt(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newAchievement.active}
                  onCheckedChange={(checked) => setNewAchievement(prev => ({ ...prev, active: checked }))}
                />
                <Label className="text-white">Active</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateAchievement} className="flex-1">
                  Create Achievement
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}