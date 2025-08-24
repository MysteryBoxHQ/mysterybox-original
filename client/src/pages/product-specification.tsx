import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Users, 
  Globe, 
  Shield, 
  DollarSign, 
  BarChart3,
  Zap,
  Settings,
  Database,
  Truck
} from "lucide-react";

export default function ProductSpecification() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            RollingDrop Platform
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-6">
            Widget-Based B2B Integration for Seamless Platform Embedding
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="default">Widget-Based</Badge>
            <Badge variant="secondary">Embeddable</Badge>
            <Badge variant="outline">Zero Setup</Badge>
            <Badge variant="destructive">Real-Time</Badge>
          </div>
        </div>

        {/* Overview */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              RollingDrop revolutionizes B2B integration through embeddable widgets that allow partners to seamlessly 
              integrate our complete box opening platform into their existing websites. No custom development required - 
              simply embed our widgets and start offering premium gaming experiences to your users instantly.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Core Capabilities</h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• Premium mystery box collections</li>
                  <li>• Advanced gamification systems</li>
                  <li>• Physical shipping management</li>
                  <li>• Marketplace and Quick Sell features</li>
                  <li>• Battle system with real-time mechanics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Business Model</h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• Direct B2C platform operations</li>
                  <li>• B2B partner API integrations</li>
                  <li>• Whitelabel solutions</li>
                  <li>• Revenue sharing models</li>
                  <li>• Custom commission structures</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Architecture */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Database className="h-6 w-6" />
              Technical Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Zap className="h-4 w-4" />
                  Frontend Stack
                </h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• React 18 with TypeScript</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Framer Motion animations</li>
                  <li>• shadcn/ui component library</li>
                  <li>• Wouter for routing</li>
                  <li>• TanStack Query for state</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Settings className="h-4 w-4" />
                  Backend Stack
                </h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• Node.js with Express</li>
                  <li>• PostgreSQL database</li>
                  <li>• Drizzle ORM</li>
                  <li>• JWT authentication</li>
                  <li>• WebSocket support</li>
                  <li>• RESTful API design</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="h-4 w-4" />
                  Security & Infrastructure
                </h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• API key authentication</li>
                  <li>• Rate limiting</li>
                  <li>• Session management</li>
                  <li>• CORS protection</li>
                  <li>• Input validation</li>
                  <li>• Audit logging</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* B2B Partner Integration */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Globe className="h-6 w-6" />
              B2B Partner Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Partner API Endpoints</h4>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="grid gap-2 text-sm font-mono">
                    <div className="text-gray-800 dark:text-gray-200"><span className="text-green-600">GET</span> /api/partner/v1/auth/test - Authentication test</div>
                    <div className="text-gray-800 dark:text-gray-200"><span className="text-green-600">GET</span> /api/partner/v1/partner/info - Partner information</div>
                    <div className="text-gray-800 dark:text-gray-200"><span className="text-green-600">GET</span> /api/partner/v1/boxes - Available boxes</div>
                    <div className="text-gray-800 dark:text-gray-200"><span className="text-green-600">GET</span> /api/partner/v1/boxes/:id - Box details with items</div>
                    <div className="text-gray-800 dark:text-gray-200"><span className="text-blue-600">POST</span> /api/partner/v1/boxes/:id/open - Open a box</div>
                    <div className="text-gray-800 dark:text-gray-200"><span className="text-green-600">GET</span> /api/partner/v1/stats - Partner statistics</div>
                    <div className="text-gray-800 dark:text-gray-200"><span className="text-green-600">GET</span> /api/partner/v1/transactions - Transaction history</div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Authentication</h4>
                  <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                    <li>• API key-based authentication</li>
                    <li>• X-API-Key header required</li>
                    <li>• Partner-specific rate limiting</li>
                    <li>• Secure key management</li>
                    <li>• Usage monitoring and analytics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Multi-Tenant Features</h4>
                  <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                    <li>• Isolated user bases per partner</li>
                    <li>• Custom pricing configurations</li>
                    <li>• Partner-specific box assignments</li>
                    <li>• Revenue tracking and reporting</li>
                    <li>• Webhook notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Features */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="h-6 w-6" />
              Core Platform Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Box Opening System</h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• Dynamic rarity system</li>
                  <li>• Provably fair mechanics</li>
                  <li>• Real-time animations</li>
                  <li>• Item value calculations</li>
                  <li>• Historical tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">User Management</h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• User registration and profiles</li>
                  <li>• Balance management (USD/Gold)</li>
                  <li>• Experience and leveling</li>
                  <li>• Achievement system</li>
                  <li>• Partner assignment support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Inventory & Marketplace</h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• Item inventory management</li>
                  <li>• Quick Sell functionality (80% value)</li>
                  <li>• Marketplace trading</li>
                  <li>• Physical shipping integration</li>
                  <li>• Favoriting system</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Model */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <DollarSign className="h-6 w-6" />
              Revenue Model & Monetization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">B2C Revenue Streams</h4>
                <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
                  <li>• <strong>Box Sales:</strong> Direct box purchases by consumers</li>
                  <li>• <strong>Premium Features:</strong> Enhanced user experiences</li>
                  <li>• <strong>Physical Shipping:</strong> $15.99 shipping fee per item</li>
                  <li>• <strong>Marketplace Fees:</strong> Transaction fees on item trades</li>
                  <li>• <strong>Battle Entry Fees:</strong> Competitive gaming revenue</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">B2B Revenue Streams</h4>
                <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
                  <li>• <strong>API Usage Fees:</strong> Per-call or monthly subscription</li>
                  <li>• <strong>Commission Model:</strong> Configurable percentage rates</li>
                  <li>• <strong>Revenue Sharing:</strong> Partner profit distribution</li>
                  <li>• <strong>Whitelabel Licensing:</strong> Custom branding solutions</li>
                  <li>• <strong>Enterprise Support:</strong> Dedicated integration assistance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Console */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <BarChart3 className="h-6 w-6" />
              Administration & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Admin Console Features</h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• Comprehensive dashboard with real-time metrics</li>
                  <li>• User and player management</li>
                  <li>• Box and item configuration</li>
                  <li>• Transaction monitoring and approval</li>
                  <li>• Content management system</li>
                  <li>• Partner relationship management</li>
                  <li>• Shipping order processing</li>
                  <li>• Promotion and achievement management</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Analytics & Reporting</h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• Real-time revenue tracking</li>
                  <li>• Partner performance metrics</li>
                  <li>• User engagement analytics</li>
                  <li>• API usage monitoring</li>
                  <li>• Transaction volume reporting</li>
                  <li>• Geographic distribution data</li>
                  <li>• Custom dashboard creation</li>
                  <li>• Automated reporting systems</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Fulfillment */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Truck className="h-6 w-6" />
              Shipping & Fulfillment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Shipping Management</h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• Address management system</li>
                  <li>• Multiple carrier integration (UPS, FedEx, DHL)</li>
                  <li>• Tracking number generation</li>
                  <li>• Delivery status monitoring</li>
                  <li>• Automated notifications</li>
                  <li>• International shipping support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Order Processing</h4>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                  <li>• Automated order creation</li>
                  <li>• Admin approval workflow</li>
                  <li>• Inventory synchronization</li>
                  <li>• Cost calculation ($15.99 standard)</li>
                  <li>• Delivery estimation</li>
                  <li>• Returns and exchanges</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget Integration */}
        <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Package className="h-6 w-6" />
              Widget-Based Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 dark:text-gray-200 mb-6">
              Embed our complete gaming platform directly into your website with zero development effort. 
              Our widget system provides all features as ready-to-use components that integrate seamlessly 
              with your existing platform.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Box Opening Widget</h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  Complete box opening experience with live animations and real-time results
                </p>
                <Badge variant="outline" className="text-xs">Easy Embed</Badge>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Inventory Widget</h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  User inventory management with filtering, actions, and value tracking
                </p>
                <Badge variant="outline" className="text-xs">Customizable</Badge>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Marketplace Widget</h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  Trading marketplace with search, filters, and instant purchases
                </p>
                <Badge variant="outline" className="text-xs">Real-Time</Badge>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Battles Widget</h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  Case battles with live participation and competitive gameplay
                </p>
                <Badge variant="outline" className="text-xs">Interactive</Badge>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Stats Widget</h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  Player statistics, achievements, and progress tracking
                </p>
                <Badge variant="outline" className="text-xs">Analytics</Badge>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Leaderboards Widget</h4>
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  Competitive rankings and achievement showcases for engagement
                </p>
                <Badge variant="outline" className="text-xs">Gamification</Badge>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Simple Integration Example</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
{`<!-- Include RollingDrop Widget Library -->
<script src="https://widgets.rollingdrop.com/latest/rollingdrop-widgets.js"></script>

<!-- Create widget containers -->
<div id="box-opening-widget"></div>
<div id="inventory-widget"></div>

<script>
// Initialize with your API key
const widgets = new RollingDropWidgets({
  apiKey: 'your-api-key',
  theme: 'light',
  partnerId: 'your-partner-id'
});

// Embed widgets instantly
widgets.createBoxOpeningWidget('box-opening-widget', { compact: false });
widgets.createInventoryWidget('inventory-widget', { showActions: true });
</script>`}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Contact & Integration */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Widget Integration Support</h3>
          <p className="text-gray-800 dark:text-gray-200 mb-6">
            Ready to integrate our widgets? Start embedding our complete gaming platform 
            into your website today with our comprehensive widget library and dedicated support.
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="border-gray-600 text-gray-800 dark:text-gray-200">Widget Documentation</Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-800 dark:text-gray-200">Live Examples</Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-800 dark:text-gray-200">24/7 Support</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}