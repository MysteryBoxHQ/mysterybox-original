import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { boxOpeningEngine } from "./boxOpeningEngine";
import crypto from "crypto";
import { eq, and, desc, gte } from "drizzle-orm";
import { db } from "./db";
import { partners, apiUsageLog, partnerTransactions } from "@shared/schema";

// External API for 3rd party websites to display and integrate boxes
export async function setupExternalAPI(app: Express) {
  // API key middleware for external integrations
  const validateAPIKey = async (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key required',
        message: 'Include X-API-Key header or api_key query parameter' 
      });
    }

    // Simple API key validation - in production you'd check against a database
    if (apiKey && apiKey.length > 0) {
      req.partner = { id: 'external-site', name: 'External Site' };
      next();
    } else {
      res.status(401).json({ error: 'Invalid API key' });
    }
  };

  // CORS middleware for external access
  app.use('/api/v1/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Get all available mystery boxes
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
        featured: box.featured || false,
        itemCount: 0 // Will be populated if needed
      }));
      
      res.json({
        success: true,
        data: formattedBoxes,
        meta: {
          total: formattedBoxes.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('External API - Get boxes error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch boxes' 
      });
    }
  });

  // Get featured boxes only
  app.get('/api/v1/boxes/featured', validateAPIKey, async (req, res) => {
    try {
      const boxes = await storage.getFeaturedBoxes();
      const formattedBoxes = boxes.map(box => ({
        id: box.id,
        name: box.name,
        description: box.description,
        price: parseFloat(box.price),
        currency: 'USD',
        rarity: box.rarity,
        imageUrl: box.imageUrl,
        featured: true
      }));
      
      res.json({
        success: true,
        data: formattedBoxes,
        meta: {
          total: formattedBoxes.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('External API - Get featured boxes error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch featured boxes' 
      });
    }
  });

  // Get specific box details with items
  app.get('/api/v1/boxes/:boxId', validateAPIKey, async (req, res) => {
    try {
      const boxId = parseInt(req.params.boxId);
      if (isNaN(boxId)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid box ID' 
        });
      }

      const box = await storage.getBoxWithItems(boxId);
      if (!box) {
        return res.status(404).json({ 
          success: false,
          error: 'Box not found' 
        });
      }

      const formattedBox = {
        id: box.id,
        name: box.name,
        description: box.description,
        price: parseFloat(box.price),
        currency: 'USD',
        rarity: box.rarity,
        imageUrl: box.imageUrl,
        featured: box.featured || false,
        items: box.items?.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          rarity: item.rarity,
          icon: item.icon,
          dropChance: item.dropChance,
          value: item.value || 0
        })) || []
      };
      
      res.json({
        success: true,
        data: formattedBox,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('External API - Get box details error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch box details' 
      });
    }
  });

  // Get box contents only (items that can be won)
  app.get('/api/v1/boxes/:boxId/items', validateAPIKey, async (req, res) => {
    try {
      const boxId = parseInt(req.params.boxId);
      if (isNaN(boxId)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid box ID' 
        });
      }

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
        data: formattedItems,
        meta: {
          total: formattedItems.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('External API - Get box items error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch box items' 
      });
    }
  });

  // Open a mystery box for external user
  const externalOpenSchema = z.object({
    boxId: z.number(),
    userId: z.string(),
    userBalance: z.number().min(0)
  });

  app.post('/api/v1/open-box', validateAPIKey, async (req, res) => {
    try {
      const { boxId, userId, userBalance } = externalOpenSchema.parse(req.body);
      
      const box = await storage.getBox(boxId);
      if (!box) {
        return res.status(404).json({ 
          success: false,
          error: 'Box not found' 
        });
      }

      const boxPrice = parseFloat(box.price);
      if (userBalance < boxPrice) {
        return res.status(400).json({ 
          success: false,
          error: 'Insufficient balance',
          data: {
            required: boxPrice,
            available: userBalance,
            shortfall: boxPrice - userBalance
          }
        });
      }

      // Use real box opening engine with weighted probabilities
      const openingResult = await boxOpeningEngine.openBox(userId, boxId);
      
      if (!openingResult.success) {
        return res.status(400).json({ 
          success: false,
          error: openingResult.error || 'Failed to open box'
        });
      }
      
      const selectedItem = openingResult.item!;

      res.json({
        success: true,
        data: {
          item: {
            id: selectedItem.id,
            name: selectedItem.name,
            description: selectedItem.description,
            rarity: selectedItem.rarity,
            icon: selectedItem.icon,
            value: selectedItem.value || 0
          },
          box: {
            id: box.id,
            name: box.name,
            price: boxPrice
          },
          transaction: {
            cost: boxPrice,
            newBalance: userBalance - boxPrice,
            profit: (selectedItem.value || 0) - boxPrice
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          userId: userId
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid request data', 
          details: error.errors 
        });
      }
      console.error('External API - Box opening error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to open box' 
      });
    }
  });

  // Get API statistics and info
  app.get('/api/v1/stats', validateAPIKey, async (req, res) => {
    try {
      const boxes = await storage.getAllBoxes();
      const recentOpenings = await storage.getRecentOpenings(20);
      
      res.json({
        success: true,
        data: {
          totalBoxes: boxes.length,
          featuredBoxes: boxes.filter(b => b.featured).length,
          recentOpenings: recentOpenings.length,
          priceRange: {
            min: Math.min(...boxes.map(b => parseFloat(b.price))),
            max: Math.max(...boxes.map(b => parseFloat(b.price)))
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      });
    } catch (error) {
      console.error('External API - Get stats error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch statistics' 
      });
    }
  });

  console.log('External API v1 initialized - Available endpoints:');
  console.log('  GET  /api/v1/boxes - All boxes');
  console.log('  GET  /api/v1/boxes/featured - Featured boxes only');
  console.log('  GET  /api/v1/boxes/:id - Specific box with items');
  console.log('  GET  /api/v1/boxes/:id/items - Box items only');
  console.log('  POST /api/v1/open-box - Open a box');
  console.log('  GET  /api/v1/stats - API statistics');
  console.log('  Required: X-API-Key header or api_key query parameter');
}