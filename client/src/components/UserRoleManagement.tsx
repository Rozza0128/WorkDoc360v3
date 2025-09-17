import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  UserCheck,
  Mail,
  Trash2,
  Settings
} from "lucide-react";

interface UserRoleManagementProps {
  companyId: number;
  currentUserRole: string;
}

export function UserRoleManagement({ companyId, currentUserRole }: UserRoleManagementProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companyUsers, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "users"],
    enabled: !!companyId,
    retry: false,
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return await apiRequest("POST", `/api/companies/${companyId}/users/invite`, data);
    },
    onSuccess: () => {
      toast({
        title: "User Invited",
        description: "The user has been invited successfully and will receive an email with access details.",
      });
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole("user");
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorised",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to invite user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/companies/${companyId}/users/${data.userId}/role`, { role: data.role });
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorised",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/companies/${companyId}/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "User Removed",
        description: "User has been removed from the company.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorised",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-4 w-4 text-alert-red" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-warning-amber" />;
      default:
        return <UserCheck className="h-4 w-4 text-compliant-green" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const canManageUsers = currentUserRole === 'admin';
  const canInviteUsers = currentUserRole === 'admin' || currentUserRole === 'manager';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Loading Users...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Company Users ({companyUsers?.length || 0})</span>
          </div>
          {canInviteUsers && (
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">User Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User - Can view and upload documents</SelectItem>
                        <SelectItem value="manager">Manager - Can manage documents and invite users</SelectItem>
                        {currentUserRole === 'admin' && (
                          <SelectItem value="admin">Admin - Full access to all settings</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => inviteUserMutation.mutate({ email: inviteEmail, role: inviteRole })}
                      disabled={!inviteEmail || inviteUserMutation.isPending}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companyUsers?.map((companyUser: any) => (
            <div key={companyUser.userId} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(companyUser.role)}
                  <div>
                    <p className="font-medium text-charcoal">
                      {companyUser.user.firstName && companyUser.user.lastName
                        ? `${companyUser.user.firstName} ${companyUser.user.lastName}`
                        : companyUser.user.email}
                    </p>
                    <p className="text-sm text-steel-gray">{companyUser.user.email}</p>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(companyUser.role)}>
                  {companyUser.role.charAt(0).toUpperCase() + companyUser.role.slice(1)}
                </Badge>
              </div>
              
              {canManageUsers && companyUser.role !== 'admin' && (
                <div className="flex items-center space-x-2">
                  <Select
                    value={companyUser.role}
                    onValueChange={(newRole) => 
                      updateUserRoleMutation.mutate({ 
                        userId: companyUser.userId, 
                        role: newRole 
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeUserMutation.mutate(companyUser.userId)}
                    disabled={removeUserMutation.isPending}
                    className="text-alert-red hover:text-alert-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {(!companyUsers || companyUsers.length === 0) && (
            <div className="text-center py-8 text-steel-gray">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No users found. Start by inviting team members to collaborate.</p>
            </div>
          )}
        </div>
        
        {/* Role Permissions Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-charcoal mb-3 flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Role Permissions
          </h4>
          <div className="space-y-2 text-sm text-steel-gray">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-3 w-3 text-compliant-green" />
              <span><strong>User:</strong> View documents, upload files, record toolbox talks</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-3 w-3 text-warning-amber" />
              <span><strong>Manager:</strong> All User permissions + invite users, manage documents</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-3 w-3 text-alert-red" />
              <span><strong>Admin:</strong> Full access + change all settings, manage billing, remove users</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}