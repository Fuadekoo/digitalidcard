import React from "react";
import PaymentForm from "@/features/order/components/payment-form";
import PageContainer from "@/components/layout/page-container";

interface PageProps {
  params: Promise<{ lang: string }>;
}

async function Page({ params }: PageProps) {
  const { lang } = await params;

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Order ID Card</h1>
          <p className="text-muted-foreground mt-2">
            Process payment for citizen ID card
          </p>
        </div>

        {/* This would typically receive citizen data from props or context */}
        <PaymentForm
          citizenId=""
          citizenName=""
          citizenPhone=""
          lang={lang}
          onSuccess={(orderId) => {
            // Handle success
            console.log("Order created:", orderId);
          }}
          onCancel={() => {
            // Handle cancel
            console.log("Payment cancelled");
          }}
        />
      </div>
    </PageContainer>
  );
}

export default Page;
