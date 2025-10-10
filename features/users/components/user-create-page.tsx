"use client";

import React, { useState, useCallback } from "react";
import useMutation from "@/hooks/useMutation";
import { useData } from "@/hooks/useData";
import { createUser } from "@/actions/superAdmin/user";
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
import {
  StationSelector,
  type Station,
} from "@/components/ui/station-selector";
import {
  ArrowLeft,
  Save,
  User,
  Shield,
  Phone,
  Key,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface UserCreatePageProps {}

interface UserFormData {
  username: string;
  phone: string;
  role: string;
  password: string;
  confirmPassword: string;
  stationId: string;
}

export default function UserCreatePage({}: UserCreatePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isSuperAdmin = session?.user?.role === "superAdmin";

  // Fetch stations data
  const [stationsData, isStationsLoading] = useData(getAllStation, null);

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
    stationId: "",
  });

  // Stable mutation function
  const mutationFn = useCallback(async (data: UserFormData) => {
    const { confirmPassword, ...userData } = data;
    const result = await createUser(userData);
    return result;
  }, []);

  // Stable success callback
  const onSuccess = useCallback(
    (result: any) => {
      if (result.status) {
        toast.success("User created successfully!");
        router.push(`/dashboard/user/${result.data?.id || ""}`);
      } else {
        toast.error(result.message || "Failed to create user");
      }
    },
    [router]
  );

  // Mutation hook for creating user
  const [createUserMutation, isCreating] = useMutation(mutationFn, onSuccess);

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
    if (
      !formData.username ||
      !formData.phone ||
      !formData.role ||
      !formData.password
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // Use the mutation hook to create the user
    createUserMutation(formData);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to create users. Super admin role
            required.
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
            <h1 className="text-2xl font-bold">Create New User</h1>
            <p className="text-muted-foreground">
              Add a new user to the system with appropriate permissions.
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
                <Label htmlFor="role">Role *</Label>
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

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter password"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/user">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
