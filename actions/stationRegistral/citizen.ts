// crud operatoin in the citizen table
"use server";
import prisma from "@/lib/db";
import z from "zod";
import { MutationState } from "@/lib/definitions";
import { citizenSchema } from "@/lib/zodSchema";
import { Filter } from "@/lib/definition";
import { sorting } from "@/lib/utils";
import { auth } from "@/auth";
import { randomBytes } from "crypto";

export async function getCitizen({ search, currentPage, row, sort }: Filter) {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: adminId },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    const list = await prisma.citizen
      .findMany({
        where: {
          stationId: stationId.stationId,
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { middleName: { contains: search } },
            { registralNo: { contains: search } },
          ],
        },
        skip: (currentPage - 1) * row,
        take: row,
        select: {
          id: true,
          registralNo: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          phone: true,
          isVerified: true,
          createdAt: true,
        },
      })
      .then((res) =>
        res.sort((a, b) =>
          sorting(
            `${a.firstName} ${a.middleName} ${a.lastName}`,
            `${b.firstName} ${b.middleName} ${b.lastName}`,
            sort
          )
        )
      );

    const totalData = await prisma.citizen.count({
      where: {
        stationId: stationId.stationId,
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { middleName: { contains: search } },
          { registralNo: { contains: search } },
        ],
      },
    });

    return { list, totalData };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch citizen");
  }
}

export async function getSingleCitizen(id: string) {
  try {
    const data = await prisma.citizen.findUnique({ where: { id } });
    return data;
  } catch {
    return null;
  }
}

export async function createCitizen(data: z.infer<typeof citizenSchema>) {
  try {
    const session = await auth();
    const loginUser = session?.user?.id;
    if (!loginUser) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: loginUser, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    // Check if registralNo already exists
    const existingCitizen = await prisma.citizen.findUnique({
      where: { registralNo: data.registralNo },
    });

    if (existingCitizen) {
      return {
        status: false,
        message: `Registration number ${data.registralNo} already exists. Please use a different registration number.`,
      };
    }

    // Generate unique 12-digit numeric barcode (zero-padded)
    const generateBarcode = () => {
      // 6 random bytes -> up to 48 bits of entropy, then mod 1e12 to get 12 digits
      const hex = randomBytes(6).toString("hex");
      const val = BigInt("0x" + hex) % BigInt(1000000000000);
      return val.toString().padStart(12, "0");
    };

    let barcode = generateBarcode();
    // Ensure uniqueness in DB (barcode column is unique)
    while (await prisma.citizen.findFirst({ where: { barcode } })) {
      barcode = generateBarcode();
    }

    // create citizen for their station
    const citizen = await prisma.citizen.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        stationId: stationId?.stationId,
        barcode: barcode,
      },
    });
    return {
      status: true,
      message: "Citizen created successfully",
      data: citizen,
    };
  } catch (error) {
    console.log("citizen error", error);
    return { status: false, message: "Failed to create citizen" };
  }
}

export async function updateCitizen(
  id: string,
  data: z.infer<typeof citizenSchema>
) {
  try {
    const session = await auth();
    const loginUser = session?.user?.id;
    if (!loginUser) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: loginUser },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");

    // Check if registralNo already exists for a different citizen
    const existingCitizen = await prisma.citizen.findUnique({
      where: { registralNo: data.registralNo },
    });

    if (existingCitizen && existingCitizen.id !== id) {
      return {
        status: false,
        message: `Registration number ${data.registralNo} already exists. Please use a different registration number.`,
      };
    }

    const citizen = await prisma.citizen.update({
      where: { id, stationId: stationId?.stationId },
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
      },
    });
    return {
      status: true,
      message: "Citizen updated successfully",
      data: citizen,
    };
  } catch {
    return { status: false, message: "Failed to update citizen" };
  }
}

export async function deleteCitizen(id: string) {
  try {
    const session = await auth();
    const loginUser = session?.user?.id;
    if (!loginUser) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: loginUser, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    await prisma.citizen.delete({
      where: { id, stationId: stationId?.stationId },
    });
    return { status: true, message: "Citizen deleted successfully" };
  } catch {
    return { status: false, message: "Failed to delete citizen" };
  }
}

// take citizen photo or update the photo
export async function takeCitizenPhoto(id: string, photo: string) {
  try {
    const session = await auth();
    const loginUser = session?.user?.id;
    if (!loginUser) throw new Error("unauthenticated");
    const stationId = await prisma.user.findUnique({
      where: { id: loginUser, role: "stationRegistrar" },
      select: { stationId: true },
    });
    if (!stationId?.stationId) throw new Error("station not found");
    const citizen = await prisma.citizen.update({
      where: { id, stationId: stationId?.stationId },
      data: { profilePhoto: photo },
    });
    return {
      status: true,
      message: "Citizen photo updated successfully",
      data: citizen,
    };
  } catch {
    return { status: false, message: "Failed to update citizen photo" };
  }
}

export async function verifyCitizen(id: string) {
  try {
    const session = await auth();
    const loginUser = session?.user?.id;
    if (!loginUser) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: loginUser },
      select: { stationId: true },
    });

    if (!stationId?.stationId) throw new Error("station not found");

    const citizen = await prisma.citizen.update({
      where: { id, stationId: stationId?.stationId },
      data: { isVerified: true },
    });

    return {
      status: true,
      message: "Citizen verified successfully",
      data: citizen,
    };
  } catch (error) {
    console.error("Failed to verify citizen:", error);
    return { status: false, message: "Failed to verify citizen" };
  }
}

export async function unVerifyCitizen(id: string) {
  try {
    const session = await auth();
    const loginUser = session?.user?.id;
    if (!loginUser) throw new Error("unauthenticated");

    const stationId = await prisma.user.findUnique({
      where: { id: loginUser },
      select: { stationId: true },
    });

    if (!stationId?.stationId) throw new Error("station not found");

    const citizen = await prisma.citizen.update({
      where: { id, stationId: stationId?.stationId },
      data: { isVerified: false },
    });

    return {
      status: true,
      message: "Citizen verification removed successfully",
      data: citizen,
    };
  } catch (error) {
    console.error("Failed to unverify citizen:", error);
    return { status: false, message: "Failed to unverify citizen" };
  }
}
