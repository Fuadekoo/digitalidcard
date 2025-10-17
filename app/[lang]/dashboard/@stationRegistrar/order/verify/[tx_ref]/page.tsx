import React from "react";
import { getPaymentStatus } from "@/actions/stationRegistral/chapa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    lang: string;
    tx_ref: string;
  }>;
}

export default async function PaymentVerificationPage({ params }: PageProps) {
  const { lang, tx_ref } = await params;

  if (!tx_ref) {
    redirect(`/${lang}/dashboard/order`);
  }

  // Get payment status
  const paymentStatus = await getPaymentStatus(tx_ref);

  if (!paymentStatus.status) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Payment Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
            <p className="text-muted-foreground">
              {paymentStatus.message || "Unable to verify payment"}
            </p>
            <Link href={`/${lang}/dashboard/order`}>
              <Button>Back to Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data } = paymentStatus;

  if (!data) {
    redirect(`/${lang}/dashboard/order`);
  }

  const isApproved = data.orderStatus === "APPROVED";

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Payment Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Icon */}
          <div className="text-center">
            {isApproved ? (
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            ) : (
              <Clock className="h-16 w-16 mx-auto text-yellow-500" />
            )}
          </div>

          {/* Order Details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-medium">{data.orderNumber}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Citizen:</span>
              <span className="font-medium">
                {data.citizen.firstName} {data.citizen.lastName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">ETB {data.amount}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge
                variant={isApproved ? "default" : "secondary"}
                className={isApproved ? "bg-green-500" : "bg-yellow-500"}
              >
                {data.orderStatus}
              </Badge>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            {isApproved ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-600">
                  Payment Successful!
                </h3>
                <p className="text-muted-foreground">
                  Your payment has been verified and your order is approved.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-yellow-600">
                  Payment Pending
                </h3>
                <p className="text-muted-foreground">
                  Your payment is being processed. Please wait for verification.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Link href={`/${lang}/dashboard/order`} className="block">
              <Button className="w-full">Back to Orders</Button>
            </Link>

            {isApproved && (
              <Link href={`/${lang}/dashboard/order`} className="block">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
