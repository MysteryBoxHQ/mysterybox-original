import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Package, Activity, Target, Calendar, Award } from "lucide-react";
import type { AnalyticsData, RevenueData, UserGrowthData, BoxPerformanceData, PartnerStatsData } from "@shared/schema";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsDashboard() {
  // Fetch analytics data
  const { data: analytics = {} as AnalyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: revenueData = [], isLoading: revenueLoading } = useQuery<RevenueData[]>({
    queryKey: ["/api/admin/analytics/revenue"],
  });

  const { data: userGrowth = [], isLoading: userGrowthLoading } = useQuery<UserGrowthData[]>({
    queryKey: ["/api/admin/analytics/user-growth"],
  });

  const { data: boxPerformance = [], isLoading: boxPerformanceLoading } = useQuery<BoxPerformanceData[]>({
    queryKey: ["/api/admin/analytics/box-performance"],
  });

  const { data: partnerStats = [], isLoading: partnerStatsLoading } = useQuery<PartnerStatsData[]>({
    queryKey: ["/api/admin/analytics/partner-stats"],
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      change: analytics.revenueChange || 0,
      changeLabel: "vs last month"
    },
    {
      title: "Active Users",
      value: analytics.activeUsers?.toLocaleString() || '0',
      icon: Users,
      change: analytics.userGrowth || 0,
      changeLabel: "vs last month"
    },
    {
      title: "Boxes Opened",
      value: analytics.totalBoxesOpened?.toLocaleString() || '0',
      icon: Package,
      change: analytics.boxOpeningGrowth || 0,
      changeLabel: "vs last month"
    },
    {
      title: "Conversion Rate",
      value: `${analytics.conversionRate?.toFixed(2) || '0'}%`,
      icon: Target,
      change: analytics.conversionChange || 0,
      changeLabel: "vs last month"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Last 30 days</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {card.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                )}
                <span className={card.change >= 0 ? "text-green-500" : "text-red-500"}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
                <span className="text-gray-400">{card.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="boxes">Box Performance</TabsTrigger>
          <TabsTrigger value="partners">Partner Analytics</TabsTrigger>
        </TabsList>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Growth Analytics */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="newUsers" fill="#10B981" />
                      <Bar dataKey="activeUsers" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Daily Active Users</span>
                    <span className="text-white font-bold">{analytics.dailyActiveUsers?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Average Session Duration</span>
                    <span className="text-white font-bold">{analytics.avgSessionDuration || '0'} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Retention Rate (7-day)</span>
                    <span className="text-white font-bold">{analytics.retentionRate || '0'}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Churn Rate</span>
                    <span className="text-white font-bold">{analytics.churnRate || '0'}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Box Performance Analytics */}
        <TabsContent value="boxes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Boxes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={boxPerformance.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="opened" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Box Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.boxCategories || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(analytics.boxCategories || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Partner Analytics */}
        <TabsContent value="partners" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Top Partners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partnerStats.slice(0, 5).map((partner: any, index: number) => (
                    <div key={partner.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-white">{partner.name}</span>
                      </div>
                      <span className="text-green-400 font-bold">${partner.revenue?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Partner Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Partners</span>
                    <span className="text-white font-bold">{analytics.totalPartners || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Active Partners</span>
                    <span className="text-white font-bold">{analytics.activePartners || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">API Calls (24h)</span>
                    <span className="text-white font-bold">{analytics.apiCalls24h?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Partner Revenue</span>
                    <span className="text-white font-bold">${analytics.partnerRevenue?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics.recentActivity || []).slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <Activity className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div>
                        <div className="text-white">{activity.description}</div>
                        <div className="text-gray-400">{activity.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}