"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
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
  Upload,
  X,
  ImageIcon,
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

  // Upload progress states
  const [stampUploadProgress, setStampUploadProgress] = useState<UploadProgress | null>(null);
  const [signUploadProgress, setSignUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploadingStamp, setIsUploadingStamp] = useState(false);
  const [isUploadingSign, setIsUploadingSign] = useState(false);

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

      // Update progress
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
                        Click to upload stamp photo
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
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Current Photo Preview */}
                  {formData.stampPhoto && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Current Stamp:
                      </p>
                      <div className="relative inline-block">
                        <Image
                          src={formatImageUrl(formData.stampPhoto)}
                          alt="Stamp Photo"
                          width={128}
                          height={128}
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeStampImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
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
                        Click to upload signature photo
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
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Current Photo Preview */}
                  {formData.signPhoto && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Current Signature:
                      </p>
                      <div className="relative inline-block">
                        <Image
                          src={formatImageUrl(formData.signPhoto)}
                          alt="Signature Photo"
                          width={128}
                          height={128}
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeSignImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Photos are optional. You can add them later if needed.
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
