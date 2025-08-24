import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Multi-tenant Partners table
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  apiKey: text("api_key").notNull().unique(),
  apiSecret: text("api_secret").notNull(),
  status: text("status").notNull().default("active"), // active, suspended, inactive
  type: text("type").notNull().default("widget"), // widget, api_integration, whitelabel, hybrid
  domain: text("domain"), // custom domain for whitelabels
  subdomain: text("subdomain"), // subdomain.platform.com
  brandingConfig: text("branding_config"), // JSON config for colors, logos, etc
  widgetEnabled: boolean("widget_enabled").notNull().default(true),
  widgetConfig: text("widget_config").default("{}"), // JSON config for widget settings
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull().default("0.1000"), // 10%
  revenueShare: decimal("revenue_share", { precision: 5, scale: 4 }).notNull().default("0.0000"), // 0%
  maxApiCalls: integer("max_api_calls").default(10000), // per month
  webhookUrl: text("webhook_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner box assignments - which boxes are available to which partners
export const partnerBoxes = pgTable("partner_boxes", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  boxId: integer("box_id").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }), // override default price
  createdAt: timestamp("created_at").defaultNow(),
});

// API usage tracking
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  responseTime: integer("response_time"), // in milliseconds
  statusCode: integer("status_code").notNull(),
  ipAddress: text("ip_address"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  partnerId: integer("partner_id"), // null for main platform users
  usdBalance: decimal("usd_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  goldCoins: integer("gold_coins").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  availableRewards: decimal("available_rewards", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const boxes = pgTable("boxes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  rarity: text("rarity").notNull(), // "common", "rare", "epic", "legendary", "mythical"
  imageUrl: text("image_url").notNull(),
  backgroundUrl: text("background_url"),
  featured: boolean("featured").notNull().default(false),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity").notNull(), // "common", "rare", "epic", "legendary", "mythical"
  icon: text("icon").notNull(), // FontAwesome icon class
  dropChance: integer("drop_chance").notNull(), // percentage out of 10000 (for precise decimals)
  boxId: integer("box_id").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).default("0.00"), // Item value
});

export const userItems = pgTable("user_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  obtainedAt: timestamp("obtained_at").notNull().defaultNow(),
});

export const boxOpenings = pgTable("box_openings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  boxId: integer("box_id").notNull(),
  itemId: integer("item_id").notNull(),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
});

