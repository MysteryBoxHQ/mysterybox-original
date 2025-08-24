import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AnalyticsModule from "@/components/admin/AnalyticsModule";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import BattlePlayersModule from "@/components/admin/BattlePlayersModule";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import PlayerManagement from "@/components/admin/PlayerManagement";
import PlayersOnlyModule from "@/components/admin/PlayersOnlyModule";
import ShippingOrdersModule from "@/components/admin/ShippingOrdersModule";
import TransactionManagementModule from "@/components/admin/TransactionManagementModule";
import ContentManagementModule from "@/components/admin/ContentManagementModule";
import IntegrationModule from "@/components/admin/IntegrationModule";
import BoxManagementModule from "@/components/admin/BoxManagementModule";
import PromotionsModule from "@/components/admin/PromotionsModule";
import AchievementsModule from "@/components/admin/AchievementsModule";
import WidgetPartnerManagement from "@/components/admin/WidgetPartnerManagement";
import { WhitelabelManagement } from "@/components/admin/WhitelabelManagement";
import { BusinessModelManagement } from "@/components/admin/BusinessModelManagement";
import AdminContentManagement from "@/pages/admin-content-management";

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/admin/login", { username, password });
      const data = await response.json();
      
      // Store the admin token
      localStorage.setItem('adminToken', data.token);
      console.log('Admin token stored:', data.token);
      
      toast({
        title: "Login Successful",
        description: "Welcome to the admin console",
      });
      onLogin();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">Admin Console</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/admin/auth-check", {
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        await fetch("/api/admin/logout", {
          method: 'POST',
          headers: {
            'x-admin-token': token,
            'Content-Type': 'application/json'
          }
        });
      }
      
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    console.log('Admin renderContent called with location:', location);
    console.log('Actual browser URL:', window.location.pathname);
    
    // Use wouter location first, fallback to browser URL
    const path = location || window.location.pathname;
    console.log('Using path for routing:', path);
    
    if (path === "/admin" || path === "/admin/") {
      return <AdminDashboard />;
    } else if (path === "/admin/analytics") {
      return <AnalyticsDashboard />;
    } else if (path === "/admin/battle-players") {
      return <BattlePlayersModule />;
    } else if (path === "/admin/battle-content") {
      return <BattlePlayersModule />;
    } else if (path === "/admin/admin-users") {
      return <AdminUserManagement />;
    } else if (path === "/admin/players") {
      return <PlayerManagement />;
    } else if (path === "/admin/boxes" || path === "/admin/products" || path === "/admin/brands") {
      console.log('Rendering BoxManagementSimple for path:', path);
      return <BoxManagementModule />;
    } else if (path === "/admin/orders") {
      console.log('Rendering ShippingOrdersModule for path:', path);
      return <ShippingOrdersModule />;
    } else if (path === "/admin/approve-orders" || path === "/admin/transactions" || path === "/admin/deposits") {
      return <PlayerManagement />;
    } else if (path === "/admin/promotions") {
      return <PromotionsModule />;
    } else if (path === "/admin/achievements") {
      return <AchievementsModule />;
    } else if (path.startsWith("/admin/")) {
      // Handle all other admin content management routes
      const contentRoutes = ["/admin/sliders", "/admin/blogs", "/admin/contact-us", "/admin/faq", "/admin/contact-page", "/admin/provably-fair", "/admin/cookie-policy", "/admin/terms", "/admin/aml-policy", "/admin/privacy-statement", "/admin/footer-logo", "/admin/footer-icons"];
      if (contentRoutes.includes(path)) {
        return <ContentManagementModule />;
      }
      if (path === "/admin/admin-account") {
        return <AdminUserManagement />;
      }
    }
    
    // Default fallback
    return <AdminDashboard />;
  };

  // New state-based navigation function
  const renderContentByState = () => {
    console.log('Admin renderContentByState called with activeSection:', activeSection);
    
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'battle-players':
      case 'battle-content':
        return <BattlePlayersModule />;
      case 'admin-users':
      case 'admin-account':
        return <AdminUserManagement />;
      case 'players':
        return <PlayersOnlyModule />;
      case 'boxes':
      case 'products':
      case 'brands':
        console.log('Rendering BoxManagementModule for section:', activeSection);
        return <BoxManagementModule />;
      case 'orders':
        return <ShippingOrdersModule />;
      case 'approve-orders':
      case 'transactions':
      case 'deposits':
        return <TransactionManagementModule activeSection={activeSection} />;
      case 'promotions':
        return <PromotionsModule />;
      case 'achievements':
        return <AchievementsModule />;
      case 'partners':
        return <BusinessModelManagement />; // B2B widget integrations only
      case 'whitelabel':
        return <WhitelabelManagement />; // Complete frontend spawning only
      case 'content':
        return <AdminContentManagement />;
      case 'content-management':
        return <AdminContentManagement />;
      case 'sliders':
      case 'blogs':
      case 'contact-us':
      case 'faq':
      case 'contact-page':
      case 'provably-fair':
      case 'cookie-policy':
      case 'terms':
      case 'aml-policy':
      case 'privacy-statement':
      case 'footer-logo':
      case 'footer-icons':
        return <ContentManagementModule />;
      case 'integrations':
        return <IntegrationModule />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
        onNavigate={setActiveSection}
      />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Console</h1>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          {renderContentByState()}
        </div>
      </div>
    </div>
  );
}