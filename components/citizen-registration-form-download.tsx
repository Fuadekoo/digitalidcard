"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { getStationForForm } from "@/actions/stationRegistral/downloadForm";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ButtonSpinner } from "@/components/ui/spinner";

interface StationData {
  code: string;
  afanOromoName: string;
  amharicName: string;
  stationAdminName: string;
}

export default function CitizenRegistrationFormDownload() {
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        const result = await getStationForForm();
        if (result.status && result.data) {
          setStationData(result.data);
        } else {
          toast.error("Failed to load station information");
        }
      } catch (error) {
        console.error("Error fetching station data:", error);
        toast.error("Error loading station information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStationData();
  }, []);

  const generatePDF = async () => {
    if (!stationData) {
      toast.error("Station data not available");
      return;
    }

    setIsGenerating(true);

    // Log station data for debugging
    console.log("Station Data for PDF:", stationData);

    try {
      // Create new PDF document (A4 size: 210mm x 297mm)
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Colors
      const primaryColor = [59, 130, 246]; // Blue
      const textColor = [31, 41, 55]; // Dark gray
      const lightGray = [229, 231, 235];

      // Compact header background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 20, "F");

      // Station information header
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CITIZEN REGISTRATION FORM", pageWidth / 2, 13, {
        align: "center",
      });

      // Compact station info with Amharic text using html2canvas
      let yPosition = 50;

      try {
        // Create hidden HTML element for station info with Amharic text
        const stationInfoDiv = document.createElement("div");
        stationInfoDiv.style.position = "absolute";
        stationInfoDiv.style.left = "-9999px";
        stationInfoDiv.style.top = "0";
        stationInfoDiv.style.width = `${contentWidth * 3.78}px`;
        stationInfoDiv.style.backgroundColor = "#e5e7eb";
        stationInfoDiv.style.padding = "8px 10px";
        stationInfoDiv.style.borderRadius = "4px";
        stationInfoDiv.style.fontFamily = "Arial, sans-serif";
        stationInfoDiv.innerHTML = `
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px; color: #1f2937;">
            Station Information:
          </div>
          <div style="font-size: 12px; color: #1f2937; line-height: 1.6;">
            <div><strong>Station Code:</strong> ${stationData.code}</div>
            <div><strong>Station Name (አማርኛ):</strong> ${stationData.amharicName}</div>
            <div><strong>Station Name (Afan Oromo):</strong> ${stationData.afanOromoName}</div>
            <div><strong>Station Admin:</strong> ${stationData.stationAdminName}</div>
          </div>
        `;
        document.body.appendChild(stationInfoDiv);

        // Convert HTML to canvas and then to image
        const canvas = await html2canvas(stationInfoDiv, {
          scale: 2,
          backgroundColor: "#e5e7eb",
          logging: false,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");

        // Remove the temporary div
        document.body.removeChild(stationInfoDiv);

        // Add the image to PDF
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, "PNG", margin, 25, imgWidth, imgHeight);

        yPosition = 25 + imgHeight + 2;
      } catch (htmlError) {
        console.warn(
          "html2canvas failed, using fallback text rendering:",
          htmlError
        );

        // Fallback: Text rendering with larger font
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.roundedRect(margin, 25, contentWidth, 25, 2, 2, "F");

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Station Information:", margin + 3, 31);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Station Code: ${stationData.code}`, margin + 3, 37);
        doc.text(
          `Station Name (አማርኛ): ${stationData.amharicName}`,
          margin + 3,
          42
        );
        doc.text(
          `Station Name (Afan Oromo): ${stationData.afanOromoName}`,
          margin + 3,
          47
        );

        yPosition = 52;
      }

      // Instructions (compact)
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Fill all fields clearly. Use CAPITAL LETTERS.",
        margin,
        yPosition
      );
      yPosition += 5;

      // Section 1: Personal Information with Photo
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, yPosition, contentWidth, 5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("1. PERSONAL INFORMATION", margin + 2, yPosition + 3.5);
      yPosition += 8;

      // Photo placeholder on the right
      const photoX = margin + contentWidth - 32;
      const photoY = yPosition;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(photoX, photoY, 30, 40);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text("PHOTO", photoX + 15, photoY + 18, { align: "center" });
      doc.text("3x4 cm", photoX + 15, photoY + 23, { align: "center" });
      doc.setFontSize(6);
      doc.text("Attach Here", photoX + 15, photoY + 28, { align: "center" });

      // Form fields (with larger font)
      const contentWithPhoto = contentWidth - 35; // Space for photo

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      // First Name
      doc.text("First Name / Maqaa Duraa:", margin, yPosition);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin + 70, yPosition, margin + contentWithPhoto, yPosition);
      yPosition += 10;

      // Middle Name
      doc.text("Middle Name / Maqaa Abbaa:", margin, yPosition);
      doc.line(margin + 75, yPosition, margin + contentWithPhoto, yPosition);
      yPosition += 10;

      // Last Name
      doc.text("Last Name / Maqaa Maatii:", margin, yPosition);
      doc.line(margin + 70, yPosition, margin + contentWithPhoto, yPosition);
      yPosition += 10;

      // Gender with checkboxes
      doc.text("Gender / Saalaa:", margin, yPosition);
      const genderX = margin + 55;
      // Male checkbox
      doc.rect(genderX, yPosition - 3, 3, 3);
      doc.setFontSize(10);
      doc.text("Male", genderX + 5, yPosition);
      // Female checkbox
      doc.rect(genderX + 30, yPosition - 3, 3, 3);
      doc.text("Female", genderX + 35, yPosition);
      // Other checkbox
      doc.rect(genderX + 65, yPosition - 3, 3, 3);
      doc.text("Other", genderX + 70, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      // Date of Birth
      doc.text("Date of Birth / Guyyaa Dhaloota:", margin, yPosition);
      doc.line(margin + 85, yPosition, margin + contentWithPhoto, yPosition);
      yPosition += 10;

      // Place of Birth
      doc.text("Place of Birth / Bakka Dhaloota:", margin, yPosition);
      doc.line(margin + 85, yPosition, margin + contentWithPhoto, yPosition);
      yPosition += 10;

      // Occupation
      doc.text("Occupation / Hojii:", margin, yPosition);
      doc.line(margin + 60, yPosition, margin + contentWithPhoto, yPosition);
      yPosition += 8;

      // Section 2: Contact Information
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, yPosition, contentWidth, 5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("2. CONTACT INFORMATION", margin + 2, yPosition + 3.5);
      yPosition += 8;

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      // Phone Number
      doc.text("Phone Number / Lakkoofsa Bilbilaa:", margin, yPosition);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin + 90, yPosition, margin + contentWidth, yPosition);
      yPosition += 10;

      // Alternative Phone
      doc.text("Alternative Phone:", margin, yPosition);
      doc.line(margin + 55, yPosition, margin + contentWidth, yPosition);
      yPosition += 10;

      // Current Address
      doc.text("Current Address / Teessoo:", margin, yPosition);
      doc.line(margin + 75, yPosition, margin + contentWidth, yPosition);
      yPosition += 8;

      // Section 3: Emergency Contact (compact)
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, yPosition, contentWidth, 5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("3. EMERGENCY CONTACT", margin + 2, yPosition + 3.5);
      yPosition += 8;

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      // Emergency Contact Name
      doc.text("Emergency Contact / Nama Bilbifamu:", margin, yPosition);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin + 100, yPosition, margin + contentWidth, yPosition);
      yPosition += 10;

      // Relationship
      doc.text("Relationship / Firumaa:", margin, yPosition);
      doc.line(margin + 70, yPosition, margin + contentWidth, yPosition);
      yPosition += 10;

      // Emergency Phone
      doc.text("Emergency Phone / Bilbilaa:", margin, yPosition);
      doc.line(margin + 80, yPosition, margin + contentWidth, yPosition);
      yPosition += 8;

      // Signature fields (removed declaration)
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("Signature:", margin, yPosition);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin + 32, yPosition, margin + 90, yPosition);
      doc.text("Date:", margin + 100, yPosition);
      doc.line(margin + 118, yPosition, margin + contentWidth, yPosition);
      yPosition += 10;

      // Office use only section (on same page)
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.roundedRect(margin, yPosition, contentWidth, 28, 2, 2, "F");

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("FOR OFFICE USE ONLY", margin + 3, yPosition + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      yPosition += 10;

      doc.text("Registration No:", margin + 3, yPosition);
      doc.line(
        margin + 45,
        yPosition,
        margin + contentWidth / 2 - 2,
        yPosition
      );
      doc.text("Date:", margin + contentWidth / 2 + 5, yPosition);
      doc.line(
        margin + contentWidth / 2 + 20,
        yPosition,
        margin + contentWidth - 3,
        yPosition
      );
      yPosition += 8;

      doc.text("Registered By:", margin + 3, yPosition);
      doc.line(margin + 40, yPosition, margin + contentWidth - 3, yPosition);
      yPosition += 8;

      doc.text("Verification Status:", margin + 3, yPosition);
      doc.line(margin + 48, yPosition, margin + contentWidth - 3, yPosition);

      // Save the PDF
      const fileName = `Citizen_Registration_Form_${
        stationData.code
      }_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success("Registration form downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled variant="outline" size="sm">
        <ButtonSpinner size={16} />
        <span className="ml-2">Loading...</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={generatePDF}
      disabled={!stationData || isGenerating}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <ButtonSpinner size={16} />
          <span className="ml-2">Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <FileText className="h-4 w-4" />
          Form
        </>
      )}
    </Button>
  );
}
