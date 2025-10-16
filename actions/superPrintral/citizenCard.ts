"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { Filter } from "@/lib/definition";
import { sorting } from "@/lib/utils";

// Extend Filter type to include optional stationId
type SuperPrinterFilter = Filter & { stationId?: string };

export async function getCitizenCard({
  stationId,
  search,
  currentPage,
  row,
  sort,
}: SuperPrinterFilter) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    // Build where condition dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andConditions: any[] = [
      { orderStatus: "APPROVED" }, // Only show approved orders that need printing
      { isPrinted: false }, // Only show orders that haven't been printed yet
    ];

    // Add station filter if provided
    if (stationId) {
      andConditions.push({ stationId: stationId });
    }

    // Add search filter if search term is provided
    if (search && search.trim() !== "") {
      andConditions.push({
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { citizen: { firstName: { contains: search, mode: 'insensitive' } } },
          { citizen: { lastName: { contains: search, mode: 'insensitive' } } },
          { citizen: { middleName: { contains: search, mode: 'insensitive' } } },
          { citizen: { phone: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    const whereCondition = {
      AND: andConditions,
    };

    // Super printer can access all orders from all stations
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
          station: {
            select: {
              id: true,
              code: true,
              amharicName: true,
              afanOromoName: true,
            },
          },
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

    return { list, totalData };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch citizen cards");
  }
}

export async function getFilteredCitizenCardByDate({
  startDate,
  endDate,
  stationId,
  search,
  currentPage,
  row,
  sort,
}: SuperPrinterFilter & { startDate?: string; endDate?: string }) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    // Build where condition dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andConditions: any[] = [
      { orderStatus: "APPROVED" }, // Only show approved orders that need printing
      { isPrinted: false }, // Only show orders that haven't been printed yet
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
    
    // Add station filter if provided
    if (stationId) {
      andConditions.push({ stationId: stationId });
    }

    // Add search functionality (case-insensitive) only if search term exists
    if (search && search.trim() !== "") {
      andConditions.push({
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { citizen: { firstName: { contains: search, mode: 'insensitive' } } },
          { citizen: { lastName: { contains: search, mode: 'insensitive' } } },
          { citizen: { middleName: { contains: search, mode: 'insensitive' } } },
          { citizen: { phone: { contains: search, mode: 'insensitive' } } },
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
          paymentMethod: true,
          amount: true,
          createdAt: true,
          station: {
            select: {
              id: true,
              code: true,
              amharicName: true,
              afanOromoName: true,
            },
          },
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

    // Super printer marks the card as printed
    const citizenCard = await prisma.order.update({
      where: { id },
      data: {
        isPrinted: true,
        printerId: adminId, // Assign the super printer as the printer
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

    // Super printer marks the card as not printed (reject printing)
    const citizenCard = await prisma.order.update({
      where: { id },
      data: {
        isPrinted: false,
        printerId: null, // Remove printer assignment
      },
    });

    return {
      status: true,
      message: "Print request rejected successfully",
      data: citizenCard,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to reject print request" };
  }
}

// Get citizen cards by specific station
export async function getCitizenCardByStation({
  stationId,
  search,
  currentPage,
  row,
  sort,
}: SuperPrinterFilter & { stationId: string }) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    // Build where condition dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andConditions: any[] = [
      { stationId: stationId },
    ];

    // Add search filter if search term is provided
    if (search && search.trim() !== "") {
      andConditions.push({
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { citizen: { firstName: { contains: search, mode: 'insensitive' } } },
          { citizen: { lastName: { contains: search, mode: 'insensitive' } } },
          { citizen: { middleName: { contains: search, mode: 'insensitive' } } },
          { citizen: { phone: { contains: search, mode: 'insensitive' } } },
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
          paymentMethod: true,
          amount: true,
          createdAt: true,
          station: {
            select: {
              id: true,
              code: true,
              amharicName: true,
              afanOromoName: true,
            },
          },
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
    console.log(error);
    throw new Error("Failed to fetch citizen cards by station");
  }
}

// Get card data for printing (super printer can access any station's orders)
export async function getCardData(orderId: string) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const orderData = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        orderType: true,
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
