import React from "react";
import CitizenDetailUI from "@/features/citizen/components/citizen-detail-page";

interface PageProps {
  params: Promise<{
    citizenId: string;
    lang: string;
  }>;
}

export default async function CitizenDetailPage({ params }: PageProps) {
  const { citizenId, lang } = await params;

  return <CitizenDetailUI citizenId={citizenId} lang={lang} />;
}
