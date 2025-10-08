"use server";
import prisma from "@/lib/db";

export async function getDashboardData() {
  try {
    // Get order statistics (total, pending, accepted, rejected)
    const [totalOrders, pendingOrders, acceptedOrders, rejectedOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { orderStatus: "pending" } }),
        prisma.order.count({ where: { orderStatus: "accepted" } }),
        prisma.order.count({ where: { orderStatus: "rejected" } }),
      ]);

    // Get citizen statistics (total, male, female)
    const [totalCitizens, maleCitizens, femaleCitizens] = await Promise.all([
      prisma.citizen.count(),
      prisma.citizen.count({ where: { gender: "male" } }),
      prisma.citizen.count({ where: { gender: "female" } }),
    ]);

    // Get station statistics
    const totalStations = await prisma.station.count();

    // Get user statistics by role
    const [
      totalUsers,
      superAdmins,
      stationAdmins,
      stationRegistrars,
      stationPrinters,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "superAdmin" } }),
      prisma.user.count({ where: { role: "stationAdmin" } }),
      prisma.user.count({ where: { role: "stationRegistrar" } }),
      prisma.user.count({ where: { role: "stationPrinter" } }),
    ]);

    // Get recent orders with station names
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        station: {
          select: {
            code: true,
            afanOromoName: true,
            amharicName: true,
          },
        },
        citizen: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get station list with order counts
    const stationsWithStats = await prisma.station.findMany({
      select: {
        id: true,
        code: true,
        afanOromoName: true,
        amharicName: true,
        stationAdminName: true,
        _count: {
          select: {
            order: true,
            citizen: true,
            users: true,
          },
        },
      },
    });

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        accepted: acceptedOrders,
        rejected: rejectedOrders,
      },
      citizens: {
        total: totalCitizens,
        male: maleCitizens,
        female: femaleCitizens,
      },
      stations: {
        total: totalStations,
        list: stationsWithStats,
      },
      users: {
        total: totalUsers,
        superAdmins,
        stationAdmins,
        stationRegistrars,
        stationPrinters,
      },
      recentOrders,
    };
  } catch (error) {
    console.error("Dashboard data fetch failed:", error);
    throw new Error("Failed to fetch dashboard data");
  }
}
