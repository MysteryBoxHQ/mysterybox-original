# Rolling Riches B2B Integration Guide

## Quick Start for staging.rollingriches.com

Your B2B integration is ready! Here's everything you need to integrate RollingDrop's mystery box functionality into your staging.rollingriches.com site.

### API Configuration

**Base URL:** `http://localhost:5000`
**API Key:** `test` (for testing - will be replaced with your production key)

### Available Endpoints

#### 1. Get All Boxes
```
GET /api/v1/boxes?api_key=test
```

#### 2. Get Featured Boxes Only
```
GET /api/v1/boxes/featured?api_key=test
```

#### 3. Get Specific Box Details
```
GET /api/v1/boxes/{boxId}?api_key=test
```

#### 4. Open a Mystery Box
```
POST /api/v1/open-box
Headers: X-API-Key: test
Body: {
  "boxId": 54,
  "userId": "your_user_id",
  "userBalance": 100.00
}
```

#### 5. Get API Statistics
```
GET /api/v1/stats?api_key=test
```

### Integration Files Created

1. **`b2b_integration_test.html`** - Full API testing interface
2. **`rolling_riches_widget.html`** - Complete Rolling Riches branded widget
3. This integration guide

### Test Your Integration

1. Open `rolling_riches_widget.html` in your browser
2. Configure the API endpoint and key
3. Click "Test Connection" to verify API access
4. Click "Load Boxes" to display available mystery boxes
5. Try opening a box to test the full flow

### Response Format

**Box List Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 54,
      "name": "Classic Mystery Box",
      "description": "A classic box with everyday items and surprises",
      "price": 9.99,
      "currency": "USD",
      "rarity": "common",
      "imageUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      "featured": false
    }
  ],
  "meta": {
    "total": 16,
    "timestamp": "2025-06-17T16:18:13.838Z"
  }
}
```

**Box Opening Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 185,
      "name": "Classic Mystery Box Rare Item",
      "description": "A rare item from Classic Mystery Box",
      "rarity": "rare",
      "icon": "🏆",
      "value": "25.00"
    },
    "box": {
      "id": 54,
      "name": "Classic Mystery Box",
      "price": 9.99
    },
    "transaction": {
      "cost": 9.99,
      "newBalance": 90.01,
      "profit": 15.01
    }
  },
  "meta": {
    "timestamp": "2025-06-17T16:18:13.838Z",
    "userId": "external_user_123"
  }
}
```

### Available Mystery Boxes

Your API currently has 16 mystery boxes available including:

- **Classic Mystery Box** ($9.99 - Common)
- **Premium Gold Box** ($24.99 - Rare) 
- **Tech Gadget Box** ($19.99 - Uncommon)
- **Luxury Diamond Box** ($99.99 - Legendary)
- **Supreme Vault** ($124.99 - Mythical)
- **LV Collection** ($1,999 - Mythical)
- **Gucci Gang** ($7,000 - Legendary)
- **Gold Finger** ($15,000 - Mythical)

### Rarity System

The platform uses a color-coded rarity system:
- **Common** - Gray (#6b7280)
- **Uncommon** - Green (#10b981)
- **Rare** - Blue (#3b82f6)
- **Epic** - Purple (#8b5cf6)
- **Legendary** - Orange (#f59e0b)
- **Mythical** - Red (#ef4444)

### Next Steps

1. **Test the integration** using the provided HTML files
2. **Customize styling** to match your Rolling Riches branding
3. **Implement user balance management** in your existing system
4. **Set up webhook endpoints** for real-time notifications (optional)
5. **Request production API credentials** when ready to go live

### Support

The API includes comprehensive error handling and returns detailed error messages for debugging. All endpoints support both query parameter (`?api_key=test`) and header-based (`X-API-Key: test`) authentication.

Your integration is now ready for testing on staging.rollingriches.com!