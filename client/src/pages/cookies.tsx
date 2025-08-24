import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">What Are Cookies</h2>
              <p>
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                enabling certain functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">How We Use Cookies</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-white">Essential Cookies</h3>
                  <p>These cookies are necessary for the website to function properly. They enable basic features like user authentication and security.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Functional Cookies</h3>
                  <p>These cookies remember your preferences and settings to provide you with a personalized experience.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Analytics Cookies</h3>
                  <p>These cookies help us understand how visitors interact with our website by collecting anonymous information.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Managing Cookies</h2>
              <p>
                You can control and manage cookies through your browser settings. You can choose to 
                block or delete cookies, but this may affect your experience on our website. Most 
                browsers allow you to view, manage, and delete cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Third-Party Cookies</h2>
              <p>
                We may use third-party services that set their own cookies. These services help us 
                analyze traffic, process payments, and provide other functionality. Each third-party 
                service has its own privacy and cookie policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Any changes will be posted on 
                this page with an updated revision date.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-400">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}