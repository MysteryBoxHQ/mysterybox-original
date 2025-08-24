import { useState, useEffect } from 'react';

export type Theme = 'cosmic-blue' | 'neon-cyber' | 'warm-sunset' | 'emerald-night' | 'royal-purple' | 'fire-orange';

const themes = {
  'cosmic-blue': {
    name: 'Cosmic Blue',
    description: 'Deep space blues with purple accents (current)',
    colors: {
      background: '220 100% 4%',
      foreground: '210 40% 98%',
      muted: '240 38% 15%',
      'muted-foreground': '215 20% 65%',
      popover: '235 100% 8%',
      'popover-foreground': '210 40% 98%',
      card: '225 39% 11%',
      'card-foreground': '210 40% 98%',
      border: '240 30% 18%',
      input: '240 30% 18%',
      primary: '217 91% 65%',
      'primary-foreground': '210 40% 98%',
      secondary: '240 38% 20%',
      'secondary-foreground': '210 40% 98%',
      accent: '280 100% 70%',
      'accent-foreground': '210 40% 98%',
      destructive: '0 84% 60%',
      'destructive-foreground': '210 40% 98%',
      ring: '217 91% 65%'
    }
  },
  'neon-cyber': {
    name: 'Neon Cyber',
    description: 'Cyberpunk vibes with electric green and pink',
    colors: {
      background: '180 100% 2%',
      foreground: '180 20% 95%',
      muted: '180 50% 8%',
      'muted-foreground': '180 15% 60%',
      popover: '180 100% 3%',
      'popover-foreground': '180 20% 95%',
      card: '180 40% 6%',
      'card-foreground': '180 20% 95%',
      border: '180 30% 12%',
      input: '180 30% 12%',
      primary: '140 100% 50%',
      'primary-foreground': '180 100% 2%',
      secondary: '300 100% 60%',
      'secondary-foreground': '180 20% 95%',
      accent: '320 100% 70%',
      'accent-foreground': '180 100% 2%',
      destructive: '0 100% 60%',
      'destructive-foreground': '180 20% 95%',
      ring: '140 100% 50%'
    }
  },
  'warm-sunset': {
    name: 'Warm Sunset',
    description: 'Cozy oranges and reds with golden accents',
    colors: {
      background: '20 80% 3%',
      foreground: '30 40% 95%',
      muted: '25 60% 8%',
      'muted-foreground': '25 20% 60%',
      popover: '20 90% 4%',
      'popover-foreground': '30 40% 95%',
      card: '22 50% 7%',
      'card-foreground': '30 40% 95%',
      border: '25 40% 15%',
      input: '25 40% 15%',
      primary: '30 100% 60%',
      'primary-foreground': '20 80% 3%',
      secondary: '15 80% 50%',
      'secondary-foreground': '30 40% 95%',
      accent: '45 100% 65%',
      'accent-foreground': '20 80% 3%',
      destructive: '0 84% 60%',
      'destructive-foreground': '30 40% 95%',
      ring: '30 100% 60%'
    }
  },
  'emerald-night': {
    name: 'Emerald Night',
    description: 'Rich greens with teal highlights',
    colors: {
      background: '160 100% 2%',
      foreground: '150 30% 95%',
      muted: '155 70% 6%',
      'muted-foreground': '155 20% 60%',
      popover: '160 100% 3%',
      'popover-foreground': '150 30% 95%',
      card: '158 60% 5%',
      'card-foreground': '150 30% 95%',
      border: '155 40% 12%',
      input: '155 40% 12%',
      primary: '170 100% 55%',
      'primary-foreground': '160 100% 2%',
      secondary: '140 70% 40%',
      'secondary-foreground': '150 30% 95%',
      accent: '185 100% 60%',
      'accent-foreground': '160 100% 2%',
      destructive: '0 84% 60%',
      'destructive-foreground': '150 30% 95%',
      ring: '170 100% 55%'
    }
  },
  'royal-purple': {
    name: 'Royal Purple',
    description: 'Majestic purples with gold highlights',
    colors: {
      background: '270 100% 3%',
      foreground: '280 30% 95%',
      muted: '275 70% 7%',
      'muted-foreground': '275 20% 60%',
      popover: '270 100% 4%',
      'popover-foreground': '280 30% 95%',
      card: '272 60% 6%',
      'card-foreground': '280 30% 95%',
      border: '275 40% 14%',
      input: '275 40% 14%',
      primary: '285 100% 65%',
      'primary-foreground': '270 100% 3%',
      secondary: '260 80% 50%',
      'secondary-foreground': '280 30% 95%',
      accent: '45 100% 70%',
      'accent-foreground': '270 100% 3%',
      destructive: '0 84% 60%',
      'destructive-foreground': '280 30% 95%',
      ring: '285 100% 65%'
    }
  },
  'fire-orange': {
    name: 'Fire Orange',
    description: 'Intense reds and oranges with copper accents',
    colors: {
      background: '10 100% 3%',
      foreground: '20 40% 95%',
      muted: '15 80% 7%',
      'muted-foreground': '15 25% 60%',
      popover: '10 100% 4%',
      'popover-foreground': '20 40% 95%',
      card: '12 70% 6%',
      'card-foreground': '20 40% 95%',
      border: '15 50% 14%',
      input: '15 50% 14%',
      primary: '20 100% 60%',
      'primary-foreground': '10 100% 3%',
      secondary: '5 90% 50%',
      'secondary-foreground': '20 40% 95%',
      accent: '35 100% 65%',
      'accent-foreground': '10 100% 3%',
      destructive: '0 84% 60%',
      'destructive-foreground': '20 40% 95%',
      ring: '20 100% 60%'
    }
  }
};

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('cosmic-blue');

  useEffect(() => {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme') as Theme;
    
    console.log('Theme system initializing...', { urlTheme, availableThemes: Object.keys(themes) });
    
    if (urlTheme && themes[urlTheme]) {
      console.log('Applying URL theme:', urlTheme);
      setCurrentTheme(urlTheme);
      applyTheme(urlTheme);
      localStorage.setItem('theme', urlTheme);
      return;
    }
    
    // Fall back to localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      console.log('Applying saved theme:', savedTheme);
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      console.log('Using default theme: cosmic-blue');
      applyTheme('cosmic-blue');
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    const themeColors = themes[theme].colors;
    
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    console.log(`Theme applied: ${themes[theme].name}`);
  };

  // Expose theme switching function to window for console access
  useEffect(() => {
    const globalSwitchTheme = (themeName: Theme) => {
      if (themes[themeName]) {
        setCurrentTheme(themeName);
        applyTheme(themeName);
        localStorage.setItem('theme', themeName);
        console.log(`✓ Switched to theme: ${themes[themeName].name}`);
      } else {
        console.log('❌ Theme not found. Available themes:', Object.keys(themes));
      }
    };
    
    const globalListThemes = () => {
      console.log('🎨 Available themes:');
      Object.entries(themes).forEach(([key, theme]) => {
        console.log(`  ${key}: ${theme.description}`);
      });
      console.log('\n💡 Usage: switchTheme("theme-name")');
    };

    // Expose to global window object
    (window as any).switchTheme = globalSwitchTheme;
    (window as any).listThemes = globalListThemes;
    
    // Also expose themes object for inspection
    (window as any).availableThemes = Object.keys(themes);
    
    console.log('🎨 Theme system ready! Type listThemes() to see options.');
    
    // Cleanup on unmount
    return () => {
      delete (window as any).switchTheme;
      delete (window as any).listThemes;
      delete (window as any).availableThemes;
    };
  }, [setCurrentTheme]);

  const switchTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return {
    currentTheme,
    themes,
    switchTheme,
    availableThemes: Object.keys(themes) as Theme[]
  };
}