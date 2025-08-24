# Rolling Riches B2B Integration Guide

## Overview
This guide provides complete integration instructions for embedding RollingDrop's mystery box platform into Rolling Riches' casino website.

## Production Widget URL
```
https://0d2da366-1f84-4d2a-a5a9-b4efb6f2e012-00-1d28ji46vsr2s.picard.replit.dev/api/widget/iframe?partner=rolling-riches
```

## Integration Code

### Basic Iframe Embedding
```html
<iframe 
  src="https://0d2da366-1f84-4d2a-a5a9-b4efb6f2e012-00-1d28ji46vsr2s.picard.replit.dev/api/widget/iframe?partner=rolling-riches"
  width="100%"
  height="800px"
  frameborder="0"
  allowfullscreen
  allow="fullscreen; payment; microphone; camera"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
  loading="lazy">
</iframe>
```

### Responsive Container Integration
```html
<div class="mystery-box-container">
  <iframe 
    id="rollingdrop-widget"
    src="https://0d2da366-1f84-4d2a-a5a9-b4efb6f2e012-00-1d28ji46vsr2s.picard.replit.dev/api/widget/iframe?partner=rolling-riches"
    style="width: 100%; height: 800px; border: none; border-radius: 10px;"
    allowfullscreen
    allow="fullscreen; payment; microphone; camera"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation">
  </iframe>
</div>

<style>
.mystery-box-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border-radius: 15px;
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .mystery-box-container {
    padding: 10px;
  }
  
  #rollingdrop-widget {
    height: 600px;
  }
}
</style>
```

## Widget Features

### Navigation Tabs
- **Boxes**: Complete mystery box catalog with prices and descriptions
- **Battles**: Case opening battles (coming soon)
- **Inventory**: User inventory management (coming soon)
- **Leaderboard**: Player rankings (coming soon)

### Box Display
- High-quality box images
- Detailed descriptions
- Pricing in USD
- Rarity indicators (Common, Rare, Epic, Legendary, Mythical)
- Interactive "Open Box" buttons

### Partner Branding
- Header displays "Rolling Riches" branding
- Footer shows "Powered by RollingDrop Platform | Partner: rolling-riches"
- Consistent theme matching Rolling Riches' design

## Cross-Domain Communication

### Available Message Types
The widget sends messages to the parent window for integration tracking:

```javascript
// Widget ready
{
  type: 'widget_ready',
  partner: 'rolling-riches',
  section: 'boxes',
  boxCount: 12,
  timestamp: Date.now()
}

// Section navigation
{
  type: 'section_changed',
  section: 'boxes|battles|inventory|leaderboard',
  partner: 'rolling-riches',
  timestamp: Date.now()
}

// Box opening event
{
  type: 'box_opening',
  boxId: 123,
  partner: 'rolling-riches',
  timestamp: Date.now()
}
```

### Integration Tracking
```javascript
window.addEventListener('message', function(event) {
  if (event.data.type === 'box_opening') {
    // Track box opening in Rolling Riches analytics
    gtag('event', 'mystery_box_opened', {
      box_id: event.data.boxId,
      partner: event.data.partner
    });
  }
  
  if (event.data.type === 'widget_ready') {
    console.log('RollingDrop widget loaded with', event.data.boxCount, 'boxes');
  }
});
```

## URL Parameters

### Basic Parameters
- `partner=rolling-riches` (required) - Identifies Rolling Riches as the partner
- `theme=dark` (optional) - Widget theme (default: dark)
- `currency=USD` (optional) - Display currency (default: USD)

### Example URLs
```
# Basic integration
/api/widget/iframe?partner=rolling-riches

# Custom theme
/api/widget/iframe?partner=rolling-riches&theme=dark&currency=USD

# Different section (future feature)
/api/widget/iframe?partner=rolling-riches&section=battles
```

## Security & Performance

### Security Headers
- Content Security Policy configured for iframe embedding
- CORS headers allow Rolling Riches domain access
- Sandbox attributes prevent malicious script execution

### Performance Optimization
- Lazy loading supported
- Responsive design adapts to container size
- Efficient box data loading
- Cross-domain messaging for minimal overhead

## Integration Testing

### Test Checklist
- [ ] Widget loads correctly in Rolling Riches website
- [ ] All mystery boxes display with correct information
- [ ] Partner branding shows "Rolling Riches" in header
- [ ] Navigation tabs are functional
- [ ] Box opening animations work
- [ ] Cross-domain messages are received
- [ ] Responsive design works on mobile devices

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Support & Monitoring

### Analytics Integration
Track widget performance using the cross-domain messages:
- Widget load time
- Section navigation patterns
- Box opening rates
- User engagement metrics

### Error Handling
```javascript
const iframe = document.getElementById('rollingdrop-widget');
iframe.onerror = function() {
  console.error('RollingDrop widget failed to load');
  // Show fallback content or retry logic
};
```

### Performance Monitoring
```javascript
const startTime = performance.now();
window.addEventListener('message', function(event) {
  if (event.data.type === 'widget_ready') {
    const loadTime = performance.now() - startTime;
    console.log(`Widget loaded in ${loadTime}ms`);
  }
});
```

## Next Steps

1. **Integration**: Add the iframe code to Rolling Riches' mystery box page
2. **Testing**: Verify functionality across different devices and browsers
3. **Analytics**: Implement tracking for box opening events
4. **Customization**: Request additional branding or feature customizations if needed

## Contact & Support

For technical support or customization requests:
- Widget API: Available 24/7
- Real-time monitoring: Active
- Partner support: Available for integration assistance

---

**Widget Status**: ✅ Production Ready
**Partner**: Rolling Riches Casino
**Integration Type**: B2B Iframe Widget
**Last Updated**: December 2024