"use client";

import React, { useEffect, useState } from "react";
import { lineSpinner } from "ldrs";

interface SpinnerProps {
  size?: number;
  stroke?: number;
  speed?: number;
  color?: string;
  className?: string;
}

export function Spinner({
  size = 40,
  stroke = 3,
  speed = 1,
  color = "currentColor",
  className = "",
}: SpinnerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    lineSpinner.register();
  }, []);

  if (!mounted) return null;

  return (
    <div className={className}>
      {/* @ts-expect-error - ldrs custom element */}
      <l-line-spinner
        size={size.toString()}
        stroke={stroke.toString()}
        speed={speed.toString()}
        color={color}
      />
    </div>
  );
}

// Full page loading spinner
export function LoadingSpinner({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} stroke={3} speed={1} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Inline loading spinner (for cards, sections)
export function InlineSpinner({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Spinner size={48} stroke={3} speed={1} className="mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{message}</h3>
      </div>
    </div>
  );
}

// Small spinner for buttons
export function ButtonSpinner({ size = 16 }: { size?: number }) {
  return <Spinner size={size} stroke={2} speed={1} className="inline-block" />;
}
