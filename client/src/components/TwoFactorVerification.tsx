import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key,
  ArrowLeft
} from "lucide-react";

interface TwoFactorVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function TwoFactorVerification({ email, onSuccess, onBack }: TwoFactorVerificationProps) {
  const [totpCode, setTotpCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [activeTab, setActiveTab] = useState("totp");
  const { toast } = useToast();

  // Send email verification code
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/2fa/send-login-code", { email });
      return await res.json();
    },
    onSuccess: () => {
      setActiveTab("email");
      toast({
        title: "Email Sent",
        description: "Verification code sent to your email address.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "Could not send verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify 2FA code
  const verifyMutation = useMutation({
    mutationFn: async (data: { type: "totp" | "email" | "backup"; code: string }) => {
      const res = await apiRequest("POST", "/api/auth/2fa/verify-login", {
        email,
        type: data.type,
        code: data.code,
      });
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login Successful",
        description: "Welcome back to WorkDoc360!",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = (type: "totp" | "email" | "backup") => {
    let code = "";
    switch (type) {
      case "totp":
        code = totpCode;
        break;
      case "email":
        code = emailCode;
        break;
      case "backup":
        code = backupCode;
        break;
    }

    if (code.length >= 4) {
      verifyMutation.mutate({ type, code });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Two-Factor Authentication</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please verify your identity to complete the login process.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="totp" className="text-xs">
              <Smartphone className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs">
              <Mail className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="backup" className="text-xs">
              <Key className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-4">
            <div className="text-center space-y-4">
              <div>
                <Smartphone className="mx-auto h-12 w-12 text-blue-600 mb-3" />
                <h3 className="font-semibold">Authenticator App</h3>
                <p className="text-sm text-slate-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totp-code">Authentication Code</Label>
                <Input
                  id="totp-code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center font-mono text-lg"
                />
              </div>

              <Button 
                onClick={() => handleVerify("totp")}
                disabled={totpCode.length !== 6 || verifyMutation.isPending}
                className="w-full"
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify Code"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="text-center space-y-4">
              <div>
                <Mail className="mx-auto h-12 w-12 text-blue-600 mb-3" />
                <h3 className="font-semibold">Email Verification</h3>
                <p className="text-sm text-slate-600">
                  We'll send a code to {email}
                </p>
              </div>

              <Button 
                onClick={() => sendEmailMutation.mutate()}
                disabled={sendEmailMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {sendEmailMutation.isPending ? "Sending..." : "Send Email Code"}
              </Button>

              <div className="space-y-2">
                <Label htmlFor="email-code">Email Code</Label>
                <Input
                  id="email-code"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center font-mono text-lg"
                />
              </div>

              <Button 
                onClick={() => handleVerify("email")}
                disabled={emailCode.length !== 6 || verifyMutation.isPending}
                className="w-full"
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify Email Code"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="text-center space-y-4">
              <div>
                <Key className="mx-auto h-12 w-12 text-amber-600 mb-3" />
                <h3 className="font-semibold">Backup Code</h3>
                <p className="text-sm text-slate-600">
                  Enter one of your backup codes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-code">Backup Code</Label>
                <Input
                  id="backup-code"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  className="text-center font-mono text-lg"
                />
              </div>

              <Button 
                onClick={() => handleVerify("backup")}
                disabled={backupCode.length < 4 || verifyMutation.isPending}
                className="w-full"
              >
                {verifyMutation.isPending ? "Verifying..." : "Use Backup Code"}
              </Button>

              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Each backup code can only be used once. After using this code, it will be permanently disabled.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button variant="ghost" onClick={onBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}