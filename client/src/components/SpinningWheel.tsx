import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { getRarityClass, formatCurrency } from "@/lib/utils";
import type { Item } from "@shared/schema";

interface SpinningWheelProps {
  items: Item[];
  isSpinning: boolean;
  wonItem?: Item | null;
}

export default function SpinningWheel({ items, isSpinning, wonItem }: SpinningWheelProps) {
  const numSegments = Math.max(items.length, 6); // Minimum 6 segments for proper wheel
  const anglePerSegment = 360 / numSegments; // Full circle
  const radius = 280; // Increased size
  
  // Ensure we have enough items by duplicating if necessary
  const wheelItems = [...items];
  while (wheelItems.length < 6) {
    wheelItems.push(...items.slice(0, Math.min(items.length, 6 - wheelItems.length)));
  }
  
  // Calculate rotation angle to land on won item
  const getTargetRotation = () => {
    if (!wonItem || !isSpinning) return 0;
    
    const wonItemIndex = wheelItems.findIndex(item => item.id === wonItem.id);
    if (wonItemIndex === -1) return 1440; // Default: 4 full rotations
    
    // Calculate the angle to position the won item at the top center (pointer position)
    const baseRotation = 1800; // 5 full rotations for dramatic effect
    const segmentCenterAngle = wonItemIndex * anglePerSegment + (anglePerSegment / 2);
    const targetAngle = 90 - segmentCenterAngle; // Position segment center at top (90°)
    
    return baseRotation + targetAngle;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#6b7280',
      rare: '#10b981', 
      epic: '#8b5cf6',
      legendary: '#f59e0b',
      mythical: '#ef4444'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityGradient = (rarity: string) => {
    const gradients = {
      common: 'from-gray-600 to-gray-700',
      rare: 'from-emerald-500 to-emerald-600',
      epic: 'from-purple-500 to-purple-600', 
      legendary: 'from-amber-500 to-orange-500',
      mythical: 'from-red-500 to-pink-500'
    };
    return gradients[rarity as keyof typeof gradients] || gradients.common;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Wheel container */}
      <div className="relative w-full h-96 flex justify-center items-end">
        {/* Center pointer - positioned at top */}
        <div className="absolute top-0 left-1/2 z-30 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg" />
        </div>
        
        {/* Spinning wheel */}
        <motion.div
          className="relative"
          style={{ 
            width: radius * 2, 
            height: radius,
          }}
          animate={{
            rotate: isSpinning ? getTargetRotation() : 0
          }}
          transition={{
            duration: isSpinning ? 3.5 : 0,
            ease: isSpinning ? [0.23, 1, 0.320, 1] : "linear"
          }}
        >
          <svg 
            width={radius * 2} 
            height={radius}
            className="overflow-visible"
            viewBox={`0 0 ${radius * 2} ${radius}`}
          >
            <defs>
              {wheelItems.map((item, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={getRarityColor(item.rarity)} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={getRarityColor(item.rarity)} stopOpacity="0.7" />
                </linearGradient>
              ))}
            </defs>
            
            {/* Wheel segments */}
            {wheelItems.map((item, index) => {
              const startAngle = (index * anglePerSegment - 90) * Math.PI / 180; // Start from top
              const endAngle = ((index + 1) * anglePerSegment - 90) * Math.PI / 180;
              const midAngle = ((index * anglePerSegment + (index + 1) * anglePerSegment) / 2 - 90) * Math.PI / 180;
              
              // Only show upper half (semicircle)
              if (index * anglePerSegment >= 180) return null;
              
              const largeArcFlag = anglePerSegment > 180 ? 1 : 0;
              
              const x1 = radius + radius * Math.cos(startAngle);
              const y1 = radius + radius * Math.sin(startAngle);
              const x2 = radius + radius * Math.cos(endAngle);
              const y2 = radius + radius * Math.sin(endAngle);
              
              const pathData = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              const isWonItem = wonItem && item.id === wonItem.id;
              
              return (
                <g key={`${item.id}-${index}`}>
                  <path
                    d={pathData}
                    fill={`url(#gradient-${index})`}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    className={`transition-all duration-300 ${isWonItem ? 'drop-shadow-lg' : ''}`}
                  />
                  {isWonItem && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}
            
            {/* Item content */}
            {wheelItems.map((item, index) => {
              if (index * anglePerSegment >= 180) return null;
              
              const midAngle = ((index * anglePerSegment + (index + 1) * anglePerSegment) / 2 - 90) * Math.PI / 180;
              const contentDistance = radius * 0.7;
              const contentX = radius + contentDistance * Math.cos(midAngle);
              const contentY = radius + contentDistance * Math.sin(midAngle);
              
              return (
                <g key={`content-${item.id}-${index}`}>
                  <foreignObject 
                    x={contentX - 40} 
                    y={contentY - 35} 
                    width="80" 
                    height="70"
                    className="overflow-visible"
                  >
                    <div className="flex flex-col items-center text-center text-white">
                      <div className="text-xs font-bold uppercase mb-1">
                        {item.rarity}
                      </div>
                      <div className="w-12 h-12 mb-2 bg-black/40 rounded border border-white/30 flex items-center justify-center">
                        {item.icon ? (
                          <img 
                            src={item.icon} 
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="text-[10px] font-semibold leading-tight max-w-full">
                        {item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name}
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
          
          {/* Center hub */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-8 h-8 bg-gray-800 rounded-full border-4 border-yellow-400 shadow-lg"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}