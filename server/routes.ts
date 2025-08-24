import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { boxOpeningEngine } from "./boxOpeningEngine";
import { battleEngine } from "./battleEngine";

// Helper function for time formatting
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Custom authentication middleware that handles both regular auth and demo sessions
  const isAuthenticatedOrDemo = (req: any, res: any, next: any) => {
    // Check if it's a demo session
    if (req.session && req.session.demo && req.session.user) {
      req.demoUser = req.session.user;
      return next();
    }
    
    // Otherwise use regular authentication
    return isAuthenticated(req, res, next);
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      // Handle demo user
      if (req.demoUser) {
        return res.json(req.demoUser);
      }
      
      // Handle regular authenticated user
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Demo login route for testing
  app.post("/api/demo-login", async (req, res) => {
    try {
      const { username = 'DemoPlayer', balance = 100.00 } = req.body;
      
      // Check if demo user already exists in database
      let demoUser = await storage.getUserByUsername(username);
      
      if (!demoUser) {
        // Create demo user in database permanently
        const newDemoUser = {
          username: username,
          email: `${username.toLowerCase()}@demo.com`,
          usdBalance: balance.toString(),
          level: 1,
          experience: 0,
          isAdmin: false,
          partnerId: null
        };
        
        demoUser = await storage.createUser(newDemoUser);
        console.log(`Created new demo user in database: ${demoUser.username} (ID: ${demoUser.id})`);
      } else {
        console.log(`Demo user found in database: ${demoUser.username} (ID: ${demoUser.id})`);
      }

      // Set session data to simulate authentication
      (req as any).session.user = {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        usdBalance: demoUser.usdBalance,
        level: demoUser.level,
        experience: demoUser.experience,
        isAdmin: demoUser.isAdmin
      };
      (req as any).session.authenticated = true;
      (req as any).session.demo = true;

      // Save session before responding
      (req as any).session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session save failed" });
        }
        
        res.json({ 
          success: true, 
          user: (req as any).session.user,
          message: 'Demo login successful'
        });
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "Demo login failed" });
    }
  });

  // Demo logout route
  app.post("/api/demo-logout", async (req, res) => {
    try {
      (req as any).session.destroy();
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error("Demo logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // User routes
  app.get("/api/user", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      // Handle demo user
      if (req.demoUser) {
        return res.json(req.demoUser);
      }
      
      // Handle regular authenticated user
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Boxes routes
  app.get("/api/boxes", async (req, res) => {
    try {
      // For the main deployment, use the rollingdrop-main whitelabel
      const whitelabelId = 'rollingdrop-main';
      const boxes = await storage.getWhitelabelBoxes(whitelabelId, false); // false = all boxes
      res.json(boxes);
    } catch (error) {
      console.error("Error fetching boxes:", error);
      res.status(500).json({ message: "Failed to fetch boxes" });
    }
  });

  app.get("/api/boxes/featured", async (req, res) => {
    try {
      // For the main deployment, use the rollingdrop-main whitelabel
      const whitelabelId = 'rollingdrop-main';
      const boxes = await storage.getWhitelabelBoxes(whitelabelId, true); // true = featured only
      res.json(boxes);
    } catch (error) {
      console.error("Error fetching featured boxes:", error);
      res.status(500).json({ message: "Failed to fetch featured boxes" });
    }
  });

  // Individual box endpoint with items
  app.get("/api/boxes/:id", async (req, res) => {
    try {
      const boxId = parseInt(req.params.id);
      if (isNaN(boxId)) {
        return res.status(400).json({ message: "Invalid box ID" });
      }

      const box = await storage.getBoxWithItems(boxId);
      if (!box) {
        return res.status(404).json({ message: "Box not found" });
      }

      res.json(box);
    } catch (error) {
      console.error("Error fetching box:", error);
      res.status(500).json({ message: "Failed to fetch box" });
    }
  });

  // Box opening endpoint
  app.post("/api/boxes/:id/open", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const boxId = parseInt(req.params.id);
      if (isNaN(boxId)) {
        return res.status(400).json({ message: "Invalid box ID" });
      }

      // Get user (demo or authenticated)
      let user;
      if (req.demoUser) {
        user = req.demoUser;
      } else {
        const userId = req.user.claims.sub;
        user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }

      const box = await storage.getBox(boxId);
      if (!box) {
        return res.status(404).json({ message: "Box not found" });
      }

      const boxPrice = parseFloat(box.price);
      const userBalance = parseFloat(user.usdBalance || "0");

      if (userBalance < boxPrice) {
        return res.status(400).json({ 
          message: 'Insufficient balance',
          required: boxPrice,
          available: userBalance,
          shortfall: boxPrice - userBalance
        });
      }

      // Use real box opening engine with weighted probabilities
      const userId = req.demoUser ? String(req.session.user.id) : String(user.id);
      const openingResult = await boxOpeningEngine.openBox(userId, boxId);
      
      if (!openingResult.success) {
        return res.status(400).json({ 
          message: openingResult.error || 'Failed to open box'
        });
      }
      
      const selectedItem = openingResult.item!;

      // Update user balance for demo users
      if (req.demoUser) {
        const newBalance = userBalance - boxPrice;
        req.session.user.usdBalance = newBalance.toString();
        
        // Save session with updated balance
        req.session.save((err: any) => {
          if (err) {
            console.error('Session save error:', err);
          }
        });
      } else {
        // Update authenticated user balance
        await storage.updateUserBalance(user.id, (userBalance - boxPrice).toString());
      }

      // Record the opening for analytics
      try {
        const userIdForRecord = req.demoUser ? req.session.user.id : user.id;
        await storage.recordBoxOpening({
          userId: userIdForRecord,
          boxId: boxId,
          itemId: selectedItem.id
        });

        // Record the box purchase transaction
        await storage.recordTransaction({
          userId: userIdForRecord,
          type: 'box_purchase',
          amount: boxPrice.toString(),
          description: `Opened ${box.name} - Received ${selectedItem.name}`,
          method: 'balance_deduction',
          status: 'completed'
        });

        // Update user statistics
        const stringUserId = String(userIdForRecord);
        await storage.updateUserStatsAfterBoxOpening(stringUserId, boxPrice, selectedItem.rarity);
      } catch (recordError) {
        console.error('Failed to record box opening:', recordError);
        // Continue with response even if recording fails
      }

      // Add item to user inventory
      if (req.demoUser) {
        // For demo users, store inventory in database permanently
        const demoUserId = req.session.user.id;
        
        // Add item to database inventory
        await storage.addUserItem({
          userId: demoUserId,
          itemId: selectedItem.id,
          quantity: 1,
          obtainedAt: new Date()
        });
        
        console.log(`Added item to demo user database: ${selectedItem.name} for user ${demoUserId}`);
      } else {
        try {
          await storage.addToInventory(user.id, selectedItem.id);
        } catch (inventoryError) {
          console.error('Failed to add item to inventory:', inventoryError);
          // Continue with response even if inventory update fails
        }
      }

      res.json({
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
      });
    } catch (error) {
      console.error("Error opening box:", error);
      res.status(500).json({ message: "Failed to open box" });
    }
  });

  // Inventory route
  app.get("/api/user/inventory", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      // Handle demo user
      if (req.demoUser) {
        console.log('Demo user requesting inventory');
        const demoUserId = req.session.user.id;
        console.log('Demo user ID:', demoUserId);
        
        // Get inventory from database for demo user
        const inventory = await storage.getUserInventory(String(demoUserId));
        console.log('Demo user inventory from database:', inventory.length, 'items');
        
        return res.json(inventory);
      }
      
      // Handle regular authenticated user
      const userId = req.user.claims.sub;
      const inventory = await storage.getUserInventory(userId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Transaction history endpoint for demo and authenticated users
  app.get("/api/user/transactions", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      let userId;
      
      // Handle demo user
      if (req.demoUser) {
        userId = req.session.user.id;
      } else {
        // Handle regular authenticated user
        userId = req.user.claims.sub;
      }
      
      const transactions = await storage.getUserTransactions(parseInt(userId));
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Purchase history endpoint for demo and authenticated users
  app.get("/api/user/purchase-history", isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      let userId;
      
      // Handle demo user
      if (req.demoUser) {
        userId = req.session.user.id;
        console.log('Demo user requesting purchase history, ID:', userId);
      } else {
        // Handle regular authenticated user
        userId = req.user.claims.sub;
      }
      
      // Get box openings with complete details (box and item info)
      const boxOpenings = await storage.getUserBoxOpeningsWithDetails(parseInt(userId));
      
      // Format as purchase history
      const purchaseHistory = boxOpenings.map((opening: any) => ({
        id: opening.id,
        boxName: opening.boxName || "Mystery Box",
        price: opening.cost || "0.00",
        itemReceived: {
          name: opening.itemName || "Unknown Item",
          rarity: opening.itemRarity || "common"
        },
        purchasedAt: opening.openedAt,
        timeAgo: getTimeAgo(opening.openedAt)
      }));
      
      res.json(purchaseHistory);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      res.status(500).json({ message: "Failed to fetch purchase history" });
    }
  });

  // Recent openings
  app.get("/api/recent-openings", async (req, res) => {
    try {
      const openings = await storage.getRecentOpenings();
      res.json(openings);
    } catch (error) {
      console.error("Error fetching recent openings:", error);
      res.status(500).json({ message: "Failed to fetch recent openings" });
    }
  });

  // Battles route
  app.get("/api/battles", async (req, res) => {
    try {
      const battles = await storage.getActiveBattles();
      res.json(battles);
    } catch (error) {
      console.error("Error fetching battles:", error);
      res.status(500).json({ message: "Failed to fetch battles" });
    }
  });

  // Market routes
  app.get("/api/market/items", async (req, res) => {
    try {
      const items = await storage.getMarketItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching market items:", error);
      res.status(500).json({ message: "Failed to fetch market items" });
    }
  });

  app.get("/api/market/my-listings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listings = await storage.getUserListings(userId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });

  // Admin session storage
  const adminSessions = new Map<string, { username: string; loginTime: number }>();

  // Admin authentication middleware
  const adminAuth = (req: any, res: any, next: any) => {
    const token = req.headers['x-admin-token'] || req.session?.adminToken;
    
    if (!token) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    const session = adminSessions.get(token);
    if (!session) {
      return res.status(401).json({ message: "Invalid or expired admin session" });
    }

    // Check session expiry (24 hours)
    if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
      adminSessions.delete(token);
      return res.status(401).json({ message: "Admin session expired" });
    }

    req.adminUser = session;
    next();
  };

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const adminUsername = process.env.ADMIN_USERNAME || "superadmin";
      const adminPassword = process.env.ADMIN_PASSWORD || "superadmin";
      
      // Check admin credentials
      if (username === adminUsername && password === adminPassword) {
        // Generate secure session token
        const crypto = await import('crypto');
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        // Store session
        adminSessions.set(sessionToken, {
          username: username,
          loginTime: Date.now()
        });
        
        // Store in session for web interface
        if (req.session) {
          req.session.adminToken = sessionToken;
        }
        
        res.json({ 
          success: true, 
          token: sessionToken,
          message: 'Admin login successful' 
        });
      } else {
        // Add delay to prevent brute force attacks
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.status(401).json({ 
          success: false, 
          message: 'Invalid admin credentials' 
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Admin login failed" });
    }
  });

  // Admin auth check route
  app.get("/api/admin/auth-check", adminAuth, async (req, res) => {
    res.json({ authenticated: true, isAdmin: true });
  });

  // Admin logout route
  app.post("/api/admin/logout", async (req, res) => {
    if (req.session) {
      req.session.adminToken = null;
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Admin box management routes
  app.get("/api/admin/boxes", adminAuth, async (req, res) => {
    try {
      const boxes = await storage.getAllBoxes();
      res.json(boxes);
    } catch (error) {
      console.error("Error fetching admin boxes:", error);
      res.status(500).json({ message: "Failed to fetch boxes" });
    }
  });

  app.post("/api/admin/boxes", adminAuth, async (req, res) => {
    try {
      const boxData = req.body;
      const newBox = await storage.createBox(boxData);
      res.json(newBox);
    } catch (error) {
      console.error("Error creating box:", error);
      res.status(500).json({ message: "Failed to create box" });
    }
  });

  app.put("/api/admin/boxes/:id", adminAuth, async (req, res) => {
    try {
      const boxId = parseInt(req.params.id);
      const updates = req.body;
      const updatedBox = await storage.updateBox(boxId, updates);
      res.json(updatedBox);
    } catch (error) {
      console.error("Error updating box:", error);
      res.status(500).json({ message: "Failed to update box" });
    }
  });

  app.delete("/api/admin/boxes/:id", adminAuth, async (req, res) => {
    try {
      const boxId = parseInt(req.params.id);
      await storage.deleteBox(boxId);
      res.json({ success: true, message: "Box deleted successfully" });
    } catch (error) {
      console.error("Error deleting box:", error);
      res.status(500).json({ message: "Failed to delete box" });
    }
  });

  // Admin item management routes
  app.get("/api/admin/items", adminAuth, async (req, res) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching admin items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.post("/api/admin/items", adminAuth, async (req, res) => {
    try {
      const itemData = req.body;
      const newItem = await storage.createItem(itemData);
      res.json(newItem);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.put("/api/admin/items/:id", adminAuth, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const updates = req.body;
      const updatedItem = await storage.updateItem(itemId, updates);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/admin/items/:id", adminAuth, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      await storage.deleteItem(itemId);
      res.json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Admin stats route
  app.get("/api/admin/stats", adminAuth, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // B2B Partners management routes
  app.get("/api/admin/b2b-partners", adminAuth, async (req, res) => {
    try {
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.post("/api/admin/b2b-partners", adminAuth, async (req, res) => {
    try {
      const partnerData = req.body;
      const newPartner = await storage.createPartner(partnerData);
      res.json(newPartner);
    } catch (error) {
      console.error("Error creating partner:", error);
      res.status(500).json({ message: "Failed to create partner" });
    }
  });

  app.put("/api/admin/b2b-partners/:id", adminAuth, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const updates = req.body;
      const updatedPartner = await storage.updatePartner(partnerId, updates);
      res.json(updatedPartner);
    } catch (error) {
      console.error("Error updating partner:", error);
      res.status(500).json({ message: "Failed to update partner" });
    }
  });

  app.delete("/api/admin/b2b-partners/:id", adminAuth, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      await storage.deletePartner(partnerId);
      res.json({ success: true, message: "Partner deleted successfully" });
    } catch (error) {
      console.error("Error deleting partner:", error);
      res.status(500).json({ message: "Failed to delete partner" });
    }
  });

  app.get("/api/admin/partner-stats", adminAuth, async (req, res) => {
    try {
      const stats = await storage.getPartnerStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching partner stats:", error);
      res.status(500).json({ message: "Failed to fetch partner stats" });
    }
  });

  // Partner box management
  app.get("/api/admin/b2b-partners/:id/boxes", adminAuth, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const boxes = await storage.getPartnerBoxes(partnerId);
      res.json(boxes);
    } catch (error) {
      console.error("Error fetching partner boxes:", error);
      res.status(500).json({ message: "Failed to fetch partner boxes" });
    }
  });

  app.post("/api/admin/b2b-partners/:id/boxes", adminAuth, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.id);
      const { boxId, isEnabled, isFeatured, customPrice } = req.body;
      const result = await storage.addBoxToPartner(partnerId, boxId, {
        isEnabled,
        isFeatured,
        customPrice
      });
      res.json(result);
    } catch (error) {
      console.error("Error adding box to partner:", error);
      res.status(500).json({ message: "Failed to add box to partner" });
    }
  });

  app.delete("/api/admin/b2b-partners/:partnerId/boxes/:boxId", adminAuth, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const boxId = parseInt(req.params.boxId);
      await storage.removeBoxFromPartner(partnerId, boxId);
      res.json({ success: true, message: "Box removed from partner" });
    } catch (error) {
      console.error("Error removing box from partner:", error);
      res.status(500).json({ message: "Failed to remove box from partner" });
    }
  });

  // Whitelabel management routes
  app.get("/api/admin/whitelabel-sites", adminAuth, async (req, res) => {
    try {
      console.log("Fetching whitelabel sites...");
      const whitelabels = await storage.getAllWhitelabelSites();
      console.log("Found whitelabel sites:", whitelabels.length);
      res.json(whitelabels);
    } catch (error) {
      console.error("Error fetching whitelabels:", error);
      res.status(500).json({ message: "Failed to fetch whitelabels" });
    }
  });

  app.post("/api/admin/whitelabel-sites", adminAuth, async (req, res) => {
    try {
      const whitelabelData = req.body;
      const newWhitelabel = await storage.createWhitelabelSite(whitelabelData);
      res.json(newWhitelabel);
    } catch (error) {
      console.error("Error creating whitelabel:", error);
      res.status(500).json({ message: "Failed to create whitelabel" });
    }
  });

  app.put("/api/admin/whitelabel-sites/:id", adminAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      
      // Handle both numeric IDs and string whitelabel IDs
      let updatedWhitelabel;
      if (isNaN(parseInt(id))) {
        // String-based whitelabel ID
        updatedWhitelabel = await storage.updateWhitelabelSiteByWhitelabelId(id, updates);
      } else {
        // Numeric database ID
        updatedWhitelabel = await storage.updateWhitelabelSite(parseInt(id), updates);
      }
      
      res.json(updatedWhitelabel);
    } catch (error) {
      console.error("Error updating whitelabel:", error);
      res.status(500).json({ message: "Failed to update whitelabel" });
    }
  });

  app.delete("/api/admin/whitelabel-sites/:id", adminAuth, async (req, res) => {
    try {
      const whitelabelId = parseInt(req.params.id);
      await storage.deleteWhitelabelSite(whitelabelId);
      res.json({ success: true, message: "Whitelabel deleted successfully" });
    } catch (error) {
      console.error("Error deleting whitelabel:", error);
      res.status(500).json({ message: "Failed to delete whitelabel" });
    }
  });

  // Whitelabel box management
  app.get("/api/admin/whitelabel-sites/:id/boxes", adminAuth, async (req, res) => {
    try {
      const whitelabelId = req.params.id;
      const boxes = await storage.getWhitelabelBoxes(whitelabelId);
      res.json(boxes);
    } catch (error) {
      console.error("Error fetching whitelabel boxes:", error);
      res.status(500).json({ message: "Failed to fetch whitelabel boxes" });
    }
  });

  app.post("/api/admin/whitelabel-sites/:id/boxes", adminAuth, async (req, res) => {
    try {
      const whitelabelId = req.params.id;
      const { boxId, enabled, featured, customPrice, customName, customDescription, displayOrder } = req.body;
      const result = await storage.addBoxToWhitelabel(whitelabelId, boxId, {
        enabled,
        featured,
        customPrice,
        customName,
        customDescription,
        displayOrder
      });
      res.json(result);
    } catch (error) {
      console.error("Error adding box to whitelabel:", error);
      res.status(500).json({ message: "Failed to add box to whitelabel" });
    }
  });

  app.put("/api/admin/whitelabel-sites/:whitelabelId/boxes/:boxId", adminAuth, async (req, res) => {
    try {
      const whitelabelId = req.params.whitelabelId;
      const boxId = parseInt(req.params.boxId);
      const updates = req.body;
      
      console.log(`Updating whitelabel box: ${whitelabelId}/${boxId}`, updates);
      
      const result = await storage.updateWhitelabelBox(whitelabelId, boxId, updates);
      res.json(result);
    } catch (error) {
      console.error("Error updating whitelabel box:", error);
      res.status(500).json({ message: "Failed to update whitelabel box" });
    }
  });

  app.delete("/api/admin/whitelabel-sites/:whitelabelId/boxes/:boxId", adminAuth, async (req, res) => {
    try {
      const whitelabelId = req.params.whitelabelId;
      const boxId = parseInt(req.params.boxId);
      await storage.removeBoxFromWhitelabel(whitelabelId, boxId);
      res.json({ success: true, message: "Box removed from whitelabel" });
    } catch (error) {
      console.error("Error removing box from whitelabel:", error);
      res.status(500).json({ message: "Failed to remove box from whitelabel" });
    }
  });

  // Recent openings endpoint for ticker
  app.get("/api/recent-openings", async (req, res) => {
    try {
      // Get recent box openings from storage
      const recentOpenings = await storage.getRecentOpenings();
      res.json(recentOpenings);
    } catch (error) {
      console.error("Error fetching recent openings:", error);
      res.status(500).json({ message: "Failed to fetch recent openings" });
    }
  });

  // Payment simulation routes
  app.post("/api/payments/create-payment-intent", isAuthenticatedOrDemo, async (req, res) => {
    try {
      const { amount, method } = req.body;
      
      // Simulate payment intent creation
      const paymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        status: "requires_payment_method"
      };
      
      res.json({ 
        clientSecret: paymentIntent.clientSecret,
        paymentIntent: paymentIntent
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post("/api/payments/deposit", isAuthenticatedOrDemo, async (req, res) => {
    try {
      const { amount, method } = req.body;
      
      // Get user (demo or authenticated)
      let user;
      if (req.demoUser) {
        user = req.demoUser;
      } else {
        const userId = req.user?.claims?.sub;
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      const currentBalance = parseFloat(user.usdBalance || "0");
      const depositAmount = parseFloat(amount);
      const newBalance = currentBalance + depositAmount;
      
      // Update balance
      if (req.demoUser) {
        req.session.user.usdBalance = newBalance.toString();
        req.session.save((err: any) => {
          if (err) {
            console.error('Session save error:', err);
          }
        });
      } else {
        await storage.updateUserBalance(user.id, newBalance.toString());
      }
      
      // Record the deposit transaction
      await storage.recordTransaction({
        userId: user.id,
        type: 'deposit',
        amount: depositAmount.toString(),
        description: `Deposit via ${method}`,
        method: method,
        status: 'completed'
      });
      
      res.json({ 
        success: true,
        newBalance: newBalance,
        depositAmount: depositAmount,
        method: method
      });
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard/cases", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard('cases', 10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching cases leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch cases leaderboard" });
    }
  });

  app.get("/api/leaderboard/spending", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard('spending', 10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching spending leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch spending leaderboard" });
    }
  });

  app.get("/api/leaderboard/rare_items", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard('rare_items', 10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching rare items leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch rare items leaderboard" });
    }
  });

  // Statistics routes
  app.get("/api/stats/platform", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  app.get("/api/stats/user", isAuthenticatedOrDemo, async (req, res) => {
    try {
      // Get user (demo or authenticated)
      let userId;
      if (req.demoUser) {
        userId = req.demoUser.id;
      } else {
        userId = req.user?.claims?.sub;
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }
      
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Widget route is now handled in server/index.ts before Vite middleware

  // Widget data API for custom implementations
  app.get('/api/widget/data', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');
    
    const { partner } = req.query;
    
    try {
      // Get authentic data from storage
      const boxes = await storage.getAllBoxes();
      const featuredBoxes = boxes.filter(box => box.featured).slice(0, 6);
      
      const widgetData = {
        partner: partner || 'default',
        boxes: featuredBoxes.map(box => ({
          id: box.id,
          name: box.name,
          description: box.description,
          price: box.price,
          rarity: box.rarity,
          imageUrl: box.imageUrl?.startsWith('/') ? `${req.protocol}://${req.get('host')}${box.imageUrl}` : box.imageUrl
        })),
        config: {
          baseUrl: `${req.protocol}://${req.get('host')}`,
          theme: 'dark',
          features: ['boxes', 'battles', 'inventory', 'leaderboard']
        }
      };
      
      res.json(widgetData);
    } catch (error) {
      console.error("Error fetching widget data:", error);
      res.status(500).json({ message: "Failed to fetch widget data" });
    }
  });

  // Battle routes
  app.post('/api/battles', isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const userId = req.demoUser?.id || req.user.claims.sub;
      const { boxId, entryFee, maxPlayers, totalRounds } = req.body;

      const battle = await storage.createBattle({
        boxId,
        createdBy: userId,
        entryFee,
        maxPlayers: maxPlayers || 2,
        totalRounds: totalRounds || 5
      });

      res.json(battle);
    } catch (error) {
      console.error("Error creating battle:", error);
      res.status(500).json({ message: "Failed to create battle" });
    }
  });

  app.post('/api/battles/:id/join', isAuthenticatedOrDemo, async (req: any, res) => {
    try {
      const battleId = parseInt(req.params.id);
      const userId = req.demoUser?.id || req.user.claims.sub;

      const participant = await storage.joinBattle(battleId, userId);
      
      // Check if battle is now full and should start
      const battle = await storage.getBattleWithParticipants(battleId);
      if (battle.participants.length >= battle.maxPlayers) {
        await battleEngine.startBattle(battleId);
      }

      res.json(participant);
    } catch (error) {
      console.error("Error joining battle:", error);
      res.status(400).json({ message: error.message || "Failed to join battle" });
    }
  });

  app.get('/api/battles', async (req, res) => {
    try {
      const status = req.query.status as string;
      const battles = await storage.getActiveBattles();
      
      // Filter by status if provided
      const filteredBattles = status 
        ? battles.filter(battle => battle.status === status)
        : battles;

      res.json(filteredBattles);
    } catch (error) {
      console.error("Error fetching battles:", error);
      res.status(500).json({ message: "Failed to fetch battles" });
    }
  });

  // Battle creation endpoint
  app.post('/api/battles', isAuthenticatedOrDemo, async (req, res) => {
    try {
      const { 
        name, 
        boxId, 
        maxPlayers, 
        entryFee, 
        totalRounds,
        gameMode,
        teamConfiguration,
        isPrivate,
        password 
      } = req.body;
      
      // Get user ID
      let userId;
      if (req.demoUser) {
        userId = req.demoUser.id;
      } else {
        userId = req.user?.claims?.sub;
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }

      // Validate required fields
      if (!boxId || !maxPlayers || !entryFee || !totalRounds) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create battle with enhanced data structure
      const battle = await storage.createBattle({
        name: name || `${gameMode || 'Battle'} ${Date.now()}`,
        boxId: parseInt(boxId),
        createdBy: userId,
        maxPlayers: parseInt(maxPlayers),
        entryFee: parseFloat(entryFee),
        totalRounds: parseInt(totalRounds)
      });

      res.json(battle);
    } catch (error) {
      console.error("Error creating battle:", error);
      res.status(500).json({ message: "Failed to create battle" });
    }
  });

  // Join battle endpoint
  app.post('/api/battles/:id/join', isAuthenticatedOrDemo, async (req, res) => {
    try {
      const battleId = parseInt(req.params.id);
      
      // Get user ID
      let userId;
      if (req.demoUser) {
        userId = req.demoUser.id;
      } else {
        userId = req.user?.claims?.sub;
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }

      // Join battle
      const result = await storage.joinBattle(battleId, userId);
      
      // Start battle if full
      const battle = await storage.getBattleWithParticipants(battleId);
      if (battle && battle.participants.length >= battle.maxPlayers) {
        battleEngine.startBattle(battleId);
      }

      res.json(result);
    } catch (error) {
      console.error("Error joining battle:", error);
      res.status(500).json({ message: "Failed to join battle" });
    }
  });

  // Simulate join endpoint for demo purposes
  app.post('/api/battles/:id/simulate-join', async (req, res) => {
    try {
      const battleId = parseInt(req.params.id);
      
      // Force join the battle by directly using storage method with simulated user
      await storage.simulateJoinBattle(battleId);

      // Start the battle immediately
      await battleEngine.startBattle(battleId);

      res.json({ success: true, message: 'Simulated player joined and battle started' });
    } catch (error) {
      console.error("Error simulating join:", error);
      res.status(500).json({ message: "Failed to simulate join" });
    }
  });

  app.get('/api/battles/:id', async (req, res) => {
    try {
      const battleId = parseInt(req.params.id);
      const battle = await storage.getBattleWithParticipants(battleId);
      
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }

      // Get live battle state if active
      const liveState = battleEngine.getBattleState(battleId);
      if (liveState) {
        res.json(liveState);
      } else {
        res.json(battle);
      }
    } catch (error) {
      console.error("Error fetching battle:", error);
      res.status(500).json({ message: "Failed to fetch battle" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time battle updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'subscribe_battle' && data.battleId) {
          battleEngine.subscribeToBattle(data.battleId, ws);
        }
        
        if (data.type === 'unsubscribe_battle' && data.battleId) {
          battleEngine.unsubscribeFromBattle(data.battleId, ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      // Clean up subscriptions for this client
      // The battle engine will handle cleanup when clients disconnect
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}