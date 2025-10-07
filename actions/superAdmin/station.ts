// crud operation in station table
"use server";
import prisma from "@/lib/db";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { stationSchema } from "@/lib/zodSchema";
import { auth } from "@/auth";

export async function getStation() {}

// gate the single station data
export async function getSingleStation(id: string): Promise<MutationState> {
  try {
    const station = await prisma.station.findUnique({ where: { id } });
    return { status: true, message: "successfully get station", data: station };
  } catch (error) {
    return { status: false, message: "failed to get station" };
  }
}

export async function createStation({
  code,
  afanOromoName,
  amharicName,
  stationAdminName,
  stampPhoto,
  signPhoto,
}: z.infer<typeof stationSchema>): Promise<MutationState> {
  console.log("Received station data:", {
    code,
    afanOromoName,
    amharicName,
    stationAdminName,
    stampPhoto,
    signPhoto,
  });
  try {
    const sessionId = (await auth())?.user?.id;
    if (!sessionId) throw new Error("unauthenticated");

    await prisma.station.create({
      data: {
        code,
        afanOromoName,
        amharicName,
        stationAdminName,
        stampPhoto,
        signPhoto,
      },
    });

    return { status: true, message: "successfully created station" };
  } catch (error) {
    console.error("Station creation failed:", error);
    return { status: false, message: "failed to create station" };
  }
}

export async function updateStation(
  id: string,
  {
    code,
    afanOromoName,
    amharicName,
    stationAdminName,
    stampPhoto,
    signPhoto,
  }: z.infer<typeof stationSchema>
): Promise<MutationState> {
  try {
    await prisma.station.update({
      where: { id },
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
    return { status: false, message: "failed to update station" };
  }
}

export async function deleteStation(id: string): Promise<MutationState> {
  try {
    await prisma.station.delete({ where: { id } });
    return { status: true, message: "successfully delete station" };
  } catch (error) {
    return { status: false, message: "failed to delete station" };
  }
}
