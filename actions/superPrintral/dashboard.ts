"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function getDashboardData() {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    // Get total orders across all stations
    const totalOrders = await prisma.order.count();

    // Get approved orders across all stations
    const approvedOrders = await prisma.order.count({
      where: { orderStatus: "APPROVED" },
    });

    // Get rejected orders across all stations
    const rejectedOrders = await prisma.order.count({
      where: { orderStatus: "REJECTED" },
    });

    // Get pending orders across all stations
    const pendingOrders = await prisma.order.count({
      where: { orderStatus: "PENDING" },
    });

    // Get recent orders (last 10) across all stations
    const recentOrders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
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
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get data per station
    const stationData = await prisma.station.findMany({
      select: {
        id: true,
        code: true,
        amharicName: true,
        afanOromoName: true,
        _count: {
          select: {
            order: true,
          },
        },
      },
    });

    // Get detailed statistics per station
    const stationStatistics = await Promise.all(
      stationData.map(async (station) => {
        const stationOrders = await prisma.order.count({
          where: { stationId: station.id },
        });

        const stationApproved = await prisma.order.count({
          where: { stationId: station.id, orderStatus: "APPROVED" },
        });

        const stationRejected = await prisma.order.count({
          where: { stationId: station.id, orderStatus: "REJECTED" },
        });

        const stationPending = await prisma.order.count({
          where: { stationId: station.id, orderStatus: "PENDING" },
        });

        return {
          stationId: station.id,
          stationCode: station.code,
          stationName: station.amharicName,
          stationNameOromo: station.afanOromoName,
          totalOrders: stationOrders,
          approvedOrders: stationApproved,
          rejectedOrders: stationRejected,
          pendingOrders: stationPending,
          approvalRate:
            stationOrders > 0
              ? Math.round((stationApproved / stationOrders) * 100)
              : 0,
          rejectionRate:
            stationOrders > 0
              ? Math.round((stationRejected / stationOrders) * 100)
              : 0,
        };
      })
    );

    // Get status breakdown across all stations
    const statusBreakdown = await prisma.order.groupBy({
      by: ["orderStatus"],
      _count: {
        orderStatus: true,
      },
    });

    return {
      status: true,
      message: "Super printer dashboard data fetched successfully",
      data: {
        // Overall statistics
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
        // Per station data
        stationStatistics,
        statusBreakdown,
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

    const dateFilter = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Get total orders in date range across all stations
    const totalOrders = await prisma.order.count({
      where: dateFilter,
    });

    // Get approved orders in date range
    const approvedOrders = await prisma.order.count({
      where: { ...dateFilter, orderStatus: "APPROVED" },
    });

    // Get rejected orders in date range
    const rejectedOrders = await prisma.order.count({
      where: { ...dateFilter, orderStatus: "REJECTED" },
    });

    // Get pending orders in date range
    const pendingOrders = await prisma.order.count({
      where: { ...dateFilter, orderStatus: "PENDING" },
    });

    // Get data per station for the date range
    const stationData = await prisma.station.findMany({
      select: {
        id: true,
        code: true,
        amharicName: true,
        afanOromoName: true,
      },
    });

    // Get detailed statistics per station for the date range
    const stationStatistics = await Promise.all(
      stationData.map(async (station) => {
        const stationDateFilter = {
          stationId: station.id,
          ...dateFilter,
        };

        const stationOrders = await prisma.order.count({
          where: stationDateFilter,
        });

        const stationApproved = await prisma.order.count({
          where: { ...stationDateFilter, orderStatus: "APPROVED" },
        });

        const stationRejected = await prisma.order.count({
          where: { ...stationDateFilter, orderStatus: "REJECTED" },
        });

        const stationPending = await prisma.order.count({
          where: { ...stationDateFilter, orderStatus: "PENDING" },
        });

        return {
          stationId: station.id,
          stationCode: station.code,
          stationName: station.amharicName,
          stationNameOromo: station.afanOromoName,
          totalOrders: stationOrders,
          approvedOrders: stationApproved,
          rejectedOrders: stationRejected,
          pendingOrders: stationPending,
          approvalRate:
            stationOrders > 0
              ? Math.round((stationApproved / stationOrders) * 100)
              : 0,
          rejectionRate:
            stationOrders > 0
              ? Math.round((stationRejected / stationOrders) * 100)
              : 0,
        };
      })
    );

    // Get orders by status breakdown for date range
    const statusBreakdown = await prisma.order.groupBy({
      by: ["orderStatus"],
      where: dateFilter,
      _count: {
        orderStatus: true,
      },
    });

    // Get daily statistics for date range
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

    // Get station breakdown for date range
    const stationBreakdown = await prisma.order.groupBy({
      by: ["stationId"],
      where: dateFilter,
      _count: {
        id: true,
      },
    });

    return {
      status: true,
      message: "Super printer dashboard data by date fetched successfully",
      data: {
        // Overall statistics for date range
        totalOrders,
        approvedOrders,
        rejectedOrders,
        pendingOrders,
        statusBreakdown,
        dailyStats,
        stationBreakdown,
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
        // Per station data for date range
        stationStatistics,
      },
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to fetch dashboard data by date" };
  }
}

// Get dashboard data for a specific station
export async function getDashboardDataByStation(stationId: string) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    // Get station information
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: {
        id: true,
        code: true,
        amharicName: true,
        afanOromoName: true,
      },
    });

    if (!station) throw new Error("Station not found");

    // Get total orders for this station
    const totalOrders = await prisma.order.count({
      where: { stationId },
    });

    // Get approved orders for this station
    const approvedOrders = await prisma.order.count({
      where: { stationId, orderStatus: "APPROVED" },
    });

    // Get rejected orders for this station
    const rejectedOrders = await prisma.order.count({
      where: { stationId, orderStatus: "REJECTED" },
    });

    // Get pending orders for this station
    const pendingOrders = await prisma.order.count({
      where: { stationId, orderStatus: "PENDING" },
    });

    // Get recent orders for this station
    const recentOrders = await prisma.order.findMany({
      where: { stationId },
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
      take: 10,
    });

    return {
      status: true,
      message: "Station dashboard data fetched successfully",
      data: {
        station,
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
    return { status: false, message: "Failed to fetch station dashboard data" };
  }
}

export async function stationData() {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationData = await prisma.station.findMany({
      select: {
        id: true,
        afanOromoName: true,
      },
    });
  } catch {
    return { status: false, message: "Failed to fetch station data" };
  }
}