// Whitelabel sites table for complete frontend spawning
export const whitelabelSites = pgTable("whitelabel_sites", {
  id: serial("id").primaryKey(),
  whitelabelId: varchar("whitelabel_id").unique().notNull(), // Unique identifier for each whitelabel
  partnerId: integer("partner_id").references(() => partners.id),
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(), // User-facing brand name
  slug: varchar("slug").unique().notNull(),
  primaryDomain: varchar("primary_domain"), // Main custom domain
  subdomain: varchar("subdomain"), // subdomain.platform.com
  status: varchar("status").default("pending"), // pending, provisioning, active, suspended, maintenance
  deploymentStatus: varchar("deployment_status").default("not_deployed"), // not_deployed, deploying, deployed, failed
  
  // Complete Branding Control
  brandingConfig: jsonb("branding_config").default(`{
    "logo": {
      "primaryUrl": "",
      "secondaryUrl": "",
      "faviconUrl": "",
      "width": 200,
      "height": 60
    },
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#64748b",
      "accent": "#f59e0b",
      "background": "#ffffff",
      "surface": "#f8fafc",
      "text": "#1e293b",
      "textSecondary": "#64748b",
      "border": "#e2e8f0",
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif",
      "headingFont": "Inter, sans-serif",
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem"
      }
    },
    "layout": {
      "headerHeight": "64px",
      "sidebarWidth": "256px",
      "borderRadius": "0.5rem",
      "spacing": "1rem"
    }
  }`),
  
  // Content Management
  contentConfig: jsonb("content_config").default(`{
    "site": {
      "title": "Mystery Box Platform",
      "tagline": "Discover Amazing Rewards",
      "description": "Open mystery boxes and discover amazing rewards"
    },
    "navigation": {
      "homeLabel": "Home",
      "boxesLabel": "Mystery Boxes",
      "inventoryLabel": "Inventory",
      "leaderboardLabel": "Leaderboard"
    },
    "footer": {
      "companyName": "Mystery Box Platform",
      "copyright": "All rights reserved",
      "links": []
    },
    "customTexts": {}
  }`),
  
  // SEO and Social Media
  seoConfig: jsonb("seo_config").default(`{
    "meta": {
      "title": "Mystery Box Platform - Discover Amazing Rewards",
      "description": "Open mystery boxes and discover amazing rewards, collectibles, and prizes",
      "keywords": "mystery boxes, rewards, collectibles, gaming, prizes",
      "author": "Mystery Box Platform"
    },
    "openGraph": {
      "title": "Mystery Box Platform",
      "description": "Discover amazing rewards in our mystery boxes",
      "image": "",
      "url": "",
      "type": "website"
    },
    "twitter": {
      "card": "summary_large_image",
      "title": "Mystery Box Platform",
      "description": "Discover amazing rewards in our mystery boxes",
      "image": ""
    },
    "structuredData": {
      "organizationName": "Mystery Box Platform",
      "organizationType": "Organization",
      "contactEmail": "",
      "socialProfiles": []
    }
  }`),
  
  // Feature Configuration
  featureConfig: jsonb("feature_config").default(`{
    "enabled": {
      "boxes": true,
      "inventory": true,
      "leaderboard": true,
      "battles": false,
      "marketplace": false,
      "achievements": true,
      "dailyRewards": true,
      "referrals": false
    },
    "limits": {
      "maxBoxesPerUser": 100,
      "maxItemsPerUser": 1000,
      "dailyOpenLimit": 50
    },
    "integrations": {
      "analytics": "",
      "chatSupport": "",
      "paymentProvider": "stripe"
    }
  }`),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Whitelabel boxes - many-to-many relationship between whitelabel sites and boxes
export const whitelabelBoxes = pgTable("whitelabel_boxes", {
  id: serial("id").primaryKey(),
  whitelabelId: varchar("whitelabel_id").notNull(), // Reference to whitelabelSites.whitelabelId
  boxId: integer("box_id").references(() => boxes.id).notNull(),
  enabled: boolean("enabled").default(true),
  featured: boolean("featured").default(false),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }), // Optional custom pricing for this whitelabel
  customName: varchar("custom_name"), // Optional custom name for this whitelabel
  customDescription: text("custom_description"), // Optional custom description
  displayOrder: integer("display_order").default(0), // Sort order for this whitelabel
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Ensure unique box per whitelabel
  whitelabelBoxUnique: unique("whitelabel_box_unique").on(table.whitelabelId, table.boxId),
}));

// Whitelabel user isolation (users specific to each whitelabel)
export const whitelabelUsers = pgTable("whitelabel_users", {
  id: serial("id").primaryKey(),
  whitelabelId: varchar("whitelabel_id").notNull(), // Reference to whitelabelSites.whitelabelId
  userId: integer("user_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export const insertUserSchema = createInsertSchema(users);
export const insertBoxSchema = createInsertSchema(boxes);
export const insertItemSchema = createInsertSchema(items);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBox = z.infer<typeof insertBoxSchema>;
export type Box = typeof boxes.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;

// Whitelabel types
export const insertWhitelabelSiteSchema = createInsertSchema(whitelabelSites);
export type InsertWhitelabelSite = z.infer<typeof insertWhitelabelSiteSchema>;
export type WhitelabelSite = typeof whitelabelSites.$inferSelect;

export const insertWhitelabelBoxSchema = createInsertSchema(whitelabelBoxes);
export type InsertWhitelabelBox = z.infer<typeof insertWhitelabelBoxSchema>;
export type WhitelabelBox = typeof whitelabelBoxes.$inferSelect;

export const insertWhitelabelUserSchema = createInsertSchema(whitelabelUsers);
export type InsertWhitelabelUser = z.infer<typeof insertWhitelabelUserSchema>;
export type WhitelabelUser = typeof whitelabelUsers.$inferSelect;