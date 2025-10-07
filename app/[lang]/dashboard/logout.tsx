"use client";

import { logout } from "@/actions/common/authentication";
import { Button } from "@/components/ui/button";
import useMutation from "@/hooks/useMutation";
import { useParams, useRouter } from "next/navigation";
import React from "react";

export default function Logout() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();
  const [action, isLoading] = useMutation(logout, (state) => {
    if (state.status) {
      router.refresh();
    }
  });
  return (
    <Button variant="default" onClick={action} disabled={isLoading}>
      {isLoading ? "Loading..." : lang == "am" ? "እንደገና ይሞክሩ" : "Refresh"}
    </Button>
  );
}
