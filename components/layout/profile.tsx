"use client";

import { Button } from "../ui/button";
import { User } from "lucide-react";

export default function Profile() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-2"
    >
      <User className="h-4 w-4" />
      Profile
    </Button>
  );
}
