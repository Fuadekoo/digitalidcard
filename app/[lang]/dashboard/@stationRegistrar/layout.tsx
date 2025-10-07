import UserLayout from "@/components/layout/userLayout";
import {
  BadgeDollarSignIcon,
  Calendar,
  MessageCircle,
  User,
  Users,
} from "lucide-react";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menu = [
    [
      {
        english: "home",
        amharic: "መነሻ",
        url: "home",
        Icon: <User className="size-6" />,
      },
      {
        english: "dashboard",
        amharic: "ዳሽቦርድ",
        url: "dashboard",
        Icon: <Users className="size-6" />,
      },
      {
        english: "citizen",
        amharic: "ዜግነት",
        url: "citizen",
        Icon: <Users className="size-6" />,
      },
      {
        english: "order",
        amharic: "ትዕዛዝ",
        url: "order",
        Icon: <BadgeDollarSignIcon className="size-6" />, // You can replace with a more suitable icon if needed
      },
      {
        english: "profile",
        amharic: "መግለጫ",
        url: "profile",
        Icon: <MessageCircle className="size-6" />,
      },
      // {
      //   english: "attendance",
      //   amharic: "አቴንዳንስ",
      //   url: "attendance",
      //   Icon: <Calendar className="size-6" />,
      // },
    ],
  ];

  return <UserLayout menu={menu}>{children}</UserLayout>;
}
