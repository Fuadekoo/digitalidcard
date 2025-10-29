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
        english: "station",
        amharic: "ስታሽን",
        url: "station",
        Icon: <Users className="size-6" />,
      },
      {
        english: "user",
        amharic: "ተጠቃሚ",
        url: "user",
        Icon: <BadgeDollarSignIcon className="size-6" />, // You can replace with a more suitable icon if needed
      },
      {
        english: "report",
        amharic: "ሪፖርት",
        url: "reportData",
        Icon: <MessageCircle className="size-6" />,
      },
      {
        english: "languages",
        amharic: "ቋንቋዎች",
        url: "languages",
        Icon: <Languages className="size-6" />,
      },
      {
        english: "profile",
        amharic: "መግለጫ",
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
