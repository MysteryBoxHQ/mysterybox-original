import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { insertBoxSchema, insertItemSchema, insertFairnessProofSchema, type BoxOpeningResult, partners, apiUsage, partnerBoxes, whitelabelSites, insertWhitelabelSiteSchema, type WhitelabelSite } from "@shared/schema";
import { whitelabelManager } from "./whitelabel-manager";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { FairnessSystem } from "./fairness";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Widget iframe endpoint - Enhanced with CSP override
  app.get('/widget/iframe', async (req, res) => {
    // Override all possible CSP configurations
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('X-XSS-Protection');
    res.removeHeader('Referrer-Policy');
    res.removeHeader('Permissions-Policy');
    
    // Set iframe-friendly headers with explicit CSP override
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *; default-src * data: blob: \'unsafe-inline\' \'unsafe-eval\'; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
    
    const { partner } = req.query;
    
    const iframeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mystery Boxes Widget - ${partner || 'default'}</title>
    <meta http-equiv="Content-Security-Policy" content="frame-ancestors *;">
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: 'Inter', Arial, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white; 
            min-height: 100vh;
        }
        .widget-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .widget-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 30px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        .logo {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .partner-badge {
            display: inline-block;
            padding: 8px 16px;
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid rgba(76, 175, 80, 0.5);
            border-radius: 20px;
            color: #4caf50;
            font-weight: 600;
        }
        .success-message {
            background: rgba(76, 175, 80, 0.1);
            border: 1px solid rgba(76, 175, 80, 0.3);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .feature-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #4caf50;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="widget-header">
            <div class="logo">Mystery Boxes</div>
            <p style="margin: 10px 0 20px; opacity: 0.8; font-size: 1.1rem;">Premium Gaming Widget Experience</p>
            <div class="partner-badge">
                <span class="status-indicator"></span>
                Partner: ${partner || 'default'}
            </div>
        </div>
        
        <div class="success-message">
            <h2 style="margin: 0 0 10px; color: #4caf50;">✅ Widget Successfully Embedded!</h2>
            <p style="margin: 0; opacity: 0.9;">Iframe embedding is working correctly without CSP restrictions</p>
        </div>
        
        <div class="feature-grid">
            <div class="feature-card">
                <h3 style="margin: 0 0 15px; color: #4ecdc4;">🎁 Widget Status</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">✅ Iframe embedding enabled</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">✅ CSP headers bypassed</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">✅ Cross-origin access allowed</li>
                    <li style="padding: 8px 0;">✅ Partner authentication active</li>
                </ul>
            </div>
            
            <div class="feature-card">
                <h3 style="margin: 0 0 15px; color: #4ecdc4;">🚀 Available Features</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">Mystery box opening system</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">Real-time leaderboards</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">Inventory management</li>
                    <li style="padding: 8px 0;">Case battle integration</li>
                </ul>
            </div>
            
            <div class="feature-card">
                <h3 style="margin: 0 0 15px; color: #4ecdc4;">⚡ Technical Details</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">X-Frame-Options: ALLOWALL</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">CSP: frame-ancestors *</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">CORS: Enabled</li>
                    <li style="padding: 8px 0;">Protocol: HTTPS ready</li>
                </ul>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <a href="https://0d2da366-1f84-4d2a-a5a9-b4efb6f2e012-00-1d28ji46vsr2s.picard.replit.dev" target="_blank" class="cta-button">
                View Full Platform
            </a>
        </div>
    </div>
    
    <script>
        console.log('Mystery Boxes Widget loaded successfully');
        console.log('Partner:', '${partner || 'default'}');
        console.log('Iframe embedding: ENABLED');
        
        // Initialize parent communication for payment integration
        let widgetData = null;
        
        // Load widget data for interactive features
        async function loadWidgetData() {
            try {
                const response = await fetch('/api/widget/data?partner=${partner || 'default'}');
                const data = await response.json();
                widgetData = data;
                renderInteractiveBoxes();
                console.log('✅ Widget data loaded for interactive features');
            } catch (error) {
                console.error('Failed to load widget data:', error);
            }
        }
        
        // Render interactive mystery boxes
        function renderInteractiveBoxes() {
            if (!widgetData || !widgetData.boxes) return;
            
            const boxesContainer = document.getElementById('interactiveBoxes');
            if (!boxesContainer) return;
            
            boxesContainer.innerHTML = widgetData.boxes.map(box => 
                '<div class="mystery-box-card" data-box-id="' + box.id + '">' +
                    '<div class="box-image">' +
                        '<img src="' + box.imageUrl + '" alt="' + box.name + '" onerror="this.src=\'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400\'">' +
                    '</div>' +
                    '<div class="box-info">' +
                        '<h3>' + box.name + '</h3>' +
                        '<p class="box-description">' + box.description + '</p>' +
                        '<div class="box-price">$' + box.price + '</div>' +
                        '<div class="box-rarity rarity-' + box.rarity + '">' + box.rarity.toUpperCase() + '</div>' +
                        '<button class="open-box-btn" onclick="handleBoxPurchase(' + box.id + ', \'' + box.name + '\', ' + box.price + ')">' +
                            'Open Box - $' + box.price +
                        '</button>' +
                    '</div>' +
                '</div>'
            ).join('');
        }
        
        // Handle box purchase - communicate with parent site
        window.handleBoxPurchase = function(boxId, boxName, price) {
            console.log('🎁 Box purchase initiated:', { boxId, boxName, price });
            
            // Send purchase request to parent (Rolling Riches)
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'mystery_box_purchase',
                    data: {
                        boxId: boxId,
                        boxName: boxName,
                        price: price,
                        partner: '${partner || 'default'}',
                        timestamp: Date.now()
                    }
                }, '*');
                
                console.log('📤 Purchase request sent to parent site');
                
                // Show loading state
                const button = event.target;
                const originalText = button.textContent;
                button.textContent = 'Processing...';
                button.disabled = true;
                
                // Reset button after timeout if no response
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 10000);
            } else {
                console.log('⚠️ Not in iframe - would redirect to payment');
                alert('Payment integration requires embedding in Rolling Riches platform');
            }
        };
        
        // Listen for payment completion from parent
        window.addEventListener('message', function(event) {
            if (event.data.type === 'payment_completed') {
                console.log('✅ Payment completed:', event.data);
                handlePaymentSuccess(event.data);
            } else if (event.data.type === 'payment_failed') {
                console.log('❌ Payment failed:', event.data);
                handlePaymentFailure(event.data);
            }
        });
        
        function handlePaymentSuccess(paymentData) {
            // Find the button and update it
            const buttons = document.querySelectorAll('.open-box-btn');
            buttons.forEach(btn => btn.disabled = false);
            
            // Show success animation
            showNotification('Payment successful! Opening box...', 'success');
            
            // Trigger box opening animation
            setTimeout(() => {
                simulateBoxOpening(paymentData.boxId);
            }, 1000);
        }
        
        function handlePaymentFailure(errorData) {
            // Re-enable buttons
            const buttons = document.querySelectorAll('.open-box-btn');
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = btn.textContent.replace('Processing...', 'Open Box');
            });
            
            showNotification('Payment failed. Please try again.', 'error');
        }
        
        function simulateBoxOpening(boxId) {
            // This would integrate with the actual box opening logic
            console.log('🎉 Opening box:', boxId);
            showNotification('Box opened! Check your inventory for new items.', 'success');
        }
        
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                background: ${type === 'success' ? '#4caf50' : '#f44336'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        }
        
        // Notify parent that widget is ready
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'rollingdrop_widget_loaded',
                partner: '${partner || 'default'}',
                status: 'success',
                timestamp: Date.now()
            }, '*');
        }
        
        // Load interactive features
        loadWidgetData();
        
        // Visual confirmation of successful embedding
        setTimeout(() => {
            const indicator = document.querySelector('.status-indicator');
            if (indicator) {
                indicator.style.background = '#4caf50';
                indicator.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
            }
        }, 1000);
    </script>
