import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Package, Trophy, Settings } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Cases", icon: Home },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/achievements", label: "Achievements", icon: Trophy },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}