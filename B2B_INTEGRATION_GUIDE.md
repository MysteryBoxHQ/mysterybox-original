# RollingDrop B2B Integration Guide

## Overview
This guide provides complete implementation details for B2B partners to integrate RollingDrop mystery box functionality into their existing platforms using our iframe widget system.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Frontend Integration](#frontend-integration)
3. [Backend API Integration](#backend-api-integration)
4. [User Management](#user-management)
5. [Payment Flow](#payment-flow)
6. [Security & Authentication](#security--authentication)
7. [Customization Options](#customization-options)
8. [Testing & Development](#testing--development)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Minimum Requirements
- Iframe support in your frontend
- JavaScript cross-domain messaging capability
- Backend API to handle payment processing
- User authentication system
- Balance/wallet management (optional)

### Integration Time: ~2-4 hours for basic setup

---

## Frontend Integration

### 1. Basic Iframe Embedding

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Site - Mystery Boxes</title>
</head>
<body>
    <!-- Mystery Box Widget Container -->
    <div id="mystery-box-section">
        <h2>Mystery Boxes</h2>
        
        <!-- Loading State -->
        <div id="loading-state" style="text-align: center; padding: 40px;">
            <div>Loading mystery boxes...</div>
        </div>
        
        <!-- RollingDrop Widget Iframe -->
        <iframe 
            id="rollingdrop-widget"
            src="https://your-rollingdrop-instance.com/widget/iframe?partner=your-partner-id"
            width="100%"
            height="700px"
            frameborder="0"
            allowfullscreen
            style="display: none;">
        </iframe>
    </div>

    <script src="integration.js"></script>
</body>
</html>
```

### 2. JavaScript Integration Manager

```javascript
// integration.js
class RollingDropIntegration {
    constructor(config) {
        this.config = {
            partnerId: config.partnerId,
            apiEndpoint: config.apiEndpoint,
            widgetUrl: config.widgetUrl,
            currentUser: config.currentUser,
            ...config
        };
        
        this.iframe = document.getElementById('rollingdrop-widget');
        this.loadingState = document.getElementById('loading-state');
        
        this.initialize();
    }
    
    initialize() {
        console.log('🎮 Initializing RollingDrop integration...');
        this.setupMessageListener();
        this.showWidget();
    }
    
    showWidget() {
        setTimeout(() => {
            this.loadingState.style.display = 'none';
            this.iframe.style.display = 'block';
        }, 1000);
    }
    
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // Security: Only accept messages from RollingDrop domain
            if (event.origin !== this.config.widgetUrl.split('/')[0] + '//' + this.config.widgetUrl.split('/')[2]) {
                return;
            }
            
            switch (event.data.type) {
                case 'rollingdrop_widget_loaded':
                    this.handleWidgetLoaded(event.data);
                    break;
                    
                case 'mystery_box_purchase':
                    this.handlePurchaseRequest(event.data.data);
                    break;
                    
                case 'widget_error':
                    this.handleWidgetError(event.data);
                    break;
            }
        });
    }
    
    handleWidgetLoaded(data) {
        console.log('✅ RollingDrop widget loaded successfully');
        this.showWidget();
    }
    
    async handlePurchaseRequest(purchaseData) {
        console.log('💳 Processing purchase request:', purchaseData);
        
        try {
            // 1. Validate user has sufficient balance
            if (!this.validateUserBalance(purchaseData.price)) {
                this.sendPaymentFailure(purchaseData, 'Insufficient balance');
                return;
            }
            
            // 2. Show your payment UI
            this.showPaymentModal(purchaseData);
            
            // 3. Process payment on your backend
            const paymentResult = await this.processPayment(purchaseData);
            
            // 4. Send purchase to RollingDrop
            const boxResult = await this.sendPurchaseToRollingDrop(purchaseData, paymentResult);
            
            // 5. Update user balance and notify widget
            await this.updateUserBalance(purchaseData.price);
            this.sendPaymentSuccess(purchaseData, boxResult);
            
            // 6. Show success notification
            this.showSuccessNotification(boxResult);
            
        } catch (error) {
            console.error('Payment failed:', error);
            this.sendPaymentFailure(purchaseData, error.message);
        } finally {
            this.hidePaymentModal();
        }
    }
    
    validateUserBalance(amount) {
        return this.config.currentUser.balance >= amount;
    }
    
    showPaymentModal(purchaseData) {
        // Implement your payment modal UI
        const modal = document.createElement('div');
        modal.id = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h3>Confirm Purchase</h3>
                    <div class="purchase-details">
                        <img src="${purchaseData.boxImage}" alt="${purchaseData.boxName}" width="80" height="80">
                        <div>
                            <h4>${purchaseData.boxName}</h4>
                            <div class="price">$${purchaseData.price}</div>
                        </div>
                    </div>
                    <div class="balance-info">
                        Current Balance: $${this.config.currentUser.balance}
                        New Balance: $${(this.config.currentUser.balance - purchaseData.price).toFixed(2)}
                    </div>
                    <div class="loading-spinner" style="display: none;">
                        Processing payment...
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    hidePaymentModal() {
        const modal = document.getElementById('payment-modal');
        if (modal) modal.remove();
    }
    
    async processPayment(purchaseData) {
        // Call your backend payment processing endpoint
        const response = await fetch('/api/payments/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.userToken}`
            },
            body: JSON.stringify({
                userId: this.config.currentUser.id,
                amount: purchaseData.price,
                description: `Mystery Box: ${purchaseData.boxName}`,
                metadata: {
                    boxId: purchaseData.boxId,
                    partner: this.config.partnerId
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('Payment processing failed');
        }
        
        return await response.json();
    }
    
    async sendPurchaseToRollingDrop(purchaseData, paymentResult) {
        const purchasePayload = {
            partner: this.config.partnerId,
            userId: this.config.currentUser.id,
            boxId: purchaseData.boxId,
            transactionId: paymentResult.transactionId,
            amount: purchaseData.price,
            paymentMethod: 'partner_balance',
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch(`${this.config.apiEndpoint}/api/partner/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(purchasePayload)
        });
        
        if (!response.ok) {
            throw new Error('Box opening failed');
        }
        
        return await response.json();
    }
    
    async updateUserBalance(amount) {
        // Update user balance in your system
        await fetch('/api/users/deduct-balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.userToken}`
            },
            body: JSON.stringify({
                userId: this.config.currentUser.id,
                amount: amount
            })
        });
        
        // Update local user object
        this.config.currentUser.balance -= amount;
    }
    
    sendPaymentSuccess(purchaseData, boxResult) {
        this.iframe.contentWindow.postMessage({
            type: 'payment_completed',
            data: {
                success: true,
                purchaseId: boxResult.purchaseId,
                item: boxResult.item,
                transactionId: purchaseData.transactionId
            }
        }, this.config.widgetUrl);
    }
    
    sendPaymentFailure(purchaseData, errorMessage) {
        this.iframe.contentWindow.postMessage({
            type: 'payment_completed',
            data: {
                success: false,
                error: errorMessage,
                purchaseId: purchaseData.purchaseId
            }
        }, this.config.widgetUrl);
    }
    
    showSuccessNotification(boxResult) {
        // Show success notification with won item
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 Congratulations!</h3>
                <div class="won-item">
                    <img src="${boxResult.item.icon}" alt="${boxResult.item.name}" width="60" height="60">
                    <div>
                        <h4>${boxResult.item.name}</h4>
                        <div class="rarity rarity-${boxResult.item.rarity}">${boxResult.item.rarity}</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => notification.remove(), 5000);
    }
    
    handleWidgetError(errorData) {
        console.error('Widget error:', errorData);
        // Handle widget errors gracefully
    }
}

// Initialize the integration
document.addEventListener('DOMContentLoaded', () => {
    // Get current user from your authentication system
    const currentUser = getCurrentUser(); // Your implementation
    
    const integration = new RollingDropIntegration({
        partnerId: 'your-partner-id',
        apiEndpoint: 'https://your-rollingdrop-instance.com',
        widgetUrl: 'https://your-rollingdrop-instance.com',
        currentUser: currentUser,
        userToken: getUserToken() // Your implementation
    });
});
```

---

## Backend API Integration

### 1. Payment Processing Endpoint

```javascript
// Example: Node.js/Express endpoint
app.post('/api/payments/process', authenticateUser, async (req, res) => {
    try {
        const { userId, amount, description, metadata } = req.body;
        
        // 1. Validate user
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // 2. Check balance
        if (user.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        // 3. Create transaction record
        const transaction = await createTransaction({
            userId,
            amount,
            type: 'mystery_box_purchase',
            description,
            metadata,
            status: 'completed'
        });
        
        // 4. Deduct balance
        await updateUserBalance(userId, -amount);
        
        res.json({
            success: true,
            transactionId: transaction.id,
            newBalance: user.balance - amount
        });
        
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
});
```

### 2. Balance Management

```javascript
// Balance deduction endpoint
app.post('/api/users/deduct-balance', authenticateUser, async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        // Update user balance in your database
        const updatedUser = await updateUserBalance(userId, -amount);
        
        res.json({
            success: true,
            newBalance: updatedUser.balance
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Balance update failed' });
    }
});

// Get user balance
app.get('/api/users/:userId/balance', authenticateUser, async (req, res) => {
    try {
        const user = await getUserById(req.params.userId);
        res.json({ balance: user.balance });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});
```

### 3. Inventory Management (Optional)

```javascript
// Get user's won items from RollingDrop
app.get('/api/users/:userId/mystery-items', authenticateUser, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Call RollingDrop API to get user's inventory
        const response = await fetch(`${ROLLINGDROP_API}/api/partner/inventory/${userId}?partner=${PARTNER_ID}`);
        const inventory = await response.json();
        
        res.json(inventory);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});
```

---

## User Management

### 1. User Authentication Integration

```javascript
// Middleware to get current user for widget
function getCurrentUser() {
    // Your authentication logic
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    // Decode JWT or validate session
    const user = decodeAuthToken(token);
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance || 0
    };
}

function getUserToken() {
    return localStorage.getItem('auth_token');
}
```

### 2. User Session Management

```javascript
// Check if user is logged in before showing widget
function initializeMysteryBoxes() {
    const user = getCurrentUser();
    
    if (!user) {
        // Show login prompt
        showLoginRequired();
        return;
    }
    
    // Initialize RollingDrop integration
    new RollingDropIntegration({
        partnerId: 'your-partner-id',
        currentUser: user,
        // ... other config
    });
}

function showLoginRequired() {
    document.getElementById('mystery-box-section').innerHTML = `
        <div class="login-required">
            <h3>Login Required</h3>
            <p>Please log in to access mystery boxes</p>
            <button onclick="redirectToLogin()">Login</button>
        </div>
    `;
}
```

---

## Payment Flow

### Complete Purchase Flow Diagram:

```
1. User clicks "Open Box" in iframe widget
   ↓
2. Widget sends purchase request via postMessage
   ↓
3. Your frontend validates user balance
   ↓
4. Show payment confirmation modal
   ↓
5. User confirms purchase
   ↓
6. Call your backend payment API
   ↓
7. Deduct balance & create transaction
   ↓
8. Send purchase data to RollingDrop API
   ↓
9. RollingDrop processes box opening
   ↓
10. Send success/failure back to widget
    ↓
11. Widget shows opening animation & results
    ↓
12. Show success notification with won item
```

---

## Security & Authentication

### 1. Cross-Domain Security

```javascript
// Always validate message origin
setupMessageListener() {
    window.addEventListener('message', (event) => {
        // Security check - whitelist allowed origins
        const allowedOrigins = [
            'https://your-rollingdrop-instance.com',
            'https://rollingdrop.com' // production domain
        ];
        
        if (!allowedOrigins.includes(event.origin)) {
            console.warn('Blocked message from unauthorized origin:', event.origin);
            return;
        }
        
        // Process message
        this.handleWidgetMessage(event.data);
    });
}
```

### 2. API Security

```javascript
// Authenticate all API calls
async function sendPurchaseToRollingDrop(purchaseData, paymentResult) {
    const response = await fetch(`${ROLLINGDROP_API}/api/partner/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Partner-ID': PARTNER_ID,
            'X-API-Key': PARTNER_API_KEY, // Provided by RollingDrop
            'X-Timestamp': Date.now(),
            'X-Signature': generateSignature(purchaseData) // HMAC signature
        },
        body: JSON.stringify(purchaseData)
    });
}
```

---

## Customization Options

### 1. Widget Themes

```html
<!-- Light theme -->
<iframe src="https://rollingdrop.com/widget/iframe?partner=your-id&theme=light"></iframe>

<!-- Dark theme -->
<iframe src="https://rollingdrop.com/widget/iframe?partner=your-id&theme=dark"></iframe>

<!-- Custom colors -->
<iframe src="https://rollingdrop.com/widget/iframe?partner=your-id&primary=%23ff6b6b&secondary=%234ecdc4"></iframe>
```

### 2. Custom CSS Integration

```css
/* Style the widget container */
#mystery-box-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
}

/* Payment modal styling */
.payment-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 400px;
    text-align: center;
}

/* Success notification */
.success-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10001;
}
```

---

## Testing & Development

### 1. Development Setup

```javascript
// Development configuration
const DEV_CONFIG = {
    partnerId: 'test-partner',
    apiEndpoint: 'http://localhost:5000', // Local RollingDrop instance
    widgetUrl: 'http://localhost:5000',
    debug: true
};

// Production configuration
const PROD_CONFIG = {
    partnerId: 'your-production-partner-id',
    apiEndpoint: 'https://api.rollingdrop.com',
    widgetUrl: 'https://rollingdrop.com',
    debug: false
};

const config = process.env.NODE_ENV === 'production' ? PROD_CONFIG : DEV_CONFIG;
```

### 2. Test Purchase Flow

```javascript
// Test with demo user and fake balance
function createTestUser() {
    return {
        id: 'test_user_123',
        username: 'testuser',
        email: 'test@example.com',
        balance: 1000.00 // $1000 test balance
    };
}

// Enable debug logging
if (config.debug) {
    window.addEventListener('message', (event) => {
        console.log('🔍 Debug - Message received:', event.data);
    });
}
```

---

## Production Deployment

### 1. Environment Configuration

```javascript
// production.env
ROLLINGDROP_API_URL=https://api.rollingdrop.com
ROLLINGDROP_WIDGET_URL=https://rollingdrop.com
PARTNER_ID=your-production-partner-id
PARTNER_API_KEY=your-production-api-key
```

### 2. Performance Optimization

```html
<!-- Preload widget iframe -->
<link rel="preload" href="https://rollingdrop.com/widget/iframe?partner=your-id" as="document">

<!-- Lazy load widget -->
<iframe 
    src="https://rollingdrop.com/widget/iframe?partner=your-id"
    loading="lazy"
    width="100%" 
    height="700px">
</iframe>
```

### 3. Error Handling & Monitoring

```javascript
// Production error handling
class RollingDropIntegration {
    handleError(error, context) {
        // Log to your monitoring service
        if (window.analytics) {
            window.analytics.track('RollingDrop Integration Error', {
                error: error.message,
                context: context,
                partnerId: this.config.partnerId,
                userId: this.config.currentUser?.id
            });
        }
        
        // Show user-friendly error message
        this.showErrorNotification('Something went wrong. Please try again.');
    }
}
```

---

## Troubleshooting

### Common Issues

1. **Widget not loading**
   - Check iframe src URL
   - Verify partner ID is correct
   - Check browser console for errors

2. **Purchase flow failing**
   - Verify user authentication
   - Check balance validation
   - Confirm API endpoints are correct

3. **Cross-domain messaging not working**
   - Verify origin validation
   - Check postMessage syntax
   - Ensure iframe is fully loaded

### Debug Tools

```javascript
// Enable debug mode
window.ROLLINGDROP_DEBUG = true;

// Check widget status
function checkWidgetStatus() {
    const iframe = document.getElementById('rollingdrop-widget');
    console.log('Widget iframe:', iframe);
    console.log('Widget src:', iframe.src);
    console.log('Widget loaded:', iframe.contentDocument !== null);
}

// Test message communication
function testWidgetCommunication() {
    const iframe = document.getElementById('rollingdrop-widget');
    iframe.contentWindow.postMessage({
        type: 'test_communication',
        data: { timestamp: Date.now() }
    }, 'https://rollingdrop.com');
}
```

---

## Support & Resources

- **Technical Support**: Contact RollingDrop technical team
- **API Documentation**: [Full API docs](https://docs.rollingdrop.com)
- **Partner Dashboard**: Access analytics and configuration
- **Status Page**: Monitor service availability

---

## Implementation Checklist

### Frontend
- [ ] Iframe widget embedded
- [ ] Cross-domain messaging setup
- [ ] Purchase flow handling
- [ ] Payment modal implementation
- [ ] Success/error notifications
- [ ] User authentication integration

### Backend
- [ ] Payment processing endpoint
- [ ] Balance management API
- [ ] Transaction logging
- [ ] User validation
- [ ] Error handling
- [ ] Security measures

### Testing
- [ ] Local development setup
- [ ] Test user creation
- [ ] Purchase flow testing
- [ ] Error scenario testing
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

### Production
- [ ] Environment configuration
- [ ] Performance optimization
- [ ] Error monitoring
- [ ] Analytics integration
- [ ] Security audit
- [ ] Go-live testing

---

This guide provides everything needed for a complete RollingDrop B2B integration. The iframe approach ensures minimal development complexity while maintaining full functionality and customization options.