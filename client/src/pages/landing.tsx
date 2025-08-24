import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Play, Users, Star, Trophy, Zap, Shield, Crown, Sparkles } from "lucide-react";
import { hapticManager } from "@/lib/hapticManager";
import { formatCurrency, getRarityClass } from "@/lib/utils";
import { motion } from "framer-motion";
import type { RecentOpening } from "@shared/schema";
import Auth from "./auth";

// Helper function to get appropriate icon for items
const getItemIcon = (itemName: string, rarity: string) => {
  const name = itemName.toLowerCase();
  
  // Tech items
  if (name.includes('phone') || name.includes('galaxy') || name.includes('iphone')) return '📱';
  if (name.includes('watch') || name.includes('apple watch')) return '⌚';
  if (name.includes('laptop') || name.includes('macbook')) return '💻';
  if (name.includes('headphones') || name.includes('airpods')) return '🎧';
  if (name.includes('tablet') || name.includes('ipad')) return '📱';
  if (name.includes('charger') || name.includes('power')) return '🔌';
  if (name.includes('camera')) return '📸';
  
  // Fashion items
  if (name.includes('shirt') || name.includes('hoodie') || name.includes('sweater')) return '👕';
  if (name.includes('shoes') || name.includes('sneakers') || name.includes('boots')) return '👟';
  if (name.includes('bag') || name.includes('backpack')) return '🎒';
  if (name.includes('hat') || name.includes('cap') || name.includes('beanie')) return '🧢';
  if (name.includes('jacket') || name.includes('coat')) return '🧥';
  if (name.includes('sunglasses') || name.includes('glasses')) return '🕶️';
  
  // Luxury items
  if (name.includes('diamond') || name.includes('crystal')) return '💎';
  if (name.includes('gold') || name.includes('jewelry')) return '🏆';
  if (name.includes('car') || name.includes('vehicle')) return '🚗';
  if (name.includes('yacht') || name.includes('boat')) return '🛥️';
  
  // Gaming items
  if (name.includes('gaming') || name.includes('console')) return '🎮';
  if (name.includes('mouse') || name.includes('keyboard')) return '🖱️';
  
  // Beauty items
  if (name.includes('perfume') || name.includes('cologne')) return '🧴';
  if (name.includes('makeup') || name.includes('cosmetic')) return '💄';
  
  // Default based on rarity
  switch (rarity.toLowerCase()) {
    case 'legendary': return '🌟';
    case 'epic': return '🔮';
    case 'rare': return '💫';
    case 'common': return '📦';
    default: return '🎁';
  }
};

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Fetch recent openings for biggest wins display
  const { data: recentOpenings = [] } = useQuery<RecentOpening[]>({
    queryKey: ["/api/recent-openings"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="relative z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RollingDrop</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost"
                className="text-gray-300 hover:text-white"
                onClick={() => {
                  hapticManager.light();
                  setAuthMode('signin');
                  setShowAuth(true);
                }}
              >
                Log In
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                onClick={() => {
                  hapticManager.medium();
                  setAuthMode('signup');
                  setShowAuth(true);
                }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Animated Mystery Banner */}
          <div className="relative bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-indigo-900/30 rounded-3xl p-8 mb-8 border border-blue-500/20 overflow-hidden">
            {/* Floating Animation Background */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-8 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute top-12 right-12 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 left-20 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="absolute bottom-4 right-8 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div className="text-left">
                <div className="flex items-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-green-400">
                    <Shield className="w-4 h-4" />
                    <span>Provably Fair</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Crown className="w-4 h-4" />
                    <span>Premium Items</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <Star className="w-4 h-4" />
                    <span>Trusted Platform</span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Open <span className="text-blue-400">Mystery Boxes</span><br />
                  and win real-life items
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Experience the thrill of RollingDrop, where every case opened is a chance to win items shipped directly to you. Jump into battles, earn rewards, and engage with a community of players.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
                  onClick={() => {
                    hapticManager.medium();
                    setAuthMode('signup');
                    setShowAuth(true);
                  }}
                >
                  Sign up instantly
                </Button>
              </div>

              {/* Right Content - Animated Grid */}
              <div className="relative">
                <div className="grid grid-cols-3 gap-4">
                  {/* Row 1 */}
                  <div className="aspect-square bg-gray-700/50 rounded-2xl border border-gray-600/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop&crop=center" 
                      alt="Lamborghini Urus" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="aspect-square bg-gray-700/50 rounded-2xl border border-gray-600/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop&crop=center" 
                      alt="Rolex Explorer" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center" 
                      alt="Dior x Jordan 1 Low Grey" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full"></div>
                  </div>

                  {/* Row 2 */}
                  <div className="aspect-square bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl border border-red-500/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400&h=400&fit=crop&crop=center" 
                      alt="Apple Vision Pro" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="aspect-square bg-gray-700/50 rounded-2xl border border-gray-600/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop&crop=center" 
                      alt="Louis Vuitton Sunglasses" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="aspect-square bg-gray-700/50 rounded-2xl border border-gray-600/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=400&h=400&fit=crop&crop=center" 
                      alt="Patek Philippe Nautilus" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="aspect-square bg-gray-700/50 rounded-2xl border border-gray-600/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center" 
                      alt="Gucci Mini Jumbo GG Bag" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="aspect-square bg-gray-700/50 rounded-2xl border border-gray-600/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center" 
                      alt="Gucci Re-Web Sneakers" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center" 
                      alt="Supreme x Louis Vuitton Box Logo Tee" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>

                {/* Floating Orbs */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '1.2s' }}></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            OPEN CASES
          </div>
          <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-8">
            WIN LUXURY ITEMS
          </div>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Open premium cases and win real luxury items including Supreme streetwear, 
            Louis Vuitton accessories, designer watches, and supercars
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-lg px-12 py-6 h-auto rounded-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                hapticManager.strong();
                setAuthMode('signin');
                setShowAuth(true);
              }}
            >
              <Play className="w-6 h-6 mr-3" />
              START OPENING CASES
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-gray-500 text-white hover:bg-white hover:text-black font-bold text-lg px-12 py-6 h-auto rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                hapticManager.medium();
                setAuthMode('signup');
                setShowAuth(true);
              }}
            >
              <Users className="w-6 h-6 mr-3" />
              CREATE ACCOUNT
            </Button>
          </div>

          {/* Platform Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">1.2M+</div>
              <div className="text-sm text-gray-400">Cases Opened</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">$50M+</div>
              <div className="text-sm text-gray-400">Items Won</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">250K+</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Biggest Wins of the Day */}
      <section className="py-16 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-orange-500" />
              <p className="text-sm text-blue-400 font-medium uppercase tracking-wide">All items instantly withdrawable</p>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Biggest wins of the day</h2>
          </div>
          
          {/* Ticker Container */}
          <div className="relative overflow-hidden mb-8">
            <div className="ticker-wrapper">
              <div className="ticker-content flex gap-4 animate-ticker">
                {/* Duplicate the array to create seamless loop */}
                {[...recentOpenings, ...recentOpenings].slice(0, 12).map((opening, index) => (
                  <Card key={`${opening.id}-${index}`} className="bg-gray-800/80 border-gray-700 hover:border-orange-500/50 transition-all duration-300 group cursor-pointer flex-shrink-0 w-64">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                        {opening.itemImage ? (
                          <img 
                            src={opening.itemImage} 
                            alt={opening.itemName}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.nextElementSibling) {
                                (target.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="text-4xl flex items-center justify-center w-full h-full" style={{ display: opening.itemImage ? 'none' : 'flex' }}>
                          {getItemIcon(opening.itemName, opening.itemRarity)}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className={`${getRarityClass(opening.itemRarity, 'bg')} ${getRarityClass(opening.itemRarity, 'text')} text-xs px-1 py-0 h-5`}>
                            {opening.itemRarity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-white font-bold text-sm truncate">{opening.itemName}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <span>won by</span>
                          <Crown className="w-3 h-3 text-orange-400" />
                          <span className="text-orange-400 font-medium">{opening.username}</span>
                        </div>
                        <div className="text-green-400 font-bold text-sm">
                          {formatCurrency(opening.itemValue || 0)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Instant Withdrawals</h3>
              <p className="text-gray-400 leading-relaxed">
                Withdraw your winnings instantly with our fast and secure payment system. No delays, no hassles.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Provably Fair</h3>
              <p className="text-gray-400 leading-relaxed">
                Every case opening is cryptographically verified. Check the fairness of every result yourself.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Premium Items</h3>
              <p className="text-gray-400 leading-relaxed">
                Win authentic luxury items from top brands. Supreme, Louis Vuitton, Rolex, and more.
              </p>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/30 mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Why Choose RollingDrop?</h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Join thousands of players who trust RollingDrop for the ultimate case opening experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Lightning Fast</h4>
                <p className="text-gray-400 text-sm">Instant case openings and immediate results</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">100% Secure</h4>
                <p className="text-gray-400 text-sm">Bank-level security for all transactions</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">24/7 Support</h4>
                <p className="text-gray-400 text-sm">Always here to help when you need us</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cases Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              {
                name: "Supreme Collection",
                price: "$24.99",
                image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&h=200&fit=crop",
                items: ["Supreme Box Logo Hoodie", "Air Jordan 1", "Off-White Belt"]
              },
              {
                name: "Luxury Cars",
                price: "$99.99", 
                image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=200&fit=crop",
                items: ["Lamborghini Huracán", "Ferrari 488", "McLaren 720S"]
              },
              {
                name: "Designer Fashion",
                price: "$49.99",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop", 
                items: ["Louis Vuitton Bag", "Rolex Watch", "Gucci Sneakers"]
              }
            ].map((caseItem, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-colors cursor-pointer group">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img 
                      src={caseItem.image} 
                      alt={caseItem.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-1">{caseItem.name}</h3>
                      <p className="text-orange-400 font-bold text-xl">{caseItem.price}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-1">
                      {caseItem.items.map((item, i) => (
                        <div key={i} className="text-sm text-gray-400">• {item}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Why Choose RollingDrop?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Provably Fair",
                description: "Transparent and verifiable drop rates for every case opening"
              },
              {
                icon: Zap,
                title: "Instant Delivery",
                description: "Win real items delivered directly to your inventory"
              },
              {
                icon: Trophy,
                title: "Premium Items",
                description: "Authentic luxury brands and exclusive collectibles"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-800/30 border-gray-700 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Winning?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of players opening cases and winning amazing prizes every day
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-xl px-12 py-6"
            onClick={() => {
              hapticManager.strong();
              setAuthMode('signup');
              setShowAuth(true);
            }}
          >
            GET STARTED NOW
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">RollingDrop</h3>
              <p className="text-slate-300">
                Experience the thrill of premium mystery boxes with rare collectibles and luxury items.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.175 1.219-5.175s-.31-.623-.31-1.545c0-1.446.838-2.525 1.881-2.525.887 0 1.315.664 1.315 1.461 0 .889-.567 2.222-.858 3.457-.244 1.031.517 1.871 1.535 1.871 1.843 0 3.26-1.943 3.26-4.748 0-2.481-1.784-4.219-4.33-4.219-2.95 0-4.684 2.211-4.684 4.492 0 .891.344 1.849.772 2.368.085.103.097.194.072.299-.079.33-.254 1.037-.288 1.183-.046.196-.148.238-.342.144-1.29-.6-2.098-2.481-2.098-3.99 0-3.27 2.375-6.275 6.833-6.275 3.59 0 6.38 2.557 6.38 5.973 0 3.564-2.247 6.434-5.365 6.434-1.048 0-2.037-.546-2.374-1.198 0 0-.52 1.979-.646 2.461-.234.898-.866 2.023-1.29 2.709.972.301 2.003.461 3.073.461 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Platform</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Browse Cases</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Battles</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leaderboards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Achievements</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fairness</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Responsible Gaming</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Age Verification</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 RollingDrop. All rights reserved. Play responsibly.</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuth && (
        <Auth
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
}