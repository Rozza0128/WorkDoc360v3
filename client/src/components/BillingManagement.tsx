import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  CreditCard, 
  Receipt, 
  Calendar, 
  Users, 
  TrendingUp,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface BillingManagementProps {
  companyId: number;
  currentUserRole: string;
}

export function BillingManagement({ companyId, currentUserRole }: BillingManagementProps) {
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "subscription"],
    enabled: !!companyId && currentUserRole === 'admin',
    retry: false,
  });

  const { data: billingHistory, isLoading: isBillingLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "billing/history"],
    enabled: !!companyId && currentUserRole === 'admin',
    retry: false,
  });

  const { data: usage, isLoading: isUsageLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "usage"],
    enabled: !!companyId && currentUserRole === 'admin',
    retry: false,
  });

  const updatePaymentMethodMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return await apiRequest(`/api/companies/${companyId}/billing/payment-method`, {
        method: "POST",
        body: JSON.stringify(paymentData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been updated successfully.",
      });
      setIsPaymentMethodOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "subscription"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorised",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  const changePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest(`/api/companies/${companyId}/subscription/plan`, {
        method: "POST",
        body: JSON.stringify({ planId }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Plan Changed",
        description: "Your subscription plan has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "subscription"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorised",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to change plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (currentUserRole !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Billing & Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 mb-4 text-steel-gray opacity-50" />
            <p className="text-steel-gray">Only company administrators can access billing information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-compliant-green text-white">Active</Badge>;
      case 'trial':
        return <Badge className="bg-construction-blue text-white">Free Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Payment Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Current Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSubscriptionLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : subscription ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-steel-gray">Plan</span>
                  <span className="font-semibold text-charcoal capitalize">{subscription.planName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-steel-gray">Status</span>
                  {getStatusBadge(subscription.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-steel-gray">Monthly Cost</span>
                  <span className="font-semibold text-charcoal">{formatCurrency(subscription.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-steel-gray">Next Billing Date</span>
                  <span className="font-semibold text-charcoal">
                    {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-steel-gray">Users Included</span>
                  <span className="font-semibold text-charcoal">{subscription.includedUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-steel-gray">Additional Users</span>
                  <span className="font-semibold text-charcoal">{subscription.additionalUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-steel-gray">Additional User Cost</span>
                  <span className="font-semibold text-charcoal">
                    {subscription.additionalUsers > 0 
                      ? formatCurrency(subscription.additionalUserCost * subscription.additionalUsers)
                      : '£0.00'
                    }
                  </span>
                </div>
                {subscription.trialEndsAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-steel-gray">Trial Ends</span>
                    <span className="font-semibold text-construction-orange">
                      {formatDate(subscription.trialEndsAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 mb-4 text-steel-gray opacity-50" />
              <p className="text-steel-gray mb-4">No active subscription found.</p>
              <Button className="bg-construction-orange hover:bg-orange-600">
                Subscribe Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Current Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUsageLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : usage ? (
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="mx-auto h-8 w-8 text-construction-blue mb-2" />
                <div className="text-2xl font-bold text-charcoal">{usage.activeUsers}</div>
                <div className="text-sm text-steel-gray">Active Users</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Receipt className="mx-auto h-8 w-8 text-compliant-green mb-2" />
                <div className="text-2xl font-bold text-charcoal">{usage.documentsGenerated}</div>
                <div className="text-sm text-steel-gray">Documents This Month</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Settings className="mx-auto h-8 w-8 text-warning-amber mb-2" />
                <div className="text-2xl font-bold text-charcoal">{usage.customRequests}</div>
                <div className="text-sm text-steel-gray">Custom Requests</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="mx-auto h-8 w-8 text-construction-orange mb-2" />
                <div className="text-2xl font-bold text-charcoal">{usage.customHours}</div>
                <div className="text-sm text-steel-gray">Custom Hours</div>
              </div>
            </div>
          ) : (
            <p className="text-steel-gray text-center py-4">Usage data unavailable</p>
          )}
        </CardContent>
      </Card>

      {/* Plan Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Plan Management</span>
            </div>
            <Dialog open={isPaymentMethodOpen} onOpenChange={setIsPaymentMethodOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="**** **** **** ****" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input id="name" placeholder="Full name on card" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsPaymentMethodOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => updatePaymentMethodMutation.mutate({})}>
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <h4 className="font-semibold text-charcoal mb-2">Essential</h4>
                  <div className="text-2xl font-bold text-charcoal mb-2">£65</div>
                  <p className="text-sm text-steel-gray mb-4">3 users included</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => changePlanMutation.mutate('essential')}
                    disabled={subscription?.planName === 'essential'}
                  >
                    {subscription?.planName === 'essential' ? 'Current Plan' : 'Switch to Essential'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-construction-orange">
              <CardContent className="p-4">
                <div className="text-center">
                  <h4 className="font-semibold text-charcoal mb-2">Professional</h4>
                  <div className="text-2xl font-bold text-charcoal mb-2">£129</div>
                  <p className="text-sm text-steel-gray mb-4">10 users included</p>
                  <Button 
                    size="sm" 
                    className="bg-construction-orange hover:bg-orange-600"
                    onClick={() => changePlanMutation.mutate('professional')}
                    disabled={subscription?.planName === 'professional'}
                  >
                    {subscription?.planName === 'professional' ? 'Current Plan' : 'Switch to Professional'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-construction-blue">
              <CardContent className="p-4">
                <div className="text-center">
                  <h4 className="font-semibold text-charcoal mb-2">Enterprise</h4>
                  <div className="text-2xl font-bold text-charcoal mb-2">£299</div>
                  <p className="text-sm text-steel-gray mb-4">50 users included</p>
                  <Button 
                    size="sm" 
                    className="bg-construction-blue hover:bg-blue-700"
                    onClick={() => changePlanMutation.mutate('enterprise')}
                    disabled={subscription?.planName === 'enterprise'}
                  >
                    {subscription?.planName === 'enterprise' ? 'Current Plan' : 'Switch to Enterprise'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Billing History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isBillingLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : billingHistory && billingHistory.length > 0 ? (
            <div className="space-y-4">
              {billingHistory.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {invoice.status === 'paid' ? (
                        <CheckCircle className="h-4 w-4 text-compliant-green" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-alert-red" />
                      )}
                      <div>
                        <p className="font-medium text-charcoal">
                          Invoice #{invoice.number}
                        </p>
                        <p className="text-sm text-steel-gray">
                          {formatDate(invoice.date)} • {invoice.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-charcoal">{formatCurrency(invoice.amount)}</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 mb-4 text-steel-gray opacity-50" />
              <p className="text-steel-gray">No billing history available yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}