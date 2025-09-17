import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Copy, 
  Check, 
  AlertTriangle,
  Download,
  Key,
  QrCode
} from "lucide-react";

interface TwoFactorSetupProps {
  user: any;
  onClose: () => void;
}

interface SetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export function TwoFactorSetup({ user, onClose }: TwoFactorSetupProps) {
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize 2FA setup
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/2fa/setup");
      return await res.json();
    },
    onSuccess: (data: SetupData) => {
      setSetupData(data);
    },
    onError: () => {
      toast({
        title: "Setup Failed",
        description: "Could not initialize two-factor authentication setup.",
        variant: "destructive",
      });
    },
  });

  // Send email verification code
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/2fa/send-email");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Verification code sent to your email address.",
      });
    },
  });

  // Verify and enable 2FA
  const enableMutation = useMutation({
    mutationFn: async (data: { totpCode?: string; emailCode?: string }) => {
      const res = await apiRequest("POST", "/api/auth/2fa/enable", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowBackupCodes(true);
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disable 2FA
  const disableMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/2fa/disable");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onClose();
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    },
  });

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      setCopiedCodes(true);
      toast({
        title: "Backup Codes Copied",
        description: "Save these codes in a secure location.",
      });
    }
  };

  const downloadBackupCodes = () => {
    if (setupData?.backupCodes) {
      const blob = new Blob([setupData.backupCodes.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'workdoc360-backup-codes.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (user?.twoFactorEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Two-Factor Authentication</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your account is protected with two-factor authentication. You'll need to provide a verification code when signing in.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => onClose()}
            >
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => disableMutation.mutate()}
              disabled={disableMutation.isPending}
            >
              Disable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showBackupCodes && setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <span>Backup Codes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Save these backup codes in a secure location. Each code can only be used once to access your account if you lose your authenticator device.
            </AlertDescription>
          </Alert>

          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {setupData.backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-white rounded border">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={copyBackupCodes} variant="outline">
              {copiedCodes ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiedCodes ? "Copied!" : "Copy Codes"}
            </Button>
            <Button onClick={downloadBackupCodes} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose}>
              I've Saved My Codes
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>Enable Two-Factor Authentication</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!setupData ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Enhance Your Security</h3>
              <p className="text-slate-600">
                Two-factor authentication adds an extra layer of security to your WorkDoc360 account.
              </p>
            </div>
            <Button 
              onClick={() => initializeMutation.mutate()}
              disabled={initializeMutation.isPending}
              className="w-full"
            >
              {initializeMutation.isPending ? "Setting up..." : "Begin Setup"}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="app" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="app" className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <span>Authenticator App</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email Verification</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="app" className="space-y-4">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Scan QR Code</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code:
                  </p>
                </div>

                <div className="flex justify-center">
                  <img 
                    src={setupData.qrCodeUrl} 
                    alt="2FA QR Code" 
                    className="border rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-code">Enter 6-digit code from your app</Label>
                  <Input
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="text-center font-mono text-lg"
                  />
                </div>

                <Button 
                  onClick={() => enableMutation.mutate({ totpCode: verificationCode })}
                  disabled={verificationCode.length !== 6 || enableMutation.isPending}
                  className="w-full"
                >
                  Verify & Enable 2FA
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  We'll send a verification code to <strong>{user.email}</strong>
                </AlertDescription>
              </Alert>

              <Button 
                onClick={() => sendEmailMutation.mutate()}
                disabled={sendEmailMutation.isPending}
                className="w-full"
                variant="outline"
              >
                {sendEmailMutation.isPending ? "Sending..." : "Send Email Code"}
              </Button>

              <div className="space-y-2">
                <Label htmlFor="email-code">Enter 6-digit code from email</Label>
                <Input
                  id="email-code"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center font-mono text-lg"
                />
              </div>

              <Button 
                onClick={() => enableMutation.mutate({ emailCode })}
                disabled={emailCode.length !== 6 || enableMutation.isPending}
                className="w-full"
              >
                Verify & Enable 2FA
              </Button>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-6 pt-4 border-t">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}