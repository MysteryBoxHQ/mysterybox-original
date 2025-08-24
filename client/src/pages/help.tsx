import { ArrowLeft, MessageCircle, Mail, Clock, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Creating an account is easy! Simply click the login button and follow the registration process. You'll need to verify your age and agree to our terms."
        },
        {
          q: "What are mystery boxes?",
          a: "Mystery boxes are virtual containers that hold random items. When you open a box, you'll receive one item based on the box's drop rates and rarity distribution."
        },
        {
          q: "How do I add funds to my account?",
          a: "You can add funds through the wallet section using various payment methods including credit cards and digital wallets."
        }
      ]
    },
    {
      title: "Box Opening",
      questions: [
        {
          q: "How does the box opening animation work?",
          a: "Our spinner animation shows all possible items from the box. The final result is determined by our provably fair system before the animation starts."
        },
        {
          q: "Can I see the odds for each item?",
          a: "Yes! Click on any box to view detailed information including all items and their drop chances. We believe in full transparency."
        },
        {
          q: "What is provably fair?",
          a: "Our provably fair system allows you to verify that each box opening result is truly random and not manipulated. Check the Fairness section for more details."
        }
      ]
    },
    {
      title: "Account & Items",
      questions: [
        {
          q: "Where can I see my items?",
          a: "All your items are stored in your Inventory, accessible from the main navigation menu. You can view, organize, and manage your collection there."
        },
        {
          q: "Can I sell my items?",
          a: "Yes! You can list items for sale in the Market section. Other users can purchase your items using their account balance."
        },
        {
          q: "How do I change my username?",
          a: "Currently, usernames cannot be changed after account creation. Please choose carefully during registration."
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      qa => 
        qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qa.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Help Center</h1>
          
          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <MessageCircle className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Live Chat Support</h3>
              <p className="text-gray-300 mb-4">Get instant help from our support team</p>
              <Button className="w-full">Start Chat</Button>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <Mail className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-gray-300 mb-4">Send us a detailed message</p>
              <Button variant="outline" className="w-full">Send Email</Button>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-center mb-2">
              <Clock className="w-5 h-5 text-blue-400 mr-2" />
              <h3 className="font-semibold">Support Hours</h3>
            </div>
            <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM (PST)</p>
            <p className="text-gray-300">Saturday - Sunday: 10:00 AM - 4:00 PM (PST)</p>
          </div>

          {/* FAQ */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            
            {searchQuery && filteredCategories.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No results found for "{searchQuery}". Try different keywords or contact support.
              </div>
            )}

            {(searchQuery ? filteredCategories : faqCategories).map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                <div className="space-y-3">
                  {category.questions.map((qa, qaIndex) => (
                    <details key={qaIndex} className="bg-gray-800 border border-gray-700 rounded-lg">
                      <summary className="p-4 cursor-pointer hover:bg-gray-750 rounded-lg font-medium">
                        {qa.q}
                      </summary>
                      <div className="px-4 pb-4 text-gray-300">
                        {qa.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Still Need Help */}
          <div className="mt-12 text-center bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
            <p className="text-gray-300 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Button>Contact Support</Button>
          </div>
        </div>
      </div>
    </div>
  );
}