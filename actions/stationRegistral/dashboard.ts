"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function getDashboardData(selectedYear?: number) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    // Get order statistics by status for this station
    const [totalOrders, pendingOrders, approvedOrders, rejectedOrders] =
      await Promise.all([
        prisma.order.count({ where: { stationId: stationId.stationId } }),
        prisma.order.count({
          where: { stationId: stationId.stationId, orderStatus: "PENDING" },
        }),
        prisma.order.count({
          where: { stationId: stationId.stationId, orderStatus: "APPROVED" },
        }),
        prisma.order.count({
          where: { stationId: stationId.stationId, orderStatus: "REJECTED" },
        }),
      ]);

    // Get total citizens in this station
    const totalCitizens = await prisma.citizen.count({
      where: { stationId: stationId.stationId },
    });

    // Get available years from orders
    const yearData = await prisma.$queryRaw<Array<{ year: number }>>`
      SELECT DISTINCT EXTRACT(YEAR FROM "createdAt") as year
      FROM "order"
      WHERE "stationId" = ${stationId.stationId}
      ORDER BY year DESC
    `;
    
    const availableYears = yearData.map((y) => Number(y.year));
    const currentYear = selectedYear || new Date().getFullYear();

    // Get monthly order statistics for the selected year
    const monthlyOrders = await prisma.$queryRaw<
      Array<{ month: number; count: bigint; status: string }>
    >`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") as month,
        COUNT(*) as count,
        "orderStatus" as status
      FROM "order"
      WHERE "stationId" = ${stationId.stationId}
        AND EXTRACT(YEAR FROM "createdAt") = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM "createdAt"), "orderStatus"
      ORDER BY month
    `;

    // Get monthly order statistics by type (URGENT vs NORMAL)
    const monthlyOrdersByType = await prisma.$queryRaw<
      Array<{ month: number; count: bigint; type: string }>
    >`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") as month,
        COUNT(*) as count,
        "orderType" as type
      FROM "order"
      WHERE "stationId" = ${stationId.stationId}
        AND EXTRACT(YEAR FROM "createdAt") = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM "createdAt"), "orderType"
      ORDER BY month
    `;

    // Get this month's statistics
    const currentMonth = new Date().getMonth() + 1;
    const [thisMonthOrders, thisMonthPending, thisMonthApproved, thisMonthRejected] =
      await Promise.all([
        prisma.order.count({
          where: {
            stationId: stationId.stationId,
            createdAt: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1),
            },
          },
        }),
        prisma.order.count({
          where: {
            stationId: stationId.stationId,
            orderStatus: "PENDING",
            createdAt: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1),
            },
          },
        }),
        prisma.order.count({
          where: {
            stationId: stationId.stationId,
            orderStatus: "APPROVED",
            createdAt: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1),
            },
          },
        }),
        prisma.order.count({
          where: {
            stationId: stationId.stationId,
            orderStatus: "REJECTED",
            createdAt: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1),
            },
          },
        }),
      ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { stationId: stationId.stationId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        orderType: true,
        amount: true,
        createdAt: true,
        citizen: {
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
          },
        },
      },
    });

    // Format monthly data for charts
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const chartData = monthNames.map((name, index) => {
      const monthNum = index + 1;
      const monthData = monthlyOrders.filter((m) => Number(m.month) === monthNum);
      
      return {
        month: name,
        pending: Number(monthData.find((m) => m.status === "PENDING")?.count || 0),
        approved: Number(monthData.find((m) => m.status === "APPROVED")?.count || 0),
        rejected: Number(monthData.find((m) => m.status === "REJECTED")?.count || 0),
        total: monthData.reduce((sum, m) => sum + Number(m.count), 0),
      };
    });

    // Format monthly data by order type for charts
    const chartDataByType = monthNames.map((name, index) => {
      const monthNum = index + 1;
      const monthData = monthlyOrdersByType.filter((m) => Number(m.month) === monthNum);
      
      const urgent = Number(monthData.find((m) => m.type === "URGENT")?.count || 0);
      const normal = Number(monthData.find((m) => m.type === "NORMAL")?.count || 0);
      
      return {
        month: name,
        urgent,
        normal,
        total: urgent + normal,
      };
    });

    return {
      status: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          approved: approvedOrders,
          rejected: rejectedOrders,
        },
        thisMonth: {
          total: thisMonthOrders,
          pending: thisMonthPending,
          approved: thisMonthApproved,
          rejected: thisMonthRejected,
        },
        citizens: {
          total: totalCitizens,
        },
        chartData,
        chartDataByType,
        recentOrders,
        availableYears,
        selectedYear: currentYear,
      },
    };
  } catch (error) {
    console.error("Dashboard data fetch failed:", error);
    return {
      status: false,
      message: "Failed to fetch dashboard data",
      data: null,
    };
  }
}
