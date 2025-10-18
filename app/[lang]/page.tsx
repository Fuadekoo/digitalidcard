import { auth } from "@/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Logout from "./dashboard/logout";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const session = await auth();

  // If no session, redirect to login
  if (!session?.user) {
    redirect(`/${lang}/login`);
  }

  // Check user status and role from database
  const userData = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: { status: true, role: true },
  });

  // If user not found or inactive, show error
  if (!userData) {
    return (
      <div className="min-h-screen grid place-content-center gap-5 p-4">
        <div className="p-10 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 max-w-md">
          <p className="text-2xl font-bold mb-2">User Not Found!</p>
          <p className="text-sm mb-4">
            Your user account could not be found in the system. This might be
            due to:
          </p>
          <ul className="text-sm list-disc list-inside space-y-1 mb-4">
            <li>Account has been deleted</li>
            <li>Invalid authentication token</li>
            <li>Database synchronization issue</li>
          </ul>
          <p className="text-xs text-red-500 dark:text-red-400">
            Please contact your system administrator for assistance.
          </p>
        </div>
        <Logout />
      </div>
    );
  }

  if (userData.status !== "ACTIVE") {
    return (
      <div className="min-h-screen grid place-content-center gap-5 p-4">
        <div className="p-10 bg-orange-50 dark:bg-orange-950 border border-orange-300 dark:border-orange-800 rounded-xl text-orange-600 dark:text-orange-400 max-w-md">
          <p className="text-2xl font-bold mb-2">Account Inactive!</p>
          <p className="text-sm mb-4">
            Your account is currently{" "}
            <span className="font-semibold">
              {userData.status.toLowerCase()}
            </span>{" "}
            and cannot access the system.
          </p>
          <p className="text-sm mb-4">Possible reasons:</p>
          <ul className="text-sm list-disc list-inside space-y-1 mb-4">
            <li>Account pending activation</li>
            <li>Account has been suspended</li>
            <li>Account has been deactivated</li>
          </ul>
          <p className="text-xs text-orange-500 dark:text-orange-400">
            Please contact your administrator to activate your account.
          </p>
        </div>
        <Logout />
      </div>
    );
  }

  // Redirect based on role
  const roleRedirects: Record<string, string> = {
    superAdmin: `/${lang}/dashboard/home`,
    superPrinter: `/${lang}/dashboard/home`,
    stationAdmin: `/${lang}/dashboard/home`,
    stationRegistrar: `/${lang}/dashboard/home`,
    stationPrinter: `/${lang}/dashboard/home`,
    developer: `/${lang}/dashboard/dashboard`,
  };

  const redirectPath =
    roleRedirects[userData.role] || `/${lang}/dashboard/home`;
  redirect(redirectPath);
}
