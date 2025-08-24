import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Package, 
  Gem, 
  Star, 
  Target,
  Save,
  Eye,
  Settings,
  CheckCircle
} from "lucide-react";

interface BoxManagementProps {
  partner: any;
  onConfigUpdate?: () => void;
}

export function BoxManagement({ partner, onConfigUpdate }: BoxManagementProps) {
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available boxes
  const { data: allBoxes = [] } = useQuery({
    queryKey: ["/api/admin/boxes"],
  });

  // Fetch partner's assigned boxes
  const { data: partnerBoxes = [] } = useQuery({
    queryKey: [`/api/admin/partners/${partner?.id}/boxes`],
    enabled: !!partner?.id
  });

  const assignBoxesMutation = useMutation({
    mutationFn: async (boxIds: number[]) => {
      return apiRequest("POST", `/api/admin/partners/${partner.id}/assign-boxes`, { boxIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/partners/${partner.id}/boxes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/widget/data"] });
      onConfigUpdate?.();
      toast({
        title: "Box assignment updated",
        description: "Partner box configuration has been synchronized with widget",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating box assignment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      case 'mythical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const isBoxAssigned = (boxId: number) => {
    return partnerBoxes.some((box: any) => box.id === boxId);
  };

  const handleBoxToggle = (boxId: number) => {
    const currentAssigned = partnerBoxes.map((box: any) => box.id);
    const newAssigned = currentAssigned.includes(boxId)
      ? currentAssigned.filter(id => id !== boxId)
      : [...currentAssigned, boxId];
    
    assignBoxesMutation.mutate(newAssigned);
  };

  if (!partner) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Select a partner to manage box assignments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{partner.name} - Box Assignments</h3>
          <p className="text-sm text-muted-foreground">
            Select which mystery boxes are available in this partner's widget
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {partnerBoxes.length} of {allBoxes.length} boxes assigned
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBoxes.map((box: any) => {
          const isAssigned = isBoxAssigned(box.id);
          
          return (
            <Card key={box.id} className={`cursor-pointer transition-all hover:shadow-md ${
              isAssigned ? 'ring-2 ring-primary' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {box.name}
                      {isAssigned && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      ${box.price}
                    </CardDescription>
                  </div>
                  <Badge 
                    className={`text-xs text-white ${getRarityColor(box.rarity)}`}
                  >
                    {box.rarity || 'Common'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {box.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isAssigned}
                        onCheckedChange={() => handleBoxToggle(box.id)}
                        disabled={assignBoxesMutation.isPending}
                      />
                      <span className="text-sm">
                        {isAssigned ? 'Assigned' : 'Available'}
                      </span>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{box.name}</DialogTitle>
                          <DialogDescription>
                            Box details and item preview
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Description</h4>
                            <p className="text-sm text-muted-foreground">{box.description}</p>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Price: <strong>${box.price}</strong></span>
                            <span>Rarity: <strong>{box.rarity || 'Common'}</strong></span>
                          </div>
                          {box.items && box.items.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Possible Items ({box.items.length})</h4>
                              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {box.items.slice(0, 8).map((item: any, index: number) => (
                                  <div key={index} className="text-xs p-2 bg-muted rounded">
                                    {item.name}
                                  </div>
                                ))}
                                {box.items.length > 8 && (
                                  <div className="text-xs p-2 bg-muted rounded text-center text-muted-foreground">
                                    +{box.items.length - 8} more items
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allBoxes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No boxes available</h3>
            <p className="text-muted-foreground">
              Create mystery boxes in the main admin panel to assign them to partners.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}