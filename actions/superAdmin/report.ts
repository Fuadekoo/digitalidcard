// this is a report backend it filter the data based on the start and end date in the report page
"use server";
import prisma from "@/lib/db";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { stationSchema } from "@/lib/zodSchema";
import { sorting } from "@/lib/utils";
import { auth } from "@/auth";

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
  // Get order statistics
  const orderStats = await getOrderStatistics(startDate, endDate, stationId);

  // Get citizen statistics
  const citizenStats = await getCitizenStatistics(
    startDate,
    endDate,
    stationId
  );

  return {
    orders: orderStats,
    citizens: citizenStats,
  };
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
    prisma.order.count({ where: { ...whereClause, orderStatus: "pending" } }),
    prisma.order.count({ where: { ...whereClause, orderStatus: "accepted" } }),
    prisma.order.count({ where: { ...whereClause, orderStatus: "rejected" } }),
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
