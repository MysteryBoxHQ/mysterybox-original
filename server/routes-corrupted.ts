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

  // Widget CSS endpoint
  app.get('/widget/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const widgetCSS = `
/* Tailwind CSS Reset & Base */
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}::before,::after{--tw-content:''}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type='button'],[type='reset'],[type='submit']{-webkit-appearance:button;background-color:transparent;background-image:none}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role="button"]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}

/* Widget Base */
.widget-container{max-width:72rem;margin:0 auto;padding:0;background:#0d1117!important;color:#e6edf3!important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
.tab-nav{display:flex;border-bottom:1px solid #2a2d33;margin-bottom:1.5rem}
.tab-button{padding:0.5rem 1rem;font-weight:500;font-size:0.875rem;border-bottom:2px solid transparent;transition:color 0.2s;cursor:pointer;color:#8b949e;background:none;border:none;border-bottom:2px solid transparent}
.tab-button.active{border-bottom-color:#58a6ff;color:#58a6ff}
.tab-button:hover:not(.active){color:#e6edf3}
.tab-content{display:none}
.tab-content.active{display:block}

/* Mystery Boxes */
.boxes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;padding:1rem 0}
.mystery-box-card{background:#1e2328;border:1px solid #2a2d33;border-radius:0.5rem;overflow:hidden;transition:all 0.2s ease;cursor:pointer}
.mystery-box-card:hover{transform:translateY(-2px);border-color:#3d4147;box-shadow:0 4px 12px rgba(0,0,0,0.3)}
.box-image{position:relative;height:12rem;overflow:hidden}
.box-image img{width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease}
.mystery-box-card:hover .box-image img{transform:scale(1.05)}
.box-rarity{position:absolute;top:0.5rem;right:0.5rem;padding:0.25rem 0.5rem;font-size:0.75rem;font-weight:700;border-radius:0.25rem;text-transform:uppercase}
.rarity-common{background:#6b7280;color:white}.rarity-uncommon{background:#10b981;color:white}.rarity-rare{background:#3b82f6;color:white}.rarity-epic{background:#8b5cf6;color:white}.rarity-legendary{background:#f59e0b;color:white}.rarity-mythical{background:#ef4444;color:white}
.box-content{padding:1rem}
.box-title{font-size:1.125rem;font-weight:600;margin-bottom:0.5rem;color:#e6edf3}
.box-description{font-size:0.875rem;margin-bottom:1rem;color:#8b949e}
.box-price{font-size:1.25rem;font-weight:700;margin-bottom:1rem;color:#58a6ff}
.open-box-btn{width:100%;padding:0.5rem 1rem;border-radius:0.375rem;font-weight:600;color:white;transition:all 0.2s;background:linear-gradient(#28353e,#28353e) padding-box,linear-gradient(to right,#e93590,#fa8d64) border-box;border:2px solid transparent}
.open-box-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}

/* Inventory */
.inventory-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;padding:1rem 0}
.inventory-item{background:#1e2328;border:1px solid #2a2d33;border-radius:0.5rem;overflow:hidden;transition:all 0.2s ease;cursor:pointer}
.inventory-item:hover{transform:translateY(-2px);border-color:#3d4147;box-shadow:0 4px 12px rgba(0,0,0,0.3)}
.inventory-image{position:relative;height:8rem;overflow:hidden}
.inventory-item img{width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease}
.inventory-item:hover img{transform:scale(1.05)}
.inventory-content{padding:0.75rem}
.inventory-title{font-size:0.875rem;font-weight:600;margin-bottom:0.5rem;color:#e6edf3}
.inventory-value{font-size:1.125rem;font-weight:700;color:#58a6ff}

/* Battles */
.battles-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem}
.battles-title{font-size:1.25rem;font-weight:600;margin:0;color:#e6edf3}
.battles-subtitle{font-size:0.875rem;margin:0.25rem 0 0 0;color:#8b949e}
.create-battle-btn{padding:0.5rem 1rem;border-radius:0.375rem;font-weight:600;color:white;transition:all 0.2s;background:linear-gradient(#28353e,#28353e) padding-box,linear-gradient(to right,#e93590,#fa8d64) border-box;border:2px solid transparent}
.create-battle-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
.create-battle-form{background:#1e2328;border:1px solid #2a2d33;border-radius:0.5rem;padding:1.25rem;margin-bottom:1.25rem;display:none}
.create-battle-form.active{display:block}
.form-title{font-size:1.125rem;font-weight:600;margin:0 0 1rem 0;color:#e6edf3}
.form-group{margin-bottom:1rem}
.form-label{display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.5rem;color:#e6edf3}
.form-input,.form-select{width:100%;padding:0.5rem 0.75rem;border-radius:0.25rem;border:1px solid #2a2d33;background:#0d1117;color:#e6edf3;font-size:0.875rem}
.form-input:focus,.form-select:focus{outline:none;border-color:#58a6ff}
.form-select option{background:#0d1117;color:#e6edf3}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.form-actions{display:flex;gap:0.75rem;justify-content:flex-end}
.cancel-btn{padding:0.5rem 1rem;border-radius:0.375rem;font-weight:600;color:white;background:#6e7681;border:none}
.submit-btn{padding:0.5rem 1rem;border-radius:0.375rem;font-weight:600;color:white;background:linear-gradient(#28353e,#28353e) padding-box,linear-gradient(to right,#e93590,#fa8d64) border-box;border:2px solid transparent}
.battles-list{display:flex;flex-direction:column;gap:1rem}
.battle-card{background:#1e2328;border:1px solid #2a2d33;border-radius:0.5rem;padding:1rem}
.battle-title{font-size:1.125rem;font-weight:600;margin-bottom:0.75rem;color:#e6edf3}
.battle-participants{display:flex;align-items:center;justify-content:center;gap:1rem;margin-bottom:1rem}
.participant{text-align:center;color:#e6edf3}
.vs-divider{font-size:0.875rem;font-weight:700;padding:0.25rem 0.75rem;border-radius:0.25rem;background:#58a6ff;color:white}
.battle-info{text-align:center;margin-bottom:1rem;color:#8b949e}
.join-battle-btn{width:100%;padding:0.5rem 1rem;border-radius:0.375rem;font-weight:600;color:white;transition:all 0.2s;background:linear-gradient(#28353e,#28353e) padding-box,linear-gradient(to right,#e93590,#fa8d64) border-box;border:2px solid transparent}
.join-battle-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
.battle-in-progress{text-align:center;font-weight:600;color:#f85149}

/* Tables & Lists */
.leaderboard-table{width:100%;border-collapse:collapse;background:#1e2328;border-radius:0.5rem;overflow:hidden}
.leaderboard-table th,.leaderboard-table td{padding:1rem;text-align:left;border-bottom:1px solid #2a2d33}
.leaderboard-table th{font-weight:600;background:rgba(255,255,255,0.1);color:#e6edf3}
.leaderboard-table td{color:#e6edf3}
.history-item{background:#1e2328;border-radius:0.5rem;padding:1rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem}
.history-item img{width:3.75rem;height:3.75rem;object-fit:cover;border-radius:0.5rem}
.history-details{flex:1}
.history-details h4{color:#e6edf3}
.history-amount{font-weight:600;color:#58a6ff}
.history-date{font-size:0.875rem;color:#8b949e}

/* States */
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 0}
.spinner{width:2rem;height:2rem;border:4px solid #374151;border-top-color:#58a6ff;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-state{text-align:center;padding:4rem 1.25rem;color:#8b949e}
.empty-state h3{font-size:1.125rem;font-weight:600;margin-bottom:0.5rem}
.notification{position:fixed;top:1rem;right:1rem;padding:1rem 1.5rem;border-radius:0.5rem;font-weight:500;color:white;z-index:50}
.notification.success{background:#238636}
.notification.error{background:#f85149}
    `.trim();
    
    res.send(widgetCSS);
  });

  // Widget iframe endpoint with full payment integration
  app.get('/widget/iframe', async (req, res) => {
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('X-XSS-Protection');
    res.removeHeader('Referrer-Policy');
    res.removeHeader('Permissions-Policy');
    
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *; default-src * data: blob: \'unsafe-inline\' \'unsafe-eval\'; script-src * \'unsafe-inline\' \'unsafe-eval\'; style-src * \'unsafe-inline\';');
    
    const { partner } = req.query;
    
    // Create the iframe HTML without template literals in JavaScript
    let iframeHTML = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
    iframeHTML += '    <meta charset="UTF-8">\n';
    iframeHTML += '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    iframeHTML += '    <meta name="color-scheme" content="dark">\n';
    iframeHTML += '    <title>Mystery Boxes Widget - ' + (partner || 'default') + '</title>\n';
    iframeHTML += '    <meta http-equiv="Content-Security-Policy" content="frame-ancestors *;">\n';
    iframeHTML += '    <link rel="stylesheet" href="/widget/styles.css">\n';
    iframeHTML += '    <style>body { padding: 16px !important; margin: 0 !important; }</style>\n';
    iframeHTML += '</head>\n<body>\n';
    iframeHTML += '    <div class="widget-container">\n';
    iframeHTML += '        <nav class="tab-nav">\n';
    iframeHTML += '            <button class="tab-button active" onclick="showTab(\'boxes\')">Mystery Boxes</button>\n';
    iframeHTML += '            <button class="tab-button" onclick="showTab(\'inventory\')">Inventory</button>\n';
    iframeHTML += '            <button class="tab-button" onclick="showTab(\'battles\')">Battles</button>\n';
    iframeHTML += '            <button class="tab-button" onclick="showTab(\'leaderboard\')">Leaderboard</button>\n';
    iframeHTML += '            <button class="tab-button" onclick="showTab(\'history\')">History</button>\n';
    iframeHTML += '        </nav>\n';
    iframeHTML += '        <div id="boxes-tab" class="tab-content active">\n';
    iframeHTML += '            <div id="boxes-grid" class="boxes-grid">\n';
    iframeHTML += '                <div class="loading"><div class="spinner"></div><p>Loading mystery boxes...</p></div>\n';
    iframeHTML += '            </div>\n';
    iframeHTML += '        </div>\n';
    iframeHTML += '        <div id="inventory-tab" class="tab-content">\n';
    iframeHTML += '            <div id="inventory-grid" class="inventory-grid">\n';
    iframeHTML += '                <div class="loading"><div class="spinner"></div><p>Loading inventory...</p></div>\n';
    iframeHTML += '            </div>\n';
    iframeHTML += '        </div>\n';
    iframeHTML += '        <div id="battles-tab" class="tab-content">\n';
    iframeHTML += '            <div class="battles-header">\n';
    iframeHTML += '                <div><h2 class="battles-title">Case Battles</h2><p class="battles-subtitle">Compete with other players in real-time</p></div>\n';
    iframeHTML += '                <button class="create-battle-btn" onclick="toggleCreateBattle()">Create Battle</button>\n';
    iframeHTML += '            </div>\n';
    iframeHTML += '            <div id="create-battle-form" class="create-battle-form">\n';
    iframeHTML += '                <h3 class="form-title">Create New Battle</h3>\n';
    iframeHTML += '                <form id="battle-form">\n';
    iframeHTML += '                    <div class="form-group"><label class="form-label">Battle Name</label><input type="text" class="form-input" id="battle-name" placeholder="Enter battle name" required></div>\n';
    iframeHTML += '                    <div class="form-grid">\n';
    iframeHTML += '                        <div class="form-group"><label class="form-label">Max Players</label><select class="form-select" id="max-players" required><option value="2">2 Players</option><option value="3">3 Players</option><option value="4">4 Players</option></select></div>\n';
    iframeHTML += '                        <div class="form-group"><label class="form-label">Entry Fee</label><input type="number" class="form-input" id="entry-fee" placeholder="0.00" step="0.01" min="0" required></div>\n';
    iframeHTML += '                    </div>\n';
    iframeHTML += '                    <div class="form-group"><label class="form-label">Mystery Box</label><select class="form-select" id="battle-box" required><option value="">Select a mystery box...</option></select></div>\n';
    iframeHTML += '                    <div class="form-actions"><button type="button" class="cancel-btn" onclick="toggleCreateBattle()">Cancel</button><button type="submit" class="submit-btn">Create Battle</button></div>\n';
    iframeHTML += '                </form>\n';
    iframeHTML += '            </div>\n';
    iframeHTML += '            <div id="battles-list" class="battles-list">\n';
    iframeHTML += '                <div class="loading"><div class="spinner"></div><p>Loading battles...</p></div>\n';
    iframeHTML += '            </div>\n';
    iframeHTML += '        </div>\n';
    iframeHTML += '        <div id="leaderboard-tab" class="tab-content">\n';
    iframeHTML += '            <table class="leaderboard-table">\n';
    iframeHTML += '                <thead><tr><th>Rank</th><th>Player</th><th>Boxes Opened</th><th>Total Spent</th><th>Rare Items</th></tr></thead>\n';
    iframeHTML += '                <tbody id="leaderboard-body"><tr><td colspan="5"><div class="loading"><div class="spinner"></div><p>Loading leaderboard...</p></div></td></tr></tbody>\n';
    iframeHTML += '            </table>\n';
    iframeHTML += '        </div>\n';
    iframeHTML += '        <div id="history-tab" class="tab-content">\n';
    iframeHTML += '            <div id="history-list"><div class="loading"><div class="spinner"></div><p>Loading history...</p></div></div>\n';
    iframeHTML += '        </div>\n';
    iframeHTML += '    </div>\n';
    
    // Add JavaScript without template literal conflicts
    iframeHTML += '    <script>\n';
    iframeHTML += '        function showTab(tabName) {\n';
    iframeHTML += '            document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));\n';
    iframeHTML += '            document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));\n';
    iframeHTML += '            document.getElementById(tabName + "-tab").classList.add("active");\n';
    iframeHTML += '            event.target.classList.add("active");\n';
    iframeHTML += '        }\n';
    iframeHTML += '        function toggleCreateBattle() {\n';
    iframeHTML += '            const form = document.getElementById("create-battle-form");\n';
    iframeHTML += '            form.classList.toggle("active");\n';
    iframeHTML += '        }\n';
    iframeHTML += '        let widgetData = null;\n';
    iframeHTML += '        let currentPartner = "' + (partner || '') + '";\n';
    iframeHTML += '        async function loadWidgetData() {\n';
    iframeHTML += '            try {\n';
    iframeHTML += '                const response = await fetch("/api/widget/data?partner=" + currentPartner);\n';
    iframeHTML += '                widgetData = await response.json();\n';
    iframeHTML += '                renderBoxes(); renderBattles(); renderLeaderboard(); renderHistory(); populateBattleBoxes();\n';
    iframeHTML += '            } catch (error) { console.error("Failed to load widget data:", error); }\n';
    iframeHTML += '        }\n';
    iframeHTML += '        function renderBoxes() {\n';
    iframeHTML += '            const grid = document.getElementById("boxes-grid");\n';
    iframeHTML += '            if (!widgetData || !widgetData.boxes) {\n';
    iframeHTML += '                grid.innerHTML = "<div class=\\"empty-state\\"><h3>No boxes available</h3><p>Check back later for new mystery boxes</p></div>";\n';
    iframeHTML += '                return;\n';
    iframeHTML += '            }\n';
    iframeHTML += '            grid.innerHTML = widgetData.boxes.map(box => \n';
    iframeHTML += '                "<div class=\\"mystery-box-card\\" onclick=\\"openBox(" + box.id + ")\\">" +\n';
    iframeHTML += '                    "<div class=\\"box-image\\">" +\n';
    iframeHTML += '                        "<img src=\\"" + box.imageUrl + "\\" alt=\\"" + box.name + "\\" loading=\\"lazy\\">" +\n';
    iframeHTML += '                        "<div class=\\"box-rarity rarity-" + box.rarity.toLowerCase() + "\\">" + box.rarity + "</div>" +\n';
    iframeHTML += '                    "</div>" +\n';
    iframeHTML += '                    "<div class=\\"box-content\\">" +\n';
    iframeHTML += '                        "<h3 class=\\"box-title\\">" + box.name + "</h3>" +\n';
    iframeHTML += '                        "<p class=\\"box-description\\">" + box.description + "</p>" +\n';
    iframeHTML += '                        "<div class=\\"box-price\\">$" + box.price + "</div>" +\n';
    iframeHTML += '                        "<button class=\\"open-box-btn\\">Open Box</button>" +\n';
    iframeHTML += '                    "</div>" +\n';
    iframeHTML += '                "</div>"\n';
    iframeHTML += '            ).join("");\n';
    iframeHTML += '        }\n';
    iframeHTML += '        function renderBattles() { const list = document.getElementById("battles-list"); if (!widgetData || !widgetData.battles) { list.innerHTML = "<div class=\\"empty-state\\"><h3>No active battles</h3><p>Create a battle to get started</p></div>"; return; } }\n';
    iframeHTML += '        function renderLeaderboard() { const tbody = document.getElementById("leaderboard-body"); if (!widgetData || !widgetData.leaderboard) { tbody.innerHTML = "<tr><td colspan=\\"5\\"><div class=\\"empty-state\\"><h3>No leaderboard data</h3></div></td></tr>"; return; } }\n';
    iframeHTML += '        function renderHistory() { const list = document.getElementById("history-list"); if (!widgetData || !widgetData.recentOpenings) { list.innerHTML = "<div class=\\"empty-state\\"><h3>No recent activity</h3><p>Open some boxes to see your history</p></div>"; return; } }\n';
    iframeHTML += '        function populateBattleBoxes() { const select = document.getElementById("battle-box"); if (!widgetData || !widgetData.boxes) return; select.innerHTML = "<option value=\\"\\">Select a mystery box...</option>" + widgetData.boxes.map(box => "<option value=\\"" + box.id + "\\">" + box.name + " - $" + box.price + "</option>").join(""); }\n';
    iframeHTML += '        async function openBox(boxId) { try { const response = await fetch("/api/widget/open-box", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ boxId, partner: currentPartner }) }); const result = await response.json(); if (result.success) { alert("You won: " + result.item.name + "!"); loadWidgetData(); } else { alert(result.message || "Failed to open box"); } } catch (error) { alert("Failed to open box"); } }\n';
    iframeHTML += '        loadWidgetData();\n';
    iframeHTML += '        setInterval(loadWidgetData, 30000);\n';
    iframeHTML += '    </script>\n';
    iframeHTML += '</body>\n</html>';
    
    res.send(iframeHTML);
  });

  // Other widget endpoints
            font-size: 18px;
            font-weight: 700;
            color: #58a6ff;
            margin-bottom: 12px;
        }
        .rarity-common { background: rgba(108, 117, 125, 0.8); }
        .rarity-rare { background: rgba(54, 162, 235, 0.8); }
        .rarity-epic { background: rgba(139, 92, 246, 0.8); }
        .rarity-legendary { background: rgba(255, 193, 7, 0.8); }
        .rarity-mythical { background: rgba(220, 53, 69, 0.8); }
        .open-box-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(#28353e, #28353e) padding-box, linear-gradient(to right, #e93590, #fa8d64) border-box;
            border: 2px solid transparent;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 1rem;
        }
        .open-box-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }
        .open-box-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .loading {
            text-align: center;
            padding: 40px;
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid #4ecdc4;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Tab Navigation */
        .tab-navigation {
            display: flex;
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 0;
            margin-bottom: 24px;
            overflow-x: auto;
        }
        .tab-btn {
            flex: 1;
            padding: 8px 16px;
            background: transparent;
            border: none;
            color: #7d8590;
            cursor: pointer;
            font-weight: 500;
            font-size: 12px;
            transition: all 0.2s ease;
            white-space: nowrap;
            min-width: 100px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .tab-btn.active {
            background: linear-gradient(#28353e, #28353e) padding-box, linear-gradient(to right, #e93590, #fa8d64) border-box;
            border: 2px solid transparent;
            color: #ffffff;
            border-radius: 4px;
            margin: 2px;
        }
        .tab-btn:hover:not(.active) {
            background: #21262d;
            color: #e6edf3;
        }
        
        /* Tab Content */
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        
        /* Inventory Styles */
        .inventory-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
            padding: 16px 0;
        }
        .inventory-item {
            background: #1e2328;
            border: 1px solid #2a2d33;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .inventory-item:hover {
            transform: translateY(-2px);
            border-color: #3d4147;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .inventory-image {
            position: relative;
            height: 120px;
            overflow: hidden;
        }
        .inventory-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        .inventory-item:hover img {
            transform: scale(1.05);
        }
        .inventory-content {
            padding: 12px;
        }
        .inventory-item h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            line-height: 1.2;
        }
        .inventory-value {
            color: #58a6ff;
            font-weight: 700;
            font-size: 16px;
        }
        
        /* Leaderboard Styles */
        .leaderboard-table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        .leaderboard-table th,
        .leaderboard-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .leaderboard-table th {
            background: rgba(255, 255, 255, 0.2);
            font-weight: 600;
        }
        .rank-badge {
            display: inline-block;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            text-align: center;
            line-height: 30px;
            font-weight: bold;
        }
        
        /* Battle Styles */
        .battle-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .battle-participants {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0;
        }
        .participant {
            text-align: center;
            flex: 1;
        }
        .vs-divider {
            margin: 0 20px;
            font-size: 1.5rem;
            font-weight: bold;
            color: #ff6b6b;
        }
        .join-battle-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(#28353e, #28353e) padding-box, linear-gradient(to right, #e93590, #fa8d64) border-box;
            border: 2px solid transparent;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .join-battle-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }
        
        /* Create Battle Styles */
        .battles-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .create-battle-btn {
            background: linear-gradient(#28353e, #28353e) padding-box, linear-gradient(to right, #e93590, #fa8d64) border-box;
            border: 2px solid transparent;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        .create-battle-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }
        .create-battle-form {
            background: #1e2328;
            border: 1px solid #2a2d33;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            display: none;
        }
        .create-battle-form.active {
            display: block;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #ffffff;
        }
        .form-input {
            width: 100%;
            padding: 8px 12px;
            background: #0d1117;
            border: 1px solid #2a2d33;
            border-radius: 4px;
            color: #e6edf3;
            font-size: 14px;
        }
        .form-input:focus {
            outline: none;
            border-color: #58a6ff;
        }
        .form-select {
            width: 100%;
            padding: 8px 12px;
            background: #0d1117;
            border: 1px solid #2a2d33;
            border-radius: 4px;
            color: #e6edf3;
            font-size: 14px;
        }
        .form-select option {
            background: #0d1117;
            color: #e6edf3;
            padding: 8px 12px;
        }
        .form-select:focus {
            outline: none;
            border-color: #58a6ff;
        }
        .form-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .cancel-btn {
            background: #6e7681;
            color: #ffffff;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
        }
        .submit-btn {
            background: linear-gradient(#28353e, #28353e) padding-box, linear-gradient(to right, #e93590, #fa8d64) border-box;
            border: 2px solid transparent;
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
        }
        
        /* Purchase History Styles */
        .history-item {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .history-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
        }
        .history-details {
            flex: 1;
        }
        .history-amount {
            color: #4ecdc4;
            font-weight: 600;
        }
        .history-date {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: rgba(255, 255, 255, 0.6);
        }
        .empty-state h3 {
            margin-bottom: 10px;
            color: rgba(255, 255, 255, 0.8);
        }
    </style>
</head>
<body>
    <div class="widget-container">

        
        <!-- Tab Navigation -->
        <div class="tab-navigation">
            <button class="tab-btn active" onclick="switchTab('boxes')">Mystery Boxes</button>
            <button class="tab-btn" onclick="switchTab('inventory')">My Inventory</button>
            <button class="tab-btn" onclick="switchTab('battles')">Live Battles</button>
            <button class="tab-btn" onclick="switchTab('leaderboard')">Leaderboard</button>
            <button class="tab-btn" onclick="switchTab('history')">Purchase History</button>
        </div>
        
        <div class="loading" id="loadingState">
            <div class="spinner"></div>
            <div>Loading content...</div>
        </div>
        
        <!-- Mystery Boxes Tab -->
        <div class="tab-content active" id="boxes-tab">
            <div class="boxes-grid" id="boxesContainer"></div>
        </div>
        
        <!-- Inventory Tab -->
        <div class="tab-content" id="inventory-tab">
            <div class="inventory-grid" id="inventoryContainer"></div>
        </div>
        
        <!-- Battles Tab -->
        <div class="tab-content" id="battles-tab">
            <div id="battlesContainer"></div>
        </div>
        
        <!-- Leaderboard Tab -->
        <div class="tab-content" id="leaderboard-tab">
            <table class="leaderboard-table" id="leaderboardContainer">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Cases Opened</th>
                        <th>Total Spent</th>
                        <th>Rare Items</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        
        <!-- Purchase History Tab -->
        <div class="tab-content" id="history-tab">
            <div id="historyContainer"></div>
        </div>
    </div>
    
    <script>
        // Force dark background immediately and continuously
        function applyDarkTheme() {
            document.documentElement.style.background = '#0d1117';
            document.documentElement.style.backgroundColor = '#0d1117';
            document.body.style.background = '#0d1117';
            document.body.style.backgroundColor = '#0d1117';
            document.body.style.color = '#e6edf3';
        }
        
        applyDarkTheme();
        
        // Apply dark theme when DOM is ready
        document.addEventListener('DOMContentLoaded', applyDarkTheme);
        
        // Continuously enforce dark theme (in case parent tries to override)
        setInterval(applyDarkTheme, 100);
        
        let widgetData = null;
        
        async function loadBoxes() {
            try {
                const response = await fetch('/api/widget/data?partner=${partner || 'default'}');
                const data = await response.json();
                widgetData = data;
                renderBoxes();
            } catch (error) {
                console.error('Failed to load boxes:', error);
                document.getElementById('loadingState').innerHTML = '<div style="color: #ff6b6b;">Failed to load boxes</div>';
            }
        }
        
        function renderBoxes() {
            const container = document.getElementById('boxesContainer');
            const loading = document.getElementById('loadingState');
            
            if (!widgetData || !widgetData.boxes) return;
            
            const boxesHTML = widgetData.boxes.map(box => {
                return '<div class="mystery-box-card">' +
                    '<div class="box-image">' +
                        '<img src="' + box.imageUrl + '" alt="' + box.name + '" onerror="this.src=\\'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400\\'">' +
                        '<div class="box-rarity rarity-' + box.rarity + '">' + box.rarity.toUpperCase() + '</div>' +
                    '</div>' +
                    '<div class="box-content">' +
                        '<div class="box-info">' +
                            '<h3>' + box.name + '</h3>' +
                            '<p class="box-description">' + box.description + '</p>' +
                        '</div>' +
                        '<div class="box-price">$' + box.price + '</div>' +
                        '<button class="open-box-btn" onclick="purchaseBox(' + box.id + ', \\'' + box.name + '\\', ' + box.price + ')">' +
                            'Open Box - $' + box.price +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join('');
            
            container.innerHTML = boxesHTML;
            loading.style.display = 'none';
            container.style.display = 'grid';
        }
        
        function purchaseBox(boxId, boxName, price) {
            console.log('Purchase initiated:', { boxId, boxName, price });
            
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
                
                const button = event.target;
                button.textContent = 'Processing...';
                button.disabled = true;
                
                setTimeout(() => {
                    button.textContent = 'Open Box - $' + price;
                    button.disabled = false;
                }, 10000);
            }
        }
        
        window.addEventListener('message', function(event) {
            if (event.data.type === 'payment_completed') {
                console.log('Payment completed:', event.data);
                showNotification('Payment successful! Box opened!', 'success');
                
                const buttons = document.querySelectorAll('.open-box-btn');
                buttons.forEach(btn => {
                    btn.disabled = false;
                    btn.textContent = btn.textContent.replace('Processing...', 'Open Box');
                });
            } else if (event.data.type === 'payment_failed') {
                console.log('Payment failed:', event.data);
                showNotification('Payment failed. Please try again.', 'error');
                
                const buttons = document.querySelectorAll('.open-box-btn');
                buttons.forEach(btn => {
                    btn.disabled = false;
                    btn.textContent = btn.textContent.replace('Processing...', 'Open Box');
                });
            }
        });
        
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.style.cssText = 
                'position: fixed; top: 20px; right: 20px; padding: 15px 20px; ' +
                'border-radius: 8px; color: white; font-weight: 600; z-index: 10000; ' +
                'background: ' + (type === 'success' ? '#4caf50' : '#f44336') + '; ' +
                'box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
            
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        }
        
        // Tab switching functionality
        function switchTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(tabName + '-tab').classList.add('active');
            
            // Load content for the selected tab
            switch(tabName) {
                case 'inventory':
                    loadInventory();
                    break;
                case 'battles':
                    loadBattles();
                    break;
                case 'leaderboard':
                    loadLeaderboard();
                    break;
                case 'history':
                    loadPurchaseHistory();
                    break;
            }
        }
        
        // Load user inventory
        async function loadInventory() {
            const container = document.getElementById('inventoryContainer');
            container.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading inventory...</div></div>';
            
            try {
                // For demo purposes, show sample inventory items
                const sampleItems = [
                    { name: 'Cosmic Guardian Armor', rarity: 'mythical', imageUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200', value: '22.09' },
                    { name: 'RGB Gaming Keyboard', rarity: 'epic', imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200', value: '18.44' }
                ];
                
                const inventoryHTML = sampleItems.map(item => 
                    '<div class="inventory-item">' +
                        '<div class="inventory-image">' +
                            '<img src="' + item.imageUrl + '" alt="' + item.name + '">' +
                            '<div class="box-rarity rarity-' + item.rarity + '">' + item.rarity.toUpperCase() + '</div>' +
                        '</div>' +
                        '<div class="inventory-content">' +
                            '<h4>' + item.name + '</h4>' +
                            '<div class="inventory-value">$' + item.value + '</div>' +
                        '</div>' +
                    '</div>'
                ).join('');
                
                container.innerHTML = inventoryHTML || '<div class="empty-state"><h3>Your Inventory</h3><p>Complete purchases to build your inventory of rare items.</p></div>';
            } catch (error) {
                container.innerHTML = '<div class="empty-state"><h3>Failed to load inventory</h3></div>';
            }
        }
        
        // Load live battles
        async function loadBattles() {
            const container = document.getElementById('battlesContainer');
            container.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading battles...</div></div>';
            
            try {
                const battles = [
                    {
                        id: 1,
                        name: 'Celestial Guardian Showdown',
                        participants: ['CryptoKing', 'LuckyStrike'],
                        boxPrice: 22.09,
                        maxPlayers: 4,
                        currentPlayers: 2,
                        status: 'waiting'
                    },
                    {
                        id: 2,
                        name: 'Epic Gaming Battle',
                        participants: ['BoxMaster', 'ProGamer'],
                        boxPrice: 29.89,
                        maxPlayers: 2,
                        currentPlayers: 2,
                        status: 'in_progress'
                    }
                ];
                
                const battlesHTML = 
                    '<div class="battles-header">' +
                        '<div>' +
                            '<h3 style="margin: 0; color: #ffffff;">Live Battles</h3>' +
                            '<p style="margin: 5px 0 0 0; color: #8b949e; font-size: 14px;">Join existing battles or create your own</p>' +
                        '</div>' +
                        '<button class="create-battle-btn" onclick="toggleCreateBattleForm()">+ Create Battle</button>' +
                    '</div>' +
                    
                    '<div id="createBattleForm" class="create-battle-form">' +
                        '<h4 style="margin: 0 0 15px 0; color: #ffffff;">Create New Battle</h4>' +
                        '<form id="battleForm" onsubmit="submitCreateBattle(event)">' +
                            '<div class="form-group">' +
                                '<label for="battleName">Battle Name</label>' +
                                '<input type="text" id="battleName" name="battleName" class="form-input" placeholder="Epic Cosmic Battle" required>' +
                            '</div>' +
                            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">' +
                                '<div class="form-group">' +
                                    '<label for="maxPlayers">Max Players</label>' +
                                    '<select id="maxPlayers" name="maxPlayers" class="form-select" required>' +
                                        '<option value="2">2 Players</option>' +
                                        '<option value="4">4 Players</option>' +
                                        '<option value="6">6 Players</option>' +
                                        '<option value="8">8 Players</option>' +
                                    '</select>' +
                                '</div>' +
                                '<div class="form-group">' +
                                    '<label for="entryFee">Entry Fee ($)</label>' +
                                    '<input type="number" id="entryFee" name="entryFee" class="form-input" step="0.01" min="1" max="100" value="5.00" required>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="mysteryBox">Mystery Box</label>' +
                                '<select id="mysteryBox" name="mysteryBox" class="form-select" required>' +
                                    '<option value="1">Celestial Guardian - $22.09</option>' +
                                    '<option value="2">Gaming Peripherals - $18.44</option>' +
                                    '<option value="3">Luxury Accessories - $29.89</option>' +
                                '</select>' +
                            '</div>' +
                            '<div class="form-actions">' +
                                '<button type="button" class="cancel-btn" onclick="toggleCreateBattleForm()">Cancel</button>' +
                                '<button type="submit" class="submit-btn">Create Battle</button>' +
                            '</div>' +
                        '</form>' +
                    '</div>' +
                    
                    '<div class="battles-list">' +
                        battles.map(battle => 
                            '<div class="battle-card">' +
                                '<h3>' + battle.name + '</h3>' +
                                '<div class="battle-participants">' +
                                    '<div class="participant"><strong>' + (battle.participants[0] || 'Waiting...') + '</strong></div>' +
                                    '<div class="vs-divider">VS</div>' +
                                    '<div class="participant"><strong>' + (battle.participants[1] || 'Waiting...') + '</strong></div>' +
                                '</div>' +
                                '<div style="text-align: center; margin: 15px 0;">' +
                                    '<div>Entry Fee: $' + battle.boxPrice + '</div>' +
                                    '<div>Players: ' + battle.currentPlayers + '/' + battle.maxPlayers + '</div>' +
                                '</div>' +
                                (battle.status === 'waiting' ? 
                                    '<button class="join-battle-btn" onclick="joinBattle(' + battle.id + ')">Join Battle</button>' :
                                    '<div style="text-align: center; color: #ff6b6b; font-weight: 600;">Battle In Progress</div>'
                                ) +
                            '</div>'
                        ).join('') +
                    '</div>';
                
                container.innerHTML = battlesHTML;
            } catch (error) {
                container.innerHTML = '<div class="empty-state"><h3>Failed to load battles</h3></div>';
            }
        }
        
        // Load leaderboard
        async function loadLeaderboard() {
            const tbody = document.querySelector('#leaderboardContainer tbody');
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="spinner" style="margin: 20px auto;"></div></td></tr>';
            
            try {
                if (widgetData && widgetData.leaderboard) {
                    const leaderboardHTML = widgetData.leaderboard.map((player, index) => 
                        '<tr>' +
                            '<td><span class="rank-badge">' + (index + 1) + '</span></td>' +
                            '<td>' + player.username + '</td>' +
                            '<td>' + player.casesOpened + '</td>' +
                            '<td>$' + player.totalSpent.toLocaleString() + '</td>' +
                            '<td>' + player.rareItems + '</td>' +
                        '</tr>'
                    ).join('');
                    
                    tbody.innerHTML = leaderboardHTML;
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No leaderboard data available</td></tr>';
                }
            } catch (error) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Failed to load leaderboard</td></tr>';
            }
        }
        
        // Load purchase history
        async function loadPurchaseHistory() {
            const container = document.getElementById('historyContainer');
            container.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading purchase history...</div></div>';
            
            try {
                const sampleHistory = [
                    {
                        boxName: 'Celestial Guardian',
                        itemWon: 'Cosmic Guardian Armor',
                        amount: '22.09',
                        date: '2 hours ago',
                        imageUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200'
                    },
                    {
                        boxName: 'Higround Gaming',
                        itemWon: 'RGB Gaming Keyboard',
                        amount: '18.44',
                        date: '1 day ago',
                        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200'
                    }
                ];
                
                const historyHTML = sampleHistory.map(item => 
                    '<div class="history-item">' +
                        '<img src="' + item.imageUrl + '" alt="' + item.itemWon + '">' +
                        '<div class="history-details">' +
                            '<h4>' + item.itemWon + '</h4>' +
                            '<div>From: ' + item.boxName + '</div>' +
                            '<div class="history-date">' + item.date + '</div>' +
                        '</div>' +
                        '<div class="history-amount">$' + item.amount + '</div>' +
                    '</div>'
                ).join('');
                
                container.innerHTML = historyHTML || '<div class="empty-state"><h3>Purchase History</h3><p>Your mystery box purchase history will appear here.</p></div>';
            } catch (error) {
                container.innerHTML = '<div class="empty-state"><h3>Failed to load purchase history</h3></div>';
            }
        }
        
        // Join battle functionality
        function joinBattle(battleId) {
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'join_battle_request',
                    data: {
                        battleId: battleId,
                        partner: '${partner || 'default'}',
                        timestamp: Date.now()
                    }
                }, '*');
            }
            
            showNotification('Battle join request sent!', 'success');
        }
        
        // Toggle create battle form
        function toggleCreateBattleForm() {
            const form = document.getElementById('createBattleForm');
            if (form.classList.contains('active')) {
                form.classList.remove('active');
            } else {
                form.classList.add('active');
                // Clear form
                document.getElementById('battleForm').reset();
                document.getElementById('entryFee').value = '5.00';
            }
        }
        
        // Submit create battle form
        function submitCreateBattle(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const battleData = {
                name: formData.get('battleName'),
                maxPlayers: parseInt(formData.get('maxPlayers')),
                entryFee: parseFloat(formData.get('entryFee')),
                mysteryBoxId: parseInt(formData.get('mysteryBox')),
                partner: '${partner || 'default'}',
                timestamp: Date.now()
            };
            
            // Send create battle request to parent
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'create_battle_request',
                    data: battleData
                }, '*');
            }
            
            // Hide form and show success message
            toggleCreateBattleForm();
            showNotification('Battle creation request sent!', 'success');
            
            // Refresh battles list after short delay
            setTimeout(() => {
                loadBattles();
            }, 1000);
        }
        
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'rollingdrop_widget_loaded',
                partner: '${partner || 'default'}',
                status: 'success',
                timestamp: Date.now()
            }, '*');
        }
        
        // Initialize widget
        loadBoxes();
        
        // Load initial leaderboard data
        setTimeout(() => {
            loadLeaderboard();
        }, 1000);
    </script>
</body>
</html>`;
    
    res.send(iframeHTML);
  });

  // Widget data API
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

  // Partner purchase webhook
  app.post('/api/partner/purchase', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    try {
      const { partner, userId, boxId, transactionId, amount, paymentMethod, timestamp } = req.body;
      
      if (!partner || !userId || !boxId || !transactionId || !amount) {
        return res.status(400).json({ error: 'Missing required purchase data' });
      }
      
      const boxes = await storage.getAllBoxes();
      const box = boxes.find(b => b.id === parseInt(boxId));
      
      if (!box) {
        return res.status(404).json({ error: 'Box not found' });
      }
      
      // Generate a numeric user ID for storage compatibility
      const numericUserId = parseInt(userId.replace(/[^0-9]/g, '')) || Math.floor(Math.random() * 1000000);
      
      // Simulate box opening
      const boxResult = await storage.openBox(parseInt(boxId), numericUserId);
      const wonItem = boxResult.item;
      
      // Record purchase
      const purchaseRecord = {
        id: crypto.randomUUID(),
        partner: partner,
        userId: userId, // Keep original string ID for partner tracking
        numericUserId: numericUserId, // Add numeric ID for database
        boxId: parseInt(boxId),
        boxName: box.name,
        transactionId: transactionId,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'unknown',
        timestamp: timestamp || new Date().toISOString(),
        item: wonItem,
        status: 'completed'
      };
      
      // Store in database with proper partner association
      await storage.recordPartnerPurchase(purchaseRecord);
      await storage.addItemToUserInventory(userId, wonItem, partner);
      
      res.json({
        success: true,
        purchaseId: purchaseRecord.id,
        item: wonItem,
        boxOpened: {
          boxId: parseInt(boxId),
          boxName: box.name,
          itemValue: parseFloat(wonItem.value || '0')
        }
      });
      
    } catch (error) {
      console.error('Purchase webhook error:', error);
      res.status(500).json({ error: 'Failed to process purchase' });
    }
  });

  // User inventory API
  app.get('/api/partner/inventory/:userId', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    try {
      const { userId } = req.params;
      const { partner } = req.query;
      
      const inventory = await storage.getUserInventory(userId, partner as string);
      
      res.json({
        userId: userId,
        partner: partner,
        items: inventory || [],
        totalValue: inventory?.reduce((sum: number, item: any) => sum + parseFloat(item.value || '0'), 0) || 0
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  });

  // Get segmented user analytics for partners/whitelabels
  app.get('/api/analytics/users/segmented', async (req, res) => {
    try {
      const { partner, whitelabel, timeframe = '30d' } = req.query;
      
      if (!partner && !whitelabel) {
        return res.status(400).json({ error: 'Partner or whitelabel parameter required' });
      }

      const integrationId = partner || whitelabel;
      const integrationType = partner ? 'partner' : 'whitelabel';
      
      const transactions = await storage.getTransactionsByIntegration(
        integrationId as string, 
        integrationType
      );
      
      // Calculate user segments and analytics
      const uniqueUsers = new Set();
      let totalRevenue = 0;
      let totalTransactions = 0;
      
      transactions.forEach(tx => {
        uniqueUsers.add(tx.userId);
        totalRevenue += parseFloat(tx.amount || '0');
        totalTransactions++;
      });
      
      res.json({
        integrationId,
        integrationType,
        analytics: {
          uniqueUsers: uniqueUsers.size,
          totalRevenue: totalRevenue.toFixed(2),
          totalTransactions,
          averageTransactionValue: (totalRevenue / totalTransactions || 0).toFixed(2),
          timeframe
        },
        userSegmentation: {
          type: integrationType,
          id: integrationId,
          description: integrationType === 'partner' 
            ? `B2B Partner Integration: ${integrationId}`
            : `Whitelabel Site: ${integrationId}`
        }
      });
    } catch (error) {
      console.error('User segmentation analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
  });

  // Marketplace listing
  app.post('/api/partner/marketplace/list', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    try {
      const { userId, itemId, price, partner } = req.body;
      
      const userInventory = await storage.getUserInventory(userId, partner);
      const item = userInventory?.find((inv: any) => inv.itemId === itemId);
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found in user inventory' });
      }
      
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
      const listings = await storage.getMarketplaceListings(partner as string);
      
      res.json({
        partner: partner,
        listings: listings || []
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch marketplace' });
    }
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