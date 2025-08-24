// Content Mapping Script for RollingDrop Demo Whitelabel
// This script maps existing whitelabel content to the WordPress-like CMS structure

const fs = require('fs');

// Existing RollingDrop Demo Content Structure
const existingContent = {
  // Site Configuration
  site: {
    title: "RollingDrop Demo - Mystery Box Platform",
    tagline: "Experience the Thrill of Mystery Boxes", 
    description: "Discover amazing rewards in our premium mystery boxes"
  },

  // Branding Configuration
  branding: {
    logo: {
      primaryUrl: "/api/cdn/images/logo.png",
      secondaryUrl: "/api/cdn/images/logo-light.png",
      faviconUrl: "/api/cdn/images/favicon.ico"
    },
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b", 
      accent: "#f59e0b",
      background: "#0f172a",
      surface: "#1e293b"
    }
  },

  // Navigation Structure
  navigation: {
    homeLabel: "Home",
    boxesLabel: "Mystery Boxes",
    inventoryLabel: "My Inventory", 
    leaderboardLabel: "Leaderboard"
  },

  // SEO Configuration
  seo: {
    meta: {
      title: "RollingDrop Demo - Premium Mystery Box Platform",
      description: "Experience the excitement of opening mystery boxes and discovering amazing rewards, collectibles, and prizes.",
      keywords: "mystery boxes, rewards, collectibles, gaming, prizes, demo"
    },
    openGraph: {
      title: "RollingDrop Demo - Mystery Box Platform",
      description: "Discover amazing rewards in our premium mystery boxes",
      image: "/api/cdn/images/og-image.jpg"
    }
  },

  // Content Pages Structure
  pages: {
    landing: {
      hero: {
        title: "Experience the Thrill of Mystery Boxes",
        subtitle: "Discover amazing rewards in our premium mystery boxes",
        ctaText: "Start Opening Boxes",
        backgroundImage: "/api/cdn/images/hero-bg.jpg"
      },
      features: [
        {
          icon: "🎁",
          title: "Real Items",
          description: "Win actual products shipped directly to your door"
        },
        {
          icon: "⚡", 
          title: "Instant Results",
          description: "Open boxes and see your winnings immediately"
        },
        {
          icon: "🏆",
          title: "Fair Play", 
          description: "Transparent odds and provably fair results"
        }
      ],
      sections: [
        "Popular Mystery Boxes",
        "Active Case Battles", 
        "Recent Wins",
        "Daily Race"
      ]
    },
    
    boxes: {
      categories: ["Starter", "Premium", "Tech", "Luxury"],
      featured: true,
      filters: ["rarity", "price", "category"]
    },

    inventory: {
      sections: ["My Items", "Trade History", "Wishlist"],
      features: ["filtering", "sorting", "search"]
    },

    leaderboard: {
      types: ["cases", "spending", "rare_items"],
      timeframes: ["daily", "weekly", "monthly", "all-time"]
    }
  },

  // Footer Content
  footer: {
    companyInfo: {
      name: "RollingDrop Demo",
      description: "RollingDrop Demo is the best online mystery box site",
      location: "Innovation Plaza, Suite 2040, Tech District",
      contact: {
        email: "contact@rollingdrop.com",
        phone: "+353 21 212 7606",
        support: "Live Chat Support"
      }
    },
    
    navigationSections: [
      {
        title: "Information",
        links: ["About Us", "How It Works", "FAQ", "Contact"]
      },
      {
        title: "Legal", 
        links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "AML Policy"]
      },
      {
        title: "Support",
        links: ["Help Center", "Contact Support", "Bug Reports", "Feature Requests"]
      },
      {
        title: "Community",
        links: ["Discord", "Twitter", "Reddit", "YouTube"]
      }
    ],

    legal: {
      copyright: "© All rights reserved 2024 - 2025",
      privacy: "Privacy Statement available",
      terms: "Terms & Conditions apply"
    }
  },

  // Feature Configuration
  features: {
    enabled: {
      boxes: true,
      inventory: true, 
      leaderboard: true,
      battles: true,
      achievements: true,
      dailyRewards: true
    },
    limits: {
      maxBoxesPerUser: 100,
      maxItemsPerUser: 1000,
      dailyOpenLimit: 50
    }
  }
};

