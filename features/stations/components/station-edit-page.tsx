"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import { getSingleStation, updateStation } from "@/actions/superAdmin/station";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
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

interface StationEditPageProps {
  stationId: string;
}

interface StationFormData {
  code: string;
  afanOromoName: string;
  amharicName: string;
  stationAdminName: string;
  stampPhoto: string;
  signPhoto: string;
}

export default function StationEditPage({ stationId }: StationEditPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isSuperAdmin = session?.user?.role === "superAdmin";

  // Create stable parameters for useData
  const stationParams = React.useMemo(() => stationId, [stationId]);

  // Fetch station data
  const [stationData, isLoading] = useData(
    getSingleStation,
    null,
    stationParams
  );

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
  const mutationFn = useCallback(
    async (data: StationFormData) => {
      const result = await updateStation(stationId, data);
      return result;
    },
    [stationId]
  );

  // Stable success callback
  const onSuccess = useCallback(
    (result: any) => {
      if (result.status) {
        toast.success("Station updated successfully!");
        router.push(`/dashboard/station/${stationId}`);
      } else {
        toast.error(result.message || "Failed to update station");
      }
    },
    [router, stationId]
  );

  // Mutation hook for updating station
  const [updateStationMutation, isUpdating] = useMutation(
    mutationFn,
    onSuccess
  );

  // Update form data when station data is loaded
  useEffect(() => {
    if (stationData && stationData.data) {
      const station = stationData.data as any;
      setFormData({
        code: station.code || "",
        afanOromoName: station.afanOromoName || "",
        amharicName: station.amharicName || "",
        stationAdminName: station.stationAdminName || "",
        stampPhoto: station.stampPhoto || "",
        signPhoto: station.signPhoto || "",
      });
    }
  }, [stationData]);

  const handleInputChange = (
    field: keyof StationFormData,
    value: string | boolean
  ) => {
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

    // Use the mutation hook to update the station
    updateStationMutation(formData);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">
            Super admin access required to edit stations.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
          <h3 className="text-lg font-semibold">Loading Station Data...</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch the station information.
          </p>
        </div>
      </div>
    );
  }

  if (!stationData || !stationData.status || !stationData.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Station Not Found</h3>
          <p className="text-muted-foreground">
            The station you're looking for doesn't exist or you don't have
            permission to view it.
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
          <Link href={`/dashboard/station/${stationId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Station
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Station</h1>
            <p className="text-muted-foreground">
              Update station information and settings
            </p>
          </div>
        </div>
      </div>

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
                placeholder="Enter station code"
                required
              />
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
                      alt="Stamp Photo"
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
                      alt="Sign Photo"
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link href={`/dashboard/station/${stationId}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Station
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
