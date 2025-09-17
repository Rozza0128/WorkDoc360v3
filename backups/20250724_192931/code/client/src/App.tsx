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
import Demo from "@/pages/demo";
import CSCSVerificationPage from "@/pages/cscs-verification";
import DocumentRecommendationsPage from "@/pages/document-recommendations";

import TermsAndConditions from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";
import { SupportChatbot } from "@/components/SupportChatbot";
import { useState } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/cscs-verification" component={CSCSVerificationPage} />
      <Route path="/demo" component={Demo} />
      <Route path="/terms" component={TermsAndConditions} />
      <Route path="/privacy" component={PrivacyPolicy} />
      
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/test-tabs" component={TestDashboard} />
          <Route path="/simple-test" component={SimpleTest} />
          <Route path="/direct-tabs" component={DirectTabs} />
          <Route path="/minimal" component={MinimalReact} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/dashboard/:companyId" component={Dashboard} />
          <Route path="/document-recommendations" component={DocumentRecommendationsPage} />
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
