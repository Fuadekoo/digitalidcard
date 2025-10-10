"use client";

import React, { useCallback } from "react";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import {
  getSingleUser,
  blockUser,
  unblockUser,
  resetUserPassword,
} from "@/actions/superAdmin/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  UserCheck,
  UserX,
  Key,
  User,
  Phone,
  Shield,
  Calendar,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface UserViewPageProps {
  userId: string;
}

export default function UserViewPage({ userId }: UserViewPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isSuperAdmin = session?.user?.role === "superAdmin";

  // Create stable parameters for useData
  const userParams = React.useMemo(() => userId, [userId]);

  // Fetch user data
  const [userData, isLoading] = useData(getSingleUser, null, userParams);

  // Block user mutation
  const [blockUserMutation] = useMutation(
    async (userId: string) => {
      const result = await blockUser(userId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("User blocked successfully!");
        // Refresh data
        window.location.reload();
      } else {
        toast.error(result.message || "Failed to block user");
      }
    }
  );

  // Unblock user mutation
  const [unblockUserMutation] = useMutation(
    async (userId: string) => {
      const result = await unblockUser(userId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("User unblocked successfully!");
        // Refresh data
        window.location.reload();
      } else {
        toast.error(result.message || "Failed to unblock user");
      }
    }
  );

  // Reset password mutation
  const [resetPasswordMutation] = useMutation(
    async (userId: string) => {
      const result = await resetUserPassword(userId);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Password reset successfully! New password: 123456");
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    }
  );

  const handleBlockUser = () => {
    blockUserMutation(userId);
  };

  const handleUnblockUser = () => {
    unblockUserMutation(userId);
  };

  const handleResetPassword = () => {
    resetPasswordMutation(userId);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to view users. Super admin role required.
          </p>
          <Link href="/dashboard/user" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
          <h3 className="text-lg font-semibold">Loading User Data...</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch the user information.
          </p>
        </div>
      </div>
    );
  }

  if (!userData || !userData.status || !userData.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold">User Not Found</h3>
          <p className="text-muted-foreground">
            The user you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link href="/dashboard/user" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = userData.data as any;
  const isActive = user.status === "ACTIVE" && user.isActive;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/user">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">User Details</h1>
            <p className="text-muted-foreground">
              View and manage user information and permissions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/user/${userId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
          </Link>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Username
                  </Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {user.username || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Role
                  </Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={
                        user.role === "stationAdmin"
                          ? "destructive"
                          : user.role === "stationRegistral"
                          ? "default"
                          : user.role === "stationPrintral"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {user.role === "stationAdmin" && "Station Admin"}
                      {user.role === "stationRegistral" && "Station Registral"}
                      {user.role === "stationPrintral" && "Station Printral"}
                      {![
                        "stationAdmin",
                        "stationRegistral",
                        "stationPrintral",
                      ].includes(user.role) &&
                        (user.role || "N/A")}
                    </Badge>
                    {user.isAdmin && (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={isActive ? "default" : "destructive"}>
                      {isActive ? "Active" : "Blocked"}
                    </Badge>
                  </div>
                </div>
              </div>
              {user.stationId && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Station ID
                  </Label>
                  <div className="font-medium">{user.stationId}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    User ID
                  </Label>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {user.id}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              {user.updatedAt && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isActive ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleBlockUser}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Block User
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleUnblockUser}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Unblock User
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResetPassword}
              >
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
