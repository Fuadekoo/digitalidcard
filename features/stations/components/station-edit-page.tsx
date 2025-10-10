"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import { getSingleStation, updateStation } from "@/actions/superAdmin/station";
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
  Upload,
  X,
  ImageIcon,
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

interface UploadProgress {
  file: File;
  progress: number;
  uuid: string;
  serverFilename?: string;
}

const CHUNK_SIZE = 512 * 1024; // 512KB

function getTimestampUUID(ext: string) {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
}

const formatImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.png";
  return `/api/filedata/${encodeURIComponent(url)}`;
};

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

  // Upload progress states
  const [stampUploadProgress, setStampUploadProgress] = useState<UploadProgress | null>(null);
  const [signUploadProgress, setSignUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploadingStamp, setIsUploadingStamp] = useState(false);
  const [isUploadingSign, setIsUploadingSign] = useState(false);

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

  // Upload file function
  const uploadFile = async (
    file: File,
    uuid: string,
    setProgress: React.Dispatch<React.SetStateAction<UploadProgress | null>>
  ): Promise<string> => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const uuidName = uuid || getTimestampUUID(ext);

    const chunkSize = CHUNK_SIZE;
    const total = Math.ceil(file.size / chunkSize);
    let finalReturnedName: string | null = null;

    for (let i = 0; i < total; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("filename", uuidName);
      formData.append("chunkIndex", i.toString());
      formData.append("totalChunks", total.toString());

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const json = await res.json();
      if (json?.filename) finalReturnedName = json.filename;

      setProgress((prev) =>
        prev ? { ...prev, progress: Math.round(((i + 1) / total) * 100) } : null
      );
    }

    if (!finalReturnedName) {
      throw new Error("Upload failed: no filename returned");
    }

    return finalReturnedName;
  };

  // Handle stamp photo upload
  const handleStampImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploadingStamp(true);

    const newUpload = {
      file,
      progress: 0,
      uuid: getTimestampUUID(file.name.split(".").pop() || "jpg"),
    };

    setStampUploadProgress(newUpload);

    try {
      const serverFilename = await uploadFile(file, newUpload.uuid, setStampUploadProgress);

      handleInputChange("stampPhoto", serverFilename);

      setStampUploadProgress((prev) =>
        prev ? { ...prev, serverFilename, progress: 100 } : null
      );
      toast.success("Stamp photo uploaded successfully");
    } catch (error) {
      console.error("Failed to upload stamp photo:", error);
      setStampUploadProgress(null);
      toast.error("Failed to upload stamp photo");
    } finally {
      setIsUploadingStamp(false);
    }
  };

  // Handle sign photo upload
  const handleSignImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploadingSign(true);

    const newUpload = {
      file,
      progress: 0,
      uuid: getTimestampUUID(file.name.split(".").pop() || "jpg"),
    };

    setSignUploadProgress(newUpload);

    try {
      const serverFilename = await uploadFile(file, newUpload.uuid, setSignUploadProgress);

      handleInputChange("signPhoto", serverFilename);

      setSignUploadProgress((prev) =>
        prev ? { ...prev, serverFilename, progress: 100 } : null
      );
      toast.success("Sign photo uploaded successfully");
    } catch (error) {
      console.error("Failed to upload sign photo:", error);
      setSignUploadProgress(null);
      toast.error("Failed to upload sign photo");
    } finally {
      setIsUploadingSign(false);
    }
  };

  // Remove stamp image
  const removeStampImage = () => {
    handleInputChange("stampPhoto", "");
    setStampUploadProgress(null);
  };

  // Remove sign image
  const removeSignImage = () => {
    handleInputChange("signPhoto", "");
    setSignUploadProgress(null);
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
    <div className="w-full h-full space-y-6 overflow-y-auto">
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
              <ImageIcon className="h-5 w-5" />
              Station Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stamp Photo Upload */}
              <div className="space-y-3">
                <Label htmlFor="stampPhoto" className="text-base font-semibold">
                  Stamp Photo
                </Label>
                
                {/* Show previous image if exists */}
                {formData.stampPhoto && !stampUploadProgress && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Current Stamp:
                    </p>
                    <div className="relative inline-block">
                      <Image
                        src={formatImageUrl(formData.stampPhoto)}
                        alt="Current Stamp Photo"
                        width={128}
                        height={128}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeStampImage}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <label
                        htmlFor="stampPhoto"
                        className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {formData.stampPhoto ? "Change stamp photo" : "Click to upload stamp photo"}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                    <input
                      id="stampPhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleStampImageChange}
                      className="hidden"
                      disabled={isUploadingStamp}
                    />
                  </div>

                  {/* Upload Progress */}
                  {stampUploadProgress && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="truncate max-w-[150px]">
                              {stampUploadProgress.file.name}
                            </span>
                            <span className="font-semibold">
                              {stampUploadProgress.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${stampUploadProgress.progress}%` }}
                            />
                          </div>
                        </div>
                        {stampUploadProgress.progress < 100 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStampUploadProgress(null)}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sign Photo Upload */}
              <div className="space-y-3">
                <Label htmlFor="signPhoto" className="text-base font-semibold">
                  Signature Photo
                </Label>
                
                {/* Show previous image if exists */}
                {formData.signPhoto && !signUploadProgress && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Current Signature:
                    </p>
                    <div className="relative inline-block">
                      <Image
                        src={formatImageUrl(formData.signPhoto)}
                        alt="Current Signature Photo"
                        width={128}
                        height={128}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeSignImage}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Upload className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-center">
                      <label
                        htmlFor="signPhoto"
                        className="cursor-pointer text-sm font-medium text-green-600 hover:text-green-700"
                      >
                        {formData.signPhoto ? "Change signature photo" : "Click to upload signature photo"}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                    <input
                      id="signPhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleSignImageChange}
                      className="hidden"
                      disabled={isUploadingSign}
                    />
                  </div>

                  {/* Upload Progress */}
                  {signUploadProgress && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="truncate max-w-[150px]">
                              {signUploadProgress.file.name}
                            </span>
                            <span className="font-semibold">
                              {signUploadProgress.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${signUploadProgress.progress}%` }}
                            />
                          </div>
                        </div>
                        {signUploadProgress.progress < 100 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSignUploadProgress(null)}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Upload new photos to replace existing ones, or keep current photos by not uploading.
            </p>
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
