import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Vault,
  DollarSign,
  Shield,
  Lock,
  Timer,
  ArrowUp,
  ArrowDown,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";

interface VaultData {
  balance: number;
  lockedAmount: number;
  lockEndTime?: string;
  lockDuration?: number;
}

interface VaultTransaction {
  id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  timestamp: string;
  status: 'completed' | 'pending';
}

export default function VaultPage() {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [lockDuration, setLockDuration] = useState('10');
  const [showHistory, setShowHistory] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vaultData } = useQuery<VaultData>({
    queryKey: ["/api/vault/balance"],
  });

  const { data: vaultTransactions } = useQuery<VaultTransaction[]>({
    queryKey: ["/api/vault/transactions"],
    enabled: showHistory,
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; lockDuration: number }) => {
      const response = await apiRequest("POST", "/api/vault/deposit", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Successful",
        description: "Funds have been deposited to your vault.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vault/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setDepositAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Unable to deposit funds.",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      const response = await apiRequest("POST", "/api/vault/withdraw", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Successful",
        description: "Funds have been withdrawn from your vault.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vault/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setWithdrawAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Unable to withdraw funds.",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    const duration = parseInt(lockDuration);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit.",
        variant: "destructive",
      });
      return;
    }

    if (amount > parseFloat(user?.usdBalance || '0')) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance to deposit this amount.",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({ amount, lockDuration: duration });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }

    if (amount > (vaultData?.balance || 0)) {
      toast({
        title: "Insufficient Vault Balance",
        description: "You don't have enough funds in your vault.",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({ amount });
  };

  const setMaxDeposit = () => {
    setDepositAmount(user?.usdBalance || '0');
  };

  const setMaxWithdraw = () => {
    setWithdrawAmount(String(vaultData?.balance || 0));
  };

  const isVaultLocked = vaultData?.lockEndTime && new Date(vaultData.lockEndTime) > new Date();

  return (
    <div className="min-h-screen cases-bg py-4 md:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Vault className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Vault</h1>
                <p className="text-gray-400 text-sm md:text-base">Secure storage for your funds</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="border-gray-600"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        {/* Vault Icon and Balance */}
        <Card className="cases-card border-gray-700 mb-6">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Vault className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3 mb-4 inline-block">
              <span className="text-gray-400 text-sm">Vaulted: </span>
              <span className="text-white font-medium">{formatCurrency(vaultData?.balance || 0)}</span>
            </div>

            <div className="text-4xl font-bold text-white mb-2">
              {formatCurrency(vaultData?.balance || 0)}
            </div>

            {isVaultLocked && (
              <div className="flex items-center justify-center gap-2 text-orange-400 text-sm">
                <Lock className="w-4 h-4" />
                <span>Locked until {new Date(vaultData.lockEndTime!).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deposit Section */}
        <Card className="cases-card border-gray-700 mb-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUp className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-medium">Deposit to Vault</h3>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setMaxDeposit}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 border-gray-600 text-cyan-400 hover:text-cyan-300"
                >
                  Max
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleDeposit}
                  disabled={depositMutation.isPending || !depositAmount}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  {depositMutation.isPending ? 'Depositing...' : 'Deposit to Vault'}
                </Button>
              </div>
              
              <div className="text-gray-400 text-sm">
                Available: {formatCurrency(parseFloat(user?.usdBalance || '0'))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Section */}
        <Card className="cases-card border-gray-700 mb-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowDown className="w-5 h-5 text-red-400" />
              <h3 className="text-white font-medium">Withdraw from Vault</h3>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  disabled={isVaultLocked}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={setMaxWithdraw}
                  disabled={isVaultLocked}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 border-gray-600 text-cyan-400 hover:text-cyan-300"
                >
                  Max
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending || !withdrawAmount || isVaultLocked}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                >
                  {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw from Vault'}
                </Button>
              </div>
              
              {isVaultLocked ? (
                <div className="text-orange-400 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Vault is currently locked
                </div>
              ) : (
                <div className="text-gray-400 text-sm">
                  Vault Balance: {formatCurrency(vaultData?.balance || 0)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lock Duration */}
        <Card className="cases-card border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-medium">Lock vault for...</h3>
            </div>
            
            <Select value={lockDuration} onValueChange={setLockDuration}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
                <SelectItem value="360">6 hours</SelectItem>
                <SelectItem value="720">12 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-300 text-sm">
                <Lock className="w-4 h-4" />
                <span>Locking prevents withdrawals for the selected duration</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        {showHistory && (
          <Card className="cases-card border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vaultTransactions && vaultTransactions.length > 0 ? (
                  vaultTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-600/20' : 'bg-red-600/20'
                          }`}>
                            {transaction.type === 'deposit' ? 
                              <ArrowUp className="w-4 h-4 text-green-400" /> : 
                              <ArrowDown className="w-4 h-4 text-red-400" />
                            }
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">{transaction.type}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-gray-400 text-sm capitalize">{transaction.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No vault transactions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}