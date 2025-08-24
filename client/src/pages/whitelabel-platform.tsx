import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import CasesHeader from "@/components/CasesHeader";
import MobileHeader from "@/components/MobileHeader";
import MobileNavigation from "@/components/MobileNavigation";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";

// Import all platform pages
import Home from "@/pages/home";
import Boxes from "@/pages/boxes";
import BoxOpening from "@/pages/box-opening";
import Inventory from "@/pages/inventory";
import Achievements from "@/pages/achievements";
import Leaderboards from "@/pages/leaderboards";
import Battles from "@/pages/battles";
import Profile from "@/pages/profile";
import Wallet from "@/pages/wallet";
import Market from "@/pages/market";
import Statistics from "@/pages/statistics";
import Promotions from "@/pages/promotions";
import Fairness from "@/pages/fairness";
import SelfExclude from "@/pages/self-exclude";
import VaultPage from "@/pages/vault";
import Shipping from "@/pages/shipping";
// import PurchaseHistory from "@/pages/purchase-history";
import NotFound from "@/pages/not-found";

export default function WhitelabelPlatform() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [whitelabelAuth, setWhitelabelAuth] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  // Check whitelabel authentication
  useEffect(() => {
    fetch('/api/whitelabel/auth/check', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => {
        setWhitelabelAuth(data.authenticated);
        setChecking(false);
      })
      .catch(() => {
        setWhitelabelAuth(false);
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center cases-bg">
        <div className="cases-card p-8 rounded-lg text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-white mt-4">Loading Whitelabel Platform...</p>
          <p className="text-gray-400 text-sm mt-2">Checking authentication status</p>
        </div>
      </div>
    );
  }

  if (!whitelabelAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center cases-bg">
        <div className="cases-card p-8 rounded-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Whitelabel Access Required</h2>
          <p className="text-gray-300 mb-6">Please login to access this whitelabel platform.</p>
          <button 
            onClick={() => window.location.href = '/whitelabel/login'}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Go to Whitelabel Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cases-bg">
      {/* Whitelabel Mode Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="font-semibold">Whitelabel Platform Active</span>
          <Badge variant="secondary">Demo Instance</Badge>
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <CasesHeader />
      </div>
      
      {/* Mobile Header */}
      <div className="block md:hidden">
        <MobileHeader />
      </div>

      <main className="relative mobile-container md:container md:mx-auto">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/boxes" component={Boxes} />
          <Route path="/box-opening/:id" component={BoxOpening} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/leaderboards" component={Leaderboards} />
          <Route path="/battles" component={Battles} />
          <Route path="/profile" component={Profile} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/market" component={Market} />
          <Route path="/statistics" component={Statistics} />
          <Route path="/promotions" component={Promotions} />
          <Route path="/fairness" component={Fairness} />
          <Route path="/self-exclude" component={SelfExclude} />
          <Route path="/vault" component={VaultPage} />
          <Route path="/shipping" component={Shipping} />
          {/* <Route path="/purchase-history" component={PurchaseHistory} /> */}
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* Mobile Navigation */}
      <div className="block md:hidden">
        <MobileNavigation />
      </div>

      {/* Footer */}
      <Footer />

      {/* Chat */}
      {isChatOpen && (
        <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
}