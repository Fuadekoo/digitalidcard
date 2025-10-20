"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";

// Import LoadingSpinner only on client side to avoid HTMLElement error
const LoadingSpinner = dynamic(
  () => import("@/components/ui/spinner").then((mod) => mod.LoadingSpinner),
  { ssr: false }
);

export default function Page() {
  useEffect(() => {
    // Redirect to /en on client side
    window.location.href = "/en";
  }, []);

  return <LoadingSpinner message="Redirecting..." />;
}
