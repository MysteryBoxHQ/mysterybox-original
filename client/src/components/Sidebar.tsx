import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Package, Trophy, BarChart3, Settings, Menu, X, User as UserIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import type { User } from "@shared/schema";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const navItems = [
    { href: "/", label: "Cases", icon: Home },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/achievements", label: "Achievements", icon: Trophy },
    { href: "/leaderboards", label: "Leaderboards", icon: BarChart3 },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        
        {/* Toggle Button */}
        <div className="p-3 border-b border-slate-700 bg-slate-800">
          <button
            onClick={() => {
              console.log('Toggle clicked, current state:', isCollapsed);
              setIsCollapsed(!isCollapsed);
            }}
            className={`w-full h-10 flex ${isCollapsed ? 'justify-center' : 'justify-start'} items-center text-white hover:bg-slate-700 p-2 rounded transition-colors bg-slate-600`}
          >
            <Menu className="w-5 h-5 text-white" />
            {!isCollapsed && <span className="ml-2 text-white">Menu</span>}
          </button>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-b border-slate-700">
            {!isCollapsed ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{user.username}</div>
                    <div className="text-xs text-slate-400">BRONZE</div>
                  </div>
                </div>
                
                {/* Balance in Sidebar */}
                <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">$</span>
                    </div>
                    <span className="text-green-300 font-semibold">{formatCurrency(user.usdBalance)}</span>
                  </div>
                </div>

                {/* Add Funds Button */}
                <Button className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold">
                  Add Funds
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full flex items-center justify-start text-white hover:bg-slate-800 ${
                    isActive ? 'bg-blue-600 hover:bg-blue-700' : ''
                  } ${isCollapsed ? 'px-2' : 'px-4'}`}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}