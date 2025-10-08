"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function getDashboardData() {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    // Get order statistics (total, pending, accepted, rejected) for this station
    const [totalOrders, pendingOrders, acceptedOrders, rejectedOrders] =
      await Promise.all([
        prisma.order.count({ where: { stationId: stationId.stationId } }),
        prisma.order.count({
          where: { stationId: stationId.stationId, orderStatus: "pending" },
        }),
        prisma.order.count({
          where: { stationId: stationId.stationId, orderStatus: "accepted" },
        }),
        prisma.order.count({
          where: { stationId: stationId.stationId, orderStatus: "rejected" },
        }),
      ]);

    // Get citizen statistics (total, male, female) for this station
    const [totalCitizens, maleCitizens, femaleCitizens] = await Promise.all([
      prisma.citizen.count({ where: { stationId: stationId.stationId } }),
      prisma.citizen.count({
        where: { stationId: stationId.stationId, gender: "male" },
      }),
      prisma.citizen.count({
        where: { stationId: stationId.stationId, gender: "female" },
      }),
    ]);

    // Get station statistics
    const totalStations = await prisma.station.count();

    // Get user statistics by role for this station
    const [totalUsers, stationAdmins, stationRegistrars, stationPrinters] =
      await Promise.all([
        prisma.user.count({ where: { stationId: stationId.stationId } }),
        prisma.user.count({
          where: { stationId: stationId.stationId, role: "stationAdmin" },
        }),
        prisma.user.count({
          where: { stationId: stationId.stationId, role: "stationRegistrar" },
        }),
        prisma.user.count({
          where: { stationId: stationId.stationId, role: "stationPrinter" },
        }),
      ]);

    // Get recent orders for this station
    const recentOrders = await prisma.order.findMany({
      where: { stationId: stationId.stationId },
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

    // Get current station details
    const currentStation = await prisma.station.findUnique({
      where: { id: stationId.stationId },
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
      station: currentStation,
      users: {
        total: totalUsers,
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
