"use server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { userSchema, userType, userUpdateSchema } from "@/lib/zodSchema";
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
  {
    username,
    phone,
    role,
    stationId,
    password,
  }: z.infer<typeof userUpdateSchema>
): Promise<MutationState> {
  try {
    // Prepare update data
    const updateData: any = {
      username,
      phone,
      role,
      stationId,
    };

    // Only update password if provided
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return { status: true, message: "User updated successfully", data: user };
  } catch (error) {
    console.error("Error updating user:", error);
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
      data: {
        isActive: false,
        status: "INACTIVE",
        updatedAt: new Date(),
      },
    });
    return {
      status: true,
      message: "User blocked successfully. They will not be able to login.",
      data: user,
    };
  } catch {
    return { status: false, message: "Failed to block user" };
  }
}

export async function unblockUser(id: string): Promise<MutationState> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });
    return {
      status: true,
      message: "User unblocked successfully. They can now login.",
      data: user,
    };
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

export async function getAllStation() {
  const stations = await prisma.station.findMany({
    select: {
      id: true,
      code: true,
      afanOromoName: true,
    },
  });
  return { stations };
}
