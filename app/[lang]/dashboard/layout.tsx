import { auth } from "@/auth";
import prisma from "@/lib/db";
import React from "react";
import Logout from "./logout";

export default async function Layout({
  children,
  superAdmin,
  superPrinter,
  stationAdmin,
  stationRegistrar,
  stationPrinter,
  developer,
}: {
  children: React.ReactNode;
  superAdmin: React.ReactNode;
  superPrinter: React.ReactNode;
  stationAdmin: React.ReactNode;
  stationRegistrar: React.ReactNode;
  stationPrinter: React.ReactNode;
  developer: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="grid place-content-center gap-5">
        <div className="p-10 bg-danger/10 border border-danger-300 rounded-xl text-danger-600">
          <p className="text-2xl first-letter:font-bold">Access Denied!</p>
          <p className="text-sm">
            You need to be logged in to access this area.
          </p>
        </div>
        <Logout />
      </div>
    );
  }

  const data = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: { status: true, role: true, isActive: true },
  });

  if (!data || data.status !== "ACTIVE" || !data.isActive) {
    return (
      <div className="grid place-content-center gap-5">
        <div className="p-10 bg-danger/10 border border-danger-300 rounded-xl text-danger-600">
          <p className="text-2xl first-letter:font-bold">
            {!data?.isActive ? "Account Blocked!" : "Account Inactive!"}
          </p>
          <p className="text-sm">
            {!data?.isActive
              ? "Your account has been blocked. Please contact an administrator to unblock your account."
              : "Your account is not active. Please contact an administrator."}
          </p>
        </div>
        <Logout />
      </div>
    );
  }

  // Role-based rendering
  switch (session.user.role) {
    case "superAdmin":
      return superAdmin;
    case "superPrinter":
      return superPrinter;
    case "stationAdmin":
      return stationAdmin;
    case "stationRegistrar":
      return stationRegistrar;
    case "stationPrinter":
      return stationPrinter;
    case "developer":
      return developer;
    default:
      return (
        <div className="grid place-content-center">
          <div className="p-10 bg-danger/10 border border-danger-300 rounded-xl text-danger-600">
            <p className="text-2xl first-letter:font-bold">Invalid Role!</p>
            <p className="text-sm">
              Your role ({session.user.role}) is not recognized.
            </p>
          </div>
        </div>
      );
  }
}
