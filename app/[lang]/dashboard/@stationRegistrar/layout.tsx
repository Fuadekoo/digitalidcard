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
      // track order
      {
        english: "track order",
        amharic: "ትዕዛዝ መመለስ",
        url: "trackOrder",
        Icon: <Search className="size-6" />,
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
