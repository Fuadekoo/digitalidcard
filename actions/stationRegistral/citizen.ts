// crud operatoin in the citizen table
"use server";
import prisma from "@/lib/db";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { citizenSchema } from "@/lib/zodSchema";
import { Filter } from "@/lib/definition";
import { sorting } from "@/lib/utils";
import { auth } from "@/auth";

export async function getCitizen({ search, currentPage, row, sort }: Filter) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    const list = await prisma.citizen
      .findMany({
        where: {
          stationId: stationId.stationId,
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { middleName: { contains: search } },
            { registralNo: { contains: search } },
          ],
        },
        skip: (currentPage - 1) * row,
        take: row,
        select: {
          id: true,
          registralNo: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          phone: true,
          createdAt: true,
        },
      })
      .then((res) =>
        res.sort((a, b) =>
          sorting(
            `${a.firstName} ${a.middleName} ${a.lastName}`,
            `${b.firstName} ${b.middleName} ${b.lastName}`,
            sort
          )
        )
      );

    const totalData = await prisma.citizen.count({
      where: {
        stationId: stationId.stationId,
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { middleName: { contains: search } },
          { registralNo: { contains: search } },
        ],
      },
    });

    return { list, totalData };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch citizen");
  }
}

export async function getSingleCitizen(id: string) {
  try {
    const data = await prisma.citizen.findUnique({ where: { id } });
    return data;
  } catch {
    return null;
  }
}

export async function createCitizen(data: z.infer<typeof citizenSchema>) {
  try {
    const session = await auth();
    const loginUser = session?.user?.id;
    if (!loginUser) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: loginUser, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    // create citizen for their station
    const citizen = await prisma.citizen.create({
      data: {
        ...data,
        stationId: stationId?.stationId,
      },
    });
    return {
      status: true,
      message: "Citizen created successfully",
      data: citizen,
    };
  } catch {
    return { status: false, message: "Failed to create citizen" };
  }
}

export async function updateCitizen(
  id: string,
  data: z.infer<typeof citizenSchema>
) {
  try {
    const session = await auth();
    const loginUser = session?.user?.id;
    if (!loginUser) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: loginUser },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    const citizen = await prisma.citizen.update({
      where: { id, stationId: stationId?.stationId },
      data,
    });
    return {
      status: true,
      message: "Citizen updated successfully",
      data: citizen,
    };
  } catch {
    return { status: false, message: "Failed to update citizen" };
  }
}

export async function deleteCitizen(id: string) {
  try {
    const session = await auth();
    const loginUser = session?.user?.id;
    if (!loginUser) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: loginUser, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    await prisma.citizen.delete({
      where: { id, stationId: stationId?.stationId },
    });
    return { status: true, message: "Citizen deleted successfully" };
  } catch {
    return { status: false, message: "Failed to delete citizen" };
  }
}
