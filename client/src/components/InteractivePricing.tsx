import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Crown, Zap, Star, Users, FileText, Shield, Brain } from "lucide-react";

type PlanType = 'micro' | 'essential' | 'professional' | 'enterprise';

interface Feature {
  name: string;
  description: string;
  included: {
    micro: boolean;
    essential: boolean;
    professional: boolean;
    enterprise: boolean;
  };
  icon?: any;
}

const features: Feature[] = [
  {
    name: "Users Included",
    description: "Number of team members who can access the platform",
    included: { micro: true, essential: true, professional: true, enterprise: true },
    icon: Users
  },
  {
    name: "AI Document Generation",
    description: "Basic AI-powered risk assessments and method statements",
    included: { micro: true, essential: true, professional: true, enterprise: true },
    icon: Brain
  },
  {
    name: "Basic Health & Safety Templates",
    description: "Standard UK construction safety documentation",
    included: { micro: true, essential: true, professional: true, enterprise: true },
    icon: Shield
  },
  {
    name: "CSCS Card Tracking",
    description: "Monitor certification expiry dates with automated alerts",
    included: { micro: true, essential: true, professional: true, enterprise: true },
    icon: CheckCircle
  },
  {
    name: "ISO 9001 Document Library",
    description: "Premium quality management system templates and procedures",
    included: { micro: false, essential: false, professional: true, enterprise: true },
    icon: Crown
  },
  {
    name: "Advanced AI Analytics",
    description: "Intelligent compliance predictions and risk analysis",
    included: { micro: false, essential: false, professional: true, enterprise: true },
    icon: Zap
  },
  {
    name: "Custom Document Templates",
    description: "Bespoke documentation tailored to your specific trade",
    included: { micro: false, essential: false, professional: true, enterprise: true },
    icon: FileText
  },
  {
    name: "Priority AI Processing",
    description: "Faster document generation with dedicated AI resources",
    included: { micro: false, essential: false, professional: true, enterprise: true },
    icon: Star
  },
  {
    name: "Digital Signatures & QR Codes",
    description: "Professional document authentication and tracking",
    included: { micro: false, essential: false, professional: true, enterprise: true },
    icon: CheckCircle
  },
  {
    name: "Custom AI Training",
    description: "AI model trained specifically on your company's processes",
    included: { micro: false, essential: false, professional: false, enterprise: true },
    icon: Brain
  },
  {
    name: "Dedicated AI Instance",
    description: "Private AI processing for maximum performance and security",
    included: { micro: false, essential: false, professional: false, enterprise: true },
    icon: Crown
  },
  {
    name: "24/7 Priority Support",
    description: "Dedicated support manager with instant response times",
    included: { micro: false, essential: false, professional: false, enterprise: true },
    icon: Shield
  }
];

const planDetails = {
  micro: {
    name: "Micro Business",
    monthlyPrice: "£35",
    yearlyPrice: "£350", // 2 months free (10 months price)
    monthlySavings: "£0",
    yearlySavings: "£70",
    users: "1 user",
    description: "Perfect for sole traders and micro businesses starting with AI compliance",
    color: "border-green-200 bg-green-50",
    buttonClass: "bg-green-600 hover:bg-green-700 text-white"
  },
  essential: {
    name: "Essential",
    monthlyPrice: "£65",
    yearlyPrice: "£650", // 2 months free (10 months price)
    monthlySavings: "£0",
    yearlySavings: "£130",
    users: "3 users",
    description: "Perfect for small teams getting started with AI compliance",
    color: "border-blue-200 bg-blue-50",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white"
  },
  professional: {
    name: "Professional",
    monthlyPrice: "£129",
    yearlyPrice: "£1,290", // 2 months free
    monthlySavings: "£0",
    yearlySavings: "£258",
    users: "10 users", 
    description: "Advanced AI features for growing construction businesses",
    color: "border-purple-200 bg-purple-50 ring-2 ring-purple-300",
    buttonClass: "bg-purple-600 hover:bg-purple-700 text-white"
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: "£299",
    yearlyPrice: "£2,990", // 2 months free
    monthlySavings: "£0",
    yearlySavings: "£598",
    users: "50 users",
    description: "Complete AI solution for large construction enterprises", 
    color: "border-amber-200 bg-amber-50",
    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white"
  }
};

