import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Home,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  Sword,
  Shield,
  LogOut,
  Menu,
  X
} from "lucide-react";

import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import PlayerManagement from "@/components/admin/PlayerManagement";
import BoxManagementModule from "@/components/admin/BoxManagementModule";
import AnalyticsModule from "@/components/admin/AnalyticsModule";
import BattlePlayersModule from "@/components/admin/BattlePlayersModule";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import ContentManagementModule from "@/components/admin/ContentManagementModule";

export default function AdminSimple() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'boxes', label: 'Boxes', icon: Package },
    { id: 'battles', label: 'Battles', icon: Sword },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'admin-users', label: 'Admin Users', icon: Shield },
  ];

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    console.log('Rendering admin section:', activeSection);
    
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'players':
        return <PlayerManagement />;
      case 'boxes':
        return <BoxManagementModule />;
      case 'battles':
        return <BattlePlayersModule />;
      case 'content':
        return <ContentManagementModule />;
      case 'admin-users':
        return <AdminUserManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setActiveSection('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {!collapsed && (
              <h1 className="text-xl font-bold text-white">RollingDrop Admin</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-400 hover:text-white"
            >
              {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 ${
                    activeSection === item.id ? 'bg-gray-700 text-white' : ''
                  } ${collapsed ? 'px-2' : 'px-3'}`}
                  onClick={() => {
                    console.log('Switching to section:', item.id);
                    setActiveSection(item.id);
                  }}
                >
                  <item.icon className={`w-4 h-4 ${collapsed ? '' : 'mr-3'}`} />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Logout */}
          <div className="absolute bottom-4 left-4" style={{ width: collapsed ? '2rem' : '14rem' }}>
            <Separator className="mb-4 bg-gray-700" />
            <Button
              variant="ghost"
              className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 ${
                collapsed ? 'px-2' : 'px-3'
              }`}
              onClick={handleLogout}
            >
              <LogOut className={`w-4 h-4 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && <span className="text-sm">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}