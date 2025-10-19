"use server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { Filter } from "@/lib/definition";
import { sorting } from "@/lib/utils";

export async function getOrdersBySearch(searchTerm: string) {
  try {
    // Search by both order number and phone number
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            orderNumber: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            citizen: {
              phone: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        orderType: true,
        orderStatus: true,
        paymentMethod: true,
        paymentReference: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
        citizen: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            gender: true,
            phone: true,
            registralNo: true,
            dateOfBirth: true,
            placeOfBirth: true,
            occupation: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Show newest orders first
      },
    });

    if (!orders || orders.length === 0) {
      return {
        status: false,
        message: "No orders found",
        data: [],
      };
    }

    console.log("orders found> ", orders.length);

    return {
      status: true,
      message: `${orders.length} order(s) found successfully`,
      data: orders,
    };
  } catch (error) {
    console.log("Error fetching orders by search:", error);
    return {
      status: false,
      message: "Failed to fetch orders",
      data: [],
    };
  }
}

// Get single order by ID
export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        orderType: true,
        orderStatus: true,
        paymentMethod: true,
        paymentReference: true,
        amount: true,
        isPrinted: true,
        isAccepted: true,
        printerId: true,
        createdAt: true,
        updatedAt: true,
        citizen: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            gender: true,
            phone: true,
            registralNo: true,
            dateOfBirth: true,
            placeOfBirth: true,
            occupation: true,
          },
        },
        printer: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!order) {
      return {
        status: false,
        message: "Order not found",
        data: null,
      };
    }

    return {
      status: true,
      message: "Order found successfully",
      data: order,
    };
  } catch (error) {
    console.log("Error fetching order by ID:", error);
    return {
      status: false,
      message: "Failed to fetch order",
      data: null,
    };
  }
}

// Keep the original function for backward compatibility
export async function getOrderByNumber(orderNumber: string) {
  const result = await getOrdersBySearch(orderNumber);
  if (result.status && result.data.length > 0) {
    return {
      status: true,
      message: result.message,
      data: result.data[0], // Return first order for backward compatibility
    };
  }
  return {
    status: false,
    message: "Order not found",
    data: null,
  };
}

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
            { orderNumber: { contains: search, mode: "insensitive" } },

            {
              citizen: { firstName: { contains: search, mode: "insensitive" } },
            },
            {
              citizen: { lastName: { contains: search, mode: "insensitive" } },
            },
            {
              citizen: {
                registralNo: { contains: search, mode: "insensitive" },
              },
            },
            { citizen: { phone: { contains: search, mode: "insensitive" } } },
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
          updatedAt: true,
          citizen: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              phone: true,
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

    // Count total orders matching the search criteria
    const totalData = await prisma.order.count({
      where: {
        stationId: stationId.stationId,
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },

          { citizen: { firstName: { contains: search, mode: "insensitive" } } },
          { citizen: { lastName: { contains: search, mode: "insensitive" } } },
          {
            citizen: { registralNo: { contains: search, mode: "insensitive" } },
          },
          { citizen: { phone: { contains: search, mode: "insensitive" } } },
        ],
      },
    });
    console.log("search data> ", search);
    console.log("list data> ", list);

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
      where: { id: adminId, role: "stationRegistrar" },
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
  paymentMethod: string;
  paymentReference: string;
  amount: number;
}) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    // check the citizen and the user is in the same station
    const citizen = await prisma.citizen.findUnique({
      where: { id: data.citizenId, stationId: stationId.stationId },
    });
    if (!citizen) throw new Error("citizen not found");

    // Check if citizen is approved for order creation
    if (citizen.isVerified !== "APPROVED") {
      return {
        status: false,
        message:
          "Only approved citizens can create orders. Please approve the citizen first.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: adminId, stationId: stationId.stationId },
    });
    if (!user) throw new Error("user not found");
    if (citizen.stationId !== user.stationId)
      throw new Error("citizen and user are not in the same station");

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        citizenId: data.citizenId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orderType: data.orderType as any, // Fix: Temporarily cast to any; ideally use the correct enum/type for orderType if available
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        amount: data.amount,
        stationId: stationId.stationId,
        registrarId: adminId,
      },
    });

    return { status: true, message: "Order created successfully", data: order };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to create order" };
  }
}

// export async function updateOrder() {}

export async function deleteOrder(id: string) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    const order = await prisma.order.findUnique({
      where: { id, registrarId: adminId, stationId: stationId.stationId },
    });
    if (!order) throw new Error("order not found");

    await prisma.order.delete({ where: { id, orderStatus: "PENDING" } });

    return { status: true, message: "Order deleted successfully" };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to delete order" };
  }
}

// track the order using phone number
export async function trackOrder(search: string) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    // Validate phone number is provided
    if (!search) {
      throw new Error("Phone number must be provided");
    }

    const order = await prisma.order.findFirst({
      where: {
        citizen: { phone: search },
        stationId: stationId.stationId, // Only search within the registrar's station
      },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        paymentMethod: true,
        paymentReference: true,
        amount: true,
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
    });

    if (!order) throw new Error("Order not found");
    return { status: true, message: "Order tracked successfully", data: order };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to track order" };
  }
}

export async function trackSingleOrder(id: string) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    const order = await prisma.order.findUnique({
      where: { id, stationId: stationId.stationId },
    });
    if (!order) throw new Error("Order not found");
    return { status: true, message: "Order tracked successfully", data: order };
  } catch {
    return { status: false, message: "Failed to track order" };
  }
}

export async function updateOrderStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED"
) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    const order = await prisma.order.findUnique({
      where: { id, stationId: stationId.stationId },
    });
    if (!order) throw new Error("Order not found");

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: status,
        updatedAt: new Date(),
      },
    });

    return {
      status: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to update order status" };
  }
}

export async function MyStationCitizen() {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: adminId, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    const citizen = await prisma.citizen.findMany({
      where: {
        stationId: stationId.stationId,
        isVerified: "APPROVED", // Only return approved citizens for order creation
      },
      select: {
        id: true,
        registralNo: true,
        firstName: true,
        middleName: true,
        lastName: true,
        phone: true,
        gender: true,
        isVerified: true,
      },
    });
    return {
      status: true,
      message: "Citizen fetched successfully",
      data: citizen,
    };
  } catch (error) {
    console.log(error);
    return { status: false, message: "Failed to fetch citizen" };
  }
}
