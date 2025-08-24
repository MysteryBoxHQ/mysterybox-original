import { Link } from "wouter";
import { Package, Shield, HelpCircle, Users, FileText, Mail, Github, Twitter, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900/95 border-t border-gray-800 mt-12 mb-20 md:mb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RollingDrop</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The premier mystery box platform featuring luxury branded collectibles with provably fair mechanics and exciting rewards.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Platform</h3>
            <div className="space-y-2">
              <Link href="/">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">
                  Mystery Boxes
                </div>
              </Link>
              <Link href="/market">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">
                  Marketplace
                </div>
              </Link>
              <Link href="/battles">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">
                  Case Battles
                </div>
              </Link>
              <Link href="/leaderboards">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">
                  Leaderboards
                </div>
              </Link>
              <Link href="/promotions">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">
                  Promotions
                </div>
              </Link>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Support</h3>
            <div className="space-y-2">
              <Link href="/fairness">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors flex items-center space-x-2">
                  <Shield className="w-3 h-3" />
                  <span>Provably Fair</span>
                </div>
              </Link>
              <Link href="/help">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors flex items-center space-x-2">
                  <HelpCircle className="w-3 h-3" />
                  <span>Help Center</span>
                </div>
              </Link>
              <Link href="/contact">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors flex items-center space-x-2">
                  <Mail className="w-3 h-3" />
                  <span>Contact Us</span>
                </div>
              </Link>
              <Link href="/responsible-gaming">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors flex items-center space-x-2">
                  <Users className="w-3 h-3" />
                  <span>Responsible Gaming</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Legal</h3>
            <div className="space-y-2">
              <Link href="/terms">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors flex items-center space-x-2">
                  <FileText className="w-3 h-3" />
                  <span>Terms of Service</span>
                </div>
              </Link>
              <Link href="/privacy">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors flex items-center space-x-2">
                  <FileText className="w-3 h-3" />
                  <span>Privacy Policy</span>
                </div>
              </Link>
              <Link href="/cookies">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors flex items-center space-x-2">
                  <FileText className="w-3 h-3" />
                  <span>Cookie Policy</span>
                </div>
              </Link>
              <Link href="/age-verification">
                <div className="text-gray-400 hover:text-white text-sm cursor-pointer transition-colors flex items-center space-x-2">
                  <FileText className="w-3 h-3" />
                  <span>Age Verification</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} RollingDrop. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Licensed & Regulated</span>
                <span>•</span>
                <span>SSL Secured</span>
                <span>•</span>
                <span>Provably Fair</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500">
                18+ Only
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500">Gambling Commission</span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible Gaming Notice */}
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-yellow-400 font-medium text-sm">Responsible Gaming</h4>
              <p className="text-gray-300 text-xs leading-relaxed">
                RollingDrop is committed to responsible gaming. Please play responsibly and within your means. 
                If you need help with gambling addiction, visit <span className="text-yellow-400 underline cursor-pointer">BeGambleAware.org</span> or contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}