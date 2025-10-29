import UserLayout from "@/components/layout/userLayout";
import {
  BadgeDollarSignIcon,
  Calendar,
  Languages,
  MessageCircle,
  User,
  Users,
} from "lucide-react";
import React from "react";
import InstallPrompt from "@/components/installPrompt";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        key: "stations",
        url: "station",
        Icon: <Users className="size-6" />,
      },
      {
        key: "user",
        url: "user",
        Icon: <BadgeDollarSignIcon className="size-6" />,
      },
      {
        key: "reports",
        url: "reportData",
        Icon: <MessageCircle className="size-6" />,
      },
      {
        key: "languages",
        url: "languages",
        Icon: <Languages className="size-6" />,
      },
      {
        key: "profile",
        url: "profile",
        Icon: <Calendar className="size-6" />,
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
