"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import { getSingleCitizen, takeCitizenPhoto } from "@/actions/stationRegistral/citizen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Activity,
  AlertCircle,
  Camera,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

interface CitizenDetailPageProps {
  citizenId: string;
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

export default function CitizenDetailPage({ citizenId }: CitizenDetailPageProps) {
  const [photoUploadProgress, setPhotoUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Fetch citizen data
  const [citizenData, isLoading, refresh] = useData(
    getSingleCitizen,
    () => {},
    citizenId
  );

  // Mutation for updating photo
  const [updatePhotoMutation, isUpdatingPhoto] = useMutation(
    async (photo: string) => {
      const result = await takeCitizenPhoto(citizenId, photo);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Photo updated successfully!");
        refresh();
        setPhotoUploadProgress(null);
      } else {
        toast.error(result.message || "Failed to update photo");
      }
    }
  );

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

  // Handle photo upload
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploadingPhoto(true);

    const newUpload = {
      file,
      progress: 0,
      uuid: getTimestampUUID(file.name.split(".").pop() || "jpg"),
    };

    setPhotoUploadProgress(newUpload);

    try {
      const serverFilename = await uploadFile(file, newUpload.uuid, setPhotoUploadProgress);

      setPhotoUploadProgress((prev) =>
        prev ? { ...prev, serverFilename, progress: 100 } : null
      );

      // Update the photo in the database
      updatePhotoMutation(serverFilename);
    } catch (error) {
      console.error("Failed to upload photo:", error);
      setPhotoUploadProgress(null);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
          <h3 className="text-lg font-semibold">Loading Citizen Data...</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch the citizen information.
          </p>
        </div>
      </div>
    );
  }

  if (!citizenData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Citizen Not Found</h3>
          <p className="text-muted-foreground">
            The citizen you're looking for doesn't exist.
          </p>
          <Link href="/dashboard/citizen" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Citizens
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
          <Link href="/dashboard/citizen">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Citizens
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {citizenData.firstName} {citizenData.middleName} {citizenData.lastName}
            </h1>
            <p className="text-muted-foreground">
              Registration No: {citizenData.registralNo}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/citizen/${citizenId}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Citizen
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Image
                  src={formatImageUrl(citizenData.profilePhoto)}
                  alt={`${citizenData.firstName} ${citizenData.lastName}`}
                  width={200}
                  height={200}
                  className="w-48 h-48 object-cover rounded-lg border-4 border-gray-200"
                />
                {!citizenData.profilePhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <User className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="mt-4 w-full">
                <label
                  htmlFor="photoUpload"
                  className="cursor-pointer"
                >
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Upload className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-600">
                          {citizenData.profilePhoto ? "Update Photo" : "Upload Photo"}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={isUploadingPhoto || isUpdatingPhoto}
                  />
                </label>

                {photoUploadProgress && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="truncate max-w-[120px]">
                            {photoUploadProgress.file.name}
                          </span>
                          <span className="font-semibold">
                            {photoUploadProgress.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${photoUploadProgress.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Citizen Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">First Name</p>
                  <p className="text-base font-semibold">{citizenData.firstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Middle Name</p>
                  <p className="text-base font-semibold">{citizenData.middleName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                  <p className="text-base font-semibold">{citizenData.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <Badge variant={citizenData.gender === "MALE" ? "default" : "secondary"}>
                    {citizenData.gender}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date of Birth
                  </p>
                  <p className="text-base font-semibold">
                    {new Date(citizenData.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Place of Birth
                  </p>
                  <p className="text-base font-semibold">{citizenData.placeOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Occupation
                  </p>
                  <p className="text-base font-semibold">{citizenData.occupation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </p>
                  <p className="text-base font-semibold">{citizenData.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                  <p className="text-base font-semibold">{citizenData.emergencyContact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                  <p className="text-base font-semibold">{citizenData.relationship}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Emergency Phone
                  </p>
                  <p className="text-base font-semibold">{citizenData.emergencyPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Info */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered On</p>
                  <p className="text-base font-semibold">
                    {new Date(citizenData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-base font-semibold">
                    {new Date(citizenData.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
