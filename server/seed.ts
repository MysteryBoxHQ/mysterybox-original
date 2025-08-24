import { db } from "./db";
import { users, boxes, items, userItems } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Create boxes with working image URLs
  const boxesData = [
    {
      name: "Redcap Ruckus",
      description: "Dive into this action-packed collection featuring the finest gear.",
      price: "4.99",
      rarity: "common",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      name: "Supreme Collection",
      description: "Exclusive streetwear drops from Supreme's most coveted releases.",
      price: "9.99",
      rarity: "rare",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a9a2231b41a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      name: "Luxury Fashion Case",
      description: "High-end designer items from Louis Vuitton, Dior, and Chanel.",
      price: "24.99",
      rarity: "epic",
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      name: "Lamborghini Collection",
      description: "Iconic Italian supercars from Lamborghini's prestigious lineup.",
      price: "49.99",
      rarity: "legendary",
      imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      name: "Ferrari Ultimate",
      description: "Legendary racing heritage and Italian excellence from Ferrari.",
      price: "99.99",
      rarity: "mythical",
      imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      name: "Hypebeast Essentials",
      description: "The ultimate streetwear collection with rare drops and limited editions.",
      price: "14.99",
      rarity: "rare",
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      name: "Tech Gadgets Pro",
      description: "Latest technology and gadgets from top brands worldwide.",
      price: "19.99",
      rarity: "epic",
      imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      name: "Rolex Timepieces",
      description: "Luxury Swiss watches from the most prestigious watchmaker.",
      price: "199.99",
      rarity: "mythical",
      imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    }
  ];

  const insertedBoxes = await db.insert(boxes).values(boxesData).returning();

  // Create items for each box with proper images
  const itemsData = [
    // Redcap Ruckus items (box ID 1)
    { name: "Red Baseball Cap", description: "Classic red cap with vintage styling.", rarity: "common", icon: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop", dropChance: 4000, boxId: insertedBoxes[0].id },
    { name: "Canvas Backpack", description: "Durable canvas backpack for everyday use.", rarity: "common", icon: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", dropChance: 3500, boxId: insertedBoxes[0].id },
    { name: "Leather Wallet", description: "Premium leather bifold wallet.", rarity: "rare", icon: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop", dropChance: 2000, boxId: insertedBoxes[0].id },
    { name: "Vintage Watch", description: "Classic timepiece with leather strap.", rarity: "epic", icon: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop", dropChance: 500, boxId: insertedBoxes[0].id },

    // Supreme Collection items (box ID 2)
    { name: "Supreme Box Logo Hoodie", description: "Iconic red box logo hoodie from Supreme.", rarity: "rare", icon: "https://images.unsplash.com/photo-1556821840-3a9a2231b41a?w=400&h=400&fit=crop", dropChance: 3000, boxId: insertedBoxes[1].id },
    { name: "Supreme Skateboard Deck", description: "Limited edition skateboard deck.", rarity: "epic", icon: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop", dropChance: 2500, boxId: insertedBoxes[1].id },
    { name: "Supreme Air Force 1", description: "Collaboration sneakers with Nike.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop", dropChance: 500, boxId: insertedBoxes[1].id },

    // Luxury Fashion items (box ID 3)
    { name: "Louis Vuitton Monogram Bag", description: "Classic LV monogram canvas handbag.", rarity: "epic", icon: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop", dropChance: 2000, boxId: insertedBoxes[2].id },
    { name: "Dior Saddle Bag", description: "Iconic curved saddle bag from Dior.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", dropChance: 800, boxId: insertedBoxes[2].id },
    { name: "Chanel Classic Flap", description: "Timeless quilted leather bag with chain.", rarity: "mythical", icon: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop", dropChance: 200, boxId: insertedBoxes[2].id },

    // Lamborghini items (box ID 4)
    { name: "Lamborghini Huracán", description: "V10 mid-engine supercar with aggressive styling.", rarity: "epic", icon: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop", dropChance: 3000, boxId: insertedBoxes[3].id },
    { name: "Lamborghini Aventador", description: "Flagship V12 supercar with scissor doors.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop", dropChance: 1000, boxId: insertedBoxes[3].id },

    // Ferrari items (box ID 5)
    { name: "Ferrari 488 GTB", description: "Twin-turbo V8 masterpiece with racing DNA.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=400&fit=crop", dropChance: 2000, boxId: insertedBoxes[4].id },
    { name: "Ferrari LaFerrari", description: "Hybrid hypercar representing Ferrari's pinnacle.", rarity: "mythical", icon: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=400&fit=crop", dropChance: 500, boxId: insertedBoxes[4].id },

    // Hypebeast Essentials items (box ID 6)
    { name: "Off-White Belt", description: "Industrial belt with signature branding.", rarity: "rare", icon: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", dropChance: 3000, boxId: insertedBoxes[5].id },
    { name: "Yeezy Boost 350", description: "Adidas collaboration with Kanye West.", rarity: "epic", icon: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop", dropChance: 2000, boxId: insertedBoxes[5].id },
    { name: "Travis Scott Jordan 1", description: "Limited collaboration sneaker.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop", dropChance: 500, boxId: insertedBoxes[5].id },

    // Tech Gadgets Pro items (box ID 7)
    { name: "iPhone 15 Pro Max", description: "Latest Apple flagship smartphone.", rarity: "epic", icon: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop", dropChance: 2500, boxId: insertedBoxes[6].id },
    { name: "MacBook Pro M3", description: "Apple's most powerful laptop.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop", dropChance: 1000, boxId: insertedBoxes[6].id },
    { name: "Sony PlayStation 5", description: "Next-gen gaming console.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop", dropChance: 800, boxId: insertedBoxes[6].id },

    // Rolex Timepieces items (box ID 8)
    { name: "Rolex Submariner", description: "Iconic diving watch in stainless steel.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop", dropChance: 2000, boxId: insertedBoxes[7].id },
    { name: "Rolex Daytona", description: "Racing chronograph watch.", rarity: "mythical", icon: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop", dropChance: 300, boxId: insertedBoxes[7].id },
    { name: "Rolex GMT-Master II", description: "Dual time zone luxury watch.", rarity: "mythical", icon: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop", dropChance: 200, boxId: insertedBoxes[7].id },
  ];

  await db.insert(items).values(itemsData);

  console.log("Database seeded successfully!");
  console.log(`Created ${insertedBoxes.length} boxes`);
  console.log(`Created ${itemsData.length} items`);
}

seed().catch(console.error);