import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Swords, Users, Trophy, Clock, Plus, Eye } from "lucide-react";
import { LiveBattleViewer } from "@/components/LiveBattleViewer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BattlesWidgetProps {
  apiKey?: string;
  theme?: 'light' | 'dark';
  compact?: boolean;
  onJoinBattle?: (battleId: number) => void;
  onCreateBattle?: () => void;
  onError?: (message: string) => void;
}

interface Battle {
  id: number;
  status: 'waiting' | 'active' | 'finished';
  currentRound: number;
  totalRounds: number;
  maxPlayers: number;
  entryFee: number;
  participants: Array<{
    id: number;
    username: string;
    totalValue: number;
  }>;
  createdBy: number;
  box: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  };
}

export function BattlesWidget({ 
  apiKey,
  theme = 'light', 
  compact = false,
  onJoinBattle,
  onCreateBattle,
  onError 
}: BattlesWidgetProps) {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [joining, setJoining] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewingBattle, setViewingBattle] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [boxes, setBoxes] = useState<any[]>([]);
  const [newBattle, setNewBattle] = useState({
    boxId: '',
    maxPlayers: 2,
    totalRounds: 5,
    entryFee: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBattles();
    fetchBoxes();
  }, [activeTab]);

  const fetchBattles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/battles?status=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setBattles(data);
      }
    } catch (error) {
      onError?.('Failed to load battles');
      console.error('Failed to fetch battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoxes = async () => {
    try {
      const response = await fetch('/api/boxes');
      if (response.ok) {
        const data = await response.json();
        setBoxes(data);
      }
    } catch (error) {
      console.error('Failed to fetch boxes:', error);
    }
  };

  const handleCreateBattle = async () => {
    if (!newBattle.boxId) {
      toast({
        title: "Validation Error",
        description: "Please select a box for the battle",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      await apiRequest('POST', '/api/battles', {
        boxId: parseInt(newBattle.boxId),
        maxPlayers: newBattle.maxPlayers,
        totalRounds: newBattle.totalRounds,
        entryFee: newBattle.entryFee
      });
      
      toast({
        title: "Battle Created!",
        description: "Your battle is now waiting for players to join",
      });
      
      setCreateDialogOpen(false);
      setNewBattle({ boxId: '', maxPlayers: 2, totalRounds: 5, entryFee: 0 });
      fetchBattles();
      onCreateBattle?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create battle",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinBattle = async (battleId: number) => {
    setJoining(battleId);
    try {
      await apiRequest('POST', `/api/battles/${battleId}/join`);
      
      toast({
        title: "Joined Battle!",
        description: "You've successfully joined the battle",
      });
      
      fetchBattles();
      onJoinBattle?.(battleId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join battle",
        variant: "destructive"
      });
    } finally {
      setJoining(null);
    }
  };

  if (viewingBattle) {
    return (
      <LiveBattleViewer 
        battleId={viewingBattle} 
        onClose={() => setViewingBattle(null)}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'finished': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} ${compact ? 'text-sm' : ''}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5" />
            Live Battles
          </CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Battle
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="waiting">Waiting</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="finished">Finished</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : battles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {activeTab} battles found
                </div>
              ) : (
                <div className="space-y-4">
                  {battles.map((battle) => (
                    <Card key={battle.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              {battle.box.imageUrl ? (
                                <img 
                                  src={battle.box.imageUrl} 
                                  alt={battle.box.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Swords className="h-6 w-6" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{battle.box.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge className={getStatusColor(battle.status)}>
                                  {battle.status.toUpperCase()}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {battle.participants.length}/{battle.maxPlayers}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {battle.currentRound}/{battle.totalRounds} rounds
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {battle.status === 'waiting' && battle.participants.length < battle.maxPlayers && (
                              <Button
                                size="sm"
                                onClick={() => handleJoinBattle(battle.id)}
                                disabled={joining === battle.id}
                              >
                                {joining === battle.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Join Battle'
                                )}
                              </Button>
                            )}
                            
                            {(battle.status === 'active' || battle.status === 'finished') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingBattle(battle.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {battle.status === 'active' ? 'Watch Live' : 'View Results'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {battle.status === 'active' && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Round Progress</span>
                              <span>{battle.currentRound}/{battle.totalRounds}</span>
                            </div>
                            <Progress 
                              value={(battle.currentRound / battle.totalRounds) * 100} 
                              className="h-1"
                            />
                          </div>
                        )}

                        {battle.participants.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-muted-foreground mb-2">Participants:</div>
                            <div className="flex gap-2 overflow-x-auto">
                              {battle.participants.map((participant) => (
                                <div key={participant.id} className="flex-shrink-0 bg-muted rounded px-2 py-1 text-xs">
                                  {participant.username}
                                  {battle.status !== 'waiting' && (
                                    <span className="ml-1 text-muted-foreground">
                                      ${participant.totalValue?.toFixed(2) || '0.00'}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Battle Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Battle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="box">Select Box</Label>
              <Select value={newBattle.boxId} onValueChange={(value) => setNewBattle({...newBattle, boxId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a box for the battle" />
                </SelectTrigger>
                <SelectContent>
                  {boxes.map((box) => (
                    <SelectItem key={box.id} value={box.id.toString()}>
                      {box.name} - ${box.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxPlayers">Max Players</Label>
                <Select 
                  value={newBattle.maxPlayers.toString()} 
                  onValueChange={(value) => setNewBattle({...newBattle, maxPlayers: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Players</SelectItem>
                    <SelectItem value="3">3 Players</SelectItem>
                    <SelectItem value="4">4 Players</SelectItem>
                    <SelectItem value="5">5 Players</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="totalRounds">Total Rounds</Label>
                <Select 
                  value={newBattle.totalRounds.toString()} 
                  onValueChange={(value) => setNewBattle({...newBattle, totalRounds: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Rounds</SelectItem>
                    <SelectItem value="5">5 Rounds</SelectItem>
                    <SelectItem value="7">7 Rounds</SelectItem>
                    <SelectItem value="10">10 Rounds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="entryFee">Entry Fee ($)</Label>
              <Input
                id="entryFee"
                type="number"
                value={newBattle.entryFee}
                onChange={(e) => setNewBattle({...newBattle, entryFee: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBattle} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Battle'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}