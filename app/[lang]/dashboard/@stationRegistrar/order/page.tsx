import React from "react";
import { OrderListing } from "@/features/order/components";
import PageContainer from "@/components/layout/page-container";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;

  return (
    <PageContainer scrollable={true}>
      <OrderListing lang={lang} />
    </PageContainer>
  );
}
