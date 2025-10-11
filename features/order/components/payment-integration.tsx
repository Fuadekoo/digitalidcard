"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import useMutation from "@/hooks/useMutation";
import { updateOrderStatus } from "@/actions/stationRegistral/order";
import {
  initializeChapaPayment,
  verifyChapaPayment,
} from "@/actions/stationRegistral/chapa";

interface PaymentIntegrationProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  orderType: string;
  citizenName: string;
  citizenId: string;
  lang: string;
  onPaymentSuccess: () => void;
}

// Real Chapa payment initialization function
const initializePayment = async (data: {
  orderId: string;
  citizenId: string;
  amount: number;
  orderType: string;
}) => {
  const result = await initializeChapaPayment(undefined, data);
  return result;
};

// Real Chapa payment verification function
const verifyPayment = async (tx_ref: string) => {
  const result = await verifyChapaPayment(undefined, tx_ref);
  return result;
};

export function PaymentIntegration({
  orderId,
  orderNumber,
  amount,
  orderType,
  citizenName,
  citizenId,
  lang,
  onPaymentSuccess,
}: PaymentIntegrationProps) {
  const router = useRouter();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "success" | "failed"
  >("pending");
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [txRef, setTxRef] = useState<string>("");

  const [paymentAction, isPaymentLoading] = useMutation(
    initializePayment,
    (state) => {
      if (state?.status) {
        setPaymentUrl(state.url);
        setPaymentStatus("processing");
        // Extract tx_ref from URL or use a placeholder
        // In real implementation, you might get this from the response
        setTxRef(orderId); // Using orderId as placeholder for tx_ref
        
        // Navigate to payment URL in the same tab (more secure)
        toast.success("Redirecting to payment page...");
        setTimeout(() => {
          window.location.href = state.url;
        }, 1000);
      } else {
        setPaymentStatus("failed");
        toast.error(state?.message || "Failed to initialize payment");
      }
    }
  );

  const [verifyAction, isVerifying] = useMutation(
    verifyPayment,
    async (state) => {
      if (state?.status) {
        // Update order status to APPROVED after successful payment
        const updateResult = await updateOrderStatus(orderId, "APPROVED");
        if (updateResult?.status) {
          setPaymentStatus("success");
          toast.success("Payment verified successfully!");
          onPaymentSuccess();
          setIsPaymentDialogOpen(false);
        } else {
          setPaymentStatus("failed");
          toast.error("Failed to update order status");
        }
      } else {
        setPaymentStatus("failed");
        toast.error("Payment verification failed");
      }
    }
  );

  const handleInitializePayment = async () => {
    setPaymentStatus("processing");
    await paymentAction({
      orderId,
      citizenId,
      amount,
      orderType,
    });
  };

  const handleVerifyPayment = async () => {
    if (!txRef) {
      toast.error("Transaction reference not found");
      return;
    }
    setPaymentStatus("processing");
    await verifyAction(txRef);
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "pending":
        return "Ready to process payment";
      case "processing":
        return "Redirecting to payment page...";
      case "success":
        return "Payment completed successfully";
      case "failed":
        return "Payment failed - please try again";
      default:
        return "Unknown status";
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "processing":
        return "bg-blue-50 border-blue-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsPaymentDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Process Payment
      </Button>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Process Payment
            </DialogTitle>
            <DialogDescription>
              Complete payment for order {orderNumber}. You will be redirected to the secure payment page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Details */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order:</span>
                    <span className="font-medium">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Citizen:</span>
                    <span className="font-medium">{citizenName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{orderType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-primary">{amount} ETB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card className={getStatusColor()}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <p className="font-medium">{getStatusMessage()}</p>
                    {paymentStatus === "processing" && (
                      <p className="text-sm text-muted-foreground">
                        Please complete payment in the new tab
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              {paymentStatus === "pending" && (
                <Button
                  onClick={handleInitializePayment}
                  disabled={isPaymentLoading}
                >
                  {isPaymentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </>
                  )}
                </Button>
              )}

              {paymentStatus === "processing" && (
                <Button onClick={handleVerifyPayment} disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Payment
                    </>
                  )}
                </Button>
              )}

              {paymentStatus === "success" && (
                <Button onClick={() => setIsPaymentDialogOpen(false)}>
                  Close
                </Button>
              )}

              {paymentStatus === "failed" && (
                <Button
                  variant="outline"
                  onClick={() => setPaymentStatus("pending")}
                >
                  Try Again
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
