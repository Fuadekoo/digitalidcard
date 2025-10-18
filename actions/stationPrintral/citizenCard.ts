"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { Filter } from "@/lib/definition";
import { sorting } from "@/lib/utils";
// import { MutationState } from "@/lib/definitions";

export async function getCitizenCard({
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

    // Build where condition dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andConditions: any[] = [
      { stationId: stationId.stationId },
      { orderStatus: "APPROVED" }, // Only show approved orders that need printing
      { isPrinted: "PENDING" }, // Only show orders that haven't been printed yet
    ];

    // Add search filter if search term is provided
    if (search && search.trim() !== "") {
      andConditions.push({
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { citizen: { firstName: { contains: search, mode: "insensitive" } } },
          { citizen: { lastName: { contains: search, mode: "insensitive" } } },
          {
            citizen: { middleName: { contains: search, mode: "insensitive" } },
          },
          { citizen: { phone: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    const list = await prisma.order
      .findMany({
        where: {
          AND: andConditions,
        },
        skip: (currentPage - 1) * row,
        take: row,
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          orderType: true,
          isPrinted: true,
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
        AND: andConditions,
      },
    });

    return { list, totalData };
  } catch (error) {
    console.error("Error in getCitizenCard:", error);
    return { list: [], totalData: 0 };
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

    // Build where condition dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andConditions: any[] = [
      { stationId: stationId.stationId },
      { orderStatus: "APPROVED" }, // Only show approved orders that need printing
      { isPrinted: "PENDING" }, // Only show orders that haven't been printed yet
    ];

    // Add date filtering if both dates are provided
    if (startDate && endDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0); // Start of day

      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // End of day

      andConditions.push({
        createdAt: {
          gte: startDateTime,
          lte: endDateTime,
        },
      });
    }

    // Add search functionality (case-insensitive) only if search term exists
    if (search && search.trim() !== "") {
      andConditions.push({
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { citizen: { firstName: { contains: search, mode: "insensitive" } } },
          { citizen: { lastName: { contains: search, mode: "insensitive" } } },
          {
            citizen: { middleName: { contains: search, mode: "insensitive" } },
          },
          { citizen: { phone: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    const whereCondition = {
      AND: andConditions,
    };

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
          isPrinted: true,
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
    console.log("hy>>>", list);
    return {
      list,
      totalData,
      currentPage,
      totalPages: Math.ceil(totalData / row),
      dateRange: startDate && endDate ? { startDate, endDate } : null,
    };
  } catch (error) {
    console.error("Error in getFilteredCitizenCardByDate:", error);
    return {
      list: [],
      totalData: 0,
      currentPage: 1,
      totalPages: 0,
      dateRange: null,
    };
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

    // Station printer marks the card as printed
    const citizenCard = await prisma.order.updateMany({
      where: { id, stationId: stationId.stationId },
      data: {
        isPrinted: "APPROVED",
        printerId: adminId, // Assign the station printer as the printer
      },
    });

    return {
      status: true,
      message: "Citizen card marked as printed successfully",
      data: citizenCard,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to mark citizen card as printed" };
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

    // Station printer resets the card back to pending state
    const citizenCard = await prisma.order.updateMany({
      where: { id, stationId: stationId.stationId },
      data: {
        isPrinted: "PENDING", // Reset back to PENDING so it can be printed again
        printerId: null, // Remove printer assignment
      },
    });

    return {
      status: true,
      message: "Print status reset to pending successfully",
      data: citizenCard,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to reset print status" };
  }
}

export async function getCardData(orderId: string) {
  try {
    const orderData = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        orderType: true,
        // paymentMethod: true,
        // amount: true,
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
            occupation: true,
            dateOfBirth: true,
            gender: true,
            barcode: true,
            placeOfBirth: true,
            emergencyContact: true,
            emergencyPhone: true,
            relationship: true,
          },
        },
        station: {
          select: {
            id: true,
            afanOromoName: true,
            amharicName: true,
            signPhoto: true,
            stampPhoto: true,
            stationAdminName: true,
          },
        },
      },
    });
    return orderData;
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to get citizen card data" };
  }
}
