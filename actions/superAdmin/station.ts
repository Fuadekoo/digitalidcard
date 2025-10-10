// crud operation in station table
"use server";
import prisma from "@/lib/db";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { stationSchema } from "@/lib/zodSchema";
import { sorting } from "@/lib/utils";
import { requireSuperAdmin, isSuperAdmin } from "@/lib/auth-utils";

type StationFilter = {
  search: string;
  currentPage: number;
  row: number;
  sort: string;
};

// Get all stations for dropdown/select purposes
export async function getAllStation(): Promise<MutationState> {
  try {
    // Check if user is super admin
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return {
        status: false,
        message: "Access denied. Super admin role required.",
      };
    }

    const stations = await prisma.station.findMany({
      select: {
        id: true,
        code: true,
        afanOromoName: true,
        amharicName: true,
        stationAdminName: true,
      },
      orderBy: {
        code: "asc",
      },
    });

    return {
      status: true,
      data: stations,
      message: "Stations retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching all stations:", error);
    return {
      status: false,
      message: "Failed to fetch stations",
    };
  }
}

export async function getStation({
  search,
  currentPage,
  row,
  sort,
}: StationFilter) {
  // Check if user is super admin
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    throw new Error("Access denied. Super admin role required.");
  }
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
          sort === "asc"
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

  console.log("list", list);
  console.log("totalData", totalData);
  return { list, totalData };
}

// gate the single station data
export async function getSingleStation(id: string): Promise<MutationState> {
  try {
    // Check if user is super admin
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return {
        status: false,
        message: "Access denied. Super admin role required.",
      };
    }

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
    // Require super admin role
    const sessionId = await requireSuperAdmin();

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
  data: any
): Promise<MutationState> {
  try {
    // Require super admin role
    await requireSuperAdmin();

    const updateData: any = {};

    // Handle both old schema fields and new fields
    if (data.code !== undefined) updateData.code = data.code;
    if (data.afanOromoName !== undefined)
      updateData.afanOromoName = data.afanOromoName;
    if (data.amharicName !== undefined)
      updateData.amharicName = data.amharicName;
    if (data.stationAdminName !== undefined)
      updateData.stationAdminName = data.stationAdminName;
    if (data.stampPhoto !== undefined) updateData.stampPhoto = data.stampPhoto;
    if (data.signPhoto !== undefined) updateData.signPhoto = data.signPhoto;

    // Handle new fields
    if (data.name !== undefined) updateData.name = data.name;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
    if (data.country !== undefined) updateData.country = data.country;

    updateData.updatedAt = new Date();

    const updatedStation = await prisma.station.update({
      where: { id },
      data: updateData,
    });

    return {
      status: true,
      message: "successfully update station",
      data: updatedStation,
    };
  } catch (error) {
    console.error("Error updating station:", error);
    return { status: false, message: "failed to update station" };
  }
}

export async function deleteStation(id: string): Promise<MutationState> {
  try {
    // Require super admin role
    await requireSuperAdmin();
    await prisma.station.delete({ where: { id } });
    return { status: true, message: "successfully delete station" };
  } catch (error) {
    return { status: false, message: "failed to delete station" };
  }
}

type StationUserFilter = {
  search: string;
  currentPage: number;
  row: number;
  sort: string;
};

export async function getStationUser({
  stationId,
  search,
  currentPage,
  row,
  sort,
}: StationUserFilter & { stationId: string }) {
  // Check if user is super admin
  const isAdmin = await isSuperAdmin();
  if (!isAdmin) {
    throw new Error("Access denied. Super admin role required.");
  }

  const list = await prisma.user
    .findMany({
      where: {
        stationId: stationId,
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
        createdAt: true,
        updatedAt: true,
      },
    })
    .then((res) =>
      res.sort((a, b) =>
        sorting(
          `${a.username} ${a.role}`,
          `${b.username} ${b.role}`,
          sort === "asc"
        )
      )
    );

  const totalData = await prisma.user.count({
    where: {
      stationId: stationId,
      OR: [
        { username: { contains: search } },
        { phone: { contains: search } },
        { role: { contains: search } },
      ],
    },
  });

  // console.log("stationUser list", list);
  // console.log("stationUser totalData", totalData);
  return { list, totalData };
}
