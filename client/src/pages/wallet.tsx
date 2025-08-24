import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, History, Coins, Bitcoin, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import StripeCheckout from "@/components/StripeCheckout";
import type { User } from "@shared/schema";

interface Transaction {
  id: number;
  userId: number;
  type: 'deposit' | 'withdrawal' | 'box_purchase' | 'refund';
  amount: string;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  description: string;
}

export default function Wallet() {
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'crypto' | 'paypal'>('card');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: !!authUser,
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/user/transactions"],
    enabled: !!authUser,
  });

  const depositMutation = useMutation({
    mutationFn: async ({ amount, method }: { amount: number, method: string }) => {
      const response = await apiRequest("POST", "/api/payments/deposit", { amount, method });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/transactions"] });
      setShowDepositModal(false);
      setDepositAmount('');
      toast({
        title: "Deposit Successful",
        description: `$${depositAmount} has been added to your balance`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, method }: { amount: number, method: string }) => {
      const response = await apiRequest("POST", "/api/payments/withdraw", { amount, method });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      toast({
        title: "Withdrawal Initiated",
        description: `$${withdrawAmount} withdrawal is being processed`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is $5",
        variant: "destructive",
      });
      return;
    }
    
    // Show Stripe checkout for card payments
    if (selectedPaymentMethod === 'card') {
      setCheckoutAmount(amount);
      setShowStripeCheckout(true);
      setShowDepositModal(false);
      return;
    }
    
    const methodName = selectedPaymentMethod === 'crypto' ? 'Bitcoin' : 'PayPal';
    depositMutation.mutate({ amount, method: methodName });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is $10",
        variant: "destructive",
      });
      return;
    }
    
    if (!user || amount > parseFloat(user.usdBalance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate({ amount, method: 'Bank Transfer' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case 'purchase': return <ArrowUpRight className="w-4 h-4 text-orange-400" />;
      case 'refund': return <ArrowDownLeft className="w-4 h-4 text-blue-400" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-400">Loading wallet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text mb-2">Wallet</h1>
          <p className="text-gray-400">Manage your balance, deposits, and withdrawals</p>
        </div>

        {/* Balance Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="cases-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">USD Balance</CardTitle>
                <CardDescription>Available for box openings</CardDescription>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-4">
                {formatCurrency(parseFloat(user.usdBalance))}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowDepositModal(true)}
                  className="cases-button"
                  size="sm"
                >
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cases-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Gold Coins</CardTitle>
                <CardDescription>Earned from openings</CardDescription>
              </div>
              <Coins className="w-8 h-8 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-4">
                {user.goldCoins?.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-gray-400">
                Gold coins are earned from box openings and can be used for special rewards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="cases-card">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods</CardTitle>
            <CardDescription>Choose your preferred payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div
                onClick={() => setSelectedPaymentMethod('card')}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="font-medium text-white">Credit/Debit Card</h3>
                    <p className="text-xs text-gray-400">Instant deposits</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSelectedPaymentMethod('crypto')}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'crypto'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bitcoin className="w-6 h-6 text-orange-400" />
                  <div>
                    <h3 className="font-medium text-white">Cryptocurrency</h3>
                    <p className="text-xs text-gray-400">BTC, ETH, USDT</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSelectedPaymentMethod('paypal')}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPaymentMethod === 'paypal'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-white">PayPal</h3>
                    <p className="text-xs text-gray-400">Secure & fast</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="cases-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Transaction History</CardTitle>
              <CardDescription>Your recent deposits and withdrawals</CardDescription>
            </div>
            <History className="w-6 h-6 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.filter(transaction => transaction.type === 'deposit' || transaction.type === 'withdrawal').map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <h4 className="font-medium text-white">{transaction.description}</h4>
                      <p className="text-sm text-gray-400">{transaction.method}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-medium ${
                        parseFloat(transaction.amount) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {parseFloat(transaction.amount) > 0 ? '+' : ''}${Math.abs(parseFloat(transaction.amount))}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="cases-card w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white">Add Funds</CardTitle>
                <CardDescription>Deposit money to your wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount..."
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="cases-input"
                    min="5"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum deposit: $5</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeposit}
                    disabled={depositMutation.isPending}
                    className="cases-button flex-1"
                  >
                    {depositMutation.isPending ? 'Processing...' : 'Deposit'}
                  </Button>
                  <Button
                    onClick={() => setShowDepositModal(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="cases-card w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white">Withdraw Funds</CardTitle>
                <CardDescription>Transfer money to your bank account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount..."
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="cases-input"
                    min="10"
                    step="0.01"
                    max={parseFloat(user.usdBalance)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Available: {formatCurrency(parseFloat(user.usdBalance))} | Minimum: $10
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleWithdraw}
                    disabled={withdrawMutation.isPending}
                    className="cases-button flex-1"
                  >
                    {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
                  </Button>
                  <Button
                    onClick={() => setShowWithdrawModal(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stripe Checkout Modal */}
        {showStripeCheckout && (
          <StripeCheckout
            amount={checkoutAmount}
            onSuccess={() => {
              setShowStripeCheckout(false);
              setDepositAmount('');
              queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            }}
            onCancel={() => setShowStripeCheckout(false)}
          />
        )}
      </div>
    </div>
  );
}