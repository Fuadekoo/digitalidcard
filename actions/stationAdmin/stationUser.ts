"use server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { userSchema, userType } from "@/lib/zodSchema";
import { Filter } from "@/lib/definition";
import { sorting } from "@/lib/utils";
import { auth } from "@/auth";

export async function getUser({ search, currentPage, row, sort }: Filter) {
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) throw new Error("unauthenticated");
  const sessionId = await prisma.user.findUnique({
    where: { id: adminId },
    select: { stationId: true },
  });
  const list = await prisma.user.findMany({
    where: {
      stationId: sessionId?.stationId,
      OR: [
        { username: { contains: search } },
        { phone: { contains: search } },
        { role: { contains: search } },
      ],
    },
  });
}

export async function getSingleUser(id: string): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    const user = await prisma.user.findUnique({
      where: { id, stationId: stationId?.stationId },
    });
    return { status: true, message: "successfully get user", data: user };
  } catch (error) {
    return { status: false, message: "failed to get user" };
  }
}

// export async function createUser({
//   username,
//   phone,
//   role,
//   password,
//   stationId,
// }: z.infer<typeof userSchema>): Promise<MutationState> {
//   try {
//     const user = await prisma.user.create({
//       data: {
//         username,
//         phone,
//         role,
//         stationId,
//         password,
//       },
//     });
//     return { status: true, message: "User created successfully", data: user };
//   } catch (error) {
//     return { status: false, message: "Failed to create user" };
//   }
// }

export async function updateUser(
  id: string,
  { username, phone, role, stationId, password }: z.infer<typeof userSchema>
): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    const user = await prisma.user.update({
      where: { id, stationId: stationId?.stationId },
      data: {
        username,
        phone,
        role,
        password,
      },
    });
    return { status: true, message: "User updated successfully", data: user };
  } catch (error) {
    return { status: false, message: "Failed to update user" };
  }
}

// block and unblock user
export async function blockUser(id: string): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    const user = await prisma.user.update({
      where: { id, stationId: stationId?.stationId },
      data: { status: "INACTIVE" },
    });
    return { status: true, message: "User blocked successfully", data: user };
  } catch {
    return { status: false, message: "Failed to block user" };
  }
}

export async function unblockUser(id: string): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    const user = await prisma.user.update({
      where: { id, stationId: stationId?.stationId },
      data: { status: "ACTIVE" },
    });
    return { status: true, message: "User unblocked successfully", data: user };
  } catch {
    return { status: false, message: "Failed to unblock user" };
  }
}

// reset user password
export async function resetUserPassword(id: string): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    const user = await prisma.user.update({
      where: { id, stationId: stationId?.stationId },
      data: { password: await bcrypt.hash("123456", 12) },
    });
    return {
      status: true,
      message: "User password reset successfully",
      data: user,
    };
  } catch {
    return { status: false, message: "Failed to reset user password" };
  }
}

