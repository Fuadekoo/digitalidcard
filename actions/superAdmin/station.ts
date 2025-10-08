// crud operation in station table
"use server";
import prisma from "@/lib/db";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { stationSchema } from "@/lib/zodSchema";
import { sorting } from "@/lib/utils";
import { auth } from "@/auth";

type StationFilter = {
  search: string;
  currentPage: number;
  row: number;
  sort: string;
};

export async function getStation({
  search,
  currentPage,
  row,
  sort,
}: StationFilter) {
  const list = await prisma.station
    .findMany({
      where: {
        OR: [
          { code: { contains: search } },
          { afanOromoName: { contains: search } },
          { amharicName: { contains: search } },
          { stationAdminName: { contains: search } },
        ],
      },
      skip: (currentPage - 1) * row,
      take: row,
      select: {
        id: true,
        code: true,
        afanOromoName: true,
        amharicName: true,
        stationAdminName: true,
        stampPhoto: true,
        signPhoto: true,
        createdAt: true,
      },
    })
    .then((res) =>
      res.sort((a, b) =>
        sorting(
          `${a.code} ${a.afanOromoName} ${a.amharicName}`,
          `${b.code} ${b.afanOromoName} ${b.amharicName}`,
          sort
        )
      )
    );

  const totalData = await prisma.station.count({
    where: {
      OR: [
        { code: { contains: search } },
        { afanOromoName: { contains: search } },
        { amharicName: { contains: search } },
        { stationAdminName: { contains: search } },
      ],
    },
  });

  return { list, totalData };
}

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
