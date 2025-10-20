"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, FileText, Download, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CitizenRegistrationFormPreview() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview Form
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Citizen Registration Form Preview
          </DialogTitle>
          <DialogDescription>
            This is a preview of the downloadable PDF registration form that
            citizens can fill out manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Information Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                How to Use This Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  1
                </Badge>
                <p>
                  Click the <strong>&quot;Download Registration Form&quot;</strong> button
                  to get the PDF
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  2
                </Badge>
                <p>
                  Print the form and give it to citizens who want to register
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  3
                </Badge>
                <p>Citizens fill out the form with their information</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  4
                </Badge>
                <p>
                  Citizens bring the completed form to the registration office
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">
                  5
                </Badge>
                <p>
                  You enter the information into the system using{" "}
                  <strong>&quot;Register New Citizen&quot;</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form Preview */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
            <div className="space-y-6">
              {/* Header Preview */}
              <div className="bg-blue-600 text-white p-4 rounded-t-lg text-center">
                <h3 className="text-lg font-bold">CITIZEN REGISTRATION FORM</h3>
              </div>

              {/* Station Info Preview */}
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold text-sm mb-2">
                  Station Information:
                </h4>
                <div className="text-xs space-y-1 text-gray-600">
                  <p>• Station Code: [Auto-filled]</p>
                  <p>• Station Name: [Auto-filled from your station]</p>
                  <p>• Station Admin: [Auto-filled]</p>
                </div>
              </div>

              {/* Sections Preview */}
              <div className="space-y-4">
                <div>
                  <div className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold mb-2">
                    1. PERSONAL INFORMATION
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>• First Name / Maqaa Duraa: _____________</div>
                    <div>• Middle Name / Maqaa Abbaa: ___________</div>
                    <div className="col-span-2">
                      • Last Name / Maqaa Maatii: _____________________
                    </div>
                    <div>• Gender / Saalaa: ________________</div>
                    <div>• Date of Birth: _________________</div>
                    <div className="col-span-2">
                      • Place of Birth: _________________________
                    </div>
                    <div className="col-span-2">
                      • Occupation / Hojii: _____________________
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold mb-2">
                    2. CONTACT INFORMATION
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>• Phone Number: _______________</div>
                    <div>• Alternative Phone: _____________</div>
                    <div className="col-span-2">
                      • Current Address: ________________________
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold mb-2">
                    3. EMERGENCY CONTACT INFORMATION
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div className="col-span-2">
                      • Emergency Contact Name: __________________
                    </div>
                    <div>• Relationship: ________________</div>
                    <div>• Emergency Phone: _____________</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="border-2 border-dashed border-gray-400 w-24 h-32 flex items-center justify-center text-xs text-gray-400">
                    Photo
                    <br />
                    3x4 cm
                  </div>
                  <div className="flex-1 text-xs text-gray-600">
                    <p className="font-semibold mb-1">Declaration:</p>
                    <p className="italic">
                      I declare that the information provided above is true and
                      correct...
                    </p>
                    <div className="mt-3 flex gap-8">
                      <div>Signature: ______________</div>
                      <div>Date: ______________</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Use Section */}
              <div className="border-t-2 pt-4 mt-4">
                <div className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm font-semibold mb-2">
                  FOR OFFICE USE ONLY (Page 2)
                </div>
                <div className="text-xs text-gray-600 space-y-2">
                  <p>• Registration Number: ___________________</p>
                  <p>• Registered By: _________________________</p>
                  <p>• Registration Date: _____________________</p>
                  <p>• Verification Status: ____________________</p>
                  <p>• Notes: [Space for additional notes]</p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Instruction */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Download className="h-10 w-10 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">
                    Ready to Download?
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    The actual PDF will be professionally formatted and ready to
                    print. It includes all bilingual labels (Amharic & Afan
                    Oromo) and proper spacing for manual filling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
