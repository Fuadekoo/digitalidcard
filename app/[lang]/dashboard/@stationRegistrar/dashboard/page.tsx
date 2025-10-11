import React from "react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

async function Page({ params }: PageProps) {
  const { lang } = await params;
  return (
    <div>
      <h1>this is a station registrar dashboard</h1>
    </div>
  );
}

export default Page;
