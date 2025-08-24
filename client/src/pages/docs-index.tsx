import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { 
  ExternalLink, 
  FileText, 
  Code, 
  BookOpen, 
  Puzzle,
  Database,
  Layers,
  Zap,
  Shield,
  Globe
} from "lucide-react";

export default function DocsIndex() {
  const documentationSections = [
    {
      title: "Product Specification",
      description: "Comprehensive overview of the RollingDrop platform, features, and business model",
      icon: FileText,
      url: "/docs/product-specification",
      badge: "Overview",
      color: "bg-blue-500"
    },
    {
      title: "B2B Widget Integration",
      description: "JavaScript widgets and APIs for integrating box opening features into existing casino/ecommerce sites",
      icon: Puzzle,
      url: "/docs/b2b-integration",
      badge: "B2B Widgets",
      color: "bg-green-500"
    },
    {
      title: "Whitelabel Platform Guide", 
      description: "Complete guide for spawning branded frontend instances with custom domains and full control",
      icon: Globe,
      url: "/docs/whitelabel-guide",
      badge: "Whitelabel",
      color: "bg-purple-500"
    },
    {
      title: "API Documentation (Swagger)",
      description: "Interactive API documentation with live testing capabilities",
      icon: Code,
      url: "/docs/api-reference",
      badge: "API",
      color: "bg-purple-500"
    },
    {
      title: "Partner API Reference",
      description: "B2B partner integration API endpoints and authentication",
      icon: Shield,
      url: "/api/docs#/Partner%20API",
      badge: "B2B",
      color: "bg-orange-500"
    },
    {
      title: "External API Reference", 
      description: "Public API endpoints for third-party integrations",
      icon: Database,
      url: "/api/docs#/External%20API",
      badge: "Public",
      color: "bg-indigo-500"
    },
    {
      title: "Widget SDK Documentation",
      description: "JavaScript SDK for custom widget implementations",
      icon: Layers,
      url: "/docs/b2b-integration#widget",
      badge: "SDK",
      color: "bg-pink-500"
    }
  ];

  const quickLinks = [
    {
      title: "Live Swagger UI",
      url: "/api/docs",
      description: "Interactive API testing interface"
    },
    {
      title: "Swagger JSON",
      url: "/api/docs/swagger.json",
      description: "Raw OpenAPI specification"
    },
    {
      title: "B2B Integration",
      url: "/docs/b2b-integration",
      description: "Complete integration guide"
    },
    {
      title: "Product Overview",
      url: "/docs/product-specification",
      description: "Platform specifications"
    }
  ];

  const apiEndpoints = [
    {
      category: "External API v1",
      baseUrl: "/api/v1",
      auth: "X-API-Key header",
      endpoints: [
        { method: "GET", path: "/boxes", description: "All available boxes" },
        { method: "GET", path: "/boxes/featured", description: "Featured boxes only" },
        { method: "GET", path: "/boxes/:id", description: "Specific box with items" },
        { method: "GET", path: "/boxes/:id/items", description: "Box items only" },
        { method: "POST", path: "/open-box", description: "Open a box" },
        { method: "GET", path: "/stats", description: "API usage statistics" }
      ]
    },
    {
      category: "Partner API v1",
      baseUrl: "/api/partner/v1",
      auth: "X-API-Key header",
      endpoints: [
        { method: "GET", path: "/auth/test", description: "Test authentication" },
        { method: "GET", path: "/partner/info", description: "Partner information" },
        { method: "GET", path: "/boxes", description: "Available boxes" },
        { method: "GET", path: "/boxes/:id", description: "Box details with items" },
        { method: "POST", path: "/boxes/:id/open", description: "Open a box" },
        { method: "GET", path: "/stats", description: "Partner statistics" },
        { method: "GET", path: "/transactions", description: "Transaction history" }
      ]
    },
    {
      category: "CDN API",
      baseUrl: "/api/cdn",
      auth: "Session-based",
      endpoints: [
        { method: "POST", path: "/upload", description: "Upload images (multipart)" },
        { method: "POST", path: "/upload-base64", description: "Upload base64 images" },
        { method: "GET", path: "/images/:filename", description: "Serve images" },
        { method: "GET", path: "/images", description: "List all images" },
        { method: "DELETE", path: "/images/:filename", description: "Delete image" },
        { method: "GET", path: "/status", description: "CDN status" }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            RollingDrop Documentation
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-6">
            Complete documentation, API references, and integration guides
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="default">Documentation</Badge>
            <Badge variant="secondary">API Reference</Badge>
            <Badge className="border-transparent hover:bg-primary/80 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-[#2b3145] bg-[#ffffff]">Integration Guides</Badge>
            <Badge variant="destructive">Live Examples</Badge>
          </div>
        </div>

        {/* Documentation Sections */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Documentation Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentationSections.map((section, index) => (
                <Card key={index} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${section.color} text-white`}>
                        <section.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-xs text-[#2b3145]">
                        {section.badge}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {section.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(section.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Documentation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {link.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {link.description}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-6 w-6" />
              API Endpoints Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {apiEndpoints.map((category, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.category}
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {category.baseUrl}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {category.auth}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {category.endpoints.map((endpoint, endpointIndex) => (
                      <div key={endpointIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-3">
                          <Badge className={`text-xs font-mono ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                            {category.baseUrl}{endpoint.path}
                          </code>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {endpoint.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Interactive Testing
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                Test all API endpoints interactively using our Swagger UI interface with real-time responses.
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.open('/api/docs', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Swagger UI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Widget Integration URLs */}
        <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Puzzle className="h-6 w-6" />
              Widget Integration URLs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Widget Library</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                    <code className="text-green-600 dark:text-green-400">
                      https://widgets.rollingdrop.com/latest/rollingdrop-widgets.js
                    </code>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                    <code className="text-green-600 dark:text-green-400">
                      https://widgets.rollingdrop.com/latest/rollingdrop-widgets.min.js
                    </code>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Documentation</h4>
                <div className="space-y-2 text-sm">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Widget Integration Guide
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Code className="h-4 w-4 mr-2" />
                    Widget SDK Reference
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}