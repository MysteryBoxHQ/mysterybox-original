import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num);
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export const RARITY_COLORS = {
  common: {
    bg: "bg-gray-600",
    text: "text-gray-100", 
    border: "border-gray-500",
    glow: "shadow-lg shadow-gray-500/30",
    gradient: "bg-gradient-to-r from-gray-600 to-gray-700"
  },
  rare: {
    bg: "bg-green-600",
    text: "text-green-100",
    border: "border-green-500", 
    glow: "shadow-lg shadow-green-500/40",
    gradient: "bg-gradient-to-r from-green-600 to-green-700"
  },
  epic: {
    bg: "bg-purple-600",
    text: "text-purple-100",
    border: "border-purple-500",
    glow: "shadow-lg shadow-purple-500/50",
    gradient: "bg-gradient-to-r from-purple-600 to-purple-700"
  },
  legendary: {
    bg: "bg-orange-600", 
    text: "text-orange-100",
    border: "border-orange-500",
    glow: "shadow-lg shadow-orange-500/60",
    gradient: "bg-gradient-to-r from-orange-600 to-red-600"
  },
  mythical: {
    bg: "bg-red-600",
    text: "text-red-100", 
    border: "border-red-500",
    glow: "shadow-lg shadow-red-500/70",
    gradient: "bg-gradient-to-r from-red-600 to-pink-700"
  }
} as const;

export const RARITY_LABELS = {
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC", 
  legendary: "LEGENDARY",
  mythical: "MYTHICAL"
} as const;

export type RarityType = keyof typeof RARITY_COLORS;

export const getRarityClass = (rarity: string, type: 'bg' | 'text' | 'border' | 'glow' | 'gradient' = 'bg') => {
  const rarityKey = rarity.toLowerCase() as RarityType;
  const colors = RARITY_COLORS[rarityKey] || RARITY_COLORS.common;
  return colors[type];
};

// Rarity hierarchy for determining highest rarity
const RARITY_HIERARCHY = {
  'common': 1,
  'rare': 2,
  'epic': 3,
  'legendary': 4,
  'mythical': 5
} as const;

// Dynamic background gradients based on highest rarity
export const RARITY_BACKGROUND_GRADIENTS = {
  common: "bg-gradient-to-br from-slate-800/80 via-slate-700/60 to-slate-800/80",
  rare: "bg-gradient-to-br from-green-900/80 via-green-800/60 to-slate-800/80",
  epic: "bg-gradient-to-br from-purple-900/80 via-purple-800/60 to-slate-800/80",
  legendary: "bg-gradient-to-br from-orange-900/80 via-orange-800/60 to-slate-800/80",
  mythical: "bg-gradient-to-br from-red-900/80 via-red-800/60 to-slate-800/80"
} as const;

// Border glows for highest rarity
export const RARITY_BORDER_GLOWS = {
  common: "border-slate-600/50",
  rare: "border-green-500/50 shadow-lg shadow-green-500/20",
  epic: "border-purple-500/50 shadow-lg shadow-purple-500/30",
  legendary: "border-orange-500/50 shadow-lg shadow-orange-500/40",
  mythical: "border-red-500/50 shadow-lg shadow-red-500/50"
} as const;

export const getHighestRarity = (items: { rarity: string }[]): string => {
  if (!items || items.length === 0) return 'common';
  
  return items.reduce((highest, item) => {
    const itemRarity = item.rarity.toLowerCase();
    const highestRarity = highest.toLowerCase();
    
    if (RARITY_HIERARCHY[itemRarity as keyof typeof RARITY_HIERARCHY] > 
        RARITY_HIERARCHY[highestRarity as keyof typeof RARITY_HIERARCHY]) {
      return itemRarity;
    }
    return highest;
  }, 'common');
};

export const getDynamicBoxBackground = (highestRarity: string): string => {
  const rarity = highestRarity.toLowerCase() as keyof typeof RARITY_BACKGROUND_GRADIENTS;
  return RARITY_BACKGROUND_GRADIENTS[rarity] || RARITY_BACKGROUND_GRADIENTS.common;
};

export const getDynamicBoxBorder = (highestRarity: string): string => {
  const rarity = highestRarity.toLowerCase() as keyof typeof RARITY_BORDER_GLOWS;
  return RARITY_BORDER_GLOWS[rarity] || RARITY_BORDER_GLOWS.common;
};
