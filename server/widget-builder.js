const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

// Widget-specific Tailwind config
const widgetTailwindConfig = {
  content: [
    './client/src/widget.css',
    './server/routes.ts' // For dynamic class generation
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'widget-bg': '#0d1117',
        'widget-card': '#1e2328',
        'widget-border': '#2a2d33',
        'widget-text': '#e6edf3',
        'widget-text-muted': '#8b949e',
        'widget-accent': '#58a6ff',
        'widget-success': '#238636',
        'widget-warning': '#f85149',
      }
    }
  },
  plugins: []
};

async function buildWidgetCSS() {
  try {
    const inputCSS = fs.readFileSync(path.join(__dirname, '../client/src/widget.css'), 'utf8');
    
    const result = await postcss([
      tailwindcss(widgetTailwindConfig),
      autoprefixer
    ]).process(inputCSS, {
      from: path.join(__dirname, '../client/src/widget.css'),
      to: path.join(__dirname, '../server/widget.min.css')
    });

    // Minify the CSS
    const minifiedCSS = result.css
      .replace(/\s+/g, ' ')
      .replace(/;\s*/g, ';')
      .replace(/{\s*/g, '{')
      .replace(/}\s*/g, '}')
      .replace(/,\s*/g, ',')
      .trim();

    fs.writeFileSync(path.join(__dirname, '../server/widget.min.css'), minifiedCSS);
    console.log('Widget CSS built successfully');
    return minifiedCSS;
  } catch (error) {
    console.error('Error building widget CSS:', error);
    return '';
  }
}

module.exports = { buildWidgetCSS };