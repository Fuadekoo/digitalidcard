"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useMutation from "@/hooks/useMutation";
import { createCitizen } from "@/actions/stationRegistral/citizen";
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
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Activity,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

interface CitizenFormData {
  registralNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  placeOfBirth: string;
  dateOfBirth: string;
  occupation: string;
  phone: string;
  emergencyContact: string;
  relationship: string;
  emergencyPhone: string;
  profilePhoto?: string;
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

export default function CitizenCreatePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<CitizenFormData>({
    registralNo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    placeOfBirth: "",
    dateOfBirth: "",
    occupation: "",
    phone: "",
    emergencyContact: "",
    relationship: "",
    emergencyPhone: "",
    profilePhoto: "",
  });

  const [photoUploadProgress, setPhotoUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Mutation for creating citizen
  const [createCitizenMutation, isCreating] = useMutation(
    async (data: CitizenFormData) => {
      const result = await createCitizen(data);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Citizen created successfully!");
        router.push("/dashboard/citizen");
      } else {
        toast.error(result.message || "Failed to create citizen");
      }
    }
  );

  const handleInputChange = (
    field: keyof CitizenFormData,
    value: string
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

      handleInputChange("profilePhoto", serverFilename);

      setPhotoUploadProgress((prev) =>
        prev ? { ...prev, serverFilename, progress: 100 } : null
      );
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      setPhotoUploadProgress(null);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Remove photo
  const removePhoto = () => {
    handleInputChange("profilePhoto", "");
    setPhotoUploadProgress(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.registralNo || !formData.firstName || !formData.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }

    createCitizenMutation(formData);
  };

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
            <h1 className="text-2xl font-bold">Register New Citizen</h1>
            <p className="text-muted-foreground">
              Fill in the citizen information below
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Profile Photo (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.profilePhoto && !photoUploadProgress && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Current Photo:
                </p>
                <div className="relative inline-block">
                  <Image
                    src={formatImageUrl(formData.profilePhoto)}
                    alt="Profile Photo"
                    width={128}
                    height={128}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removePhoto}
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
                    htmlFor="profilePhoto"
                    className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {formData.profilePhoto ? "Change photo" : "Click to upload photo"}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </div>

              {photoUploadProgress && (
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate max-w-[150px]">
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
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registralNo">Registration Number *</Label>
              <Input
                id="registralNo"
                value={formData.registralNo}
                onChange={(e) => handleInputChange("registralNo", e.target.value)}
                placeholder="Enter registration number"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name *</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange("middleName", e.target.value)}
                  placeholder="Enter middle name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placeOfBirth">Place of Birth *</Label>
                <Input
                  id="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={(e) => handleInputChange("placeOfBirth", e.target.value)}
                  placeholder="Enter place of birth"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation *</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  placeholder="Enter occupation"
                  required
                />
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Enter emergency contact name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => handleInputChange("relationship", e.target.value)}
                  placeholder="Enter relationship"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Phone Number *</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                placeholder="Enter emergency phone number"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/citizen">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isCreating || isUploadingPhoto}>
            {isCreating ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Citizen
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
