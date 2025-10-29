import UserLayout from "@/components/layout/userLayout";
import {
  BadgeDollarSignIcon,
  Calendar,
  MessageCircle,
  Search,
  User,
  Users,
} from "lucide-react";
import React from "react";
import InstallPrompt from "@/components/installPrompt";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const menu = [
    [
      {
        key: "home",
        url: "home",
        Icon: <User className="size-6" />,
      },
      {
        key: "dashboard",
        url: "dashboard",
        Icon: <Users className="size-6" />,
      },
      {
        key: "citizens",
        url: "citizen",
        Icon: <Users className="size-6" />,
      },
      {
        key: "orders",
        url: "order",
        Icon: <BadgeDollarSignIcon className="size-6" />,
      },
      {
        key: "trackOrder",
        url: "trackOrder",
        Icon: <Search className="size-6" />,
      },
      {
        key: "profile",
        url: "profile",
        Icon: <MessageCircle className="size-6" />,
      },
    ],
  ];

  return (
    <UserLayout menu={menu}>
      <InstallPrompt />
      {children}
    </UserLayout>
  );
}
