"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Phone, Mail, Building2, Shield, Calendar } from "lucide-react";
import { getUserProfile, updateUserProfile, changePassword } from "@/actions/common/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";

type UserProfile = {
  id: string;
  username: string;
  phone: string;
  role: string;
  status: string;
  createdAt: Date;
  stationUser: {
    code: string;
    afanOromoName: string;
    amharicName: string;
  } | null;
};

export default function ProfileUI() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form state
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getUserProfile();
        if (result.success && result.user) {
          setProfile(result.user as UserProfile);
          setUsername(result.user.username);
          setPhone(result.user.phone);
        } else {
          toast.error(result.error || "Failed to load profile");
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateUserProfile({
        username: username.trim(),
        phone: phone.trim(),
      });

      if (result.success) {
        toast.success(result.message || "Profile updated successfully");
        // Refresh profile
        const updatedProfile = await getUserProfile();
        if (updatedProfile.success && updatedProfile.user) {
          setProfile(updatedProfile.user as UserProfile);
        }
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        toast.success(result.message || "Password changed successfully");
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      superAdmin: "bg-purple-100 text-purple-800",
      stationAdmin: "bg-blue-100 text-blue-800",
      stationRegistrar: "bg-green-100 text-green-800",
      stationPrinter: "bg-orange-100 text-orange-800",
      developer: "bg-red-100 text-red-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "ACTIVE"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen overflow-y-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center overflow-y-auto">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Failed to load profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and security</p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Overview
          </CardTitle>
          <CardDescription>Your account information and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-semibold text-gray-900">{profile.username}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-semibold text-gray-900">{profile.phone}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <Badge className={getRoleBadgeColor(profile.role)}>
                  {profile.role}
                </Badge>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusBadgeColor(profile.status)}>
                  {profile.status}
                </Badge>
              </div>
            </div>

            {/* Station (if applicable) */}
            {profile.stationUser && (
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Station</p>
                  <p className="font-semibold text-gray-900">
                    {profile.stationUser.afanOromoName || profile.stationUser.amharicName} (
                    {profile.stationUser.code})
                  </p>
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="flex items-center gap-3 md:col-span-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(profile.createdAt), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Edit Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={isChangingPassword}
                className="w-full"
                variant="secondary"
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
