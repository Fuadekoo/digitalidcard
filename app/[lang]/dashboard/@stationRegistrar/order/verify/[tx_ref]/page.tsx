import React from "react";
import PaymentVerification from "@/features/order/components/payment-verification";
import PageContainer from "@/components/layout/page-container";

interface PageProps {
  params: Promise<{ lang: string; tx_ref: string }>;
}

export default async function Page({ params }: PageProps) {
  const { lang, tx_ref } = await params;

  return (
    <PageContainer scrollable={true}>
      <PaymentVerification tx_ref={tx_ref} lang={lang} />
    </PageContainer>
  );
}
