"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { getStationForForm } from "@/actions/stationRegistral/downloadForm";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

      // Add header background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 35, "F");

      // Add station logo/emblem area (placeholder)
      doc.setFillColor(255, 255, 255);
      doc.circle(pageWidth / 2, 17.5, 12, "F");

      // Station information header
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("CITIZEN REGISTRATION FORM", pageWidth / 2, 42, {
        align: "center",
      });

      // Try to render station info with Amharic text using html2canvas
      let yPosition = 88;

      try {
        // Create hidden HTML element for station info with Amharic text
        const stationInfoDiv = document.createElement("div");
        stationInfoDiv.style.position = "absolute";
        stationInfoDiv.style.left = "-9999px";
        stationInfoDiv.style.top = "0";
        stationInfoDiv.style.width = `${contentWidth * 3.78}px`; // Convert mm to px (1mm ≈ 3.78px)
        stationInfoDiv.style.backgroundColor = "#e5e7eb";
        stationInfoDiv.style.padding = "15px";
        stationInfoDiv.style.borderRadius = "8px";
        stationInfoDiv.style.fontFamily = "Arial, sans-serif";
        stationInfoDiv.innerHTML = `
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">
            Station Information:
          </div>
          <div style="font-size: 12px; color: #1f2937; line-height: 1.8;">
            <div><strong>Station Code:</strong> ${stationData.code}</div>
            <div><strong>Station Name (Amharic):</strong> ${stationData.amharicName}</div>
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
        doc.addImage(imgData, "PNG", margin, 50, imgWidth, imgHeight);

        yPosition = 50 + imgHeight + 5;
      } catch (htmlError) {
        console.warn(
          "html2canvas failed, using fallback text rendering:",
          htmlError
        );

        // Fallback: Use basic text rendering
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.roundedRect(margin, 50, contentWidth, 30, 2, 2, "F");

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Station Information:", margin + 5, 57);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Station Code: ${stationData.code}`, margin + 5, 63);
        doc.text(
          `Station Name (Amharic): ${stationData.amharicName}`,
          margin + 5,
          68
        );
        doc.text(
          `Station Name (Afan Oromo): ${stationData.afanOromoName}`,
          margin + 5,
          73
        );
        doc.text(
          `Station Admin: ${stationData.stationAdminName}`,
          margin + 5,
          78
        );

        yPosition = 88;
      }

      // Instructions
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Please fill out all required fields clearly and completely. Use CAPITAL LETTERS.",
        margin,
        yPosition
      );
      yPosition += 8;

      // Section 1: Personal Information
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, yPosition, contentWidth, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("1. PERSONAL INFORMATION", margin + 3, yPosition + 5);
      yPosition += 12;

      // Form fields
      const fields = [
        { label: "First Name / Maqaa Duraa:", width: contentWidth / 2 - 2 },
        { label: "Middle Name / Maqaa Abbaa:", width: contentWidth / 2 - 2 },
        { label: "Last Name / Maqaa Maatii:", width: contentWidth },
        {
          label: "Gender / Saalaa (Male/Female/Other):",
          width: contentWidth / 2 - 2,
        },
        {
          label: "Date of Birth / Guyyaa Dhaloota:",
          width: contentWidth / 2 - 2,
        },
        { label: "Place of Birth / Bakka Dhaloota:", width: contentWidth },
        { label: "Occupation / Hojii:", width: contentWidth },
      ];

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      fields.forEach((field, index) => {
        const isHalfWidth = field.width < contentWidth;
        const xPos =
          isHalfWidth && index % 2 === 1
            ? margin + contentWidth / 2 + 2
            : margin;

        doc.text(field.label, xPos, yPosition);
        doc.setDrawColor(200, 200, 200);
        doc.line(xPos, yPosition + 2, xPos + field.width, yPosition + 2);

        if (!isHalfWidth || index % 2 === 1) {
          yPosition += 10;
        }
      });

      yPosition += 5;

      // Section 2: Contact Information
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, yPosition, contentWidth, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("2. CONTACT INFORMATION", margin + 3, yPosition + 5);
      yPosition += 12;

      const contactFields = [
        {
          label: "Phone Number / Lakkoofsa Bilbilaa:",
          width: contentWidth / 2 - 2,
        },
        { label: "Alternative Phone:", width: contentWidth / 2 - 2 },
        { label: "Current Address / Teessoo:", width: contentWidth },
      ];

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      contactFields.forEach((field, index) => {
        const isHalfWidth = field.width < contentWidth;
        const xPos =
          isHalfWidth && index % 2 === 1
            ? margin + contentWidth / 2 + 2
            : margin;

        doc.text(field.label, xPos, yPosition);
        doc.setDrawColor(200, 200, 200);
        doc.line(xPos, yPosition + 2, xPos + field.width, yPosition + 2);

        if (!isHalfWidth || index % 2 === 1) {
          yPosition += 10;
        }
      });

      yPosition += 5;

      // Section 3: Emergency Contact
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, yPosition, contentWidth, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("3. EMERGENCY CONTACT INFORMATION", margin + 3, yPosition + 5);
      yPosition += 12;

      const emergencyFields = [
        {
          label: "Emergency Contact Name / Maqaa Nama Bilbifamu:",
          width: contentWidth,
        },
        { label: "Relationship / Firumaa:", width: contentWidth / 2 - 2 },
        { label: "Emergency Phone / Bilbilaa:", width: contentWidth / 2 - 2 },
      ];

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      emergencyFields.forEach((field, index) => {
        const isHalfWidth = field.width < contentWidth;
        const xPos =
          isHalfWidth && index % 2 === 1
            ? margin + contentWidth / 2 + 2
            : margin;

        doc.text(field.label, xPos, yPosition);
        doc.setDrawColor(200, 200, 200);
        doc.line(xPos, yPosition + 2, xPos + field.width, yPosition + 2);

        if (!isHalfWidth || index % 2 === 1) {
          yPosition += 10;
        }
      });

      yPosition += 10;

      // Photo placeholder
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition, 35, 45);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Attach Photo", margin + 17.5, yPosition + 22.5, {
        align: "center",
      });
      doc.text("3x4 cm", margin + 17.5, yPosition + 27, { align: "center" });

      // Declaration
      yPosition += 50;
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text("Declaration / Labsii:", margin, yPosition);
      yPosition += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const declaration =
        "I declare that the information provided above is true and correct to the best of my knowledge.";
      const declarationAmharic =
        "ከላይ የተሰጠው መረጃ በእውቀቴ መሠረት እውነተኛ እና ትክክል መሆኑን አረጋግጣለሁ።";

      doc.text(declaration, margin, yPosition, { maxWidth: contentWidth });
      yPosition += 8;
      doc.text(declarationAmharic, margin, yPosition, {
        maxWidth: contentWidth,
      });
      yPosition += 10;

      // Signature fields
      const signatureY = yPosition + 5;
      doc.text("Applicant Signature:", margin, signatureY);
      doc.line(margin + 40, signatureY, margin + 90, signatureY);

      doc.text("Date:", margin + 100, signatureY);
      doc.line(margin + 115, signatureY, margin + contentWidth, signatureY);

      // Footer
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Station Admin: ${
          stationData.stationAdminName
        } | Generated: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Office use only section
      doc.addPage();

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("FOR OFFICE USE ONLY", pageWidth / 2, 10, { align: "center" });

      yPosition = 25;

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(10);
      doc.text("Registration Number / Lakkoofsa Galmee:", margin, yPosition);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition + 2, margin + contentWidth, yPosition + 2);
      yPosition += 15;

      doc.text("Registered By / Kan Galmeesse:", margin, yPosition);
      doc.line(margin, yPosition + 2, margin + contentWidth, yPosition + 2);
      yPosition += 15;

      doc.text("Registration Date / Guyyaa Galmee:", margin, yPosition);
      doc.line(margin, yPosition + 2, margin + contentWidth, yPosition + 2);
      yPosition += 15;

      doc.text("Verification Status / Haala Mirkaneessa:", margin, yPosition);
      doc.line(margin, yPosition + 2, margin + contentWidth, yPosition + 2);
      yPosition += 15;

      doc.text("Notes / Yaadannoo:", margin, yPosition);
      yPosition += 5;
      doc.rect(margin, yPosition, contentWidth, 40);

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
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
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
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <FileText className="h-4 w-4" />
          Download Registration Form
        </>
      )}
    </Button>
  );
}
