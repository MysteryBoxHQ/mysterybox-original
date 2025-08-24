import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  Activity,
  Eye,
  ShoppingCart
} from "lucide-react";
import { useState } from "react";

export default function AnalyticsModule() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: analytics = {} } = useQuery({
    queryKey: ["/api/admin/analytics", timeRange],
  });

  const { data: topBoxes = [] } = useQuery({
    queryKey: ["/api/admin/analytics/top-boxes", timeRange],
  });

  const { data: revenueData = [] } = useQuery({
    queryKey: ["/api/admin/analytics/revenue", timeRange],
  });

  const { data: userActivity = [] } = useQuery({
    queryKey: ["/api/admin/analytics/user-activity", timeRange],
  });

  const metricsCards = [
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue || 0}`,
      change: analytics.revenueChange || 0,
      icon: DollarSign,
      color: "text-green-400"
    },
    {
      title: "Total Users",
      value: analytics.totalUsers || 0,
      change: analytics.userChange || 0,
      icon: Users,
      color: "text-blue-400"
    },
    {
      title: "Boxes Opened",
      value: analytics.boxesOpened || 0,
      change: analytics.boxesChange || 0,
      icon: Package,
      color: "text-purple-400"
    },
    {
      title: "Active Sessions",
      value: analytics.activeSessions || 0,
      change: analytics.sessionChange || 0,
      icon: Activity,
      color: "text-orange-400"
    }
  ];

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(change)}%
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700">
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric, index) => (
          <Card key={metric.title} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="mt-1">
                {formatChange(metric.change)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Revenue chart will display real data from analytics API
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userActivity.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No user activity data available
                </div>
              ) : (
                userActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{activity.username}</p>
                      <p className="text-gray-400 text-sm">{activity.action}</p>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {activity.timestamp}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Boxes */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top Performing Boxes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBoxes.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No box performance data available
                </div>
              ) : (
                topBoxes.slice(0, 5).map((box: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{box.name}</p>
                        <p className="text-gray-400 text-sm">{box.opens} opens</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${box.revenue}</p>
                      <Badge 
                        variant="outline" 
                        className="text-green-400 border-green-400 text-xs"
                      >
                        +{box.growth}%
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Stats */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Real-time Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Online Users</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">{analytics.onlineUsers || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Active Battles</span>
                <span className="text-white font-medium">{analytics.activeBattles || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Pending Orders</span>
                <span className="text-white font-medium">{analytics.pendingOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Today's Revenue</span>
                <span className="text-white font-medium">${analytics.todayRevenue || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{analytics.visitors || 0}</div>
              <div className="text-gray-400">Visitors</div>
              <div className="w-full bg-gray-700 h-2 rounded mt-2">
                <div className="bg-blue-400 h-2 rounded" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{analytics.signups || 0}</div>
              <div className="text-gray-400">Sign-ups</div>
              <div className="w-full bg-gray-700 h-2 rounded mt-2">
                <div className="bg-green-400 h-2 rounded" style={{ 
                  width: `${analytics.visitors ? (analytics.signups / analytics.visitors * 100) : 0}%` 
                }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{analytics.firstPurchase || 0}</div>
              <div className="text-gray-400">First Purchase</div>
              <div className="w-full bg-gray-700 h-2 rounded mt-2">
                <div className="bg-yellow-400 h-2 rounded" style={{ 
                  width: `${analytics.signups ? (analytics.firstPurchase / analytics.signups * 100) : 0}%` 
                }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{analytics.repeatCustomers || 0}</div>
              <div className="text-gray-400">Repeat Customers</div>
              <div className="w-full bg-gray-700 h-2 rounded mt-2">
                <div className="bg-purple-400 h-2 rounded" style={{ 
                  width: `${analytics.firstPurchase ? (analytics.repeatCustomers / analytics.firstPurchase * 100) : 0}%` 
                }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}