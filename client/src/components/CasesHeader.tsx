import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Coins, User, Menu, Home, Trophy, Gift, Settings, Sword, LogOut, UserCircle, ChevronDown, Wallet, ShoppingCart, Store, TrendingUp, Tag, Clock, BarChart3, Star, Lock as LockIcon, Shield, Truck, Grid3X3, Archive, Swords, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatCurrency } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import type { User as UserType } from "@shared/schema";
import { Link, useLocation } from "wouter";

export default function CasesHeader() {
  const { user: authUser, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  
  // Click outside detection for dropdowns
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setDropdownOpen(false));
  const marketDropdownRef = useClickOutside<HTMLDivElement>(() => setMarketDropdownOpen(false));
  
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
    enabled: isAuthenticated,
  });

  const navItems = [
    { 
      path: "/boxes", 
      label: "Mystery Boxes", 
      icon: Package 
    },
    { 
      path: "/inventory", 
      label: "My Inventory", 
      icon: Gift 
    },
    { 
      path: "/battles", 
      label: "Live Battles", 
      icon: Sword 
    },
    { 
      path: "/leaderboards", 
      label: "Leaderboard", 
      icon: Trophy 
    },
    { 
      path: "/history", 
      label: "Purchase History", 
      icon: Clock 
    },
  ];

  return (
    <header className="cases-header sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Clickable to home */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold cases-gradient-text">RollingDrop</span>
            </div>
          </Link>

          {/* Spacer to center the logo */}
          <div className="flex-1"></div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Balance */}
                <div className="hidden sm:flex items-center gap-3">
                  <Link href="/wallet">
                    <Badge variant="secondary" className="bg-gray-700 text-yellow-400 border-yellow-400/20 hover:bg-gray-600 cursor-pointer transition-colors">
                      <Coins className="w-4 h-4 mr-1" />
                      {formatCurrency(user.usdBalance)}
                    </Badge>
                  </Link>
                </div>



                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 text-white hover:bg-gray-700/50 px-3 py-2 rounded-lg"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block font-medium">{user.username}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                      {/* Profile Section */}
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Account
                        </div>
                        <Link href="/profile">
                          <div 
                            className="flex items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <UserCircle className="w-4 h-4 mr-3" />
                            <div>
                              <div className="font-medium">Profile</div>
                              <div className="text-xs text-gray-400">Manage account</div>
                            </div>
                          </div>
                        </Link>
                        <Link href="/wallet">
                          <div 
                            className="flex items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Wallet className="w-4 h-4 mr-3" />
                            <div>
                              <div className="font-medium">Wallet</div>
                              <div className="text-xs text-gray-400">Manage funds</div>
                            </div>
                          </div>
                        </Link>
                      </div>

                      <div className="h-px bg-gray-700 mx-2"></div>

                      {/* Navigation Section */}
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Navigate
                        </div>
                        {navItems.map((item) => (
                          <Link key={item.path} href={item.path}>
                            <div 
                              className="flex items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded cursor-pointer"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <item.icon className="w-4 h-4 mr-3" />
                              <div>
                                <div className="font-medium">{item.label}</div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div className="h-px bg-gray-700 mx-2"></div>

                      {/* Additional Features */}
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Features
                        </div>
                        <Link href="/achievements">
                          <div 
                            className="flex items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Trophy className="w-4 h-4 mr-3" />
                            <div>
                              <div className="font-medium">Achievements</div>
                              <div className="text-xs text-gray-400">Progress tracking</div>
                            </div>
                          </div>
                        </Link>
                        <Link href="/shipping">
                          <div 
                            className="flex items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Truck className="w-4 h-4 mr-3" />
                            <div>
                              <div className="font-medium">Shipping</div>
                              <div className="text-xs text-gray-400">Physical delivery</div>
                            </div>
                          </div>
                        </Link>
                        <Link href="/vault">
                          <div 
                            className="flex items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <LockIcon className="w-4 h-4 mr-3" />
                            <div>
                              <div className="font-medium">Vault</div>
                              <div className="text-xs text-gray-400">Secure deposits</div>
                            </div>
                          </div>
                        </Link>
                        <Link href="/fairness">
                          <div 
                            className="flex items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded cursor-pointer"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Shield className="w-4 h-4 mr-3" />
                            <div>
                              <div className="font-medium">Fairness</div>
                              <div className="text-xs text-gray-400">Provably fair</div>
                            </div>
                          </div>
                        </Link>
                      </div>

                      <div className="h-px bg-gray-700 mx-2"></div>

                      {/* Logout */}
                      <div className="p-2">
                        <div 
                          className="flex items-center px-3 py-2 text-gray-200 hover:bg-gray-700 rounded cursor-pointer"
                          onClick={async () => {
                            try {
                              // Check if we're in whitelabel mode
                              const isWhitelabel = window.location.pathname.includes('/rollingdrop') || 
                                                  window.location.search.includes('whitelabel=rollingdrop');
                              
                              if (isWhitelabel) {
                                await fetch('/api/whitelabel/logout', { method: 'POST' });
                                window.location.href = '/rollingdrop';
                              } else {
                                await fetch('/api/demo-logout', { method: 'POST' });
                                window.location.reload();
                              }
                            } catch (error) {
                              console.error('Logout error:', error);
                            }
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          <div>
                            <div className="font-medium">Logout</div>
                            <div className="text-xs text-gray-400">Sign out</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="cases-button text-white"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Join Now
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}