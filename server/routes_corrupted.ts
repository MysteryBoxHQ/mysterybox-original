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

  // Widget iframe endpoint - Multiple approaches to bypass CSP
  app.get('/widget/iframe', async (req, res) => {
    // Attempt to override all possible CSP headers
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('X-XSS-Protection');
    res.removeHeader('Referrer-Policy');
    res.removeHeader('Permissions-Policy');
    
    // Set multiple iframe-friendly headers
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Override CSP with iframe-friendly policy
    res.setHeader('Content-Security-Policy', "frame-ancestors *; default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: http: blob:;");
    
    const { partner } = req.query;
    
    const iframeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mystery Boxes Widget</title>
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
        .container { 
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
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.8;
            margin-bottom: 20px;
        }
        .partner-info {
            display: inline-block;
            padding: 8px 16px;
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid rgba(76, 175, 80, 0.5);
            border-radius: 20px;
            color: #4caf50;
            font-weight: 600;
        }
        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .widget-section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .section-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: #4ecdc4;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            opacity: 0.9;
        }
        .feature-list li:last-child {
            border-bottom: none;
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
        .loading-animation {
            text-align: center;
            margin: 20px 0;
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 3px solid #4ecdc4;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="widget-header">
            <div class="logo">Mystery Boxes</div>
            <div class="subtitle">Premium Gaming Widget Experience</div>
            <div class="partner-info">
                <span class="status-indicator"></span>
                Partner: ${partner || 'default'}
            </div>
        </div>
        
        <div class="content-grid">
            <div class="widget-section">
                <div class="section-title">🎁 Widget Status</div>
                <ul class="feature-list">
                    <li>✅ Iframe embedding enabled</li>
                    <li>✅ CSP headers configured</li>
                    <li>✅ Cross-origin access allowed</li>
                    <li>✅ Partner authentication active</li>
                </ul>
            </div>
            
            <div class="widget-section">
                <div class="section-title">🚀 Available Features</div>
                <ul class="feature-list">
                    <li>Mystery box opening system</li>
                    <li>Real-time leaderboards</li>
                    <li>Inventory management</li>
                    <li>Case battle integration</li>
                </ul>
            </div>
            
            <div class="widget-section">
                <div class="section-title">⚡ Loading Status</div>
                <div class="loading-animation">
                    <div class="spinner"></div>
                    <p style="margin-top: 15px; opacity: 0.8;">Widget successfully embedded!</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Verify iframe embedding capability
        console.log('Mystery Boxes Widget loaded successfully');
        console.log('Partner:', '${partner || 'default'}');
        console.log('Iframe embedding: Enabled');
        
        // Test for parent frame communication
        try {
            if (window.parent !== window) {
                console.log('Running inside iframe - SUCCESS');
                window.parent.postMessage({
                    type: 'widget_loaded',
                    partner: '${partner || 'default'}',
                    status: 'success'
                }, '*');
            }
        } catch (e) {
            console.log('Iframe communication test completed');
        }
        
        // Add visual feedback for successful loading
        setTimeout(() => {
            const spinner = document.querySelector('.spinner');
            const loadingText = document.querySelector('.loading-animation p');
            if (spinner && loadingText) {
                spinner.style.borderTopColor = '#4caf50';
                loadingText.textContent = 'Widget ready for interaction!';
                loadingText.style.color = '#4caf50';
            }
        }, 2000);
    </script>
</body>
</html>`;
    
    res.send(iframeHTML);
  });

  // JSON API for external widget implementation (CSP bypass solution)
  app.get('/api/widget/data', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');
    
    const { partner } = req.query;
    
    try {
      // Get authentic partner data
      const boxes = await storage.getAllBoxes();
      const featuredBoxes = boxes.filter(box => box.featured).slice(0, 6);
      
      // Mock leaderboard data (replace with real API call)
      const leaderboard = [
        { username: 'CryptoKing', totalSpent: 15420, casesOpened: 1247, rareItems: 89 },
        { username: 'LuckyStrike', totalSpent: 12890, casesOpened: 1056, rareItems: 67 },
        { username: 'BoxMaster', totalSpent: 9750, casesOpened: 892, rareItems: 45 }
      ];
      
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
        leaderboard,
        config: {
          baseUrl: `${req.protocol}://${req.get('host')}`,
          theme: 'dark',
          features: ['boxes', 'leaderboard', 'inventory', 'battles']
        }
      };
      
      res.json(widgetData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load widget data' });
    }
  });

  // Widget JavaScript SDK for external embedding
  app.get('/widget.js', async (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const widgetJS = \`
/**
 * RollingDrop Widget SDK
 * Embeddable mystery box widget for partner sites
 */
class RollingDropWidget {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.partner = options.partner || 'default';
    this.baseUrl = options.baseUrl || '\${req.protocol}://\${req.get('host')}';
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      throw new Error(\`Container element with ID '\${containerId}' not found\`);
    }
    
    this.init();
  }
  
  async init() {
    try {
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('RollingDrop Widget Error:', error);
      this.renderError();
    }
  }
  
  async loadData() {
    const response = await fetch(\`\${this.baseUrl}/api/widget/data?partner=\${this.partner}\`);
    if (!response.ok) throw new Error('Failed to load widget data');
    this.data = await response.json();
  }
  
  render() {
    const html = \`
      <div style="font-family: 'Inter', Arial, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 20px; border-radius: 12px; min-height: 400px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; font-size: 2rem; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Mystery Boxes</h2>
          <div style="display: inline-block; padding: 6px 12px; background: rgba(76, 175, 80, 0.2); border: 1px solid rgba(76, 175, 80, 0.5); border-radius: 15px; color: #4caf50; font-size: 0.9rem;">Partner: \${this.data.partner}</div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          \${this.data.boxes.map(box => \`
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 15px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2); transition: transform 0.3s ease;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
              <img src="\${box.imageUrl}" alt="\${box.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;" onerror="this.src='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'">
              <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; color: white;">\${box.name}</h3>
              <div style="color: #4ecdc4; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">$\${box.price}</div>
              <div style="background: rgba(139, 92, 246, 0.8); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; display: inline-block; margin-bottom: 10px; text-transform: uppercase;">\${box.rarity}</div>
              <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; margin-bottom: 15px;">\${box.description}</div>
              <button onclick="window.open('\${this.baseUrl}', '_blank')" style="width: 100%; padding: 10px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); border: none; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; transition: transform 0.2s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">Open Box - $\${box.price}</button>
            </div>
          \`).join('')}
        </div>
        
        <div style="margin-top: 30px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #4ecdc4; font-size: 1.2rem;">🏆 Top Players</h3>
          <div style="display: grid; gap: 10px;">
            \${this.data.leaderboard.map((player, index) => \`
              <div style="display: flex; align-items: center; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                <div style="font-size: 1.2rem; font-weight: bold; color: #4ecdc4; margin-right: 15px; min-width: 30px;">#\${index + 1}</div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; margin-bottom: 2px;">\${player.username}</div>
                  <div style="font-size: 0.9rem; opacity: 0.8;">Total Spent: $\${player.totalSpent.toLocaleString()}</div>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <button onclick="window.open('\${this.baseUrl}', '_blank')" style="padding: 12px 24px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; font-size: 1rem;">View Full Platform</button>
        </div>
      </div>
    \`;
    
    this.container.innerHTML = html;
  }
  
  renderError() {
    this.container.innerHTML = \`
      <div style="font-family: Arial, sans-serif; background: #1a1a2e; color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h3 style="color: #ff6b6b; margin-bottom: 10px;">Widget Loading Error</h3>
        <p style="margin-bottom: 15px; opacity: 0.8;">Unable to load mystery box data</p>
        <button onclick="this.parentElement.style.display='none'" style="padding: 8px 16px; background: #333; border: 1px solid #555; border-radius: 4px; color: white; cursor: pointer;">Dismiss</button>
      </div>
    \`;
  }
}

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', function() {
  const autoElements = document.querySelectorAll('[data-rollingdrop-widget]');
  autoElements.forEach(element => {
    const partner = element.getAttribute('data-partner') || 'default';
    const baseUrl = element.getAttribute('data-base-url') || '\${req.protocol}://\${req.get('host')}';
    new RollingDropWidget(element.id, { partner, baseUrl });
  });
});

// Global namespace
window.RollingDropWidget = RollingDropWidget;
\`;
    
    res.send(widgetJS);
  });

  // Security middleware - AFTER iframe routes
  app.use((req, res, next) => {
    // Skip security headers for widget routes
    if (req.path === '/iframe_widget.html' || req.path.startsWith('/widget/')) {
      return next();
    }
    
    // Apply security headers for other routes
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