"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function getPrinterReport({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    // Get station printer's station
    const user = await prisma.user.findUnique({
      where: { id: adminId, role: "stationPrinter" },
      select: { 
        stationId: true,
        username: true,
      },
    });

    if (!user?.stationId) throw new Error("station not found");

    // Get station details
    const station = await prisma.station.findUnique({
      where: { id: user.stationId },
      select: {
        code: true,
        afanOromoName: true,
        amharicName: true,
      },
    });

    // Set date range to include full days
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const dateFilter = {
      stationId: user.stationId,
      createdAt: {
        gte: startDateTime,
        lte: endDateTime,
      },
    };

    // Get order statistics
    const [totalOrders, approvedOrders, pendingOrders, rejectedOrders] =
      await Promise.all([
        prisma.order.count({ where: { stationId: user.stationId, createdAt: dateFilter.createdAt } }),
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

    // Get cards printed by this printer
    const printedByMe = await prisma.order.count({
      where: {
        ...dateFilter,
        printerId: adminId,
        isPrinted: true,
      },
    });

    return {
      status: true,
      data: {
        station: {
          name: station?.afanOromoName || station?.amharicName || "N/A",
          code: station?.code || "N/A",
        },
        generatedBy: user.username,
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
      },
    };
  } catch (error) {
    console.error("Error generating printer report:", error);
    return {
      status: false,
      message: "Failed to generate report",
    };
  }
}

