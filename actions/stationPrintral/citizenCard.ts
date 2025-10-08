"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { Filter } from "@/lib/definition";
import { sorting } from "@/lib/utils";
import { MutationState } from "@/lib/definitions";

export async function getCitizenCard({
  search,
  currentPage,
  row,
  sort,
}: Filter) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationPrinter" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    const list = await prisma.order
      .findMany({
        where: {
          stationId: stationId.stationId,
          OR: [
            { orderNumber: { contains: search } },
            { citizen: { firstName: { contains: search } } },
            { citizen: { lastName: { contains: search } } },
            { citizen: { middleName: { contains: search } } },
            { citizen: { phone: { contains: search } } },
          ],
        },
        skip: (currentPage - 1) * row,
        take: row,
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          orderType: true,
          paymentMethod: true,
          amount: true,
          createdAt: true,
          citizen: {
            select: {
              id: true,
              registralNo: true,
              firstName: true,
              middleName: true,
              lastName: true,
              phone: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
      .then((res) =>
        res.sort((a, b) =>
          sorting(
            `${a.citizen.firstName} ${a.citizen.middleName} ${a.citizen.lastName}`,
            `${b.citizen.firstName} ${b.citizen.middleName} ${b.citizen.lastName}`,
            sort
          )
        )
      );

    const totalData = await prisma.order.count({
      where: {
        stationId: stationId.stationId,
        OR: [
          { orderNumber: { contains: search } },
          { citizen: { firstName: { contains: search } } },
          { citizen: { lastName: { contains: search } } },
          { citizen: { middleName: { contains: search } } },
          { citizen: { phone: { contains: search } } },
        ],
      },
    });

    return { list, totalData };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch citizen cards");
  }
}

export async function getFilteredCitizenCardByDate({
  startDate,
  endDate,
  search,
  currentPage,
  row,
  sort,
}: Filter & { startDate?: string; endDate?: string }) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationPrinter" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    // Build where condition with date filtering
    const whereCondition: any = {
      stationId: stationId.stationId,
    };

    // Add date filtering if provided
    if (startDate && endDate) {
      whereCondition.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Add search functionality
    if (search) {
      whereCondition.OR = [
        { orderNumber: { contains: search } },
        { citizen: { firstName: { contains: search } } },
        { citizen: { lastName: { contains: search } } },
        { citizen: { middleName: { contains: search } } },
        { citizen: { phone: { contains: search } } },
      ];
    }

    const list = await prisma.order
      .findMany({
        where: whereCondition,
        skip: (currentPage - 1) * row,
        take: row,
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          orderType: true,
          paymentMethod: true,
          amount: true,
          createdAt: true,
          citizen: {
            select: {
              id: true,
              registralNo: true,
              firstName: true,
              middleName: true,
              lastName: true,
              phone: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
      .then((res) =>
        res.sort((a, b) =>
          sorting(
            `${a.citizen.firstName} ${a.citizen.middleName} ${a.citizen.lastName}`,
            `${b.citizen.firstName} ${b.citizen.middleName} ${b.citizen.lastName}`,
            sort
          )
        )
      );

    const totalData = await prisma.order.count({
      where: whereCondition,
    });

    return {
      list,
      totalData,
      currentPage,
      totalPages: Math.ceil(totalData / row),
      dateRange: startDate && endDate ? { startDate, endDate } : null,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch citizen cards");
  }
}

export async function aproveCitizenCard(id: string) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationPrinter" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    const citizenCard = await prisma.order.updateMany({
      where: { id, stationId: stationId.stationId, orderStatus: "PENDING" },
      data: { orderStatus: "APPROVED" },
    });
    return {
      status: true,
      message: "Citizen card approved successfully",
      data: citizenCard,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to approve citizen card" };
  }
}

export async function rejectCitizenCard(id: string) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationPrinter" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    const citizenCard = await prisma.order.updateMany({
      where: { id, stationId: stationId.stationId, orderStatus: "PENDING" },
      data: { orderStatus: "REJECTED" },
    });
    return {
      status: true,
      message: "Citizen card rejected successfully",
      data: citizenCard,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to reject citizen card" };
  }
}
