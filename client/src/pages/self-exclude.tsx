import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  Lock,
  Heart,
  Phone,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SelfExclusionStatus {
  isActive: boolean;
  type?: 'temporary' | 'permanent';
  duration?: number;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export default function SelfExclude() {
  const [exclusionType, setExclusionType] = useState<'temporary' | 'permanent'>('temporary');
  const [duration, setDuration] = useState('7');
  const [reason, setReason] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exclusionStatus } = useQuery<SelfExclusionStatus>({
    queryKey: ["/api/self-exclusion/status"],
  });

  const exclusionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/self-exclusion/activate", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Self-Exclusion Activated",
        description: "Your account has been restricted as requested.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/self-exclusion/status"] });
      setShowConfirmation(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate self-exclusion.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasAgreed) {
      toast({
        title: "Agreement Required",
        description: "Please confirm you understand the terms.",
        variant: "destructive",
      });
      return;
    }

    if (!confirmPassword) {
      toast({
        title: "Password Required", 
        description: "Please enter your password to confirm.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const confirmExclusion = () => {
    exclusionMutation.mutate({
      type: exclusionType,
      duration: exclusionType === 'temporary' ? parseInt(duration) : null,
      reason,
      password: confirmPassword
    });
  };

  if (exclusionStatus?.isActive) {
    return (
      <div className="min-h-screen cases-bg py-4 md:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Account Restricted</h1>
                <p className="text-gray-400 text-sm md:text-base">Self-exclusion is currently active</p>
              </div>
            </div>
          </div>

          <Card className="cases-card border-red-500/20 bg-red-900/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Self-Exclusion Active
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-white font-medium">
                      {exclusionStatus.type === 'permanent' ? 'Permanent Exclusion' : 'Temporary Exclusion'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {exclusionStatus.type === 'permanent' 
                        ? 'Your account is permanently restricted from gaming activities'
                        : `Exclusion active until ${exclusionStatus.endDate ? new Date(exclusionStatus.endDate).toLocaleDateString() : 'N/A'}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Support Resources</h4>
                <div className="grid gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-400" />
                      <div>
                        <h5 className="text-white font-medium">National Problem Gambling Helpline</h5>
                        <p className="text-gray-400 text-sm">1-800-522-4700 (24/7 support)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-green-400" />
                      <div>
                        <h5 className="text-white font-medium">Gamblers Anonymous</h5>
                        <p className="text-gray-400 text-sm">www.gamblersanonymous.org</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-purple-400" />
                      <div>
                        <h5 className="text-white font-medium">Mental Health Support</h5>
                        <p className="text-gray-400 text-sm">Crisis Text Line: Text HOME to 741741</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cases-bg py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Responsible Gaming</h1>
              <p className="text-gray-400 text-sm md:text-base">Self-exclusion and account restrictions</p>
            </div>
          </div>
        </div>

        {showConfirmation && (
          <Card className="cases-card border-red-500/20 bg-red-900/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Confirm Self-Exclusion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                <p className="text-white font-medium mb-2">Are you sure you want to proceed?</p>
                <p className="text-gray-300 text-sm">
                  {exclusionType === 'permanent' 
                    ? 'This will permanently restrict your account from all gaming activities. This action cannot be undone.'
                    : `This will restrict your account for ${duration} days. You will not be able to access any gaming features during this period.`
                  }
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={confirmExclusion}
                  disabled={exclusionMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {exclusionMutation.isPending ? 'Processing...' : 'Confirm Exclusion'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={exclusionMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <Card className="cases-card border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg">
                <h3 className="text-orange-300 font-medium mb-2">Before You Continue</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    Self-exclusion is a serious commitment to help you control your gaming
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    Once activated, you cannot reverse this decision during the exclusion period
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    Your account will be restricted from all gaming activities
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    Consider speaking with a counselor before making this decision
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="cases-card border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Self-Exclusion Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-white font-medium mb-3 block">Exclusion Type</Label>
                  <RadioGroup value={exclusionType} onValueChange={(value: 'temporary' | 'permanent') => setExclusionType(value)}>
                    <div className="flex items-center space-x-2 p-3 bg-gray-800/50 rounded-lg">
                      <RadioGroupItem value="temporary" id="temporary" />
                      <Label htmlFor="temporary" className="text-white cursor-pointer flex-1">
                        <div>
                          <p className="font-medium">Temporary Exclusion</p>
                          <p className="text-gray-400 text-sm">Restrict account for a specific period</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gray-800/50 rounded-lg">
                      <RadioGroupItem value="permanent" id="permanent" />
                      <Label htmlFor="permanent" className="text-white cursor-pointer flex-1">
                        <div>
                          <p className="font-medium">Permanent Exclusion</p>
                          <p className="text-gray-400 text-sm">Permanently restrict account (cannot be undone)</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {exclusionType === 'temporary' && (
                  <div>
                    <Label className="text-white font-medium mb-3 block">Duration (Days)</Label>
                    <RadioGroup value={duration} onValueChange={setDuration}>
                      {['7', '30', '90', '180', '365'].map((days) => (
                        <div key={days} className="flex items-center space-x-2 p-2 bg-gray-800/30 rounded">
                          <RadioGroupItem value={days} id={`duration-${days}`} />
                          <Label htmlFor={`duration-${days}`} className="text-white cursor-pointer">
                            {days} days
                            {days === '365' && ' (1 year)'}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <div>
                  <Label htmlFor="reason" className="text-white font-medium">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Help us understand your decision..."
                    className="bg-gray-800 border-gray-700 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-white font-medium">Confirm Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                    className="bg-gray-800 border-gray-700 text-white mt-2"
                    required
                  />
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
                  <Checkbox 
                    id="agreement"
                    checked={hasAgreed}
                    onCheckedChange={setHasAgreed}
                  />
                  <Label htmlFor="agreement" className="text-white text-sm cursor-pointer leading-relaxed">
                    I understand that this action will restrict my account from all gaming activities for the selected period. 
                    I acknowledge that this decision cannot be reversed until the exclusion period expires.
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={!hasAgreed || !confirmPassword}
                >
                  Activate Self-Exclusion
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="cases-card border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-400" />
                Support Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">
                If you're struggling with gambling, you're not alone. Professional help is available:
              </p>
              
              <div className="grid gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <div>
                      <h5 className="text-white font-medium">National Problem Gambling Helpline</h5>
                      <p className="text-gray-400 text-sm">1-800-522-4700 (24/7 support)</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-green-400" />
                    <div>
                      <h5 className="text-white font-medium">Gamblers Anonymous</h5>
                      <p className="text-gray-400 text-sm">www.gamblersanonymous.org</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-purple-400" />
                    <div>
                      <h5 className="text-white font-medium">Mental Health Support</h5>
                      <p className="text-gray-400 text-sm">Crisis Text Line: Text HOME to 741741</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}