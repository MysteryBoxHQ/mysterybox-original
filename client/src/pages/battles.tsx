import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sword, Users, Trophy, Clock, Plus, Play, Eye, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, getRarityClass } from "@/lib/utils";
import { BattleCreationModal } from "@/components/BattleCreationModal";
import { BattleViewer } from "@/components/BattleViewer";
import type { User, Box } from "@shared/schema";

interface Battle {
  id: number;
  name: string;
  boxId: number;
  boxName?: string;
  createdBy: number;
  status: string;
  maxPlayers: number;
  entryFee: number;
  totalRounds: number;
  box?: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  };
  participants?: Array<{
    id: number;
    userId: number;
    username: string;
    position: number;
    totalValue: number;
  }>;
  rounds?: Array<{
    id: number;
    participantId: number;
    roundNumber: number;
    itemId: number;
    itemName: string;
    itemIcon: string;
    itemRarity: string;
    itemValue: number;
  }>;
  createdAt: string;
}

export default function Battles() {
  const [location] = useLocation();
  const isWhitelabelContext = location.startsWith('/rollingdrop');
  const whitelabelId = isWhitelabelContext ? 'rollingdrop' : null;
  const { toast } = useToast();
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBattleId, setSelectedBattleId] = useState<number | null>(null);
  const [battleViewOpen, setBattleViewOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: boxes = [] } = useQuery<Box[]>({
    queryKey: ["/api/boxes"],
  });

  const { data: battles = [], refetch: refetchBattles } = useQuery<Battle[]>({
    queryKey: ["/api/battles"],
    refetchInterval: 3000,
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to battle WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'battle_created' || data.type === 'battle_started') {
        refetchBattles();
        toast({
          title: data.type === 'battle_created' ? "New Battle Created" : "Battle Started",
          description: `Battle #${data.battleId || data.battle?.id} is now ${data.type === 'battle_created' ? 'available' : 'active'}`,
        });
      }
      
      if (data.type === 'box_opened' && selectedBattleId) {
        queryClient.invalidateQueries({ queryKey: ["/api/battles", selectedBattleId] });
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from battle WebSocket');
    };

    return () => {
      ws.close();
    };
  }, [selectedBattleId, refetchBattles, toast]);

  // Mutations for battle operations
  const createBattleMutation = useMutation({
    mutationFn: async (battleData: any) => {
      return await apiRequest("POST", "/api/battles", battleData);
    },
    onSuccess: () => {
      toast({
        title: "Battle Created",
        description: "Your battle has been created and is waiting for players",
      });
      setCreateDialogOpen(false);
      refetchBattles();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create battle",
        variant: "destructive",
      });
    },
  });

  const joinBattleMutation = useMutation({
    mutationFn: async (battleId: number) => {
      return await apiRequest("POST", `/api/battles/${battleId}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Joined Battle",
        description: "You have successfully joined the battle",
      });
      refetchBattles();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join battle",
        variant: "destructive",
      });
    },
  });



  const handleCreateBattle = (battleData: any) => {
    createBattleMutation.mutate(battleData);
  };

  const handleJoinBattle = (battleId: number) => {
    joinBattleMutation.mutate(battleId);
  };

  const handleViewBattle = (battle: Battle) => {
    setSelectedBattleId(battle.id);
    setBattleViewOpen(true);
  };

  const renderBattleCard = (battle: Battle) => {
    const currentPlayers = battle.participants?.length || 0;
    const isJoinable = battle.status === "waiting" && currentPlayers < battle.maxPlayers;
    const isCreator = user && battle.createdBy === user.id;
    const alreadyJoined = user && battle.participants?.some(p => p.userId === user.id);
    const canJoin = user && !isCreator && !alreadyJoined && isJoinable;
    
    // Mock case images for display (in production these would come from the box data)
    const caseImages = Array.from({ length: battle.totalRounds }, (_, i) => ({
      id: i,
      image: battle.box?.imageUrl || '/api/cdn/images/1748957219599_xbox.webp',
      opened: i < (battle.rounds?.length || 0)
    }));

    const gameMode = battle.maxPlayers === 2 ? 'DUEL' : 
                    battle.maxPlayers === 3 ? 'GROUP' : 
                    battle.maxPlayers === 4 ? 'SQUAD' : 'JACKPOT';

    return (
      <div key={battle.id} className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Player avatars */}
            <div className="flex items-center gap-1">
              {Array.from({ length: battle.maxPlayers }).map((_, i) => {
                const participant = battle.participants?.[i];
                return (
                  <div key={i} className="relative">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      participant 
                        ? isCreator && i === 0 ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-green-500 border-green-400 text-white'
                        : 'bg-gray-600 border-gray-500 text-gray-400'
                    }`}>
                      {participant ? participant.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    {participant && isCreator && i === 0 && (
                      <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Game mode badge */}
            <Badge variant="outline" className="text-xs bg-gray-700 border-gray-600">
              {gameMode}
            </Badge>
          </div>

          {/* Round progress */}
          <div className="text-sm text-gray-400">
            {battle.rounds?.length || 0} / {battle.totalRounds} Rounds
          </div>
        </div>

        {/* Case images */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          {caseImages.map((caseImg, i) => (
            <div key={i} className="relative flex-shrink-0">
              <div className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${
                caseImg.opened ? 'border-green-500' : 'border-gray-600'
              }`}>
                <img 
                  src={caseImg.image} 
                  alt={`Case ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {caseImg.opened && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-gray-800"></div>
              )}
            </div>
          ))}
        </div>

        {/* Battle info and actions */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {formatCurrency(battle.entryFee * battle.maxPlayers)}
            </div>
            <div className="text-xs text-gray-400">Battle Price</div>
          </div>

          <Button 
            onClick={() => canJoin ? handleJoinBattle(battle.id) : handleViewBattle(battle)}
            disabled={joinBattleMutation.isPending}
            variant={canJoin ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {canJoin ? 'Join Battle' : 'View Battle'}
          </Button>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Case Battles</h1>
          <p className="text-muted-foreground">Please log in to participate in battles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Case Battles</h1>
          <p className="text-muted-foreground">Compete with other players in real-time case opening battles</p>
        </div>
        
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Battle
        </Button>
      </div>

      {battles.length === 0 ? (
        <div className="text-center py-12">
          <Sword className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Battles</h3>
          <p className="text-muted-foreground mb-4">Be the first to create a battle and challenge other players</p>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Battle
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {battles.map(renderBattleCard)}
        </div>
      )}

      {/* Battle Creation Modal */}
      <BattleCreationModal 
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateBattle={handleCreateBattle}
        isCreating={createBattleMutation.isPending}
      />

      {/* Enhanced Battle Viewer */}
      <BattleViewer 
        isOpen={battleViewOpen}
        onClose={() => setBattleViewOpen(false)}
        battleId={selectedBattleId}
      />
    </div>
  );
}