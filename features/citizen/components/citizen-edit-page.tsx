"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useMutation from "@/hooks/useMutation";
import { useData } from "@/hooks/useData";
import {
  getSingleCitizen,
  updateCitizen,
} from "@/actions/stationRegistral/citizen";
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
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { BirthDatePicker } from "@/components/birth-date-picker";

interface CitizenEditPageProps {
  citizenId: string;
  lang: string;
}

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
}

export default function CitizenEditPage({
  citizenId,
  lang,
}: CitizenEditPageProps) {
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
  });

  // Fetch citizen data
  const [citizenData, isLoading] = useData(
    getSingleCitizen,
    () => {},
    citizenId
  );

  // Mutation for updating citizen
  const [updateCitizenMutation, isUpdating] = useMutation(
    async (
      data: Omit<CitizenFormData, "gender"> & {
        gender: "MALE" | "FEMALE" | "OTHER";
      }
    ) => {
      const result = await updateCitizen(citizenId, data);
      return result;
    },
    (result) => {
      if (result.status) {
        toast.success("Citizen updated successfully!");
        router.push(`/${lang}/dashboard/citizen/${citizenId}`);
      } else {
        toast.error(result.message || "Failed to update citizen");
      }
    }
  );

  // Populate form when data is loaded
  useEffect(() => {
    if (citizenData) {
      const dateOfBirth = citizenData.dateOfBirth
        ? new Date(citizenData.dateOfBirth).toISOString().split("T")[0]
        : "";

      setFormData({
        registralNo: citizenData.registralNo || "",
        firstName: citizenData.firstName || "",
        middleName: citizenData.middleName || "",
        lastName: citizenData.lastName || "",
        gender: citizenData.gender || "",
        placeOfBirth: citizenData.placeOfBirth || "",
        dateOfBirth: dateOfBirth,
        occupation: citizenData.occupation || "",
        phone: citizenData.phone || "",
        emergencyContact: citizenData.emergencyContact || "",
        relationship: citizenData.relationship || "",
        emergencyPhone: citizenData.emergencyPhone || "",
      });
    }
  }, [citizenData]);

  const handleInputChange = (field: keyof CitizenFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // Type assertion after validation
    const validatedData = {
      ...formData,
      gender: formData.gender as "MALE" | "FEMALE" | "OTHER",
    };

    updateCitizenMutation(validatedData);
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

  return (
    <div className="w-full h-full space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${lang}/dashboard/citizen/${citizenId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Citizen
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Citizen</h1>
            <p className="text-muted-foreground">
              Update citizen information below
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <Link href={`/${lang}/dashboard/citizen/${citizenId}`}>
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
                Update Citizen
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