// WordPress-like CMS Page Structure Mapping
const cmsPageMapping = {
  // Main Landing Page
  "landing-home": {
    pageType: "landing",
    pageName: "home", 
    title: existingContent.site.title,
    metaDescription: existingContent.seo.meta.description,
    metaKeywords: existingContent.seo.meta.keywords,
    ogTitle: existingContent.seo.openGraph.title,
    ogDescription: existingContent.seo.openGraph.description,
    ogImage: existingContent.seo.openGraph.image,
    sections: [
      {
        sectionType: "hero",
        sectionName: "main-hero",
        content: existingContent.pages.landing.hero,
        displayOrder: 1
      },
      {
        sectionType: "features",
        sectionName: "feature-highlights", 
        content: existingContent.pages.landing.features,
        displayOrder: 2
      },
      {
        sectionType: "boxes",
        sectionName: "popular-boxes",
        content: { title: "Popular Mystery Boxes", showFeatured: true },
        displayOrder: 3
      },
      {
        sectionType: "battles",
        sectionName: "active-battles",
        content: { title: "Active Case Battles", maxItems: 6 },
        displayOrder: 4
      },
      {
        sectionType: "wins",
        sectionName: "recent-wins", 
        content: { title: "Recent Wins", scrolling: true },
        displayOrder: 5
      },
      {
        sectionType: "promotion",
        sectionName: "daily-race",
        content: { title: "$5,000 Daily Race", description: "Complete and be among the top players to win amazing prizes!" },
        displayOrder: 6
      }
    ]
  },

  // About Page
  "about": {
    pageType: "static",
    pageName: "about",
    title: "About RollingDrop Demo",
    metaDescription: "Learn about RollingDrop Demo, the premier mystery box platform",
    content: {
      company: existingContent.footer.companyInfo,
      mission: "To provide the most exciting and fair mystery box experience",
      values: ["Transparency", "Fairness", "Customer First", "Innovation"]
    }
  },

  // Legal Pages
  "terms": {
    pageType: "legal",
    pageName: "terms",
    title: "Terms of Service",
    metaDescription: "Terms and conditions for using RollingDrop Demo platform"
  },

  "privacy": {
    pageType: "legal", 
    pageName: "privacy",
    title: "Privacy Policy",
    metaDescription: "Privacy policy and data protection information"
  },

  "cookies": {
    pageType: "legal",
    pageName: "cookies", 
    title: "Cookie Policy",
    metaDescription: "Information about cookie usage on our platform"
  },

  // Support Pages
  "faq": {
    pageType: "support",
    pageName: "faq",
    title: "Frequently Asked Questions",
    metaDescription: "Common questions and answers about RollingDrop Demo"
  },

  "contact": {
    pageType: "support",
    pageName: "contact",
    title: "Contact Us", 
    metaDescription: "Get in touch with RollingDrop Demo support team",
    content: existingContent.footer.companyInfo.contact
  }
};

// Media Assets Mapping
const mediaMapping = {
  logos: [
    { fileName: "logo.png", type: "logo", category: "branding" },
    { fileName: "logo-light.png", type: "logo-light", category: "branding" },
    { fileName: "favicon.ico", type: "favicon", category: "branding" }
  ],
  
  images: [
    { fileName: "hero-bg.jpg", type: "background", category: "hero" },
    { fileName: "og-image.jpg", type: "social", category: "seo" },
    { fileName: "twitter-card.jpg", type: "social", category: "seo" }
  ],
  
  boxImages: [
    { fileName: "starter-box.jpg", type: "product", category: "boxes" },
    { fileName: "premium-box.jpg", type: "product", category: "boxes" },
    { fileName: "tech-box.jpg", type: "product", category: "boxes" }, 
    { fileName: "luxury-box.jpg", type: "product", category: "boxes" }
  ]
};

console.log("RollingDrop Demo Content Mapping Complete");
console.log("Pages mapped:", Object.keys(cmsPageMapping).length);
console.log("Media assets mapped:", 
  mediaMapping.logos.length + mediaMapping.images.length + mediaMapping.boxImages.length);

module.exports = {
  existingContent,
  cmsPageMapping, 
  mediaMapping
};