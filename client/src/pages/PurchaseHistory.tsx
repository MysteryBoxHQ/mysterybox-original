import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, DollarSign, Gift } from "lucide-react";
import { format } from "date-fns";
import type { BoxOpening } from "@shared/schema";

export default function PurchaseHistory() {
  const [location] = useLocation();
  const isWhitelabelContext = location.startsWith('/rollingdrop');
  const whitelabelId = isWhitelabelContext ? 'rollingdrop' : null;
  const { data: purchases, isLoading } = useQuery({
    queryKey: ["/api/user/purchase-history"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-400 mt-4">Loading purchase history...</p>
          </div>
        </div>
      </div>
    );
  }

  const purchaseHistory = Array.isArray(purchases) ? purchases : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold cases-gradient-text">Purchase History</h1>
          <p className="text-gray-400">Track all your box openings and item wins</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Purchases</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{purchaseHistory.length}</div>
              <p className="text-xs text-gray-500">Boxes opened</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(
                  purchaseHistory.reduce((total: number, purchase: any) => 
                    total + parseFloat(purchase.price || "0"), 0
                  )
                )}
              </div>
              <p className="text-xs text-gray-500">Lifetime spending</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Items Won</CardTitle>
              <Gift className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{purchaseHistory.length}</div>
              <p className="text-xs text-gray-500">Total rewards</p>
            </CardContent>
          </Card>
        </div>

        {/* Purchase List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recent Purchases</h2>
          
          {purchaseHistory.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No purchases yet</h3>
                <p className="text-gray-500 text-center">
                  Start opening mystery boxes to see your purchase history here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {purchaseHistory.map((purchase: any, index: number) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{purchase.boxName || "Mystery Box"}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {purchase.purchasedAt 
                                ? format(new Date(purchase.purchasedAt), "MMM dd, yyyy 'at' HH:mm")
                                : purchase.timeAgo || "Recently"
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold text-white">
                          {formatCurrency(parseFloat(purchase.price || "0"))}
                        </div>
                        {purchase.itemReceived && (
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-green-900/50 text-green-400 border-green-400/20">
                              Won: {purchase.itemReceived.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}