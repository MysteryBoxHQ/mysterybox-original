import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Sword, Trophy, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BattlePlayersModule() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState(null);

  const { data: battles = [], isLoading } = useQuery({
    queryKey: ["/api/admin/battles"],
  });

  const { data: battleStats = {} } = useQuery({
    queryKey: ["/api/admin/battle-stats"],
  });

  const createBattleMutation = useMutation({
    mutationFn: (battleData: any) => apiRequest("POST", "/api/admin/battles", battleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      toast({ title: "Battle created successfully" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create battle", variant: "destructive" });
    },
  });

  const updateBattleMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/admin/battles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      toast({ title: "Battle updated successfully" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update battle", variant: "destructive" });
    },
  });

  const deleteBattleMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/battles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/battles"] });
      toast({ title: "Battle deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete battle", variant: "destructive" });
    },
  });

  const filteredBattles = battles.filter((battle: any) => {
    const matchesSearch = battle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         battle.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || battle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (formData: FormData) => {
    const battleData = {
      name: formData.get("name"),
      description: formData.get("description"),
      maxPlayers: parseInt(formData.get("maxPlayers") as string),
      entryFee: parseFloat(formData.get("entryFee") as string),
      prizePool: parseFloat(formData.get("prizePool") as string),
      duration: parseInt(formData.get("duration") as string),
      status: formData.get("status"),
      rules: formData.get("rules"),
    };

    if (selectedBattle) {
      updateBattleMutation.mutate({ id: selectedBattle.id, ...battleData });
    } else {
      createBattleMutation.mutate(battleData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Battle Players</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => setSelectedBattle(null)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Battle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedBattle ? "Edit Battle" : "Create New Battle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Battle Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedBattle?.name || ""}
                    className="bg-gray-700 border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxPlayers">Max Players</Label>
                  <Select name="maxPlayers" defaultValue={selectedBattle?.maxPlayers?.toString() || "2"}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700">
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                      <SelectItem value="8">8 Players</SelectItem>
                      <SelectItem value="16">16 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entryFee">Entry Fee ($)</Label>
                  <Input
                    id="entryFee"
                    name="entryFee"
                    type="number"
                    step="0.01"
                    defaultValue={selectedBattle?.entryFee || ""}
                    className="bg-gray-700 border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prizePool">Prize Pool ($)</Label>
                  <Input
                    id="prizePool"
                    name="prizePool"
                    type="number"
                    step="0.01"
                    defaultValue={selectedBattle?.prizePool || ""}
                    className="bg-gray-700 border-gray-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    defaultValue={selectedBattle?.duration || "30"}
                    className="bg-gray-700 border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedBattle?.status || "active"}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={selectedBattle?.description || ""}
                  className="bg-gray-700 border-gray-600"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="rules">Battle Rules</Label>
                <Textarea
                  id="rules"
                  name="rules"
                  defaultValue={selectedBattle?.rules || ""}
                  className="bg-gray-700 border-gray-600"
                  rows={4}
                  placeholder="Enter battle rules and conditions..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  {selectedBattle ? "Update" : "Create"} Battle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Battles</CardTitle>
            <Sword className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{battleStats.activeBattles || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Players</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{battleStats.totalPlayers || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Prize Pool</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${battleStats.totalPrizePool || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{battleStats.avgDuration || 0}m</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Battle Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search battles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white max-w-md"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Battles Table */}
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Battle Name</TableHead>
                  <TableHead className="text-gray-300">Players</TableHead>
                  <TableHead className="text-gray-300">Entry Fee</TableHead>
                  <TableHead className="text-gray-300">Prize Pool</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Duration</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400">
                      Loading battles...
                    </TableCell>
                  </TableRow>
                ) : filteredBattles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400">
                      No battles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBattles.map((battle: any) => (
                    <TableRow key={battle.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{battle.name}</TableCell>
                      <TableCell className="text-gray-300">{battle.currentPlayers || 0}/{battle.maxPlayers}</TableCell>
                      <TableCell className="text-gray-300">${battle.entryFee}</TableCell>
                      <TableCell className="text-gray-300">${battle.prizePool}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            battle.status === 'active' ? 'text-green-400 border-green-400' :
                            battle.status === 'pending' ? 'text-yellow-400 border-yellow-400' :
                            battle.status === 'completed' ? 'text-blue-400 border-blue-400' :
                            'text-red-400 border-red-400'
                          }
                        >
                          {battle.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{battle.duration}m</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBattle(battle);
                              setDialogOpen(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBattleMutation.mutate(battle.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}