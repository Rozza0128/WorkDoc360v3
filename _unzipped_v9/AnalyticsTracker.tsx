import { useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

// Track key conversion events
export function useAnalytics() {
  const [location] = useLocation();

  // Track page views
  useEffect(() => {
    trackEvent("page_view", {
      page: location,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }, [location]);

  const trackEvent = async (event: string, properties?: Record<string, any>) => {
    try {
      // Send to backend for analytics processing
      await apiRequest("POST", "/api/analytics/track", {
        event,
        properties: {
          ...properties,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  };

  return { trackEvent };
}

// Conversion tracking for key business events
export function useConversionTracking() {
  const { trackEvent } = useAnalytics();

  const trackSignup = (method: "email" | "social", userDetails?: any) => {
    trackEvent("user_signup", {
      method,
      ...userDetails,
      funnel_step: "registration_complete"
    });
  };

  const trackCompanyCreation = (companyData: any) => {
    trackEvent("company_created", {
      trade_type: companyData.tradeType,
      business_type: companyData.businessType,
      funnel_step: "onboarding_complete"
    });
  };

  const trackDocumentGeneration = (documentType: string, isFreeTrial: boolean) => {
    trackEvent("document_generated", {
      document_type: documentType,
      is_free_trial: isFreeTrial,
      funnel_step: isFreeTrial ? "free_trial_usage" : "paid_usage"
    });
  };

  const trackUpgradeViewed = (source: "onboarding" | "usage_limit" | "dashboard") => {
    trackEvent("upgrade_page_viewed", {
      source,
      funnel_step: "upgrade_consideration"
    });
  };

  const trackPlanSelected = (planType: string, billingCycle: string, source: string) => {
    trackEvent("plan_selected", {
      plan_type: planType,
      billing_cycle: billingCycle,
      source,
      funnel_step: "plan_selection"
    });
  };

  const trackPaymentStarted = (planType: string, amount: number) => {
    trackEvent("payment_started", {
      plan_type: planType,
      amount,
      funnel_step: "payment_initiation"
    });
  };

  const trackPaymentCompleted = (planType: string, amount: number, subscriptionId: string) => {
    trackEvent("payment_completed", {
      plan_type: planType,
      amount,
      subscription_id: subscriptionId,
      funnel_step: "conversion_complete"
    });
  };

  const trackAbandonedCart = (planType: string, stage: string) => {
    trackEvent("cart_abandoned", {
      plan_type: planType,
      stage,
      funnel_step: "abandonment"
    });
  };

  return {
    trackSignup,
    trackCompanyCreation,
    trackDocumentGeneration,
    trackUpgradeViewed,
    trackPlanSelected,
    trackPaymentStarted,
    trackPaymentCompleted,
    trackAbandonedCart
  };
}

// Component to automatically track analytics
export function AnalyticsTracker() {
  useAnalytics();
  return null;
}