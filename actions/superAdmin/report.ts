// this is a report backend it filter the data based on the start and end date in the report page
"use server";
import prisma from "@/lib/db";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { stationSchema } from "@/lib/zodSchema";
import { sorting } from "@/lib/utils";
import { auth } from "@/auth";

// Get all stations for dropdown
export async function getAllStations() {
  try {
    const stations = await prisma.station.findMany({
      select: {
        id: true,
        code: true,
        afanOromoName: true,
        amharicName: true,
      },
      orderBy: {
        code: "asc",
      },
    });

    return stations;
  } catch (error) {
    console.error("Error fetching stations:", error);
    return [];
  }
}

// create a report -by filter by date and station  then return the data like order(total,pending,accepr and reject) and citizen(total,male,female)
export async function getReport({
  startDate,
  endDate,
  stationId,
}: {
  startDate: Date;
  endDate: Date;
  stationId: string;
}) {
  try {
    // Get station details
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: {
        code: true,
        afanOromoName: true,
        amharicName: true,
      },
    });

    if (!station) {
      throw new Error("Station not found");
    }

    // Get order statistics
    const orderStats = await getOrderStatistics(startDate, endDate, stationId);

    // Get citizen statistics
    const citizenStats = await getCitizenStatistics(
      startDate,
      endDate,
      stationId
    );

    // Get user count for the station
    const userCount = await prisma.user.count({
      where: { stationId },
    });

    // Calculate total revenue
    const totalRevenue = await prisma.order.aggregate({
      where: {
        stationId,
        createdAt: { gte: startDate, lte: endDate },
        orderStatus: "APPROVED",
      },
      _sum: {
        amount: true,
      },
    });

    return {
      station: {
        name: station.afanOromoName || station.amharicName,
        code: station.code,
      },
      orders: orderStats,
      citizens: citizenStats,
      totalUsers: userCount,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}

// Get order statistics (total, pending, accept, reject)
export async function getOrderStatistics(
  startDate: Date,
  endDate: Date,
  stationId?: string
) {
  const whereClause = {
    createdAt: { gte: startDate, lte: endDate },
    ...(stationId ? { stationId } : {}),
  };

  const [total, pending, accepted, rejected] = await Promise.all([
    prisma.order.count({ where: whereClause }),
    prisma.order.count({ where: { ...whereClause, orderStatus: "PENDING" } }),
    prisma.order.count({ where: { ...whereClause, orderStatus: "APPROVED" } }),
    prisma.order.count({ where: { ...whereClause, orderStatus: "REJECTED" } }),
  ]);

  return {
    total,
    pending,
    accepted,
    rejected,
  };
}

// Get citizen statistics (total, male, female)
export async function getCitizenStatistics(
  startDate: Date,
  endDate: Date,
  stationId?: string
) {
  const whereClause = {
    createdAt: { gte: startDate, lte: endDate },
    ...(stationId ? { stationId } : {}),
  };

  const [total, male, female] = await Promise.all([
    prisma.citizen.count({ where: whereClause }),
    prisma.citizen.count({ where: { ...whereClause, gender: "male" } }),
    prisma.citizen.count({ where: { ...whereClause, gender: "female" } }),
  ]);

  return {
    total,
    male,
    female,
  };
}
