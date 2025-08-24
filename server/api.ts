import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import type { Box, Item, User } from "@shared/schema";

// API Integration for external casino websites
export async function setupExternalAPI(app: Express) {
  // API key middleware for external integrations
  const validateAPIKey = async (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    // TODO: Validate API key against registered casino partners
    // For now, accept any non-empty key
    if (apiKey) {
      req.partner = { id: 'demo-casino', name: 'Demo Casino' };
      next();
    } else {
      res.status(401).json({ error: 'Invalid API key' });
    }
  };

  // External API Routes for Casino Integration
  
  // Get available mystery boxes
  app.get('/api/v1/boxes', validateAPIKey, async (req, res) => {
    try {
      const boxes = await storage.getAllBoxes();
      const formattedBoxes = boxes.map(box => ({
        id: box.id,
        name: box.name,
        description: box.description,
        price: parseFloat(box.price),
        currency: 'USD',
        rarity: box.rarity,
        imageUrl: box.imageUrl,
        featured: box.featured || false
      }));
      
      res.json({
        success: true,
        data: formattedBoxes
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch boxes' });
    }
  });

  // Get box contents (items that can be won)
  app.get('/api/v1/boxes/:boxId/items', validateAPIKey, async (req, res) => {
    try {
      const boxId = parseInt(req.params.boxId);
      const items = await storage.getItemsByBox(boxId);
      
      const formattedItems = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        rarity: item.rarity,
        icon: item.icon,
        dropChance: item.dropChance,
        value: item.value || 0
      }));
      
      res.json({
        success: true,
        data: formattedItems
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch box items' });
    }
  });

  // Open a mystery box for external user
  const externalOpenSchema = z.object({
    boxId: z.number(),
    userId: z.string(), // External casino's user ID
    userBalance: z.number().min(0)
  });

  app.post('/api/v1/open-box', validateAPIKey, async (req, res) => {
    try {
      const { boxId, userId, userBalance } = externalOpenSchema.parse(req.body);
      
      const boxCase = await storage.getCase(boxId);
      if (!boxCase) {
        return res.status(404).json({ error: 'Box not found' });
      }

      const boxPrice = parseFloat(boxCase.price);
      if (userBalance < boxPrice) {
        return res.status(400).json({ 
          error: 'Insufficient balance',
          required: boxPrice,
          available: userBalance
        });
      }

      // Get items in this case
      const items = await storage.getItemsByCase(boxId);
      if (items.length === 0) {
        return res.status(400).json({ error: 'Box has no items' });
      }

      // Calculate weighted random selection
      const totalWeight = items.reduce((sum, item) => sum + item.dropChance, 0);
      const random = Math.random() * totalWeight;
      
      let weightSum = 0;
      let selectedItem = items[0];
      
      for (const item of items) {
        weightSum += item.dropChance;
        if (random <= weightSum) {
          selectedItem = item;
          break;
        }
      }

      // Record the opening for analytics
      await storage.recordCaseOpening({
        userId: parseInt(userId) || 1, // Map to internal user or create temp
        caseId: boxId,
        itemId: selectedItem.id,
        pricePaid: boxPrice
      });

      res.json({
        success: true,
        data: {
          item: {
            id: selectedItem.id,
            name: selectedItem.name,
            description: selectedItem.description,
            rarity: selectedItem.rarity,
            icon: selectedItem.icon
          },
          newBalance: userBalance - boxPrice,
          amountSpent: boxPrice
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Box opening error:', error);
      res.status(500).json({ error: 'Failed to open box' });
    }
  });

  // Get opening statistics for analytics
  app.get('/api/v1/stats', validateAPIKey, async (req, res) => {
    try {
      const recentOpenings = await storage.getRecentOpenings(50);
      const cases = await storage.getAllCases();
      
      res.json({
        success: true,
        data: {
          totalBoxes: cases.length,
          recentOpenings: recentOpenings.length,
          topBoxes: cases.slice(0, 5).map(c => ({
            id: c.id,
            name: c.name,
            price: parseFloat(c.price)
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Webhook endpoint for casino to notify us of user events
  app.post('/api/v1/webhook', validateAPIKey, async (req, res) => {
    try {
      const { event, userId, data } = req.body;
      
      // Handle different webhook events
      switch (event) {
        case 'user.deposit':
          // Casino notifies us when user makes a deposit
          console.log(`User ${userId} deposited ${data.amount}`);
          break;
        case 'user.withdrawal':
          // Casino notifies us when user withdraws
          console.log(`User ${userId} withdrew ${data.amount}`);
          break;
        default:
          console.log(`Unknown webhook event: ${event}`);
      }
      
      res.json({ success: true, received: true });
    } catch (error) {
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // API documentation endpoint
  app.get('/api/v1/docs', (req, res) => {
    res.json({
      name: 'Mystery Box API',
      version: '1.0.0',
      endpoints: {
        'GET /api/v1/boxes': 'Get all available mystery boxes',
        'GET /api/v1/boxes/:id/items': 'Get items in a specific box',
        'POST /api/v1/open-box': 'Open a mystery box for a user',
        'GET /api/v1/stats': 'Get platform statistics',
        'POST /api/v1/webhook': 'Receive casino events'
      },
      authentication: 'Include X-API-Key header or api_key query parameter'
    });
  });
}