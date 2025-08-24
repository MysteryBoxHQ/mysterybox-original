import { db } from './db';
import { whitelabelSites, whitelabelBoxes, boxes, items } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function initializeRollingDropDemo() {
  try {
    console.log('Initializing RollingDrop Demo whitelabel...');
    
    // Check if demo whitelabel already exists
    const existingWhitelabel = await db
      .select()
      .from(whitelabelSites)
      .where(eq(whitelabelSites.whitelabelId, 'rollingdrop-demo'))
      .limit(1);
    
    if (existingWhitelabel.length === 0) {
      // Create RollingDrop demo whitelabel site
      const [whitelabelSite] = await db
        .insert(whitelabelSites)
        .values({
          whitelabelId: 'rollingdrop-demo',
          name: 'rollingdrop-demo',
          displayName: 'RollingDrop Demo',
          slug: 'rollingdrop-demo',
          status: 'active',
          deploymentStatus: 'deployed',
          brandingConfig: JSON.stringify({
            logo: {
              primaryUrl: '/api/cdn/images/logo.png',
              secondaryUrl: '/api/cdn/images/logo-light.png',
              faviconUrl: '/api/cdn/images/favicon.ico',
              width: 200,
              height: 60
            },
            colors: {
              primary: '#3b82f6',
              secondary: '#64748b',
              accent: '#f59e0b',
              background: '#0f172a',
              surface: '#1e293b',
              text: '#e2e8f0',
              textSecondary: '#94a3b8',
              border: '#334155',
              success: '#10b981',
              warning: '#f59e0b',
              error: '#ef4444'
            },
            typography: {
              fontFamily: 'Inter, sans-serif',
              headingFont: 'Inter, sans-serif',
              fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem'
              }
            },
            layout: {
              headerHeight: '64px',
              sidebarWidth: '256px',
              borderRadius: '0.5rem',
              spacing: '1rem'
            }
          }),
          contentConfig: JSON.stringify({
            site: {
              title: 'RollingDrop Demo - Mystery Box Platform',
              tagline: 'Experience the Thrill of Mystery Boxes',
              description: 'Discover amazing rewards in our premium mystery boxes'
            },
            navigation: {
              homeLabel: 'Home',
              boxesLabel: 'Mystery Boxes',
              inventoryLabel: 'My Inventory',
              leaderboardLabel: 'Leaderboard'
            },
            footer: {
              companyName: 'RollingDrop Demo',
              copyright: '2024 RollingDrop Demo. All rights reserved.',
              links: []
            },
            customTexts: {
              welcomeMessage: 'Welcome to RollingDrop Demo!',
              loginPrompt: 'Login with any username and password "demo"',
              boxOpeningTitle: 'Open Your Mystery Box',
              inventoryTitle: 'Your Collection'
            }
          }),
          seoConfig: JSON.stringify({
            meta: {
              title: 'RollingDrop Demo - Premium Mystery Box Platform',
              description: 'Experience the excitement of opening mystery boxes and discovering amazing rewards, collectibles, and prizes.',
              keywords: 'mystery boxes, rewards, collectibles, gaming, prizes, demo',
              author: 'RollingDrop Demo'
            },
            openGraph: {
              title: 'RollingDrop Demo - Mystery Box Platform',
              description: 'Discover amazing rewards in our premium mystery boxes',
              image: '/api/cdn/images/og-image.jpg',
              url: 'https://rollingdrop-demo.com',
              type: 'website'
            },
            twitter: {
              card: 'summary_large_image',
              title: 'RollingDrop Demo',
              description: 'Experience the thrill of mystery boxes',
              image: '/api/cdn/images/twitter-card.jpg'
            }
          }),
          featureConfig: JSON.stringify({
            enabled: {
              boxes: true,
              inventory: true,
              leaderboard: true,
              battles: true,
              marketplace: false,
              achievements: true,
              dailyRewards: true,
              referrals: false
            },
            limits: {
              maxBoxesPerUser: 100,
              maxItemsPerUser: 1000,
              dailyOpenLimit: 50
            },
            integrations: {
              analytics: 'demo',
              chatSupport: 'disabled',
              paymentProvider: 'demo'
            }
          })
        })
        .returning();
      
      console.log('Created RollingDrop Demo whitelabel site:', whitelabelSite.whitelabelId);
    }
    
    // Create demo boxes if they don't exist
    const demoBoxes = [
      {
        name: 'Starter Mystery Box',
        description: 'Perfect for beginners! Contains common to rare items.',
        price: '9.99',
        rarity: 'common',
        imageUrl: '/api/cdn/images/starter-box.jpg',
        items: [
          { name: 'Bronze Coin', description: 'A shiny bronze coin', rarity: 'common', icon: 'fas fa-coins', dropChance: 4000, value: '1.00' },
          { name: 'Silver Gem', description: 'A precious silver gem', rarity: 'uncommon', icon: 'fas fa-gem', dropChance: 3000, value: '5.00' },
          { name: 'Golden Trophy', description: 'A prestigious golden trophy', rarity: 'rare', icon: 'fas fa-trophy', dropChance: 2000, value: '15.00' },
          { name: 'Diamond Ring', description: 'An exquisite diamond ring', rarity: 'epic', icon: 'fas fa-ring', dropChance: 1000, value: '50.00' }
        ]
      },
      {
        name: 'Premium Gold Box',
        description: 'High-value items guaranteed! Rare to legendary drops.',
        price: '24.99',
        rarity: 'rare',
        imageUrl: '/api/cdn/images/premium-gold-box.jpg',
        items: [
          { name: 'Rare Crystal', description: 'A mystical rare crystal', rarity: 'rare', icon: 'fas fa-gem', dropChance: 3500, value: '20.00' },
          { name: 'Epic Sword', description: 'A legendary weapon', rarity: 'epic', icon: 'fas fa-sword', dropChance: 3000, value: '45.00' },
          { name: 'Legendary Armor', description: 'Unbreakable legendary armor', rarity: 'legendary', icon: 'fas fa-shield', dropChance: 2000, value: '100.00' },
          { name: 'Mythical Crown', description: 'A crown of immense power', rarity: 'mythical', icon: 'fas fa-crown', dropChance: 1500, value: '250.00' }
        ]
      },
      {
        name: 'Tech Gadget Box',
        description: 'Latest tech gadgets and digital collectibles.',
        price: '19.99',
        rarity: 'uncommon',
        imageUrl: '/api/cdn/images/tech-gadget-box.jpg',
        items: [
          { name: 'Wireless Earbuds', description: 'High-quality wireless earbuds', rarity: 'common', icon: 'fas fa-headphones', dropChance: 3500, value: '15.00' },
          { name: 'Smart Watch', description: 'Feature-rich smartwatch', rarity: 'uncommon', icon: 'fas fa-clock', dropChance: 3000, value: '25.00' },
          { name: 'Gaming Mouse', description: 'Professional gaming mouse', rarity: 'rare', icon: 'fas fa-mouse', dropChance: 2500, value: '40.00' },
          { name: 'VR Headset', description: 'Immersive VR experience', rarity: 'epic', icon: 'fas fa-vr-cardboard', dropChance: 1000, value: '80.00' }
        ]
      },
      {
        name: 'Luxury Designer Box',
        description: 'Exclusive designer items and luxury collectibles.',
        price: '49.99',
        rarity: 'epic',
        imageUrl: '/api/cdn/images/luxury-designer-box.jpg',
        items: [
          { name: 'Designer Wallet', description: 'Premium leather wallet', rarity: 'rare', icon: 'fas fa-wallet', dropChance: 3000, value: '35.00' },
          { name: 'Luxury Watch', description: 'Swiss-made luxury timepiece', rarity: 'epic', icon: 'fas fa-watch', dropChance: 2500, value: '75.00' },
          { name: 'Diamond Necklace', description: 'Stunning diamond necklace', rarity: 'legendary', icon: 'fas fa-necklace', dropChance: 2000, value: '150.00' },
          { name: 'Platinum Card', description: 'Exclusive platinum membership', rarity: 'mythical', icon: 'fas fa-credit-card', dropChance: 2500, value: '300.00' }
        ]
      }
    ];
    
    for (const boxData of demoBoxes) {
      // Check if box already exists
      const existingBox = await db
        .select()
        .from(boxes)
        .where(eq(boxes.name, boxData.name))
        .limit(1);
      
      let boxId: number;
      
      if (existingBox.length === 0) {
        // Create new box
        const [newBox] = await db
          .insert(boxes)
          .values({
            name: boxData.name,
            description: boxData.description,
            price: boxData.price,
            rarity: boxData.rarity,
            imageUrl: boxData.imageUrl,
            featured: boxData.name === 'Premium Gold Box' || boxData.name === 'Luxury Designer Box'
          })
          .returning();
        
        boxId = newBox.id;
        console.log(`Created box: ${boxData.name} (ID: ${boxId})`);
        
        // Create items for this box
        for (const itemData of boxData.items) {
          await db
            .insert(items)
            .values({
              name: itemData.name,
              description: itemData.description,
              rarity: itemData.rarity,
              icon: itemData.icon,
              dropChance: itemData.dropChance,
              boxId: boxId,
              value: itemData.value
            });
        }
        console.log(`Created ${boxData.items.length} items for ${boxData.name}`);
      } else {
        boxId = existingBox[0].id;
        console.log(`Box already exists: ${boxData.name} (ID: ${boxId})`);
      }
      
      // Assign box to whitelabel if not already assigned
      const existingAssignment = await db
        .select()
        .from(whitelabelBoxes)
        .where(and(
          eq(whitelabelBoxes.whitelabelId, 'rollingdrop-demo'),
          eq(whitelabelBoxes.boxId, boxId)
        ))
        .limit(1);
      
      if (existingAssignment.length === 0) {
        await db
          .insert(whitelabelBoxes)
          .values({
            whitelabelId: 'rollingdrop-demo',
            boxId: boxId,
            enabled: true,
            featured: boxData.name === 'Premium Gold Box' || boxData.name === 'Luxury Designer Box',
            displayOrder: demoBoxes.indexOf(boxData)
          });
        console.log(`Assigned ${boxData.name} to RollingDrop Demo whitelabel`);
      }
    }
    
    console.log('RollingDrop Demo whitelabel initialization complete!');
    console.log('Login instructions: Use any username with password "demo"');
    
  } catch (error) {
    console.error('Error initializing RollingDrop Demo whitelabel:', error);
    throw error;
  }
}

// Auto-initialize on server start
initializeRollingDropDemo().catch(console.error);