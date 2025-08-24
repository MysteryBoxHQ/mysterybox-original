import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Wallet, Menu } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ThemePreview } from "@/components/ThemePreview";
import type { User } from "@shared/schema";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  return (
    <header className="glass-effect border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Menu Toggle Button - Left */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors mr-4"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Logo - Centered */}
          <div className="flex-1 flex justify-center">
            <Link href="/">
              <img 
                src="https://aws.rollingriches.com/rollingriches/images/en/logo.svg" 
                alt="CaseVault" 
                className="h-8 cursor-pointer hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* User Info & Actions - Right Side */}
          <div className="flex items-center space-x-3">
            {/* Theme Controls */}
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <ThemePreview />
            </div>
            
            {user && user.username !== "LOGGED_OUT" ? (
              <>
                {/* USD Balance */}
                <div className="flex items-center space-x-3 glass-effect px-4 py-2 rounded-xl border border-white/10">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">$</span>
                  </div>
                  <span className="font-bold text-green-300 text-lg">${user.usdBalance || '0.00'}</span>
                </div>
                
                {/* Gold Coins */}
                <div className="flex items-center space-x-3 glass-effect px-4 py-2 rounded-xl border border-white/10">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">🪙</span>
                  </div>
                  <span className="font-bold text-yellow-300 text-lg">{user.goldCoins || 0}</span>
                </div>
                
                {/* Add Funds Button */}
                <Button className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                  <Wallet className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>

                {/* User Profile */}
                <div className="glass-effect border border-white/10 hover:bg-white/10 px-3 py-2 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{user.username}</span>
                  </div>
                </div>

                {/* Logout Button */}
                <Button 
                  variant="ghost" 
                  className="glass-effect border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-2"
                  onClick={() => {
                    window.location.href = "/api/logout";
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              /* Login Button - shown when logged out */
              <Button 
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/demo-login', { method: 'POST' });
                    if (response.ok) {
                      // Clear all caches and force refresh
                      queryClient.clear();
                      queryClient.invalidateQueries();
                      // Add a small delay to ensure cache is cleared
                      setTimeout(() => {
                        window.location.reload();
                      }, 100);
                    }
                  } catch (error) {
                    console.error('Login failed:', error);
                  }
                }}
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
