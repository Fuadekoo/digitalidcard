"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  IdCard,
  ShieldCheck,
  XCircle,
  Clock,
  Users,
  Mail,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyCitizen, unVerifyCitizen } from "@/actions/stationAdmin/citizen";
import Image from "next/image";

interface CitizenDetailProps {
  citizen: {
    id: string;
    registralNo: string;
    profilePhoto: string | null;
    firstName: string;
    middleName: string | null;
    lastName: string;
    gender: string;
    dateOfBirth: Date;
    placeOfBirth: string;
    occupation: string;
    phone: string;
    emergencyContact: string;
    relationship: string;
    emergencyPhone: string;
    isVerified: "PENDING" | "APPROVED" | "REJECTED";
    barcode: string;
    createdAt: Date;
    updatedAt: Date;
    stationCitizen: {
      code: string;
      afanOromoName: string;
      amharicName: string;
    };
    order: Array<{
      id: string;
      orderNumber: string;
      orderType: string;
      orderStatus: string;
      createdAt: Date;
    }>;
  };
  lang: string;
}

export default function CitizenDetailUI({ citizen, lang }: CitizenDetailProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const handleStatusChange = async () => {
    setIsProcessing(true);
    try {
      let result;
      if (selectedStatus === "APPROVED") {
        result = await verifyCitizen(citizen.id);
      } else {
        result = await unVerifyCitizen(citizen.id);
      }

      if (result.status) {
        toast.success(result.message);
        setStatusDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const openStatusDialog = (status: string) => {
    setSelectedStatus(status);
    setStatusDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 text-lg py-2 px-4">
          <ShieldCheck className="h-5 w-5 mr-2" />
          Verified
        </Badge>
      );
    } else if (status === "REJECTED") {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 text-lg py-2 px-4">
          <XCircle className="h-5 w-5 mr-2" />
          Rejected
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 text-lg py-2 px-4">
          <Clock className="h-5 w-5 mr-2" />
          Pending
        </Badge>
      );
    }
  };

  const getGenderBadge = (gender: string) => {
    const colors = {
      MALE: "bg-blue-100 text-blue-800 border-blue-300",
      FEMALE: "bg-pink-100 text-pink-800 border-pink-300",
      OTHER: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return colors[gender as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-6 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${lang}/dashboard/citizenManagement`}>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Citizen Details</h1>
                <p className="text-white/90 mt-1">
                  View and manage citizen information
                </p>
              </div>
            </div>
            <div>{getStatusBadge(citizen.isVerified)}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Profile Card */}
        <Card className="border-t-4 border-t-blue-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="w-6 h-6 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Photo */}
              <div className="lg:col-span-1 flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl mb-4">
                  {citizen.profilePhoto ? (
                    <Image
                      src={citizen.profilePhoto}
                      alt={`${citizen.firstName} ${citizen.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                      <User className="w-24 h-24 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {citizen.firstName} {citizen.middleName} {citizen.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 font-mono mt-1">
                    {citizen.registralNo}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <IdCard className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Registration Number
                      </p>
                      <p className="text-base font-mono font-bold text-gray-900">
                        {citizen.registralNo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Gender
                      </p>
                      <Badge
                        className={`${getGenderBadge(citizen.gender)} mt-1`}
                      >
                        {citizen.gender}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Date of Birth
                      </p>
                      <p className="text-base text-gray-900">
                        {formatDate(citizen.dateOfBirth)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Place of Birth
                      </p>
                      <p className="text-base text-gray-900">
                        {citizen.placeOfBirth}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Occupation
                      </p>
                      <p className="text-base text-gray-900">
                        {citizen.occupation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Phone Number
                      </p>
                      <p className="text-base text-gray-900">{citizen.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Barcode
                      </p>
                      <p className="text-base font-mono text-gray-900">
                        {citizen.barcode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-teal-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Station
                      </p>
                      <p className="text-base text-gray-900">
                        {citizen.stationCitizen.afanOromoName} /{" "}
                        {citizen.stationCitizen.amharicName}
                      </p>
                      <p className="text-sm text-gray-600 font-mono">
                        {citizen.stationCitizen.code}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-t-4 border-t-red-500 shadow-lg">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-6 h-6 text-red-600" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Contact Name
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {citizen.emergencyContact}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Relationship
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {citizen.relationship}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Phone Number
                </p>
                <p className="text-lg font-mono font-semibold text-gray-900">
                  {citizen.emergencyPhone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Actions */}
        <Card className="border-t-4 border-t-purple-500 shadow-lg">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
              Verification Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              {citizen.isVerified !== "APPROVED" && (
                <Button
                  size="lg"
                  onClick={() => openStatusDialog("APPROVED")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isProcessing}
                >
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Approve Citizen
                </Button>
              )}
              {citizen.isVerified !== "REJECTED" && (
                <Button
                  size="lg"
                  onClick={() => openStatusDialog("REJECTED")}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={isProcessing}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Reject Citizen
                </Button>
              )}
              {citizen.isVerified !== "PENDING" && (
                <Button
                  size="lg"
                  onClick={() => openStatusDialog("PENDING")}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={isProcessing}
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Set to Pending
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Current Status: <strong>{citizen.isVerified}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Orders History */}
        {citizen.order.length > 0 && (
          <Card className="border-t-4 border-t-indigo-500 shadow-lg">
            <CardHeader className="bg-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                Order History ({citizen.order.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {citizen.order.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 font-mono">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="capitalize">{order.orderType}</Badge>
                      <Badge
                        className={
                          order.orderStatus === "APPROVED"
                            ? "bg-green-500 text-white"
                            : order.orderStatus === "REJECTED"
                            ? "bg-red-500 text-white"
                            : "bg-orange-500 text-white"
                        }
                      >
                        {order.orderStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold">Created:</span>{" "}
                {formatDate(citizen.createdAt)}
              </div>
              <div>
                <span className="font-semibold">Last Updated:</span>{" "}
                {formatDate(citizen.updatedAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {selectedStatus === "APPROVED" && (
                <>
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  Approve Citizen
                </>
              )}
              {selectedStatus === "REJECTED" && (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Citizen
                </>
              )}
              {selectedStatus === "PENDING" && (
                <>
                  <Clock className="h-5 w-5 text-orange-600" />
                  Set to Pending
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus === "APPROVED" && (
                <>
                  Are you sure you want to <strong>approve</strong>{" "}
                  <span className="font-semibold">
                    {citizen.firstName} {citizen.lastName}
                  </span>
                  ? They will be able to proceed with ID card generation.
                </>
              )}
              {selectedStatus === "REJECTED" && (
                <>
                  Are you sure you want to <strong>reject</strong>{" "}
                  <span className="font-semibold">
                    {citizen.firstName} {citizen.lastName}
                  </span>
                  ? They will not be able to proceed with ID card generation.
                </>
              )}
              {selectedStatus === "PENDING" && (
                <>
                  Are you sure you want to set{" "}
                  <span className="font-semibold">
                    {citizen.firstName} {citizen.lastName}
                  </span>{" "}
                  back to <strong>pending</strong> status? This will require
                  re-verification.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={isProcessing}
              className={
                selectedStatus === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : selectedStatus === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {isProcessing
                ? "Processing..."
                : selectedStatus === "APPROVED"
                ? "Approve"
                : selectedStatus === "REJECTED"
                ? "Reject"
                : "Set to Pending"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
