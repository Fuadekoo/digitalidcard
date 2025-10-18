"use client";

import React, { useState, useCallback } from "react";
import { useData } from "@/hooks/useData";
import { getSingleStation } from "@/actions/superAdmin/station";
import { createUser } from "@/actions/superAdmin/user";
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
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import useMutation from "@/hooks/useMutation";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

interface StationUserCreatePageProps {
  stationId: string;
}

interface UserFormData {
  username: string;
  password: string;
  phone: string;
  role: string;
  stationId: string;
}

export default function StationUserCreatePage({
  stationId,
}: StationUserCreatePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    password: "",
    phone: "",
    role: "stationRegistral",
    stationId: stationId,
  });

  // Check if user is super admin
  const isSuperAdmin = session?.user?.role === "superAdmin";

  // Fetch station data
  const [stationData, isStationLoading] = useData(
    getSingleStation,
    () => {},
    stationId
  );

  // Create user mutation
  const [createUserMutation, isCreating] = useMutation(
    async (data: UserFormData) => {
      const result = await createUser(data);
      return result;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result: any) => {
      if (result.status) {
        toast.success("User created successfully!");
        router.push(`/${lang}/dashboard/station/${stationId}/stationUser`);
      } else {
        toast.error(result.message || "Failed to create user");
      }
    }
  );

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!formData.role) {
      toast.error("Role is required");
      return;
    }

    createUserMutation(formData);
  };

  // Show loading state
  if (isStationLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          Loading station information...
        </div>
      </div>
    );
  }

  // Show access denied message for non-super admin users
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">
            Access Denied
          </div>
          <p className="text-muted-foreground">
            You need super admin privileges to create users.
          </p>
        </div>
      </div>
    );
  }

  // Show station not found message
  if (!stationData?.data) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="text-destructive text-lg font-semibold">
              Station Not Found
            </div>
            <p className="text-muted-foreground">
              The station you&apos;re trying to add a user to doesn&apos;t exist.
            </p>
          <Link href={`/${lang}/dashboard/station`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const station = stationData.data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Station Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adding User to Station
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Station:</span> {station.code} -{" "}
              {station.amharicName}
            </div>
            <div>
              <span className="font-medium">Admin:</span>{" "}
              {station.stationAdminName}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
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
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter password (min 6 characters)"
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

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

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isCreating} className="flex-1">
                {isCreating ? "Creating..." : "Create User"}
              </Button>
              <Link href={`/${lang}/dashboard/station/${stationId}/stationUser`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
