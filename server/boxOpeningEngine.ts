import { storage } from "./storage";
import type { Item, BoxOpening, UserItem } from "@shared/schema";

// Weighted probability system for realistic box opening mechanics
export class BoxOpeningEngine {
  
  // Calculate weighted probabilities for all items in a box
  private calculateItemProbabilities(items: Item[]): Map<number, number> {
    const probabilities = new Map<number, number>();
    
    // Sort items by rarity (common to mythical)
    const rarityWeights = {
      'common': 5000,     // 50% base chance
      'rare': 2500,       // 25% base chance  
      'epic': 1500,       // 15% base chance
      'legendary': 800,   // 8% base chance
      'mythical': 200     // 2% base chance
    };
    
    let totalWeight = 0;
    
    // Calculate individual item weights
    for (const item of items) {
      const baseWeight = rarityWeights[item.rarity as keyof typeof rarityWeights] || 1000;
      // Apply drop chance modifier (item.dropChance is out of 10000)
      const adjustedWeight = Math.floor(baseWeight * (item.dropChance / 10000));
      probabilities.set(item.id, adjustedWeight);
      totalWeight += adjustedWeight;
    }
    
    // Normalize probabilities to sum to 10000 (100.00%)
    const normalizedProbabilities = new Map<number, number>();
    probabilities.forEach((weight, itemId) => {
      const normalizedWeight = Math.floor((weight / totalWeight) * 10000);
      normalizedProbabilities.set(itemId, normalizedWeight);
    });
    
    return normalizedProbabilities;
  }
  
  // Select item using cryptographically secure random number generation
  private selectRandomItem(items: Item[], probabilities: Map<number, number>): Item {
    // Use crypto.getRandomValues for truly random selection
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const randomValue = (randomArray[0] / 0xFFFFFFFF) * 10000; // Scale to 0-10000
    
    let cumulativeWeight = 0;
    
    for (const item of items) {
      const itemWeight = probabilities.get(item.id) || 0;
      cumulativeWeight += itemWeight;
      
      if (randomValue <= cumulativeWeight) {
        return item;
      }
    }
    
    // Fallback to last item (should never happen with proper weights)
    return items[items.length - 1];
  }
  
  // Anti-duplicate system - reduce probability of recent items
  private applyDuplicateProtection(
    userId: string, 
    probabilities: Map<number, number>,
    recentItems: number[]
  ): Map<number, number> {
    const protectedProbabilities = new Map<number, number>();
    
    probabilities.forEach((probability, itemId) => {
      let adjustedProbability = probability;
      
      // Reduce probability for recently obtained items
      const recentCount = recentItems.filter(id => id === itemId).length;
      if (recentCount > 0) {
        // Reduce by 20% for each recent duplicate (max 80% reduction)
        const reductionFactor = Math.max(0.2, 1 - (recentCount * 0.2));
        adjustedProbability = Math.floor(probability * reductionFactor);
      }
      
      protectedProbabilities.set(itemId, adjustedProbability);
    });
    
    return protectedProbabilities;
  }
  
  // Pity system - increase legendary/mythical chances after dry streaks
  private applyPitySystem(
    userId: string,
    probabilities: Map<number, number>,
    items: Item[],
    boxesOpenedSinceRare: number
  ): Map<number, number> {
    const pityProbabilities = new Map<number, number>();
    
    // Apply pity multiplier after 10 boxes without rare+ items
    const pityMultiplier = Math.min(3.0, 1 + (boxesOpenedSinceRare / 20));
    
    probabilities.forEach((probability, itemId) => {
      const item = items.find(i => i.id === itemId);
      let adjustedProbability = probability;
      
      if (item && ['epic', 'legendary', 'mythical'].includes(item.rarity)) {
        adjustedProbability = Math.floor(probability * pityMultiplier);
      }
      
      pityProbabilities.set(itemId, adjustedProbability);
    });
    
    return pityProbabilities;
  }
  
