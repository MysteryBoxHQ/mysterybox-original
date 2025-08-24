import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getRarityClass, getDynamicBoxBackground, getDynamicBoxBorder } from "@/lib/utils";
import { Package, Eye, Heart, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { Box, User } from "@shared/schema";

interface CaseCardProps {
  case: Box;
  onOpen: (caseId: number) => void;
  onPreview: (caseData: Box) => void;
  disabled?: boolean;
}

export default function CaseCard({ case: caseData, onOpen, onPreview, disabled = false }: CaseCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isFavorited, setIsFavorited] = useState(false);

  const rarityBg = getRarityClass(caseData.rarity, 'bg');
  const rarityBorder = getRarityClass(caseData.rarity, 'border');
  const rarityGlow = getRarityClass(caseData.rarity, 'glow');

  // Check if this case is favorited
  const { data: favorites } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch user data for balance checks
  const { data: userData } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (favorites && Array.isArray(favorites)) {
      setIsFavorited(favorites.some((fav: Box) => fav.id === caseData.id));
    }
  }, [favorites, caseData.id]);

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/${caseData.id}`);
      } else {
        await apiRequest("POST", `/api/favorites/${caseData.id}`);
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? 
          `${caseData.name} removed from your favorites` : 
          `${caseData.name} added to your favorites`,
      });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to favorites",
        variant: "destructive",
      });
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleOpenBox = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Navigate to box details/opening page where users can see items and choose demo or purchase
    setLocation(`/box-opening/${caseData.id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group pt-3"
    >
      <div className={`relative overflow-visible rounded-xl glass-effect border card-hover ${rarityBorder} ${rarityGlow}`}>
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Case Image */}
        <div className={`aspect-square overflow-hidden relative ${getDynamicBoxBackground(caseData.highestRarity || 'common')}`}>
          <img
            src={caseData.imageUrl}
            alt={caseData.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Featured Star Icon */}
          {caseData.featured && (
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-yellow-500 rounded-full p-1 shadow-lg animate-pulse">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            </div>
          )}
          
          {/* Floating rarity indicator and heart */}
          <div className="absolute top-4 right-2 flex flex-col gap-1 items-end">
            <Badge variant="outline" className={`${rarityBg} ${getRarityClass(caseData.rarity, 'text')} border-current backdrop-blur-sm font-bold animate-float text-xs px-1.5 py-0.5`}>
              {caseData.rarity.toUpperCase()}
            </Badge>
            
            {/* Favorites Heart Icon */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={toggleFavoriteMutation.isPending}
              className={`w-6 h-6 p-0 rounded-full backdrop-blur-sm transition-all duration-300 ${
                isFavorited 
                  ? 'bg-red-500/90 hover:bg-red-600/90 text-white' 
                  : 'bg-black/50 hover:bg-black/70 text-white/70 hover:text-white'
              }`}
            >
              <Heart 
                className={`w-3 h-3 transition-all duration-300 ${
                  isFavorited ? 'fill-current scale-110' : 'hover:scale-110'
                }`} 
              />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 relative z-10">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-card-foreground group-hover:text-primary transition-colors truncate flex-1 mr-1">
              {caseData.name}
            </h3>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs font-bold text-primary">
              {formatCurrency(caseData.price)}
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(caseData)}
                className="text-primary border-primary/30 hover:bg-primary/10 p-0.5 w-5 h-5"
              >
                <Eye className="w-2.5 h-2.5" />
              </Button>
              <Button
                onClick={handleOpenBox}
                disabled={disabled}
                size="sm"
                className="button-gradient text-white font-semibold px-1.5 py-0.5 text-xs"
              >
                <Package className="w-2.5 h-2.5 mr-0.5" />
                Open
              </Button>
            </div>
          </div>
        </div>

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
          boxShadow: `0 0 30px ${
            caseData.rarity === 'common' ? 'rgba(148, 163, 184, 0.5)' :
            caseData.rarity === 'rare' ? 'rgba(22, 163, 74, 0.5)' :
            caseData.rarity === 'epic' ? 'rgba(139, 92, 246, 0.5)' :
            caseData.rarity === 'legendary' ? 'rgba(245, 158, 11, 0.5)' :
            'rgba(239, 68, 68, 0.5)'
          }`
        }} />
      </div>
    </motion.div>
  );
}
