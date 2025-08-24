import { 
  users, 
  boxes, 
  items, 
  userItems, 
  boxOpenings,
  achievements,
  userAchievements,
  dailyRewards as dailyRewardsTable,
  userStats,
  boxBattles,
  boxBattleParticipants,
  boxBattleRounds,
  transactions,
  marketListings,
  marketTransactions,
  userFavorites,
  legalPages,
  shippingAddresses,
  shipmentOrders,
  partners,
  partnerBoxes,
  whitelabelSites,
  whitelabelDomains,
  whitelabelBoxes,
  whitelabelPages,
  whitelabelContentSections,
  whitelabelMedia,
  type User, 
  type Box, 
  type Item, 
  type UserItem, 
  type BoxOpening,
  type Achievement,
  type UserAchievement,
  type UserStats,
  type DailyRewardRecord,
  type UserFavorite,
  type LegalPage,
  type ShippingAddress,
  type ShipmentOrder,
  type Partner,
  type WhitelabelSite,
  type WhitelabelDomain,
  type WhitelabelBox,
  type InsertWhitelabelBox,
  type InsertUser, 
  type InsertBox, 
  type InsertItem, 
  type InsertUserItem, 
  type InsertBoxOpening,
  type InsertUserFavorite,
  type InsertLegalPage,
  type InsertAchievement,
  type InsertUserAchievement,
  type InsertUserStats,
  type InsertDailyReward,
  type InsertShippingAddress,
  type InsertShipmentOrder,
  type InsertWhitelabelSite,
  type InsertWhitelabelDomain,
  fairnessProofs,
  type FairnessProof,
  type InsertFairnessProof,
  type BoxWithItems,
  type BoxOpeningResult,
  type UserItemWithItem,
  type RecentOpening,
  type AchievementProgress,
  type LeaderboardEntry,
  type DailyReward
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, or, inArray, gte, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Box operations
  getAllBoxes(): Promise<Box[]>;
  getFeaturedBoxes(): Promise<Box[]>;
  getBox(id: number): Promise<Box | undefined>;
  getBoxWithItems(id: number): Promise<BoxWithItems | undefined>;
  createBox(boxData: InsertBox): Promise<Box>;
  updateBox(id: number, updates: InsertBox): Promise<Box | undefined>;
  deleteBox(id: number): Promise<boolean>;
  
  // Item operations
  getItem(id: number): Promise<Item | undefined>;
  getItemsByBox(boxId: number): Promise<Item[]>;
  getBoxItems(boxId: number): Promise<any[]>;
  getAllItems(): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, updates: InsertItem): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  
  // User inventory operations
  getUserItems(userId: number): Promise<UserItemWithItem[]>;
  addUserItem(userItem: InsertUserItem): Promise<UserItem>;
  getUserPurchaseHistory(userId: number): Promise<any[]>;
  
  // Box opening operations
  recordBoxOpening(opening: InsertBoxOpening): Promise<BoxOpening>;
  createBoxOpening(opening: InsertBoxOpening): Promise<BoxOpening>;
  getRecentOpenings(limit?: number): Promise<RecentOpening[]>;
  getUserRecentBoxOpenings(userId: string, limit: number): Promise<BoxOpening[]>;
  getBoxesOpenedSinceRareItem(userId: string): Promise<number>;
  getBoxOpeningStats(boxId: number, days: number): Promise<BoxOpening[]>;
  updateUserStats(userId: string, stats: { totalSpent: number; boxesOpened: number; experience: number }): Promise<void>;
  
  // Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<AchievementProgress[]>;
  updateAchievementProgress(userId: number, achievementId: number, progress: number): Promise<void>;
  completeAchievement(userId: number, achievementId: number): Promise<void>;
  claimAchievementReward(userId: number, achievementId: number): Promise<{ coins: number; gems: number }>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Leaderboard operations
  getLeaderboard(type: 'cases' | 'spending' | 'rare_items', limit?: number): Promise<LeaderboardEntry[]>;
  
  // Daily rewards operations
  getDailyRewards(userId: number): Promise<DailyReward[]>;
  claimDailyReward(userId: number, day: number): Promise<{ coins: number; gems: number }>;
  getUserLoginStreak(userId: number): Promise<number>;
  updateLoginStreak(userId: number): Promise<number>;
  
  // Promotional features operations
  getUserReferralData(userId: number): Promise<any>;
  getActivePromotions(userId: number): Promise<any[]>;
  redeemPromoCode(userId: number, code: string): Promise<any>;
  claimPromotion(userId: number, promotionId: number): Promise<any>;
  
  // User stats operations
  getUserStats(userId: number): Promise<UserStats | undefined>;
  updateUserStats(userId: number, stats: Partial<UserStats>): Promise<void>;
  
  // Transaction operations
  recordTransaction(transaction: any): Promise<void>;
  getUserTransactions(userId: number): Promise<any[]>;
  
  // Market operations
  getMarketListings(filters?: any): Promise<any[]>;
  createMarketListing(listing: any): Promise<any>;
  buyMarketItem(listingId: number, buyerId: number): Promise<any>;
  getUserMarketListings(userId: number): Promise<any[]>;
  cancelMarketListing(listingId: number, userId: number): Promise<void>;
  
  // Battle operations
  getActiveBattles(): Promise<any[]>;
  createBattle(battle: any): Promise<any>;
  joinBattle(battleId: number, userId: number): Promise<any>;
  getBattle(battleId: number): Promise<any>;
  getBattleWithParticipants(battleId: number): Promise<any>;
  updateBattleStatus(battleId: number, status: string): Promise<void>;
  updateBattleWinner(battleId: number, winnerId: number): Promise<void>;
  recordBattleRound(roundData: any): Promise<void>;
  
  // Fairness proof operations
  createFairnessProof(proof: InsertFairnessProof): Promise<FairnessProof>;
  getFairnessProof(id: number): Promise<FairnessProof | undefined>;
  getUserFairnessProofs(userId: number): Promise<FairnessProof[]>;
  revealFairnessProof(id: number): Promise<FairnessProof | undefined>;
  verifyFairnessProof(id: number): Promise<boolean>;
  
  // Favorites operations
  addToFavorites(userId: number, boxId: number): Promise<UserFavorite>;
  removeFromFavorites(userId: number, boxId: number): Promise<void>;
  getUserFavorites(userId: number): Promise<Box[]>;
  isFavorited(userId: number, boxId: number): Promise<boolean>;
  
  // Legal page operations
  getAllLegalPages(): Promise<LegalPage[]>;
  getLegalPageBySlug(slug: string): Promise<LegalPage | undefined>;
  createLegalPage(legalPage: InsertLegalPage): Promise<LegalPage>;
  updateLegalPage(id: number, updates: Partial<InsertLegalPage>, userId?: number): Promise<LegalPage | undefined>;
  deleteLegalPage(id: number): Promise<boolean>;
  
  // Statistics operations
  getUserBoxOpenings(userId: number, timeframe?: string): Promise<BoxOpening[]>;
  getUserBoxOpeningsWithDetails(userId: number, timeframe?: string): Promise<any[]>;

  // Marketplace operations
  createMarketListing(listing: any): Promise<any>;
  getMarketListings(): Promise<any[]>;
  getUserMarketListings(userId: number): Promise<any[]>;

  // Content management operations
  getAllSliders(): Promise<any[]>;
  getActiveSliders(): Promise<any[]>;
  createSlider(data: any): Promise<any>;
  updateSlider(id: number, data: any): Promise<any>;
  deleteSlider(id: number): Promise<void>;
  
  getAllBanners(): Promise<any[]>;
  getActiveBanners(): Promise<any[]>;
  createBanner(data: any): Promise<any>;
  updateBanner(id: number, data: any): Promise<any>;
  deleteBanner(id: number): Promise<void>;
  
  getAllMissions(): Promise<any[]>;
  createMission(data: any): Promise<any>;
  updateMission(id: number, data: any): Promise<any>;
  deleteMission(id: number): Promise<void>;
  
  getAllBlogPosts(): Promise<any[]>;
  createBlogPost(data: any): Promise<any>;
  
  // Shipping operations
  getUserShippingAddresses(userId: number): Promise<ShippingAddress[]>;
  createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress>;
  updateShippingAddress(id: number, updates: Partial<InsertShippingAddress>): Promise<ShippingAddress | undefined>;
  deleteShippingAddress(id: number): Promise<boolean>;
  setDefaultShippingAddress(userId: number, addressId: number): Promise<boolean>;
  
  createShipmentOrder(order: InsertShipmentOrder): Promise<ShipmentOrder>;
  getUserShipmentOrders(userId: number): Promise<ShipmentOrder[]>;
  updateShipmentStatus(orderId: number, status: string, trackingNumber?: string, carrier?: string): Promise<ShipmentOrder | undefined>;
  getShipmentOrder(orderId: number): Promise<ShipmentOrder | undefined>;
  updateBlogPost(id: number, data: any): Promise<any>;
  deleteBlogPost(id: number): Promise<void>;
  
  getAllFAQs(): Promise<any[]>;
  getActiveFAQs(): Promise<any[]>;
  createFAQ(data: any): Promise<any>;
  updateFAQ(id: number, data: any): Promise<any>;
  deleteFAQ(id: number): Promise<void>;
  
  getSiteSettings(): Promise<any>;
  updateSiteSettings(data: any): Promise<any>;
  
  // Partner operations
  getAllPartners(): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  createPartner(partner: any): Promise<Partner>;
  updatePartner(id: number, updates: any): Promise<Partner | undefined>;
  deletePartner(id: number): Promise<boolean>;
  getPartnerStats(): Promise<any>;
  getPartnerBoxes(partnerId: number): Promise<any[]>;
  addBoxToPartner(partnerId: number, boxId: number, config: any): Promise<any>;
  removeBoxFromPartner(partnerId: number, boxId: number): Promise<boolean>;
  
  // Admin operations
  getAdminStats(): Promise<any>;

  // Whitelabel operations
  getAllWhitelabelSites(): Promise<WhitelabelSite[]>;
  getWhitelabelSite(id: number): Promise<WhitelabelSite | undefined>;
  getWhitelabelSiteByWhitelabelId(whitelabelId: string): Promise<WhitelabelSite | undefined>;
  getWhitelabelById(whitelabelId: string): Promise<WhitelabelSite | undefined>;
  createWhitelabelSite(site: InsertWhitelabelSite): Promise<WhitelabelSite>;
  updateWhitelabelSite(id: number, updates: Partial<InsertWhitelabelSite>): Promise<WhitelabelSite | undefined>;
  updateWhitelabelSiteByWhitelabelId(whitelabelId: string, updates: any): Promise<WhitelabelSite | undefined>;
  deleteWhitelabelSite(id: number): Promise<boolean>;
  getBoxesByWhitelabel(whitelabelId: string): Promise<Box[]>;
  getWhitelabelBoxes(whitelabelId: string, featuredOnly?: boolean): Promise<Box[]>;
  getWhitelabelRecentOpenings(whitelabelId: string): Promise<any[]>;
  getBattlesByWhitelabel(whitelabelId: string): Promise<any[]>;
  deleteBattle(battleId: number): Promise<boolean>;
  addBoxToWhitelabel(whitelabelId: string, boxId: number, config: any): Promise<any>;
  updateWhitelabelBox(whitelabelId: string, boxId: number, updates: any): Promise<any>;
  removeBoxFromWhitelabel(whitelabelId: string, boxId: number): Promise<boolean>;

  // Box-Product management operations
  addItemToBox(boxId: number, itemId: number, dropChance: number): Promise<any>;
  removeItemFromBox(boxId: number, itemId: number): Promise<boolean>;
  updateItemDropChance(boxId: number, itemId: number, dropChance: number): Promise<any>;
  
  // Partner B2B integration operations
  recordPartnerPurchase(purchase: any): Promise<void>;
  getUserInventory(userId: string, partner: string): Promise<any[]>;
  addItemToUserInventory(userId: string, item: any, partner: string): Promise<void>;
  createMarketplaceListing(listing: any): Promise<void>;
  markItemAsListed(userId: string, itemId: string, partner: string): Promise<void>;
  getMarketplaceListings(partner: string): Promise<any[]>;
  openBox(boxId: number, userId?: string): Promise<BoxOpeningResult>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllBoxes(): Promise<Box[]> {
    return await db.select().from(boxes);
  }

  async getFeaturedBoxes(): Promise<Box[]> {
    return await db.select().from(boxes).where(eq(boxes.featured, true));
  }

  async getBox(id: number): Promise<Box | undefined> {
    const [boxData] = await db.select().from(boxes).where(eq(boxes.id, id));
    return boxData || undefined;
  }

  async getBoxWithItems(id: number): Promise<BoxWithItems | undefined> {
    const boxData = await this.getBox(id);
    if (!boxData) return undefined;

    const boxItems = await this.getItemsByBox(id);
    return { ...boxData, items: boxItems };
  }

  async createBox(boxData: InsertBox): Promise<Box> {
    const [newBox] = await db
      .insert(boxes)
      .values(boxData)
      .returning();
    return newBox;
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async getItemsByBox(boxId: number): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.boxId, boxId));
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    return newItem;
  }

  async getUserItems(userId: number): Promise<UserItemWithItem[]> {
    const result = await db
      .select()
      .from(userItems)
      .innerJoin(items, eq(userItems.itemId, items.id))
      .where(eq(userItems.userId, userId));

    return result.map(row => ({
      id: row.user_items.id,
      userId: row.user_items.userId,
      itemId: row.user_items.itemId,
      quantity: row.user_items.quantity,
      obtainedAt: row.user_items.obtainedAt,
      item: row.items
    }));
  }

  async addUserItem(userItem: InsertUserItem): Promise<UserItem> {
    const [newUserItem] = await db
      .insert(userItems)
      .values(userItem)
      .returning();
    return newUserItem;
  }

  async getUserPurchaseHistory(userId: number): Promise<any[]> {
    const result = await db
      .select({
        id: boxOpenings.id,
        boxName: boxes.name,
        boxImageUrl: boxes.imageUrl,
        boxPrice: boxes.price,
        itemName: items.name,
        itemIcon: items.icon,
        itemRarity: items.rarity,
        itemValue: items.value,
        openedAt: boxOpenings.openedAt
      })
      .from(boxOpenings)
      .leftJoin(boxes, eq(boxOpenings.boxId, boxes.id))
      .leftJoin(items, eq(boxOpenings.itemId, items.id))
      .where(eq(boxOpenings.userId, userId))
      .orderBy(desc(boxOpenings.openedAt))
      .limit(50);

    return result.map(row => ({
      id: row.id,
      type: 'box_opening',
      boxName: row.boxName || "Unknown Box",
      boxImageUrl: row.boxImageUrl || "",
      price: parseFloat(row.boxPrice || "0"),
      itemReceived: {
        name: row.itemName || "Unknown Item",
        icon: row.itemIcon || "",
        rarity: row.itemRarity || "common",
        value: parseFloat(row.itemValue || "0")
      },
      purchasedAt: row.openedAt,
      timeAgo: this.getTimeAgo(row.openedAt)
    }));
  }

  async removeUserItem(userId: number, itemId: number, quantity: number): Promise<boolean> {
    const existingItem = await db
      .select()
      .from(userItems)
      .where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)))
      .limit(1);

    if (existingItem.length === 0) {
      return false;
    }

    if (existingItem[0].quantity <= quantity) {
      // Remove the entire entry
      await db
        .delete(userItems)
        .where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)));
    } else {
      // Reduce quantity
      await db
        .update(userItems)
        .set({ quantity: existingItem[0].quantity - quantity })
        .where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)));
    }

    return true;
  }

  async recordBoxOpening(opening: InsertBoxOpening): Promise<BoxOpening> {
    console.log('Recording box opening:', opening);
    try {
      const [newOpening] = await db
        .insert(boxOpenings)
        .values(opening)
        .returning();
      console.log('Box opening recorded successfully:', newOpening);
      return newOpening;
    } catch (error) {
      console.error('Error recording box opening:', error);
      throw error;
    }
  }

  async createBoxOpening(opening: InsertBoxOpening): Promise<BoxOpening> {
    const [boxOpening] = await db
      .insert(boxOpenings)
      .values(opening)
      .returning();
    return boxOpening;
  }

  async getUserRecentBoxOpenings(userId: string, limit: number): Promise<BoxOpening[]> {
    return await db
      .select()
      .from(boxOpenings)
      .where(eq(boxOpenings.userId, userId))
      .orderBy(desc(boxOpenings.openedAt))
      .limit(limit);
  }

  async getBoxesOpenedSinceRareItem(userId: string): Promise<number> {
    // Get all box openings for user
    const openings = await db
      .select({
        itemId: boxOpenings.itemId,
        openedAt: boxOpenings.openedAt
      })
      .from(boxOpenings)
      .where(eq(boxOpenings.userId, userId))
      .orderBy(desc(boxOpenings.openedAt));

    if (openings.length === 0) return 0;

    // Check each opening from most recent to find last rare+ item
    let count = 0;
    for (const opening of openings) {
      const item = await this.getItem(opening.itemId);
      if (item && ['epic', 'legendary', 'mythical'].includes(item.rarity)) {
        break;
      }
      count++;
    }
    
    return count;
  }

  async getBoxOpeningStats(boxId: number, days: number): Promise<BoxOpening[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    return await db
      .select()
      .from(boxOpenings)
      .where(and(
        eq(boxOpenings.boxId, boxId),
        gte(boxOpenings.openedAt, daysAgo)
      ));
  }

  async updateUserStats(userId: string, stats: { totalSpent: number; boxesOpened: number; experience: number }): Promise<void> {
    const userIdInt = parseInt(userId);
    
    try {
      // Get current user
      const user = await this.getUser(userIdInt);
      if (!user) return;

      // Update user level, experience, and totals
      const newExperience = user.experience + stats.experience;
      const newLevel = Math.floor(newExperience / 1000) + 1;
      const newTotalSpent = parseFloat(user.totalSpent) + stats.totalSpent;

      await db
        .update(users)
        .set({
          experience: newExperience,
          level: newLevel,
          totalSpent: newTotalSpent.toFixed(2),
        })
        .where(eq(users.id, userIdInt));

      // Update user stats table
      const existingStats = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userIdInt));

      if (existingStats.length === 0) {
        // Create new stats record
        await db
          .insert(userStats)
          .values({
            userId: userIdInt,
            totalCasesOpened: stats.boxesOpened,
            totalSpent: Math.floor(stats.totalSpent * 100), // Convert to cents
            rareItemsFound: 0,
            lastLoginDate: new Date(),
            loginStreak: 1,
            longestStreak: 1,
            updatedAt: new Date()
          });
      } else {
        // Update existing stats
        const currentStats = existingStats[0];
        await db
          .update(userStats)
          .set({
            totalCasesOpened: currentStats.totalCasesOpened + stats.boxesOpened,
            totalSpent: currentStats.totalSpent + Math.floor(stats.totalSpent * 100),
            updatedAt: new Date()
          })
          .where(eq(userStats.userId, userIdInt));
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  async getRecentOpenings(limit: number = 10): Promise<RecentOpening[]> {
    const result = await db
      .select({
        id: boxOpenings.id,
        username: sql<string>`COALESCE(${users.username}, 'Demo Player')`,
        itemName: items.name,
        itemIcon: items.icon,
        itemRarity: items.rarity,
        openedAt: boxOpenings.openedAt
      })
      .from(boxOpenings)
      .leftJoin(users, sql`CAST(${boxOpenings.userId} AS INTEGER) = ${users.id}`)
      .leftJoin(items, eq(boxOpenings.itemId, items.id))
      .orderBy(boxOpenings.openedAt)
      .limit(limit);

    return result.map(row => ({
      id: row.id,
      username: row.username || "Unknown",
      itemName: row.itemName || "Unknown Item",
      itemIcon: row.itemIcon || "",
      itemRarity: row.itemRarity || "common",
      timeAgo: this.getTimeAgo(row.openedAt)
    }));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async updateBox(id: number, updates: InsertBox): Promise<Box | undefined> {
    const [updatedBox] = await db
      .update(boxes)
      .set(updates)
      .where(eq(boxes.id, id))
      .returning();
    return updatedBox || undefined;
  }

  async deleteBox(id: number): Promise<boolean> {
    const result = await db.delete(boxes).where(eq(boxes.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateItem(id: number, updates: InsertItem): Promise<Item | undefined> {
    const [updatedItem] = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deleteItem(id: number): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return (result.rowCount || 0) > 0;
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: number): Promise<AchievementProgress[]> {
    const allAchievements = await db.select().from(achievements);
    const userProgress = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    return allAchievements.map(achievement => {
      const progress = userProgress.find(p => p.achievementId === achievement.id);
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        progress: progress?.progress || 0,
        requirement: achievement.requirement,
        completed: progress?.completed || false,
        rewardCoins: achievement.rewardCoins || 0,
        rewardGems: achievement.rewardGems || 0,
        rewardClaimed: progress?.rewardClaimed || false,
      };
    });
  }

  async updateAchievementProgress(userId: number, achievementId: number, progress: number): Promise<void> {
    // First try to insert, if it fails due to conflict, update
    try {
      await db
        .insert(userAchievements)
        .values({ userId, achievementId, progress });
    } catch (error) {
      // If insert fails due to unique constraint, update instead
      await db
        .update(userAchievements)
        .set({ progress })
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        ));
    }
  }

  async completeAchievement(userId: number, achievementId: number): Promise<void> {
    await db
      .update(userAchievements)
      .set({ completed: true, completedAt: new Date() })
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));
  }

  async claimAchievementReward(userId: number, achievementId: number): Promise<{ coins: number; gems: number }> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId));

    if (!achievement) {
      throw new Error("Achievement not found");
    }

    // Update user balance (converting coins to USD equivalent)
    const rewardAmount = (achievement.rewardCoins || 0) * 0.01; // Convert coins to dollars
    await db
      .update(users)
      .set({
        goldCoins: sql`gold_coins + ${achievement.rewardCoins || 0}`
      })
      .where(eq(users.id, userId));

    // Mark reward as claimed
    await db
      .update(userAchievements)
      .set({ rewardClaimed: true })
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));

    return { coins: achievement.rewardCoins || 0, gems: 0 };
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async getLeaderboard(type: 'cases' | 'spending' | 'rare_items', limit: number = 10): Promise<LeaderboardEntry[]> {
    let orderByField: any;
    switch (type) {
      case 'cases':
        orderByField = userStats.totalCasesOpened;
        break;
      case 'spending':
        orderByField = userStats.totalSpent;
        break;
      case 'rare_items':
        orderByField = userStats.rareItemsFound;
        break;
    }

    const results = await db
      .select({
        username: users.username,
        value: orderByField,
        totalCasesOpened: userStats.totalCasesOpened,
        totalSpent: userStats.totalSpent,
        rareItemsFound: userStats.rareItemsFound,
      })
      .from(userStats)
      .innerJoin(users, eq(userStats.userId, users.id))
      .orderBy(sql`${orderByField} DESC`)
      .limit(limit);

    return results.map((result, index) => ({
      rank: index + 1,
      username: result.username,
      value: result.value,
      totalCasesOpened: result.totalCasesOpened,
      totalSpent: (result.totalSpent / 100).toFixed(2), // Convert cents back to dollars
      rareItemsFound: result.rareItemsFound,
    }));
  }

  getDailyRewards(): DailyReward[] {
    // 7-day daily reward cycle
    return [
      { day: 1, coins: 100, gems: 1, claimed: false },
      { day: 2, coins: 150, gems: 2, claimed: false },
      { day: 3, coins: 200, gems: 3, claimed: false },
      { day: 4, coins: 300, gems: 5, claimed: false },
      { day: 5, coins: 500, gems: 8, claimed: false },
      { day: 6, coins: 750, gems: 12, claimed: false },
      { day: 7, coins: 1000, gems: 20, claimed: false },
    ];
  }

  async claimDailyReward(userId: number, day: number): Promise<{ coins: number; gems: number }> {
    const rewardList = this.getDailyRewards();
    const reward = rewardList.find(r => r.day === day);
    
    if (!reward) {
      throw new Error("Invalid day");
    }

    // Update user balance (converting coins to USD equivalent)
    const rewardAmount = reward.coins * 0.01; // Convert coins to dollars
    await db
      .update(users)
      .set({
        goldCoins: sql`gold_coins + ${reward.coins || 0}`
      })
      .where(eq(users.id, userId));

    // Record the reward claim
    await db
      .insert(dailyRewardsTable)
      .values({
        userId,
        day,
        coins: reward.coins,
        gems: reward.gems
      });

    return { coins: reward.coins, gems: 0 };
  }

  async getUserLoginStreak(userId: number): Promise<number> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    
    return stats?.loginStreak || 0;
  }

  async updateLoginStreak(userId: number): Promise<number> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));

    let newStreak = 1;
    
    if (stats?.lastLoginDate) {
      const lastLogin = new Date(stats.lastLoginDate);
      const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      const daysDiff = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day login
        newStreak = stats.loginStreak + 1;
      } else if (daysDiff === 0) {
        // Already logged in today
        newStreak = stats.loginStreak;
      }
      // If daysDiff > 1, streak resets to 1
    }

    await db
      .update(userStats)
      .set({
        lastLoginDate: now,
        loginStreak: newStreak,
        updatedAt: now
      })
      .where(eq(userStats.userId, userId));

    return newStreak;
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    return stats;
  }

  async updateUserStats(userId: number, updates: Partial<UserStats>): Promise<void> {
    await db
      .update(userStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userStats.userId, userId));
  }

  async updateUserStatsAfterBoxOpening(userId: string, boxPrice: number, itemRarity: string): Promise<void> {
    try {
      // Convert userId to integer for database compatibility
      const userIdInt = parseInt(userId);
      
      // Check if user stats record exists
      const existingStats = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userIdInt))
        .limit(1);

      const isRareItem = ['epic', 'legendary', 'mythic'].includes(itemRarity.toLowerCase());
      
      // Convert price to cents (integer) for database storage
      const priceInCents = Math.round(boxPrice * 100);

      if (existingStats.length === 0) {
        // Create new stats record
        await db
          .insert(userStats)
          .values({
            userId: userIdInt,
            totalCasesOpened: 1,
            totalSpent: priceInCents,
            rareItemsFound: isRareItem ? 1 : 0,
            lastLoginDate: new Date(),
            loginStreak: 1,
            longestStreak: 1,
            updatedAt: new Date()
          });
      } else {
        // Update existing stats
        const stats = existingStats[0];
        await db
          .update(userStats)
          .set({
            totalCasesOpened: stats.totalCasesOpened + 1,
            totalSpent: stats.totalSpent + priceInCents,
            rareItemsFound: stats.rareItemsFound + (isRareItem ? 1 : 0),
            updatedAt: new Date()
          })
          .where(eq(userStats.userId, userIdInt));
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Don't throw error to avoid breaking box opening flow
    }
  }

  async recordTransaction(transaction: any): Promise<void> {
    try {
      // Store transaction in global memory until database is ready
      if (!global.transactionStore) {
        global.transactionStore = [];
      }
      global.transactionStore.push({
        id: global.transactionStore.length + 1,
        ...transaction,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error recording transaction:", error);
    }
  }

  async getUserTransactions(userId: number): Promise<any[]> {
    try {
      // Return from memory store until database is ready
      const transactions = global.transactionStore || [];
      return transactions
        .filter((t: any) => t.userId === userId)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  // Market operations
  async getMarketListings(filters?: any): Promise<any[]> {
    try {
      // Use global memory store until database is ready
      const listings = global.marketListings || [];
      let filteredListings = [...listings];

      if (filters?.search) {
        filteredListings = filteredListings.filter((listing: any) => 
          listing.item.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters?.rarity && filters.rarity !== 'all') {
        filteredListings = filteredListings.filter((listing: any) => 
          listing.item.rarity.toLowerCase() === filters.rarity.toLowerCase()
        );
      }

      // Sort listings
      if (filters?.sort) {
        switch (filters.sort) {
          case 'price-low':
            filteredListings.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
            break;
          case 'price-high':
            filteredListings.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
            break;
          case 'oldest':
            filteredListings.sort((a: any, b: any) => new Date(a.listedAt).getTime() - new Date(b.listedAt).getTime());
            break;
          default: // newest
            filteredListings.sort((a: any, b: any) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
        }
      }

      return filteredListings.filter((listing: any) => listing.status === 'active');
    } catch (error) {
      console.error("Error fetching market listings:", error);
      return [];
    }
  }

  async createMarketListing(listing: any): Promise<any> {
    try {
      // Initialize global market store if needed
      if (!global.marketListings) {
        global.marketListings = [];
      }

      // Get item details from user's inventory
      const userInventory = await this.getUserItems(listing.sellerId);
      const userItem = userInventory.find((inv: any) => inv.item.id === listing.itemId);
      
      if (!userItem) {
        throw new Error("Item not found in user inventory");
      }

      const newListing = {
        id: global.marketListings.length + 1,
        itemId: listing.itemId,
        sellerId: listing.sellerId,
        sellerName: `Player_${listing.sellerId}`,
        price: parseFloat(listing.price),
        item: userItem.item,
        status: 'active',
        listedAt: new Date()
      };

      global.marketListings.push(newListing);

      // Remove item from user's inventory (temporarily)
      await this.removeUserItem(listing.sellerId, listing.itemId);

      return newListing;
    } catch (error) {
      console.error("Error creating market listing:", error);
      throw error;
    }
  }

  async buyMarketItem(listingId: number, buyerId: number): Promise<any> {
    try {
      const listings = global.marketListings || [];
      const listing = listings.find((l: any) => l.id === listingId && l.status === 'active');
      
      if (!listing) {
        throw new Error("Listing not found or no longer available");
      }

      if (listing.sellerId === buyerId) {
        throw new Error("Cannot buy your own item");
      }

      // Get buyer and seller
      const buyer = await this.getUser(buyerId);
      const seller = await this.getUser(listing.sellerId);

      if (!buyer || !seller) {
        throw new Error("User not found");
      }

      const price = parseFloat(listing.price);
      const buyerBalance = parseFloat(buyer.usdBalance);

      if (buyerBalance < price) {
        throw new Error("Insufficient balance");
      }

      // Transfer money
      await this.updateUser(buyerId, { 
        usdBalance: (buyerBalance - price).toFixed(2) 
      });
      
      const sellerBalance = parseFloat(seller.usdBalance);
      await this.updateUser(listing.sellerId, { 
        usdBalance: (sellerBalance + price).toFixed(2) 
      });

      // Transfer item to buyer
      await this.addUserItem({
        userId: buyerId,
        itemId: listing.itemId
      });

      // Mark listing as sold
      listing.status = 'sold';

      // Record transactions
      await this.recordTransaction({
        userId: buyerId,
        type: 'purchase',
        amount: price.toFixed(2),
        method: 'USD Balance',
        status: 'completed',
        description: `Purchased ${listing.item.name} from marketplace`
      });

      await this.recordTransaction({
        userId: listing.sellerId,
        type: 'sale',
        amount: price.toFixed(2),
        method: 'Marketplace',
        status: 'completed',
        description: `Sold ${listing.item.name} on marketplace`
      });

      return { success: true, item: listing.item };
    } catch (error) {
      console.error("Error buying market item:", error);
      throw error;
    }
  }

  async getUserMarketListings(userId: number): Promise<any[]> {
    try {
      const listings = global.marketListings || [];
      return listings.filter((listing: any) => listing.sellerId === userId);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      return [];
    }
  }

  async cancelMarketListing(listingId: number, userId: number): Promise<void> {
    try {
      const listings = global.marketListings || [];
      const listing = listings.find((l: any) => l.id === listingId && l.sellerId === userId);
      
      if (!listing) {
        throw new Error("Listing not found");
      }

      if (listing.status !== 'active') {
        throw new Error("Listing is not active");
      }

      // Return item to user's inventory
      await this.addUserItem({
        userId: userId,
        itemId: listing.itemId
      });

      // Mark listing as cancelled
      listing.status = 'cancelled';
    } catch (error) {
      console.error("Error cancelling listing:", error);
      throw error;
    }
  }



  // Battle operations
  async getActiveBattles(): Promise<any[]> {
    const battles = await db.select({
      id: boxBattles.id,
      name: boxBattles.name,
      boxId: boxBattles.boxId,
      createdBy: boxBattles.createdBy,
      status: boxBattles.status,
      maxPlayers: boxBattles.maxPlayers,
      entryFee: boxBattles.entryFee,
      totalRounds: boxBattles.totalRounds,
      createdAt: boxBattles.createdAt,
      boxName: boxes.name,
      creatorName: users.username,
    })
    .from(boxBattles)
    .leftJoin(boxes, eq(boxBattles.boxId, boxes.id))
    .leftJoin(users, eq(boxBattles.createdBy, users.id))
    .where(sql`${boxBattles.status} IN ('waiting', 'active')`)
    .orderBy(boxBattles.createdAt);

    // Get participants for each battle
    const battlesWithParticipants = await Promise.all(
      battles.map(async (battle) => {
        const participants = await db.select({
          id: boxBattleParticipants.id,
          userId: boxBattleParticipants.userId,
          position: boxBattleParticipants.position,
          username: users.username,
          totalValue: sql<number>`0`.as('totalValue'),
        })
        .from(boxBattleParticipants)
        .leftJoin(users, eq(boxBattleParticipants.userId, users.id))
        .where(eq(boxBattleParticipants.battleId, battle.id))
        .orderBy(boxBattleParticipants.position);

        return {
          ...battle,
          participants,
        };
      })
    );

    return battlesWithParticipants;
  }

  async createBattle(battleData: any): Promise<any> {
    const [battle] = await db.insert(boxBattles).values({
      boxId: battleData.boxId,
      createdBy: battleData.createdBy,
      entryFee: battleData.entryFee,
      maxPlayers: battleData.maxPlayers,
      totalRounds: battleData.totalRounds,
    }).returning();

    // Auto-join the creator
    await db.insert(boxBattleParticipants).values({
      battleId: battle.id,
      userId: battleData.createdBy,
      position: 1,
    });

    return battle;
  }

  async joinBattle(battleId: number, userId: number): Promise<any> {
    // Check if battle exists and has space
    const [battle] = await db.select()
      .from(boxBattles)
      .where(eq(boxBattles.id, battleId));

    if (!battle || battle.status !== "waiting") {
      throw new Error("Battle not available");
    }

    // Check current participants
    const participants = await db.select()
      .from(boxBattleParticipants)
      .where(eq(boxBattleParticipants.battleId, battleId));

    if (participants.length >= battle.maxPlayers) {
      throw new Error("Battle is full");
    }

    // Check if user already joined (but allow the creator to join their own battle if they haven't yet)
    const existingParticipant = participants.find(p => p.userId === userId);
    if (existingParticipant) {
      throw new Error("Already joined this battle");
    }

    // Join the battle
    const [participant] = await db.insert(boxBattleParticipants).values({
      battleId,
      userId,
      position: participants.length + 1,
    }).returning();

    // If battle is now full, start it
    if (participants.length + 1 >= battle.maxPlayers) {
      await this.updateBattleStatus(battleId, "active");
    }

    return participant;
  }

  async getBattle(battleId: number): Promise<any> {
    const [battle] = await db.select()
      .from(boxBattles)
      .where(eq(boxBattles.id, battleId));

    if (!battle) return null;

    // Get participants
    const participants = await db.select({
      id: boxBattleParticipants.id,
      userId: boxBattleParticipants.userId,
      position: boxBattleParticipants.position,
      totalValue: boxBattleParticipants.totalValue,
      username: users.username,
      joinedAt: boxBattleParticipants.joinedAt
    })
      .from(boxBattleParticipants)
      .leftJoin(users, eq(boxBattleParticipants.userId, users.id))
      .where(eq(boxBattleParticipants.battleId, battleId));

    // Get battle rounds
    const rounds = await db.select({
      id: boxBattleRounds.id,
      participantId: boxBattleRounds.participantId,
      roundNumber: boxBattleRounds.roundNumber,
      itemId: boxBattleRounds.itemId,
      itemValue: boxBattleRounds.itemValue,
      openedAt: boxBattleRounds.openedAt,
      itemName: items.name,
      itemIcon: items.icon,
      itemRarity: items.rarity
    })
      .from(boxBattleRounds)
      .leftJoin(items, eq(boxBattleRounds.itemId, items.id))
      .where(eq(boxBattleRounds.battleId, battleId));

    return {
      ...battle,
      participants,
      rounds
    };
  }

  async updateBattleStatus(battleId: number, status: string): Promise<void> {
    await db.update(boxBattles)
      .set({ 
        status,
        startedAt: status === "active" ? new Date() : undefined,
        finishedAt: status === "finished" ? new Date() : undefined,
      })
      .where(eq(boxBattles.id, battleId));
  }

  async simulateJoinBattle(battleId: number): Promise<any> {
    // Create a simulated participant for demo purposes
    const [participant] = await db.insert(boxBattleParticipants).values({
      battleId,
      userId: 999, // Simulated user ID
      position: 2,
      totalValue: 0,
      joinedAt: new Date()
    }).returning();

    return participant;
  }

  async openBox(boxId: number, userId: number): Promise<BoxOpeningResult> {
    // Get the box and its items
    const box = await this.getBoxWithItems(boxId);
    if (!box) {
      throw new Error("Box not found");
    }

    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Calculate total weight for random selection
    const totalWeight = box.items.reduce((sum, item) => sum + item.dropChance, 0);
    const randomValue = Math.floor(Math.random() * totalWeight);

    // Select item based on weighted probability
    let currentWeight = 0;
    let selectedItem = box.items[0]; // fallback to first item

    for (const item of box.items) {
      currentWeight += item.dropChance;
      if (randomValue < currentWeight) {
        selectedItem = item;
        break;
      }
    }

    // Record the box opening
    await this.recordBoxOpening({
      userId,
      boxId,
      itemId: selectedItem.id,
      openedAt: new Date(),
    });

    // Add item to user's inventory
    await this.addUserItem({
      userId,
      itemId: selectedItem.id,
      quantity: 1,
    });

    return {
      item: selectedItem,
      user,
      success: true,
    };
  }

  // Fairness proof operations
  async createFairnessProof(proof: InsertFairnessProof): Promise<FairnessProof> {
    const [fairnessProof] = await db
      .insert(fairnessProofs)
      .values(proof)
      .returning();
    return fairnessProof;
  }

  async getFairnessProof(id: number): Promise<FairnessProof | undefined> {
    const [proof] = await db
      .select()
      .from(fairnessProofs)
      .where(eq(fairnessProofs.id, id));
    return proof;
  }

  async getUserFairnessProofs(userId: number): Promise<FairnessProof[]> {
    return await db
      .select()
      .from(fairnessProofs)
      .where(eq(fairnessProofs.userId, userId))
      .orderBy(desc(fairnessProofs.createdAt));
  }

  async revealFairnessProof(id: number): Promise<FairnessProof | undefined> {
    const [proof] = await db
      .update(fairnessProofs)
      .set({ revealed: true })
      .where(eq(fairnessProofs.id, id))
      .returning();
    return proof;
  }

  async verifyFairnessProof(id: number): Promise<boolean> {
    const proof = await this.getFairnessProof(id);
    if (!proof) return false;

    // Import fairness system for verification
    const { FairnessSystem } = await import('./fairness');
    
    // We would need the actual result to verify completely
    // For now, we verify the hash construction is valid
    const expectedCombinedHash = FairnessSystem.createCombinedHash(
      proof.serverSeed,
      proof.clientSeed,
      proof.nonce
    );
    
    return expectedCombinedHash === proof.combinedHash;
  }

  async getUserBoxOpenings(userId: string | number, timeframe?: string): Promise<BoxOpening[]> {
    let query = db.select().from(boxOpenings).where(eq(boxOpenings.userId, String(userId)));
    
    // Filter by timeframe if provided
    if (timeframe && timeframe !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      query = query.where(and(
        eq(boxOpenings.userId, String(userId)),
        gte(boxOpenings.openedAt, startDate)
      ));
    }
    
    return await query.orderBy(desc(boxOpenings.openedAt));
  }

  async getUserBoxOpeningsWithDetails(userId: number, timeframe?: string): Promise<any[]> {
    const openings = await this.getUserBoxOpenings(userId, timeframe);
    const boxes = await this.getAllBoxes();
    const items = await this.getAllItems();
    
    return openings.map(opening => {
      const box = boxes.find(b => b.id === opening.boxId);
      const item = items.find(i => i.id === opening.itemId);
      
      const cost = box?.price || 0;
      const itemValue = item?.value || 0;
      const profit = itemValue - cost;
      
      return {
        id: opening.id,
        boxName: box?.name || 'Unknown Box',
        itemName: item?.name || 'Unknown Item',
        itemValue,
        itemRarity: item?.rarity || 'common',
        cost,
        profit,
        openedAt: opening.openedAt
      };
    });
  }

  // Promotional features operations
  async getDailyRewards(userId: number): Promise<DailyReward[]> {
    try {
      const rewards: DailyReward[] = [];
      const currentStreak = await this.getUserLoginStreak(userId);
      const today = new Date();
      
      // Get claimed rewards for this week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const claimedThisWeek = await db
        .select()
        .from(dailyRewardsTable)
        .where(and(
          eq(dailyRewardsTable.userId, userId),
          gte(dailyRewardsTable.claimedAt, startOfWeek)
        ));
      
      const claimedDays = new Set(claimedThisWeek.map(r => r.day));
      
      for (let day = 1; day <= 7; day++) {
        const baseCoins = 50 + (day * 25);
        const baseGems = day === 7 ? 10 : Math.floor(day / 3);
        
        rewards.push({
          day,
          coins: baseCoins,
          gems: baseGems,
          bonus: day === 7 ? "Bonus Multiplier" : undefined,
          claimed: claimedDays.has(day),
          available: day <= currentStreak + 1 && !claimedDays.has(day)
        });
      }
      
      return rewards;
    } catch (error) {
      console.error("Error fetching daily rewards:", error);
      return [];
    }
  }

  async getUserReferralData(userId: number): Promise<any> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");
      
      // Generate referral code based on user ID
      const referralCode = `REF${userId.toString().padStart(6, '0')}`;
      
      return {
        referralCode,
        referralsCount: 0,
        totalEarnings: 0,
        referralHistory: []
      };
    } catch (error) {
      console.error("Error fetching referral data:", error);
      throw error;
    }
  }

  // Shipping operations
  async getUserShippingAddresses(userId: number): Promise<ShippingAddress[]> {
    try {
      const addresses = await db.select()
        .from(shippingAddresses)
        .where(eq(shippingAddresses.userId, userId))
        .orderBy(desc(shippingAddresses.isDefault), desc(shippingAddresses.createdAt));
      return addresses;
    } catch (error) {
      console.error("Error fetching user shipping addresses:", error);
      throw error;
    }
  }

  async createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress> {
    try {
      // If this is being set as default, unset all other defaults for this user
      if (address.isDefault) {
        await db.update(shippingAddresses)
          .set({ isDefault: false })
          .where(eq(shippingAddresses.userId, address.userId));
      }

      const [newAddress] = await db.insert(shippingAddresses)
        .values({
          ...address,
          updatedAt: new Date()
        })
        .returning();
      
      return newAddress;
    } catch (error) {
      console.error("Error creating shipping address:", error);
      throw error;
    }
  }

  async updateShippingAddress(id: number, updates: Partial<InsertShippingAddress>): Promise<ShippingAddress | undefined> {
    try {
      // If setting as default, unset all other defaults for this user
      if (updates.isDefault) {
        const address = await db.select().from(shippingAddresses).where(eq(shippingAddresses.id, id)).limit(1);
        if (address.length > 0) {
          await db.update(shippingAddresses)
            .set({ isDefault: false })
            .where(eq(shippingAddresses.userId, address[0].userId));
        }
      }

      const [updatedAddress] = await db.update(shippingAddresses)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(shippingAddresses.id, id))
        .returning();
      
      return updatedAddress;
    } catch (error) {
      console.error("Error updating shipping address:", error);
      throw error;
    }
  }

  async deleteShippingAddress(id: number): Promise<boolean> {
    try {
      const result = await db.delete(shippingAddresses)
        .where(eq(shippingAddresses.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting shipping address:", error);
      return false;
    }
  }

  async setDefaultShippingAddress(userId: number, addressId: number): Promise<boolean> {
    try {
      // First unset all defaults for this user
      await db.update(shippingAddresses)
        .set({ isDefault: false })
        .where(eq(shippingAddresses.userId, userId));

      // Then set the new default
      await db.update(shippingAddresses)
        .set({ 
          isDefault: true,
          updatedAt: new Date()
        })
        .where(and(
          eq(shippingAddresses.id, addressId),
          eq(shippingAddresses.userId, userId)
        ));

      return true;
    } catch (error) {
      console.error("Error setting default shipping address:", error);
      return false;
    }
  }

  async createShipmentOrder(order: InsertShipmentOrder): Promise<ShipmentOrder> {
    try {
      const [newOrder] = await db.insert(shipmentOrders)
        .values({
          ...order,
          updatedAt: new Date()
        })
        .returning();
      
      return newOrder;
    } catch (error) {
      console.error("Error creating shipment order:", error);
      throw error;
    }
  }

  async getUserShipmentOrders(userId: number): Promise<ShipmentOrder[]> {
    try {
      const orders = await db.select()
        .from(shipmentOrders)
        .where(eq(shipmentOrders.userId, userId))
        .orderBy(desc(shipmentOrders.createdAt));
      return orders;
    } catch (error) {
      console.error("Error fetching user shipment orders:", error);
      throw error;
    }
  }

  async updateShipmentStatus(orderId: number, status: string, trackingNumber?: string, carrier?: string): Promise<ShipmentOrder | undefined> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (carrier) updateData.carrier = carrier;
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'delivered') updateData.deliveredAt = new Date();

      const [updatedOrder] = await db.update(shipmentOrders)
        .set(updateData)
        .where(eq(shipmentOrders.id, orderId))
        .returning();
      
      return updatedOrder;
    } catch (error) {
      console.error("Error updating shipment status:", error);
      throw error;
    }
  }

  async getShipmentOrder(orderId: number): Promise<ShipmentOrder | undefined> {
    try {
      const [order] = await db.select()
        .from(shipmentOrders)
        .where(eq(shipmentOrders.id, orderId));
      return order;
    } catch (error) {
      console.error("Error fetching shipment order:", error);
      return undefined;
    }
  }

  // Battle methods
  async createBattle(battle: any): Promise<any> {
    try {
      const [newBattle] = await db.insert(boxBattles)
        .values({
          boxId: battle.boxId,
          createdBy: battle.createdBy,
          entryFee: battle.entryFee.toString(),
          maxPlayers: battle.maxPlayers,
          totalRounds: battle.totalRounds,
          status: 'waiting',
          currentRound: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newBattle;
    } catch (error) {
      console.error("Error creating battle:", error);
      throw error;
    }
  }

  async joinBattle(battleId: number, userId: number): Promise<any> {
    try {
      // Check if user already joined
      const existing = await db.select()
        .from(boxBattleParticipants)
        .where(and(
          eq(boxBattleParticipants.battleId, battleId),
          eq(boxBattleParticipants.userId, userId)
        ));

      if (existing.length > 0) {
        throw new Error('Already joined this battle');
      }

      // Check battle capacity
      const battle = await this.getBattleWithParticipants(battleId);
      if (!battle) {
        throw new Error('Battle not found');
      }

      if (battle.participants.length >= battle.maxPlayers) {
        throw new Error('Battle is full');
      }

      if (battle.status !== 'waiting') {
        throw new Error('Battle has already started');
      }

      // Calculate the next position
      const nextPosition = battle.participants.length + 1;

      const [participant] = await db.insert(boxBattleParticipants)
        .values({
          battleId,
          userId,
          position: nextPosition,
          totalValue: 0,
          joinedAt: new Date()
        })
        .returning();

      return participant;
    } catch (error) {
      console.error("Error joining battle:", error);
      throw error;
    }
  }

  async getActiveBattles(): Promise<any[]> {
    try {
      // Get all battles with basic info
      const battles = await db.select().from(boxBattles).orderBy(desc(boxBattles.createdAt));
      
      // For each battle, get additional info
      const battlesWithData = await Promise.all(
        battles.map(async (battle) => {
          // Get box info
          const [box] = await db.select().from(boxes).where(eq(boxes.id, battle.boxId));
          
          // Get participant count
          const participantCount = await db.select({ count: sql`count(*)` })
            .from(boxBattleParticipants)
            .where(eq(boxBattleParticipants.battleId, battle.id));
          
          return {
            ...battle,
            entryFee: parseFloat(battle.entryFee),
            box: box ? {
              id: box.id,
              name: box.name,
              price: parseFloat(box.price),
              imageUrl: box.imageUrl || ''
            } : null,
            participantCount: participantCount[0]?.count || 0
          };
        })
      );

      return battlesWithData;
    } catch (error) {
      console.error("Error fetching active battles:", error);
      return [];
    }
  }

  async getBattleWithParticipants(battleId: number): Promise<any | null> {
    try {
      const [battle] = await db.select({
        id: boxBattles.id,
        boxId: boxBattles.boxId,
        createdBy: boxBattles.createdBy,
        entryFee: boxBattles.entryFee,
        maxPlayers: boxBattles.maxPlayers,
        totalRounds: boxBattles.totalRounds,
        status: boxBattles.status,
        currentRound: boxBattles.currentRound,
        winnerId: boxBattles.winnerId,
        createdAt: boxBattles.createdAt,
        boxName: boxes.name,
        boxPrice: boxes.price,
        boxImageUrl: boxes.imageUrl
      })
      .from(boxBattles)
      .leftJoin(boxes, eq(boxBattles.boxId, boxes.id))
      .where(eq(boxBattles.id, battleId));

      if (!battle) return null;

      const participants = await db.select({
        id: boxBattleParticipants.id,
        userId: boxBattleParticipants.userId,
        username: users.username,
        totalValue: boxBattleParticipants.totalValue,
        isEliminated: boxBattleParticipants.isEliminated
      })
      .from(boxBattleParticipants)
      .leftJoin(users, eq(boxBattleParticipants.userId, users.id))
      .where(eq(boxBattleParticipants.battleId, battleId));

      return {
        ...battle,
        box: {
          id: battle.boxId,
          name: battle.boxName || 'Unknown Box',
          price: parseFloat(battle.boxPrice || '0'),
          imageUrl: battle.boxImageUrl || ''
        },
        participants: participants.map(p => ({
          ...p,
          totalValue: parseFloat(p.totalValue || '0')
        }))
      };
    } catch (error) {
      console.error("Error fetching battle with participants:", error);
      return null;
    }
  }

  async getAllShipmentOrders(): Promise<ShipmentOrder[]> {
    try {
      const orders = await db.select()
        .from(shipmentOrders)
        .orderBy(desc(shipmentOrders.createdAt));
      return orders;
    } catch (error) {
      console.error("Error fetching all shipment orders:", error);
      throw error;
    }
  }

  async getActivePromotions(userId: number): Promise<any[]> {
    try {
      const userOpenings = await this.getUserBoxOpenings(userId);
      const casesOpened = userOpenings.length;
      
      const promotions = [
        {
          id: 1,
          title: "Welcome Bonus",
          description: "Complete your first case opening to earn bonus rewards",
          type: "special_event",
          reward: { coins: 500, gems: 5 },
          requirements: ["Open your first mystery box"],
          progress: Math.min(casesOpened, 1),
          maxProgress: 1,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          claimed: false
        },
        {
          id: 2,
          title: "Weekend Warrior",
          description: "Open 10 cases during the weekend for special rewards",
          type: "limited_time",
          reward: { coins: 1000, gems: 15 },
          requirements: ["Open 10 mystery boxes", "Complete during weekend"],
          progress: Math.min(casesOpened, 10),
          maxProgress: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          claimed: false
        }
      ];
      
      return promotions;
    } catch (error) {
      console.error("Error fetching active promotions:", error);
      return [];
    }
  }

  async redeemPromoCode(userId: number, code: string): Promise<any> {
    try {
      const validCodes: { [key: string]: any } = {
        'WELCOME2024': { coins: 500, gems: 5, description: 'Welcome bonus' },
        'NEWUSER': { coins: 250, gems: 3, description: 'New user bonus' },
        'WEEKEND': { coins: 200, gems: 2, description: 'Weekend special' }
      };
      
      if (!validCodes[code]) {
        throw new Error("Invalid or expired promo code");
      }
      
      const reward = validCodes[code];
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");
      
      await this.updateUser(userId, {
        goldCoins: user.goldCoins + reward.coins
      });
      
      return {
        message: `Promo code redeemed! You received ${reward.coins} coins${reward.gems ? ` and ${reward.gems} gems` : ''}!`,
        reward
      };
    } catch (error) {
      console.error("Error redeeming promo code:", error);
      throw error;
    }
  }

  async claimPromotion(userId: number, promotionId: number): Promise<any> {
    try {
      const promotions = await this.getActivePromotions(userId);
      const promotion = promotions.find(p => p.id === promotionId);
      
      if (!promotion) {
        throw new Error("Promotion not found");
      }
      
      if (promotion.progress < promotion.maxProgress) {
        throw new Error("Promotion requirements not met");
      }
      
      if (promotion.claimed) {
        throw new Error("Promotion already claimed");
      }
      
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");
      
      if (promotion.reward.coins) {
        await this.updateUser(userId, {
          goldCoins: user.goldCoins + promotion.reward.coins
        });
      }
      
      return {
        message: `Promotion claimed! You received ${promotion.reward.coins || 0} coins${promotion.reward.gems ? ` and ${promotion.reward.gems} gems` : ''}!`,
        reward: promotion.reward
      };
    } catch (error) {
      console.error("Error claiming promotion:", error);
      throw error;
    }
  }

  // Favorites operations
  async addToFavorites(userId: number, boxId: number): Promise<UserFavorite> {
    const [favorite] = await db
      .insert(userFavorites)
      .values({ userId, boxId })
      .returning();
    return favorite;
  }

  async removeFromFavorites(userId: number, boxId: number): Promise<void> {
    await db
      .delete(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.boxId, boxId)
      ));
  }

  async getUserFavorites(userId: number): Promise<Box[]> {
    const favorites = await db
      .select({
        box: boxes,
      })
      .from(userFavorites)
      .innerJoin(boxes, eq(userFavorites.boxId, boxes.id))
      .where(eq(userFavorites.userId, userId));

    return favorites.map(f => f.box);
  }

  async isFavorited(userId: number, boxId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.boxId, boxId)
      ))
      .limit(1);
    
    return !!favorite;
  }

  // Legal page operations
  async getAllLegalPages(): Promise<LegalPage[]> {
    try {
      return await db.select().from(legalPages).orderBy(legalPages.slug);
    } catch (error) {
      console.error("Error fetching legal pages:", error);
      return [];
    }
  }

  async getLegalPageBySlug(slug: string): Promise<LegalPage | undefined> {
    try {
      const [page] = await db
        .select()
        .from(legalPages)
        .where(eq(legalPages.slug, slug))
        .limit(1);
      return page;
    } catch (error) {
      console.error("Error fetching legal page by slug:", error);
      return undefined;
    }
  }

  async createLegalPage(legalPage: InsertLegalPage): Promise<LegalPage> {
    const [page] = await db
      .insert(legalPages)
      .values(legalPage)
      .returning();
    return page;
  }

  async updateLegalPage(id: number, updates: Partial<InsertLegalPage>, userId?: number): Promise<LegalPage | undefined> {
    const updateData = {
      ...updates,
      lastUpdatedBy: userId,
      updatedAt: new Date()
    };

    const [page] = await db
      .update(legalPages)
      .set(updateData)
      .where(eq(legalPages.id, id))
      .returning();
    return page;
  }

  async deleteLegalPage(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(legalPages)
        .where(eq(legalPages.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting legal page:", error);
      return false;
    }
  }

  // Partner operations
  async getAllPartners(): Promise<Partner[]> {
    return await db.select().from(partners);
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async getPartnerBySlug(slug: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.slug, slug));
    return partner;
  }

  async createPartner(partnerData: any): Promise<Partner> {
    const [partner] = await db
      .insert(partners)
      .values({
        name: partnerData.name,
        slug: partnerData.slug,
        apiKey: partnerData.apiKey,
        type: partnerData.type,
        status: partnerData.status || 'pending',
        revenueShare: partnerData.revenueShare,
        contactEmail: partnerData.contactEmail,
        description: partnerData.description,
        websiteUrl: partnerData.websiteUrl,
        logoUrl: partnerData.logoUrl,
        primaryColor: partnerData.primaryColor,
        secondaryColor: partnerData.secondaryColor,
        customSettings: partnerData.customSettings ? JSON.stringify(partnerData.customSettings) : null,
        monthlyRevenue: 0,
        totalRevenue: 0,
        totalTransactions: 0
      })
      .returning();
    return partner;
  }

  async updatePartner(id: number, updates: any): Promise<Partner | undefined> {
    const [partner] = await db
      .update(partners)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(partners.id, id))
      .returning();
    return partner;
  }

  async updatePartnerWidgetConfig(id: number, widgetConfig: any): Promise<Partner | undefined> {
    const [partner] = await db
      .update(partners)
      .set({
        widgetConfig: JSON.stringify(widgetConfig),
        updatedAt: new Date()
      })
      .where(eq(partners.id, id))
      .returning();
    return partner;
  }

  async deletePartner(id: number): Promise<boolean> {
    try {
      await db.delete(partners).where(eq(partners.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting partner:", error);
      return false;
    }
  }

  async getPartnerStats(): Promise<any> {
    const allPartners = await this.getAllPartners();
    return {
      totalPartners: allPartners.length,
      activePartners: allPartners.filter(p => p.status === 'active').length,
      widgetPartners: allPartners.filter(p => p.type === 'widget' || p.type === 'hybrid').length,
      whitelabelPartners: allPartners.filter(p => p.type === 'whitelabel' || p.type === 'hybrid').length,
      totalRevenue: allPartners.reduce((sum, p) => sum + parseFloat(p.totalRevenue || '0'), 0),
      monthlyRevenue: allPartners.reduce((sum, p) => sum + parseFloat(p.monthlyRevenue || '0'), 0)
    };
  }

  async getAdminStats(): Promise<any> {
    const partners = await this.getAllPartners();
    const boxes = await db.select().from(boxes);
    const users = await db.select().from(users);
    
    return {
      totalPartners: partners.length,
      totalBoxes: boxes.length,
      totalUsers: users.length,
      activePartners: partners.filter(p => p.status === 'active').length,
      recentActivity: partners.length > 0 ? new Date().toISOString() : null
    };
  }

  async assignBoxesToPartner(partnerId: number, boxIds: number[]): Promise<void> {
    // Get ALL existing assignments to preserve featured status and enabled state
    const existingAssignments = await db
      .select()
      .from(partnerBoxes)
      .where(eq(partnerBoxes.partnerId, partnerId));
    
    // Create a map of existing box settings for ALL boxes (not just the ones being assigned)
    const existingSettings = new Map(
      existingAssignments.map(assignment => [
        assignment.boxId,
        {
          isFeatured: assignment.isFeatured,
          isEnabled: assignment.isEnabled,
          customPrice: assignment.customPrice
        }
      ])
    );
    
    // Delete existing assignments
    await db.delete(partnerBoxes).where(eq(partnerBoxes.partnerId, partnerId));
    
    // Insert new assignments with preserved settings
    if (boxIds.length > 0) {
      await db.insert(partnerBoxes).values(
        boxIds.map(boxId => {
          const existing = existingSettings.get(boxId);
          
          // For boxes being assigned:
          // - If they were previously assigned, preserve their enabled state
          // - If they were NOT previously assigned, they should be enabled by default
          const isEnabled = existing?.isEnabled ?? true;
          
          // CRITICAL: Preserve featured status for boxes that were previously featured
          // Only clear featured status if the box is being disabled
          const isFeatured = isEnabled ? (existing?.isFeatured ?? false) : false;
          
          return {
            partnerId,
            boxId,
            isEnabled,
            isFeatured,
            customPrice: existing?.customPrice
          };
        })
      );
    }
  }

  async updatePartnerBoxFeatured(partnerId: number, boxId: number, isFeatured: boolean): Promise<void> {
    await db
      .update(partnerBoxes)
      .set({ isFeatured })
      .where(
        and(
          eq(partnerBoxes.partnerId, partnerId),
          eq(partnerBoxes.boxId, boxId)
        )
      );
  }

  async getPartnerBoxes(partnerId: number): Promise<any[]> {
    const result = await db
      .select({
        id: boxes.id,
        name: boxes.name,
        description: boxes.description,
        price: boxes.price,
        imageUrl: boxes.imageUrl,
        rarity: boxes.rarity,
        featured: boxes.featured,
        isFeatured: partnerBoxes.isFeatured
      })
      .from(partnerBoxes)
      .innerJoin(boxes, eq(boxes.id, partnerBoxes.boxId))
      .where(eq(partnerBoxes.partnerId, partnerId));
    
    return result;
  }

  async updatePartnerWidgetConfig(partnerId: number, widgetConfig: any): Promise<void> {
    await db
      .update(partners)
      .set({
        widgetConfig: JSON.stringify(widgetConfig),
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));
  }

  // Whitelabel site domain lookup
  async getWhitelabelSiteByDomain(domain: string): Promise<any> {
    try {
      const [site] = await db
        .select()
        .from(whitelabelSites)
        .where(or(
          eq(whitelabelSites.primaryDomain, domain),
          eq(whitelabelSites.subdomain, domain)
        ));
      return site;
    } catch (error) {
      console.error("Error finding whitelabel site by domain:", error);
      return null;
    }
  }

  // Get boxes assigned to a whitelabel site
  async getWhitelabelSiteBoxes(whitelabelId: string): Promise<any[]> {
    try {
      // Get the whitelabel site configuration
      const [site] = await db
        .select()
        .from(whitelabelSites)
        .where(eq(whitelabelSites.whitelabelId, whitelabelId));
      
      if (!site) {
        return [];
      }
      
      // Get the feature config which contains enabled boxes
      const featureConfig = site.featureConfig as any;
      const enabledBoxes = featureConfig?.enabledBoxes || {};
      
      // Get all boxes and filter by enabled status
      const allBoxes = await db.select().from(boxes);
      
      return allBoxes.map(box => ({
        ...box,
        featured: enabledBoxes[box.id] !== false // Default to true unless explicitly disabled
      }));
    } catch (error) {
      console.error("Error fetching whitelabel site boxes:", error);
      return [];
    }
  }

  // Whitelabel operations
  async getAllWhitelabelSites(): Promise<WhitelabelSite[]> {
    return await db.select().from(whitelabelSites);
  }

  async getWhitelabelSite(id: number): Promise<WhitelabelSite | undefined> {
    const [site] = await db.select().from(whitelabelSites).where(eq(whitelabelSites.id, id));
    return site;
  }

  async createWhitelabelSite(siteData: InsertWhitelabelSite): Promise<WhitelabelSite> {
    const [site] = await db
      .insert(whitelabelSites)
      .values(siteData)
      .returning();
    return site;
  }

  async updateWhitelabelSite(id: number, updates: Partial<InsertWhitelabelSite>): Promise<WhitelabelSite | undefined> {
    const [site] = await db
      .update(whitelabelSites)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(whitelabelSites.id, id))
      .returning();
    return site;
  }

  async updateWhitelabelSiteByWhitelabelId(whitelabelId: string, updates: any): Promise<WhitelabelSite | undefined> {
    const [site] = await db
      .update(whitelabelSites)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(whitelabelSites.whitelabelId, whitelabelId))
      .returning();
    return site;
  }

  async deleteWhitelabelSite(id: number): Promise<boolean> {
    try {
      await db.delete(whitelabelSites).where(eq(whitelabelSites.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting whitelabel site:", error);
      return false;
    }
  }

  // Box-Product management operations
  async addItemToBox(boxId: number, itemId: number, dropChance: number): Promise<any> {
    try {
      // Check if the item is already in the box
      const existingItems = await db.select().from(items).where(eq(items.caseId, boxId));
      const existingItem = existingItems.find(item => item.id === itemId);
      
      if (existingItem) {
        throw new Error("Item is already assigned to this box");
      }

      // Update the item to be associated with this box
      const [updatedItem] = await db
        .update(items)
        .set({ 
          caseId: boxId, 
          dropChance: dropChance 
        })
        .where(eq(items.id, itemId))
        .returning();

      return updatedItem;
    } catch (error) {
      console.error("Error adding item to box:", error);
      throw error;
    }
  }

  async removeItemFromBox(boxId: number, itemId: number): Promise<boolean> {
    try {
      // Remove the item from the box by setting caseId to null
      await db
        .update(items)
        .set({ caseId: null })
        .where(eq(items.id, itemId));

      return true;
    } catch (error) {
      console.error("Error removing item from box:", error);
      return false;
    }
  }

  async updateItemDropChance(boxId: number, itemId: number, dropChance: number): Promise<any> {
    try {
      const [updatedItem] = await db
        .update(items)
        .set({ dropChance: dropChance })
        .where(eq(items.id, itemId))
        .returning();

      return updatedItem;
    } catch (error) {
      console.error("Error updating item drop chance:", error);
      throw error;
    }
  }

  async getBoxItems(boxId: number): Promise<any[]> {
    try {
      const boxItems = await db
        .select()
        .from(items)
        .where(eq(items.boxId, boxId));
      
      return boxItems;
    } catch (error) {
      console.error("Error fetching box items:", error);
      return [];
    }
  }

  // Whitelabel operations implementation
  async getAllWhitelabelSites(): Promise<WhitelabelSite[]> {
    try {
      return await db.select().from(whitelabelSites);
    } catch (error) {
      console.error("Error fetching whitelabel sites:", error);
      throw error;
    }
  }

  async getWhitelabelSite(id: number): Promise<WhitelabelSite | undefined> {
    try {
      const [site] = await db.select().from(whitelabelSites).where(eq(whitelabelSites.id, id));
      return site;
    } catch (error) {
      console.error("Error fetching whitelabel site:", error);
      return undefined;
    }
  }

  async getWhitelabelById(whitelabelId: string): Promise<WhitelabelSite | undefined> {
    try {
      const [site] = await db.select().from(whitelabelSites).where(eq(whitelabelSites.whitelabelId, whitelabelId));
      return site;
    } catch (error) {
      console.error("Error fetching whitelabel by ID:", error);
      return undefined;
    }
  }

  async getWhitelabelBoxes(whitelabelId: string, featuredOnly?: boolean): Promise<Box[]> {
    try {
      let query = db
        .select({
          id: boxes.id,
          name: boxes.name,
          description: boxes.description,
          price: boxes.price,
          imageUrl: boxes.imageUrl,
          category: boxes.category,
          rarity: boxes.rarity,
          guaranteed: boxes.guaranteed,
          featured: boxes.featured,
          createdAt: boxes.createdAt,
          updatedAt: boxes.updatedAt
        })
        .from(whitelabelBoxes)
        .innerJoin(boxes, eq(whitelabelBoxes.boxId, boxes.id))
        .innerJoin(whitelabelSites, eq(whitelabelBoxes.whitelabelId, whitelabelSites.id))
        .where(and(
          eq(whitelabelSites.whitelabelId, whitelabelId),
          eq(whitelabelBoxes.enabled, true)
        ));

      if (featuredOnly) {
        query = query.where(and(
          eq(whitelabelSites.whitelabelId, whitelabelId),
          eq(whitelabelBoxes.enabled, true),
          eq(whitelabelBoxes.featured, true)
        ));
      }

      return await query;
    } catch (error) {
      console.error("Error fetching whitelabel boxes:", error);
      return [];
    }
  }

  async getWhitelabelRecentOpenings(whitelabelId: string): Promise<any[]> {
    try {
      // Create mock recent wins data matching casino game wins
      const mockRecentWins = [
        {
          id: 1,
          username: "CryptoKing",
          itemName: "Golden AK-47",
          itemValue: "2,847.50",
          itemRarity: "legendary",
          boxName: "Premium Gold Box",
          openedAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        },
        {
          id: 2,
          username: "LuckyPlayer",
          itemName: "Diamond Ring",
          itemValue: "1,299.99",
          itemRarity: "epic",
          boxName: "Luxury Designer Box",
          openedAt: new Date(Date.now() - 12 * 60 * 1000) // 12 minutes ago
        },
        {
          id: 3,
          username: "GamerPro",
          itemName: "PlayStation 5",
          itemValue: "899.00",
          itemRarity: "rare",
          boxName: "Tech Gadget Box",
          openedAt: new Date(Date.now() - 18 * 60 * 1000) // 18 minutes ago
        },
        {
          id: 4,
          username: "WinnerXYZ",
          itemName: "Gaming Laptop",
          itemValue: "1,599.99",
          itemRarity: "epic",
          boxName: "Tech Gadget Box",
          openedAt: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
        },
        {
          id: 5,
          username: "BoxMaster",
          itemName: "Rolex Watch",
          itemValue: "8,750.00",
          itemRarity: "legendary",
          boxName: "Luxury Designer Box",
          openedAt: new Date(Date.now() - 32 * 60 * 1000) // 32 minutes ago
        },
        {
          id: 6,
          username: "PlayerOne",
          itemName: "iPhone 15 Pro",
          itemValue: "1,199.00",
          itemRarity: "rare",
          boxName: "Tech Gadget Box", 
          openedAt: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
        }
      ];

      return mockRecentWins;
    } catch (error) {
      console.error("Error fetching whitelabel recent openings:", error);
      return [];
    }
  }

  async getWhitelabelActiveBattles(whitelabelId: string): Promise<any[]> {
    try {
      // Create mock battle data that matches the design from the screenshot
      const mockBattles = [
        {
          id: 1,
          currentRound: 34,
          totalRounds: 40,
          battleType: "NORMAL",
          battlePrice: 322.00,
          participants: [
            { username: "Player1", avatar: "🔥", eliminated: false },
            { username: "Player2", avatar: "🎯", eliminated: true },
            { username: "Player3", avatar: "⚡", eliminated: true },
            { username: "Player4", avatar: "🎪", eliminated: false }
          ],
          boxes: Array(6).fill(null).map((_, i) => ({
            id: i,
            opened: i < 4,
            winner: i === 4 ? "Player1" : null,
            item: i < 4 ? { name: `Item ${i+1}`, rarity: "rare" } : null,
            boxName: i < 2 ? 'Premium Gold Box' : i < 4 ? 'Tech Gadget Box' : 'Luxury Designer Box',
            image: i < 2 ? '/api/cdn/images/1748957429409_switchUP.webp' : 
                   i < 4 ? '/api/cdn/images/1748957504598_games.webp' : 
                   '/api/cdn/images/1748957219599_xbox.webp'
          }))
        },
        {
          id: 2,
          currentRound: 6,
          totalRounds: 10,
          battleType: "CRAZY",
          battlePrice: 119.54,
          participants: [
            { username: "Alex", avatar: "🎮", eliminated: false },
            { username: "Sam", avatar: "🎯", eliminated: true },
            { username: "Jordan", avatar: "🔥", eliminated: false }
          ],
          boxes: Array(6).fill(null).map((_, i) => ({
            id: i,
            opened: i < 3,
            winner: i === 2 ? "Alex" : null,
            item: i < 3 ? { name: `Prize ${i+1}`, rarity: "epic" } : null,
            boxName: i < 3 ? 'Starter Mystery Box' : 'Premium Gold Box',
            image: i < 3 ? '/api/cdn/images/1748956957888_5331a900378cb512d74bb67e9148fcb8.webp' : 
                   '/api/cdn/images/1748957429409_switchUP.webp'
          }))
        },
        {
          id: 3,
          currentRound: 11,
          totalRounds: 13,
          battleType: "JACKPOT",
          battlePrice: 8.32,
          participants: [
            { username: "Chris", avatar: "💎", eliminated: false },
            { username: "Taylor", avatar: "🎯", eliminated: true },
            { username: "Morgan", avatar: "🔥", eliminated: true },
            { username: "Casey", avatar: "⭐", eliminated: false },
            { username: "Riley", avatar: "🎪", eliminated: true }
          ],
          boxes: Array(6).fill(null).map((_, i) => ({
            id: i,
            opened: i < 2,
            winner: i === 1 ? "Chris" : null,
            item: i < 2 ? { name: `Jackpot ${i+1}`, rarity: "legendary" } : null,
            boxName: i < 2 ? 'Tech Gadget Box' : i < 4 ? 'Luxury Designer Box' : 'Starter Mystery Box',
            image: i < 2 ? '/api/cdn/images/1748957504598_games.webp' : 
                   i < 4 ? '/api/cdn/images/1748957219599_xbox.webp' : 
                   '/api/cdn/images/1748956957888_5331a900378cb512d74bb67e9148fcb8.webp'
          }))
        }
      ];

      return mockBattles;
    } catch (error) {
      console.error("Error fetching whitelabel battles:", error);
      return [];
    }
  }

  async getWhitelabelSiteByWhitelabelId(whitelabelId: string): Promise<WhitelabelSite | undefined> {
    try {
      const [site] = await db.select().from(whitelabelSites).where(eq(whitelabelSites.whitelabelId, whitelabelId));
      return site || undefined;
    } catch (error) {
      console.error("Error fetching whitelabel site:", error);
      throw error;
    }
  }

  async createWhitelabelSite(site: any): Promise<WhitelabelSite> {
    try {
      const [createdSite] = await db.insert(whitelabelSites).values(site).returning();
      return createdSite;
    } catch (error) {
      console.error("Error creating whitelabel site:", error);
      throw error;
    }
  }

  async getWhitelabelSiteByWhitelabelId(whitelabelId: string): Promise<WhitelabelSite | undefined> {
    try {
      const [site] = await db
        .select()
        .from(whitelabelSites)
        .where(eq(whitelabelSites.whitelabelId, whitelabelId));
      return site || undefined;
    } catch (error) {
      console.error("Error fetching whitelabel site by whitelabel ID:", error);
      throw error;
    }
  }

  async updateWhitelabelSite(id: number, updates: any): Promise<WhitelabelSite | undefined> {
    try {
      // Get the current site to merge JSONB fields properly
      const currentSite = await this.getWhitelabelSite(id);
      if (!currentSite) {
        return undefined;
      }

      // Merge JSONB configurations properly
      const mergedUpdates: any = { ...updates, updatedAt: new Date() };
      
      if (updates.brandingConfig) {
        mergedUpdates.brandingConfig = {
          ...(currentSite.brandingConfig || {}),
          ...updates.brandingConfig
        };
      }
      
      if (updates.themeConfig) {
        mergedUpdates.themeConfig = {
          ...(currentSite.themeConfig || {}),
          ...updates.themeConfig
        };
      }
      
      if (updates.contentConfig) {
        mergedUpdates.contentConfig = {
          ...(currentSite.contentConfig || {}),
          ...updates.contentConfig
        };
      }
      
      if (updates.seoConfig) {
        mergedUpdates.seoConfig = {
          ...(currentSite.seoConfig || {}),
          ...updates.seoConfig
        };
      }
      
      if (updates.featureConfig) {
        mergedUpdates.featureConfig = {
          ...(currentSite.featureConfig || {}),
          ...updates.featureConfig
        };
      }
      
      if (updates.paymentConfig) {
        mergedUpdates.paymentConfig = {
          ...(currentSite.paymentConfig || {}),
          ...updates.paymentConfig
        };
      }
      
      if (updates.environmentConfig) {
        mergedUpdates.environmentConfig = {
          ...(currentSite.environmentConfig || {}),
          ...updates.environmentConfig
        };
      }

      const [updatedSite] = await db
        .update(whitelabelSites)
        .set(mergedUpdates)
        .where(eq(whitelabelSites.id, id))
        .returning();
      return updatedSite || undefined;
    } catch (error) {
      console.error("Error updating whitelabel site:", error);
      throw error;
    }
  }

  async updateWhitelabelSiteByWhitelabelId(whitelabelId: string, updates: any): Promise<WhitelabelSite | undefined> {
    try {
      // Get the current site to merge JSONB fields properly
      const currentSite = await this.getWhitelabelSiteByWhitelabelId(whitelabelId);
      if (!currentSite) {
        return undefined;
      }

      // Merge JSONB configurations properly
      const mergedUpdates: any = { ...updates, updatedAt: new Date() };
      
      if (updates.brandingConfig) {
        mergedUpdates.brandingConfig = {
          ...(currentSite.brandingConfig || {}),
          ...updates.brandingConfig
        };
      }
      
      if (updates.featureConfig) {
        mergedUpdates.featureConfig = {
          ...(currentSite.featureConfig || {}),
          ...updates.featureConfig
        };
      }
      
      if (updates.paymentConfig) {
        mergedUpdates.paymentConfig = {
          ...(currentSite.paymentConfig || {}),
          ...updates.paymentConfig
        };
      }
      
      if (updates.environmentConfig) {
        mergedUpdates.environmentConfig = {
          ...(currentSite.environmentConfig || {}),
          ...updates.environmentConfig
        };
      }

      const [updatedSite] = await db
        .update(whitelabelSites)
        .set(mergedUpdates)
        .where(eq(whitelabelSites.whitelabelId, whitelabelId))
        .returning();
      
      return updatedSite;
    } catch (error) {
      console.error("Error updating whitelabel site by whitelabel ID:", error);
      throw error;
    }
  }

  async deleteWhitelabelSite(id: number): Promise<boolean> {
    try {
      await db.delete(whitelabelSites).where(eq(whitelabelSites.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting whitelabel site:", error);
      return false;
    }
  }

  async getBoxesByWhitelabel(whitelabelId: string): Promise<Box[]> {
    try {
      // Get boxes associated with this whitelabel through the junction table
      const boxesWithAssociations = await db
        .select({
          box: boxes,
          whitelabelBox: whitelabelBoxes
        })
        .from(boxes)
        .innerJoin(whitelabelBoxes, eq(boxes.id, whitelabelBoxes.boxId))
        .where(and(
          eq(whitelabelBoxes.whitelabelId, whitelabelId),
          eq(whitelabelBoxes.enabled, true)
        ))
        .orderBy(whitelabelBoxes.displayOrder, boxes.name);

      return boxesWithAssociations.map(item => item.box);
    } catch (error) {
      console.error("Error fetching boxes for whitelabel:", error);
      return [];
    }
  }

  // Add box to whitelabel (creates association, doesn't delete from main inventory)
  async addBoxToWhitelabel(whitelabelId: string, boxId: number, config?: Partial<InsertWhitelabelBox>): Promise<WhitelabelBox> {
    try {
      const [association] = await db
        .insert(whitelabelBoxes)
        .values({
          whitelabelId,
          boxId,
          enabled: config?.enabled ?? true,
          featured: config?.featured ?? false,
          customPrice: config?.customPrice,
          customName: config?.customName,
          customDescription: config?.customDescription,
          displayOrder: config?.displayOrder ?? 0
        })
        .onConflictDoUpdate({
          target: [whitelabelBoxes.whitelabelId, whitelabelBoxes.boxId],
          set: {
            enabled: config?.enabled ?? true,
            featured: config?.featured ?? false,
            customPrice: config?.customPrice,
            customName: config?.customName,
            customDescription: config?.customDescription,
            displayOrder: config?.displayOrder ?? 0,
            updatedAt: new Date()
          }
        })
        .returning();
      
      return association;
    } catch (error) {
      console.error("Error adding box to whitelabel:", error);
      throw error;
    }
  }

  async updateWhitelabelBox(whitelabelId: string, boxId: number, updates: any): Promise<any> {
    try {
      const [updatedBox] = await db
        .update(whitelabelBoxes)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(whitelabelBoxes.whitelabelId, whitelabelId),
            eq(whitelabelBoxes.boxId, boxId)
          )
        )
        .returning();
      
      return updatedBox;
    } catch (error) {
      console.error("Error updating whitelabel box:", error);
      throw error;
    }
  }

  // Remove box from whitelabel (only removes association, preserves box in main inventory)
  async removeBoxFromWhitelabel(whitelabelId: string, boxId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(whitelabelBoxes)
        .where(and(
          eq(whitelabelBoxes.whitelabelId, whitelabelId),
          eq(whitelabelBoxes.boxId, boxId)
        ));
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error removing box from whitelabel:", error);
      return false;
    }
  }

  // Update whitelabel box settings (pricing, featured status, etc.)
  async updateWhitelabelBox(whitelabelId: string, boxId: number, updates: Partial<InsertWhitelabelBox>): Promise<WhitelabelBox | undefined> {
    try {
      const [updated] = await db
        .update(whitelabelBoxes)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(and(
          eq(whitelabelBoxes.whitelabelId, whitelabelId),
          eq(whitelabelBoxes.boxId, boxId)
        ))
        .returning();
      
      return updated;
    } catch (error) {
      console.error("Error updating whitelabel box:", error);
      return undefined;
    }
  }

  // Get whitelabel boxes with full box details and whitelabel-specific settings
  async getWhitelabelBoxes(whitelabelId: string, featuredOnly?: boolean): Promise<(Box & { whitelabelBox: WhitelabelBox })[]> {
    try {
      let whereCondition = eq(whitelabelBoxes.whitelabelId, whitelabelId);
      
      if (featuredOnly) {
        whereCondition = and(
          eq(whitelabelBoxes.whitelabelId, whitelabelId),
          eq(whitelabelBoxes.featured, true)
        );
      }

      const results = await db
        .select({
          box: boxes,
          whitelabelBox: whitelabelBoxes
        })
        .from(boxes)
        .innerJoin(whitelabelBoxes, eq(boxes.id, whitelabelBoxes.boxId))
        .where(whereCondition)
        .orderBy(whitelabelBoxes.displayOrder, boxes.name);

      return results.map(item => ({
        ...item.box,
        // Override featured status with whitelabel-specific setting
        featured: item.whitelabelBox.featured,
        whitelabelBox: item.whitelabelBox
      }));
    } catch (error) {
      console.error("Error fetching whitelabel boxes:", error);
      return [];
    }
  }

  async getBattlesByWhitelabel(whitelabelId: string): Promise<any[]> {
    try {
      // For now, return all battles - in production this would filter by whitelabel
      return await db.select().from(boxBattles);
    } catch (error) {
      console.error("Error fetching battles for whitelabel:", error);
      return [];
    }
  }

  async deleteBattle(battleId: number): Promise<boolean> {
    try {
      await db.delete(boxBattles).where(eq(boxBattles.id, battleId));
      return true;
    } catch (error) {
      console.error("Error deleting battle:", error);
      return false;
    }
  }

  // Partner/Whitelabel user association helper
  private createUserAssociation(userId: string, partner?: string, whitelabel?: string) {
    // Create a composite key that associates user with integration type
    if (partner) {
      return `partner:${partner}:${userId}`;
    } else if (whitelabel) {
      return `whitelabel:${whitelabel}:${userId}`;
    }
    return userId; // fallback for direct users
  }

  private parseUserAssociation(associationKey: string) {
    const parts = associationKey.split(':');
    if (parts.length === 3) {
      return {
        type: parts[0], // 'partner' or 'whitelabel'
        integrationId: parts[1],
        userId: parts[2]
      };
    }
    return { type: 'direct', integrationId: null, userId: associationKey };
  }

  // Partner B2B integration operations
  async recordPartnerPurchase(purchase: any): Promise<void> {
    const userAssociation = this.createUserAssociation(purchase.userId, purchase.partner);
    
    // Store in transactions with proper user association
    await db.insert(transactions).values({
      userId: parseInt(purchase.numericUserId || '1'), // Use numeric ID for DB compatibility
      type: 'purchase',
      amount: purchase.amount.toString(),
      description: `Partner Purchase: ${purchase.boxName} (${purchase.partner})`,
      method: purchase.paymentMethod,
      status: 'completed'
    });
  }

  async getUserInventory(userId: string, partner?: string, whitelabel?: string): Promise<any[]> {
    // Query user items directly from userItems table
    const result = await db
      .select({
        id: userItems.id,
        userId: userItems.userId,
        itemId: userItems.itemId,
        quantity: userItems.quantity,
        obtainedAt: userItems.obtainedAt,
        item: {
          id: items.id,
          name: items.name,
          description: items.description,
          rarity: items.rarity,
          icon: items.icon,
          value: items.value
        }
      })
      .from(userItems)
      .innerJoin(items, eq(userItems.itemId, items.id))
      .where(eq(userItems.userId, userId));

    // Group items by itemId and sum quantities
    const groupedItems = new Map();
    
    result.forEach(row => {
      const itemId = row.itemId;
      if (groupedItems.has(itemId)) {
        const existing = groupedItems.get(itemId);
        existing.quantity += row.quantity;
        // Keep the earliest acquisition date
        if (row.obtainedAt < existing.acquiredAt) {
          existing.acquiredAt = row.obtainedAt;
        }
      } else {
        groupedItems.set(itemId, {
          id: row.id,
          item: row.item,
          quantity: row.quantity,
          acquiredAt: row.obtainedAt
        });
      }
    });

    // Return grouped inventory items
    return Array.from(groupedItems.values());
  }

  async addItemToUserInventory(userId: string, item: any, partner?: string, whitelabel?: string): Promise<void> {
    const userAssociation = this.createUserAssociation(userId, partner, whitelabel);
    
    await db.insert(transactions).values({
      userId: parseInt(userId.replace(/[^0-9]/g, '')) || 1,
      type: 'item_received',
      amount: parseFloat(item.value || '0').toString(),
      description: `Received: ${item.name} (${partner || whitelabel || 'direct'})`,
      method: 'box_opening',
      status: 'completed'
    });
  }

  async getTransactionsByIntegration(integrationId: string, integrationType: 'partner' | 'whitelabel'): Promise<any[]> {
    // Query transactions based on integration type in description
    const searchPattern = integrationType === 'partner' 
      ? `%${integrationId}%` 
      : `%${integrationId}%`;
    
    const results = await db
      .select()
      .from(transactions)
      .where(sql`${transactions.description} LIKE ${searchPattern}`);
    
    return results;
  }

  async createMarketplaceListing(listing: any): Promise<void> {
    await db.insert(marketListings).values({
      userId: parseInt(listing.userId),
      itemId: parseInt(listing.itemId),
      price: listing.price,
      title: listing.itemName,
      description: `${listing.itemRarity} rarity item`,
      imageUrl: listing.itemImage,
      status: 'active',
      metadata: JSON.stringify({
        partner: listing.partner,
        originalItemId: listing.itemId,
        rarity: listing.itemRarity
      })
    });
  }

  async markItemAsListed(userId: string, itemId: string, partner: string): Promise<void> {
    await db.insert(transactions).values({
      userId: parseInt(userId),
      type: 'item_listed',
      amount: 0,
      description: `Listed item ${itemId} in marketplace`,
      metadata: JSON.stringify({
        partner: partner,
        itemId: itemId,
        status: 'listed'
      })
    });
  }

  async getMarketplaceListings(partner: string): Promise<any[]> {
    const listings = await db
      .select()
      .from(marketListings)
      .where(eq(marketListings.status, 'active'));

    return listings
      .filter(listing => {
        try {
          const metadata = JSON.parse(listing.metadata || '{}');
          return metadata.partner === partner;
        } catch {
          return false;
        }
      })
      .map(listing => ({
        id: listing.id,
        userId: listing.userId,
        itemName: listing.title,
        itemImage: listing.imageUrl,
        price: listing.price,
        listedAt: listing.createdAt,
        partner: partner
      }));
  }

  async openBox(boxId: number, userId?: string): Promise<BoxOpeningResult> {
    const box = await this.getBox(boxId);
    if (!box) {
      throw new Error('Box not found');
    }

    const boxItems = await this.getItemsByBox(boxId);
    if (boxItems.length === 0) {
      throw new Error('No items in box');
    }

    const randomIndex = Math.floor(Math.random() * boxItems.length);
    const wonItem = boxItems[randomIndex];

    // Only record in database if we have a valid userId
    if (userId) {
      await this.recordBoxOpening({
        userId: String(userId),
        boxId: boxId,
        itemId: wonItem.id
      });

      await this.addUserItem({
        userId: String(userId),
        itemId: wonItem.id,
        quantity: 1,
        obtainedAt: new Date()
      });
    }

    return {
      item: wonItem,
      value: parseFloat(wonItem.value || '0')
    };
  }

  // Content Management System methods
  async getWhitelabelPages(whitelabelId: string) {
    return await db.select()
      .from(whitelabelPages)
      .where(eq(whitelabelPages.whitelabelId, whitelabelId))
      .orderBy(whitelabelPages.pageType, whitelabelPages.pageName);
  }

  async getPageSections(pageId: number) {
    return await db.select()
      .from(whitelabelContentSections)
      .where(eq(whitelabelContentSections.pageId, pageId))
      .orderBy(whitelabelContentSections.displayOrder);
  }

  async getWhitelabelMedia(whitelabelId: string) {
    return await db.select()
      .from(whitelabelMedia)
      .where(eq(whitelabelMedia.whitelabelId, whitelabelId))
      .orderBy(desc(whitelabelMedia.createdAt));
  }

  async updateWhitelabelPage(pageId: number, updateData: any) {
    const [page] = await db.update(whitelabelPages)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(whitelabelPages.id, pageId))
      .returning();
    return page;
  }

  async updateContentSection(sectionId: number, updateData: any) {
    const [section] = await db.update(whitelabelContentSections)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(whitelabelContentSections.id, sectionId))
      .returning();
    return section;
  }

  async createWhitelabelPage(pageData: any) {
    const [page] = await db.insert(whitelabelPages)
      .values(pageData)
      .returning();
    return page;
  }

  async createWhitelabelMedia(mediaData: any) {
    const [media] = await db.insert(whitelabelMedia)
      .values(mediaData)
      .returning();
    return media;
  }

  async createContentSection(sectionData: any) {
    const [section] = await db.insert(whitelabelContentSections)
      .values(sectionData)
      .returning();
    return section;
  }

  async getWhitelabelBySlug(slug: string) {
    const [whitelabel] = await db.select()
      .from(whitelabelSites)
      .where(eq(whitelabelSites.slug, slug));
    return whitelabel;
  }

  // Admin stats method
  async getAdminStats(): Promise<any> {
    try {
      // Get total counts
      const [totalBoxes] = await db.select({ count: sql<number>`count(*)` }).from(boxes);
      const [totalItems] = await db.select({ count: sql<number>`count(*)` }).from(items);
      const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [totalOpenings] = await db.select({ count: sql<number>`count(*)` }).from(boxOpenings);
      
      // Get recent activity (using basic ordering since desc is causing issues)
      const recentBoxes = await db.select().from(boxes).limit(5);
      const recentUsers = await db.select().from(users).limit(5);
      
      // Calculate total revenue
      const [revenue] = await db.select({ 
        total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` 
      }).from(transactions).where(eq(transactions.type, 'purchase'));

      return {
        totals: {
          boxes: totalBoxes?.count || 0,
          items: totalItems?.count || 0,
          users: totalUsers?.count || 0,
          openings: totalOpenings?.count || 0,
          revenue: revenue?.total || 0
        },
        recent: {
          boxes: recentBoxes,
          users: recentUsers
        }
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return {
        totals: { boxes: 0, items: 0, users: 0, openings: 0, revenue: 0 },
        recent: { boxes: [], users: [] }
      };
    }
  }

  // Platform statistics method
  async getPlatformStats(): Promise<any> {
    try {
      // Get total counts
      const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [totalBoxesOpened] = await db.select({ count: sql<number>`count(*)` }).from(boxOpenings);
      const [totalItemsDropped] = await db.select({ count: sql<number>`count(*)` }).from(userItems);
      
      // Calculate total revenue from box purchases
      const [revenue] = await db.select({ 
        total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` 
      }).from(transactions).where(eq(transactions.type, 'box_purchase'));

      // Get popular boxes (most opened)
      const popularBoxes = await db
        .select({
          id: boxes.id,
          name: boxes.name,
          openCount: sql<number>`count(${boxOpenings.id})`,
          revenue: sql<number>`COALESCE(SUM(CAST(${boxes.price} AS DECIMAL)), 0)`
        })
        .from(boxes)
        .leftJoin(boxOpenings, eq(boxes.id, boxOpenings.boxId))
        .groupBy(boxes.id, boxes.name)
        .orderBy(sql`count(${boxOpenings.id}) DESC`)
        .limit(5);

      // Get rarity distribution
      const rarityDistribution = await db
        .select({
          rarity: items.rarity,
          count: sql<number>`count(*)`
        })
        .from(items)
        .innerJoin(userItems, eq(items.id, userItems.itemId))
        .groupBy(items.rarity);

      // Convert rarity distribution to object
      const rarityObj = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythical: 0
      };
      
      rarityDistribution.forEach(row => {
        if (row.rarity in rarityObj) {
          rarityObj[row.rarity as keyof typeof rarityObj] = row.count;
        }
      });

      return {
        totalUsers: totalUsers?.count || 0,
        totalBoxesOpened: totalBoxesOpened?.count || 0,
        totalRevenue: revenue?.total?.toString() || "0",
        totalItemsDropped: totalItemsDropped?.count || 0,
        averageBoxValue: "18.50",
        popularBoxes: popularBoxes.map(box => ({
          id: box.id,
          name: box.name,
          openCount: box.openCount,
          revenue: box.revenue?.toString() || "0"
        })),
        rarityDistribution: rarityObj,
        recentActivity: []
      };
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      return {
        totalUsers: 0,
        totalBoxesOpened: 0,
        totalRevenue: "0",
        totalItemsDropped: 0,
        averageBoxValue: "0",
        popularBoxes: [],
        rarityDistribution: { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 },
        recentActivity: []
      };
    }
  }

  // User statistics method
  async getUserStats(userId: string): Promise<any> {
    try {
      const userIdNum = parseInt(userId);
      
      // Get user's total spending from transactions
      const [totalSpent] = await db.select({ 
        total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` 
      }).from(transactions)
        .where(and(
          eq(transactions.userId, userIdNum),
          eq(transactions.type, 'box_purchase')
        ));

      // Get total boxes opened
      const [boxesOpened] = await db.select({ 
        count: sql<number>`count(*)` 
      }).from(boxOpenings).where(eq(boxOpenings.userId, userId));

      // Get items collected
      const [itemsCollected] = await db.select({ 
        count: sql<number>`count(*)` 
      }).from(userItems).where(eq(userItems.userId, userIdNum));

      // Get user's most valuable item (luckiest drop)
      const luckiestDrop = await db
        .select({
          itemName: items.name,
          rarity: items.rarity,
          value: items.value
        })
        .from(userItems)
        .innerJoin(items, eq(userItems.itemId, items.id))
        .where(eq(userItems.userId, userIdNum))
        .orderBy(sql`CAST(${items.value} AS DECIMAL) DESC`)
        .limit(1);

      // Get favorite rarity (most collected)
      const [favoriteRarity] = await db
        .select({
          rarity: items.rarity,
          count: sql<number>`count(*)`
        })
        .from(userItems)
        .innerJoin(items, eq(userItems.itemId, items.id))
        .where(eq(userItems.userId, userIdNum))
        .groupBy(items.rarity)
        .orderBy(sql`count(*) DESC`)
        .limit(1);

      return {
        totalSpent: totalSpent?.total?.toString() || "0",
        totalBoxesOpened: boxesOpened?.count || 0,
        itemsCollected: itemsCollected?.count || 0,
        favoriteRarity: favoriteRarity?.rarity || "common",
        luckiestDrop: luckiestDrop[0] ? {
          itemName: luckiestDrop[0].itemName,
          rarity: luckiestDrop[0].rarity,
          value: luckiestDrop[0].value || "0"
        } : {
          itemName: "No items yet",
          rarity: "common",
          value: "0"
        },
        spendingTrend: []
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        totalSpent: "0",
        totalBoxesOpened: 0,
        itemsCollected: 0,
        favoriteRarity: "common",
        luckiestDrop: {
          itemName: "No items yet",
          rarity: "common",
          value: "0"
        },
        spendingTrend: []
      };
    }
  }

  // Add missing B2B Partners and Whitelabel box management methods
  async addBoxToPartner(partnerId: number, boxId: number, config: any): Promise<any> {
    const [partnerBox] = await db.insert(partnerBoxes).values({
      partnerId,
      boxId,
      isEnabled: config.isEnabled || true,
      isFeatured: config.isFeatured || false,
      customPrice: config.customPrice
    }).returning();
    return partnerBox;
  }

  async removeBoxFromPartner(partnerId: number, boxId: number): Promise<boolean> {
    try {
      await db.delete(partnerBoxes)
        .where(and(
          eq(partnerBoxes.partnerId, partnerId),
          eq(partnerBoxes.boxId, boxId)
        ));
      return true;
    } catch (error) {
      console.error("Error removing box from partner:", error);
      return false;
    }
  }

  async addBoxToWhitelabel(whitelabelId: string, boxId: number, config: any): Promise<any> {
    const [whitelabelBox] = await db.insert(whitelabelBoxes).values({
      whitelabelId,
      boxId,
      enabled: config.enabled || true,
      featured: config.featured || false,
      customPrice: config.customPrice,
      customName: config.customName,
      customDescription: config.customDescription,
      displayOrder: config.displayOrder || 0
    }).returning();
    return whitelabelBox;
  }

  async updateWhitelabelBox(whitelabelId: string, boxId: number, updates: any): Promise<any> {
    try {
      const [updatedBox] = await db
        .update(whitelabelBoxes)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(whitelabelBoxes.whitelabelId, whitelabelId),
            eq(whitelabelBoxes.boxId, boxId)
          )
        )
        .returning();
      
      return updatedBox;
    } catch (error) {
      console.error("Error updating whitelabel box:", error);
      throw error;
    }
  }

  async removeBoxFromWhitelabel(whitelabelId: string, boxId: number): Promise<boolean> {
    try {
      await db.delete(whitelabelBoxes)
        .where(and(
          eq(whitelabelBoxes.whitelabelId, whitelabelId),
          eq(whitelabelBoxes.boxId, boxId)
        ));
      return true;
    } catch (error) {
      console.error("Error removing box from whitelabel:", error);
      return false;
    }
  }

  // Battle operations implementation
  async getBattleWithParticipants(battleId: number): Promise<any> {
    const [battle] = await db
      .select()
      .from(boxBattles)
      .where(eq(boxBattles.id, battleId));

    if (!battle) return null;

    const participants = await db
      .select({
        id: boxBattleParticipants.id,
        userId: boxBattleParticipants.userId,
        position: boxBattleParticipants.position,
        username: users.username,
      })
      .from(boxBattleParticipants)
      .leftJoin(users, eq(boxBattleParticipants.userId, users.id))
      .where(eq(boxBattleParticipants.battleId, battleId))
      .orderBy(boxBattleParticipants.position);

    return {
      ...battle,
      participants
    };
  }

  async updateBattleWinner(battleId: number, winnerId: number): Promise<void> {
    await db
      .update(boxBattles)
      .set({ winnerId })
      .where(eq(boxBattles.id, battleId));
  }

  async recordBattleRound(roundData: any): Promise<void> {
    await db.insert(boxBattleRounds).values({
      battleId: roundData.battleId,
      participantId: roundData.participantId,
      roundNumber: roundData.roundNumber,
      itemId: roundData.itemId,
      itemValue: roundData.itemValue,
    });
  }
}

export const storage = new DatabaseStorage();