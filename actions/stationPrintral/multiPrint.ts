"use server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function getMultipleCardData(orderIds: string[]) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { status: false, message: "Unauthenticated" };
    }

    const ordersData = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        orderType: true,
        createdAt: true,
        citizen: {
          select: {
            id: true,
            registralNo: true,
            firstName: true,
            middleName: true,
            lastName: true,
            phone: true,
            profilePhoto: true,
            occupation: true,
            dateOfBirth: true,
            gender: true,
            barcode: true,
            placeOfBirth: true,
            emergencyContact: true,
            emergencyPhone: true,
            relationship: true,
          },
        },
        station: {
          select: {
            id: true,
            afanOromoName: true,
            amharicName: true,
            signPhoto: true,
            stampPhoto: true,
            stationAdminName: true,
          },
        },
      },
    });

    if (!ordersData || ordersData.length === 0) {
      return { status: false, message: "Orders not found" };
    }

    // Convert createdAt to Ethiopian calendar for each order and add citizen number
    const { formatEthiopianDate } = await import("@/lib/ethiopian-date");

    const ordersWithEthiopianDates = ordersData.map((order, index) => ({
      ...order,
      citizenNumber: index + 1, // Add citizen number (1, 2, 3, 4, etc.)
      citizenLabel: `Citizen ${index + 1}`, // Add citizen label ("Citizen 1", "Citizen 2", etc.)
      ethiopianCreatedAt: formatEthiopianDate(new Date(order.createdAt)),
    }));

    return {
      status: true,
      data: ordersWithEthiopianDates,
      totalCount: ordersWithEthiopianDates.length, // Total number of citizens
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to get multiple card data" };
  }
}

export async function multiPrint(ids: string[]) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationPrinter" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    // Mark multiple orders as printed
    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: { in: ids },
        stationId: stationId.stationId,
      },
      data: {
        isPrinted: "APPROVED",
        printerId: adminId, // Assign the station printer as the printer
      },
    });

    if (!updatedOrders || updatedOrders.count === 0) {
      return { status: false, message: "No orders were updated" };
    }

    return {
      status: true,
      message: `${updatedOrders.count} citizen cards marked as printed successfully`,
      data: updatedOrders,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to print many orders" };
  }
}
