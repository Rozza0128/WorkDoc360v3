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
import { Eye, EyeOff, HardHat, Shield, Building2, CheckCircle } from "lucide-react";

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

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

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

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterFormData) => {
      // Get selected plan and billing cycle from localStorage
      const selectedPlan = localStorage.getItem('selectedPlan') || 'essential';
      const billingCycle = localStorage.getItem('billingCycle') || 'yearly';
      const registrationData = {
        ...userData,
        selectedPlan,
        subscriptionType: billingCycle
      };
      const res = await apiRequest("POST", "/api/register", registrationData);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome to WorkDoc360!",
        description: "Your account has been created successfully.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-steel-gray/5 to-construction-orange/5">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-construction-orange rounded-xl flex items-center justify-center">
                  <HardHat className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-charcoal">WorkDoc360</h1>
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
            <Card className="w-full max-w-md shadow-xl border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-charcoal">
                  Get Started Today
                </CardTitle>
                <p className="text-steel-gray">
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
                        className="w-full bg-construction-orange hover:bg-orange-600"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
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
                    Subscription plans starting £65/month with 12-month commitment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}