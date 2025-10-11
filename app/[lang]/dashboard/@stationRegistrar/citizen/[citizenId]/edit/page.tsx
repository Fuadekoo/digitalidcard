import React from "react";
import CitizenEditPage from "@/features/citizen/components/citizen-edit-page";

interface PageProps {
  params: Promise<{
    lang: string;
    citizenId: string;
  }>;
}

async function Page({ params }: PageProps) {
  const { lang, citizenId } = await params;

  return <CitizenEditPage citizenId={citizenId} lang={lang} />;
}

export default Page;
