import { Link } from "wouter";
import { ArrowLeft, Globe, Palette, Code, Settings, Users, DollarSign, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicLayout from "@/components/PublicLayout";

export default function WhitelabelGuide() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/docs" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Documentation
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Whitelabel Platform Guide
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-6">
            Complete guide for spawning branded frontend instances with custom domains and full control
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="default">Complete Frontend Spawning</Badge>
            <Badge variant="secondary">Custom Branding</Badge>
            <Badge variant="outline">Domain Management</Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  What is Whitelabel Management?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Whitelabel management allows you to spawn complete branded frontend instances of the RollingDrop platform 
                  for your clients. Each instance is a fully functional mystery box platform with complete customization control.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Key Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Complete frontend instance creation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Custom domain/subdomain assignment</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Full branding control (logos, colors, typography)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Content customization (all text elements)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>SEO management (meta tags, Open Graph)</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Use Cases</h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• Gaming companies wanting their own mystery box platform</li>
                      <li>• Brands launching exclusive collectible experiences</li>
                      <li>• Agencies managing multiple client platforms</li>
                      <li>• Enterprise customers requiring complete white-labeling</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Whitelabel vs B2B Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Whitelabel Platform</h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                      "We want our own mystery box platform"
                    </p>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>• Complete frontend spawning</li>
                      <li>• Custom domain (brand.rollingdrop.com)</li>
                      <li>• Full visual and content control</li>
                      <li>• Separate platform instance</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">B2B Widget Integration</h4>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                      "Add mystery boxes to our existing casino"
                    </p>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• JavaScript widgets + APIs</li>
                      <li>• Embedded in existing website</li>
                      <li>• Limited customization</li>
                      <li>• Features added to current site</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Initial Setup Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">1. Create Whitelabel Instance</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Access the admin console at <code>/admin/whitelabels</code> and create a new instance:
                    </p>
                    <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Set unique whitelabel ID</li>
                      <li>• Configure basic settings</li>
                      <li>• Assign domain/subdomain</li>
                      <li>• Set initial branding</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">2. Domain Configuration</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Configure domain settings for your whitelabel instance:
                    </p>
                    <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Subdomain: brand.rollingdrop.com</li>
                      <li>• Custom domain: yourbrand.com</li>
                      <li>• SSL certificate management</li>
                      <li>• DNS configuration</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">3. Database Schema</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 dark:text-gray-300">
{`whitelabel_sites:
- whitelabel_id (unique instance ID)
- deployment_url (spawned frontend URL)
- branding_config (complete visual control)
- content_config (all text/content)
- seo_config (meta tags, OG tags)
- status (active/inactive)
- created_at, updated_at`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-6 w-6" />
                  Complete Branding Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Visual Branding</h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Logo upload and management</li>
                      <li>• Primary and secondary color schemes</li>
                      <li>• Typography and font selection</li>
                      <li>• Button styles and UI components</li>
                      <li>• Background images and patterns</li>
                      <li>• Theme selection (6 available themes)</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Advanced Customization</h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Custom CSS injection</li>
                      <li>• Component-level styling</li>
                      <li>• Animation and transition control</li>
                      <li>• Mobile responsive adjustments</li>
                      <li>• Dark/light mode configuration</li>
                      <li>• Favicon and PWA icons</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Branding Configuration Example</h4>
                  <pre className="text-sm text-blue-800 dark:text-blue-200 overflow-x-auto">
{`{
  "primary_color": "#6366f1",
  "secondary_color": "#8b5cf6", 
  "logo_url": "https://cdn.yourbrand.com/logo.png",
  "font_family": "Inter",
  "theme": "cosmic-blue",
  "custom_css": ".btn-primary { border-radius: 8px; }"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-6 w-6" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Text Content Control</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Customize all text elements throughout the platform including:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Page titles and headings</li>
                      <li>• Button labels and CTAs</li>
                      <li>• Navigation menu items</li>
                      <li>• Footer content and links</li>
                      <li>• Error messages and notifications</li>
                    </ul>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Product descriptions</li>
                      <li>• Legal pages (Terms, Privacy)</li>
                      <li>• Help and FAQ sections</li>
                      <li>• Email templates</li>
                      <li>• Success/failure messages</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SEO Management</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Meta titles and descriptions for all pages</li>
                      <li>• Open Graph tags for social media sharing</li>
                      <li>• Twitter Card configuration</li>
                      <li>• Structured data markup</li>
                      <li>• Custom canonical URLs</li>
                      <li>• Sitemap generation</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">SEO Configuration Example</h4>
                  <pre className="text-sm text-green-800 dark:text-green-200 overflow-x-auto">
{`{
  "site_title": "YourBrand Mystery Boxes",
  "meta_description": "Premium mystery boxes with exclusive collectibles",
  "og_image": "https://cdn.yourbrand.com/og-image.png",
  "twitter_handle": "@yourbrand",
  "canonical_url": "https://yourbrand.com"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Deployment Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Deployment Process</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">1. Build</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Generate customized frontend with branding and content
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">2. Deploy</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Push to configured domain with SSL certificate
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">3. Monitor</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Health checks and performance monitoring
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Environment Management</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Staging environment for testing changes</li>
                      <li>• Production deployment with zero downtime</li>
                      <li>• Rollback capabilities for quick recovery</li>
                      <li>• CDN integration for global performance</li>
                      <li>• SSL certificate auto-renewal</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Ongoing Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Instance Control</h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Start/stop instance deployments</li>
                      <li>• Update branding and content</li>
                      <li>• Manage user permissions</li>
                      <li>• Feature toggle control</li>
                      <li>• Version management</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Analytics & Monitoring</h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• Usage statistics and metrics</li>
                      <li>• Performance monitoring</li>
                      <li>• Error tracking and alerts</li>
                      <li>• Revenue and transaction data</li>
                      <li>• User engagement analytics</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Support & Maintenance</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li>• Automatic platform updates</li>
                      <li>• Security patches and maintenance</li>
                      <li>• Database backups and recovery</li>
                      <li>• Technical support for instances</li>
                      <li>• Performance optimization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}