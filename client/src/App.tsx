import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import TestDashboard from "@/pages/test-dashboard";
import SimpleTest from "@/pages/simple-test";
import DirectTabs from "@/pages/direct-tabs";
import MinimalReact from "@/pages/minimal-react";
import CSCSVerificationPage from "@/pages/cscs-verification";
import DocumentRecommendationsPage from "@/pages/document-recommendations";
import MasterTradesPage from "@/pages/master-trades";
import SelectPlanPage from "@/pages/select-plan";

import TermsAndConditions from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import HowItWorks from "@/pages/how-it-works";
import { SupportChatbot } from "@/components/SupportChatbot";
import { CompanyHomepage } from "@/components/CompanyHomepage";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check if this is a company subdomain
  const { data: companyData } = useQuery({
    queryKey: ['/api/company/homepage'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // If this is a company subdomain and user is authenticated, show company homepage
  if (companyData && typeof companyData === 'object' && 'isCompanySubdomain' in companyData && companyData.isCompanySubdomain && isAuthenticated) {
    return (
      <Switch>
        {/* Company subdomain routes */}
        <Route path="/" component={() => <CompanyHomepage company={(companyData as any).company} />} />
        <Route path="/dashboard" component={() => <Dashboard />} />
        <Route path="/dashboard/:companyId" component={Dashboard} />
        
        {/* Still allow access to other pages */}
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/terms" component={TermsAndConditions} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      {/* Public pages - always accessible regardless of auth state */}
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/terms" component={TermsAndConditions} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/cscs-verification" component={CSCSVerificationPage} />
      <Route path="/master-trades" component={MasterTradesPage} />
      
      {/* Authentication-dependent routes */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/dashboard/:companyId" component={Dashboard} />
          <Route path="/document-recommendations" component={DocumentRecommendationsPage} />
          <Route path="/select-plan" component={SelectPlanPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/test-tabs" component={TestDashboard} />
          <Route path="/simple-test" component={SimpleTest} />
          <Route path="/direct-tabs" component={DirectTabs} />
          <Route path="/minimal" component={MinimalReact} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <Router />
      <SupportChatbot 
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        userType={isAuthenticated ? 'customer' : 'guest'}
        userName={user && typeof user === 'object' && user !== null && 'firstName' in user ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim() : undefined}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
