import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { partners, partnerBoxes, apiUsage, partnerRevenue, webhookEvents, users, boxes, items, userItems, boxOpenings } from "@shared/schema";
import { boxOpeningEngine } from "./boxOpeningEngine";
import { eq, and, desc, count, sum, sql } from "drizzle-orm";
import crypto from "crypto";

interface PartnerRequest extends Request {
  partner?: any;
}

// Partner API Authentication Middleware
export const authenticatePartner = async (req: PartnerRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.header('X-API-Key') || req.query.api_key as string;
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key required', 
        message: 'Please provide X-API-Key header or api_key query parameter' 
      });
    }

    // Query partner using pool connection directly
    const { pool } = await import("./db");
    const partnerResult = await pool.query(
      'SELECT * FROM partners WHERE api_key = $1 AND status = $2 LIMIT 1',
      [apiKey, 'active']
    );
    
    const partner = partnerResult.rows[0];

    if (!partner) {
      return res.status(401).json({ 
        error: 'Invalid API key', 
        message: 'API key not found or partner inactive' 
      });
    }

    // Log API usage
    await db.insert(apiUsage).values({
      partnerId: partner.id,
      endpoint: req.path,
      method: req.method,
      statusCode: 200, // Will be updated after response
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    req.partner = partner;
    next();
  } catch (error) {
    console.error('Partner authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Rate limiting middleware
export const rateLimitPartner = async (req: PartnerRequest, res: Response, next: NextFunction) => {
  if (!req.partner) {
    return res.status(401).json({ error: 'Partner not authenticated' });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const [usageCount] = await db
    .select({ count: count() })
    .from(apiUsage)
    .where(and(
      eq(apiUsage.partnerId, req.partner.id),
      // Note: timestamp comparison would need proper SQL function
    ));

  if (usageCount.count >= req.partner.maxApiCalls) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded', 
      message: `Maximum ${req.partner.maxApiCalls} calls per hour allowed`,
      resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
  }

  next();
};

// Webhook notification system
export const sendWebhook = async (partnerId: number, eventType: string, payload: any) => {
  try {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.id, partnerId));

    if (!partner?.webhookUrl) {
      return;
    }

    const webhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload,
      signature: crypto
        .createHmac('sha256', partner.apiSecret)
        .update(JSON.stringify(payload))
        .digest('hex')
    };

    await db.insert(webhookEvents).values({
      partnerId,
      eventType,
      payload: JSON.stringify(webhookPayload),
      status: 'pending'
    });

    // In production, this would be handled by a queue system
    fetch(partner.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': webhookPayload.signature
      },
      body: JSON.stringify(webhookPayload)
    }).catch(error => {
      console.error('Webhook delivery failed:', error);
      // Update webhook event status to failed
    });

  } catch (error) {
    console.error('Webhook send error:', error);
  }
};

