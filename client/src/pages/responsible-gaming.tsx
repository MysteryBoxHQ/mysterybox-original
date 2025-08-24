import { ArrowLeft, Shield, Clock, Users, Heart } from "lucide-react";
import { Link } from "wouter";

export default function ResponsibleGaming() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Responsible Gaming</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <div className="flex items-center mb-3">
                <Shield className="w-6 h-6 text-blue-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Our Commitment</h2>
              </div>
              <p>
                RollingDrop is committed to providing a safe and enjoyable gaming environment. 
                We believe that virtual box opening should be fun and entertaining, not a source 
                of stress or financial burden.
              </p>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <Clock className="w-6 h-6 text-green-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Setting Limits</h2>
              </div>
              <div className="space-y-3">
                <p>We encourage all users to set personal limits:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Set a budget for virtual purchases and stick to it</li>
                  <li>Take regular breaks from the platform</li>
                  <li>Never spend more than you can afford</li>
                  <li>Remember that virtual items have no real-world value</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <Users className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Warning Signs</h2>
              </div>
              <div className="space-y-3">
                <p>Please be aware of these warning signs of problematic gaming:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Spending more money than intended</li>
                  <li>Feeling anxious or upset when not playing</li>
                  <li>Neglecting work, school, or relationships</li>
                  <li>Lying about time or money spent gaming</li>
                  <li>Chasing losses with more purchases</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center mb-3">
                <Heart className="w-6 h-6 text-red-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Self-Exclusion</h2>
              </div>
              <p>
                If you feel you need a break from gaming, we offer self-exclusion options. 
                You can temporarily or permanently restrict access to your account. Contact 
                our support team to learn more about these options.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Getting Help</h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <p className="mb-4">If you or someone you know needs help with gaming-related issues:</p>
                <ul className="space-y-2">
                  <li>• <strong>National Problem Gaming Helpline:</strong> 1-800-522-4700</li>
                  <li>• <strong>Gamblers Anonymous:</strong> www.gamblersanonymous.org</li>
                  <li>• <strong>National Council on Problem Gaming:</strong> www.ncpgambling.org</li>
                  <li>• <strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Our Tools</h2>
              <p>
                We provide various tools to help you maintain control over your gaming experience. 
                Visit your account settings to access spending limits, session time reminders, 
                and self-exclusion options.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-400">
            <p>Remember: Gaming should be fun. If it stops being fun, it's time to take a break.</p>
            <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}