// crud operation in station table
"use server";
import prisma from "@/lib/db";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { stationSchema } from "@/lib/zodSchema";
import { sorting } from "@/lib/utils";
import { auth } from "@/auth";

// gate the single station data
export async function getMyStation(): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    const station = await prisma.station.findUnique({
      where: { id: stationId?.stationId },
    });
    return { status: true, message: "successfully get station", data: station };
  } catch (error) {
    console.log(error);
    return { status: false, message: "failed to get station" };
  }
}

export async function updateStation({
  code,
  afanOromoName,
  amharicName,
  stationAdminName,
  stampPhoto,
  signPhoto,
}: z.infer<typeof stationSchema>): Promise<MutationState> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    await prisma.station.update({
      where: { id: stationId?.stationId },
      data: {
        code,
        afanOromoName,
        amharicName,
        stationAdminName,
        stampPhoto,
        signPhoto,
      },
    });
    return { status: true, message: "successfully update station" };
  } catch (error) {
    console.log(error);
    return { status: false, message: "failed to update station" };
  }
}
