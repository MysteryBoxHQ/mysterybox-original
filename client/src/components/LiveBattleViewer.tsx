import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Trophy, Clock, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BattleParticipant {
  id: number;
  userId: number;
  username: string;
  position: number;
  totalValue: number;
  isEliminated: boolean;
  roundItems: Array<{
    round: number;
    item: any;
    value: number;
  }>;
}

interface BattleState {
  id: number;
  currentRound: number;
  totalRounds: number;
  status: 'waiting' | 'active' | 'finished';
  participants: BattleParticipant[];
  winnerId: number | null;
  roundHistory: Array<{
    round: number;
    openings: Array<{
      participantId: number;
      item: any;
      value: number;
    }>;
  }>;
}

interface LiveBattleViewerProps {
  battleId: number;
  onClose?: () => void;
}

export function LiveBattleViewer({ battleId, onClose }: LiveBattleViewerProps) {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [roundAnimating, setRoundAnimating] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial battle state
    fetchBattleState();
    
    // Connect to WebSocket for real-time updates
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [battleId]);

  const fetchBattleState = async () => {
    try {
      const response = await fetch(`/api/battles/${battleId}`);
      if (response.ok) {
        const battle = await response.json();
        setBattleState(battle);
      }
    } catch (error) {
      console.error('Failed to fetch battle state:', error);
      toast({
        title: "Connection Error",
        description: "Failed to load battle information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setConnected(true);
        // Subscribe to battle updates
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe_battle',
          battleId
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      wsRef.current.onclose = () => {
        setConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.event) {
      case 'battle_state':
        setBattleState(message.data);
        break;
        
      case 'battle_started':
        setBattleState(message.data);
        toast({
          title: "Battle Started!",
          description: "Get ready for epic box openings!"
        });
        break;
        
      case 'round_starting':
        setRoundAnimating(true);
        toast({
          title: `Round ${message.data.round}`,
          description: `Opening boxes... (${message.data.round}/${message.data.totalRounds})`
        });
        break;
        
      case 'round_completed':
        setRoundAnimating(false);
        // Update battle state with new round results
        setBattleState(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            currentRound: message.data.round,
            participants: message.data.participants.map((p: any) => {
              const existing = prev.participants.find(ep => ep.id === p.id);
              return existing ? { ...existing, ...p } : p;
            })
          };
        });
        break;
        
      case 'battle_finished':
        setBattleState(prev => prev ? { ...prev, status: 'finished', winnerId: message.data.winner.userId } : prev);
        toast({
          title: "Battle Complete!",
          description: `${message.data.winner.username} wins with $${message.data.winner.totalValue.toFixed(2)}!`,
          duration: 5000
        });
        break;
        
      case 'battle_force_stopped':
        toast({
          title: "Battle Stopped",
          description: message.data.reason,
          variant: "destructive"
        });
        break;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      case 'mythical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'finished': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading battle...</span>
      </div>
    );
  }

  if (!battleState) {
    return (
      <div className="text-center py-8">
        <p>Battle not found</p>
        <Button onClick={onClose} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const progress = (battleState.currentRound / battleState.totalRounds) * 100;
  const sortedParticipants = [...battleState.participants].sort((a, b) => b.totalValue - a.totalValue);

  return (
    <div className="space-y-6">
      {/* Battle Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Live Battle #{battleState.id}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={getStatusColor(battleState.status)}>
                {battleState.status.toUpperCase()}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {battleState.participants.length} Players
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Round {battleState.currentRound}/{battleState.totalRounds}
              </span>
              {!connected && (
                <Badge variant="destructive">Disconnected</Badge>
              )}
            </div>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>Close</Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Battle Progress</span>
              <span>{battleState.currentRound}/{battleState.totalRounds} rounds</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Participants</h3>
        {sortedParticipants.map((participant, index) => (
          <Card key={participant.id} className={`${participant.isEliminated ? 'opacity-50' : ''} ${battleState.winnerId === participant.userId ? 'ring-2 ring-yellow-500' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {index === 0 && battleState.status === 'finished' && (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    )}
                    <Avatar>
                      <AvatarFallback>
                        {participant.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-medium">{participant.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Position #{index + 1}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold">
                    ${participant.totalValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {participant.roundItems.length} items
                  </p>
                </div>
              </div>

              {/* Recent Items */}
              {participant.roundItems.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Recent Items:</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {participant.roundItems.slice(-5).map((roundItem, idx) => (
                      <div key={idx} className="flex-shrink-0 p-2 bg-muted rounded-lg min-w-[100px]">
                        <div className={`w-2 h-2 rounded-full ${getRarityColor(roundItem.item.rarity)} mb-1`}></div>
                        <p className="text-xs font-medium truncate">{roundItem.item.name}</p>
                        <p className="text-xs text-muted-foreground">${roundItem.value.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Round Animation */}
      {roundAnimating && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="font-medium">Opening boxes for round {battleState.currentRound}...</p>
            <p className="text-sm text-muted-foreground">Results coming soon!</p>
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <div className="text-center text-sm text-muted-foreground">
        {connected ? (
          <span className="text-green-600">● Connected to live updates</span>
        ) : (
          <span className="text-red-600">● Reconnecting...</span>
        )}
      </div>
    </div>
  );
}