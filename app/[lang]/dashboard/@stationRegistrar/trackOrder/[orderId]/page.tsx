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
import {
  getOrdersBySearch,
  getOrderById,
} from "@/actions/stationRegistral/order";
import { useData } from "@/hooks/useData";

interface OrderDetails {
  id: string;
  orderNumber: string;
  orderType: string;
  orderStatus: "PENDING" | "APPROVED" | "REJECTED";
  paymentMethod: string;
  paymentReference: string;
  amount: number;
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
}

interface PageProps {
  params: Promise<{ lang: string; orderId: string }>;
}

export default function TrackOrderSearchPage({ params }: PageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Use useData hook for data management
  const [ordersData, isLoading, refetch] = useData(async () => {
    const resolvedParams = await params;
    const orderId = decodeURIComponent(resolvedParams.orderId);
    setSearchTerm(orderId);

    // Check if the search term looks like an order ID (UUID format)
    const isOrderId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        orderId
      );

    if (isOrderId) {
      // If it's an order ID, get single order by ID
      const result = await getOrderById(orderId);
      if (result?.status && result.data) {
        return [result.data]; // Return as array for consistency
      } else {
        throw new Error(result?.message || "Order not found");
      }
    } else {
      // Otherwise, search by order number or phone
      const result = await getOrdersBySearch(orderId);
      if (result?.status && result.data) {
        return result.data;
      } else {
        throw new Error(result?.message || "No orders found");
      }
    }
  }, null);

  // Handle error state
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isLoading && (!ordersData || ordersData.length === 0)) {
      setError(new Error("No orders found"));
    } else {
      setError(null);
    }
  }, [isLoading, ordersData]);

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
        description: `Payment of ${order.amount} ETB received`,
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
          title: "Processing",
          description: "Your ID card is being manufactured",
          status: "completed",
          date: new Date(order.updatedAt),
          icon: Package,
        },
        {
          id: 5,
          title: "Ready for Collection",
          description: "Your ID card is ready at the station",
          status: "current",
          date: new Date(order.updatedAt),
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
          <h2 className="text-2xl font-bold mb-2">No Orders Found</h2>
          <p className="text-muted-foreground mb-6">
            {error.message ||
              "No orders found for the search term you entered."}
          </p>
          <div className="space-x-4">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/en/dashboard/trackOrder")}>
              Search Again
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

  // Guard clause for undefined ordersData
  if (!ordersData || ordersData.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative">
      {/* Loading overlay for refresh */}
      {isLoading && ordersData && (
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
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Track Order
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {ordersData.length === 1
                ? `Your Order`
                : `Your Orders (${ordersData.length} Items)`}
            </h1>
            <p className="text-muted-foreground">
              {ordersData.length === 1
                ? `Order #${ordersData[0].orderNumber}`
                : `Search results for "${searchTerm}"`}
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

      {/* Multiple Orders View - Card Layout */}
      {ordersData.length > 1 ? (
        <div className="space-y-6">
          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {ordersData
                        .reduce((sum, order) => sum + order.amount, 0)
                        .toLocaleString()}{" "}
                      ETB
                    </CardTitle>
                    <p className="text-muted-foreground">Total Order Value</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Orders Found</p>
                  <p className="text-2xl font-bold">{ordersData.length}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Individual Order Cards */}
          <div className="space-y-4">
            {ordersData.map((order, index) => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  router.push(`/en/dashboard/trackOrder/${order.id}`)
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Left side - Order Info */}
                    <div className="flex items-center gap-4">
                      {/* Order Icon */}
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>

                      {/* Order Details */}
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          {order.citizen.firstName}{" "}
                          {order.citizen.middleName || ""}{" "}
                          {order.citizen.lastName}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Created:{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>ID: {order.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Status and Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge
                          className={`${getStatusColor(
                            order.orderStatus
                          )} border mb-2`}
                        >
                          {order.orderStatus}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Payment: {order.paymentMethod}
                        </p>
                        <p className="text-sm font-semibold">
                          {order.amount} ETB
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/en/dashboard/trackOrder/${order.id}`);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Single Order View */
        <SingleOrderView
          order={ordersData[0]}
          getStatusColor={getStatusColor}
          getOrderTypeColor={getOrderTypeColor}
          getTimelineSteps={getTimelineSteps}
        />
      )}
    </div>
  );
}

// Single Order Component
function SingleOrderView({
  order,
  getStatusColor,
  getOrderTypeColor,
  getTimelineSteps,
}: {
  order: OrderDetails;
  getStatusColor: (status: string) => string;
  getOrderTypeColor: (type: string) => string;
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
