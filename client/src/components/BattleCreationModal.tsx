import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Settings, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BattleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBattle: (battleData: any) => void;
  isCreating: boolean;
}

interface Box {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

export function BattleCreationModal({ isOpen, onClose, onCreateBattle, isCreating }: BattleCreationModalProps) {
  const [gameMode, setGameMode] = useState<'normal' | 'group' | 'terminal' | 'jackpot'>('normal');
  const [teamSize, setTeamSize] = useState<'1v1' | '1v1v1' | '1v1v1v1' | '1v1v1v1v1v1v1' | '2v2' | '3v3'>('1v1');
  const [selectedBoxes, setSelectedBoxes] = useState<Box[]>([]);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'random'>('price_asc');
  const [fastSpin, setFastSpin] = useState(false);
  const [crazy, setCrazy] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  const { data: boxes = [] } = useQuery<Box[]>({
    queryKey: ["/api/boxes"],
  });

  const getPlayerCount = (size: string) => {
    switch (size) {
      case '1v1': return 2;
      case '1v1v1': return 3;
      case '1v1v1v1': return 4;
      case '1v1v1v1v1v1v1': return 7;
      case '2v2': return 4;
      case '3v3': return 6;
      default: return 2;
    }
  };

  const getGameModeDescription = (mode: string) => {
    switch (mode) {
      case 'normal': return 'The player with the highest total unboxed wins';
      case 'group': return 'The total unboxed is split by all players';
      case 'terminal': return 'Last unboxing determines the winner';
      case 'jackpot': return 'Winnings odds are based on value unboxed';
      default: return '';
    }
  };

  const addBox = (box: Box) => {
    if (selectedBoxes.some(b => b.id === box.id)) return;
    setSelectedBoxes([...selectedBoxes, box]);
  };

  const removeBox = (boxId: number) => {
    setSelectedBoxes(selectedBoxes.filter(b => b.id !== boxId));
  };

  const getSortedBoxes = () => {
    const sorted = [...boxes];
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price_desc':
        return sorted.sort((a, b) => Number(b.price) - Number(a.price));
      case 'random':
        return sorted.sort(() => Math.random() - 0.5);
      default:
        return sorted;
    }
  };

  useEffect(() => {
    const cost = selectedBoxes.reduce((sum, box) => sum + Number(box.price), 0);
    setTotalCost(cost);
  }, [selectedBoxes]);

  const handleCreateBattle = () => {
    if (selectedBoxes.length === 0) return;

    const battleData = {
      name: `${gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Battle`,
      boxIds: selectedBoxes.map(box => box.id),
      maxPlayers: getPlayerCount(teamSize),
      entryFee: totalCost,
      totalRounds: selectedBoxes.length,
      gameMode,
      teamSize,
      options: {
        fastSpin,
        crazy
      }
    };

    onCreateBattle(battleData);
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-white">Create Battle</DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Create</span>
                <span className="text-lg font-bold text-white">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Game Mode Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-300 mb-3 block">Select Gamemode</Label>
              <div className="grid grid-cols-4 gap-3">
                {['normal', 'group', 'terminal', 'jackpot'].map((mode) => (
                  <Card 
                    key={mode}
                    className={`cursor-pointer transition-all border-2 ${
                      gameMode === mode 
                        ? 'border-blue-500 bg-blue-500/20' 
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }`}
                    onClick={() => setGameMode(mode as any)}
                  >
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold text-white capitalize mb-2">{mode}</h3>
                      <p className="text-xs text-gray-400">{getGameModeDescription(mode)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Team Configuration */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-3 block">Play Solo</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['1v1', '1v1v1', '1v1v1v1', '1v1v1v1v1v1v1'].map((size) => (
                    <Button
                      key={size}
                      variant={teamSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTeamSize(size as any)}
                      className={teamSize === size ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 hover:border-gray-500"}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-300 mb-3 block">Play in a Team</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['2v2', '3v3'].map((size) => (
                    <Button
                      key={size}
                      variant={teamSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTeamSize(size as any)}
                      className={teamSize === size ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 hover:border-gray-500"}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Case Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium text-gray-300">Add / Reorder Cases</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortBy('price_asc')}
                    className={`text-xs ${sortBy === 'price_asc' ? 'text-blue-400' : 'text-gray-400'}`}
                  >
                    Price Ascending
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortBy('price_desc')}
                    className={`text-xs ${sortBy === 'price_desc' ? 'text-blue-400' : 'text-gray-400'}`}
                  >
                    Price Descending
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortBy('random')}
                    className={`text-xs ${sortBy === 'random' ? 'text-blue-400' : 'text-gray-400'}`}
                  >
                    Randomize
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBoxes([])}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>

              {/* Selected Cases */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 min-h-[80px] p-4 border-2 border-dashed border-gray-600 rounded-lg">
                  {selectedBoxes.length === 0 ? (
                    <div className="flex items-center justify-center w-full">
                      <div className="text-center">
                        <Plus className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">ADD CASE</p>
                      </div>
                    </div>
                  ) : (
                    selectedBoxes.map((box, index) => (
                      <div key={`${box.id}-${index}`} className="relative group">
                        <div className="w-20 h-20 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
                          <img 
                            src={box.imageUrl} 
                            alt={box.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeBox(box.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                        <div className="text-xs text-center mt-1 text-gray-400 truncate w-20">
                          ${Number(box.price).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Available Cases */}
              <div className="grid grid-cols-6 gap-3 max-h-60 overflow-y-auto">
                {getSortedBoxes().map((box) => (
                  <div 
                    key={box.id}
                    className={`cursor-pointer transition-all border rounded-lg overflow-hidden ${
                      selectedBoxes.some(b => b.id === box.id)
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }`}
                    onClick={() => addBox(box)}
                  >
                    <div className="aspect-square">
                      <img 
                        src={box.imageUrl} 
                        alt={box.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-white font-medium truncate">{box.name}</p>
                      <p className="text-xs text-gray-400">${Number(box.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <Label className="text-sm font-medium text-gray-300 mb-3 block">Additional Options</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={fastSpin}
                    onCheckedChange={setFastSpin}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <span className="text-sm text-gray-300">Fast Spin</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={crazy}
                    onCheckedChange={setCrazy}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <span className="text-sm text-gray-300">Crazy</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enhanced animations and effects</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400">
                  <Settings className="h-4 w-4 mr-1" />
                  Advanced Settings
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button variant="outline" onClick={onClose} className="border-gray-600 hover:border-gray-500">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateBattle}
                disabled={selectedBoxes.length === 0 || isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isCreating ? 'Creating...' : `Create Battle - $${totalCost.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}