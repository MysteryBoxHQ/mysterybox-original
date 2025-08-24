import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Coins, Menu, X, Bell, Settings, BarChart3, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatCurrency } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import type { User as UserType } from "@shared/schema";
import { Link } from "wouter";

interface MobileHeaderProps {
  onMenuToggle?: () => void;
}

export default function MobileHeader({ onMenuToggle }: MobileHeaderProps) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  
  // Click outside detection for mobile menu
  const mobileMenuRef = useClickOutside<HTMLDivElement>(() => setShowMenu(false));

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
    enabled: isAuthenticated,
  });

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    onMenuToggle?.();
  };

  return (
    <header className="mobile-header safe-top">
      <div className="flex items-center justify-between h-full px-4">
        {/* Logo and Brand */}
        <Link href="/">
          <div className="flex items-center space-x-2 touch-target">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white mobile-xs-hidden">RollingDrop</span>
          </div>
        </Link>

        {/* User Balance (Mobile) */}
        {isAuthenticated && user && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-800/80 rounded-lg px-3 py-1.5">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">
                {user.goldCoins?.toLocaleString() || '0'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-800/80 rounded-lg px-3 py-1.5 mobile-xs-hidden">
              <span className="text-xs text-gray-400">USD</span>
              <span className="text-sm font-medium text-white">
                {formatCurrency(parseFloat(user.usdBalance || '0'))}
              </span>
            </div>
          </div>
        )}

        {/* Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="touch-target p-2"
          onClick={toggleMenu}
        >
          {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700 z-50" ref={mobileMenuRef}>
          <div className="p-4 space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/statistics">
                <div 
                  className="mobile-card bg-gray-800/50 text-center"
                  onClick={() => setShowMenu(false)}
                >
                  <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <span className="text-sm text-white">Statistics</span>
                </div>
              </Link>
              
              <Link href="/leaderboards">
                <div 
                  className="mobile-card bg-gray-800/50 text-center"
                  onClick={() => setShowMenu(false)}
                >
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <span className="text-sm text-white">Leaderboards</span>
                </div>
              </Link>
            </div>



            {/* User Menu */}
            {isAuthenticated && user && (
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <Link href="/wallet">
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 touch-target"
                    onClick={() => setShowMenu(false)}
                  >
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">Wallet</span>
                  </div>
                </Link>

                <Link href="/profile">
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 touch-target"
                    onClick={() => setShowMenu(false)}
                  >
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="text-white">Settings</span>
                  </div>
                </Link>

                {user.isAdmin && (
                  <Link href="/admin">
                    <div 
                      className="flex items-center space-x-3 p-3 rounded-lg bg-red-900/20 touch-target"
                      onClick={() => setShowMenu(false)}
                    >
                      <Settings className="w-5 h-5 text-red-400" />
                      <span className="text-red-400">Admin Panel</span>
                    </div>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={async () => {
                    setShowMenu(false);
                    try {
                      // Check if we're in whitelabel mode
                      const isWhitelabel = window.location.pathname.includes('/rollingdrop') || 
                                          window.location.search.includes('whitelabel=rollingdrop');
                      
                      if (isWhitelabel) {
                        await fetch('/api/whitelabel/logout', { method: 'POST' });
                        window.location.href = '/rollingdrop';
                      } else {
                        window.location.href = "/api/logout";
                      }
                    } catch (error) {
                      console.error('Logout error:', error);
                      window.location.href = "/api/logout";
                    }
                  }}
                >
                  Log Out
                </Button>
              </div>
            )}

            {!isAuthenticated && (
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setShowMenu(false);
                    window.location.href = "/api/login";
                  }}
                >
                  Log In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}