import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Ban, CheckCircle, Users, Search } from "lucide-react";

export default function PlayersOnlyModule() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["/api/admin/players"],
  });

  const { data: playerStats = {} } = useQuery({
    queryKey: ["/api/admin/player-stats"],
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", `/api/admin/players/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/player-stats"] });
      toast({
        title: "Success",
        description: "Player updated successfully",
      });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update player",
        variant: "destructive",
      });
    },
  });

  const filteredPlayers = players?.filter((player: any) => {
    const matchesSearch = !searchTerm || 
      player.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "verified" && player.isVerified) ||
      (statusFilter === "unverified" && !player.isVerified);
    return matchesSearch && matchesStatus;
  }) || [];

  const handleSubmit = (formData: FormData) => {
    const data = {
      id: selectedPlayer?.id,
      username: formData.get("username"),
      usdBalance: formData.get("usdBalance"),
      goldCoins: parseInt(formData.get("goldCoins") as string),
      isAdmin: formData.get("isAdmin") === "true",
    };
    updatePlayerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Player Management</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{playerStats.totalPlayers || 0}</div>
              <div className="text-sm text-white/70">Total Players</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{playerStats.activeToday || 0}</div>
              <div className="text-sm text-white/70">Active Today</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{playerStats.verifiedPlayers || 0}</div>
              <div className="text-sm text-white/70">Verified Players</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{playerStats.bannedPlayers || 0}</div>
              <div className="text-sm text-white/70">Banned Players</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Players</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-white">Username</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Email Status</TableHead>
                <TableHead className="text-white">ID Status</TableHead>
                <TableHead className="text-white">Account Status</TableHead>
                <TableHead className="text-white">USD Balance</TableHead>
                <TableHead className="text-white">Gold Coins</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers?.length > 0 ? (
                filteredPlayers.map((player: any) => (
                  <TableRow key={player.id} className="border-gray-700 hover:bg-gray-800">
                    <TableCell className="text-white">{player.username}</TableCell>
                    <TableCell className="text-white">{player.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={player.emailVerified ? "default" : "destructive"}>
                        {player.emailVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={player.idVerified ? "default" : "secondary"}>
                        {player.idVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={player.isBanned ? "destructive" : "default"}>
                        {player.isBanned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">${player.usdBalance}</TableCell>
                    <TableCell className="text-white">{player.goldCoins}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={dialogOpen && selectedPlayer?.id === player.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (open) setSelectedPlayer(player);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-800 border-gray-700 text-white">
                            <DialogHeader>
                              <DialogTitle>Edit Player</DialogTitle>
                              <DialogDescription>
                                Update player information and settings.
                              </DialogDescription>
                            </DialogHeader>
                            <form action={handleSubmit} className="space-y-4">
                              <div>
                                <Label htmlFor="username">Username</Label>
                                <Input
                                  id="username"
                                  name="username"
                                  defaultValue={selectedPlayer?.username}
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="usdBalance">USD Balance</Label>
                                <Input
                                  id="usdBalance"
                                  name="usdBalance"
                                  type="number"
                                  step="0.01"
                                  defaultValue={selectedPlayer?.usdBalance}
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="goldCoins">Gold Coins</Label>
                                <Input
                                  id="goldCoins"
                                  name="goldCoins"
                                  type="number"
                                  defaultValue={selectedPlayer?.goldCoins}
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor="isAdmin">Admin Status</Label>
                                <Select name="isAdmin" defaultValue={selectedPlayer?.isAdmin ? "true" : "false"}>
                                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="false">Regular User</SelectItem>
                                    <SelectItem value="true">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setDialogOpen(false)}
                                  className="border-gray-600 text-white hover:bg-gray-700"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={updatePlayerMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {updatePlayerMutation.isPending ? "Updating..." : "Update"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                    No players found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}