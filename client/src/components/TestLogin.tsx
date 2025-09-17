import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Lock, TestTube, LogOut } from "lucide-react";

export function TestLogin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const testLogin = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/test-login", {
        method: "POST",
      });
    },
    onSuccess: (response) => {
      setIsLoggedIn(true);
      toast({
        title: "Test Login Successful",
        description: `Logged in as ${response.user.firstName} ${response.user.lastName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Refresh the page to update auth state
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Test login failed",
        variant: "destructive",
      });
    },
  });

  const testLogout = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/test-logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      setIsLoggedIn(false);
      toast({
        title: "Logged Out",
        description: "Test session ended successfully",
      });
      queryClient.clear();
      // Refresh the page to update auth state
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast({
        title: "Logout Failed",
        description: error.message || "Test logout failed",
        variant: "destructive",
      });
    },
  });

  if (process.env.NODE_ENV !== "development") {
    return null; // Don't show in production
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          <span>Development Test Login</span>
        </CardTitle>
        <CardDescription>
          Quick login for testing WorkDoc360 features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Test Account Details</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Name:</strong> Paul Tester</p>
            <p><strong>Email:</strong> test@workdoc360.com</p>
            <p><strong>Role:</strong> Admin (Full Access)</p>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {!isLoggedIn ? (
            <Button 
              onClick={() => testLogin.mutate()}
              disabled={testLogin.isPending}
              className="w-full"
            >
              {testLogin.isPending ? (
                "Logging in..."
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Login as Test User
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={() => testLogout.mutate()}
              disabled={testLogout.isPending}
              variant="outline"
              className="w-full"
            >
              {testLogout.isPending ? (
                "Logging out..."
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout Test User
                </>
              )}
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/api/login"}
            className="w-full"
          >
            <Lock className="mr-2 h-4 w-4" />
            Use Real Replit Login
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <Badge variant="secondary" className="text-xs">
            Development Only
          </Badge>
          <p className="mt-1">This test login only works in development mode</p>
        </div>
      </CardContent>
    </Card>
  );
}