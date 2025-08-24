import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import CasesHeader from "@/components/CasesHeader";
import MobileHeader from "@/components/MobileHeader";
import MobileNavigation from "@/components/MobileNavigation";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";
import Home from "@/pages/home";
import Boxes from "@/pages/boxes";
import BoxOpening from "@/pages/box-opening";
import Landing from "@/pages/landing";
import Inventory from "@/pages/inventory";
import Achievements from "@/pages/achievements";
import Leaderboards from "@/pages/leaderboards";
import Battles from "@/pages/battles";
import PurchaseHistory from "@/pages/PurchaseHistory";

import Profile from "@/pages/profile";
import Wallet from "@/pages/wallet";
import Market from "@/pages/market";
import Statistics from "@/pages/statistics";
import Promotions from "@/pages/promotions";
import Fairness from "@/pages/fairness";
import SelfExclude from "@/pages/self-exclude";
import VaultPage from "@/pages/vault";
import Shipping from "@/pages/shipping";
import NotFound from "@/pages/not-found";
import Admin from "@/pages/admin";
import ApiDocsPage from "@/pages/api-docs";
import ProductSpecification from "@/pages/product-specification";
import DocsIndex from "@/pages/docs-index";
import B2BIntegration from "@/pages/b2b-integration";
import WhitelabelManagement from "@/pages/whitelabel-management";
import WhitelabelGuide from "@/pages/whitelabel-guide";
import WhitelabelPlatform from "@/pages/whitelabel-platform";

import AdminContentManagement from "@/pages/admin-content-management";

// Footer pages
import TermsOfService from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";
import CookiePolicy from "@/pages/cookies";
import ResponsibleGaming from "@/pages/responsible-gaming";
import AgeVerification from "@/pages/age-verification";
import HelpCenter from "@/pages/help";
import ContactUs from "@/pages/contact";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [whitelabelAuth, setWhitelabelAuth] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  
  // Initialize theme system for developer testing
  const themeSystem = useTheme();
  
  // Simplified - no whitelabel mode checks
  useEffect(() => {
    setChecking(false);
  }, []);

  return (
    <Switch>
      {/* Public documentation routes - accessible without authentication */}
      <Route path="/docs" component={DocsIndex} />
      <Route path="/docs/product-specification" component={ProductSpecification} />
      <Route path="/docs/b2b-integration" component={B2BIntegration} />
      <Route path="/docs/whitelabel-guide" component={WhitelabelGuide} />
      <Route path="/docs/api-reference" component={ApiDocsPage} />
      
      {/* Box opening - accessible without authentication for iframe widgets */}
      <Route path="/box-opening/:id" component={BoxOpening} />
      
      {/* Admin route - accessible without player authentication */}
      <Route path="/admin*" component={Admin} />
      
      {/* Whitelabel platform management route */}
      <Route path="/whitelabel" component={WhitelabelPlatform} />
      

      
      {/* All other routes */}
      <Route>
        {() => {
          if (isLoading) {
            return (
              <div className="min-h-screen flex items-center justify-center cases-bg">
                <div className="cases-card p-8 rounded-lg">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-white mt-4">Loading...</p>
                </div>
              </div>
            );
          }

          // Handle whitelabel mode
          if (isWhitelabelMode) {
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
                    <h2 className="text-2xl font-bold text-white mb-4">Whitelabel Login Required</h2>
                    <p className="text-gray-300 mb-6">Please login to access the whitelabel platform.</p>
                    <Button 
                      onClick={() => window.location.href = '/whitelabel/login'}
                      className="w-full"
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              );
            }
            
            // Whitelabel authenticated - show platform with banner
            return (
              <div className="min-h-screen cases-bg">
                {/* Whitelabel Mode Banner */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="font-semibold">Whitelabel Mode Active</span>
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
                    <Route path="/purchase-history" component={PurchaseHistory} />
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
          } else if (!isAuthenticated) {
            return <Landing />;
          }

          return (
            <div className="min-h-screen cases-bg">
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
                  <Route path="/inventory" component={Inventory} />
                  <Route path="/achievements" component={Achievements} />
                  <Route path="/leaderboards" component={Leaderboards} />
                  <Route path="/battles" component={Battles} />
                  <Route path="/history" component={PurchaseHistory} />
                  <Route path="/market" component={Market} />
                  <Route path="/statistics" component={Statistics} />
                  <Route path="/promotions" component={Promotions} />
                  <Route path="/fairness" component={Fairness} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/self-exclude" component={SelfExclude} />
                  <Route path="/vault" component={VaultPage} />
                  <Route path="/shipping" component={Shipping} />
                  <Route path="/wallet" component={Wallet} />
                  
                  {/* Footer pages - accessible to all users */}
                  <Route path="/terms" component={TermsOfService} />
                  <Route path="/privacy" component={PrivacyPolicy} />
                  <Route path="/cookies" component={CookiePolicy} />
                  <Route path="/responsible-gaming" component={ResponsibleGaming} />
                  <Route path="/age-verification" component={AgeVerification} />
                  <Route path="/help" component={HelpCenter} />
                  <Route path="/contact" component={ContactUs} />

                  {/* Admin routes */}
                  <Route path="/admin" component={Admin} />
                  <Route path="/admin/whitelabels" component={WhitelabelManagement} />
                  <Route path="/admin/content-management" component={AdminContentManagement} />
                  <Route path="/admin/b2b-partners" component={B2BIntegration} />
                  <Route path="/api-docs" component={ApiDocsPage} />
                  <Route path="/product-spec" component={ProductSpecification} />
                  <Route path="/docs" component={DocsIndex} />
                  <Route path="/b2b-integration" component={B2BIntegration} />

                  <Route component={NotFound} />
                </Switch>
              </main>

              {/* Footer */}
              <Footer />

              {/* Mobile Navigation */}
              <div className="block md:hidden">
                <MobileNavigation />
              </div>

              {/* Chat - Desktop only for now */}
              <div className="hidden md:block">
                <Chat 
                  isOpen={isChatOpen} 
                  onToggle={() => setIsChatOpen(!isChatOpen)} 
                />
              </div>
            </div>
          );
        }}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;