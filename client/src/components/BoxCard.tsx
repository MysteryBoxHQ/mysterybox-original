import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getRarityClass } from "@/lib/utils";
import { Eye, Package } from "lucide-react";
import type { Box } from "@shared/schema";

interface BoxCardProps {
  box: Box;
  onOpen: (boxId: number) => void;
  onPreview: (boxData: Box) => void;
  disabled?: boolean;
}

export default function BoxCard({ box: boxData, onOpen, onPreview, disabled = false }: BoxCardProps) {
  return (
    <Card className={`glass-effect border-white/10 hover:border-white/20 transition-all duration-300 ${getRarityClass(boxData.rarity, 'border')}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={`${getRarityClass(boxData.rarity)} text-white border-0`}>
            {boxData.rarity.toUpperCase()}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(boxData)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
        <CardTitle className="text-lg">{boxData.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/10">
          <img 
            src={`/api/proxy-image?url=${encodeURIComponent(boxData.imageUrl)}`}
            alt={boxData.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.setAttribute('style', 'display: flex');
            }}
          />
          <div className="hidden w-full h-full items-center justify-center">
            <Package className="w-12 h-12 text-white/50" />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {boxData.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary">
            {formatCurrency(boxData.price)}
          </div>
          <Button
            onClick={() => onOpen(boxData.id)}
            disabled={disabled}
            className={`${getRarityClass(boxData.rarity, 'bg')} hover:opacity-90 text-white border-0`}
          >
            Open Box
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}