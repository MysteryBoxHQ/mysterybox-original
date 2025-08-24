import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupExternalAPI } from "./external-api";
import { setupSwagger } from "./swagger";
import { setupFreeCDN } from "./free-cdn";
import { setupPartnerAPI } from "./partner-api";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add widget iframe route with a path that won't conflict with Vite
app.get('/api/widget/iframe', async (req, res) => {
  // Remove all CSP and frame restrictions for iframe embedding
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Security-Policy');
  res.removeHeader('X-WebKit-CSP');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-XSS-Protection');
  res.removeHeader('Referrer-Policy');
  res.removeHeader('Permissions-Policy');
  
  // Set iframe-friendly headers
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *; default-src * data: blob: \'unsafe-inline\' \'unsafe-eval\';');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  const { partner, theme = 'dark', currency = 'USD' } = req.query;
  
  try {
    // Get boxes data for the widget
    const boxes = await storage.getAllBoxes();
    const featuredBoxes = boxes.filter(box => box.featured).slice(0, 12);
    
    const widgetHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RollingDrop Widget - ${partner || 'default'}</title>
    <meta http-equiv="Content-Security-Policy" content="frame-ancestors *;">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f0f23, #1a1a2e);
            color: white;
            height: 100vh;
            overflow-y: auto;
        }
        
        .widget-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .widget-header {
            background: rgba(0, 0, 0, 0.8);
            padding: 1rem;
            border-bottom: 2px solid #ffd700;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        
        .partner-branding {
            font-size: 1.2rem;
            font-weight: bold;
            color: #ffd700;
        }
        
        .widget-nav {
            display: flex;
            gap: 1rem;
        }
        
        .nav-btn {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid #ffd700;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.9rem;
        }
        
        .nav-btn:hover, .nav-btn.active {
            background: #ffd700;
            color: #0f0f23;
        }
        
        .widget-content {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
        }
        
        .section-title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 2rem;
            text-align: center;
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .boxes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .box-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 1.5rem;
            border: 1px solid rgba(255, 215, 0, 0.2);
            transition: all 0.3s;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .box-card:hover {
            transform: translateY(-5px);
            border-color: #ffd700;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
        }
        
        .box-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(45deg, #2a2a2a, #1a1a1a);
            border-radius: 10px;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            background-size: cover;
            background-position: center;
        }
        
        .box-name {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #ffd700;
        }
        
        .box-description {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 1rem;
            line-height: 1.4;
        }
        
        .box-price {
            font-size: 1.5rem;
            font-weight: bold;
            color: #ffd700;
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .box-rarity {
            position: absolute;
            top: 1rem;
            right: 1rem;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .rarity-common { background: #888; }
        .rarity-rare { background: #4CAF50; }
        .rarity-epic { background: #9C27B0; }
        .rarity-legendary { background: #FF9800; }
        .rarity-mythical { background: #F44336; }
        
        .open-btn {
            width: 100%;
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #0f0f23;
            border: none;
            padding: 1rem;
            border-radius: 10px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .open-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
        }
        
        .partner-footer {
            background: rgba(0, 0, 0, 0.9);
            padding: 1rem;
            text-align: center;
            font-size: 0.8rem;
            border-top: 1px solid rgba(255, 215, 0, 0.3);
            flex-shrink: 0;
        }
        
        .coming-soon {
            text-align: center;
            padding: 4rem 2rem;
            color: rgba(255, 255, 255, 0.6);
        }
        
        .coming-soon h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #ffd700;
        }
        
        @media (max-width: 768px) {
            .boxes-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .widget-content {
                padding: 1rem;
            }
            
            .widget-nav {
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .nav-btn {
                padding: 0.4rem 0.8rem;
                font-size: 0.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="widget-container">
        <div class="widget-header">
            <div class="partner-branding">
                ${partner ? partner.charAt(0).toUpperCase() + partner.slice(1).replace('-', ' ') : 'Mystery Boxes'}
            </div>
            <div class="widget-nav">
                <button class="nav-btn active" onclick="loadSection('boxes')">Boxes</button>
                <button class="nav-btn" onclick="loadSection('battles')">Battles</button>
                <button class="nav-btn" onclick="loadSection('inventory')">Inventory</button>
                <button class="nav-btn" onclick="loadSection('leaderboard')">Leaderboard</button>
            </div>
        </div>
        
        <div class="widget-content">
            <div id="boxes-section">
                <h2 class="section-title">Mystery Boxes</h2>
                <div class="boxes-grid">
                    ${featuredBoxes.map(box => `
                        <div class="box-card" onclick="openBox(${box.id})">
                            <div class="box-rarity rarity-${box.rarity || 'common'}">${box.rarity || 'common'}</div>
                            <div class="box-image" style="background-image: url('${box.imageUrl || ''}');">
                                ${!box.imageUrl ? '📦' : ''}
                            </div>
                            <div class="box-name">${box.name}</div>
                            <div class="box-description">${box.description || 'Discover amazing items in this mystery box!'}</div>
                            <div class="box-price">$${box.price}</div>
                            <button class="open-btn">Open Box</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div id="battles-section" style="display: none;">
                <h2 class="section-title">Case Battles</h2>
                <div class="coming-soon">
                    <h3>Case Battles Coming Soon</h3>
                    <p>Compete against other players in real-time case opening battles!</p>
                </div>
            </div>
            
            <div id="inventory-section" style="display: none;">
                <h2 class="section-title">Your Inventory</h2>
                <div class="coming-soon">
                    <h3>Inventory Management</h3>
                    <p>View and manage your collected items here!</p>
                </div>
            </div>
            
            <div id="leaderboard-section" style="display: none;">
                <h2 class="section-title">Leaderboard</h2>
                <div class="coming-soon">
                    <h3>Global Rankings</h3>
                    <p>See the top players and their achievements!</p>
                </div>
            </div>
        </div>
        
        <div class="partner-footer">
            Powered by RollingDrop Platform | Partner: ${partner || 'default'}
        </div>
    </div>

    <script>
        let currentSection = 'boxes';
        
        function loadSection(section) {
            // Update navigation
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('[id$="-section"]').forEach(el => el.style.display = 'none');
            
            // Show selected section
            document.getElementById(section + '-section').style.display = 'block';
            
            currentSection = section;
            
            // Notify parent window
            window.parent.postMessage({
                type: 'section_changed',
                section: section,
                partner: '${partner || 'default'}',
                timestamp: Date.now()
            }, '*');
        }
        
        function openBox(boxId) {
            // Show loading
            const card = event.currentTarget;
            const btn = card.querySelector('.open-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Opening...';
            btn.disabled = true;
            
            // Notify parent window about box opening
            window.parent.postMessage({
                type: 'box_opening',
                boxId: boxId,
                partner: '${partner || 'default'}',
                timestamp: Date.now()
            }, '*');
            
            // Simulate box opening (in real implementation, this would call the API)
            setTimeout(() => {
                btn.textContent = 'Opened!';
                btn.style.background = '#4CAF50';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 2000);
            }, 1500);
        }
        
        // Initialize widget
        document.addEventListener('DOMContentLoaded', function() {
            console.log('RollingDrop Widget initialized for partner: ${partner || 'default'}');
            
            // Notify parent window that widget is ready
            window.parent.postMessage({
                type: 'widget_ready',
                partner: '${partner || 'default'}',
                section: currentSection,
                boxCount: ${featuredBoxes.length},
                timestamp: Date.now()
            }, '*');
        });
        
        // Listen for messages from parent window
        window.addEventListener('message', function(event) {
            console.log('Widget received message:', event.data);
            
            if (event.data.type === 'navigate_to_section' && event.data.section) {
                const navBtn = document.querySelector(\`[onclick="loadSection('\${event.data.section}')"]\`);
                if (navBtn) {
                    navBtn.click();
                }
            }
        });
    </script>
</body>
</html>`;
    
    res.send(widgetHTML);
  } catch (error) {
    console.error('Widget error:', error);
    res.status(500).send('Widget loading error');
  }
});

// Add iframe widget route BEFORE any security middleware
app.get('/iframe_widget.html', async (req, res) => {
  // Remove all security headers that prevent iframe embedding
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-XSS-Protection');
  res.removeHeader('Referrer-Policy');
  res.removeHeader('Permissions-Policy');
  
  // Set iframe-friendly headers
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  
  const { partner } = req.query;
  
  const iframeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mystery Boxes Widget</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #1a1a2e; color: white; }
        .loading { text-align: center; padding: 50px; }
    </style>
</head>
<body>
    <div class="loading">
        <h1>Loading Mystery Boxes Widget...</h1>
        <p>Partner: ${partner || 'default'}</p>
        <script>
            // Redirect to full widget implementation
            window.location.href = '/widget/iframe?partner=${partner || 'default'}';
        </script>
    </div>
</body>
</html>`;
  
  res.send(iframeHTML);
});

// Serve whitelabel HTML files BEFORE any other middleware
app.get('/whitelabel_login_demo.html', (req, res) => {
  res.sendFile('whitelabel_login_demo.html', { root: '.' });
});

app.get('/whitelabel_platform_demo.html', (req, res) => {
  res.sendFile('whitelabel_platform_demo.html', { root: '.' });
});

// Whitelabel platform routes - serve the complete platform
app.get('/whitelabel/platform', (req, res) => {
  res.sendFile('whitelabel_complete_platform.html', { root: '.' });
});

app.get('/whitelabel/login', (req, res) => {
  res.sendFile('whitelabel_login_demo.html', { root: '.' });
});

app.get('/whitelabel/demo', (req, res) => {
  res.sendFile('whitelabel_platform_demo.html', { root: '.' });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize RollingDrop whitelabel instance
async function initializeRollingDropWhitelabel() {
  try {
    const rollingDropWhitelabel = {
      whitelabelId: "rollingdrop-main",
      name: "RollingDrop",
      displayName: "RollingDrop - Mystery Box Platform",
      slug: "rollingdrop",
      primaryDomain: "0d2da366-1f84-4d2a-a5a9-b4efb6f2e012-00-1d28ji46vsr2s.picard.replit.dev",
      status: "active",
      deploymentStatus: "deployed",
      deploymentUrl: "https://0d2da366-1f84-4d2a-a5a9-b4efb6f2e012-00-1d28ji46vsr2s.picard.replit.dev",
      brandingConfig: {
        primaryColor: "#4F86F7",
        secondaryColor: "#CC33FF",
        accentColor: "#F59E0B",
        logo: "",
        favicon: "",
        brandName: "RollingDrop",
        tagline: "Discover Amazing Mystery Boxes"
      },
      themeConfig: {
        theme: "cosmic-blue",
        customCss: "",
        layout: "modern"
      },
      contentConfig: {
        heroTitle: "Discover Amazing Mystery Boxes",
        heroSubtitle: "Unbox the unexpected with our curated collection of premium mystery boxes",
        featuredBoxesTitle: "Featured Boxes",
        recentOpeningsTitle: "Recent Openings"
      },
      seoConfig: {
        title: "RollingDrop - Premium Mystery Box Platform",
        description: "Discover amazing mystery boxes filled with premium items. Unbox the unexpected with RollingDrop.",
        keywords: "mystery boxes, unboxing, premium items, collectibles",
        ogImage: ""
      },
      featureConfig: {
        enableBattles: true,
        enableMarketplace: false,
        enableShipping: false,
        enableAchievements: true,
        enableLeaderboards: true,
        enableInventory: true
      },
      paymentConfig: {
        currency: "USD",
        enableStripe: false,
        enablePaypal: false
      }
    };

    // Check if RollingDrop whitelabel already exists
    const existingWhitelabel = await storage.getWhitelabelSiteByWhitelabelId("rollingdrop-main");
    if (!existingWhitelabel) {
      await storage.createWhitelabelSite(rollingDropWhitelabel);
      log("✓ RollingDrop whitelabel instance initialized in admin console");
    } else {
      log("✓ RollingDrop whitelabel instance already exists in admin console");
    }
  } catch (error) {
    log("⚠ Failed to initialize RollingDrop whitelabel instance:", error);
  }
}

(async () => {
  // Initialize RollingDrop whitelabel instance
  await initializeRollingDropWhitelabel();
  
  // Setup free CDN for image handling
  setupFreeCDN(app);
  
  // Setup external API for 3rd party integrations
  await setupExternalAPI(app);
  
  // Setup Partner API for B2B/B2C multi-tenant system
  setupPartnerAPI(app);
  
  // Setup Swagger documentation
  setupSwagger(app);
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
