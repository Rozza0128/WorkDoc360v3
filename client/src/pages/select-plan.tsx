import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Crown, Zap, Star, Users, FileText, Shield, Brain, Building2, ArrowLeft } from "lucide-react";

type PlanType = 'micro' | 'essential' | 'professional' | 'enterprise';

const planDetails = {
  micro: {
    name: "Micro Business",
    monthlyPrice: "£35",
    yearlyPrice: "£350", // 10 months price
    users: "1 user",
    description: "Perfect for sole traders and micro businesses starting with AI compliance",
    color: "border-green-200 bg-green-50",
    features: ["Basic AI document generation", "CSCS card tracking", "Basic health & safety templates", "Email support"]
  },
  essential: {
    name: "Essential",
    monthlyPrice: "£65",
    yearlyPrice: "£650", // 10 months price
    users: "Up to 5 users",
    description: "Most popular choice for small to medium construction businesses",
    color: "border-blue-200 bg-blue-50",
    popular: true,
    features: ["Everything in Micro", "Up to 5 team members", "Advanced templates", "Toolbox talk management", "Priority email support"]
  },
  professional: {
    name: "Professional",
    monthlyPrice: "£165",
    yearlyPrice: "£1,650", // 10 months price
    users: "Up to 25 users",
    description: "Advanced features for growing businesses with ISO 9001 compliance needs",
    color: "border-purple-200 bg-purple-50",
    features: ["Everything in Essential", "ISO 9001 document library", "Custom document templates", "Advanced AI analytics", "Digital signatures & QR codes", "Phone support"]
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: "£465",
    yearlyPrice: "£4,650", // 10 months price
    users: "Unlimited users",
    description: "Maximum performance for large operations with custom AI training",
    color: "border-orange-200 bg-orange-50",
    features: ["Everything in Professional", "Custom AI training", "Dedicated AI instance", "24/7 priority support", "Unlimited users", "Custom integrations", "Dedicated account manager"]
  }
};

export default function SelectPlanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('essential');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
  }) as { data: any, isLoading: boolean };

  // Plan selection mutation
  const selectPlanMutation = useMutation({
    mutationFn: async (planData: { selectedPlan: PlanType; subscriptionType: 'monthly' | 'yearly' }) => {
      const res = await apiRequest("POST", "/api/user/select-plan", planData);
      return await res.json();
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Plan Selected!",
        description: `${planDetails[selectedPlan].name} plan selected. Redirecting to payment...`,
      });
      
      // Redirect to payment or dashboard
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to select plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-construction-orange mx-auto"></div>
          <p className="mt-2 text-steel-gray">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const handlePlanSelection = () => {
    selectPlanMutation.mutate({
      selectedPlan,
      subscriptionType: billingCycle
    });
  };

  const getCurrentPrice = (plan: PlanType) => {
    return billingCycle === 'yearly' ? planDetails[plan].yearlyPrice : planDetails[plan].monthlyPrice;
  };

  const getSavings = (plan: PlanType) => {
    if (billingCycle === 'yearly') {
      const monthly = parseInt(planDetails[plan].monthlyPrice.replace('£', ''));
      const yearly = parseInt(planDetails[plan].yearlyPrice.replace('£', ''));
      const annualMonthly = monthly * 12;
      return `Save £${annualMonthly - yearly}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4 text-steel-gray hover:text-charcoal"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-charcoal mb-2">
            Choose Your Subscription Plan
          </h1>
          <p className="text-steel-gray">
            Welcome {user.firstName}! Select the plan that best fits your business needs.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 border shadow-sm">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingCycle('monthly')}
              className={billingCycle === 'monthly' ? 'bg-construction-orange hover:bg-orange-600' : ''}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingCycle('yearly')}
              className={billingCycle === 'yearly' ? 'bg-construction-orange hover:bg-orange-600' : ''}
            >
              Yearly (2 months free)
            </Button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(Object.keys(planDetails) as PlanType[]).map((plan) => {
            const details = planDetails[plan];
            const isSelected = selectedPlan === plan;
            
            return (
              <Card
                key={plan}
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-construction-orange shadow-lg' 
                    : 'hover:shadow-md'
                } ${details.color}`}
                onClick={() => setSelectedPlan(plan)}
              >
                {(details as any).popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-construction-orange text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-charcoal">
                    {details.name}
                  </CardTitle>
                  <div className="text-3xl font-bold text-construction-orange">
                    {getCurrentPrice(plan)}
                    <span className="text-sm text-steel-gray font-normal">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-600 font-medium">
                      {getSavings(plan)}
                    </p>
                  )}
                  <p className="text-sm text-steel-gray">{details.users}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-charcoal">{details.description}</p>
                  
                  <div className="space-y-2">
                    {details.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-charcoal">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full ${
                      isSelected 
                        ? 'bg-construction-orange hover:bg-orange-600' 
                        : 'border-construction-orange text-construction-orange hover:bg-construction-orange hover:text-white'
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary and Confirmation */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-charcoal">Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Selected Plan:</span>
                <span className="font-bold text-construction-orange">
                  {planDetails[selectedPlan].name}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Billing:</span>
                <span className="capitalize">{billingCycle}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Price:</span>
                <span className="font-bold text-2xl text-construction-orange">
                  {getCurrentPrice(selectedPlan)}
                  <span className="text-sm font-normal text-steel-gray">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </span>
              </div>

              {billingCycle === 'yearly' && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 text-center">
                    <strong>{getSavings(selectedPlan)}</strong> with yearly billing!
                  </p>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  <strong>12-month minimum commitment.</strong> All plans include AI document generation and UK construction compliance tools.
                </p>
              </div>

              <Button
                onClick={handlePlanSelection}
                disabled={selectPlanMutation.isPending}
                className="w-full bg-construction-orange hover:bg-orange-600 text-white font-medium py-3"
              >
                {selectPlanMutation.isPending ? "Processing..." : "Continue to Payment"}
              </Button>

              <p className="text-xs text-steel-gray text-center">
                You can change or cancel your plan anytime from your account settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}