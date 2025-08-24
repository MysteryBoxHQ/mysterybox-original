import { db } from './db';
import { boxes, items } from '../shared/schema';

async function seedBoxes() {
  console.log('Starting box seeding...');

  try {
    // Create sample boxes
    const sampleBoxes = [
      {
        name: 'Classic Mystery Box',
        description: 'A classic box with everyday items and surprises',
        price: '9.99',
        rarity: 'common',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        backgroundUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
        featured: false
      },
      {
        name: 'Premium Gold Box',
        description: 'Premium box with high-value items and rare collectibles',
        price: '24.99',
        rarity: 'rare',
        imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
        backgroundUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        featured: true
      },
      {
        name: 'Tech Gadget Box',
        description: 'Latest tech gadgets and electronic accessories',
        price: '19.99',
        rarity: 'uncommon',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        backgroundUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
        featured: false
      },
      {
        name: 'Luxury Diamond Box',
        description: 'Ultra-rare luxury items and exclusive collectibles',
        price: '99.99',
        rarity: 'legendary',
        imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        backgroundUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        featured: true
      },
      {
        name: 'Gaming Box',
        description: 'Gaming accessories and digital items for gamers',
        price: '14.99',
        rarity: 'uncommon',
        imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400',
        backgroundUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
        featured: false
      }
    ];

    const createdBoxes = await db.insert(boxes).values(sampleBoxes).returning();
    console.log(`Created ${createdBoxes.length} boxes`);

    // Create sample items for each box
    for (const box of createdBoxes) {
      const sampleItems = [
        {
          name: `${box.name} Common Item`,
          boxId: box.id,
          description: `A common item from ${box.name}`,
          dropChance: 40,
          rarity: 'common',
          icon: '💎',
          value: '5.00'
        },
        {
          name: `${box.name} Rare Item`,
          boxId: box.id,
          description: `A rare item from ${box.name}`,
          dropChance: 15,
          rarity: 'rare',
          icon: '🏆',
          value: '25.00'
        },
        {
          name: `${box.name} Epic Item`,
          boxId: box.id,
          description: `An epic item from ${box.name}`,
          dropChance: 5,
          rarity: 'epic',
          icon: '⭐',
          value: '50.00'
        }
      ];

      await db.insert(items).values(sampleItems);
      console.log(`Created items for ${box.name}`);
    }

    console.log('Box seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding boxes:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBoxes().then(() => process.exit(0));
}

export { seedBoxes };