import React from "react";
import ProfileUI from "@/features/profile/components/profile-ui";

interface PageProps {
  params: Promise<{ lang: string }>;
}

async function Page({ params }: PageProps) {
  const { lang } = await params;
  return <ProfileUI />;
}

export default Page;
