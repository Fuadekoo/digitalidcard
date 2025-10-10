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
  const list = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: search } },
        { phone: { contains: search } },
        { role: { contains: search } },
      ],
    },
    skip: (currentPage - 1) * row,
    take: row,
    select: {
      id: true,
      username: true,
      phone: true,
      role: true,
      status: true,
      isAdmin: true,
      isActive: true,
      stationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const totalData = await prisma.user.count({
    where: {
      OR: [
        { username: { contains: search } },
        { phone: { contains: search } },
        { role: { contains: search } },
      ],
    },
  });

  return { list, totalData };
}

export async function getSingleUser(id: string): Promise<MutationState> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    return { status: true, message: "successfully get user", data: user };
  } catch (error) {
    return { status: false, message: "failed to get user" };
  }
}

export async function createUser({
  username,
  phone,
  role,
  password,
  stationId,
}: z.infer<typeof userSchema>): Promise<MutationState> {
  try {
    const user = await prisma.user.create({
      data: {
        username,
        phone,
        role,
        stationId,
        password,
      },
    });
    return { status: true, message: "User created successfully", data: user };
  } catch (error) {
    return { status: false, message: "Failed to create user" };
  }
}

export async function updateUser(
  id: string,
  { username, phone, role, stationId, password }: z.infer<typeof userSchema>
): Promise<MutationState> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        username,
        phone,
        role,
        stationId,
        password,
      },
    });
    return { status: true, message: "User updated successfully", data: user };
  } catch (error) {
    return { status: false, message: "Failed to update user" };
  }
}

export async function deleteUser(id: string): Promise<MutationState> {
  try {
    const user = await prisma.user.delete({ where: { id } });
    return { status: true, message: "User deleted successfully", data: user };
  } catch {
    return { status: false, message: "Failed to delete user" };
  }
}

// block and unblock user
export async function blockUser(id: string): Promise<MutationState> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    return { status: true, message: "User blocked successfully", data: user };
  } catch {
    return { status: false, message: "Failed to block user" };
  }
}

export async function unblockUser(id: string): Promise<MutationState> {
  try {
    const user = await prisma.user.update({
      where: { id },
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
    const user = await prisma.user.update({
      where: { id },
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
