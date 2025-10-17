"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  User,
  Calendar,
  CreditCard,
  Phone,
  FileText,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { getOrderById } from "@/actions/stationRegistral/order";
import { useData } from "@/hooks/useData";

interface OrderDetails {
  id: string;
  orderNumber: string;
  orderType: string;
  orderStatus: "PENDING" | "APPROVED" | "REJECTED";
  paymentMethod: string;
  paymentReference: string;
  amount: number;
  isPrinted: "PENDING" | "APPROVED" | "REJECTED";
  isAccepted: "PENDING" | "APPROVED" | "REJECTED";
  printerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  citizen: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    gender: string;
    phone: string;
    registralNo: string;
    dateOfBirth: Date;
    placeOfBirth: string;
    occupation: string;
  };
  printer?: {
    id: string;
    username: string;
  } | null;
}

interface PageProps {
  params: Promise<{ lang: string; orderId: string }>;
}

export default function TrackOrderDetailsPage({ params }: PageProps) {
  const router = useRouter();

  // Use useData hook for data management - only fetch single order by ID
  const [orderData, isLoading, refetch] = useData(async () => {
    const resolvedParams = await params;
    const orderId = decodeURIComponent(resolvedParams.orderId);

    // Get single order by ID
    const result = await getOrderById(orderId);
    if (result?.status && result.data) {
      return result.data;
    } else {
      throw new Error(result?.message || "Order not found");
    }
  }, null);

  // Handle error state
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isLoading && !orderData) {
      setError(new Error("Order not found"));
    } else {
      setError(null);
    }
  }, [isLoading, orderData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "NORMAL":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPrintStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAcceptStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTimelineSteps = (order: OrderDetails) => {
    const steps = [
      {
        id: 1,
        title: "Order Placed",
        description: "Your order has been received",
        status: "completed",
        date: new Date(order.createdAt),
        icon: CheckCircle,
      },
      {
        id: 2,
        title: "Payment Processed",
        description: `Payment of ${order.amount} ETB received via ${order.paymentMethod}`,
        status: order.orderStatus !== "PENDING" ? "completed" : "pending",
        date: new Date(order.createdAt),
        icon: CreditCard,
      },
    ];

    if (order.orderStatus === "PENDING") {
      steps.push({
        id: 3,
        title: "Under Review",
        description: "Your documents are being reviewed",
        status: "current",
        date: new Date(order.updatedAt),
        icon: FileText,
      });
    } else if (order.orderStatus === "APPROVED") {
      steps.push(
        {
          id: 3,
          title: "Under Review",
          description: "Your documents have been reviewed",
          status: "completed",
          date: new Date(order.updatedAt),
          icon: FileText,
        },
        {
          id: 4,
          title: "Card Printing",
          description:
            order.isPrinted === "APPROVED"
              ? `ID card has been printed by ${
                  order.printer ? order.printer.username : "Unknown Printer"
                }`
              : order.isPrinted === "REJECTED"
              ? "Card printing was rejected"
              : "Your ID card is being printed",
          status:
            order.isPrinted === "APPROVED"
              ? "completed"
              : order.isPrinted === "REJECTED"
              ? "error"
              : "current",
          date:
            order.isPrinted === "APPROVED"
              ? new Date(order.updatedAt)
              : new Date(),
          icon: Package,
        },
        {
          id: 5,
          title: "Card Acceptance",
          description:
            order.isAccepted === "APPROVED"
              ? "ID card has been accepted and verified"
              : order.isAccepted === "REJECTED"
              ? "Card acceptance was rejected"
              : "Waiting for card acceptance",
          status:
            order.isAccepted === "APPROVED"
              ? "completed"
              : order.isAccepted === "REJECTED"
              ? "error"
              : "pending",
          date:
            order.isAccepted === "APPROVED"
              ? new Date(order.updatedAt)
              : new Date(),
          icon: CheckCircle,
        },
        {
          id: 6,
          title: "Ready for Collection",
          description: "Your ID card is ready at the station",
          status: order.isAccepted === "APPROVED" ? "current" : "pending",
          date:
            order.isAccepted === "APPROVED"
              ? new Date(order.updatedAt)
              : new Date(),
          icon: MapPin,
        }
      );
    } else if (order.orderStatus === "REJECTED") {
      steps.push({
        id: 3,
        title: "Review Failed",
        description: "Additional information required",
        status: "current",
        date: new Date(order.updatedAt),
        icon: AlertCircle,
      });
    }

    return steps;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error.message ||
              "The order you are looking for could not be found."}
          </p>
          <div className="space-x-4">
            <Button
              onClick={() => router.push("/en/dashboard/trackOrder")}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
            <Button onClick={refetch} variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Guard clause for undefined orderData
  if (!orderData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl overflow-y-auto">
      {/* Loading overlay for refresh */}
      {isLoading && orderData && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">
              Refreshing order details...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/en/dashboard/trackOrder")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">
              Order #{orderData.orderNumber}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={refetch} disabled={isLoading}>
          <Clock
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Single Order View */}
      <SingleOrderView
        order={orderData}
        getStatusColor={getStatusColor}
        getOrderTypeColor={getOrderTypeColor}
        getPrintStatusColor={getPrintStatusColor}
        getAcceptStatusColor={getAcceptStatusColor}
        getTimelineSteps={getTimelineSteps}
      />
    </div>
  );
}

