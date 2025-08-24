import { ArrowLeft, Calendar, Shield, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function AgeVerification() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Age Verification</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <div className="flex items-center mb-3">
                <Shield className="w-6 h-6 text-blue-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Age Requirements</h2>
              </div>
              <p>
                RollingDrop requires all users to be at least 18 years of age or the age of 
                majority in their jurisdiction to use our services. This requirement helps 
                ensure responsible participation in our virtual box opening platform.
              </p>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <Calendar className="w-6 h-6 text-green-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Verification Process</h2>
              </div>
              <div className="space-y-3">
                <p>To verify your age, we may require:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Date of birth information during registration</li>
                  <li>Government-issued identification documents</li>
                  <li>Additional verification for certain features or higher spending limits</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Why Age Verification Matters</h2>
              </div>
              <div className="space-y-3">
                <p>Age verification helps us:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Comply with legal requirements and regulations</li>
                  <li>Protect minors from potentially harmful content</li>
                  <li>Promote responsible gaming practices</li>
                  <li>Maintain a safe environment for all users</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Data Protection</h2>
              <p>
                Any information provided for age verification is handled in accordance with our 
                Privacy Policy. We use industry-standard security measures to protect your 
                personal information and only collect the minimum data necessary for verification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">False Information</h2>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300">
                  Providing false age information is a violation of our Terms of Service and 
                  may result in immediate account suspension or termination. We take age 
                  verification seriously and employ various methods to detect fraudulent information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
              <p>
                If you have questions about our age verification process or need assistance 
                with verification, please contact our support team. We're here to help ensure 
                a smooth and secure verification experience.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-400">
            <p>Your safety and compliance with applicable laws are our top priorities.</p>
            <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}