  // Main box opening method
  public async openBox(userId: string, boxId: number): Promise<{
    success: boolean;
    item?: Item;
    opening?: BoxOpening;
    error?: string;
  }> {
    try {
      // Get box and its items
      const box = await storage.getBox(boxId);
      if (!box) {
        return { success: false, error: "Box not found" };
      }
      
      const items = await storage.getBoxItems(boxId);
      if (!items.length) {
        return { success: false, error: "Box has no items" };
      }
      
      // Get user's recent openings for duplicate protection
      const recentOpenings = await storage.getUserRecentBoxOpenings(userId, 10);
      const recentItemIds = recentOpenings.map(o => o.itemId);
      
      // Get boxes opened since last rare item for pity system
      const boxesOpenedSinceRare = await storage.getBoxesOpenedSinceRareItem(userId);
      
      // Calculate base probabilities
      let probabilities = this.calculateItemProbabilities(items);
      
      // Apply duplicate protection
      probabilities = this.applyDuplicateProtection(userId, probabilities, recentItemIds);
      
      // Apply pity system
      probabilities = this.applyPitySystem(userId, probabilities, items, boxesOpenedSinceRare);
      
      // Select the winning item
      const selectedItem = this.selectRandomItem(items, probabilities);
      
      // Record the box opening
      const opening = await storage.createBoxOpening({
        userId,
        boxId,
        itemId: selectedItem.id,
      });
      
      // Add item to user's inventory
      await storage.addUserItem({
        userId,
        itemId: selectedItem.id,
        quantity: 1,
      });
      
      // Skip user stats update for now - debug data type issue later
      // TODO: Fix updateUserStats data type conversion
      // await storage.updateUserStats(Number(userId), {
      //   totalSpent: Math.round(Number(box.price) * 100), // Convert to cents
      //   boxesOpened: 1,
      //   experience: this.calculateExperienceGain(selectedItem.rarity),
      // });
      
      return {
        success: true,
        item: selectedItem,
        opening,
      };
      
    } catch (error) {
      console.error("Box opening error:", error);
      return { 
        success: false, 
        error: "Failed to process box opening" 
      };
    }
  }
  
  // Calculate experience points based on item rarity
  private calculateExperienceGain(rarity: string): number {
    const experienceTable = {
      'common': 10,
      'rare': 25,
      'epic': 50,
      'legendary': 100,
      'mythical': 250,
    };
    
    return experienceTable[rarity as keyof typeof experienceTable] || 10;
  }
  
  // Get opening statistics for transparency
  public async getOpeningStats(boxId: number, days: number = 7): Promise<{
    totalOpenings: number;
    rarityDistribution: Record<string, number>;
    averageValue: number;
    topItems: Array<{ item: Item; count: number }>;
  }> {
    const openings = await storage.getBoxOpeningStats(boxId, days);
    const items = await storage.getBoxItems(boxId);
    
    const rarityDistribution: Record<string, number> = {};
    const itemCounts: Record<number, number> = {};
    let totalValue = 0;
    
    for (const opening of openings) {
      const item = items.find(i => i.id === opening.itemId);
      if (item) {
        rarityDistribution[item.rarity] = (rarityDistribution[item.rarity] || 0) + 1;
        itemCounts[item.id] = (itemCounts[item.id] || 0) + 1;
        totalValue += Number(item.value || 0);
      }
    }
    
    // Get top 5 most dropped items
    const topItems = Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([itemId, count]) => ({
        item: items.find(i => i.id === Number(itemId))!,
        count,
      }));
    
    return {
      totalOpenings: openings.length,
      rarityDistribution,
      averageValue: totalValue / Math.max(openings.length, 1),
      topItems,
    };
  }
  
  // Validate box opening probabilities sum to 100%
  public async validateBoxProbabilities(boxId: number): Promise<{
    isValid: boolean;
    totalProbability: number;
    itemBreakdown: Array<{ item: Item; probability: number }>;
  }> {
    const items = await storage.getBoxItems(boxId);
    const probabilities = this.calculateItemProbabilities(items);
    
    let totalProbability = 0;
    const itemBreakdown = items.map(item => {
      const probability = probabilities.get(item.id) || 0;
      totalProbability += probability;
      return {
        item,
        probability: probability / 100, // Convert to percentage
      };
    });
    
    return {
      isValid: Math.abs(totalProbability - 10000) < 100, // Allow 1% tolerance
      totalProbability: totalProbability / 100,
      itemBreakdown,
    };
  }
}

export const boxOpeningEngine = new BoxOpeningEngine();