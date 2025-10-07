"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
// import { RegisterSchema } from "@/lib/zodSchema";
import { UserStatus } from "@prisma/client";

export async function changeUserStatus(id: string, status: UserStatus) {
  await prisma.user.update({ where: { id }, data: { status } });
}

export async function getUser() {
  const session = await auth();
  const data = await prisma.user.findFirst({
    where: { id: session?.user?.id },
    select: {
      username: true,
      phone: true,
      isAdmin: true,
      isActive: true,
      role: true,
    },
  });

  return data;
}
