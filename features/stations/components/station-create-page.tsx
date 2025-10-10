"use client";

import React, { useState, useCallback } from "react";
import useMutation from "@/hooks/useMutation";
import { createStation } from "@/actions/superAdmin/station";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Building2,
  FileText,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface StationCreatePageProps {}

interface StationFormData {
  code: string;
  afanOromoName: string;
  amharicName: string;
  stationAdminName: string;
  stampPhoto: string;
  signPhoto: string;
}

export default function StationCreatePage({}: StationCreatePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isSuperAdmin = session?.user?.role === "superAdmin";

  // Form state
  const [formData, setFormData] = useState<StationFormData>({
    code: "",
    afanOromoName: "",
    amharicName: "",
    stationAdminName: "",
    stampPhoto: "",
    signPhoto: "",
  });

  // Stable mutation function
  const mutationFn = useCallback(async (data: StationFormData) => {
    const result = await createStation(data);
    return result;
  }, []);

  // Stable success callback
  const onSuccess = useCallback(
    (result: any) => {
      if (result.status) {
        toast.success("Station created successfully!");
        router.push(`/dashboard/station/${result.data?.id || ""}`);
      } else {
        toast.error(result.message || "Failed to create station");
      }
    },
    [router]
  );

  // Mutation hook for creating station
  const [createStationMutation, isCreating] = useMutation(
    mutationFn,
    onSuccess
  );

  const handleInputChange = (field: keyof StationFormData, value: string) => {
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
      !formData.code ||
      !formData.afanOromoName ||
      !formData.amharicName ||
      !formData.stationAdminName
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Use the mutation hook to create the station
    createStationMutation(formData);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to create stations. Super admin role
            required.
          </p>
          <Link href="/dashboard/station" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stations
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
          <Link href="/dashboard/station">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stations
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create New Station</h1>
            <p className="text-muted-foreground">
              Add a new station to the system with all required information.
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
              <Building2 className="h-5 w-5" />
              Station Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Station Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="Enter unique station code"
                required
              />
              <p className="text-xs text-muted-foreground">
                This code must be unique across all stations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="afanOromoName">Afan Oromo Name *</Label>
                <Input
                  id="afanOromoName"
                  value={formData.afanOromoName}
                  onChange={(e) =>
                    handleInputChange("afanOromoName", e.target.value)
                  }
                  placeholder="Enter Afan Oromo name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amharicName">Amharic Name *</Label>
                <Input
                  id="amharicName"
                  value={formData.amharicName}
                  onChange={(e) =>
                    handleInputChange("amharicName", e.target.value)
                  }
                  placeholder="Enter Amharic name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stationAdminName">Station Admin Name *</Label>
              <Input
                id="stationAdminName"
                value={formData.stationAdminName}
                onChange={(e) =>
                  handleInputChange("stationAdminName", e.target.value)
                }
                placeholder="Enter station admin name"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Photo Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Station Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stampPhoto">Stamp Photo URL</Label>
                <Input
                  id="stampPhoto"
                  value={formData.stampPhoto}
                  onChange={(e) =>
                    handleInputChange("stampPhoto", e.target.value)
                  }
                  placeholder="Enter stamp photo URL"
                  type="url"
                />
                {formData.stampPhoto && (
                  <div className="mt-2">
                    <img
                      src={formData.stampPhoto}
                      alt="Stamp Photo Preview"
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signPhoto">Sign Photo URL</Label>
                <Input
                  id="signPhoto"
                  value={formData.signPhoto}
                  onChange={(e) =>
                    handleInputChange("signPhoto", e.target.value)
                  }
                  placeholder="Enter sign photo URL"
                  type="url"
                />
                {formData.signPhoto && (
                  <div className="mt-2">
                    <img
                      src={formData.signPhoto}
                      alt="Sign Photo Preview"
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Photo URLs are optional. You can add them later if needed.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/station">
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
                Create Station
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
