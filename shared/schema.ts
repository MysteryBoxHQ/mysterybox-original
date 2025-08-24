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
  isAdmin: boolean("is_admin").notNull().default(false),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).notNull().default("0.00"),
  loginStreak: integer("login_streak").notNull().default(0),
  lastLoginAt: timestamp("last_login_at"),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by"),
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
  userId: text("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  obtainedAt: timestamp("obtained_at").notNull().defaultNow(),
});

export const boxOpenings = pgTable("box_openings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  boxId: integer("box_id").notNull(),
  itemId: integer("item_id").notNull(),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
});

// Promotions and rewards system
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // daily_reward, referral_bonus, level_up, deposit_bonus
  isActive: boolean("is_active").notNull().default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  requirementValue: integer("requirement_value"), // level requirement, deposit amount, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPromotions = pgTable("user_promotions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  promotionId: integer("promotion_id").notNull(),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }).notNull(),
});

// Daily rewards tracking
export const dailyRewards = pgTable("daily_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  day: integer("day").notNull(), // 1-7 for weekly cycle
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }).notNull(),
});

// Payment transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, box_purchase, reward
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  stripePaymentId: text("stripe_payment_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});





export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: text("type").notNull(), // 'cases_opened', 'items_collected', 'rare_items', 'spending', 'consecutive_days'
  requirement: integer("requirement").notNull(), // target number
  rarity: text("rarity").notNull().default("common"),
  rewardCoins: integer("reward_coins").default(0),
  rewardGems: integer("reward_gems").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  rewardClaimed: boolean("reward_claimed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'deposit', 'open_cases', 'spend_amount', 'login_streak'
  target: decimal("target", { precision: 10, scale: 2 }).notNull(),
  reward: decimal("reward", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userMissions = pgTable("user_missions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  missionId: integer("mission_id").notNull(),
  progress: decimal("progress", { precision: 10, scale: 2 }).default("0.00").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  rewardClaimed: boolean("reward_claimed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Removed duplicate dailyRewards table - using the USD-only version defined earlier

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  totalCasesOpened: integer("total_cases_opened").default(0).notNull(),
  totalSpent: integer("total_spent").default(0).notNull(),
  rareItemsFound: integer("rare_items_found").default(0).notNull(),
  lastLoginDate: timestamp("last_login_date"),
  loginStreak: integer("login_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const boxBattles = pgTable("box_battles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  boxId: integer("box_id").notNull().references(() => boxes.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  status: text("status").default("waiting").notNull(), // waiting, active, finished
  maxPlayers: integer("max_players").default(2).notNull(),
  entryFee: integer("entry_fee").notNull(),
  totalRounds: integer("total_rounds").default(3).notNull(),
  winnerId: integer("winner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
});

export const boxBattleParticipants = pgTable("box_battle_participants", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull().references(() => boxBattles.id),
  userId: integer("user_id").notNull().references(() => users.id),
  position: integer("position").notNull(),
  totalValue: integer("total_value").default(0).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const boxBattleRounds = pgTable("box_battle_rounds", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull().references(() => boxBattles.id),
  participantId: integer("participant_id").notNull().references(() => boxBattleParticipants.id),
  roundNumber: integer("round_number").notNull(),
  itemId: integer("item_id").notNull().references(() => items.id),
  itemValue: integer("item_value").notNull(),
  openedAt: timestamp("opened_at").defaultNow(),
});

// Removed duplicate transactions table - using USD-only version defined earlier

export const marketListings = pgTable("market_listings", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  price: text("price").notNull(),
  status: text("status").default("active"), // active, sold, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketTransactions = pgTable("market_transactions", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => marketListings.id).notNull(),
  buyerId: integer("buyer_id").references(() => users.id).notNull(),
  sellerId: integer("seller_id").references(() => users.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  price: text("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fairnessProofs = pgTable("fairness_proofs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  boxId: integer("box_id").references(() => boxes.id).notNull(),
  serverSeed: text("server_seed").notNull(),
  clientSeed: text("client_seed").notNull(),
  nonce: integer("nonce").notNull(),
  combinedHash: text("combined_hash").notNull(),
  resultHash: text("result_hash").notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  revealed: boolean("revealed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  boxId: integer("box_id").notNull().references(() => boxes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const legalPages = pgTable("legal_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // terms, privacy, cookies, etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  metaDescription: text("meta_description"),
  status: text("status").default("published").notNull(), // draft, published
  lastUpdatedBy: integer("last_updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shippingAddresses = pgTable("shipping_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull(),
  phoneNumber: text("phone_number"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shipmentOrders = pgTable("shipment_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  userItemId: integer("user_item_id").notNull().references(() => userItems.id),
  shippingAddressId: integer("shipping_address_id").notNull().references(() => shippingAddresses.id),
  status: text("status").default("pending").notNull(), // pending, processing, shipped, delivered, cancelled
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"), // UPS, FedEx, DHL, etc.
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  estimatedDelivery: timestamp("estimated_delivery"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner revenue tracking
export const partnerRevenue = pgTable("partner_revenue", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
  userId: integer("user_id").references(() => users.id),
  transactionId: integer("transaction_id").references(() => transactions.id),
  type: text("type").notNull(), // box_opening, deposit, withdrawal, commission
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  partnerRevenue: decimal("partner_revenue", { precision: 10, scale: 2 }).notNull(),
  platformRevenue: decimal("platform_revenue", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  metadata: text("metadata"), // JSON for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhook events for partner integrations
export const webhookEvents = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
  eventType: text("event_type").notNull(), // user.created, box.opened, transaction.completed, etc.
  payload: text("payload").notNull(), // JSON payload
  status: text("status").notNull().default("pending"), // pending, sent, failed, retrying
  attempts: integer("attempts").notNull().default(0),
  lastAttempt: timestamp("last_attempt"),
  nextAttempt: timestamp("next_attempt"),
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner API tokens for authentication
export const partnerTokens = pgTable("partner_tokens", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull().references(() => partners.id),
  token: text("token").notNull().unique(),
  name: text("name").notNull(), // token description
  permissions: text("permissions").notNull(), // JSON array of permissions
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// B2B Partners - for widget integration into existing casino/ecommerce sites
export const b2bPartners = pgTable("b2b_partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  apiKey: varchar("api_key", { length: 64 }).unique().notNull(),
  apiSecret: varchar("api_secret", { length: 64 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, active, suspended, testing
  webhookUrl: varchar("webhook_url", { length: 500 }),
  allowedOrigins: jsonb("allowed_origins").default([]), // array of allowed domains for CORS
  rateLimit: integer("rate_limit").default(1000), // requests per minute
  integrationConfig: jsonb("integration_config").default(`{
    "enableBoxWidget": true,
    "enableInventoryWidget": false,
    "enableMarketplaceWidget": false,
    "revenueShare": 15,
    "customCss": ""
  }`),
  widgetConfig: jsonb("widget_config").default(`{
    "theme": "default",
    "primaryColor": "#3B82F6",
    "backgroundColor": "#FFFFFF",
    "borderRadius": 8,
    "showBranding": true,
    "language": "en",
    "currency": "USD"
  }`),
  apiConfig: jsonb("api_config").default(`{
    "webhookRetries": 3,
    "webhookTimeout": 30000,
    "enableRealTimeUpdates": true
  }`),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// B2B API usage tracking
export const b2bApiUsage = pgTable("b2b_api_usage", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => b2bPartners.id).notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  requestCount: integer("request_count").default(1),
  responseTime: integer("response_time"), // in milliseconds
  errorCount: integer("error_count").default(0),
  date: timestamp("date").defaultNow(),
  hour: integer("hour").notNull(), // hour of day (0-23) for granular tracking
});

// B2B Transactions - revenue tracking for partner integrations
export const b2bTransactions = pgTable("b2b_transactions", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => b2bPartners.id).notNull(),
  externalUserId: varchar("external_user_id", { length: 255 }), // partner's user ID
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // box_open, item_sale, etc.
  boxId: integer("box_id").references(() => boxes.id),
  itemId: integer("item_id").references(() => items.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  partnerRevenue: decimal("partner_revenue", { precision: 10, scale: 2 }),
  platformRevenue: decimal("platform_revenue", { precision: 10, scale: 2 }),
  externalTransactionId: varchar("external_transaction_id", { length: 255 }),
  webhookSent: boolean("webhook_sent").default(false),
  webhookResponse: jsonb("webhook_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
      "primary": "#3B82F6",
      "secondary": "#1E40AF",
      "accent": "#F59E0B",
      "background": "#FFFFFF",
      "surface": "#F8FAFC",
      "text": "#1F2937",
      "textSecondary": "#6B7280",
      "border": "#E5E7EB",
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444"
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
  
  // Theme and Visual Configuration
  themeConfig: jsonb("theme_config").default(`{
    "mode": "light",
    "customCss": "",
    "animations": {
      "enabled": true,
      "duration": "300ms",
      "easing": "ease-in-out"
    },
    "effects": {
      "shadows": true,
      "blur": true,
      "gradients": true
    }
  }`),
  
  // Content and Text Customization
  contentConfig: jsonb("content_config").default(`{
    "siteTitle": "Mystery Box Platform",
    "tagline": "Discover Amazing Items",
    "welcomeMessage": "Welcome to our mystery box platform",
    "footerText": "© 2024 Mystery Box Platform. All rights reserved.",
    "customTexts": {
      "boxOpeningButton": "Open Box",
      "purchaseButton": "Purchase",
      "inventoryTitle": "My Inventory",
      "walletTitle": "My Wallet"
    },
    "socialLinks": {
      "twitter": "",
      "discord": "",
      "instagram": "",
      "youtube": ""
    },
    "legalPages": {
      "privacyPolicy": "",
      "termsOfService": "",
      "cookiePolicy": ""
    }
  }`),
  
  // Complete SEO and Meta Configuration
  seoConfig: jsonb("seo_config").default(`{
    "meta": {
      "title": "Mystery Box Platform - Discover Amazing Items",
      "description": "Open mystery boxes and discover rare and valuable items. Join thousands of users exploring our exciting collection.",
      "keywords": "mystery boxes, gaming, collectibles, rare items",
      "author": "Mystery Box Platform",
      "robots": "index, follow",
      "canonical": "",
      "alternateLanguages": {}
    },
    "openGraph": {
      "title": "Mystery Box Platform - Discover Amazing Items",
      "description": "Open mystery boxes and discover rare and valuable items. Join thousands of users exploring our exciting collection.",
      "type": "website",
      "url": "",
      "image": "",
      "imageAlt": "Mystery Box Platform",
      "siteName": "Mystery Box Platform",
      "locale": "en_US"
    },
    "twitter": {
      "card": "summary_large_image",
      "site": "@mysteryboxes",
      "creator": "@mysteryboxes",
      "title": "Mystery Box Platform - Discover Amazing Items",
      "description": "Open mystery boxes and discover rare and valuable items.",
      "image": "",
      "imageAlt": "Mystery Box Platform"
    },
    "structured": {
      "organization": {
        "name": "Mystery Box Platform",
        "url": "",
        "logo": "",
        "sameAs": []
      },
      "website": {
        "name": "Mystery Box Platform",
        "url": ""
      }
    }
  }`),
  
  // Feature and Business Logic Configuration
  featureConfig: jsonb("feature_config").default(`{
    "features": {
      "boxOpening": true,
      "inventory": true,
      "marketplace": true,
      "battles": true,
      "achievements": true,
      "leaderboards": true,
      "wallet": true,
      "shipping": false,
      "chat": true,
      "notifications": true
    },
    "limits": {
      "maxBoxOpeningsPerDay": 100,
      "maxInventoryItems": 1000,
      "maxMarketListings": 50,
      "maxWithdrawalAmount": 1000
    },
    "integrations": {
      "analytics": {
        "googleAnalytics": "",
        "facebookPixel": "",
        "customTracking": ""
      },
      "support": {
        "liveChatEnabled": true,
        "supportEmail": "",
        "helpDeskUrl": ""
      }
    }
  }`),
  
  // Payment and Business Configuration
  paymentConfig: jsonb("payment_config").default(`{
    "currencies": ["USD"],
    "paymentMethods": {
      "creditCard": true,
      "paypal": false,
      "crypto": false,
      "applePay": false,
      "googlePay": false
    },
    "pricing": {
      "commission": 0.05,
      "minimumDeposit": 10,
      "minimumWithdrawal": 5,
      "processingFee": 0.02
    },
    "stripe": {
      "publicKey": "",
      "webhookSecret": ""
    }
  }`),
  
  environmentConfig: jsonb("environment_config").default("{}"), // Database, Redis, CDN settings
  deploymentUrl: varchar("deployment_url"), // Current deployment URL
  sslCertificate: text("ssl_certificate"),
  sslPrivateKey: text("ssl_private_key"),
  dnsConfigured: boolean("dns_configured").default(false),
  healthCheckUrl: varchar("health_check_url"),
  lastHealthCheck: timestamp("last_health_check"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const whitelabelDomains = pgTable("whitelabel_domains", {
  id: serial("id").primaryKey(),
  whitelabelId: integer("whitelabel_id").references(() => whitelabelSites.id),
  domain: varchar("domain").notNull(),
  isPrimary: boolean("is_primary").default(false),
  sslEnabled: boolean("ssl_enabled").default(false),
  dnsConfigured: boolean("dns_configured").default(false),
  status: varchar("status").default("pending"), // pending, active, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Whitelabel deployment tracking
export const whitelabelDeployments = pgTable("whitelabel_deployments", {
  id: serial("id").primaryKey(),
  whitelabelId: integer("whitelabel_id").references(() => whitelabelSites.id).notNull(),
  deploymentId: varchar("deployment_id").notNull(), // Unique deployment identifier
  version: varchar("version").notNull(),
  status: varchar("status").default("pending"), // pending, building, deploying, active, failed, rollback
  buildLogs: text("build_logs"),
  deploymentLogs: text("deployment_logs"),
  environmentVariables: jsonb("environment_variables").default("{}"),
  resourceUsage: jsonb("resource_usage").default("{}"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Whitelabel environment isolation
export const whitelabelEnvironments = pgTable("whitelabel_environments", {
  id: serial("id").primaryKey(),
  whitelabelId: integer("whitelabel_id").references(() => whitelabelSites.id).notNull(),
  type: varchar("type").notNull(), // sandbox, production
  databaseUrl: text("database_url"),
  redisUrl: text("redis_url"),
  cdnConfig: jsonb("cdn_config").default("{}"),
  apiEndpoints: jsonb("api_endpoints").default("{}"),
  secretsConfig: jsonb("secrets_config").default("{}"),
  isActive: boolean("is_active").default(true),
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

// Whitelabel analytics tracking
export const whitelabelAnalytics = pgTable("whitelabel_analytics", {
  id: serial("id").primaryKey(),
  whitelabelId: varchar("whitelabel_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  uniqueVisitors: integer("unique_visitors").default(0),
  pageViews: integer("page_views").default(0),
  transactions: integer("transactions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00"),
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }).default("0.00"),
  avgSessionDuration: integer("avg_session_duration").default(0), // in seconds
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0.00"),
});

// Whitelabel configuration templates
export const whitelabelTemplates = pgTable("whitelabel_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // gaming, ecommerce, corporate, etc.
  brandingConfig: jsonb("branding_config").default("{}"),
  themeConfig: jsonb("theme_config").default("{}"),
  featureConfig: jsonb("feature_config").default("{}"),
  layoutConfig: jsonb("layout_config").default("{}"),
  isActive: boolean("is_active").default(true),
  previewImageUrl: varchar("preview_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertBoxBattleSchema = createInsertSchema(boxBattles).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  finishedAt: true,
});

export const insertWhitelabelSiteSchema = createInsertSchema(whitelabelSites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhitelabelDeploymentSchema = createInsertSchema(whitelabelDeployments).omit({
  id: true,
  createdAt: true,
});

export const insertWhitelabelTemplateSchema = createInsertSchema(whitelabelTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Whitelabel type definitions
export type WhitelabelSite = typeof whitelabelSites.$inferSelect;
export type InsertWhitelabelSite = z.infer<typeof insertWhitelabelSiteSchema>;

export type WhitelabelDeployment = typeof whitelabelDeployments.$inferSelect;
export type InsertWhitelabelDeployment = z.infer<typeof insertWhitelabelDeploymentSchema>;

export type WhitelabelTemplate = typeof whitelabelTemplates.$inferSelect;
export type InsertWhitelabelTemplate = z.infer<typeof insertWhitelabelTemplateSchema>;

export type WhitelabelBox = typeof whitelabelBoxes.$inferSelect;
export type InsertWhitelabelBox = typeof whitelabelBoxes.$inferInsert;

export type WhitelabelEnvironment = typeof whitelabelEnvironments.$inferSelect;
export type WhitelabelAnalytics = typeof whitelabelAnalytics.$inferSelect;
export type WhitelabelUser = typeof whitelabelUsers.$inferSelect;

// Content Management System for Whitelabel Pages
export const whitelabelPages = pgTable("whitelabel_pages", {
  id: serial("id").primaryKey(),
  whitelabelId: varchar("whitelabel_id").notNull(),
  pageType: varchar("page_type").notNull(), // landing, boxes, battles, leaderboard, etc.
  pageName: varchar("page_name").notNull(),
  title: text("title").notNull(),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  content: jsonb("content").notNull(), // All page content as JSON
  isActive: boolean("is_active").notNull().default(true),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content Sections for flexible page building
export const whitelabelContentSections = pgTable("whitelabel_content_sections", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").notNull(),
  sectionType: varchar("section_type").notNull(), // hero, featured_boxes, active_battles, footer, etc.
  sectionName: varchar("section_name").notNull(),
  content: jsonb("content").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  styling: jsonb("styling").default("{}"), // CSS overrides, colors, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media Library for content management
export const whitelabelMedia = pgTable("whitelabel_media", {
  id: serial("id").primaryKey(),
  whitelabelId: varchar("whitelabel_id").notNull(),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  fileType: varchar("file_type").notNull(), // image, video, document
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  altText: text("alt_text"),
  caption: text("caption"),
  tags: jsonb("tags").default("[]"),
  isPublic: boolean("is_public").notNull().default(true),
  uploadedBy: integer("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WhitelabelPage = typeof whitelabelPages.$inferSelect;
export type InsertWhitelabelPage = typeof whitelabelPages.$inferInsert;
export type WhitelabelContentSection = typeof whitelabelContentSections.$inferSelect;
export type InsertWhitelabelContentSection = typeof whitelabelContentSections.$inferInsert;
export type WhitelabelMedia = typeof whitelabelMedia.$inferSelect;
export type InsertWhitelabelMedia = typeof whitelabelMedia.$inferInsert;

export const insertBoxBattleParticipantSchema = createInsertSchema(boxBattleParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertBoxBattleRoundSchema = createInsertSchema(boxBattleRounds).omit({
  id: true,
  openedAt: true,
});

export const insertBoxSchema = createInsertSchema(boxes).omit({
  id: true,
}).extend({
  price: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

export const insertUserItemSchema = createInsertSchema(userItems).omit({
  id: true,
  obtainedAt: true,
});



export const insertBoxOpeningSchema = createInsertSchema(boxOpenings).omit({
  id: true,
  openedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertDailyRewardSchema = createInsertSchema(dailyRewards).omit({
  id: true,
  claimedAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export const insertFairnessProofSchema = createInsertSchema(fairnessProofs).omit({
  id: true,
  createdAt: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertShippingAddressSchema = createInsertSchema(shippingAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShipmentOrderSchema = createInsertSchema(shipmentOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLegalPageSchema = createInsertSchema(legalPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type Box = typeof boxes.$inferSelect & { highestRarity?: string; isFavorited?: boolean };
export type Item = typeof items.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type LegalPage = typeof legalPages.$inferSelect;
export type InsertLegalPage = z.infer<typeof insertLegalPageSchema>;
export type UserItem = typeof userItems.$inferSelect;
export type BoxOpening = typeof boxOpenings.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type DailyRewardRecord = typeof dailyRewards.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type FairnessProof = typeof fairnessProofs.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBox = z.infer<typeof insertBoxSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertUserItem = z.infer<typeof insertUserItemSchema>;
export type InsertBoxOpening = z.infer<typeof insertBoxOpeningSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type InsertDailyReward = z.infer<typeof insertDailyRewardSchema>;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type InsertFairnessProof = z.infer<typeof insertFairnessProofSchema>;

// Mission types
export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
  createdAt: true,
});

export const insertUserMissionSchema = createInsertSchema(userMissions).omit({
  id: true,
  createdAt: true,
});

export type Mission = typeof missions.$inferSelect;
export type UserMission = typeof userMissions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type InsertUserMission = z.infer<typeof insertUserMissionSchema>;

export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type ShipmentOrder = typeof shipmentOrders.$inferSelect;
export type InsertShippingAddress = z.infer<typeof insertShippingAddressSchema>;
export type InsertShipmentOrder = z.infer<typeof insertShipmentOrderSchema>;

// Additional types for API responses
export type BoxWithItems = Box & {
  items: Item[];
};

export type UserItemWithItem = UserItem & {
  item: Item;
};

export type BoxOpeningResult = {
  item: Item;
  user: User;
  success: boolean;
  isPaidOpening?: boolean; // true for real money, false for demo
};

export type RecentOpening = {
  id: number;
  username: string;
  itemName: string;
  itemIcon: string;
  itemRarity: string;
  timeAgo: string;
};

export type UserAchievementWithDetails = UserAchievement & {
  achievement: Achievement;
};

export type AchievementProgress = {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  progress: number;
  requirement: number;
  completed: boolean;
  rewardCoins: number;
  rewardGems: number;
  rewardClaimed: boolean;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  value: number;
  totalCasesOpened?: number;
  totalSpent?: number;
  rareItemsFound?: number;
};

export type DailyReward = {
  day: number;
  coins: number;
  gems: number;
  claimed: boolean;
};

// Multi-tenant type exports
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;
export type PartnerBox = typeof partnerBoxes.$inferSelect;
export type InsertPartnerBox = typeof partnerBoxes.$inferInsert;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = typeof apiUsage.$inferInsert;
export type PartnerRevenue = typeof partnerRevenue.$inferSelect;
export type InsertPartnerRevenue = typeof partnerRevenue.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;
export type PartnerToken = typeof partnerTokens.$inferSelect;
export type InsertPartnerToken = typeof partnerTokens.$inferInsert;
export type WhitelabelDomain = typeof whitelabelDomains.$inferSelect;
export type InsertWhitelabelDomain = typeof whitelabelDomains.$inferInsert;

// Additional types for admin components
export interface PartnerWithSites extends Partner {
  sites?: WhitelabelSite[];
  integrationConfig?: {
    widget_enabled: boolean;
    api_enabled: boolean;
    webhook_url?: string;
  };
}

export interface AnalyticsData {
  totalRevenue: number;
  revenueChange: number;
  activeUsers: number;
  userGrowth: number;
  totalBoxesOpened: number;
  boxOpeningGrowth: number;
  conversionRate: number;
  conversionChange: number;
  dailyActiveUsers: number;
  avgSessionDuration: number;
  retentionRate: number;
  churnRate: number;
  totalPartners: number;
  activePartners: number;
  apiCalls24h: number;
  partnerRevenue: number;
  boxCategories: Array<{ name: string; value: number }>;
  recentActivity: Array<{ description: string; timestamp: string }>;
}

export interface RevenueData {
  date: string;
  revenue: number;
  profit: number;
}

export interface UserGrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
}

export interface BoxPerformanceData {
  name: string;
  opened: number;
  revenue: number;
}

export interface PartnerStatsData {
  id: number;
  name: string;
  revenue: number;
  apiCalls: number;
}

export interface WebhookData {
  id: number;
  partnerId: number;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered?: string;
  secret?: string;
}

export interface WebhookLogData {
  id: number;
  webhookUrl: string;
  eventType: string;
  status: string;
  statusCode: number;
  response?: string;
  duration: number;
  timestamp: string;
}

// Extended types for admin components with proper typing
export interface ExtendedPartner extends Partner {
  sites?: WhitelabelSite[];
  integrationConfig?: {
    widget_enabled: boolean;
    api_enabled: boolean;
    webhook_url?: string;
  };
}

export interface BoxFilter {
  rarity?: string;
  category?: string;
  priceRange?: [number, number];
  featured?: boolean;
}

export interface ExtendedBox extends Box {
  filter?: BoxFilter;
}

export interface WhitelabelConfig {
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  premium_support: boolean;
  custom_boxes: boolean;
  live_unboxing: boolean;
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
}

// Session and Request extensions
declare global {
  namespace Express {
    interface Session {
      adminToken?: string;
    }
    
    interface Request {
      adminUser?: any;
    }
  }
}
