import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Shield, 
  CreditCard,
  ShoppingCart,
  RefreshCw,
  Lock,
  MapPin,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Target,
  Trophy,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import type { User as UserType } from "@shared/schema";

interface Mission {
  id: number;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'weekly' | 'achievement';
}

interface PaymentRecord {
  id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  transactionId: string;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [accountForm, setAccountForm] = useState({
    username: '',
    email: '',
    phoneNumber: ''
  });
  
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    city: '',
    postalCode: '',
    state: '',
    address1: '',
    address2: '',
    phone: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  const { data: missions } = useQuery<Mission[]>({
    queryKey: ["/api/profile/missions"],
  });

  const { data: paymentHistory } = useQuery<PaymentRecord[]>({
    queryKey: ["/api/profile/payments"],
  });

  const profileTabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'exchange', label: 'Exchange', icon: RefreshCw }
  ];

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      const response = await apiRequest("POST", "/api/profile/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async (data: typeof accountForm) => {
      const response = await apiRequest("POST", "/api/profile/update", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your account information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate(passwordForm);
  };

  const handleAccountUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccountMutation.mutate(accountForm);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            {/* Profile Overview */}
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-white">{user?.username || 'User'}</h3>
                    <p className="text-gray-400">Member since {new Date().getFullYear()}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Verified
                      </Badge>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        Level 1
                      </Badge>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAccountUpdate} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        value={accountForm.username || user?.username || ''}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, username: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={accountForm.email}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        value={accountForm.phoneNumber}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-white">Country</Label>
                      <Input
                        id="country"
                        value={accountForm.country}
                        onChange={(e) => setAccountForm(prev => ({ ...prev, country: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={updateAccountMutation.isPending}>
                    {updateAccountMutation.isPending ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-white">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <Button type="submit" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-white font-medium mb-3">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-white text-sm">2FA Protection</p>
                        <p className="text-gray-400 text-xs">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address Section */}
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e) => { e.preventDefault(); /* Handle shipping update */ }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter name"
                        value={shippingForm.firstName}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={shippingForm.lastName}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shippingEmail" className="text-white">Email Address</Label>
                    <Input
                      id="shippingEmail"
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country" className="text-white">Country</Label>
                      <Input
                        id="country"
                        placeholder="Select country"
                        value={shippingForm.country}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, country: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-white">City</Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode" className="text-white">Postal / ZIP Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="Enter postal / zip code"
                        value={shippingForm.postalCode}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-white">State / Province</Label>
                      <Input
                        id="state"
                        placeholder="Enter state / province"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, state: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address1" className="text-white">Address 1</Label>
                      <Input
                        id="address1"
                        placeholder="Enter address"
                        value={shippingForm.address1}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, address1: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address2" className="text-white">Address 2 (optional)</Label>
                      <Input
                        id="address2"
                        placeholder="Enter address"
                        value={shippingForm.address2}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, address2: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shippingPhone" className="text-white">Phone</Label>
                    <Input
                      id="shippingPhone"
                      placeholder="Enter number"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      case 'missions':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Daily Missions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missions && missions.filter(m => m.type === 'daily').map((mission) => (
                    <div key={mission.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-medium">{mission.title}</h4>
                          <p className="text-gray-400 text-sm">{mission.description}</p>
                        </div>
                        <Badge variant={mission.completed ? "default" : "secondary"}>
                          {mission.completed ? "Complete" : "In Progress"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Progress</span>
                          <span className="text-white">{mission.progress}/{mission.target}</span>
                        </div>
                        <Progress value={(mission.progress / mission.target) * 100} className="h-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400 text-sm">
                            Reward: {formatCurrency(mission.reward)}
                          </span>
                          {mission.completed && !mission.claimed && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Claim Reward
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Identity Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="text-white font-medium">Email Verified</h4>
                      <p className="text-gray-400 text-sm">Your email address has been confirmed</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                    <div>
                      <h4 className="text-white font-medium">Identity Verification Pending</h4>
                      <p className="text-gray-400 text-sm">Complete KYC verification to increase your limits</p>
                    </div>
                  </div>
                  <Button className="mt-3 bg-orange-600 hover:bg-orange-700">
                    Start Verification
                  </Button>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Verification Benefits</h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Higher withdrawal limits
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Priority customer support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Access to exclusive features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Enhanced account security
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentHistory && paymentHistory.length > 0 ? (
                    paymentHistory.map((payment) => (
                      <div key={payment.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              payment.type === 'deposit' ? 'bg-green-600/20' : 'bg-red-600/20'
                            }`}>
                              <DollarSign className={`w-5 h-5 ${
                                payment.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                              }`} />
                            </div>
                            <div>
                              <h4 className="text-white font-medium capitalize">
                                {payment.type} - {payment.method}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {new Date(payment.date).toLocaleDateString()}
                              </p>
                              <p className="text-gray-500 text-xs">
                                ID: {payment.transactionId}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              payment.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {payment.type === 'deposit' ? '+' : '-'}{formatCurrency(payment.amount)}
                            </p>
                            <Badge variant={
                              payment.status === 'completed' ? 'default' : 
                              payment.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No payment history found</p>
                      <p className="text-gray-500 text-sm">Your transactions will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'cart':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Your cart is empty</p>
                  <p className="text-gray-500 text-sm">Add items to your cart for bulk purchases</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/'}>
                    Browse Cases
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'exchange':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Item Exchange
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <RefreshCw className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Exchange coming soon</p>
                  <p className="text-gray-500 text-sm">Trade your items with other players</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen cases-bg py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Profile Settings</h1>
              <p className="text-gray-400 text-sm md:text-base">Manage your account and preferences</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="bg-gray-800/50 rounded-lg p-1 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-1">
              {profileTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-20 md:mb-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}