import { NextRequest, NextResponse } from "next/server";
import { verifyChapaPayment } from "@/actions/stationRegistral/chapa";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tx_ref: string }> }
) {
  try {
    const { tx_ref } = await params;

    if (!tx_ref) {
      return NextResponse.json(
        { status: false, message: "Transaction reference is required" },
        { status: 400 }
      );
    }

    console.log("Received payment verification callback for tx_ref:", tx_ref);

    // Verify the payment
    const result = await verifyChapaPayment(undefined, tx_ref);

    if (result?.status) {
      console.log("Payment verified successfully for order:", result.orderId);
      return NextResponse.json({
        status: true,
        message: "Payment verified successfully",
        orderId: result.orderId,
      });
    } else {
      console.log("Payment verification failed:", result?.message);
      return NextResponse.json(
        {
          status: false,
          message: result?.message || "Payment verification failed",
          orderId: result?.orderId,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment verification callback error:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tx_ref: string }> }
) {
  try {
    const { tx_ref } = await params;

    if (!tx_ref) {
      return NextResponse.json(
        { status: false, message: "Transaction reference is required" },
        { status: 400 }
      );
    }

    // For GET requests, just verify the payment status
    const result = await verifyChapaPayment(undefined, tx_ref);

    if (result?.status) {
      return NextResponse.json({
        status: true,
        message: "Payment verified successfully",
        orderId: result.orderId,
      });
    } else {
      return NextResponse.json(
        {
          status: false,
          message: result?.message || "Payment verification failed",
          orderId: result?.orderId,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
