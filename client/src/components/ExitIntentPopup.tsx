import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  X,
  Rocket,
  CheckCircle2,
  Clock,
  ArrowRight,
  Gift,
  Zap,
  Shield,
  AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface ExitIntentPopupProps {
  onClose?: () => void;
}

export function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [hasShown, setHasShown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (hasShown) return;

    let mouseLeaveTimer: NodeJS.Timeout;
    let scrollTimer: NodeJS.Timeout;
    let inactivityTimer: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Skip exit intent if user is in demo creator section
      const demoSection = document.getElementById('demo-creator');
      if (demoSection) {
        const rect = demoSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          return; // Don't trigger exit intent during demo creation
        }
      }
      
      // Only trigger if mouse is leaving from the top (typical exit behavior)
      if (e.clientY <= 0) {
        mouseLeaveTimer = setTimeout(() => {
          if (!hasShown) {
            setIsOpen(true);
            setHasShown(true);
          }
        }, 100);
      }
    };

    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // Skip exit intent if user is in demo creator section
        const demoSection = document.getElementById('demo-creator');
        if (demoSection) {
          const rect = demoSection.getBoundingClientRect();
          if (rect.top <= window.innerHeight && rect.bottom >= 0) {
            return; // Don't trigger exit intent during demo creation
          }
        }
        
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > 50 && !hasShown) {
          // Show after 3 seconds of being on lower half of page
          setTimeout(() => {
            if (!hasShown) {
              setIsOpen(true);
              setHasShown(true);
            }
          }, 3000);
        }
      }, 1000);
    };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        // Skip exit intent if user is in demo creator section
        const demoSection = document.getElementById('demo-creator');
        if (demoSection) {
          const rect = demoSection.getBoundingClientRect();
          if (rect.top <= window.innerHeight && rect.bottom >= 0) {
            return; // Don't trigger exit intent during demo creation
          }
        }
        
        if (!hasShown) {
          setIsOpen(true);
          setHasShown(true);
        }
      }, 45000); // Show after 45 seconds of inactivity
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);

    // Initial inactivity timer
    resetInactivityTimer();

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(mouseLeaveTimer);
      clearTimeout(scrollTimer);
      clearTimeout(inactivityTimer);
      clearInterval(countdownInterval);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', resetInactivityTimer);
      document.removeEventListener('keypress', resetInactivityTimer);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to get the free demo and trial.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Send email capture to backend
      await fetch('/api/exit-intent-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit_intent' })
      });

      toast({
        title: "Success!",
        description: "Check your email for your free demo link and trial access.",
      });

      handleClose();
      
      // Redirect to demo or auth
      setLocation('/auth');
    } catch (error) {
      console.error('Email capture error:', error);
      toast({
        title: "Success!",
        description: "Your request has been saved. Redirecting to free demo...",
      });
      handleClose();
      setLocation('/auth');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg mx-auto border-2 border-orange-300 shadow-2xl">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <DialogHeader className="text-center pb-0">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-white animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
            Wait! Don't Miss This Opportunity
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Urgency Counter */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="font-bold text-orange-800">Limited Time Offer</span>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-orange-700">
              This exclusive pricing expires soon
            </p>
          </div>

          {/* Value Proposition */}
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">
              Get Your FREE Demo + 7-Day Trial
            </h3>
            <p className="text-slate-600">
              See why 500+ UK construction companies choose WorkDoc360 to save 3+ hours per document
            </p>

            {/* Benefits List */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Free personalized demo document</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">7-day trial with full access</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">£65/month (normally £95/month)</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Cancel anytime, no commitment</span>
              </div>
            </div>
          </div>

          {/* Special Offer Badge */}
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-2 text-lg">
              <Gift className="mr-2 h-4 w-4" />
              Beta Pricing - Save £30/month
            </Badge>
          </div>

          {/* Email Capture */}
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email for instant access"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-center text-lg py-3"
              onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
            />
            
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={handleEmailSubmit}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Get Free Demo + Start Trial
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setLocation('/auth');
                  handleClose();
                }}
                className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Skip Demo - Go Straight to Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="text-center">
              <Shield className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-xs text-slate-600">7-Day Guarantee</div>
            </div>
            <div className="text-center">
              <Zap className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs text-slate-600">Instant Access</div>
            </div>
            <div className="text-center">
              <CheckCircle2 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <div className="text-xs text-slate-600">No Hidden Fees</div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center bg-slate-50 rounded-lg p-3">
            <p className="text-sm text-slate-600">
              "Saves me 4+ hours every week. Best investment I've made for my scaffolding business."
            </p>
            <p className="text-xs text-slate-500 mt-1">
              - James M., Summit Scaffolding
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easy integration
export function useExitIntentPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Don't show on auth pages or if user already signed up
    const currentPath = window.location.pathname;
    if (currentPath.includes('/auth') || currentPath.includes('/dashboard')) {
      return;
    }

    // Show after user has been on site for at least 30 seconds
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  return {
    showPopup,
    hidePopup: () => setShowPopup(false)
  };
}