import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Tag, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface VoucherCodeInputProps {
  planType: string;
  onVoucherApplied: (voucher: AppliedVoucher) => void;
  onVoucherRemoved: () => void;
  appliedVoucher?: AppliedVoucher;
}

interface AppliedVoucher {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_month' | 'bypass_payment';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}

export function VoucherCodeInput({ planType, onVoucherApplied, onVoucherRemoved, appliedVoucher }: VoucherCodeInputProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const validateVoucher = async () => {
    if (!voucherCode.trim()) {
      setError("Please enter a voucher code");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/validate-voucher", {
        code: voucherCode.trim().toUpperCase(),
        planType: planType
      });

      onVoucherApplied(response as AppliedVoucher);
      setVoucherCode("");
      
    } catch (err: any) {
      setError(err.message || "Invalid voucher code");
    } finally {
      setIsValidating(false);
    }
  };

  const removeVoucher = () => {
    onVoucherRemoved();
    setVoucherCode("");
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateVoucher();
    }
  };

  if (appliedVoucher) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {appliedVoucher.code}
                  </Badge>
                  {appliedVoucher.discountType === 'bypass_payment' && (
                    <Badge className="bg-green-600 text-white">
                      FREE ACCESS
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {appliedVoucher.description}
                </p>
                {appliedVoucher.discountType !== 'bypass_payment' && (
                  <p className="text-sm font-medium text-green-800">
                    {appliedVoucher.discountType === 'percentage' && `${appliedVoucher.discountValue}% discount`}
                    {appliedVoucher.discountType === 'fixed_amount' && `£${(appliedVoucher.discountValue / 100).toFixed(2)} off`}
                    {appliedVoucher.discountType === 'free_month' && `${appliedVoucher.discountValue} month${appliedVoucher.discountValue > 1 ? 's' : ''} free`}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={removeVoucher}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-slate-300">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Tag className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Have a voucher code?</span>
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter voucher code"
            className="uppercase font-mono"
            disabled={isValidating}
          />
          <Button
            onClick={validateVoucher}
            disabled={isValidating || !voucherCode.trim()}
            size="sm"
            variant="outline"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>

        {error && (
          <Alert className="mt-3 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-slate-500 mt-2">
          Enter your voucher code for discounts or special offers
        </p>
      </CardContent>
    </Card>
  );
}