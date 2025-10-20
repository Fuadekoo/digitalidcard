"use client";

import React from "react";
import dynamic from "next/dynamic";

// Import LoadingSpinner only on client side to avoid HTMLElement error
const LoadingSpinner = dynamic(
  () => import("./ui/spinner").then((mod) => mod.LoadingSpinner),
  { ssr: false }
);

function Loading() {
  return <LoadingSpinner />;
}

export default Loading;
