"use client";

import React, { useState, useEffect } from "react";
import { useData } from "@/hooks/useData";
import { getCardData } from "@/actions/superPrintral/citizenCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";

// Dynamic imports for client-side only libraries
// const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

interface PageProps {
  params: Promise<{ lang: string; orderId: string }>;
}

export default function GenerateCardPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    lang: string;
    orderId: string;
  } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch card data only when we have orderId
  const orderId = resolvedParams?.orderId || "";
  const [cardData, isLoading] = useData(getCardData, () => {}, orderId);

  // Generate PDF function
  const generatePDF = async () => {
    if (!cardData || !("citizen" in cardData) || !cardData.citizen) return;

    setIsGeneratingPDF(true);
    try {
      // Dynamic imports
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      // A4 size in mm: 210 x 297
      const doc = new jsPDF("portrait", "mm", "a4");

      // PVC card dimensions (user-provided): 3.37in x 2.125in => 85.6mm x 53.9mm
      const cardWidth = 85.6; // mm (3.37 inches)
      const cardHeight = 53.98; // mm (2.125 inches)
      const cornerRadius = 3.18; // mm (0.125 inches)

      // Position cards on A4 page
      const margin = 15;
      const spacing = 8;

      // Capture the entire ID card container
      const cardContainer = document.getElementById("id-cards-print");
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

        // When capturing the whole container we still want to place it at the card mm sizes
        const containerWidth = cardWidth * 2 + spacing; // mm
        doc.addImage(image, "PNG", margin, margin, containerWidth, cardHeight);
      } else {
        // Fallback to individual card capture
        const frontElement = document.getElementById("front");
        const backElement = document.getElementById("back");

        if (frontElement) {
          const frontCanvas = await html2canvas(frontElement, {
            scale: 4,
            backgroundColor: "#ffffff",
            removeContainer: true,
            allowTaint: true,
            useCORS: true,
          });
          const frontImage = frontCanvas.toDataURL("image/png", 1.0);
          // Place front on left
          doc.addImage(
            frontImage,
            "PNG",
            margin,
            margin,
            cardWidth,
            cardHeight
          );
        }

        if (backElement) {
          const backCanvas = await html2canvas(backElement, {
            scale: 4,
            backgroundColor: "#ffffff",
            removeContainer: true,
            allowTaint: true,
            useCORS: true,
          });
          const backImage = backCanvas.toDataURL("image/png", 1.0);
          // Place back on right
          doc.addImage(
            backImage,
            "PNG",
            margin + cardWidth + spacing,
            margin,
            cardWidth,
            cardHeight
          );
        }
      }

      // Add cutting guides (optional)
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.2);

      // Front card border (rounded if supported)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (doc as any).roundedRect === "function") {
        // jsPDF roundedRect(x, y, w, h, rx, ry, style?)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc as any).roundedRect(
          margin,
          margin,
          cardWidth,
          cardHeight,
          cornerRadius,
          cornerRadius
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc as any).roundedRect(
          margin + cardWidth + spacing,
          margin,
          cardWidth,
          cardHeight,
          cornerRadius,
          cornerRadius
        );
      } else {
        doc.rect(margin, margin, cardWidth, cardHeight);
        doc.rect(margin + cardWidth + spacing, margin, cardWidth, cardHeight);
      }

      // Add labels
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("FRONT", margin + cardWidth / 2 - 5, margin + cardHeight + 5);
      doc.text(
        "BACK",
        margin + cardWidth + spacing + cardWidth / 2 - 4,
        margin + cardHeight + 5
      );

      // Save PDF
      doc.save(
        `${validCardData.citizen.firstName}_${validCardData.citizen.lastName}_ID_Card.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print function
  const printIdCard = () => {
    setIsPrinting(true);
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrinting(false);
        setIsPrintMode(false);
      }, 1000);
    }, 100);
  };

  if (!resolvedParams) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading || (!cardData && orderId)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">Loading card data...</div>
        </div>
      </div>
    );
  }

  if (!cardData || !("citizen" in cardData) || !cardData.citizen) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Card Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The requested citizen card could not be found.
          </p>
          <Link href={`/${resolvedParams.lang}/dashboard`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // TypeScript type assertion after null checks
  interface ValidCardData {
    id: string;
    orderNumber: string;
    orderStatus: string;
    orderType: string;
    citizen: {
      id: string;
      registralNo: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      phone: string;
      profilePhoto: string | null;
      occupation: string;
      dateOfBirth: Date;
      gender: string;
      barcode: string;
      placeOfBirth: string;
      emergencyContact: string;
      emergencyPhone: string;
      relationship: string;
    };
    station: {
      id: string;
      afanOromoName: string;
      amharicName: string;
      signPhoto: string | null;
      stampPhoto: string | null;
      stationAdminName: string;
    };
  }

  const validCardData = cardData as ValidCardData;
  const { citizen, station } = validCardData;

  return (
    <div
      className={`container mx-auto p-6 max-w-6xl overflow-auto ${
        isPrintMode ? "print-only-cards" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/${resolvedParams.lang}/dashboard/citizenCard`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Generate ID Card
            </h1>
            <p className="text-muted-foreground">
              Order #{validCardData.orderNumber} • {citizen.firstName}{" "}
              {citizen.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              validCardData.orderStatus === "APPROVED" ? "default" : "secondary"
            }
          >
            {validCardData.orderStatus}
          </Badge>
          <Badge
            variant={
              validCardData.orderType === "URGENT" ? "destructive" : "outline"
            }
          >
            {validCardData.orderType}
          </Badge>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6 no-print">
        <Button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="mr-2 h-4 w-4" />
          {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
        </Button>
        <Button onClick={printIdCard} variant="outline" disabled={isPrinting}>
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? "Printing..." : "Print Card"}
        </Button>
        <Button
          onClick={() => setIsPrintMode(!isPrintMode)}
          variant={isPrintMode ? "default" : "ghost"}
          size="sm"
        >
          {isPrintMode ? "Exit Print Mode" : "Print Preview"}
        </Button>
      </div>

      {/* ID Card Preview */}
      <div className="print-container" style={{ maxWidth: "210mm" }}>
        <IdCard citizen={citizen} station={station} />
      </div>

      {/* Print Styles */}
      <style jsx global>{`
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

          /* Reset page margins and sizing, and remove headers/footers */
          @page {
            margin: 0 !important;
            size: A4 portrait !important;
          }

          html,
          body {
            margin: 0 !important;
            padding: 15mm 10mm !important; /* Add padding to compensate for margin removal */
            background: white !important;
            font-size: 12px !important;
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
            position: absolute !important;
            left: 10mm !important; /* Align with body padding */
            top: 15mm !important; /* Align with body padding */
            width: 190mm !important; /* A4 width (210mm) - 2*10mm padding */
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .id-card-container {
            display: flex !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            gap: 8mm !important;
            width: auto !important; /* Let it be defined by content */
            margin: 0 !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
          }

          .id-card-wrapper {
            width: 85.6mm !important;
            height: 53.98mm !important;
            margin: 0 !important;
            padding: 0 !important;
            flex-shrink: 0 !important;
            position: relative !important;
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
            padding-right: 4mm !important;
          }

          #front .relative,
          #back .relative {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
          }

          /* Cutting guides around each card */
          .id-card-wrapper::after {
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
          .id-card-container *,
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

          /* Increase profile photo size for printing - Override all conflicting styles */
          #front .profile-photo,
          .profile-photo {
            width: 26mm !important;
            min-width: 26mm !important;
            max-width: 26mm !important;
            height: 34mm !important;
            min-height: 34mm !important;
            max-height: 34mm !important;
            object-fit: cover !important;
            border-radius: 2mm !important;
            display: block !important;
          }

          /* QR Code print styles */
          #back svg {
            max-width: 24mm !important;
            max-height: 24mm !important;
            width: 24mm !important;
            height: 24mm !important;
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
      `}</style>
    </div>
  );
}

// Separate IdCard component for better management
interface IdCardProps {
  citizen: {
    registralNo: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: string;
    dateOfBirth: Date;
    placeOfBirth: string;
    occupation: string;
    phone: string;
    emergencyContact: string;
    emergencyPhone: string;
    relationship: string;
    profilePhoto: string | null;
    barcode: string;
  };
  station: {
    afanOromoName: string;
    amharicName: string;
    signPhoto: string | null;
    stampPhoto: string | null;
    stationAdminName: string;
  };
}

function IdCard({ citizen, station }: IdCardProps) {
  const formatImageUrl = (fileName: string | null | undefined): string => {
    // Use a transparent pixel as a placeholder to avoid showing a broken image icon
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
    // Fallback to a transparent pixel on error
    setter(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    );
  };

  return (
    <div
      className="id-card-container flex gap-4 flex-nowrap"
      id="id-cards-print"
      style={{ flexWrap: "nowrap" }}
    >
      {/* Front Side */}
      <div className="id-card-wrapper">
        <div
          id="front"
          className="relative bg-white rounded-lg overflow-hidden id-card"
          style={{ width: "85.6mm", height: "53.98mm", borderRadius: "3.18mm" }}
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
                  onError={() => handleImageError(setProfileImgSrc)} // Fallback on error
                  unoptimized // Important for html2canvas to render correctly
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
                    {citizen.firstName} {citizen.middleName} {citizen.lastName}
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
          style={{ width: "85.6mm", height: "53.98mm", borderRadius: "3.18mm" }}
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
          <div className="relative z-10 p-4">
            <div
              className="flex justify-between items-start mb-2"
              style={{ alignItems: "center" }}
            >
              <div style={{ flex: 1 }}>
                <p className="text-xs mb-1" style={{ fontSize: "9px" }}>
                  Guyyaa Kenname/የተሰጠበት ቀን:
                  <br />
                  <strong>12/12/2022</strong>
                </p>
                <p className="text-xs" style={{ fontSize: "9px" }}>
                  Guyyaa dhumatu/የሚያበቃበት ቀን:
                  <br />
                  <strong>12/12/2022</strong>
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
                      size={90}
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
  );
}
