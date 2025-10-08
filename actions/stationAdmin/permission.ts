"use server";
import prisma from "@/lib/db";
import { MutationState } from "@/lib/definitions";
import { auth } from "@/auth";

export async function getPermission(
  data: { id: string } | undefined
): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    const permission = await prisma.permission.findMany({
      where: { userId: data?.id, stationId: stationId?.stationId },
    });
    return {
      status: true,
      message: "Permission fetched successfully",
      data: permission,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to fetch permission" };
  }
}

export async function createPermission(
  data: { id: string; permission: string[] } | undefined
): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    const permission = await prisma.permission.createMany({
      data: data?.permission.map((permission) => ({
        userId: data?.id,
        permission,
      })),
    });
    return {
      status: true,
      message: "Permission created successfully",
      data: permission,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to create permission" };
  }
}

export async function deletePermission(
  data: { id: string; permission: string } | undefined
): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    const permission = await prisma.permission.deleteMany({
      where: {
        userId: data?.id,
        stationId: stationId?.stationId,
        permission: data?.permission,
      },
    });
    return {
      status: true,
      message: "Permission deleted successfully",
      data: permission,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to delete permission" };
  }
}
