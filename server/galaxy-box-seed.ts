import { db } from "./db";
import { boxes, items } from "@shared/schema";

export async function createGalaxyBox() {
  console.log("Creating Samsung Galaxy Mystery Box...");

  // Create the Samsung Galaxy Mystery Box
  const [galaxyBox] = await db
    .insert(boxes)
    .values({
      name: "Samsung Galaxy Mystery Box",
      description: "Discover premium Samsung Galaxy devices with cutting-edge technology and sleek designs",
      price: "29.99",
      rarity: "epic",
      imageUrl: "https://images.samsung.com/is/image/samsung/assets/us/smartphones/galaxy-s24/images/galaxy-s24-ultra_highlights_kv.jpg",
      backgroundUrl: "https://images.samsung.com/is/image/samsung/assets/global/about-us/brand/logo/300_186_4.png",
      featured: true,
    })
    .returning();

  // Samsung Galaxy products with authentic pricing and rarity based on value (22 items)
  const galaxyItems = [
    // Mythical (Ultra premium) - $1000+ (3 items)
    {
      name: "Samsung Galaxy S24 Ultra 1TB",
      description: "Premium flagship with S Pen, 200MP camera, and titanium build",
      rarity: "mythical",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2401/gallery/us-galaxy-s24-ultra-s928-sm-s928uzkeuse-thumb-539573039",
      dropChance: 50, // 0.5%
    },
    {
      name: "Samsung Galaxy Z Fold5 1TB",
      description: "Revolutionary foldable smartphone with multitasking prowess",
      rarity: "mythical", 
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2307/gallery/us-galaxy-z-fold5-f946-sm-f946uzkbxaa-thumb-537584854",
      dropChance: 30, // 0.3%
    },
    {
      name: "Samsung Galaxy Tab S9 Ultra 1TB",
      description: "Ultimate productivity tablet with S Pen and massive display",
      rarity: "mythical",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2307/gallery/us-galaxy-tab-s9-ultra-x910-sm-x910nzeexaa-thumb-537584392",
      dropChance: 20, // 0.2%
    },

    // Legendary ($500-$999) (5 items)
    {
      name: "Samsung Galaxy S24+ 512GB",
      description: "Advanced flagship with enhanced AI photography features",
      rarity: "legendary",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2401/gallery/us-galaxy-s24-plus-s926-sm-s926ulbexaa-thumb-539572930",
      dropChance: 200, // 2%
    },
    {
      name: "Samsung Galaxy Z Flip5 512GB", 
      description: "Compact foldable with improved hinge and cover screen",
      rarity: "legendary",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2307/gallery/us-galaxy-z-flip5-f731-sm-f731ulvbxaa-thumb-537584767",
      dropChance: 150, // 1.5%
    },
    {
      name: "Samsung Galaxy S23 Ultra 512GB",
      description: "Previous generation ultra with proven performance",
      rarity: "legendary", 
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2302/gallery/us-galaxy-s23-ultra-s918-sm-s918uzkdxaa-thumb-534207194",
      dropChance: 250, // 2.5%
    },
    {
      name: "Samsung Galaxy Tab S9+ 256GB",
      description: "Premium tablet with AMOLED display and S Pen",
      rarity: "legendary",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2307/gallery/us-galaxy-tab-s9-plus-x810-sm-x810nzeaxaa-thumb-537584344",
      dropChance: 180, // 1.8%
    },
    {
      name: "Samsung Galaxy Watch6 Classic 47mm",
      description: "Premium smartwatch with rotating bezel and advanced health tracking",
      rarity: "legendary",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2307/gallery/us-galaxy-watch6-classic-r960-sm-r960nzsaxaa-thumb-537584549",
      dropChance: 220, // 2.2%
    },

    // Epic ($200-$499) (6 items)
    {
      name: "Samsung Galaxy S24 256GB",
      description: "Latest flagship with AI-enhanced photography",
      rarity: "epic",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2401/gallery/us-galaxy-s24-s921-sm-s921uzkdxaa-thumb-539572862",
      dropChance: 800, // 8%
    },
    {
      name: "Samsung Galaxy A54 5G 256GB",
      description: "Premium mid-range with excellent camera system", 
      rarity: "epic",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2303/gallery/us-galaxy-a54-5g-a546-sm-a546ulvdxaa-thumb-535025866",
      dropChance: 1000, // 10%
    },
    {
      name: "Samsung Galaxy S23 256GB",
      description: "Compact flagship with flagship-grade performance",
      rarity: "epic",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2302/gallery/us-galaxy-s23-s911-sm-s911ulvdxaa-thumb-534206959",
      dropChance: 900, // 9%
    },
    {
      name: "Samsung Galaxy Tab S8 128GB",
      description: "Versatile tablet for work and entertainment",
      rarity: "epic",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2202/gallery/us-galaxy-tab-s8-x700-sm-x700nzeaxaa-thumb-530842158",
      dropChance: 700, // 7%
    },
    {
      name: "Samsung Galaxy Watch6 44mm",
      description: "Advanced smartwatch with comprehensive health monitoring",
      rarity: "epic",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2307/gallery/us-galaxy-watch6-r940-sm-r940nzkaxaa-thumb-537584501",
      dropChance: 600, // 6%
    },
    {
      name: "Samsung Galaxy Buds2 Pro",
      description: "Premium wireless earbuds with active noise cancellation",
      rarity: "epic",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2208/gallery/us-galaxy-buds2-pro-r510-sm-r510nzaaxaa-thumb-532607712",
      dropChance: 500, // 5%
    },

    // Rare ($100-$199) (4 items)
    {
      name: "Samsung Galaxy A34 5G 128GB",
      description: "Reliable mid-range smartphone with 5G connectivity",
      rarity: "rare",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2303/gallery/us-galaxy-a34-5g-a346-sm-a346ulggxaa-thumb-535025794",
      dropChance: 1500, // 15%
    },
    {
      name: "Samsung Galaxy A14 5G 64GB",
      description: "Essential smartphone with 5G and long battery life",
      rarity: "rare",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2301/gallery/us-galaxy-a14-5g-a146-sm-a146uzkdxaa-thumb-533376397",
      dropChance: 1800, // 18%
    },
    {
      name: "Samsung Galaxy Watch5 40mm",
      description: "Health-focused smartwatch with sleep tracking",
      rarity: "rare",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2208/gallery/us-galaxy-watch5-r910-sm-r910nzsaxaa-thumb-532607601",
      dropChance: 1200, // 12%
    },
    {
      name: "Samsung Galaxy Tab A8 64GB",
      description: "Affordable tablet for everyday entertainment",
      rarity: "rare",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2112/gallery/us-galaxy-tab-a8-x200-sm-x200nzaaxaa-thumb-529459971",
      dropChance: 1000, // 10%
    },

    // Common ($25-$99) (4 items)
    {
      name: "Samsung Galaxy Buds FE",
      description: "Essential wireless earbuds with great sound quality",
      rarity: "common",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2310/gallery/us-galaxy-buds-fe-r400-sm-r400nzaaxaa-thumb-538307986",
      dropChance: 2000, // 20%
    },
    {
      name: "Samsung Wireless Charger Duo",
      description: "Fast wireless charging pad for multiple devices",
      rarity: "common",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/ep-p5400tbegus/gallery/us-wireless-charger-duo-ep-p5400tbegus-531659312",
      dropChance: 1500, // 15%
    },
    {
      name: "Samsung 25W Super Fast Charger",
      description: "High-speed USB-C wall charger for Galaxy devices",
      rarity: "common",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/ep-ta800nbegus/gallery/us-25w-usb-c-super-fast-charging-wall-charger-ep-ta800nbegus-531659285",
      dropChance: 1800, // 18%
    },
    {
      name: "Samsung Galaxy SmartTag2",
      description: "Bluetooth tracker to find your lost items",
      rarity: "common",
      icon: "https://images.samsung.com/is/image/samsung/p6pim/us/2310/gallery/us-galaxy-smarttag2-ei-t5600-ei-t5600bbegus-thumb-538307938",
      dropChance: 1200, // 12%
    }
  ];

  // Insert all items
  const insertedItems = [];
  for (const itemData of galaxyItems) {
    const [item] = await db
      .insert(items)
      .values({
        ...itemData,
        boxId: galaxyBox.id,
      })
      .returning();
    insertedItems.push(item);
  }

  console.log(`Created Samsung Galaxy Mystery Box with ${insertedItems.length} items`);
  return { box: galaxyBox, items: insertedItems };
}