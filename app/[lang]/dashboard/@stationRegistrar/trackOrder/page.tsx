"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default function TrackOrderPage({ params }: PageProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      toast.error("Please enter an order number or tracking ID");
      return;
    }

    setIsSearching(true);
    try {
      // Navigate to the search results page
      router.push(
        `/en/dashboard/trackOrder/${encodeURIComponent(searchInput.trim())}`
      );
    } catch (error) {
      toast.error("Failed to search for order");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="h-full w-dvw container mx-auto px-4 py-8 overflow-y-auto">
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

      {/* How to Find Order Number */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How to Find Your Order Number</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Order Confirmation Email</h3>
                <p className="text-sm text-muted-foreground">
                  Check your email for the order confirmation message
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Order History</h3>
                <p className="text-sm text-muted-foreground">
                  Visit your order history page in your account
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Truck className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Phone Number</h3>
                <p className="text-sm text-muted-foreground">
                  Search using the phone number used during registration
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Station Records</h3>
                <p className="text-sm text-muted-foreground">
                  Contact your local registration station
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <span className="font-medium">PENDING</span>
                <p className="text-sm text-muted-foreground">
                  Your order has been received and is being processed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <span className="font-medium">IN PROGRESS</span>
                <p className="text-sm text-muted-foreground">
                  Your ID card is being manufactured and processed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <span className="font-medium">APPROVED</span>
                <p className="text-sm text-muted-foreground">
                  Your order has been approved and is ready for collection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <span className="font-medium">REJECTED</span>
                <p className="text-sm text-muted-foreground">
                  Your order requires additional information or correction
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
