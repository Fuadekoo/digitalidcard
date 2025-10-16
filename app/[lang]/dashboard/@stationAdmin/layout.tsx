import UserLayout from "@/components/layout/userLayout";
import { BadgeDollarSignIcon, User, Users } from "lucide-react";
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
        english: "citizenManagement",
        amharic: "ዜግነት መጠቀም",
        url: "citizenManagement",
        Icon: <Users className="size-6" />,
      },
      {
        english: "report",
        amharic: "ዘገኝ",
        url: "stationAdminReport",
        Icon: <Users className="size-6" />,
      },
      {
        english: "profile",
        amharic: "መግለጫ",
        url: "profile",
        Icon: <BadgeDollarSignIcon className="size-6" />, // You can replace with a more suitable icon if needed
      },
    ],
  ];

  return <UserLayout menu={menu}>{children}</UserLayout>;
}