// Single Order Component
function SingleOrderView({
  order,
  getStatusColor,
  getOrderTypeColor,
  getPrintStatusColor,
  getAcceptStatusColor,
  getTimelineSteps,
}: {
  order: OrderDetails;
  getStatusColor: (status: string) => string;
  getOrderTypeColor: (type: string) => string;
  getPrintStatusColor: (status: string) => string;
  getAcceptStatusColor: (status: string) => string;
  getTimelineSteps: (order: OrderDetails) => any[];
}) {
  const timelineSteps = getTimelineSteps(order);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Status
              </CardTitle>
              <Badge className={`${getStatusColor(order.orderStatus)} border`}>
                {order.orderStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Type:</span>
                <Badge
                  className={`${getOrderTypeColor(order.orderType)} border`}
                >
                  {order.orderType}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">{order.amount} ETB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Payment Reference:
                </span>
                <span className="font-mono text-sm">
                  {order.paymentReference}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Print Status:</span>
                <Badge
                  className={`${getPrintStatusColor(order.isPrinted)} border`}
                >
                  {order.isPrinted}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Acceptance Status:
                </span>
                <Badge
                  className={`${getAcceptStatusColor(order.isAccepted)} border`}
                >
                  {order.isAccepted}
                </Badge>
              </div>
              {order.printer && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Printer:</span>
                  <span className="font-medium">{order.printer.username}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === timelineSteps.length - 1;

                return (
                  <div key={step.id} className="relative flex gap-4">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.status === "completed"
                            ? "bg-green-500 text-white"
                            : step.status === "current"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-16 ${
                            timelineSteps[index + 1]?.status === "completed"
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{step.title}</h3>
                        {step.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        {step.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.date.toLocaleDateString()} •{" "}
                        {step.date.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Citizen Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Citizen Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-lg">
                {order.citizen.firstName} {order.citizen.middleName || ""}{" "}
                {order.citizen.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                Registration: {order.citizen.registralNo}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date of Birth</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.citizen.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Place of Birth</p>
                  <p className="text-sm text-muted-foreground">
                    {order.citizen.placeOfBirth}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {order.citizen.phone}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>

            {order.orderStatus === "REJECTED" && (
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Resubmit Documents
              </Button>
            )}

            {order.orderStatus === "APPROVED" && (
              <Button className="w-full">
                <MapPin className="mr-2 h-4 w-4" />
                Collect ID Card
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
