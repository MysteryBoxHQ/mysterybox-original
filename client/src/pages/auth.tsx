import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Eye, EyeOff, X, Chrome, Github, Facebook } from "lucide-react";
import { hapticManager } from "@/lib/hapticManager";

interface AuthProps {
  mode: 'signin' | 'signup';
  onClose: () => void;
  onSwitchMode: (mode: 'signin' | 'signup') => void;
}

export default function Auth({ mode, onClose, onSwitchMode }: AuthProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'US',
    agreeTerms: false
  });

  const countries = [
    { value: 'US', label: 'United States', flag: '🇺🇸' },
    { value: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'CA', label: 'Canada', flag: '🇨🇦' },
    { value: 'AU', label: 'Australia', flag: '🇦🇺' },
    { value: 'DE', label: 'Germany', flag: '🇩🇪' },
    { value: 'FR', label: 'France', flag: '🇫🇷' },
    { value: 'IN', label: 'India', flag: '🇮🇳' },
    { value: 'JP', label: 'Japan', flag: '🇯🇵' },
    { value: 'KR', label: 'South Korea', flag: '🇰🇷' },
    { value: 'BR', label: 'Brazil', flag: '🇧🇷' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    hapticManager.success();
    
    try {
      // Use demo login for both signin and signup
      const response = await fetch('/api/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username || 'Player_' + Math.floor(Math.random() * 1000)
        }),
      });

      if (response.ok) {
        // Close modal and reload page to reflect login state
        onClose();
        window.location.reload();
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    hapticManager.medium();
    
    try {
      // Use demo login for social auth
      const response = await fetch('/api/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `${provider}_Player_` + Math.floor(Math.random() * 1000)
        }),
      });

      if (response.ok) {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Social auth error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-900/95 border-gray-700 shadow-2xl">
          <CardHeader className="relative pb-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 text-gray-400 hover:text-white"
              onClick={() => {
                hapticManager.light();
                onClose();
              }}
            >
              <X className="w-5 h-5" />
            </Button>
            
            <CardTitle className="text-2xl font-bold text-white mb-6">
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </CardTitle>

            {/* Tab Switcher */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <Button
                variant={mode === 'signin' ? 'default' : 'ghost'}
                className={`flex-1 ${mode === 'signin' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => {
                  hapticManager.light();
                  onSwitchMode('signin');
                }}
              >
                Sign in
              </Button>
              <Button
                variant={mode === 'signup' ? 'default' : 'ghost'}
                className={`flex-1 ${mode === 'signup' 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => {
                  hapticManager.light();
                  onSwitchMode('signup');
                }}
              >
                Sign up
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">
                    Username <span className="text-blue-400 text-sm">(optional)</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                    onFocus={() => hapticManager.light()}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  onFocus={() => hapticManager.light()}
                  required
                />
              </div>

              <div className={mode === 'signup' ? 'grid grid-cols-2 gap-4' : 'space-y-2'}>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 pr-10"
                      onFocus={() => hapticManager.light()}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => {
                        hapticManager.light();
                        setShowPassword(!showPassword);
                      }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-300">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 pr-10"
                        onFocus={() => hapticManager.light()}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => {
                          hapticManager.light();
                          setShowConfirmPassword(!showConfirmPassword);
                        }}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {mode === 'signin' && (
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                    onClick={() => hapticManager.light()}
                  >
                    Forgot Password?
                  </Button>
                </div>
              )}

              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-300">
                      Country
                    </Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value} className="text-white hover:bg-gray-700">
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => {
                        hapticManager.light();
                        setFormData({...formData, agreeTerms: checked as boolean});
                      }}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                      I attest that I am at least 18 years old and have read and agree with the{' '}
                      <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto underline">
                        Terms of Service
                      </Button>
                      {' '}and{' '}
                      <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto underline">
                        Privacy Policy
                      </Button>
                      .
                    </Label>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3"
                disabled={mode === 'signup' && !formData.agreeTerms}
                onMouseDown={() => hapticManager.medium()}
              >
                {mode === 'signin' ? 'Sign in' : 'Sign up'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">or</span>
              </div>
            </div>

            {/* Demo Login and Social Authentication */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 border-green-600 text-white"
                onClick={async () => {
                  hapticManager.success();
                  try {
                    const response = await fetch('/api/demo-login', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        username: 'DemoPlayer',
                        balance: 100.00
                      })
                    });

                    if (response.ok) {
                      localStorage.removeItem('user_logged_out');
                      onClose(); // Close the auth modal
                      window.location.reload(); // Refresh to show logged in state
                    } else {
                      console.error('Demo login failed');
                    }
                  } catch (error) {
                    console.error('Demo login error:', error);
                  }
                }}
                onMouseDown={() => hapticManager.medium()}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Demo Login (Test Mode)
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                onClick={() => handleSocialAuth('replit')}
                onMouseDown={() => hapticManager.medium()}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2z"/>
                  <path d="M8 8h3v3H8V8zm0 5h3v3H8v-3zm5-5h3v3h-3V8z"/>
                </svg>
                Sign in via Replit
              </Button>

              <div className="grid grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-800 border-gray-600 hover:bg-gray-700 p-3"
                  onClick={() => handleSocialAuth('google')}
                  onMouseDown={() => hapticManager.light()}
                >
                  <Chrome className="w-5 h-5 text-white" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-800 border-gray-600 hover:bg-gray-700 p-3"
                  onClick={() => handleSocialAuth('discord')}
                  onMouseDown={() => hapticManager.light()}
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.191.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-800 border-gray-600 hover:bg-gray-700 p-3"
                  onClick={() => handleSocialAuth('facebook')}
                  onMouseDown={() => hapticManager.light()}
                >
                  <Facebook className="w-5 h-5 text-white" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-800 border-gray-600 hover:bg-gray-700 p-3"
                  onClick={() => handleSocialAuth('github')}
                  onMouseDown={() => hapticManager.light()}
                >
                  <Github className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}