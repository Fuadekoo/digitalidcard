"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function getDashboardData() {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationPrinter" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    // Get total orders
    const totalOrders = await prisma.order.count({
      where: { stationId: stationId.stationId },
    });

    // Get approved orders
    const approvedOrders = await prisma.order.count({
      where: {
        stationId: stationId.stationId,
        orderStatus: "APPROVED",
      },
    });

    // Get rejected orders
    const rejectedOrders = await prisma.order.count({
      where: {
        stationId: stationId.stationId,
        orderStatus: "REJECTED",
      },
    });

    // Get pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        stationId: stationId.stationId,
        orderStatus: "PENDING",
      },
    });

    // Get recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
      where: { stationId: stationId.stationId },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        createdAt: true,
        citizen: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      status: true,
      message: "Dashboard data fetched successfully",
      data: {
        totalOrders,
        approvedOrders,
        rejectedOrders,
        pendingOrders,
        recentOrders,
        statistics: {
          approvalRate:
            totalOrders > 0
              ? Math.round((approvedOrders / totalOrders) * 100)
              : 0,
          rejectionRate:
            totalOrders > 0
              ? Math.round((rejectedOrders / totalOrders) * 100)
              : 0,
        },
      },
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to fetch dashboard data" };
  }
}

export async function getDashboardDataByDate(
  startDate: string,
  endDate: string
) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationPrinter" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    const dateFilter = {
      stationId: stationId.stationId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Get total orders in date range
    const totalOrders = await prisma.order.count({
      where: dateFilter,
    });

    // Get approved orders in date range
    const approvedOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        orderStatus: "APPROVED",
      },
    });

    // Get rejected orders in date range
    const rejectedOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        orderStatus: "REJECTED",
      },
    });

    // Get pending orders in date range
    const pendingOrders = await prisma.order.count({
      where: {
        ...dateFilter,
        orderStatus: "PENDING",
      },
    });

    // Get orders by status breakdown
    const statusBreakdown = await prisma.order.groupBy({
      by: ["orderStatus"],
      where: dateFilter,
      _count: {
        orderStatus: true,
      },
    });

    // Get daily statistics
    const dailyStats = await prisma.order.groupBy({
      by: ["createdAt"],
      where: dateFilter,
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      status: true,
      message: "Dashboard data by date fetched successfully",
      data: {
        totalOrders,
        approvedOrders,
        rejectedOrders,
        pendingOrders,
        statusBreakdown,
        dailyStats,
        dateRange: {
          startDate,
          endDate,
        },
        statistics: {
          approvalRate:
            totalOrders > 0
              ? Math.round((approvedOrders / totalOrders) * 100)
              : 0,
          rejectionRate:
            totalOrders > 0
              ? Math.round((rejectedOrders / totalOrders) * 100)
              : 0,
        },
      },
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to fetch dashboard data by date" };
  }
}
