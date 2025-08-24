import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ShoppingCart,
  Award,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const dashboardCards = [
    {
      title: "Total Users",
      value: stats.totalUsers || "0",
      icon: Users,
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue || "0"}`,
      icon: DollarSign,
      change: "+8.2%",
      changeType: "positive"
    },
    {
      title: "Active Boxes",
      value: stats.activeBoxes || "0",
      icon: Package,
      change: "+3",
      changeType: "positive"
    },
    {
      title: "Cases Opened Today",
      value: stats.casesOpenedToday || "0",
      icon: Activity,
      change: "+15%",
      changeType: "positive"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <Button variant="outline" className="bg-gray-800 border-gray-600 text-white">
          <Eye className="w-4 h-4 mr-2" />
          View Site
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{card.value}</div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className={`text-${card.changeType === 'positive' ? 'green' : 'red'}-500`}>
                    {card.change}
                  </span>
                  from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Order #{1000 + i}</p>
                  <p className="text-gray-400 text-sm">User_{i}234</p>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Completed
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Popular Boxes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Supreme Collection", opens: 1250 },
              { name: "Tech Gadgets", opens: 890 },
              { name: "Luxury Watches", opens: 640 }
            ].map((box, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{box.name}</p>
                  <p className="text-gray-400 text-sm">{box.opens} opens</p>
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API Status</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Payment Gateway</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                Connected
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Revenue chart will be implemented with real data
          </div>
        </CardContent>
      </Card>
    </div>
  );
}