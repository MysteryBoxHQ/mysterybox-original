import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Package, Gift, ShoppingCart, Sword, Star, Trophy, BarChart3, User, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { User as UserType } from "@shared/schema";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
    enabled: isAuthenticated,
  });

  const navItems = [
    { path: "/", label: "Boxes", icon: Package },
    { path: "/inventory", label: "Items", icon: Gift },
    { path: "/battles", label: "Battles", icon: Sword },
    { path: "/leaderboards", label: "Ranks", icon: Trophy },
    { path: "/history", label: "History", icon: History },
    { path: "/profile", label: "Profile", icon: User },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="mobile-nav safe-bottom">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          
          return (
            <Link key={item.path} href={item.path}>
              <div className="touch-target flex flex-col items-center justify-center relative">
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'text-gray-400 active:bg-gray-700/50'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                
                <span className={`text-xs mt-1 font-medium transition-colors ${
                  isActive ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>

                {/* Notification badges */}
                {item.path === "/inventory" && user && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-green-500 text-xs flex items-center justify-center">
                    {Math.min(99, Math.floor(Math.random() * 10) + 1)}
                  </Badge>
                )}

                {item.path === "/promotions" && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}