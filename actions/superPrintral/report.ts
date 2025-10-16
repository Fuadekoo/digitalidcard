"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function getSuperPrinterReport({
  startDate,
  endDate,
  stationId,
}: {
  startDate: string;
  endDate: string;
  stationId?: string;
}) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        username: true,
      },
    });

    // Set date range to include full days
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const dateFilter: any = {
      createdAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
    };

    // Add station filter if provided
    if (stationId) {
      dateFilter.stationId = stationId;
    }

    // Get station info if filtering by station
    let stationInfo = null;
    if (stationId) {
      stationInfo = await prisma.station.findUnique({
        where: { id: stationId },
        select: {
          code: true,
          afanOromoName: true,
          amharicName: true,
        },
      });
    }

    // Get order statistics
    const [totalOrders, approvedOrders, pendingOrders, rejectedOrders] =
      await Promise.all([
        prisma.order.count({ where: dateFilter }),
        prisma.order.count({
          where: { ...dateFilter, orderStatus: "APPROVED" },
        }),
        prisma.order.count({
          where: { ...dateFilter, orderStatus: "PENDING" },
        }),
        prisma.order.count({
          where: { ...dateFilter, orderStatus: "REJECTED" },
        }),
      ]);

    // Get print statistics
    const [totalPrinted, notPrinted] = await Promise.all([
      prisma.order.count({
        where: { ...dateFilter, isPrinted: true },
      }),
      prisma.order.count({
        where: { ...dateFilter, orderStatus: "APPROVED", isPrinted: false },
      }),
    ]);

    // Get cards printed by this super printer
    const printedByMe = await prisma.order.count({
      where: {
        ...dateFilter,
        printerId: adminId,
        isPrinted: true,
      },
    });

    // Get station-wise breakdown if not filtering by specific station
    let stationBreakdown = null;
    if (!stationId) {
      const stations = await prisma.station.findMany({
        select: {
          id: true,
          code: true,
          afanOromoName: true,
          amharicName: true,
        },
      });

      stationBreakdown = await Promise.all(
        stations.map(async (station) => {
          const stationFilter = {
            ...dateFilter,
            stationId: station.id,
          };

          const [total, printed] = await Promise.all([
            prisma.order.count({ where: stationFilter }),
            prisma.order.count({ where: { ...stationFilter, isPrinted: true } }),
          ]);

          return {
            stationCode: station.code,
            stationName: station.afanOromoName,
            totalOrders: total,
            printed,
            notPrinted: total - printed,
          };
        })
      );
    }

    return {
      status: true,
      data: {
        station: stationId && stationInfo
          ? {
              name: stationInfo.afanOromoName || stationInfo.amharicName || "N/A",
              code: stationInfo.code || "N/A",
            }
          : null,
        generatedBy: user?.username || "Unknown",
        dateRange: {
          start: startDateTime,
          end: endDateTime,
        },
        orders: {
          total: totalOrders,
          approved: approvedOrders,
          pending: pendingOrders,
          rejected: rejectedOrders,
        },
        printing: {
          totalPrinted,
          notPrinted,
          printedByMe,
          printRate: totalOrders > 0 
            ? Math.round((totalPrinted / totalOrders) * 100)
            : 0,
        },
        stationBreakdown,
      },
    };
  } catch (error) {
    console.error("Error generating super printer report:", error);
    return {
      status: false,
      message: "Failed to generate report",
    };
  }
}

