import { motion } from "framer-motion";
import { getRarityClass, RARITY_LABELS } from "@/lib/utils";
import type { UserItemWithItem } from "@shared/schema";

interface InventoryGridProps {
  items: UserItemWithItem[];
  showQuantity?: boolean;
  maxItems?: number;
  onItemClick?: (item: UserItemWithItem) => void;
}

// Rarity color mapping to match the design
const getRarityColors = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-500';
    case 'rare':
      return 'bg-green-500';
    case 'epic':
      return 'bg-purple-500';
    case 'legendary':
      return 'bg-orange-500';
    case 'mythical':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getRarityBadgeColors = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-600 text-gray-100';
    case 'rare':
      return 'bg-green-600 text-green-100';
    case 'epic':
      return 'bg-purple-600 text-purple-100';
    case 'legendary':
      return 'bg-orange-600 text-orange-100';
    case 'mythical':
      return 'bg-red-600 text-red-100';
    default:
      return 'bg-gray-600 text-gray-100';
  }
};

export default function InventoryGrid({ 
  items, 
  showQuantity = false, 
  maxItems,
  onItemClick 
}: InventoryGridProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
      {displayItems.map((userItem) => (
        <motion.div
          key={userItem.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => onItemClick?.(userItem)}
        >
          {/* Large colored square matching the design */}
          <div className={`w-24 h-24 md:w-28 md:h-28 rounded-lg ${getRarityColors(userItem.item.rarity)} relative flex items-center justify-center mb-2 hover:shadow-lg transition-all duration-300`}>
            <i className={`${userItem.item.icon} text-white text-2xl`}></i>
            {showQuantity && userItem.quantity > 1 && (
              <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-background">
                {userItem.quantity}
              </div>
            )}
          </div>
          
          {/* Item name */}
          <h4 className="text-sm font-medium text-center mb-1 truncate max-w-full text-foreground">
            {userItem.item.name}
          </h4>
          
          {/* Rarity badge */}
          <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${getRarityBadgeColors(userItem.item.rarity)}`}>
            {userItem.item.rarity}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
