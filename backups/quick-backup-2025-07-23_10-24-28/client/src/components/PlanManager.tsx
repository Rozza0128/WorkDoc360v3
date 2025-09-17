import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Crown, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function PlanManager() {
  const { user } = useAuth();

  if (!user) return null;

  const planDetails = {
    essential: {
      name: "Essential",
      price: "£65",
      color: "bg-blue-500",
      icon: CheckCircle,
      features: ["3 users included", "AI document generation", "Basic compliance tracking", "Email support"]
    },
    professional: {
      name: "Professional", 
      price: "£129",
      color: "bg-purple-500",
      icon: Zap,
      features: ["10 users included", "Advanced AI analytics", "Smart compliance predictions", "Priority AI processing", "Custom branding"]
    },
    enterprise: {
      name: "Enterprise",
      price: "£299", 
      color: "bg-amber-500",
      icon: Crown,
      features: ["50 users included", "Custom AI training", "Dedicated AI instance", "24/7 priority support", "API access"]
    }
  };

  const currentPlan = planDetails[user.selectedPlan as keyof typeof planDetails] || planDetails.essential;
  const PlanIcon = currentPlan.icon;

  const contractEndDate = user.contractEndDate ? new Date(user.contractEndDate) : null;
  const isContractActive = contractEndDate && contractEndDate > new Date();
  const daysLeft = contractEndDate ? Math.ceil((contractEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PlanIcon className="h-5 w-5 text-blue-600" />
              <span>Current Plan: {currentPlan.name}</span>
            </div>
            <Badge variant={user.planStatus === 'pending_payment' ? 'destructive' : user.planStatus === 'active' ? 'default' : 'secondary'}>
              {user.planStatus === 'pending_payment' ? 'Payment Required' : 
               user.planStatus === 'active' && isContractActive ? `${daysLeft} days left` : 
               user.planStatus}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {user.planStatus === 'pending_payment' 
                ? `You've selected the ${currentPlan.name} plan. Complete your payment to activate your 12-month subscription.`
                : user.planStatus === 'active' && isContractActive
                ? `You're subscribed to the ${currentPlan.name} plan (${user.subscriptionType} billing). Contract ends in ${daysLeft} days.`
                : `Your ${currentPlan.name} plan subscription.`
              }
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Plan Features:</h4>
              <ul className="space-y-1">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {user.planStatus === 'trial' && (
              <div className="flex space-x-2 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    // This will be connected to Stripe when payment is implemented
                    alert('Payment processing will be available soon! Your trial continues for now.');
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Upgrade to {currentPlan.name}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // This will show plan comparison modal
                    alert('Plan comparison coming soon!');
                  }}
                >
                  Compare Plans
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Integration Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Payment Integration Coming Soon</h4>
              <p className="text-sm text-amber-700 mt-1">
                We're setting up secure payment processing. During your trial period, you have full access to all features of your selected plan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}