import { Link } from "wouter";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Simple public header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RD</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">RollingDrop</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/docs" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                Documentation
              </Link>
              <Link href="/docs/b2b-integration" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                B2B Integration
              </Link>
              <Link href="/api/docs" className="text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                API Reference
              </Link>
              <Link href="/" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Go to Platform
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">RollingDrop</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mystery box platform for gaming and entertainment.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Documentation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs/product-specification" className="text-gray-600 dark:text-gray-400 hover:text-orange-500">Product Overview</Link></li>
                <li><Link href="/docs/b2b-integration" className="text-gray-600 dark:text-gray-400 hover:text-orange-500">B2B Integration</Link></li>
                <li><Link href="/docs/api-reference" className="text-gray-600 dark:text-gray-400 hover:text-orange-500">API Reference</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/api/docs" className="text-gray-600 dark:text-gray-400 hover:text-orange-500">Swagger API</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-orange-500">Contact Sales</Link></li>
                <li><Link href="/help" className="text-gray-600 dark:text-gray-400 hover:text-orange-500">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-orange-500">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-orange-500">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 RollingDrop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}