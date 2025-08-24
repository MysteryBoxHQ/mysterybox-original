import { useState } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';

export function ThemeSwitcher() {
  const { currentTheme, themes, switchTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 px-3 bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-200"
        >
          <Palette className="h-4 w-4 mr-2" />
          {themes[currentTheme].name}
          <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <div className="text-xs text-muted-foreground mb-2 px-2">
          Choose Color Theme
        </div>
        {availableThemes.map((themeKey) => {
          const theme = themes[themeKey];
          const isActive = currentTheme === themeKey;
          
          return (
            <DropdownMenuItem
              key={themeKey}
              onClick={() => switchTheme(themeKey)}
              className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {isActive ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <div className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{theme.name}</span>
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {theme.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}