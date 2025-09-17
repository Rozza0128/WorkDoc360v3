import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { VoucherCodeInput } from "./VoucherCodeInput";
import { apiRequest } from "@/lib/queryClient";

interface PaymentButtonProps {
  onPaymentComplete?: () => void;
}

interface AppliedVoucher {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_month' | 'bypass_payment';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}

export function PaymentButton({ onPaymentComplete }: PaymentButtonProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | undefined>();

  if (!user || (user as any).planStatus === 'active') {
    return null;
  }

  const planPricing = {
    essential: { monthly: 65, yearly: 650 },
    professional: { monthly: 129, yearly: 1290 },
    enterprise: { monthly: 299, yearly: 2990 },
    micro: { monthly: 35, yearly: 350 }
  };

  const currentPlan = (user as any).selectedPlan as keyof typeof planPricing;
  const isYearly = (user as any).subscriptionType === 'yearly';
  
  // Calculate base amount
  const baseAmount = isYearly 
    ? planPricing[currentPlan]?.yearly 
    : planPricing[currentPlan]?.monthly * 12; // 12-month commitment

  // Calculate final amount after voucher
  const finalAmount = appliedVoucher?.discountType === 'bypass_payment' 
    ? 0 
    : appliedVoucher?.finalAmount || baseAmount;

  const savings = isYearly 
    ? (planPricing[currentPlan]?.monthly * 12) - planPricing[currentPlan]?.yearly
    : 0;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Check if payment should be bypassed
      if (appliedVoucher?.discountType === 'bypass_payment') {
        // Record voucher usage and activate account
        await apiRequest('POST', '/api/activate-with-voucher', {
          voucherCode: appliedVoucher.code,
          planId: (user as any).selectedPlan,
          billingCycle: (user as any).subscriptionType
        });
        
        onPaymentComplete?.();
        return;
      }

      // Process normal payment with Stripe
      console.log('Processing payment for:', {
        plan: (user as any).selectedPlan,
        originalAmount: baseAmount,
        finalAmount: finalAmount,
        voucherCode: appliedVoucher?.code,
        billingCycle: (user as any).subscriptionType
      });
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call your payment API with voucher info
      const response = await apiRequest('POST', '/api/create-subscription', {
        planId: (user as any).selectedPlan,
        billingCycle: (user as any).subscriptionType,
        amount: finalAmount,
        voucherCode: appliedVoucher?.code,
        discountAmount: appliedVoucher?.discountAmount
      });
      
      onPaymentComplete?.();
      
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoucherApplied = (voucher: AppliedVoucher) => {
    setAppliedVoucher(voucher);
  };

  const handleVoucherRemoved = () => {
    setAppliedVoucher(undefined);
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Complete Your Subscription</span>
          </span>
          <Badge variant="destructive">Payment Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voucher Code Input */}
        <VoucherCodeInput
          planType={(user as any).selectedPlan}
          onVoucherApplied={handleVoucherApplied}
          onVoucherRemoved={handleVoucherRemoved}
          appliedVoucher={appliedVoucher}
        />

        <div className="bg-white rounded-lg p-4 border">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-slate-900 capitalize">
                {(user as any).selectedPlan} Plan
              </h4>
              <p className="text-sm text-slate-600">
                {isYearly ? 'Annual billing' : 'Monthly billing (12-month commitment)'}
              </p>
            </div>
            <div className="text-right">
              {appliedVoucher && appliedVoucher.discountType !== 'bypass_payment' && (
                <div className="text-sm text-slate-500 line-through">
                  £{baseAmount?.toLocaleString()}
                </div>
              )}
              <div className={`text-2xl font-bold ${finalAmount === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                {finalAmount === 0 ? 'FREE' : `£${finalAmount?.toLocaleString()}`}
              </div>
              <div className="text-sm text-slate-600">
                {isYearly ? 'paid annually' : 'total (12 months)'}
              </div>
              {appliedVoucher && appliedVoucher.discountType !== 'bypass_payment' && (
                <div className="text-sm text-green-600 font-medium">
                  Saved £{appliedVoucher.discountAmount / 100}
                </div>
              )}
            </div>
          </div>
          
          {isYearly && savings > 0 && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Save £{savings} with annual billing
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4" />
          <span>12-month minimum commitment</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          <span>
            {isYearly 
              ? 'Next billing: 12 months from activation'
              : `Next billing: Monthly starting from activation`
            }
          </span>
        </div>

        <Button 
          className={`w-full text-white ${
            finalAmount === 0 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`} 
          size="lg"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              {finalAmount === 0 ? 'Activating Account...' : 'Processing Payment...'}
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              {finalAmount === 0 
                ? 'Activate Free Access' 
                : `Pay £${finalAmount?.toLocaleString()} ${isYearly ? 'Now' : '(First Payment)'}`
              }
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Secure payment powered by Stripe. Cancel anytime after 12-month commitment.
        </p>
      </CardContent>
    </Card>
  );
}