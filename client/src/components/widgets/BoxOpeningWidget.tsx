import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Play, Star, Gift } from "lucide-react";
import { motion } from "framer-motion";

interface BoxOpeningWidgetProps {
  apiKey?: string;
  theme?: 'light' | 'dark';
  compact?: boolean;
  maxBoxes?: number;
  onBoxOpened?: (result: any) => void;
  onError?: (error: string) => void;
}

interface Box {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rarity: string;
  items?: Item[];
}

interface Item {
  id: number;
  name: string;
  description: string;
  rarity: string;
  icon: string;
  value: string;
}

export function BoxOpeningWidget({ 
  apiKey, 
  theme = 'light', 
  compact = false,
  maxBoxes = 6,
  onBoxOpened,
  onError 
}: BoxOpeningWidgetProps) {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBoxes();
  }, [apiKey]);

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      // Use widget API endpoint
      const response = await fetch('/api/widget/data');
      const data = await response.json();
      setBoxes(data.boxes?.slice(0, compact ? 3 : maxBoxes) || []);
    } catch (error) {
      onError?.('Failed to load boxes');
      console.error('Failed to fetch boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBox = (boxId: number) => {
    // Navigate to the full box opening page - same for both iframe and whitelabel
    const url = `/box-opening/${boxId}`;
    
    // For iframe, we need to handle navigation differently
    if (window.parent !== window) {
      // We're in an iframe, post message to parent
      window.parent.postMessage({
        type: 'navigate',
        url: url
      }, '*');
    } else {
      // Direct navigation for whitelabel
      window.location.href = url;
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'from-gray-500 to-gray-600',
      rare: 'from-blue-500 to-blue-600',
      epic: 'from-purple-500 to-purple-600',
      legendary: 'from-orange-500 to-orange-600',
      mythical: 'from-red-500 to-red-600'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const themeClasses = theme === 'dark' 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
    : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900';

  const cardTheme = theme === 'dark' 
    ? 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-700/50' 
    : 'bg-white/50 hover:bg-gray-50/50 border-gray-200/50';

  if (loading) {
    return (
      <div className={`${themeClasses} min-h-screen p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-400" />
              <p className="text-xl font-semibold">Loading Mystery Boxes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeClasses} min-h-screen p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Mystery Boxes
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose your box and dive into the ultimate spinning experience with amazing prizes
          </p>
        </motion.div>

        {/* Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {boxes.map((box, index) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
              onClick={() => handleOpenBox(box.id)}
            >
              <Card className={`${cardTheme} cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-purple-400/50 backdrop-blur-sm relative overflow-hidden`}>
                {/* Rarity glow effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-br ${getRarityColor(box.rarity)}`} />
                
                <CardContent className="p-6 relative z-10">
                  {/* Box Image */}
                  <div className="relative mb-6">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                      <img 
                        src={box.imageUrl} 
                        alt={box.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    
                    {/* Floating sparkle */}
                    <div className="absolute -top-2 -right-2 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      ✨
                    </div>
                  </div>
                  
                  {/* Box Info */}
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                      {box.name}
                    </h3>
                    
                    {/* Rarity Badge */}
                    <Badge className={`px-4 py-2 text-sm font-bold uppercase border transition-all duration-300 ${
                      box.rarity === 'epic' ? 'bg-purple-600/80 text-purple-100 border-purple-400/50 group-hover:bg-purple-500 group-hover:shadow-lg group-hover:shadow-purple-500/50' :
                      box.rarity === 'rare' ? 'bg-blue-600/80 text-blue-100 border-blue-400/50 group-hover:bg-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/50' :
                      box.rarity === 'legendary' ? 'bg-orange-600/80 text-orange-100 border-orange-400/50 group-hover:bg-orange-500 group-hover:shadow-lg group-hover:shadow-orange-500/50' :
                      box.rarity === 'mythical' ? 'bg-red-600/80 text-red-100 border-red-400/50 group-hover:bg-red-500 group-hover:shadow-lg group-hover:shadow-red-500/50' :
                      'bg-gray-600/80 text-gray-100 border-gray-400/50 group-hover:bg-gray-500 group-hover:shadow-lg group-hover:shadow-gray-500/50'
                    }`}>
                      {box.rarity}
                    </Badge>
                    
                    {/* Price */}
                    <div className="text-3xl font-black text-green-400 mb-4">
                      ${box.price}
                    </div>
                    
                    {/* Open Button */}
                    <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-white/20 flex items-center justify-center gap-2">
                      <Play className="w-5 h-5" />
                      Open Box
                    </div>
                    
                    {/* Items Preview */}
                    {box.items && box.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-400 mb-2">Contains {box.items.length} items</p>
                        <div className="flex justify-center gap-1">
                          {box.items.slice(0, 4).map((item) => (
                            <div key={item.id} className="w-8 h-8 rounded bg-gray-700/50 border border-white/10 flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          ))}
                          {box.items.length > 4 && (
                            <div className="w-8 h-8 rounded bg-gray-700/50 border border-white/10 flex items-center justify-center">
                              <span className="text-xs text-gray-400">+{box.items.length - 4}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-400 mb-6">
            Ready to discover what's inside? Choose your mystery box and start spinning!
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span>Fair & Transparent</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Real Prizes</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span>Instant Results</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}