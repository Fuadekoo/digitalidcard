"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Eye,
  AlertCircle,
  Phone,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { getOrdersBySearch } from "@/actions/stationRegistral/order";

interface PageProps {
  params: Promise<{ lang: string }>;
}

interface OrderResult {
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

export default function TrackOrderPage({ params }: PageProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<OrderResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      toast.error("Please enter an order number or phone number");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const result = await getOrdersBySearch(searchInput.trim());
      
      if (result?.status && result.data) {
        setSearchResults(result.data);
        if (result.data.length === 0) {
          toast.info("No orders found for the search term");
        } else {
          toast.success(`Found ${result.data.length} order(s)`);
        }
      } else {
        setSearchResults([]);
        toast.error(result?.message || "No orders found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      toast.error("Failed to search for orders");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

  const handleViewDetails = (orderId: string) => {
    router.push(`/en/dashboard/trackOrder/${orderId}`);
  };

  return (
    <div className="h-full  container px-4 py-8 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">
          Enter your order number or tracking ID to see the current status
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Order Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter order number (e.g., ORD-123456) or phone number"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-base"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-8"
            >
              {isSearching ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Track Order
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results Section */}
      {hasSearched && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Search Results
              </span>
              {searchResults.length > 0 && (
                <Badge variant="secondary">
                  {searchResults.length} order(s) found
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Searching for orders...</p>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground">
                  No orders found matching your search criteria. Please try a different order number or phone number.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((order) => (
                  <Card
                    key={order.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-2"
                    onClick={() => handleViewDetails(order.id)}
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
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {order.citizen.phone}
                              </span>
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
                            <Badge
                              className={`${getOrderTypeColor(
                                order.orderType
                              )} border mb-2 ml-2`}
                            >
                              {order.orderType}
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
                              handleViewDetails(order.id);
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
            )}
          </CardContent>
        </Card>
      )}

      
    </div>
  );
}
