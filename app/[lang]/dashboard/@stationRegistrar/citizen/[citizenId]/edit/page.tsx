import React from "react";
import CitizenEditPage from "@/features/citizen/components/citizen-edit-page";

interface PageProps {
  params: Promise<{
    citizenId: string;
  }>;
}

async function Page({ params }: PageProps) {
  const { citizenId } = await params;
  
  return <CitizenEditPage citizenId={citizenId} />;
}

export default Page;