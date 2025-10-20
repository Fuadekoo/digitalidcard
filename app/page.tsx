"use client";

import React, { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default function Page() {
  useEffect(() => {
    // Redirect to /en on client side
    window.location.href = "/en";
  }, []);

  return <LoadingSpinner message="Redirecting..." />;
}
