import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Home,
  Package,
  Users,
  ShoppingCart,
  Settings,
  FileText,
  Shield,
  DollarSign,
  Award,
  BarChart3,
  MessageSquare,
  ImageIcon,
  Tags,
  Globe,
  Edit3,
  Lock,
  CreditCard,
  UserCheck,
  Sword,
  BookOpen,
  Phone,
  HelpCircle,
  Cookie,
  Scale,
  Eye,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout?: () => void;
  onNavigate?: (section: string) => void;
}

export default function AdminSidebar({ collapsed, setCollapsed, onLogout, onNavigate }: AdminSidebarProps) {
  const [location, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const menuSections = [
    {
      id: 'main',
      title: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/admin' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
      ]
    },
    {
      id: 'box-management',
      title: 'Box Management',
      items: [
        { icon: Package, label: 'Boxes', path: '/admin/boxes' },
        { icon: Tags, label: 'Products', path: '/admin/products' },
      ]
    },
    {
      id: 'admin-users',
      title: 'Admin Users',
      items: [
        { icon: Shield, label: 'Admin Users', path: '/admin/admin-users' },
      ]
    },
    {
      id: 'players',
      title: 'Player Management',
      items: [
        { icon: Users, label: 'Players', path: '/admin/players' },
      ]
    },
    {
      id: 'orders',
      title: 'Orders & Transactions',
      items: [
        { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
        { icon: UserCheck, label: 'Approve Orders', path: '/admin/approve-orders' },
        { icon: DollarSign, label: 'Transactions', path: '/admin/transactions' },
        { icon: CreditCard, label: 'Deposits', path: '/admin/deposits' },
      ]
    },
    {
      id: 'battles',
      title: 'Battle System',
      items: [
        { icon: Sword, label: 'Battle Players', path: '/admin/battle-players' },
        { icon: Award, label: 'Battle Content', path: '/admin/battle-content' },
      ]
    },
    {
      id: 'promotions',
      title: 'Promotions & Rewards',
      items: [
        { icon: Award, label: 'Promotions', path: '/admin/promotions' },
        { icon: Award, label: 'Achievements', path: '/admin/achievements' },
      ]
    },
    {
      id: 'content-management',
      title: 'Content Management',
      items: [
        { icon: FileText, label: 'Content', path: '/admin/content' },
      ]
    },
    {
      id: 'whitelabel',
      title: 'Whitelabel Management',
      items: [
        { icon: Globe, label: 'Whitelabel Sites', path: '/admin/whitelabel' },
      ]
    },
    {
      id: 'partners',
      title: 'B2B Partners',
      items: [
        { icon: Globe, label: 'Partner Management', path: '/admin/partners' },
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      items: [
        { icon: Settings, label: 'Admin Account', path: '/admin/admin-account' },
      ]
    }
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-start text-white hover:bg-gray-800"
        >
          {collapsed ? '→' : '←'} {!collapsed && 'Collapse'}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="px-3 py-2">
          {menuSections.map((section) => (
            <div key={section.id} className="mb-4">
              {!collapsed && (
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-400 hover:text-white hover:bg-gray-800 mb-2"
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="text-sm font-semibold">{section.title}</span>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              {(collapsed || expandedSections.includes(section.id)) && (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 ${
                        isActive(item.path) ? 'bg-gray-800 text-white' : ''
                      } ${collapsed ? 'px-2' : 'px-3'}`}
                      onClick={() => {
                        console.log('Navigating to:', item.path);
                        if (onNavigate) {
                          // Convert path to section name
                          const section = item.path.replace('/admin/', '') || 'dashboard';
                          console.log('Setting active section to:', section);
                          onNavigate(section);
                        } else {
                          setLocation(item.path);
                        }
                      }}
                    >
                      <item.icon className={`w-4 h-4 ${collapsed ? '' : 'mr-3'}`} />
                      {!collapsed && <span className="text-sm">{item.label}</span>}
                    </Button>
                  ))}
                </div>
              )}
              
              {!collapsed && <Separator className="mt-3 bg-gray-700" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}