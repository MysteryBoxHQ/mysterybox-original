import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreditCard, Bitcoin, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ amount, onSuccess, onCancel }: StripeCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // For sandbox demo, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create payment intent
      const response = await apiRequest("POST", "/api/payments/create-payment-intent", { 
        amount,
        method: paymentMethod 
      });
      const data = await response.json();
      
      if (data.clientSecret) {
        // Simulate successful payment
        await apiRequest("POST", "/api/payments/deposit", { 
          amount, 
          method: paymentMethod === 'card' ? 'Credit Card' : 
                  paymentMethod === 'crypto' ? 'Bitcoin' : 'PayPal' 
        });
        
        onSuccess();
        toast({
          title: "Payment Successful",
          description: `$${amount} has been added to your balance`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="cases-card w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-white">Complete Payment</CardTitle>
          <CardDescription>Add ${amount} to your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Payment Method</label>
            <div className="grid gap-2">
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span className="text-white">Credit/Debit Card</span>
              </div>
              
              <div
                onClick={() => setPaymentMethod('crypto')}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
                  paymentMethod === 'crypto'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <Bitcoin className="w-5 h-5 text-orange-400" />
                <span className="text-white">Cryptocurrency</span>
              </div>
              
              <div
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
                  paymentMethod === 'paypal'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <Smartphone className="w-5 h-5 text-blue-500" />
                <span className="text-white">PayPal</span>
              </div>
            </div>
          </div>

          {/* Card Details Form (only show for card payments) */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Card Number
                </label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({
                    ...cardDetails,
                    number: formatCardNumber(e.target.value)
                  })}
                  className="cases-input"
                  maxLength={19}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Expiry
                  </label>
                  <Input
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({
                      ...cardDetails,
                      expiry: formatExpiry(e.target.value)
                    })}
                    className="cases-input"
                    maxLength={5}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    CVC
                  </label>
                  <Input
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails({
                      ...cardDetails,
                      cvc: e.target.value.replace(/\D/g, '')
                    })}
                    className="cases-input"
                    maxLength={4}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Cardholder Name
                </label>
                <Input
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({
                    ...cardDetails,
                    name: e.target.value
                  })}
                  className="cases-input"
                />
              </div>
            </div>
          )}

          {/* Crypto Instructions */}
          {paymentMethod === 'crypto' && (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <h4 className="font-medium text-orange-400 mb-2">Bitcoin Payment</h4>
              <p className="text-sm text-gray-300">
                You'll be redirected to complete your Bitcoin payment securely.
              </p>
            </div>
          )}

          {/* PayPal Instructions */}
          {paymentMethod === 'paypal' && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="font-medium text-blue-400 mb-2">PayPal Payment</h4>
              <p className="text-sm text-gray-300">
                You'll be redirected to PayPal to complete your payment.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="cases-button flex-1"
            >
              {isProcessing ? 'Processing...' : `Pay $${amount}`}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Your payment is secured with 256-bit SSL encryption
          </p>
        </CardContent>
      </Card>
    </div>
  );
}