"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import { getSingleUser, updateUser } from "@/actions/superAdmin/user";
import { getAllStation } from "@/actions/superAdmin/station";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StationSelector } from "@/components/ui/station-selector";
import { ArrowLeft, Save, User, Activity, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { InlineSpinner, ButtonSpinner } from "@/components/ui/spinner";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface UserEditPageProps {
  userId: string;
}

interface UserFormData {
  username: string;
  phone: string;
  role: string;
  stationId: string;
  password?: string;
}

export default function UserEditPage({ userId }: UserEditPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const isSuperAdmin = session?.user?.role === "superAdmin";

  // Create stable parameters for useData
  const userParams = React.useMemo(() => userId, [userId]);

  // Fetch user data
  const [userData, isLoading] = useData(getSingleUser, null, userParams);

  // Fetch stations data
  const [stationsData, isStationsLoading] = useData(getAllStation, null);

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    phone: "",
    role: "",
    stationId: "",
    password: "",
  });

  // Stable mutation function
  const mutationFn = useCallback(
    async (data: UserFormData) => {
      // If password is empty, remove it from the data to keep existing password
      const { password, ...userData } = data;
      const updateData =
        password && password.trim() ? { ...userData, password } : userData;

      const result = await updateUser(userId, updateData);
      return result;
    },
    [userId]
  );

  // Stable success callback
  const onSuccess = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result: any) => {
      if (result.status) {
        toast.success("User updated successfully!");
        router.push(`/${lang}/dashboard/user/${userId}`);
      } else {
        toast.error(result.message || "Failed to update user");
      }
    },
    [router, userId, lang]
  );

  // Mutation hook for updating user
  const [updateUserMutation, isUpdating] = useMutation(mutationFn, onSuccess);

  // Update form data when user data is loaded
  useEffect(() => {
    if (userData && userData.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = userData.data as any;
      console.log("User data loaded:", user); // Debug log

      // Map old role values to new ones if needed
      let mappedRole = user.role || "";
      if (user.role === "admin" || user.role === "superAdmin") {
        mappedRole = "stationAdmin";
      } else if (user.role === "user") {
        mappedRole = "stationRegistral"; // Default to registral for old users
      } else if (
        !["stationAdmin", "stationRegistral", "stationPrintral"].includes(
          user.role
        )
      ) {
        // If role is not one of our valid roles, default to registral
        mappedRole = "stationRegistral";
      }

      setFormData({
        username: user.username || "",
        phone: user.phone || "",
        role: mappedRole,
        stationId: user.stationId || "",
        password: "", // Don't populate password for security
      });
    }
  }, [userData]);

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      toast.error("Access denied. Super admin role required.");
      return;
    }

    // Validate required fields
    if (!formData.username || !formData.phone || !formData.role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validate password if provided
    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // Use the mutation hook to update the user
    updateUserMutation(formData);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">
            You don&apos;t have permission to edit users. Super admin role
            required.
          </p>
          <Link href={`/${lang}/dashboard/user`} className="mt-4 inline-block">
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
    return <InlineSpinner message="Loading User Data..." />;
  }

  if (!userData || !userData.status || !userData.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold">User Not Found</h3>
          <p className="text-muted-foreground">
            The user you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
          <Link href={`/${lang}/dashboard/user`} className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${lang}/dashboard/user`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">
              Update user information and permissions.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
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
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  type="tel"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter new password (leave empty to keep current)"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep the current password. Must be at least 6
                  characters if provided.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                {/* Debug info - remove this later */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-muted-foreground">
                    Current role value: &quot;{formData.role}&quot;
                  </div>
                )}
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stationAdmin">Station Admin</SelectItem>
                    <SelectItem value="stationRegistral">
                      Station Registral
                    </SelectItem>
                    <SelectItem value="stationPrintral">
                      Station Printral
                    </SelectItem>
                    {formData.role &&
                      ![
                        "stationAdmin",
                        "stationRegistral",
                        "stationPrintral",
                      ].includes(formData.role) && (
                        <SelectItem value={formData.role}>
                          Current: {formData.role} (Please select a new role)
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stationId">Station</Label>
                <StationSelector
                  stations={stationsData?.data || []}
                  value={formData.stationId}
                  onValueChange={(value) =>
                    handleInputChange("stationId", value)
                  }
                  placeholder="Select station (optional)"
                  disabled={isStationsLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if user is not assigned to a specific station.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link href={`/${lang}/dashboard/user/${userId}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <ButtonSpinner size={16} />
                <span className="ml-2">Updating...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
