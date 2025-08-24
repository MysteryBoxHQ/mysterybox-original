import { storage } from "./storage";
import { boxOpeningEngine } from "./boxOpeningEngine";
import type { Item } from "@shared/schema";

export interface BattleParticipant {
  id: number;
  userId: number;
  username: string;
  position: number;
  totalValue: number;
  isEliminated: boolean;
  roundItems: Array<{
    round: number;
    item: Item;
    value: number;
  }>;
}

export interface BattleState {
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
      item: Item;
      value: number;
    }>;
  }>;
}

export class BattleEngine {
  private activeBattles = new Map<number, BattleState>();
  private battleTimers = new Map<number, NodeJS.Timeout>();
  private wsClients = new Map<number, Set<any>>(); // battleId -> Set of WebSocket clients

  // Subscribe WebSocket client to battle updates
  public subscribeToBattle(battleId: number, ws: any): void {
    if (!this.wsClients.has(battleId)) {
      this.wsClients.set(battleId, new Set());
    }
    this.wsClients.get(battleId)!.add(ws);

    // Send current battle state
    const battle = this.activeBattles.get(battleId);
    if (battle) {
      this.sendToClient(ws, 'battle_state', battle);
    }
  }

  // Unsubscribe WebSocket client
  public unsubscribeFromBattle(battleId: number, ws: any): void {
    const clients = this.wsClients.get(battleId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.wsClients.delete(battleId);
      }
    }
  }

  // Start a battle when it's full
  public async startBattle(battleId: number): Promise<void> {
    try {
      const battleData = await storage.getBattleWithParticipants(battleId);
      if (!battleData) {
        throw new Error('Battle not found');
      }

      // Initialize battle state
      const battleState: BattleState = {
        id: battleId,
        currentRound: 0,
        totalRounds: battleData.totalRounds,
        status: 'active',
        participants: battleData.participants.map(p => ({
          id: p.id,
          userId: p.userId,
          username: p.username,
          position: p.position,
          totalValue: 0,
          isEliminated: false,
          roundItems: []
        })),
        winnerId: null,
        roundHistory: []
      };

      this.activeBattles.set(battleId, battleState);

      // Update database status
      await storage.updateBattleStatus(battleId, 'active');
      
      // Broadcast battle started
      this.broadcastToBattle(battleId, 'battle_started', battleState);

      // Start first round after 3 seconds
      setTimeout(() => {
        this.startNextRound(battleId);
      }, 3000);

    } catch (error) {
      console.error('Failed to start battle:', error);
    }
  }

  // Start the next round of a battle
  private async startNextRound(battleId: number): Promise<void> {
    const battle = this.activeBattles.get(battleId);
    if (!battle || battle.status !== 'active') return;

    battle.currentRound++;

    // Check if battle is finished
    if (battle.currentRound > battle.totalRounds) {
      await this.finishBattle(battleId);
      return;
    }

    // Broadcast round starting
    this.broadcastToBattle(battleId, 'round_starting', {
      round: battle.currentRound,
      totalRounds: battle.totalRounds
    });

    // Open boxes for all participants simultaneously
    await this.executeRound(battleId);
  }

  // Execute a battle round
  private async executeRound(battleId: number): Promise<void> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) return;

    try {
      const battleData = await storage.getBattleWithParticipants(battleId);
      const boxId = battleData.boxId;

      const roundOpenings = [];

      // Open box for each non-eliminated participant
      for (const participant of battle.participants) {
        if (participant.isEliminated) continue;

        try {
          // Use the box opening engine to get a real item
          const openingResult = await boxOpeningEngine.openBox(
            String(participant.userId), 
            boxId
          );

          if (openingResult.success && openingResult.item) {
            const item = openingResult.item;
            const itemValue = parseFloat(item.value || '0');

            // Add to participant's round items
            participant.roundItems.push({
              round: battle.currentRound,
              item,
              value: itemValue
            });

            // Update total value
            participant.totalValue += itemValue;

            roundOpenings.push({
              participantId: participant.id,
              item,
              value: itemValue
            });

            // Record in database
            await storage.recordBattleRound({
              battleId,
              participantId: participant.id,
              roundNumber: battle.currentRound,
              itemId: item.id,
              itemValue: Math.round(itemValue * 100) // Store as cents
            });
          }
        } catch (error) {
          console.error(`Failed to open box for participant ${participant.id}:`, error);
        }
      }

      // Add to round history
      battle.roundHistory.push({
        round: battle.currentRound,
        openings: roundOpenings
      });

      // Broadcast round results
      this.broadcastToBattle(battleId, 'round_completed', {
        round: battle.currentRound,
        openings: roundOpenings,
        participants: battle.participants.map(p => ({
          id: p.id,
          username: p.username,
          totalValue: p.totalValue,
          lastItem: p.roundItems[p.roundItems.length - 1]
        }))
      });

      // Start next round after 5 seconds
      setTimeout(() => {
        this.startNextRound(battleId);
      }, 5000);

    } catch (error) {
      console.error('Failed to execute round:', error);
    }
  }

  // Finish a battle and determine winner
  private async finishBattle(battleId: number): Promise<void> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) return;

    // Determine winner (highest total value)
    const winner = battle.participants.reduce((prev, current) => 
      (current.totalValue > prev.totalValue) ? current : prev
    );

    battle.winnerId = winner.userId;
    battle.status = 'finished';

    // Update database
    await storage.updateBattleWinner(battleId, winner.userId);
    await storage.updateBattleStatus(battleId, 'finished');

    // Broadcast battle finished
    this.broadcastToBattle(battleId, 'battle_finished', {
      winner: {
        userId: winner.userId,
        username: winner.username,
        totalValue: winner.totalValue
      },
      finalStandings: battle.participants
        .sort((a, b) => b.totalValue - a.totalValue)
        .map((p, index) => ({
          position: index + 1,
          username: p.username,
          totalValue: p.totalValue
        }))
    });

    // Clean up
    this.activeBattles.delete(battleId);
    const timer = this.battleTimers.get(battleId);
    if (timer) {
      clearTimeout(timer);
      this.battleTimers.delete(battleId);
    }
  }

  // Get current battle state
  public getBattleState(battleId: number): BattleState | null {
    return this.activeBattles.get(battleId) || null;
  }

  // Broadcast message to all clients watching a battle
  private broadcastToBattle(battleId: number, event: string, data: any): void {
    const clients = this.wsClients.get(battleId);
    if (!clients) return;

    const message = JSON.stringify({ event, data });
    
    clients.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message);
      }
    });
  }

  // Send message to specific client
  private sendToClient(ws: any, event: string, data: any): void {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify({ event, data }));
    }
  }

  // Force stop a battle (admin action)
  public async forceStopBattle(battleId: number): Promise<void> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) return;

    battle.status = 'finished';
    await storage.updateBattleStatus(battleId, 'finished');
    
    this.broadcastToBattle(battleId, 'battle_force_stopped', {
      reason: 'Battle stopped by administrator'
    });

    this.activeBattles.delete(battleId);
    const timer = this.battleTimers.get(battleId);
    if (timer) {
      clearTimeout(timer);
      this.battleTimers.delete(battleId);
    }
  }
}

export const battleEngine = new BattleEngine();