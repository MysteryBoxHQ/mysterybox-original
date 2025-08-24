import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import ApiDocumentation from "@/components/admin/ApiDocumentation";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/docs" className="inline-flex items-center gap-2 text-white hover:text-blue-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Documentation
          </Link>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              B2B Widget Integration API
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              JavaScript widgets and REST APIs for integrating mystery box functionality into existing casino, 
              sweepstakes, and ecommerce platforms. Embed box opening features directly into your current website.
            </p>
          </div>
          <ApiDocumentation />
        </div>
      </div>
    </div>
  );
}