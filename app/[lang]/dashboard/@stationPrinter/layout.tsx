import UserLayout from "@/components/layout/userLayout";
import { BadgeDollarSignIcon, User, Users } from "lucide-react";
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
        english: "order",
        amharic: "ትዕዛዝ",
        url: "citizenCard",
        Icon: <Users className="size-6" />,
      },
      {
        english: "printralReport",
        amharic: "ትዕዛዝ",
        url: "printralReport",
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

  return (
    <UserLayout menu={menu}>
      <InstallPrompt />
      {children}
    </UserLayout>
  );
}
