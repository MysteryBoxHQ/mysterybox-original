import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Globe, Zap, Shield, CheckCircle } from "lucide-react";

export default function ApiDocumentation() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Code className="h-8 w-8 text-blue-500" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Documentation</h2>
          <p className="text-gray-300">
            Complete integration guide for external platforms and partners
          </p>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                RollingDrop Integration API
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enable your platform to offer mystery box functionality to your users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <h3 className="font-semibold">Fast Integration</h3>
                  <p className="text-sm text-gray-300">
                    RESTful API with comprehensive documentation
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold">Secure & Reliable</h3>
                  <p className="text-sm text-gray-300">
                    API key authentication with rate limiting
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold">Production Ready</h3>
                  <p className="text-sm text-gray-300">
                    Built for scale with comprehensive monitoring
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Base URL</h3>
                <div className="dark:bg-gray-800 p-4 rounded-lg font-mono bg-[#2c3244]">
                  https://your-domain.replit.app/api/v1
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Supported Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Browse mystery boxes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Open boxes for users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>View box contents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Transaction tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Webhook notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Usage analytics</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Authentication
              </CardTitle>
              <CardDescription className="text-gray-300">
                Secure your API requests with proper authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">API Key Authentication</h3>
                <p className="text-gray-300">
                  All API requests must include your API key in the request headers:
                </p>
                <div className="dark:bg-gray-800 p-4 rounded-lg bg-[#2c3244]">
                  <pre className="text-sm"><code>{`X-API-Key: your_api_key_here`}</code></pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rate Limiting</h3>
                <p className="text-gray-300">
                  API requests are limited based on your partner tier:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <Badge variant="secondary" className="mb-2">Basic</Badge>
                    <div className="text-2xl font-bold">1,000</div>
                    <div className="text-sm text-gray-300">requests/hour</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Badge variant="default" className="mb-2">Pro</Badge>
                    <div className="text-2xl font-bold">10,000</div>
                    <div className="text-sm text-gray-300">requests/hour</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Badge variant="outline" className="mb-2">Enterprise</Badge>
                    <div className="text-2xl font-bold">Custom</div>
                    <div className="text-sm text-gray-300">unlimited</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Error Handling</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">401</Badge>
                    <span>Unauthorized - Invalid or missing API key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">429</Badge>
                    <span>Too Many Requests - Rate limit exceeded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">403</Badge>
                    <span>Forbidden - Insufficient permissions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Get All Boxes</CardTitle>
                <CardDescription className="text-gray-300">Retrieve all available mystery boxes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">GET</Badge>
                    <code>/api/v1/boxes</code>
                  </div>
                  <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                    <pre className="text-sm"><code>{`{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tech Mystery Box",
      "description": "Latest tech gadgets and accessories",
      "price": 29.99,
      "currency": "USD",
      "rarity": "rare",
      "imageUrl": "https://...",
      "backgroundUrl": "https://...",
      "featured": true
    }
  ]
}`}</code></pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Mystery Box</CardTitle>
                <CardDescription>Open a box for a user and receive an item</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">POST</Badge>
                    <code>/api/v1/open-box</code>
                  </div>
                  <h4 className="font-semibold">Request Body:</h4>
                  <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                    <pre className="text-sm"><code>{`{
  "boxId": 1,
  "userId": "user_12345",
  "userBalance": 50.00
}`}</code></pre>
                  </div>
                  <h4 className="font-semibold">Response:</h4>
                  <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                    <pre className="text-sm"><code>{`{
  "success": true,
  "data": {
    "item": {
      "id": 123,
      "name": "Wireless Headphones",
      "description": "Premium noise-canceling headphones",
      "rarity": "epic",
      "icon": "https://...",
      "value": 199.99
    },
    "box": {
      "id": 1,
      "name": "Tech Mystery Box",
      "price": 29.99
    },
    "transaction": {
      "cost": 29.99,
      "newBalance": 20.01,
      "profit": 169.99
    }
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00Z",
    "userId": "user_12345"
  }
}`}</code></pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Box Details</CardTitle>
                <CardDescription>Get detailed information about a specific box</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">GET</Badge>
                    <code>/api/v1/boxes/:id</code>
                  </div>
                  <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                    <pre className="text-sm"><code>{`{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tech Mystery Box",
    "description": "Latest tech gadgets and accessories",
    "price": 29.99,
    "currency": "USD",
    "rarity": "rare",
    "imageUrl": "https://...",
    "items": [
      {
        "id": 123,
        "name": "Wireless Headphones",
        "rarity": "epic",
        "dropChance": 0.05,
        "value": 199.99
      }
    ]
  }
}`}</code></pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Examples</CardTitle>
              <CardDescription>Code examples for popular programming languages</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                    <pre className="text-sm"><code>{`// Fetch available boxes
const response = await fetch('https://your-domain.replit.app/api/v1/boxes', {
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const boxes = await response.json();
console.log(boxes);

// Open a mystery box
const openResponse = await fetch('https://your-domain.replit.app/api/v1/open-box', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    boxId: 1,
    userId: 'user_12345',
    userBalance: 50.00
  })
});

const result = await openResponse.json();
console.log('Won item:', result.data.item);`}</code></pre>
                  </div>
                </TabsContent>

                <TabsContent value="python">
                  <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                    <pre className="text-sm"><code>{`import requests

# Configuration
API_KEY = 'your_api_key_here'
BASE_URL = 'https://your-domain.replit.app/api/v1'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Fetch available boxes
response = requests.get(f'{BASE_URL}/boxes', headers=headers)
boxes = response.json()
print(boxes)

# Open a mystery box
open_data = {
    'boxId': 1,
    'userId': 'user_12345',
    'userBalance': 50.00
}

response = requests.post(f'{BASE_URL}/open-box', 
                        headers=headers, 
                        json=open_data)
result = response.json()
print('Won item:', result['data']['item'])`}</code></pre>
                  </div>
                </TabsContent>

                <TabsContent value="php">
                  <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                    <pre className="text-sm"><code>{`<?php
$api_key = 'your_api_key_here';
$base_url = 'https://your-domain.replit.app/api/v1';

$headers = [
    'X-API-Key: ' . $api_key,
    'Content-Type: application/json'
];

// Fetch available boxes
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $base_url . '/boxes');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$boxes = json_decode($response, true);
curl_close($ch);

// Open a mystery box
$open_data = [
    'boxId' => 1,
    'userId' => 'user_12345',
    'userBalance' => 50.00
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $base_url . '/open-box');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($open_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$result = json_decode($response, true);
curl_close($ch);

echo 'Won item: ' . $result['data']['item']['name'];
?>`}</code></pre>
                  </div>
                </TabsContent>

                <TabsContent value="curl">
                  <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                    <pre className="text-sm"><code>{`# Fetch available boxes
curl -X GET "https://your-domain.replit.app/api/v1/boxes" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json"

# Open a mystery box
curl -X POST "https://your-domain.replit.app/api/v1/open-box" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "boxId": 1,
    "userId": "user_12345",
    "userBalance": 50.00
  }'`}</code></pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Notifications</CardTitle>
              <CardDescription>
                Receive real-time notifications about box openings and transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Webhook Setup</h3>
                <p className="text-gray-300">
                  Configure a webhook URL in your partner settings to receive notifications about:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Successful box openings</li>
                  <li>Failed transactions</li>
                  <li>Rate limit warnings</li>
                  <li>Account status changes</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Webhook Payload</h3>
                <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                  <pre className="text-sm"><code>{`{
  "event": "box_opened",
  "timestamp": "2024-01-01T12:00:00Z",
  "partner_id": "partner_123",
  "data": {
    "transaction_id": "txn_456",
    "user_id": "user_12345",
    "box_id": 1,
    "item_won": {
      "id": 123,
      "name": "Wireless Headphones",
      "rarity": "epic",
      "value": 199.99
    },
    "cost": 29.99,
    "profit": 169.99
  }
}`}</code></pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Webhook Security</h3>
                <p className="text-gray-300">
                  Webhooks are signed with your secret key. Verify the signature using:
                </p>
                <div className="dark:bg-gray-800 bg-[#2c3244] p-4 rounded-lg">
                  <pre className="text-sm"><code>{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}</code></pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}