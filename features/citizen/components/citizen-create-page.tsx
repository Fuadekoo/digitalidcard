"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useMutation from "@/hooks/useMutation";
import useTranslation from "@/hooks/useTranslation";
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
  Users,
  Activity,
  X,
  Camera,
  ArrowRight,
  CheckCircle,
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import CameraCapture from "@/components/camera-capture";
import { BirthDatePicker } from "@/components/birth-date-picker";
import { cn } from "@/lib/utils";
import { ButtonSpinner } from "@/components/ui/spinner";

interface CitizenFormData {
  registralNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  placeOfBirth: string;
  dateOfBirth: string;
  occupation: string;
  phone: string;
  emergencyContact: string;
  relationship: string;
  emergencyPhone: string;
  profilePhoto?: string;
}

type FormStep = "form" | "camera" | "review";

const CHUNK_SIZE = 512 * 1024; // 512KB

function getTimestampUUID(ext: string) {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
}

const formatImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.png";
  return `/api/filedata/${encodeURIComponent(url)}`;
};

interface CitizenCreatePageProps {
  lang: string;
}

export default function CitizenCreatePage({ lang }: CitizenCreatePageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<FormStep>("form");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Mutation for creating citizen
  const [createCitizenMutation, isCreating] = useMutation(
    async (
      data: Omit<CitizenFormData, "gender"> & {
        gender: "MALE" | "FEMALE" | "OTHER";
      }
    ) => {
      const result = await createCitizen(data);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success(t("citizen.createSuccess"));
        router.push(`/${lang}/dashboard/citizen`);
      } else {
        // console.log("error >>2>>", result);
        toast.error(result.message || t("citizen.createFailed"));
      }
    }
  );

  const handleInputChange = (field: keyof CitizenFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
      handleInputChange("profilePhoto", serverFilename);
      setCurrentStep("review");
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      toast.error("Failed to upload photo. Please try again.");
    }
  };

  // Remove photo
  const removePhoto = () => {
    handleInputChange("profilePhoto", "");
    setCurrentStep("camera");
  };

  // Handle form validation and move to camera step
  const handleNextToCamera = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.registralNo ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.gender
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      !formData.middleName ||
      !formData.placeOfBirth ||
      !formData.dateOfBirth
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.occupation || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      !formData.emergencyContact ||
      !formData.relationship ||
      !formData.emergencyPhone
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCurrentStep("camera");
  };

  // Final submit
  const handleFinalSubmit = () => {
    if (!formData.profilePhoto) {
      toast.error("Please capture a photo before registering");
      return;
    }

    // Type assertion after validation
    const validatedData = {
      ...formData,
      gender: formData.gender as "MALE" | "FEMALE" | "OTHER",
    };

    createCitizenMutation(validatedData);
  };

  // Render based on current step
  if (currentStep === "camera") {
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
            onCancel={() => setCurrentStep("form")}
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

  if (currentStep === "review") {
    return (
      <div className="w-full h-full space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep("form")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Form
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Review & Register</h1>
              <p className="text-muted-foreground">
                Review the information and complete registration
              </p>
            </div>
          </div>
        </div>

        {/* Profile Photo Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {formData.profilePhoto && (
                <div className="relative">
                  <Image
                    src={formatImageUrl(formData.profilePhoto)}
                    alt="Profile Photo"
                    width={150}
                    height={150}
                    className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0"
                    onClick={removePhoto}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Photo captured successfully
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep("camera")}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Retake Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Citizen Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Registration Number
                </p>
                <p className="font-medium">{formData.registralNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">
                  {formData.firstName} {formData.middleName} {formData.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{formData.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formData.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Place of Birth</p>
                <p className="font-medium">{formData.placeOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupation</p>
                <p className="font-medium">{formData.occupation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{formData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Emergency Contact
                </p>
                <p className="font-medium">
                  {formData.emergencyContact} ({formData.relationship})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emergency Phone</p>
                <p className="font-medium">{formData.emergencyPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/${lang}/dashboard/citizen">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleFinalSubmit} disabled={isCreating} size="lg">
            {isCreating ? (
              <>
                <ButtonSpinner size={20} />
                <span className="ml-2">Registering...</span>
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Complete Registration
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/${lang}/dashboard/citizen">
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

      <form onSubmit={handleNextToCamera} className="space-y-6">
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
                onChange={(e) =>
                  handleInputChange("registralNo", e.target.value)
                }
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
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name *</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) =>
                    handleInputChange("middleName", e.target.value)
                  }
                  placeholder="Enter middle name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
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
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <BirthDatePicker
                  value={
                    formData.dateOfBirth
                      ? new Date(formData.dateOfBirth)
                      : undefined
                  }
                  onChange={(date) => {
                    if (date) {
                      handleInputChange(
                        "dateOfBirth",
                        date.toISOString().split("T")[0]
                      );
                    } else {
                      handleInputChange("dateOfBirth", "");
                    }
                  }}
                  placeholder="Pick birth date"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placeOfBirth">Place of Birth *</Label>
                <Input
                  id="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={(e) =>
                    handleInputChange("placeOfBirth", e.target.value)
                  }
                  placeholder="Enter place of birth"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation *</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
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
                <Label htmlFor="emergencyContact">
                  Emergency Contact Name *
                </Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    handleInputChange("emergencyContact", e.target.value)
                  }
                  placeholder="Enter emergency contact name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) =>
                    handleInputChange("relationship", e.target.value)
                  }
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
                onChange={(e) =>
                  handleInputChange("emergencyPhone", e.target.value)
                }
                placeholder="Enter emergency phone number"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/${lang}/dashboard/citizen">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="lg">
            Next: Capture Photo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
