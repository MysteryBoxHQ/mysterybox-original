import { db } from "./db";
import { boxes, items } from "@shared/schema";

async function quickSeed() {
  try {
    console.log("Starting quick seed...");
    
    // Clear existing data
    await db.delete(items);
    await db.delete(boxes);
    
    // Insert boxes with cases.gg style case artwork
    const boxData = [
      {
        name: "Aquatic Arcana",
        description: "Dive into this underwater-themed collection featuring rare aquatic items.",
        price: "3.43",
        rarity: "common",
        imageUrl: "https://cases.gg/_next/image?url=https%3A%2F%2Fimg.clash.gg%2Fstandard%2F7895daed7b8db623baca597ea6b172b3.png&w=256&q=75"
      },
      {
        name: "5 Finger Discount",
        description: "Street-smart collection with urban essentials and rare finds.",
        price: "6.92",
        rarity: "rare",
        imageUrl: "https://cases.gg/_next/image?url=https%3A%2F%2Fimg.clash.gg%2Fstandard%2Fed4ab6ec04794d22681737e111f8a92a.png&w=256&q=75"
      },
      {
        name: "Redcap Ruckus",
        description: "Action-packed collection featuring combat gear and tactical items.",
        price: "4.36", 
        rarity: "common",
        imageUrl: "https://cases.gg/_next/image?url=https%3A%2F%2Fimg.clash.gg%2Fcases%2Fa2abebabcd4d515a61e9219e38cb722e.png&w=256&q=75"
      },
      {
        name: "Battle of the Planes",
        description: "Epic aviation collection with legendary aircraft and pilot gear.",
        price: "29.89",
        rarity: "epic", 
        imageUrl: "https://cases.gg/_next/image?url=https%3A%2F%2Fimg.clash.gg%2Fstandard%2Fe2df3afaa7da513d6f4e964d026e43aa.png&w=256&q=75"
      },
      {
        name: "Celestial Guardian",
        description: "Mystical space collection featuring cosmic artifacts and stellar items.",
        price: "62.09",
        rarity: "legendary",
        imageUrl: "https://cases.gg/_next/image?url=https%3A%2F%2Fimg.clash.gg%2Fstandard%2F4b078abd93d526dddac6b2aec2100031.png&w=256&q=75"
      },
      {
        name: "Higround Gaming",
        description: "Premium gaming peripherals and esports merchandise collection.",
        price: "78.44",
        rarity: "legendary",
        imageUrl: "https://cases.gg/_next/image?url=https%3A%2F%2Fimg.clash.gg%2Fcases%2F05826da7e219d5793664cb9f9da8170a.png&w=256&q=75"
      },
      {
        name: "Supreme Vault",
        description: "Exclusive streetwear drops from Supreme's most sought-after releases.",
        price: "124.99",
        rarity: "mythical",
        imageUrl: "https://cases.gg/_next/image?url=https%3A%2F%2Fimg.clash.gg%2Fstandard%2Ff4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9.png&w=256&q=75"
      },
      {
        name: "Luxury Hypebeast",
        description: "Ultra-rare designer items and limited edition luxury collaborations.",
        price: "299.99",
        rarity: "mythical",
        imageUrl: "https://cases.gg/_next/image?url=https%3A%2F%2Fimg.clash.gg%2Fstandard%2Fa3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8.png&w=256&q=75"
      }
    ];
    
    const insertedBoxes = await db.insert(boxes).values(boxData).returning();
    console.log(`Created ${insertedBoxes.length} boxes`);
    
    // Insert items matching cases.gg style collections
    const itemData = [
      // Aquatic Arcana items
      { name: "Deep Sea Diving Helmet", description: "Vintage brass diving helmet from the ocean depths.", rarity: "common", icon: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 4000, boxId: insertedBoxes[0].id },
      { name: "Coral Reef Necklace", description: "Beautiful coral necklace with ocean pearls.", rarity: "rare", icon: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 2500, boxId: insertedBoxes[0].id },
      { name: "Neptune's Trident", description: "Legendary trident of the sea god Neptune.", rarity: "mythical", icon: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 300, boxId: insertedBoxes[0].id },
      
      // 5 Finger Discount items
      { name: "Urban Graffiti Sneakers", description: "Street art inspired limited edition sneakers.", rarity: "rare", icon: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 3000, boxId: insertedBoxes[1].id },
      { name: "Underground Hip-Hop Vinyl", description: "Rare vinyl record from underground hip-hop scene.", rarity: "epic", icon: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 1500, boxId: insertedBoxes[1].id },
      
      // Redcap Ruckus items
      { name: "Combat Tactical Vest", description: "Military grade tactical vest with multiple pouches.", rarity: "common", icon: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 3500, boxId: insertedBoxes[2].id },
      { name: "Red Beret Special Forces", description: "Elite red beret worn by special forces.", rarity: "epic", icon: "https://images.unsplash.com/photo-1521369909029-2afed882baee?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 1200, boxId: insertedBoxes[2].id },
      
      // Battle of the Planes items
      { name: "Vintage Fighter Pilot Helmet", description: "WWII era fighter pilot leather helmet.", rarity: "epic", icon: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 2000, boxId: insertedBoxes[3].id },
      { name: "Spitfire Model Aircraft", description: "Detailed scale model of legendary Spitfire fighter.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 800, boxId: insertedBoxes[3].id },
      
      // Celestial Guardian items
      { name: "Galaxy Crystal Orb", description: "Mystical crystal containing swirling galaxies.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 1000, boxId: insertedBoxes[4].id },
      { name: "Cosmic Guardian Armor", description: "Ancient armor blessed by celestial beings.", rarity: "mythical", icon: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 300, boxId: insertedBoxes[4].id },
      
      // Higround Gaming items
      { name: "RGB Gaming Keyboard", description: "Professional mechanical keyboard with RGB lighting.", rarity: "epic", icon: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 1800, boxId: insertedBoxes[5].id },
      { name: "Pro Gamer Headset", description: "Tournament-grade gaming headset with noise cancellation.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 900, boxId: insertedBoxes[5].id },
      
      // Supreme Vault items
      { name: "Supreme Box Logo Hoodie", description: "Iconic red box logo hoodie from Supreme's vault.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1556821840-3a9a2231b41a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 1200, boxId: insertedBoxes[6].id },
      { name: "Supreme x Louis Vuitton Bag", description: "Ultra-rare collaboration bag between Supreme and LV.", rarity: "mythical", icon: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 200, boxId: insertedBoxes[6].id },
      
      // Luxury Hypebeast items
      { name: "Off-White Industrial Belt", description: "Iconic yellow industrial belt by Virgil Abloh.", rarity: "epic", icon: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 1500, boxId: insertedBoxes[7].id },
      { name: "Dior x Jordan 1 High", description: "Limited edition collaboration sneakers.", rarity: "legendary", icon: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 800, boxId: insertedBoxes[7].id },
      { name: "Hermès Birkin 25", description: "Ultra-exclusive handbag, the holy grail of luxury.", rarity: "mythical", icon: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", dropChance: 150, boxId: insertedBoxes[7].id }
    ];
    
    const insertedItems = await db.insert(items).values(itemData).returning();
    console.log(`Created ${insertedItems.length} items`);
    
    console.log("Quick seed completed successfully!");
    
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  }
}

quickSeed().catch(console.error);