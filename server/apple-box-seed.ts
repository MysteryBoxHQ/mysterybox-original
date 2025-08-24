import { db } from "./db";
import { boxes, items } from "@shared/schema";

export async function createAppleBox() {
  console.log("Creating Apple eBox Boosted...");

  // Create the Apple eBox Boosted
  const [appleBox] = await db
    .insert(boxes)
    .values({
      name: "Apple eBox Boosted",
      description: "Premium Apple ecosystem products featuring the latest iPhones, MacBooks, and accessories",
      price: "49.99",
      rarity: "legendary",
      imageUrl: "https://www.apple.com/newsroom/images/product/iphone/standard/Apple_iPhone-15-Pro_iPhone-15-Pro-Max_hero_230912.jpg.og.jpg",
      backgroundUrl: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png",
      featured: true,
    })
    .returning();

  // Apple products with authentic pricing and rarity based on value (22 items)
  const appleItems = [
    // Mythical (Ultra premium) - $1000+ (3 items)
    {
      name: "iPhone 15 Pro Max 1TB",
      description: "Ultimate iPhone with titanium design, A17 Pro chip, and Pro camera system",
      rarity: "mythical",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-blue-titanium-select?wid=470&hei=556&fmt=png-alpha&.v=1692845702919",
      dropChance: 40, // 0.4%
    },
    {
      name: "MacBook Pro 16-inch M3 Max 1TB",
      description: "Professional laptop with M3 Max chip for ultimate performance",
      rarity: "mythical",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202310?wid=470&hei=300&fmt=png-alpha&.v=1697230830200",
      dropChance: 25, // 0.25%
    },
    {
      name: "Mac Studio M2 Ultra",
      description: "Desktop powerhouse with M2 Ultra chip for professionals",
      rarity: "mythical",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-studio-hero-202306?wid=470&hei=556&fmt=png-alpha&.v=1683831648256",
      dropChance: 15, // 0.15%
    },

    // Legendary ($500-$999) (5 items)
    {
      name: "iPhone 15 Pro 512GB",
      description: "Pro iPhone with titanium design and advanced camera features",
      rarity: "legendary",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-blue-titanium-select?wid=470&hei=556&fmt=png-alpha&.v=1692845699311",
      dropChance: 180, // 1.8%
    },
    {
      name: "MacBook Air 15-inch M3 512GB",
      description: "Largest MacBook Air with M3 chip and all-day battery life",
      rarity: "legendary",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-midnight-select-202306?wid=470&hei=300&fmt=png-alpha&.v=1684340990674",
      dropChance: 200, // 2%
    },
    {
      name: "iPad Pro 12.9-inch M2 1TB",
      description: "Ultimate iPad with M2 chip and Liquid Retina XDR display",
      rarity: "legendary",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-wifi-spacegray-202210?wid=470&hei=556&fmt=png-alpha&.v=1664411207213",
      dropChance: 150, // 1.5%
    },
    {
      name: "Apple Vision Pro",
      description: "Revolutionary spatial computer with mixed reality experience",
      rarity: "legendary",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/apple-vision-pro-hero-230605?wid=470&hei=556&fmt=png-alpha&.v=1685726280477",
      dropChance: 80, // 0.8%
    },
    {
      name: "Mac mini M2 Pro",
      description: "Compact desktop with M2 Pro chip for demanding workflows",
      rarity: "legendary",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-mini-hero-202301?wid=470&hei=556&fmt=png-alpha&.v=1670038314207",
      dropChance: 220, // 2.2%
    },

    // Epic ($200-$499) (6 items)
    {
      name: "iPhone 15 256GB",
      description: "Latest iPhone with USB-C and improved camera system",
      rarity: "epic",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-blue-select-202309?wid=470&hei=556&fmt=png-alpha&.v=1692923779138",
      dropChance: 700, // 7%
    },
    {
      name: "iPad Air 11-inch M2 256GB",
      description: "Versatile iPad with M2 chip and stunning Liquid Retina display",
      rarity: "epic",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-11-select-wifi-blue-202405?wid=470&hei=556&fmt=png-alpha&.v=1713308272877",
      dropChance: 800, // 8%
    },
    {
      name: "Apple Watch Ultra 2",
      description: "Ultimate sports watch with titanium case and precision GPS",
      rarity: "epic",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra2-hero-select-202309?wid=470&hei=556&fmt=png-alpha&.v=1693516651015",
      dropChance: 600, // 6%
    },
    {
      name: "MacBook Air 13-inch M3 256GB",
      description: "Lightweight laptop with M3 chip and exceptional efficiency",
      rarity: "epic",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=470&hei=300&fmt=png-alpha&.v=1708367688034",
      dropChance: 900, // 9%
    },
    {
      name: "AirPods Pro 2nd Generation",
      description: "Premium wireless earbuds with adaptive transparency",
      rarity: "epic",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-pro-2-hero-select-202209?wid=470&hei=556&fmt=png-alpha&.v=1660927508379",
      dropChance: 1000, // 10%
    },
    {
      name: "Apple Studio Display",
      description: "27-inch 5K Retina display with advanced camera and audio",
      rarity: "epic",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/studio-display-hero-select-202203?wid=470&hei=556&fmt=png-alpha&.v=1645720949370",
      dropChance: 500, // 5%
    },

    // Rare ($100-$199) (4 items)
    {
      name: "iPhone 14 128GB",
      description: "Previous generation iPhone with excellent performance",
      rarity: "rare",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-blue-select-202209?wid=470&hei=556&fmt=png-alpha&.v=1660928317718",
      dropChance: 1400, // 14%
    },
    {
      name: "iPad 10th Generation 64GB",
      description: "Versatile iPad with A14 Bionic chip and colorful design",
      rarity: "rare",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-10th-gen-hero-select-wifi-blue-202210?wid=470&hei=556&fmt=png-alpha&.v=1664411136437",
      dropChance: 1600, // 16%
    },
    {
      name: "Apple Watch Series 9 45mm",
      description: "Advanced health and fitness tracking with S9 chip",
      rarity: "rare",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-hero-select-202309?wid=470&hei=556&fmt=png-alpha&.v=1693516651015",
      dropChance: 1200, // 12%
    },
    {
      name: "AirPods 3rd Generation",
      description: "Wireless earbuds with spatial audio and sweat resistance",
      rarity: "rare",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-3-hero-select-202110?wid=470&hei=556&fmt=png-alpha&.v=1631729068472",
      dropChance: 1800, // 18%
    },

    // Common ($25-$99) (4 items)
    {
      name: "Apple AirTag 4-Pack",
      description: "Precision finding device to locate your belongings",
      rarity: "common",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airtag-4pack-hero-select-202104?wid=470&hei=556&fmt=png-alpha&.v=1617148313635",
      dropChance: 1800, // 18%
    },
    {
      name: "Apple MagSafe Charger",
      description: "Wireless charger with magnetic alignment for iPhone",
      rarity: "common",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/magsafe-charger-hero-select-202010?wid=470&hei=556&fmt=png-alpha&.v=1601660717476",
      dropChance: 2000, // 20%
    },
    {
      name: "Apple Lightning to USB-C Cable",
      description: "High-quality cable for fast charging and data transfer",
      rarity: "common",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/lightning-usbc-cable-hero-select-202009?wid=470&hei=556&fmt=png-alpha&.v=1599080178000",
      dropChance: 1500, // 15%
    },
    {
      name: "Apple 20W USB-C Power Adapter",
      description: "Fast charging adapter for iPhone and iPad",
      rarity: "common",
      icon: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/20w-power-adapter-hero-select-202009?wid=470&hei=556&fmt=png-alpha&.v=1599080178000",
      dropChance: 1200, // 12%
    }
  ];

  // Insert all items
  const insertedItems = [];
  for (const itemData of appleItems) {
    const [item] = await db
      .insert(items)
      .values({
        ...itemData,
        boxId: appleBox.id,
      })
      .returning();
    insertedItems.push(item);
  }

  console.log(`Created Apple eBox Boosted with ${insertedItems.length} items`);
  return { box: appleBox, items: insertedItems };
}