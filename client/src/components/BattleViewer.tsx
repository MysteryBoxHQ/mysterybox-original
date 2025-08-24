import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Crown, Trophy, Users, Clock, Coins } from "lucide-react";
import { formatCurrency, getRarityClass } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface BattleViewerProps {
  isOpen: boolean;
  onClose: () => void;
  battleId: number | null;
}

interface BattleRound {
  id: number;
  participantId: number;
  roundNumber: number;
  itemId: number;
  itemName: string;
  itemIcon: string;
  itemRarity: string;
  itemValue: number;
}

interface BattleParticipant {
  id: number;
  userId: number;
  username: string;
  position: number;
  totalValue: number;
}

interface BattleDetails {
  id: number;
  name: string;
  boxId: number;
  boxName: string;
  createdBy: number;
  status: string;
  maxPlayers: number;
  entryFee: number;
  totalRounds: number;
  participants: BattleParticipant[];
  rounds: BattleRound[];
  createdAt: string;
}

export function BattleViewer({ isOpen, onClose, battleId }: BattleViewerProps) {
  const [selectedRound, setSelectedRound] = useState(1);

  const { data: battle, isLoading } = useQuery({
    queryKey: ["/api/battles", battleId],
    enabled: isOpen && !!battleId,
    refetchInterval: 2000,
  }) as { data: BattleDetails | undefined, isLoading: boolean };

  const currentRoundData = battle?.rounds?.filter(r => r.roundNumber === selectedRound) || [];
  const maxRounds = battle?.totalRounds || 0;
  const currentRound = battle?.rounds?.length ? Math.max(...battle.rounds.map(r => r.roundNumber)) : 0;
  const progress = maxRounds > 0 ? (currentRound / maxRounds) * 100 : 0;

  // Get winner for completed battles
  const winner = battle?.status === "completed" && battle?.participants?.length > 0
    ? battle.participants.reduce((prev, current) => 
        (prev.totalValue > current.totalValue) ? prev : current
      )
    : null;

  const gameMode = battle?.maxPlayers === 2 ? 'DUEL' : 
                  battle?.maxPlayers === 3 ? 'GROUP' : 
                  battle?.maxPlayers === 4 ? 'SQUAD' : 'JACKPOT';

  if (!battle && !isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gray-900 border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <DialogTitle className="text-xl text-white flex items-center gap-3">
                  <span className="text-yellow-400 font-bold">{gameMode}</span>
                  <span className="text-gray-400">•</span>
                  <span>Box {selectedRound} of {maxRounds}</span>
                </DialogTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Battle Value: {formatCurrency((battle?.entryFee || 0) * (battle?.maxPlayers || 0))}
                </p>
              </div>
            </div>
            
            {battle?.status === "active" && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Progress</span>
              <span>{currentRound}/{maxRounds} rounds</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Round selector */}
          <div className="flex items-center justify-center gap-2 py-4 border-b border-gray-700">
            {Array.from({ length: maxRounds }, (_, i) => i + 1).map((round) => (
              <Button
                key={round}
                variant={selectedRound === round ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRound(round)}
                disabled={!battle?.rounds?.some(r => r.roundNumber === round)}
                className={`w-12 h-12 rounded-full ${
                  selectedRound === round 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {round}
              </Button>
            ))}
          </div>

          {/* Player results grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentRoundData.length > 0 ? (
              <div className="grid gap-6">
                {/* Round items display */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {currentRoundData.map((roundItem, index) => {
                    const participant = battle?.participants.find(p => p.id === roundItem.participantId);
                    const isWinner = roundItem.itemValue === Math.max(...currentRoundData.map(r => r.itemValue));
                    
                    return (
                      <div key={index} className="relative">
                        {/* Player avatar */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            participant?.userId === battle?.createdBy 
                              ? 'bg-yellow-500 border-yellow-400 text-black' 
                              : 'bg-green-500 border-green-400 text-white'
                          }`}>
                            {participant?.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-300">{formatCurrency(roundItem.itemValue)}</span>
                          {isWinner && <Crown className="h-4 w-4 text-yellow-400" />}
                        </div>
                        
                        {/* Item display */}
                        <Card className={`bg-gray-800 border-2 ${
                          isWinner ? 'border-yellow-400' : 'border-gray-600'
                        } transition-all`}>
                          <CardContent className="p-4 text-center">
                            <div className="w-20 h-20 mx-auto mb-3 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                              <img 
                                src={roundItem.itemIcon} 
                                alt={roundItem.itemName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h4 className={`font-medium text-sm mb-1 ${getRarityClass(roundItem.itemRarity)}`}>
                              {roundItem.itemName}
                            </h4>
                            <p className="text-gray-400 text-xs">
                              {formatCurrency(roundItem.itemValue)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
                
                <Separator className="bg-gray-700" />
                
                {/* Player summaries for this round */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {battle?.participants.map((participant) => {
                    const roundItem = currentRoundData.find(r => r.participantId === participant.id);
                    if (!roundItem) return null;
                    
                    return (
                      <div key={participant.id} className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                            participant.userId === battle.createdBy 
                              ? 'bg-yellow-500 border-yellow-400 text-black' 
                              : 'bg-green-500 border-green-400 text-white'
                          }`}>
                            {participant.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-white">
                            {participant.username}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {roundItem.itemName}
                        </div>
                        <div className="text-sm font-bold text-blue-400">
                          {formatCurrency(roundItem.itemValue)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Round Not Started</h3>
                <p className="text-gray-400">This round hasn't been played yet</p>
              </div>
            )}
          </div>

          {/* Battle summary footer */}
          {battle?.status === "completed" && winner && (
            <div className="border-t border-gray-700 p-4 bg-gray-800/50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span className="text-lg font-bold text-white">Battle Winner</span>
                </div>
                <div className="text-xl font-bold text-yellow-400 mb-1">
                  {winner.username}
                </div>
                <div className="text-sm text-gray-400">
                  Total Value: {formatCurrency(winner.totalValue)}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}