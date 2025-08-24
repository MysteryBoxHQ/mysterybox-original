# Developer Theme Testing Guide

This guide allows you to experiment with different color themes during development.

## Available Themes

1. **cosmic-blue** (Default) - Deep space blues with purple accents
2. **neon-cyber** - Cyberpunk vibes with electric green and pink
3. **warm-sunset** - Cozy oranges and reds with golden accents
4. **emerald-night** - Rich greens with teal highlights  
5. **royal-purple** - Majestic purples with gold highlights
6. **fire-orange** - Intense reds and oranges with copper accents

## Quick Theme Switching

### Method 1: Browser Console Functions (Recommended)
Open browser console (F12) and run:

```javascript
// Switch to any theme instantly
switchTheme('neon-cyber')
switchTheme('warm-sunset')
switchTheme('emerald-night')
switchTheme('royal-purple')
switchTheme('fire-orange')

// List all available themes
listThemes()

// Reset to default
switchTheme('cosmic-blue')
```

### Method 2: LocalStorage Method
```javascript
localStorage.setItem('theme', 'neon-cyber'); window.location.reload();
```

### Method 3: Direct CSS Variable Override
```javascript
// Neon Cyber theme
document.documentElement.style.setProperty('--primary', '140 100% 50%');
document.documentElement.style.setProperty('--accent', '320 100% 70%');
document.documentElement.style.setProperty('--background', '180 100% 2%');

// Warm Sunset theme  
document.documentElement.style.setProperty('--primary', '30 100% 60%');
document.documentElement.style.setProperty('--accent', '45 100% 65%');
document.documentElement.style.setProperty('--background', '20 80% 3%');
```

## Reset to Default
```javascript
switchTheme('cosmic-blue')
// OR
localStorage.removeItem('theme'); window.location.reload();
```

## Original Theme Backup
Your original Cosmic Blue theme is preserved in `client/src/index-original.css`