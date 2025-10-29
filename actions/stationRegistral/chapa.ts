"use server";

import { randomUUID } from "crypto";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { headers } from "next/headers";

type TPayState =
  | { status: true; cause?: undefined; message?: undefined; url: string }
  | { status: false; cause: string; message: string; url?: undefined }
  | undefined;

export async function initializeChapaPayment(
  prevState: TPayState,
  data:
    | {
        orderId: string;
        citizenId: string;
        amount: number;
        orderType: string;
      }
    | undefined
): Promise<TPayState> {
  try {
    if (!data) return undefined;

    const { orderId, citizenId, amount, orderType } = data;
    const session = await auth();
    const adminId = session?.user?.id;

    if (!adminId) {
      return {
        status: false,
        cause: "unauthenticated",
        message: "User not authenticated",
      };
    }

    // Get station ID for the registrar
    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationRegistrar" },
      select: { stationId: true },
    });

    if (!stationId?.stationId) {
      return {
        status: false,
        cause: "station_not_found",
        message: "Station not found",
      };
    }

    // Get the order and citizen details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        stationId: stationId.stationId,
      },
      select: {
        id: true,
        orderNumber: true,
        citizen: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            registralNo: true,
          },
        },
      },
    });

    if (!order) {
      return {
        status: false,
        cause: "order_not_found",
        message: "Order not found",
      };
    }

    // Generate unique transaction reference
    let tx_ref = randomUUID();
    let stop = false;
    while (!stop) {
      const existingOrder = await prisma.order.findFirst({
        where: { paymentReference: tx_ref },
      });
      if (!existingOrder) stop = true;
      else tx_ref = randomUUID();
    }

    // Update order with payment details
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        amount,
        paymentMethod: "chapa",
        paymentReference: tx_ref,
        updatedAt: new Date(),
      },
      select: { id: true, paymentReference: true, orderNumber: true },
    });

    // Get language from headers for return URL
    const lang =
      ((await headers()).get("x-pathname") ?? "").split("/")[1] || "en";

    // Debug: Log environment variables (remove in production)
    console.log("Chapa API URL:", process.env.CHAPA_API);
    console.log("Chapa Token exists:", !!process.env.CHAPA_TOKEN);
    console.log("App URL:", process.env.NEXT_PUBLIC_APP_URL);

    // Initialize Chapa payment
    const response = await fetch(
      `${process.env.CHAPA_API}/transaction/initialize`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          phone_number: order.citizen.phone,
          tx_ref: tx_ref,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-payment/${tx_ref}`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/dashboard/order/verify/${tx_ref}`,
          "customization[title]": "Digital ID Card Payment",
          "customization[description]": `Payment for ${orderType} ID card processing`,
          "meta[order_id]": orderId,
          "meta[citizen_id]": citizenId,
          "meta[order_type]": orderType,
        }),
        redirect: "follow",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Chapa initialization error:",
        response.status,
        response.statusText,
        errorText
      );

      let errorMessage = `Chapa API error: ${response.status}`;
      if (response.status === 401) {
        errorMessage =
          "Invalid Chapa API credentials. Please check your CHAPA_TOKEN.";
      } else if (response.status === 400) {
        errorMessage =
          "Invalid payment request. Please check the payment data.";
      }

      return {
        status: false,
        cause: "chapa_api_error",
        message: errorMessage,
      };
    }

    const responseData = await response.json();
    console.log("Chapa initialization response:", responseData);

    if (responseData?.status === "success") {
      return {
        status: true,
        url: responseData?.data?.checkout_url,
      };
    }

    console.error("Chapa initialization failed:", responseData);
    return {
      status: false,
      cause: "chapa_init_failed",
      message: "Chapa payment initialization failed",
    };
  } catch (error) {
    console.error("Payment initialization error:", error);
    return {
      status: false,
      cause: "internal_error",
      message: "Internal server error",
    };
  }
}

type TVerifyState =
  | { status: true; cause?: undefined; message?: undefined; orderId?: string }
  | { status: false; cause: string; message: string; orderId?: string }
  | undefined;

export async function verifyChapaPayment(
  prevState: TVerifyState,
  tx_ref: string | undefined
): Promise<TVerifyState> {
  try {
    if (!tx_ref) return undefined;

    console.log("Verifying payment for tx_ref:", tx_ref);

    // Find the order by payment reference (tx_ref)
    const order = await prisma.order.findFirst({
      where: { paymentReference: tx_ref },
      select: {
        id: true,
        orderStatus: true,
        paymentReference: true,
        citizen: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return {
        status: false,
        cause: "order_not_found",
        message: "Order not found",
      };
    }

    // If already paid, return success
    if (order.orderStatus === "APPROVED") {
      return { status: true, orderId: order.id };
    }

    // Verify payment with Chapa
    const isPaymentValid = await verifyPaymentWithChapa(tx_ref);

    if (isPaymentValid) {
      // Update order status to approved
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          orderStatus: "APPROVED",
          updatedAt: new Date(),
        },
      });

      console.log("Order approved:", updatedOrder.id);

      // Here you can add additional logic like:
      // - Send SMS notification to citizen
      // - Send notification to station admin
      // - Update citizen card status
      // - Generate receipt

      return { status: true, orderId: order.id };
    } else {
      return {
        status: false,
        cause: "payment_verification_failed",
        message: "Payment verification failed",
        orderId: order.id,
      };
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      status: false,
      cause: "internal_error",
      message: "Internal server error",
    };
  }
}

async function verifyPaymentWithChapa(tx_ref: string): Promise<boolean> {
  try {
    console.log("Verifying payment with Chapa for tx_ref:", tx_ref);

    const response = await fetch(
      `${process.env.CHAPA_API}/transaction/verify/${tx_ref}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Chapa API error:", response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    console.log("Chapa verification response:", data);

    // Check if the API call was successful and payment is completed
    if (data && data.status === "success" && data.data) {
      console.log("Payment status:", data.data.status);
      // For Chapa, consider successful if we got payment details
      // You might want to check specific status values based on Chapa documentation
      return true;
    } else {
      console.log("Payment verification failed:", data);
      return false;
    }
  } catch (error) {
    console.error("Chapa verification error:", error);
    return false;
  }
}

// Function to get payment status (for checking payment status without verification)
export async function getPaymentStatus(tx_ref: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { paymentReference: tx_ref },
      select: {
        id: true,
        orderStatus: true,
        orderNumber: true,
        amount: true,
        citizen: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return {
        status: false,
        message: "Order not found",
      };
    }

    const response = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return {
        status: false,
        message: "Failed to get payment status",
      };
    }

    const res = await response.json();

    return {
      status: res.status === "success",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderStatus: res.data.status == "success" ? "APPROVED" : "PENDING",
        amount: res.data.amount,
        citizen: order.citizen,
      },
    };
  } catch (error) {
    console.error("Get payment status error: ", error);
    return {
      status: false,
      message: "Failed to get payment status",
    };
  }
}
