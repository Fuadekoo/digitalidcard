"use client";

import React, { useEffect, useState } from "react";
import {
  getMultipleCardData,
  multiApprove,
  multiReject,
} from "@/actions/superPrintral/multiPrint";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Printer,
  ArrowLeft,
  CreditCard,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// Custom notification system
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ lang: string; ids: string[] }>;
}

interface OrderData {
  id: string;
  createdAt: Date;
  orderNumber: string;
  orderType: string;
  orderStatus: string;
  isPrinted: string;
  isAccepted: string;
  citizenNumber: number;
  citizenLabel: string;
  ethiopianCreatedAt: string;
  citizen: {
    id: string;
    registralNo: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    phone: string;
    profilePhoto: string | null;
    occupation: string | null;
    dateOfBirth: Date;
    gender: string;
    barcode: string;
    placeOfBirth: string;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    relationship: string | null;
  };
  station: {
    id: string;
    afanOromoName: string | null;
    amharicName: string | null;
    signPhoto: string | null;
    stampPhoto: string | null;
    stationAdminName: string | null;
  };
}

export default function Page({ params }: PageProps) {
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [data, setData] = useState<OrderData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({ show: false, type: "success", title: "", message: "" });

  const [confirmation, setConfirmation] = useState<{
    show: boolean;
    type: "approve" | "reject";
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    type: "approve",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Custom toast function
  const showToast = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Custom confirmation function
  const showConfirmation = (
    type: "approve" | "reject",
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    setConfirmation({ show: true, type, title, message, onConfirm });
  };

  useEffect(() => {
    async function fetchData() {
      const resolvedParams = await params;
      const ids = resolvedParams.ids || [];
      setOrderIds(ids);

      try {
        setIsLoading(true);
        const result = await getMultipleCardData(ids);

        if (result.status && result.data) {
          setData(result.data);
          // Print data to console one by one
          console.log("=== Multi-Print Data ===");
          console.log(`Total Citizens: ${result.totalCount}`);
          result.data.forEach((order: OrderData) => {
            console.log(`\n--- ${order.citizenLabel} ---`);
            console.log(`Citizen Number: ${order.citizenNumber}`);
            console.log(`Order ID: ${order.id}`);
            console.log(`Order Number: ${order.orderNumber}`);
            console.log(
              `Citizen Name: ${order.citizen.firstName} ${order.citizen.middleName} ${order.citizen.lastName}`
            );
            console.log(`Registration No: ${order.citizen.registralNo}`);
            console.log(`Phone: ${order.citizen.phone}`);
            console.log(`Order Type: ${order.orderType}`);
            console.log(`Order Status: ${order.orderStatus}`);
            console.log(`Created At (Ethiopian): ${order.ethiopianCreatedAt}`);
            console.log(
              `Station: ${order.station.afanOromoName} (${order.station.amharicName})`
            );
          });
        } else {
          setError(result.message || "Failed to fetch data");
          console.error("Error fetching multi-print data:", result.message);
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params]);

  // Generate PDF function for multiple cards
  const generatePDF = async () => {
    if (!data || data.length === 0) return;

    setIsGeneratingPDF(true);
    try {
      // Dynamic imports
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      // A4 size in mm: 210 x 297
      const doc = new jsPDF("portrait", "mm", "a4");

      // PVC card dimensions: 85.6mm x 53.98mm
      const cardWidth = 85.6;
      const cardHeight = 53.98;
      const cornerRadius = 3.18;

      // Position cards on A4 page - vertical layout
      const margin = 15;
      const spacing = 8; // Gap between citizens (vertical)
      const cardSpacing = 0.5; // Gap between front and back of same citizen

      // Capture the entire multi-card container
      const cardContainer = document.getElementById("multi-id-cards-print");
      if (cardContainer) {
        const canvas = await html2canvas(cardContainer, {
          scale: 4,
          backgroundColor: "#ffffff",
          removeContainer: true,
          allowTaint: true,
          useCORS: true,
          width: cardContainer.offsetWidth,
          height: cardContainer.offsetHeight,
        });
        const image = canvas.toDataURL("image/png", 1.0);

        // Calculate container dimensions for vertical layout
        const containerWidth = cardWidth * 2 + cardSpacing; // mm (front + back side by side)
        const containerHeight =
          cardHeight * data.length + spacing * (data.length - 1); // mm (vertical stack)
        doc.addImage(
          image,
          "PNG",
          margin,
          margin,
          containerWidth,
          containerHeight
        );
      }

      // Add cutting guides
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.2);

      // Draw borders for all cards in vertical layout
      const positions = [];
      for (let i = 0; i < data.length; i++) {
        const yPos = margin + (cardHeight + spacing) * i;
        positions.push(
          { x: margin, y: yPos }, // Front side
          { x: margin + cardWidth + cardSpacing, y: yPos } // Back side
        );
      }

      positions.forEach((pos) => {
        doc.rect(pos.x, pos.y, cardWidth, cardHeight);
      });

      // Add labels for vertical layout
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);

      for (let i = 0; i < data.length; i++) {
        const yPos = margin + (cardHeight + spacing) * i;
        const cardNumber = i + 1;
        doc.text(
          `CARD ${cardNumber} FRONT`,
          margin + cardWidth / 2 - 12,
          yPos + cardHeight + 5
        );
        doc.text(
          `CARD ${cardNumber} BACK`,
          margin + cardWidth + cardSpacing + cardWidth / 2 - 12,
          yPos + cardHeight + 5
        );
      }

      // Save PDF
      doc.save(`Multi_Citizen_Cards_${data.length}_cards.pdf`);

      showToast(
        "success",
        "📄 PDF Generated",
        `Successfully generated PDF with ${data.length} cards!`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast(
        "error",
        "❌ PDF Generation Failed",
        "Error generating PDF. Please try again."
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print function
  const printIdCards = () => {
    setIsPrinting(true);
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrinting(false);
        setIsPrintMode(false);
        showToast(
          "success",
          "🖨️ Print Dialog Opened",
          "Print dialog has been opened. Please configure your print settings."
        );
      }, 1000);
    }, 100);
  };

  // Approve multiple orders
  const handleApproveOrders = () => {
    if (!orderIds || orderIds.length === 0) return;

    showConfirmation(
      "approve",
      "✅ Confirm Approval",
      `Are you sure you want to approve ${orderIds.length} orders? This action will mark all selected orders as approved and cannot be undone.`,
      async () => {
        setIsApproving(true);
        try {
          const approveResult = await multiApprove(orderIds);
          if (approveResult.status) {
            showToast(
              "success",
              "✅ Orders Approved",
              `Successfully approved ${approveResult.count} orders!`
            );
            // Refresh the data
            const refreshResult = await getMultipleCardData(orderIds);
            if (refreshResult.status && refreshResult.data) {
              setData(refreshResult.data);
            }
          } else {
            showToast("error", "❌ Approval Failed", approveResult.message);
          }
        } catch (error) {
          console.error("Error approving orders:", error);
          showToast(
            "error",
            "❌ Error",
            "Error approving orders. Please try again."
          );
        } finally {
          setIsApproving(false);
        }
      }
    );
  };

  // Reject multiple orders
  const handleRejectOrders = () => {
    if (!orderIds || orderIds.length === 0) return;

    showConfirmation(
      "reject",
      "🚫 Confirm Rejection",
      `Are you sure you want to reject ${orderIds.length} orders? This action will mark all selected orders as rejected and cannot be undone.`,
      async () => {
        setIsRejecting(true);
        try {
          const rejectResult = await multiReject(orderIds);
          if (rejectResult.status) {
            showToast(
              "success",
              "🚫 Orders Rejected",
              `Successfully rejected ${rejectResult.count} orders!`
            );
            // Refresh the data
            const refreshResult = await getMultipleCardData(orderIds);
            if (refreshResult.status && refreshResult.data) {
              setData(refreshResult.data);
            }
          } else {
            showToast("error", "❌ Rejection Failed", rejectResult.message);
          }
        } catch (error) {
          console.error("Error rejecting orders:", error);
          showToast(
            "error",
            "❌ Error",
            "Error rejecting orders. Please try again."
          );
        } finally {
          setIsRejecting(false);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading citizen cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto p-6 max-w-6xl overflow-auto ${
        isPrintMode ? "print-only-cards" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <Link
            href={`/${
              orderIds[0] ? orderIds[0].split("/")[0] : ""
            }/dashboard/citizenCard`}
          >
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Multi-Print ID Cards
            </h1>
            <p className="text-muted-foreground">
              Printing {data?.length || 0} citizen card
              {(data?.length ?? 0) > 1 ? "s" : ""} on A4 paper
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{data?.length || 0} Cards</Badge>
          {data && data.length > 0 && (
            <>
              <Badge variant="outline">
                Print: {data[0]?.isPrinted || "PENDING"}
              </Badge>
              <Badge
                variant="outline"
                className={`${
                  data[0]?.isAccepted === "APPROVED"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : data[0]?.isAccepted === "REJECTED"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }`}
              >
                Verify: {data[0]?.isAccepted || "PENDING"}
              </Badge>
            </>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6 no-print">
        {/* <Button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="mr-2 h-4 w-4" />
          {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
        </Button> */}
        <Button onClick={printIdCards} variant="outline" disabled={isPrinting}>
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? "Printing..." : "Print Cards"}
        </Button>
        <Button
          onClick={() => setIsPrintMode(!isPrintMode)}
          variant={isPrintMode ? "default" : "ghost"}
          size="sm"
        >
          {isPrintMode ? "Exit Print Mode" : "Print Preview"}
        </Button>

        <Button
          onClick={handleApproveOrders}
          disabled={isApproving || isRejecting}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {isApproving ? "Approving..." : `Approve ${orderIds.length} Orders`}
        </Button>
        <Button
          onClick={handleRejectOrders}
          disabled={isApproving || isRejecting}
          variant="destructive"
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          {isRejecting ? "Rejecting..." : `Reject ${orderIds.length} Orders`}
        </Button>
      </div>

      {/* Verification Status Overview */}
      {/* {data && data.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Verification Status Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.map((order: OrderData) => (
              <div key={order.id} className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {order.citizenLabel}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      order.isAccepted === "APPROVED"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : order.isAccepted === "REJECTED"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }`}
                  >
                    {order.isAccepted || "PENDING"}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {order.citizen.firstName} {order.citizen.lastName}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Order: {order.orderNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Multi ID Card Preview */}
      <div className="print-container " style={{ maxWidth: "210mm" }}>
        <MultiIdCards data={data || []} isPrintMode={isPrintMode} />
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        /* Print preview flip styles */
        .print-preview-flip .multi-id-card-container {
          transform: rotateY(180deg);
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 210mm !important;
            height: 297mm !important;
          }

          /* Hide navigation and buttons when printing */
          .no-print {
            display: none !important;
          }

          /* Reset page margins and sizing */
          @page {
            margin: 0 !important;
            size: A4 portrait !important;
          }

          html,
          body {
            margin: 0 !important;
            padding: 5mm !important;
            background: white !important;
            font-size: 12px !important;
            overflow: visible !important;
          }

          /* Show only the print container */
          body * {
            visibility: hidden !important;
          }

          .print-container,
          .print-container * {
            visibility: visible !important;
          }

          .print-container {
            // background-color: red !important;
            position: absolute !important;
            left: 50% !important;
            top: 10mm !important;
            transform: translateX(-50%) !important;
            width: 200mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            // background: red !important;
            overflow: visible !important;
          }

          .multi-id-card-container {
            display: flex !important;
            flex-direction: column !important;
            gap: 8mm !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            transform: rotateY(180deg) !important;
            overflow: visible !important;
            position: relative !important;
          }

          .id-card-wrapper {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            flex-shrink: 0 !important;
            position: relative !important;
            display: flex !important;
            gap: 0.5mm !important;
          }

          .id-card {
            width: 85.6mm !important;
            height: 53.98mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            border-radius: 3.18mm !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
          }

          #front,
          #back {
            width: 85.6mm !important;
            height: 53.98mm !important;
            page-break-inside: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            background: white !important;
            transform: scale(1) !important;
            overflow: hidden !important;
            border-radius: 3.18mm !important;
            position: relative !important;
          }

          /* Allow overflow for barcode/signature visibility */
          #back {
            overflow: visible !important;
          }

          /* Ensure flipped content is fully visible */
          #front,
          #back {
            overflow: visible !important;
            position: relative !important;
          }

          #back > div {
            padding: 2mm !important;
          }

          #front .relative,
          #back .relative {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
          }

          /* Cutting guides around each card */
          .id-card::after {
            content: "" !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 85.6mm !important;
            height: 53.98mm !important;
            border: 0.12mm dashed rgba(0, 0, 0, 0.35) !important;
            pointer-events: none !important;
            box-sizing: border-box !important;
            border-radius: 3.18mm !important;
          }

          /* Ensure all content is visible */
          .multi-id-card-container *,
          #front *,
          #back * {
            visibility: visible !important;
          }

          /* Ensure images print correctly */
          #front img,
          #back img {
            max-width: 100% !important;
            visibility: visible !important;
          }

          /* Profile photo size for printing */
          #front .profile-photo,
          .profile-photo {
            width: 26mm !important;
            min-width: 26mm !important;
            max-width: 26mm !important;
            height: 28mm !important;
            min-height: 28mm !important;
            max-height: 28mm !important;
            object-fit: cover !important;
            border-radius: 2mm !important;
            display: block !important;
          }

          /* QR Code print styles */
          #back svg {
            max-width: 18mm !important;
            max-height: 18mm !important;
            width: 18mm !important;
            height: 18mm !important;
          }

          /* Text elements */
          .id-card p,
          .id-card h2,
          .id-card span,
          .id-card strong {
            visibility: visible !important;
            color: black !important;
          }

          /* Remove any rounded corners for print */
          .rounded-lg {
            border-radius: 3mm !important;
          }
        }

        /* Print mode styles for screen preview */
        .print-only-cards .no-print {
          opacity: 0.3;
          pointer-events: none;
        }

        /* Apply flip in print preview mode */
        .print-only-cards .multi-id-card-container {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Custom Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 transform transition-all duration-300 ${
            notification.show
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                notification.type === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmation.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    confirmation.type === "approve"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {confirmation.type === "approve" ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmation.title}
                  </h3>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {confirmation.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirmation((prev) => ({ ...prev, show: false }))
                  }
                  disabled={isApproving || isRejecting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setConfirmation((prev) => ({ ...prev, show: false }));
                    confirmation.onConfirm();
                  }}
                  disabled={isApproving || isRejecting}
                  className={
                    confirmation.type === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {isApproving || isRejecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {confirmation.type === "approve"
                        ? "Approving..."
                        : "Rejecting..."}
                    </>
                  ) : (
                    <>
                      {confirmation.type === "approve" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve Orders
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Reject Orders
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// MultiIdCards component for displaying multiple ID cards
interface MultiIdCardsProps {
  data: OrderData[];
  isPrintMode: boolean;
}

function MultiIdCards({ data, isPrintMode }: MultiIdCardsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Cards to Display</h3>
          <p className="text-muted-foreground">
            No citizen card data available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`multi-id-card-container flex flex-col gap-4 ${
        isPrintMode ? "print-preview-flip" : ""
      }`}
      id="multi-id-cards-print"
      // style={{
      //   maxWidth: "200mm",
      //   gap: "8mm",
      // }}
    >
      {data.slice(0, 4).map((order: OrderData) => (
        <div
          key={order.id}
          className="id-card-wrapper- px-10 grid grid-cols-2 gap-5 "
        >
          <IdCard
            citizen={order.citizen}
            station={order.station}
            ethiopianCreatedAt={order.ethiopianCreatedAt}
            citizenNumber={order.citizenNumber}
            citizenLabel={order.citizenLabel}
            isAccepted={order.isAccepted}
            isPrintMode={isPrintMode}
          />
        </div>
      ))}
    </div>
  );
}

// Individual IdCard component
interface IdCardProps {
  citizen: {
    registralNo: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    gender: string;
    dateOfBirth: Date;
    placeOfBirth: string;
    occupation: string | null;
    phone: string;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    relationship: string | null;
    profilePhoto: string | null;
    barcode: string;
  };
  station: {
    afanOromoName: string | null;
    amharicName: string | null;
    signPhoto: string | null;
    stampPhoto: string | null;
    stationAdminName: string | null;
  };
  ethiopianCreatedAt?: string;
  citizenNumber?: number;
  citizenLabel?: string;
  isAccepted?: string;
  isPrintMode: boolean;
}

function IdCard({
  citizen,
  station,
  ethiopianCreatedAt,
  citizenNumber,
  citizenLabel,
  isAccepted,
  isPrintMode,
}: IdCardProps) {
  const formatImageUrl = (fileName: string | null | undefined): string => {
    if (!fileName)
      return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    return `/api/filedata/${encodeURIComponent(fileName)}`;
  };

  const [profileImgSrc, setProfileImgSrc] = useState(
    formatImageUrl(citizen.profilePhoto)
  );
  const [stampImgSrc, setStampImgSrc] = useState(
    formatImageUrl(station?.stampPhoto)
  );
  const [signImgSrc, setSignImgSrc] = useState(
    formatImageUrl(station?.signPhoto)
  );

  // Update image sources if data changes
  useEffect(() => {
    setProfileImgSrc(formatImageUrl(citizen.profilePhoto));
    setStampImgSrc(formatImageUrl(station?.stampPhoto));
    setSignImgSrc(formatImageUrl(station?.signPhoto));
  }, [citizen.profilePhoto, station?.stampPhoto, station?.signPhoto]);

  const handleImageError = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    );
  };

  // Calculate expiration date (Ethiopian created date + 1 year)
  const calculateEthiopianExpirationDate = (
    ethiopianDate: string | undefined
  ): string => {
    if (!ethiopianDate) return "N/A";
    try {
      // Parse Ethiopian date format: dd/mm/yyyy
      const parts = ethiopianDate.split("/");
      if (parts.length !== 3) return "N/A";

      const day = parts[0];
      const month = parts[1];
      const year = parseInt(parts[2], 10);

      // Add 1 year
      const expirationYear = year + 1;

      // Return formatted expiration date
      return `${day}/${month}/${expirationYear}`;
    } catch (error) {
      console.error("Error calculating expiration date:", error);
      return "N/A";
    }
  };

  const ethiopianExpirationDate =
    calculateEthiopianExpirationDate(ethiopianCreatedAt);

  return (
    <div className="space-y-2">
      {/* Verification Status Indicator */}
      {!isPrintMode && (
        <div className="flex items-center justify-center">
          <Badge
            variant="outline"
            className={`text-xs px-3 py-1 ${
              isAccepted === "APPROVED"
                ? "bg-green-100 text-green-800 border-green-200"
                : isAccepted === "REJECTED"
                ? "bg-red-100 text-red-800 border-red-200"
                : "bg-yellow-100 text-yellow-800 border-yellow-200"
            }`}
          >
            {isAccepted === "APPROVED"
              ? "✅ VERIFIED"
              : isAccepted === "REJECTED"
              ? "❌ REJECTED"
              : "⏳ PENDING VERIFICATION"}
          </Badge>
        </div>
      )}

      <div className="flex gap-1 flex-nowrap" style={{ flexWrap: "nowrap" }}>
        {/* Front Side */}
        <div className="id-card-wrapper">
          <div
            id="front"
            className="relative bg-white rounded-lg overflow-hidden id-card"
            style={{
              width: "85.6mm",
              height: "53.98mm",
              borderRadius: "3.18mm",
            }}
          >
            {/* Background Image */}
            <Image
              src="/frontside.png"
              alt="Front Background"
              fill
              className="object-cover"
              priority
            />

            {/* Content Overlay */}
            <div className="relative z-10 p-1">
              {/* Header */}
              <div className="flex justify-between items-center mb-0">
                <Image
                  src="/oflag.png"
                  alt="Oromia Flag"
                  width={48}
                  height={30}
                />
                <div className="text-center">
                  <h2 className="text-[10px] font-bold">
                    {station?.afanOromoName || "Station Name"}
                  </h2>
                  <h2 className="text-[10px] font-bold">
                    {station?.amharicName || "የጣቢያ ስም"}
                  </h2>
                </div>
                <Image
                  src="/ethflag.png"
                  alt="Ethiopian Flag"
                  width={48}
                  height={30}
                />
              </div>

              {/* Divider */}
              <hr className="my-2 border-t-2 border-gray-400" />

              {/* Profile and Info */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={profileImgSrc}
                    alt="Profile"
                    width={96}
                    height={120}
                    className="profile-photo h-24 w-24 border-2 border-gray-300 rounded object-cover"
                    onError={() => handleImageError(setProfileImgSrc)}
                    unoptimized
                  />
                  <div className="mt-1">
                    <p className="text-xs" style={{ fontSize: "10px" }}>
                      L.G/መ.ቁ: {citizen.registralNo}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-xs" style={{ fontSize: "9px" }}>
                    Maqaa Guutuu/ሙሉ ስም:
                    <br />
                    <strong>
                      {citizen.firstName} {citizen.middleName}{" "}
                      {citizen.lastName}
                    </strong>
                  </p>
                  <p className="text-xs" style={{ fontSize: "9px" }}>
                    Saalaa/ጾታ: <strong>{citizen.gender}</strong>
                  </p>
                  <p className="text-xs" style={{ fontSize: "9px" }}>
                    Bara dhalootaa/የትውልድ ዘመን:
                    <br />
                    <strong>
                      {citizen.dateOfBirth
                        ? format(new Date(citizen.dateOfBirth), "dd/MM/yyyy")
                        : "N/A"}{" "}
                      EC
                    </strong>
                  </p>
                  <p className="text-xs" style={{ fontSize: "9px" }}>
                    Bakka Dhaloota/የትውልድ ቦታ:
                    <br />
                    <strong>{citizen.placeOfBirth}</strong>
                  </p>
                  <p className="text-xs" style={{ fontSize: "9px" }}>
                    Hojii/ሥራ: <strong>{citizen.occupation}</strong>
                  </p>
                </div>
              </div>

              {/* Stamp */}
              {station?.stampPhoto && (
                <div className="absolute bottom-1 right-1">
                  <Image
                    src={stampImgSrc}
                    alt="Official Stamp"
                    width={75}
                    height={75}
                    className="object-contain"
                    onError={() => handleImageError(setStampImgSrc)}
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="id-card-wrapper">
          <div
            id="back"
            className="relative bg-white rounded-lg overflow-hidden id-card"
            style={{
              width: "85.6mm",
              height: "53.98mm",
              borderRadius: "3.18mm",
            }}
          >
            {/* Background Image */}
            <Image
              src="/Backside.png"
              alt="Back Background"
              fill
              className="object-cover"
              priority
            />

            {/* Content Overlay */}
            <div className="relative z-10 p-2">
              <div
                className="flex justify-between items-start mb-2"
                style={{ alignItems: "center" }}
              >
                <div style={{ flex: 1 }}>
                  <p className="text-xs mb-1" style={{ fontSize: "9px" }}>
                    Guyyaa Kenname/የተሰጠበት ቀን:
                    <br />
                    <strong>{ethiopianCreatedAt || "N/A"}</strong>
                  </p>
                  <p className="text-xs" style={{ fontSize: "9px" }}>
                    Guyyaa dhumatu/የሚያበቃበት ቀን:
                    <br />
                    <strong>{ethiopianExpirationDate}</strong>
                  </p>
                </div>
                <div
                  style={{
                    width: "36mm",
                    minWidth: "36mm",
                    marginLeft: "6mm",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 50,
                  }}
                >
                  {citizen.barcode && (
                    <div
                      style={{
                        width: "34mm",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <QRCodeSVG
                        value={citizen.barcode}
                        size={70}
                        level="M"
                        includeMargin={false}
                        bgColor="transparent"
                        fgColor="#000000"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 mb-2">
                <p className="text-xs" style={{ fontSize: "9px" }}>
                  Bilbila Jirata/የነዋሪው ሰልክ: <strong>{citizen.phone}</strong>
                </p>
                <p className="text-xs" style={{ fontSize: "9px" }}>
                  Wamama yeroo Rakoo/የአደጋ ጊዜ ተጠሪ:{" "}
                  <strong>{citizen.emergencyContact}</strong>
                </p>
                <p className="text-xs" style={{ fontSize: "9px" }}>
                  Firumma/ግንኙነት: <strong>{citizen.relationship}</strong>
                </p>
                <p className="text-xs" style={{ fontSize: "9px" }}>
                  Phone/ስልክ: <strong>{citizen.emergencyPhone}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs" style={{ fontSize: "8px" }}>
                  Yoo hatame ykn bade bulchiinsa qunnamuun kaardii bade
                  hatattamaan gabaasaa.
                </p>
                <p className="text-xs" style={{ fontSize: "8px" }}>
                  ከተሰረቀ ወይም ከጠፋ እባክዎን አስተዳደሩን ያነጋግሩ እና የጠፋውን ካርድ ወዲያውኑ ያሳውቁ።
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ fontSize: "9px", marginTop: "4px" }}
                >
                  {station?.stationAdminName || "Station Administrator"}
                </p>
              </div>

              {/* Signature Image */}
              {station?.signPhoto && (
                <div className="absolute bottom-1 right-1 p-1">
                  <Image
                    src={signImgSrc}
                    alt="Official Signature"
                    width={70}
                    height={35}
                    className="object-contain"
                    onError={() => handleImageError(setSignImgSrc)}
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