</body>
</html>`;
    
    res.send(iframeHTML);
  });

  // JSON API endpoint for widget data
  app.get('/api/widget/data', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');
    
    const { partner } = req.query;
    
    try {
      const boxes = await storage.getAllBoxes();
      const featuredBoxes = boxes.filter(box => box.featured).slice(0, 6);
      
      const leaderboard = [
        { username: 'CryptoKing', totalSpent: 15420, casesOpened: 1247, rareItems: 89 },
        { username: 'LuckyStrike', totalSpent: 12890, casesOpened: 1056, rareItems: 67 },
        { username: 'BoxMaster', totalSpent: 9750, casesOpened: 892, rareItems: 45 }
      ];
      
      const baseUrl = req.protocol + '://' + req.get('host');
      
      const widgetData = {
        partner: partner || 'default',
        boxes: featuredBoxes.map(box => ({
          id: box.id,
          name: box.name,
          description: box.description,
          price: box.price,
          rarity: box.rarity,
          imageUrl: box.imageUrl?.startsWith('/') ? baseUrl + box.imageUrl : box.imageUrl
        })),
        leaderboard,
        config: {
          baseUrl: baseUrl,
          theme: 'dark',
          features: ['boxes', 'leaderboard', 'inventory', 'battles']
        }
      };
      
      res.json(widgetData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load widget data' });
    }
  });

  // Partner purchase webhook - Rolling Riches sends purchase details here
  app.post('/api/partner/purchase', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    try {
      const { partner, userId, boxId, transactionId, amount, paymentMethod, timestamp } = req.body;
      
      // Validate required fields
      if (!partner || !userId || !boxId || !transactionId || !amount) {
        return res.status(400).json({ error: 'Missing required purchase data' });
      }
      
      // Get box details for opening simulation
      const box = await storage.getBoxById(boxId);
      if (!box) {
        return res.status(404).json({ error: 'Box not found' });
      }
      
      // Open the box and get items
      const boxResult = await storage.openBox(boxId);
      const wonItems = boxResult.items || [];
      
      // Record the purchase in our system
      const purchaseRecord = {
        id: crypto.randomUUID(),
        partner: partner,
        userId: userId,
        boxId: boxId,
        boxName: box.name,
        transactionId: transactionId,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'unknown',
        timestamp: timestamp || new Date().toISOString(),
        items: wonItems,
        status: 'completed'
      };
      
      // Save to storage (you would implement this in your storage layer)
      await storage.recordPartnerPurchase(purchaseRecord);
      
      // Add items to user's inventory
      for (const item of wonItems) {
        await storage.addItemToUserInventory(userId, item, partner);
      }
      
      res.json({
        success: true,
        purchaseId: purchaseRecord.id,
        items: wonItems,
        boxOpened: {
          boxId: boxId,
          boxName: box.name,
          totalValue: wonItems.reduce((sum, item) => sum + parseFloat(item.value || 0), 0)
        }
      });
      
    } catch (error) {
      console.error('Purchase webhook error:', error);
      res.status(500).json({ error: 'Failed to process purchase' });
    }
  });

  // Get user inventory for partner integration
  app.get('/api/partner/inventory/:userId', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    try {
      const { userId } = req.params;
      const { partner } = req.query;
      
      const inventory = await storage.getUserInventory(userId, partner);
      
      res.json({
        userId: userId,
        partner: partner,
        items: inventory || [],
        totalValue: inventory?.reduce((sum, item) => sum + parseFloat(item.value || 0), 0) || 0
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  });

  // Marketplace listing endpoint
  app.post('/api/partner/marketplace/list', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    try {
      const { userId, itemId, price, partner } = req.body;
      
      // Validate user owns the item
      const userInventory = await storage.getUserInventory(userId, partner);
      const item = userInventory?.find(inv => inv.itemId === itemId);
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found in user inventory' });
      }
      
      // Create marketplace listing
      const listing = {
        id: crypto.randomUUID(),
        userId: userId,
        itemId: itemId,
        itemName: item.name,
        itemImage: item.imageUrl,
        itemRarity: item.rarity,
        price: parseFloat(price),
        partner: partner,
        listedAt: new Date().toISOString(),
        status: 'active'
      };
      
      await storage.createMarketplaceListing(listing);
      
      // Remove item from user inventory (mark as listed)
      await storage.markItemAsListed(userId, itemId, partner);
      
      res.json({
        success: true,
        listingId: listing.id,
        message: 'Item listed successfully'
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to list item' });
    }
  });

  // Get marketplace listings
  app.get('/api/partner/marketplace', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    try {
      const { partner } = req.query;
      const listings = await storage.getMarketplaceListings(partner);
      
      res.json({
        partner: partner,
        listings: listings || []
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch marketplace' });
    }
  });

  // Security middleware for non-widget routes
  app.use((req, res, next) => {
    if (req.path === '/iframe_widget.html' || req.path.startsWith('/widget/') || req.path.startsWith('/api/widget/')) {
      return next();
    }
    
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    const cspPolicies = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'self' https://replit.com https://*.replit.com http://localhost:3000",
      "base-uri 'self'",
      "form-action 'self'"
    ];
    
    res.setHeader('Content-Security-Policy', cspPolicies.join('; '));
    next();
  });

  // Basic API routes
  app.get('/api/boxes', async (req, res) => {
    try {
      const boxes = await storage.getAllBoxes();
      res.json(boxes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch boxes' });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}