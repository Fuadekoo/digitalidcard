"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import {
  getSingleCitizen,
  takeCitizenPhoto,
} from "@/actions/stationRegistral/citizen";
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
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import CameraCapture from "@/components/camera-capture";

interface CitizenDetailPageProps {
  citizenId: string;
  lang: string;
}

const CHUNK_SIZE = 512 * 1024; // 512KB

function getTimestampUUID(ext: string) {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
}

const formatImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.png";
  return `/api/filedata/${encodeURIComponent(url)}`;
};

export default function CitizenDetailPage({
  citizenId,
  lang,
}: CitizenDetailPageProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
        setShowCamera(false);
      } else {
        toast.error(result.message || "Failed to update photo");
      }
    }
  );

  // Upload blob to server with chunking
  const uploadBlobToServer = async (blob: Blob): Promise<string> => {
    const uuidName = getTimestampUUID("jpg");
    const chunkSize = CHUNK_SIZE;
    const total = Math.ceil(blob.size / chunkSize);
    let finalReturnedName: string | null = null;

    setIsUploadingPhoto(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < total; i++) {
        const start = i * chunkSize;
        const end = Math.min(blob.size, start + chunkSize);
        const chunk = blob.slice(start, end);

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

        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      if (!finalReturnedName) {
        throw new Error("Upload failed: no filename returned");
      }

      return finalReturnedName;
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  // Handle camera capture
  const handleCameraCapture = async (imageBlob: Blob) => {
    try {
      toast.info("Uploading photo...");
      const serverFilename = await uploadBlobToServer(imageBlob);
      updatePhotoMutation(serverFilename);
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      toast.error("Failed to upload photo. Please try again.");
    }
  };

  // Handle opening camera with permission check
  const handleOpenCamera = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately after permission is granted
      stream.getTracks().forEach((track) => track.stop());
      // Show camera component
      setShowCamera(true);
    } catch (error) {
      console.error("Camera permission denied:", error);
      toast.error(
        "Camera permission is required to capture photo. Please allow camera access in your browser settings."
      );
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
          <Link
            href={`/${lang}/dashboard/citizen`}
            className="mt-4 inline-block"
          >
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Citizens
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show camera view
  if (showCamera) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Capture Profile Photo</h2>
            <p className="text-muted-foreground">
              Position yourself in the frame and capture your photo
            </p>
          </div>
          <CameraCapture
            onCapture={handleCameraCapture}
            onCancel={() => setShowCamera(false)}
          />
          {isUploadingPhoto && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Uploading photo...</span>
                <span className="font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${lang}/dashboard/citizen`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Citizens
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {citizenData.firstName} {citizenData.middleName}{" "}
              {citizenData.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">
                Registration No: {citizenData.registralNo}
              </p>
              <Badge
                className={`${
                  citizenData.isVerified === "APPROVED"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : citizenData.isVerified === "REJECTED"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }`}
              >
                {citizenData.isVerified === "APPROVED"
                  ? "✅ APPROVED"
                  : citizenData.isVerified === "REJECTED"
                  ? "❌ REJECTED"
                  : "⏳ PENDING"}
              </Badge>
            </div>
          </div>
        </div>
        <Link href={`/${lang}/dashboard/citizen/${citizenId}/edit`}>
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
                <Button
                  onClick={handleOpenCamera}
                  className="w-full"
                  size="lg"
                  disabled={isUploadingPhoto || isUpdatingPhoto}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  {citizenData.profilePhoto ? "Update Photo" : "Capture Photo"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Click to open camera and capture photo
                </p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    First Name
                  </p>
                  <p className="text-base font-semibold">
                    {citizenData.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Middle Name
                  </p>
                  <p className="text-base font-semibold">
                    {citizenData.middleName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </p>
                  <p className="text-base font-semibold">
                    {citizenData.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Gender
                  </p>
                  <Badge
                    variant={
                      citizenData.gender === "MALE" ? "default" : "secondary"
                    }
                  >
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
                  <p className="text-base font-semibold">
                    {citizenData.placeOfBirth}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Occupation
                  </p>
                  <p className="text-base font-semibold">
                    {citizenData.occupation}
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Contact Name
                  </p>
                  <p className="text-base font-semibold">
                    {citizenData.emergencyContact}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Relationship
                  </p>
                  <p className="text-base font-semibold">
                    {citizenData.relationship}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Emergency Phone
                  </p>
                  <p className="text-base font-semibold">
                    {citizenData.emergencyPhone}
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Registered On
                  </p>
                  <p className="text-base font-semibold">
                    {new Date(citizenData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
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
