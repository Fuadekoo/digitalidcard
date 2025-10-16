import React from "react";
import CitizenManagementUI from "@/features/citizen/components/citizen-management-ui";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default async function CitizenManagementPage() {
  return (
    <PageContainer scrollable={true}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Heading
              title="Citizen Management"
              description="Manage and verify citizens registered at your station."
            />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Users className="mr-1 h-3 w-3" />
                Citizen Records
              </Badge>
            </div>
          </div>
        </div>
        <Separator />
        <CitizenManagementUI lang="am" />
      </div>
    </PageContainer>
  );
}
