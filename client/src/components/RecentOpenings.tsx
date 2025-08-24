import { useQuery } from "@tanstack/react-query";
import { getRarityClass, RARITY_LABELS } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import type { RecentOpening } from "@shared/schema";

export default function RecentOpenings() {
  const { data: recentOpenings, isLoading } = useQuery<RecentOpening[]>({
    queryKey: ["/api/recent-openings"],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000, // Consider data fresh for 20 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });

  if (isLoading) {
    return (
      <>
        <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary" />
          Recent Openings
        </h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center gap-3">
        <Clock className="w-6 h-6 text-primary" />
        Recent Openings
      </h2>
      <div className="space-y-4">
        {recentOpenings?.map((opening) => (
          <div key={opening.id} className="glass-effect rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg ${getRarityClass(opening.itemRarity)} flex items-center justify-center`}>
                  <i className={`${opening.itemIcon} text-white text-sm`}></i>
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground text-sm">{opening.itemName}</h4>
                  <p className="text-xs text-muted-foreground">{opening.username}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded-full ${getRarityClass(opening.itemRarity)} text-xs font-semibold`}>
                  {RARITY_LABELS[opening.itemRarity as keyof typeof RARITY_LABELS]}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{opening.timeAgo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
