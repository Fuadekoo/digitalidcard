"use server";

import prisma from "@/lib/db";
import { Filter } from "@/lib/definition";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getCitizens({ search, currentPage, row, sort }: Filter) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("Unauthenticated");

    // Get admin's station
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });

    if (!admin?.stationId) throw new Error("Station not found");

    const skip = (currentPage - 1) * row;

    // Build where clause
    const whereClause = {
      stationId: admin.stationId,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { middleName: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
            { registralNo: { contains: search } },
          ]
        : undefined,
    };

    // Get total count for pagination
    const totalCount = await prisma.citizen.count({ where: whereClause });

    // Get citizens with pagination and sorting
    const citizens = await prisma.citizen.findMany({
      where: whereClause,
      include: {
        stationCitizen: {
          select: {
            code: true,
            afanOromoName: true,
            amharicName: true,
          },
        },
        order: {
          select: {
            id: true,
            orderStatus: true,
          },
        },
      },
      orderBy: sort ? { createdAt: "desc" } : { createdAt: "asc" },
      skip,
      take: row,
    });

    return {
      citizens,
      totalCount,
      totalPages: Math.ceil(totalCount / row),
    };
  } catch (error) {
    console.error("Failed to fetch citizens:", error);
    throw new Error("Failed to fetch citizens");
  }
}

export async function getSingleCitizen(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthenticated");

    const citizen = await prisma.citizen.findUnique({
      where: { id },
      include: {
        stationCitizen: {
          select: {
            code: true,
            afanOromoName: true,
            amharicName: true,
          },
        },
        order: true,
      },
    });

    if (!citizen) throw new Error("Citizen not found");

    return citizen;
  } catch (error) {
    console.error("Failed to fetch citizen:", error);
    throw new Error("Failed to fetch citizen");
  }
}

export async function verifyCitizen(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthenticated");

    const citizen = await prisma.citizen.update({
      where: { id },
      data: { isVerified: "APPROVED" },
    });

    revalidatePath("/dashboard/citizenManagement");
    return { status: true, message: "Citizen verified successfully", citizen };
  } catch (error) {
    console.error("Failed to verify citizen:", error);
    return { status: false, message: "Failed to verify citizen" };
  }
}

export async function unVerifyCitizen(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthenticated");

    const citizen = await prisma.citizen.update({
      where: { id },
      data: { isVerified: "REJECTED" },
    });

    revalidatePath("/en/dashboard/citizenManagement");
    return {
      status: true,
      message: "Citizen unverified successfully",
      citizen,
    };
  } catch (error) {
    console.error("Failed to unverify citizen:", error);
    return { status: false, message: "Failed to unverify citizen" };
  }
}

export async function deleteCitizen(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthenticated");

    // Check if citizen has orders
    const citizen = await prisma.citizen.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!citizen) {
      return { status: false, message: "Citizen not found" };
    }

    if (citizen.order.length > 0) {
      return {
        status: false,
        message: "Cannot delete citizen with existing orders",
      };
    }

    await prisma.citizen.delete({
      where: { id },
    });

    revalidatePath("/dashboard/citizenManagement");
    return { status: true, message: "Citizen deleted successfully" };
  } catch (error) {
    console.error("Failed to delete citizen:", error);
    return { status: false, message: "Failed to delete citizen" };
  }
}
