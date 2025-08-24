import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Ban, CheckCircle, Users, Search, ShoppingCart, UserCheck, DollarSign, CreditCard } from "lucide-react";

export default function PlayerManagement() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('players');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Set the correct tab based on the URL
  useEffect(() => {
    const path = location || window.location.pathname;
    if (path.includes('/orders')) {
      setActiveTab('orders');
    } else if (path.includes('/approve-orders')) {
      setActiveTab('approve-orders');
    } else if (path.includes('/transactions')) {
      setActiveTab('transactions');
    } else if (path.includes('/deposits')) {
      setActiveTab('deposits');
    } else if (path.includes('/players')) {
      setActiveTab('players');
    }
  }, [location]);

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["/api/admin/players"],
  });

  const { data: playerStats = {} } = useQuery({
    queryKey: ["/api/admin/player-stats"],
  });

  // Shipping orders query for orders tab
  const { data: shippingOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/shipping/orders"],
    enabled: activeTab === 'orders',
  });

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/admin/players/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Player updated successfully" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update player", variant: "destructive" });
    },
  });

  const banPlayerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/players/${id}/ban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Player banned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to ban player", variant: "destructive" });
    },
  });

  const unbanPlayerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/players/${id}/unban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Player unbanned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to unban player", variant: "destructive" });
    },
  });

  const filteredPlayers = players.filter((player: any) => {
    const matchesSearch = player.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || player.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (formData: FormData) => {
    const playerData = {
      username: formData.get("username"),
      email: formData.get("email"),
      usdBalance: formData.get("usdBalance"),
      goldCoins: parseInt(formData.get("goldCoins") as string),
      status: formData.get("status"),
    };

    updatePlayerMutation.mutate({ id: selectedPlayer.id, ...playerData });
  };

  const renderPlayersContent = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{playerStats.totalPlayers || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{playerStats.activeToday || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Verified Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{playerStats.verifiedPlayers || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Banned Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{playerStats.bannedPlayers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Players Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Username</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Email Status</TableHead>
                  <TableHead className="text-gray-300">ID Status</TableHead>
                  <TableHead className="text-gray-300">Account Status</TableHead>
                  <TableHead className="text-gray-300">USD Balance</TableHead>
                  <TableHead className="text-gray-300">Gold Coins</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400">
                      Loading players...
                    </TableCell>
                  </TableRow>
                ) : filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400">
                      No players found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player: any) => (
                    <TableRow key={player.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{player.username}</TableCell>
                      <TableCell className="text-gray-300">{player.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            player.emailVerified ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'
                          }
                        >
                          {player.emailVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            player.idVerified ? 'text-green-400 border-green-400' : 'text-orange-400 border-orange-400'
                          }
                        >
                          {player.idVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            player.status === 'active' ? 'text-green-400 border-green-400' :
                            player.status === 'suspended' ? 'text-orange-400 border-orange-400' :
                            'text-red-400 border-red-400'
                          }
                        >
                          {player.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">${player.usdBalance}</TableCell>
                      <TableCell className="text-yellow-400">{player.goldCoins}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(player);
                              setDialogOpen(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {player.status === 'banned' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unbanPlayerMutation.mutate(player.id)}
                              className="text-green-400 hover:text-green-300 hover:bg-gray-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => banPlayerMutation.mutate(player.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* Edit Player Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Player</DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <form action={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={selectedPlayer.username || ""}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  defaultValue={selectedPlayer.email || ""}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="usdBalance" className="text-gray-300">USD Balance</Label>
                <Input
                  id="usdBalance"
                  name="usdBalance"
                  type="number"
                  step="0.01"
                  defaultValue={selectedPlayer.usdBalance || "0.00"}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="goldCoins" className="text-gray-300">Gold Coins</Label>
                <Input
                  id="goldCoins"
                  name="goldCoins"
                  type="number"
                  defaultValue={selectedPlayer.goldCoins || 0}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={selectedPlayer.status || "active"}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Update Player
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderOrdersContent = () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-yellow-500';
        case 'processing': return 'bg-blue-500';
        case 'shipped': return 'bg-purple-500';
        case 'delivered': return 'bg-green-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    };

    if (ordersLoading) {
      return (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-1/4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Shipping Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          {shippingOrders && shippingOrders.length > 0 ? (
            <div className="space-y-4">
              {shippingOrders.map((order: any) => (
                <div key={order.id} className="p-4 border border-gray-600 rounded-lg bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-white font-semibold">Order #{order.id}</h3>
                        <p className="text-gray-400 text-sm">
                          User ID: {order.userId} • Created: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Cost: ${order.shippingCost}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      {order.trackingNumber && (
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Tracking:</p>
                          <p className="text-sm text-white">{order.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No shipping orders found</p>
              <p className="text-gray-500 text-sm">Orders will appear here when users request physical shipping</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderApproveOrdersContent = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Approve Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Order approval functionality will be implemented here.</p>
      </CardContent>
    </Card>
  );

  const renderTransactionsContent = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Transaction management functionality will be implemented here.</p>
      </CardContent>
    </Card>
  );

  const renderDepositsContent = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Deposits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Deposit management functionality will be implemented here.</p>
      </CardContent>
    </Card>
  );



  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="players" className="data-[state=active]:bg-orange-600">
            <Users className="w-4 h-4 mr-2" />
            Players
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-orange-600">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="approve-orders" className="data-[state=active]:bg-orange-600">
            <UserCheck className="w-4 h-4 mr-2" />
            Approve Orders
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-orange-600">
            <DollarSign className="w-4 h-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="deposits" className="data-[state=active]:bg-orange-600">
            <CreditCard className="w-4 h-4 mr-2" />
            Deposits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
          {renderPlayersContent()}
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          {renderOrdersContent()}
        </TabsContent>
        
        <TabsContent value="approve-orders" className="space-y-4">
          {renderApproveOrdersContent()}
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          {renderTransactionsContent()}
        </TabsContent>
        
        <TabsContent value="deposits" className="space-y-4">
          {renderDepositsContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}