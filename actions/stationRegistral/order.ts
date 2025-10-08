"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { Filter } from "@/lib/definition";
import { sorting } from "@/lib/utils";

export async function getOrder({ search, currentPage, row, sort }: Filter) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    const list = await prisma.order
      .findMany({
        where: {
          stationId: stationId.stationId,
          OR: [
            { orderNumber: { contains: search } },
            { orderType: { contains: search } },
            { orderStatus: { contains: search } },
            { paymentMethod: { contains: search } },
            { paymentReference: { contains: search } },
            { citizen: { firstName: { contains: search } } },
            { citizen: { lastName: { contains: search } } },
          ],
        },
        skip: (currentPage - 1) * row,
        take: row,
        select: {
          id: true,
          orderNumber: true,
          orderType: true,
          orderStatus: true,
          paymentMethod: true,
          paymentReference: true,
          amount: true,
          createdAt: true,
          paidAt: true,
          completedAt: true,
          citizen: {
            select: {
              firstName: true,
              lastName: true,
              registralNo: true,
            },
          },
        },
      })
      .then((res) =>
        res.sort((a, b) =>
          sorting(
            `${a.orderNumber} ${a.citizen.firstName} ${a.citizen.lastName}`,
            `${b.orderNumber} ${b.citizen.firstName} ${b.citizen.lastName}`,
            sort
          )
        )
      );

    const totalData = await prisma.order.count({
      where: {
        stationId: stationId.stationId,
        OR: [
          { orderNumber: { contains: search } },
          { orderType: { contains: search } },
          { orderStatus: { contains: search } },
          { paymentMethod: { contains: search } },
          { paymentReference: { contains: search } },
          { citizen: { firstName: { contains: search } } },
          { citizen: { lastName: { contains: search } } },
        ],
      },
    });

    return { list, totalData };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch orders");
  }
}

export async function getSingleOrder(id: string) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    const data = await prisma.order.findUnique({
      where: { id, stationId: stationId?.stationId },
    });
    return data;
  } catch {
    return null;
  }
}

export async function createOrder(data: {
  citizenId: string;
  orderType: string;
  orderStatus: string;
  paymentMethod: string;
  paymentReference: string;
  amount: number;
  printerId: string;
}) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        citizenId: data.citizenId,
        orderType: data.orderType,
        orderStatus: data.orderStatus,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        amount: data.amount,
        stationId: stationId.stationId,
        registrarId: adminId,
        printerId: data.printerId,
      },
    });

    return { status: true, message: "Order created successfully", data: order };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to create order" };
  }
}

export async function updateOrder() {}

export async function deleteOrder() {}
