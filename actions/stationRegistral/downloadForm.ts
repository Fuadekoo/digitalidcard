"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function getStationForForm() {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const user = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        stationId: true,
        username: true,
      },
    });

    if (!user?.stationId) throw new Error("station not found");

    const station = await prisma.station.findUnique({
      where: { id: user.stationId },
      select: {
        id: true,
        code: true,
        afanOromoName: true,
        amharicName: true,
        stationAdminName: true,
      },
    });

    if (!station) {
      return {
        status: false,
        message: "Station not found",
        data: null,
      };
    }

    return {
      status: true,
      message: "Station data fetched successfully",
      data: station,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: "Failed to fetch station data",
      data: null,
    };
  }
}
