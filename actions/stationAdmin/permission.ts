"use server";
import prisma from "@/lib/db";
import { MutationState } from "@/lib/definitions";
import { auth } from "@/auth";

// gate the station user with permission
export async function getUserPermission(
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

    const userWithPermission = await prisma.user.findMany({
      where: {
        stationId: stationId?.stationId,
      },

      include: {
        Permission: true,
      },
    });
    return {
      status: true,
      message: "Permission fetched successfully",
      data: userWithPermission,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to fetch permission and user" };
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
    if (!data?.id || !Array.isArray(data.permission)) {
      throw new Error("Invalid data for creating permissions");
    }
    const permission = await prisma.permission.createMany({
      data: data.permission.map((permission) => ({
        userId: data.id,
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

export async function deletePermission(id: string): Promise<MutationState> {
  try {
    const session = await auth();
    const StationAdminId = session?.user?.id;
    if (!StationAdminId) throw new Error("unauthenticated");
    const permissionUser = await prisma.permission.findUnique({
      where: { id },
      select: { userId: true, permission: true },
    });
    if (!permissionUser) {
      throw new Error("Permission not found");
    }
    // the user and the admin is the same station help me
    const stationId = await prisma.user.findUnique({
      where: { id: StationAdminId, role: "stationAdmin" },
      select: { stationId: true },
    });
    // check the permission user station id is the station adminid station are the same
    const userStationId = await prisma.user.findUnique({
      where: { id: permissionUser?.userId, stationId: stationId?.stationId },
    });
    if (!userStationId) {
      throw new Error(
        "Permission user station id is not the same as the station admin id"
      );
    }

    const permission = await prisma.permission.deleteMany({
      where: {
        userId: permissionUser?.userId,
        permission: permissionUser?.permission,
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