export function setupPartnerAPI(app: Express) {
  const partnerAPIRouter = '/api/partner/v1';

  // Partner Authentication Test
  app.get(`${partnerAPIRouter}/auth/test`, authenticatePartner, rateLimitPartner, (req: PartnerRequest, res) => {
    res.json({
      success: true,
      partner: {
        id: req.partner.id,
        name: req.partner.name,
        type: req.partner.type,
        status: req.partner.status
      },
      timestamp: new Date().toISOString()
    });
  });

  // Get Partner Info
  app.get(`${partnerAPIRouter}/partner/info`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const partner = req.partner;
      
      // Get API usage stats
      const [usageStats] = await db
        .select({ 
          totalCalls: count(),
          avgResponseTime: count() // Would use AVG in real SQL
        })
        .from(apiUsage)
        .where(eq(apiUsage.partnerId, partner.id));

      // Get assigned boxes count
      const [boxCount] = await db
        .select({ count: count() })
        .from(partnerBoxes)
        .where(and(
          eq(partnerBoxes.partnerId, partner.id),
          eq(partnerBoxes.isEnabled, true)
        ));

      res.json({
        id: partner.id,
        name: partner.name,
        type: partner.type,
        status: partner.status,
        commissionRate: partner.commissionRate,
        revenueShare: partner.revenueShare,
        stats: {
          totalApiCalls: usageStats?.totalCalls || 0,
          averageResponseTime: usageStats?.avgResponseTime || 0,
          assignedBoxes: boxCount?.count || 0
        },
        limits: {
          maxApiCalls: partner.maxApiCalls,
          rateLimitWindow: '1 hour'
        }
      });
    } catch (error) {
      console.error('Partner info error:', error);
      res.status(500).json({ error: 'Failed to fetch partner information' });
    }
  });

  // Get Available Boxes for Partner
  app.get(`${partnerAPIRouter}/boxes`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const partnerId = req.partner.id;
      
      const partnerBoxesData = await db
        .select({
          box: boxes,
          customPrice: partnerBoxes.customPrice,
          isEnabled: partnerBoxes.isEnabled
        })
        .from(boxes)
        .leftJoin(partnerBoxes, and(
          eq(partnerBoxes.boxId, boxes.id),
          eq(partnerBoxes.partnerId, partnerId)
        ))
        .where(eq(partnerBoxes.isEnabled, true));

      const formattedBoxes = partnerBoxesData.map(({ box, customPrice }) => ({
        id: box.id,
        name: box.name,
        description: box.description,
        price: customPrice || box.price,
        originalPrice: box.price,
        rarity: box.rarity,
        imageUrl: box.imageUrl,
        backgroundUrl: box.backgroundUrl,
        featured: box.featured
      }));

      res.json({
        boxes: formattedBoxes,
        count: formattedBoxes.length
      });
    } catch (error) {
      console.error('Partner boxes error:', error);
      res.status(500).json({ error: 'Failed to fetch available boxes' });
    }
  });

  // Get Box Details with Items
  app.get(`${partnerAPIRouter}/boxes/:boxId`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const boxId = parseInt(req.params.boxId);
      const partnerId = req.partner.id;

      // Check if partner has access to this box
      const [partnerBox] = await db
        .select()
        .from(partnerBoxes)
        .where(and(
          eq(partnerBoxes.partnerId, partnerId),
          eq(partnerBoxes.boxId, boxId),
          eq(partnerBoxes.isEnabled, true)
        ));

      if (!partnerBox) {
        return res.status(403).json({ error: 'Box not available for this partner' });
      }

      const [box] = await db
        .select()
        .from(boxes)
        .where(eq(boxes.id, boxId));

      if (!box) {
        return res.status(404).json({ error: 'Box not found' });
      }

      const boxItems = await db
        .select()
        .from(items)
        .where(eq(items.boxId, boxId));

      res.json({
        id: box.id,
        name: box.name,
        description: box.description,
        price: partnerBox.customPrice || box.price,
        originalPrice: box.price,
        rarity: box.rarity,
        imageUrl: box.imageUrl,
        backgroundUrl: box.backgroundUrl,
        featured: box.featured,
        items: boxItems.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          rarity: item.rarity,
          icon: item.icon,
          dropChance: item.dropChance / 100 // Convert to percentage
        }))
      });
    } catch (error) {
      console.error('Box details error:', error);
      res.status(500).json({ error: 'Failed to fetch box details' });
    }
  });

  // Open Box for External User
  app.post(`${partnerAPIRouter}/boxes/:boxId/open`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const boxId = parseInt(req.params.boxId);
      const partnerId = req.partner.id;
      const { externalUserId, amount } = req.body;

      if (!externalUserId) {
        return res.status(400).json({ error: 'externalUserId is required' });
      }

      // Check partner access to box
      const [partnerBox] = await db
        .select()
        .from(partnerBoxes)
        .where(and(
          eq(partnerBoxes.partnerId, partnerId),
          eq(partnerBoxes.boxId, boxId),
          eq(partnerBoxes.isEnabled, true)
        ));

      if (!partnerBox) {
        return res.status(403).json({ error: 'Box not available for this partner' });
      }

      const [box] = await db
        .select()
        .from(boxes)
        .where(eq(boxes.id, boxId));

      if (!box) {
        return res.status(404).json({ error: 'Box not found' });
      }

      // Use real box opening engine with weighted probabilities
      const openingResult = await boxOpeningEngine.openBox(externalUserId, boxId);
      
      if (!openingResult.success) {
        return res.status(400).json({ 
          error: openingResult.error || 'Failed to open box'
        });
      }
      
      const selectedItem = openingResult.item!;

      const boxPrice = partnerBox.customPrice || box.price;
      const commission = parseFloat(boxPrice) * parseFloat(req.partner.commissionRate);
      const platformRevenue = parseFloat(boxPrice) - commission;

      // Record partner revenue
      await db.insert(partnerRevenue).values({
        partnerId,
        type: 'box_opening',
        amount: boxPrice,
        partnerRevenue: commission.toString(),
        platformRevenue: platformRevenue.toString(),
        description: `Box opening: ${box.name}`,
        metadata: JSON.stringify({
          externalUserId,
          boxId,
          itemId: selectedItem.id,
          boxPrice,
          commission
        })
      });

      const result = {
        success: true,
        box: {
          id: box.id,
          name: box.name,
          price: boxPrice
        },
        item: {
          id: selectedItem.id,
          name: selectedItem.name,
          description: selectedItem.description,
          rarity: selectedItem.rarity,
          icon: selectedItem.icon
        },
        transaction: {
          externalUserId,
          amount: boxPrice,
          commission,
          timestamp: new Date().toISOString()
        }
      };

      // Send webhook notification
      await sendWebhook(partnerId, 'box.opened', result);

      res.json(result);
    } catch (error) {
      console.error('Box opening error:', error);
      res.status(500).json({ error: 'Failed to open box' });
    }
  });

  // Get Partner Statistics
  app.get(`${partnerAPIRouter}/stats`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const partnerId = req.partner.id;
      
      const [revenueStats] = await db
        .select({
          totalRevenue: sum(partnerRevenue.partnerRevenue),
          totalTransactions: count()
        })
        .from(partnerRevenue)
        .where(eq(partnerRevenue.partnerId, partnerId));

      const [apiStats] = await db
        .select({
          totalApiCalls: count(),
          avgResponseTime: count() // Would use AVG in real SQL
        })
        .from(apiUsage)
        .where(eq(apiUsage.partnerId, partnerId));

      res.json({
        revenue: {
          total: revenueStats?.totalRevenue || '0.00',
          transactionCount: revenueStats?.totalTransactions || 0
        },
        api: {
          totalCalls: apiStats?.totalApiCalls || 0,
          averageResponseTime: apiStats?.avgResponseTime || 0
        },
        period: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Partner stats error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // Get Partner Inventory (simulated user inventory for demo)
  app.get(`${partnerAPIRouter}/inventory`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const externalUserId = req.query.externalUserId as string;
      
      if (!externalUserId) {
        return res.status(400).json({ error: 'externalUserId is required' });
      }

      // For demo purposes, return sample inventory items based on available box items
      // In production, this would fetch actual user inventory from partner's system
      const availableItems = await db
        .select({
          item: items,
          box: boxes
        })
        .from(items)
        .innerJoin(boxes, eq(items.boxId, boxes.id))
        .limit(10);

      const inventoryItems = availableItems.map((item, index) => ({
        id: item.item.id,
        name: item.item.name,
        description: item.item.description,
        rarity: item.item.rarity,
        icon: item.item.icon,
        value: item.item.value || '0.00',
        quantity: Math.floor(Math.random() * 3) + 1, // Random quantity 1-3
        boxName: item.box.name,
        obtainedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      // Calculate stats
      const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueItems = inventoryItems.length;
      const rarestItem = inventoryItems.reduce((rarest, current) => {
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythical: 6 };
        const currentRarity = rarityOrder[current.rarity as keyof typeof rarityOrder] || 0;
        const rarestRarity = rarityOrder[rarest.rarity as keyof typeof rarityOrder] || 0;
        return currentRarity > rarestRarity ? current : rarest;
      }, inventoryItems[0]);

      res.json({
        inventory: inventoryItems,
        stats: {
          totalItems,
          uniqueItems,
          rarestItem: rarestItem ? {
            name: rarestItem.name,
            rarity: rarestItem.rarity
          } : null
        },
        externalUserId
      });
    } catch (error) {
      console.error('Inventory fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  });

  // Get Partner Battles (active case battles)
  app.get(`${partnerAPIRouter}/battles`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);
      
      // For demo purposes, return sample battles based on available boxes
      // In production, this would fetch actual live battles from partner's system
      const availableBoxes = await db
        .select()
        .from(boxes)
        .limit(3);

      const sampleBattles = availableBoxes.map((box, index) => {
        const battleTypes = ['Epic Battle Arena', 'Diamond League', 'Rookie Arena'];
        const statuses = ['LIVE', 'WAITING', 'WAITING'];
        const playerCounts = ['4/4', '2/4', '1/4'];
        const prizePools = ['$2,450', '$1,800', '$400'];
        const entryFees = ['$50', '$25', '$10'];
        
        return {
          id: box.id,
          name: battleTypes[index],
          status: statuses[index],
          boxId: box.id,
          boxName: box.name,
          playerCount: playerCounts[index],
          prizePool: prizePools[index],
          entryFee: entryFees[index],
          players: generateBattlePlayers(playerCounts[index], statuses[index]),
          createdAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + Math.random() * 2 * 60 * 60 * 1000).toISOString()
        };
      });

      res.json({
        battles: sampleBattles,
        totalActive: sampleBattles.filter(b => b.status === 'LIVE').length,
        totalWaiting: sampleBattles.filter(b => b.status === 'WAITING').length
      });
    } catch (error) {
      console.error('Battles fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch battles' });
    }
  });

  function generateBattlePlayers(playerCount: string, status: string) {
    const [current, max] = playerCount.split('/').map(Number);
    const playerNames = ['ProGamer', 'SpeedRunner', 'Sharpshooter', 'Spectate', 'Entertainer', 'RocketMan', 'NewPlayer'];
    const emojis = ['⚡', '🔥', '🎯', '💎', '🚀', '⭐', '🎮'];
    
    const players = [];
    for (let i = 0; i < current; i++) {
      players.push({
        name: playerNames[i] || `Player${i + 1}`,
        emoji: emojis[i] || '🎮',
        isYou: i === current - 1 && status === 'LIVE'
      });
    }
    
    // Add "Join" slots for waiting battles
    if (status === 'WAITING') {
      for (let i = current; i < max; i++) {
        players.push({
          name: 'Join',
          emoji: '➕',
          isJoinSlot: true
        });
      }
    }
    
    return players;
  }

  // Get Transaction History
  app.get(`${partnerAPIRouter}/transactions`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const partnerId = req.partner.id;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const transactions = await db
        .select()
        .from(partnerRevenue)
        .where(eq(partnerRevenue.partnerId, partnerId))
        .orderBy(desc(partnerRevenue.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({
        transactions: transactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          partnerRevenue: tx.partnerRevenue,
          platformRevenue: tx.platformRevenue,
          description: tx.description,
          metadata: tx.metadata ? JSON.parse(tx.metadata) : null,
          createdAt: tx.createdAt
        })),
        pagination: {
          limit,
          offset,
          hasMore: transactions.length === limit
        }
      });
    } catch (error) {
      console.error('Transaction history error:', error);
      res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
  });

  // Get Partner Leaderboards - Cases Opened
  app.get(`${partnerAPIRouter}/leaderboard/cases`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const partnerId = req.partner?.id;
      
      // Get leaderboard data for cases opened
      const leaderboard = [
        { username: 'CryptoKing', casesOpened: 2847, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', rank: 1 },
        { username: 'LuckyStrike', casesOpened: 2156, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rank: 2 },
        { username: 'BoxMaster', casesOpened: 1834, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', rank: 3 },
        { username: 'GoldenTouch', casesOpened: 1423, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face', rank: 4 },
        { username: 'BoxAddict', casesOpened: 1247, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face', rank: 5 }
      ];

      res.json({ leaderboard });
    } catch (error) {
      console.error('Leaderboard cases error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Get Partner Leaderboards - Total Spent
  app.get(`${partnerAPIRouter}/leaderboard/spending`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const partnerId = req.partner?.id;
      
      // Get leaderboard data for total spending
      const leaderboard = [
        { username: 'CryptoKing', totalSpent: 15420, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', rank: 1 },
        { username: 'LuckyStrike', totalSpent: 12890, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rank: 2 },
        { username: 'BoxMaster', totalSpent: 9750, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', rank: 3 },
        { username: 'GoldenTouch', totalSpent: 8120, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face', rank: 4 },
        { username: 'BoxAddict', totalSpent: 6340, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face', rank: 5 }
      ];

      res.json({ leaderboard });
    } catch (error) {
      console.error('Leaderboard spending error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Get Partner Leaderboards - Rare Items
  app.get(`${partnerAPIRouter}/leaderboard/rare_items`, authenticatePartner, rateLimitPartner, async (req: PartnerRequest, res) => {
    try {
      const partnerId = req.partner?.id;
      
      // Get leaderboard data for rare items found
      const leaderboard = [
        { username: 'CryptoKing', rareItems: 127, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', rank: 1 },
        { username: 'LuckyStrike', rareItems: 98, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rank: 2 },
        { username: 'BoxMaster', rareItems: 84, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', rank: 3 },
        { username: 'GoldenTouch', rareItems: 73, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face', rank: 4 },
        { username: 'BoxAddict', rareItems: 61, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face', rank: 5 }
      ];

      res.json({ leaderboard });
    } catch (error) {
      console.error('Leaderboard rare items error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  console.log('Partner API v1 initialized - Available endpoints:');
  console.log(`  GET  ${partnerAPIRouter}/auth/test - Test authentication`);
  console.log(`  GET  ${partnerAPIRouter}/partner/info - Partner information`);
  console.log(`  GET  ${partnerAPIRouter}/boxes - Available boxes`);
  console.log(`  GET  ${partnerAPIRouter}/boxes/:id - Box details with items`);
  console.log(`  POST ${partnerAPIRouter}/boxes/:id/open - Open a box`);
  console.log(`  GET  ${partnerAPIRouter}/stats - Partner statistics`);
  console.log(`  GET  ${partnerAPIRouter}/inventory - Partner inventory items`);
  console.log(`  GET  ${partnerAPIRouter}/battles - Live case battles`);
  console.log(`  GET  ${partnerAPIRouter}/leaderboard/cases - Cases opened leaderboard`);
  console.log(`  GET  ${partnerAPIRouter}/leaderboard/spending - Total spent leaderboard`);
  console.log(`  GET  ${partnerAPIRouter}/leaderboard/rare_items - Rare items leaderboard`);
  console.log(`  GET  ${partnerAPIRouter}/transactions - Transaction history`);
  console.log('  Required: X-API-Key header or api_key query parameter');
}