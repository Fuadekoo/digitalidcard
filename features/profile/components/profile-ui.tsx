"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Phone,
  Mail,
  Building2,
  Shield,
  Calendar,
} from "lucide-react";
import useTranslation from "@/hooks/useTranslation";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "@/actions/common/profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/spinner";

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
  const { t } = useTranslation();
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
          toast.error(result.error || t("profile.loadFailed"));
        }
      } catch (error) {
        toast.error(t("profile.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !phone.trim()) {
      toast.error(t("profile.fillAllFields"));
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateUserProfile({
        username: username.trim(),
        phone: phone.trim(),
      });

      if (result.success) {
        toast.success(result.message || t("profile.updateSuccess"));
        // Refresh profile
        const updatedProfile = await getUserProfile();
        if (updatedProfile.success && updatedProfile.user) {
          setProfile(updatedProfile.user as UserProfile);
        }
      } else {
        toast.error(result.error || t("profile.updateFailed"));
      }
    } catch (error) {
      toast.error(t("profile.updateFailed"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t("profile.fillPasswordFields"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("profile.passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("profile.passwordsDontMatch"));
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        toast.success(result.message || t("profile.changePasswordSuccess"));
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error || t("profile.changePasswordFailed"));
      }
    } catch (error) {
      toast.error(t("profile.changePasswordFailed"));
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
      <LoadingSpinner
        message={`${t("common.loading")} ${t(
          "profile.title"
        ).toLowerCase()}...`}
      />
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center overflow-y-auto">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              {t("profile.loadFailed")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("profile.title")}
        </h1>
        <p className="text-gray-600">{t("profile.manageInfo")}</p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("profile.profileOverview")}
          </CardTitle>
          <CardDescription>{t("profile.accountInfo")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("profile.username")}</p>
                <p className="font-semibold text-gray-900">
                  {profile.username}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {t("profile.phoneNumber")}
                </p>
                <p className="font-semibold text-gray-900">{profile.phone}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("profile.role")}</p>
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
                <p className="text-sm text-gray-600">{t("profile.status")}</p>
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
                  <p className="text-sm text-gray-600">
                    {t("profile.station")}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {profile.stationUser.afanOromoName ||
                      profile.stationUser.amharicName}{" "}
                    ({profile.stationUser.code})
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
                <p className="text-sm text-gray-600">
                  {t("profile.memberSince")}
                </p>
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
              {t("profile.editProfile")}
            </CardTitle>
            <CardDescription>{t("profile.updatePersonalInfo")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("profile.username")}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("profile.enterUsername")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("profile.phoneNumber")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("profile.enterPhone")}
                  required
                />
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating
                  ? t("profile.updating")
                  : t("profile.updateProfile")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {t("profile.changePassword")}
            </CardTitle>
            <CardDescription>
              {t("profile.updateAccountPassword")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  {t("profile.currentPassword")}
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t("profile.enterCurrentPassword")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("profile.enterNewPassword")}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("profile.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("profile.confirmNewPassword")}
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
                {isChangingPassword
                  ? t("profile.changing")
                  : t("profile.changePassword")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