export function InteractivePricing() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const handlePlanSelect = (plan: PlanType) => {
    localStorage.setItem('selectedPlan', plan);
    localStorage.setItem('billingCycle', billingCycle);
    window.location.href = '/auth';
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your AI Plan
          </h2>
          <p className="text-xl text-slate-600 mb-8">12-month commitment • Save 2 months with yearly billing</p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 mb-8">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {(Object.keys(planDetails) as PlanType[]).map((planKey) => {
            const plan = planDetails[planKey];
            const isSelected = selectedPlan === planKey;
            
            return (
              <Card 
                key={planKey}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected ? plan.color : 'border-slate-200 hover:border-slate-300'
                } ${planKey === 'professional' ? 'relative' : ''}`}
                onClick={() => setSelectedPlan(isSelected ? null : planKey)}
              >
                {planKey === 'professional' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white border-0 px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      {billingCycle === 'yearly' ? (
                        <div>
                          <span className="text-4xl font-bold text-slate-900">{plan.yearlyPrice}</span>
                          <span className="text-slate-600">/year</span>
                          <div className="text-sm text-green-600 font-medium mt-1">
                            Save {plan.yearlySavings} annually
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-slate-900">{plan.monthlyPrice}</span>
                          <span className="text-slate-600">/month</span>
                          <div className="text-sm text-slate-500 mt-1">
                            12-month commitment
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-600 mb-2">{plan.description}</p>
                    <p className="text-sm font-medium text-slate-700">{plan.users} included</p>
                  </div>

                  <Button 
                    className={`w-full mb-4 ${plan.buttonClass}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanSelect(planKey);
                    }}
                  >
                    {planKey === 'enterprise' ? 'Contact Sales' : `Subscribe to ${plan.name}`}
                  </Button>

                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(isSelected ? null : planKey);
                      }}
                    >
                      {isSelected ? 'Hide Features' : 'View All Features'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        {selectedPlan && (
          <Card className="bg-white border-2 border-slate-200">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  What's included in {planDetails[selectedPlan].name}?
                </h3>
                <p className="text-slate-600">
                  Here's everything you'll get with your {planDetails[selectedPlan].name} plan
                </p>
              </div>

              <div className="grid gap-4">
                {features.map((feature, index) => {
                  const isIncluded = feature.included[selectedPlan];
                  const FeatureIcon = feature.icon || CheckCircle;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                        isIncluded 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200 opacity-60'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isIncluded ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {isIncluded ? (
                          <FeatureIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          isIncluded ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {feature.name}
                          {feature.name === "Users Included" && (
                            <span className="ml-2 text-sm font-normal">
                              ({planDetails[selectedPlan].users})
                            </span>
                          )}
                        </h4>
                        <p className={`text-sm ${
                          isIncluded ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {feature.description}
                        </p>
                        {!isIncluded && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            Available in higher plans
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <Button 
                  className={planDetails[selectedPlan].buttonClass}
                  size="lg"
                  onClick={() => handlePlanSelect(selectedPlan)}
                >
                  Choose {planDetails[selectedPlan].name} Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Terms Notice */}
        <div className="mt-12 text-center">
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-slate-900 mb-2">
                📋 Contract Terms & Commitment
              </h4>
              <p className="text-slate-700 mb-4">
                <strong>All plans require a 12-month minimum commitment.</strong><br />
                Choose monthly billing (12 payments) or yearly billing (save 17% with upfront payment).
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 border">
                  <h5 className="font-semibold text-slate-900 mb-2">🎯 Key Difference: ISO 9001 Library</h5>
                  <p className="text-slate-700">
                    <strong>Essential:</strong> Basic health & safety only<br />
                    <strong>Professional+:</strong> Full ISO 9001:2015 documents
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <h5 className="font-semibold text-slate-900 mb-2">💰 Payment Options</h5>
                  <p className="text-slate-700">
                    <strong>Monthly:</strong> Pay monthly, 12-month commitment<br />
                    <strong>Yearly:</strong> Pay upfront, save 2 months free
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}