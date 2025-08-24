import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Star, Coins, Trophy, Zap } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';

interface ThemePreviewProps {
  theme: Theme;
  isActive: boolean;
  onSelect: (theme: Theme) => void;
}

function ThemePreviewCard({ theme, isActive, onSelect }: ThemePreviewProps) {
  const { themes } = useTheme();
  const themeData = themes[theme];

  return (
    <div 
      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
        isActive ? 'border-primary shadow-lg shadow-primary/25' : 'border-border/30 hover:border-border/60'
      }`}
      style={{
        background: `hsl(${themeData.colors.card})`,
        borderColor: isActive ? `hsl(${themeData.colors.primary})` : undefined
      }}
      onClick={() => onSelect(theme)}
    >
      {/* Color Palette */}
      <div className="flex gap-2 mb-3">
        <div 
          className="w-6 h-6 rounded-full border-2 border-white/20"
          style={{ backgroundColor: `hsl(${themeData.colors.primary})` }}
        />
        <div 
          className="w-6 h-6 rounded-full border-2 border-white/20"
          style={{ backgroundColor: `hsl(${themeData.colors.accent})` }}
        />
        <div 
          className="w-6 h-6 rounded-full border-2 border-white/20"
          style={{ backgroundColor: `hsl(${themeData.colors.secondary})` }}
        />
      </div>

      {/* Theme Name */}
      <h3 
        className="font-semibold text-lg mb-2"
        style={{ color: `hsl(${themeData.colors.foreground})` }}
      >
        {themeData.name}
      </h3>

      {/* Description */}
      <p 
        className="text-sm mb-4 opacity-80"
        style={{ color: `hsl(${themeData.colors['muted-foreground']})` }}
      >
        {themeData.description}
      </p>

      {/* Preview Elements */}
      <div className="space-y-3">
        {/* Button Preview */}
        <button
          className="w-full py-2 px-4 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: `hsl(${themeData.colors.primary})`,
            color: `hsl(${themeData.colors['primary-foreground']})`
          }}
        >
          Open Box - $5.99
        </button>

        {/* Card Preview */}
        <div 
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: `hsl(${themeData.colors.muted})`,
            borderColor: `hsl(${themeData.colors.border})`
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4" style={{ color: `hsl(${themeData.colors.accent})` }} />
            <span 
              className="text-sm font-medium"
              style={{ color: `hsl(${themeData.colors.foreground})` }}
            >
              Legendary Item
            </span>
          </div>
          <div 
            className="text-xs opacity-75"
            style={{ color: `hsl(${themeData.colors['muted-foreground']})` }}
          >
            Rare drop chance: 2.5%
          </div>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -top-2 -right-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `hsl(${themeData.colors.primary})` }}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}

export function ThemePreview() {
  const { currentTheme, themes, switchTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme>(currentTheme);

  const handlePreview = (theme: Theme) => {
    setPreviewTheme(theme);
  };

  const handleApply = () => {
    switchTheme(previewTheme);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-3">
          <Eye className="h-4 w-4 mr-2" />
          Preview Themes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">
            Choose Your Theme
          </DialogTitle>
          <p className="text-muted-foreground">
            Select a color theme that matches your style. All changes are saved automatically.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {availableThemes.map((theme) => (
            <ThemePreviewCard
              key={theme}
              theme={theme}
              isActive={theme === currentTheme}
              onSelect={handlePreview}
            />
          ))}
        </div>

        {/* Live Preview Section */}
        <div className="mt-8 p-6 border rounded-xl bg-card/50">
          <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mock Box Card */}
            <Card className="overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-3 left-3">
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Legendary
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Galaxy Box</CardTitle>
                <CardDescription>Contains rare cosmic items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">$12.99</span>
                  </div>
                  <Button size="sm" className="h-8">
                    <Zap className="w-3 h-3 mr-1" />
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mock Stats Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Stats</CardTitle>
                <CardDescription>Recent activity overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Boxes Opened</span>
                  <span className="font-semibold">247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="font-semibold text-green-500">$1,856.32</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Best Drop</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                    Mythical Sword
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={previewTheme === currentTheme}>
            Apply Theme
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}