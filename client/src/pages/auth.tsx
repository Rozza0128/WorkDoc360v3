import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye, EyeOff, HardHat, Shield, Building2, CheckCircle, Crown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the Terms and Conditions and End User Licence Agreement"
  }),
});

const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const newPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState<string>("");

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      acceptTerms: false,
    },
  });

  // Password reset form
  const passwordResetForm = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // New password form
  const newPasswordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Check if user has a company with a subdomain
      try {
        const companiesRes = await apiRequest("GET", "/api/companies");
        const companies = await companiesRes.json();
        
        if (companies && companies.length > 0) {
          const company = companies[0]; // Use first company for now
          
          // Check if company has a subdomain
          if (company.subdomain) {
            toast({
              title: "Welcome back!",
              description: `Redirecting to your ${company.name} portal...`,
            });
            
            // Redirect to company subdomain
            const subdomainUrl = `https://${company.subdomain}.workdoc360.com`;
            window.location.href = subdomainUrl;
            return;
          }
        }
      } catch (error) {
        console.log("No company subdomain found, using standard redirect");
      }
      
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Invalid email or password";
      
      // Show password reset option for invalid credentials
      if (errorMessage.toLowerCase().includes("password") || errorMessage.toLowerCase().includes("invalid")) {
        toast({
          title: "Login failed",
          description: `${errorMessage}. Would you like to reset your password?`,
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setResetEmail(loginForm.getValues("email"));
                setShowPasswordReset(true);
              }}
            >
              Reset Password
            </Button>
          )
        });
      } else {
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterFormData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(["/api/user"], user);
      
      toast({
        title: "Welcome to WorkDoc360!",
        description: "Account created! Let's set up your company and try generating your first document.",
      });
      
      // Redirect to onboarding instead of plan selection
      setLocation("/onboarding");
    },
    onError: (error: any) => {
      // Handle existing account case specially
      if (error.action === "login") {
        toast({
          title: "Account Already Exists",
          description: error.message || "You already have an account with this email address. Please log in instead.",
          variant: "destructive",
        });
        // Auto-switch to login tab and pre-fill email
        setActiveTab("login");
        loginForm.setValue("email", registerForm.getValues("email"));
        // Focus on password field after a short delay
        setTimeout(() => {
          const passwordField = document.querySelector('input[name="password"]') as HTMLInputElement;
          if (passwordField && activeTab === "login") {
            passwordField.focus();
          }
        }, 100);
      } else {
        toast({
          title: "Registration failed",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      }
    },
  });

  // Password reset mutations
  const passwordResetMutation = useMutation({
    mutationFn: async (data: PasswordResetFormData) => {
      const res = await apiRequest("POST", "/api/password-reset/request", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password Reset Email Sent",
        description: data.message || "Check your email for password reset instructions.",
      });
      setShowPasswordReset(false);
      
      // In development, auto-fill token for testing
      if (data.token && process.env.NODE_ENV === 'development') {
        setResetToken(data.token);
        toast({
          title: "Development Mode",
          description: `Reset token: ${data.token.substring(0, 10)}... (auto-filled for testing)`,
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    },
  });

  const newPasswordMutation = useMutation({
    mutationFn: async (data: NewPasswordFormData & { token: string }) => {
      const res = await apiRequest("POST", "/api/password-reset/complete", {
        token: data.token,
        newPassword: data.password,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password Reset Successful",
        description: data.message || "Your password has been updated. You can now log in.",
      });
      setResetToken(null);
      setShowPasswordReset(false);
      setActiveTab("login");
      loginForm.setValue("email", resetEmail);
    },
    onError: (error: any) => {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  const onPasswordReset = (data: PasswordResetFormData) => {
    passwordResetMutation.mutate(data);
  };

  const onNewPassword = (data: NewPasswordFormData) => {
    if (resetToken) {
      newPasswordMutation.mutate({ ...data, token: resetToken });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-2xl"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center">
              <HardHat className="text-white text-lg" />
            </div>
            <img 
              src="/src/assets/workdoc360-logo.png" 
              alt="WorkDoc360" 
              className="h-8 w-auto object-contain"
            />
          </button>
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="text-slate-600 hover:text-blue-600"
          >
            ← Back to Homepage
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-construction-orange rounded-xl flex items-center justify-center">
                  <HardHat className="h-6 w-6 text-white" />
                </div>
                <img 
                  src="/src/assets/workdoc360-logo.png" 
                  alt="WorkDoc360 - Construction Compliance Management" 
                  className="h-12 w-auto object-contain mb-2"
                />
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-charcoal leading-tight">
                Smart Construction
                <br />
                <span className="text-construction-orange">Compliance Made Simple</span>
              </h2>
              
              <p className="text-xl text-steel-gray leading-relaxed">
                Join thousands of construction professionals who trust WorkDoc360 for AI-powered 
                compliance management, risk assessments, and safety documentation.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-100">
                <CheckCircle className="h-5 w-5 text-safety-green" />
                <span className="text-sm font-medium text-charcoal">AI Document Generation</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-100">
                <CheckCircle className="h-5 w-5 text-safety-green" />
                <span className="text-sm font-medium text-charcoal">CSCS Card Tracking</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-100">
                <CheckCircle className="h-5 w-5 text-safety-green" />
                <span className="text-sm font-medium text-charcoal">Automated Alerts</span>
              </div>
            </div>

            {/* Trade specializations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-charcoal">Specialised for Your Trade</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border">
                  <Building2 className="h-4 w-4 text-construction-orange" />
                  <span className="text-sm text-charcoal">Scaffolders</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border">
                  <Shield className="h-4 w-4 text-construction-orange" />
                  <span className="text-sm text-charcoal">Plasterers</span>
                </div>
                <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border">
                  <HardHat className="h-4 w-4 text-construction-orange" />
                  <span className="text-sm text-charcoal">General Builders</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-lg luxury-card">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Get Started Today
                </CardTitle>
                <p className="text-slate-600">
                  Professional compliance management - 12-month subscription required
                </p>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Create Account</TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email address</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@company.co.uk"
                          {...loginForm.register("email")}
                          className={loginForm.formState.errors.email ? "border-red-500" : ""}
                        />
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...loginForm.register("password")}
                            className={loginForm.formState.errors.password ? "border-red-500" : ""}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-steel-gray" />
                            ) : (
                              <Eye className="h-4 w-4 text-steel-gray" />
                            )}
                          </Button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                      
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="text-construction-orange hover:text-orange-600 p-0 h-auto"
                          onClick={() => {
                            setResetEmail(loginForm.getValues("email"));
                            setShowPasswordReset(true);
                          }}
                        >
                          Forgot your password?
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  {/* Register Form */}
                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            {...registerForm.register("firstName")}
                            className={registerForm.formState.errors.firstName ? "border-red-500" : ""}
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500">{registerForm.formState.errors.firstName.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input
                            id="lastName"
                            placeholder="Smith"
                            {...registerForm.register("lastName")}
                            className={registerForm.formState.errors.lastName ? "border-red-500" : ""}
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500">{registerForm.formState.errors.lastName.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email address</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@company.co.uk"
                          {...registerForm.register("email")}
                          className={registerForm.formState.errors.email ? "border-red-500" : ""}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            {...registerForm.register("password")}
                            className={registerForm.formState.errors.password ? "border-red-500" : ""}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-steel-gray" />
                            ) : (
                              <Eye className="h-4 w-4 text-steel-gray" />
                            )}
                          </Button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                        )}
                        <p className="text-xs text-steel-gray">
                          Password must be at least 8 characters long
                        </p>
                      </div>


                      {/* Terms and Conditions Acceptance */}
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="acceptTerms"
                            checked={registerForm.watch("acceptTerms")}
                            onCheckedChange={(checked) => 
                              registerForm.setValue("acceptTerms", checked === true)
                            }
                            className={registerForm.formState.errors.acceptTerms ? "border-red-500" : ""}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor="acceptTerms"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              I accept the Terms and Conditions and End User Licence Agreement
                            </label>
                            <p className="text-xs text-muted-foreground">
                              By creating an account, you agree to our{" "}
                              <a href="/terms" target="_blank" className="underline text-blue-600 hover:text-blue-800">
                                Terms & Conditions
                              </a>{" "}
                              and{" "}
                              <a href="/privacy" target="_blank" className="underline text-blue-600 hover:text-blue-800">
                                Privacy Policy
                              </a>
                              . These documents include important liability disclaimers.
                            </p>
                          </div>
                        </div>
                        {registerForm.formState.errors.acceptTerms && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.acceptTerms.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-construction-orange hover:bg-orange-600"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 text-center">
                  <p className="text-xs text-steel-gray">
                    Create your free account • Choose your plan next • Subscription plans from £35/month
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Password Reset Dialogs */}
      <Dialog open={showPasswordReset && !resetToken} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={passwordResetForm.handleSubmit(onPasswordReset)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@company.co.uk"
                {...passwordResetForm.register("email")}
                defaultValue={resetEmail}
                className={passwordResetForm.formState.errors.email ? "border-red-500" : ""}
              />
              {passwordResetForm.formState.errors.email && (
                <p className="text-sm text-red-500">{passwordResetForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowPasswordReset(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-construction-orange hover:bg-orange-600"
                disabled={passwordResetMutation.isPending}
              >
                {passwordResetMutation.isPending ? "Sending..." : "Send Reset Email"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetToken} onOpenChange={() => setResetToken(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Password</DialogTitle>
            <DialogDescription>
              Please enter your new password below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={newPasswordForm.handleSubmit(onNewPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  {...newPasswordForm.register("password")}
                  className={newPasswordForm.formState.errors.password ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-steel-gray" />
                  ) : (
                    <Eye className="h-4 w-4 text-steel-gray" />
                  )}
                </Button>
              </div>
              {newPasswordForm.formState.errors.password && (
                <p className="text-sm text-red-500">{newPasswordForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                {...newPasswordForm.register("confirmPassword")}
                className={newPasswordForm.formState.errors.confirmPassword ? "border-red-500" : ""}
              />
              {newPasswordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{newPasswordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setResetToken(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-construction-orange hover:bg-orange-600"
                disabled={newPasswordMutation.isPending}
              >
                {newPasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}